import crypto from "crypto";
import Order from "../models/Order.js";
import Food from "../models/Food.js";
import RestaurantSettings from "../models/RestaurantSettings.js";
import Offer from "../models/Offer.js";
import {
  formatWhatsAppOrderMessage,
  generateWhatsAppClickToChatUrl,
} from "../services/whatsappService.js";
import {
  emitOrderStatusUpdate,
  emitNewOrderToAdmin,
} from "../sockets/orderSocket.js";

// Helper to generate readable unique order ID
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MP-${dateStr}-${randomSuffix}`;
};

export const createOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      customerWhatsapp,
      orderType = "delivery",
      deliveryAddress,
      landmark,
      customerInstructions,
      couponCode,
      items,
    } = req.body;

    // 1. Validation
    if (!customerName || !customerPhone || !customerWhatsapp) {
      return res.status(400).json({
        success: false,
        message:
          "Customer name, phone number, and WhatsApp number are required.",
      });
    }

    if (
      orderType === "delivery" &&
      (!deliveryAddress || deliveryAddress.trim() === "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete delivery address is required for delivery orders.",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Your cart is empty. Please select food items before placing an order.",
      });
    }

    // 2. Fetch Restaurant Settings for delivery charges & WhatsApp contact
    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create({});
    }

    if (orderType === "delivery" && !settings.deliveryEnabled) {
      return res.status(400).json({
        success: false,
        message: "Delivery service is currently not accepting new orders.",
      });
    }

    if (orderType === "takeaway" && !settings.takeawayEnabled) {
      return res.status(400).json({
        success: false,
        message: "Takeaway orders are currently paused.",
      });
    }

    // 3. Authoritative verification of food items, availability, and prices
    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const foodId = item.foodId || item._id;
      const foodDoc = await Food.findById(foodId);

      if (!foodDoc) {
        return res.status(400).json({
          success: false,
          message: `Food item with ID ${foodId} is no longer found in our menu.`,
        });
      }

      if (foodDoc.availability !== "available") {
        return res.status(400).json({
          success: false,
          message: `"${foodDoc.name}" is currently ${foodDoc.availability.replace(/_/g, " ")}. Please remove it to proceed.`,
        });
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const effectivePrice =
        foodDoc.discountPrice !== null && foodDoc.discountPrice < foodDoc.price
          ? foodDoc.discountPrice
          : foodDoc.price;

      const itemTotal = effectivePrice * qty;
      subtotal += itemTotal;

      validatedItems.push({
        food: foodDoc._id,
        name: foodDoc.name,
        price: effectivePrice,
        quantity: qty,
        itemTotal,
        image: foodDoc.image,
        isVeg: foodDoc.isVeg,
      });
    }

    // Check minimum order amount
    if (subtotal < (settings.minOrderAmount || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ${settings.currencySymbol || "₹"}${settings.minOrderAmount}. Current subtotal is ${settings.currencySymbol || "₹"}${subtotal}.`,
      });
    }

    // 4. Calculate discount if couponCode is provided
    let discount = 0;
    let appliedCoupon = "";

    if (couponCode && couponCode.trim()) {
      const offer = await Offer.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
      });

      if (offer) {
        const isExpired =
          offer.validTill && new Date(offer.validTill) < new Date();
        if (!isExpired && subtotal >= (offer.minOrderAmount || 0)) {
          if (offer.discountType === "percentage") {
            discount = Math.round((subtotal * offer.discountValue) / 100);
            if (
              offer.maxDiscountAmount > 0 &&
              discount > offer.maxDiscountAmount
            ) {
              discount = offer.maxDiscountAmount;
            }
          } else {
            discount = offer.discountValue;
          }
          appliedCoupon = offer.code;
        }
      }
    }

    // 5. Calculate delivery fee
    const deliveryFee =
      orderType === "delivery" ? settings.deliveryFee || 0 : 0;
    const totalAmount = Math.max(0, subtotal - discount + deliveryFee);

    // 6. Generate IDs and tracking token
    const orderNumber = generateOrderNumber();
    const guestTrackingToken = crypto.randomBytes(16).toString("hex");

    // 7. Initial Status Timeline
    const initialTimeline = [
      {
        status: "Pending",
        timestamp: new Date(),
        note: "Order placed. Awaiting restaurant confirmation via WhatsApp.",
      },
    ];

    // 8. Generate WhatsApp Message
    const restaurantWhatsappNumber =
      settings.whatsappPhone ||
      process.env.DEFAULT_WHATSAPP_PHONE ||
      "918853260723";
    const whatsappMessageText = formatWhatsAppOrderMessage({
      orderNumber,
      customerName,
      customerPhone,
      orderType,
      deliveryAddress,
      landmark,
      items: validatedItems,
      subtotal,
      discount,
      deliveryFee,
      totalAmount,
      customerInstructions,
      createdAt: new Date(),
      currencySymbol: settings.currencySymbol || "₹",
    });

    const whatsappUrl = generateWhatsAppClickToChatUrl(
      restaurantWhatsappNumber,
      whatsappMessageText,
    );

    // 9. Save Order
    const order = await Order.create({
      orderNumber,
      customer: req.customer ? req.customer._id : null,
      customerName,
      customerPhone,
      customerWhatsapp,
      orderType,
      deliveryAddress: orderType === "delivery" ? deliveryAddress : "",
      landmark: orderType === "delivery" ? landmark || "" : "",
      items: validatedItems,
      subtotal,
      discount,
      couponCode: appliedCoupon,
      deliveryFee,
      totalAmount,
      customerInstructions: customerInstructions || "",
      orderStatus: "Pending",
      statusTimeline: initialTimeline,
      whatsappMessageText,
      guestTrackingToken,
    });

    // Increment food orderCount asynchronously
    for (const item of validatedItems) {
      Food.findByIdAndUpdate(item.food, {
        $inc: { orderCount: item.quantity },
      }).catch(() => {});
    }

    // 10. Real-time emit to Admin Panel via Socket.IO
    const io = req.app.get("io");
    if (io) {
      emitNewOrderToAdmin(io, order);
    }

    res.status(201).json({
      success: true,
      message:
        "Order created successfully! Please click the WhatsApp button to confirm your order.",
      order: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        subtotal: order.subtotal,
        discount: order.discount,
        deliveryFee: order.deliveryFee,
        orderType: order.orderType,
        orderStatus: order.orderStatus,
        guestTrackingToken: order.guestTrackingToken,
        createdAt: order.createdAt,
        items: order.items,
      },
      whatsappUrl,
      whatsappMessage: whatsappMessageText,
      restaurantWhatsappNumber,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderTracking = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { token } = req.query; // guest tracking token

    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase(),
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Determine authorization level
    let isFullAccess = false;

    // Check if authenticated admin
    if (req.admin) {
      isFullAccess = true;
    }
    // Check if customer matches logged-in user
    else if (
      req.customer &&
      order.customer &&
      order.customer.toString() === req.customer._id.toString()
    ) {
      isFullAccess = true;
    }
    // Check if guest token matches
    else if (token && order.guestTrackingToken === token) {
      isFullAccess = true;
    }

    if (isFullAccess) {
      return res.json({
        success: true,
        fullAccess: true,
        order,
      });
    }

    // Redacted public view (prevents leaking customer phone / complete address to strangers)
    return res.json({
      success: true,
      fullAccess: false,
      order: {
        orderNumber: order.orderNumber,
        orderType: order.orderType,
        orderStatus: order.orderStatus,
        statusTimeline: order.statusTimeline,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        cancellationReason: order.cancellationReason,
        itemsCount: order.items.length,
        totalAmount: order.totalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.customer._id }).sort({
      createdAt: -1,
    });
    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const markWhatsappInitiated = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOneAndUpdate(
      { orderNumber: orderNumber.toUpperCase() },
      { isWhatsappInitiated: true },
      { new: true },
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "WhatsApp contact initiated" });
  } catch (error) {
    next(error);
  }
};

// ============ ADMIN ORDER CONTROLLERS ============

export const getAdminOrders = async (req, res, next) => {
  try {
    const {
      status,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 25,
    } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.orderStatus = status;
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { orderNumber: regex },
        { customerName: regex },
        { customerPhone: regex },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { orderStatus, note, cancellationReason } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Preparing",
      "Ready for Pickup",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order status specified" });
    }

    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase(),
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.orderStatus = orderStatus;

    if (orderStatus === "Cancelled" && cancellationReason) {
      order.cancellationReason = cancellationReason;
    }

    const defaultNotes = {
      Pending: "Order is under review.",
      Confirmed:
        "Order confirmed by restaurant. Kitchen has received your items.",
      Preparing: "Master chef is freshly preparing your delicious food.",
      "Ready for Pickup":
        "Your order is packed and ready for collection at the counter.",
      "Out for Delivery": "Order has been dispatched with our delivery valet.",
      Delivered: "Order successfully delivered. Enjoy your meal!",
      Cancelled: `Order cancelled. ${cancellationReason || ""}`,
    };

    order.statusTimeline.push({
      status: orderStatus,
      timestamp: new Date(),
      note: note || defaultNotes[orderStatus] || "",
    });

    await order.save();

    // Broadcast live update via Socket.IO
    const io = req.app.get("io");
    if (io) {
      emitOrderStatusUpdate(io, order);
    }

    res.json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminOrderStats = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      preparingOrders,
      deliveredOrders,
      cancelledOrders,
      todayOrders,
      revenueResult,
      todayRevenueResult,
      popularDishes,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: "Pending" }),
      Order.countDocuments({ orderStatus: "Confirmed" }),
      Order.countDocuments({ orderStatus: "Preparing" }),
      Order.countDocuments({ orderStatus: "Delivered" }),
      Order.countDocuments({ orderStatus: "Cancelled" }),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      // All time revenue excluding Cancelled
      Order.aggregate([
        { $match: { orderStatus: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      // Today revenue excluding Cancelled
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfToday },
            orderStatus: { $ne: "Cancelled" },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      // Popular items
      Food.find()
        .sort({ orderCount: -1 })
        .limit(5)
        .select("name price orderCount image isVeg"),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    const todayRevenue =
      todayRevenueResult.length > 0 ? todayRevenueResult[0].total : 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        preparingOrders,
        deliveredOrders,
        cancelledOrders,
        todayOrders,
        totalRevenue,
        todayRevenue,
        popularDishes,
      },
    });
  } catch (error) {
    next(error);
  }
};
