import Customer from '../models/Customer.js';
import Order from '../models/Order.js';

export const getCustomersAdmin = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 25 } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Calculate customer order count and total spent
    const customersWithStats = await Promise.all(
      customers.map(async (cust) => {
        const orderCount = await Order.countDocuments({ customer: cust._id });
        const revenueResult = await Order.aggregate([
          { $match: { customer: cust._id, orderStatus: { $ne: 'Cancelled' } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);
        const totalSpent = revenueResult.length > 0 ? revenueResult[0].total : 0;

        return {
          ...cust.toObject(),
          totalOrders: orderCount,
          totalSpent,
        };
      })
    );

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: customersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerDetailsAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id).select('-password');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const orders = await Order.find({ customer: id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        customer,
        orders,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be active or blocked' });
    }

    const customer = await Customer.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, message: `Customer status updated to ${status}`, data: customer });
  } catch (error) {
    next(error);
  }
};
