/**
 * Generates the formatted WhatsApp order text and official Click-to-Chat URL
 */

export const sanitizePhoneNumber = (rawPhone) => {
  if (!rawPhone) return '';
  // Remove all non-numeric characters like +, spaces, hyphens
  let cleaned = rawPhone.toString().replace(/[^0-9]/g, '');
  // If 10 digits without country code, prefix 91 (India)
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  return cleaned;
};

export const formatWhatsAppOrderMessage = ({
  orderNumber,
  customerName,
  customerPhone,
  orderType,
  deliveryAddress,
  landmark,
  items,
  subtotal,
  discount,
  deliveryFee,
  totalAmount,
  customerInstructions,
  createdAt,
  currencySymbol = '₹',
}) => {
  const formattedItems = items
    .map((item) => `${item.name} × ${item.quantity} = ${currencySymbol}${item.itemTotal}`)
    .join('\n');

  const orderTimeStr = new Date(createdAt || Date.now()).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const addressSection =
    orderType.toLowerCase() === 'delivery'
      ? `Delivery Address: ${deliveryAddress || 'N/A'}\nLandmark: ${landmark || 'N/A'}\n`
      : 'Pickup Mode: Takeaway at Restaurant Counter\n';

  const instructionsSection = customerInstructions ? `Customer Instructions: ${customerInstructions}\n` : '';

  const message =
`*NEW ORDER — MEETHA PANI RESTAURANT*

Order Number: ${orderNumber}
Customer Name: ${customerName}
Mobile Number: ${customerPhone}
Order Type: ${orderType.toUpperCase()}
${addressSection}
*ORDER ITEMS:*
${formattedItems}

Subtotal: ${currencySymbol}${subtotal}
Discount: ${currencySymbol}${discount}
Delivery Charges: ${currencySymbol}${deliveryFee}
*TOTAL AMOUNT: ${currencySymbol}${totalAmount}*

${instructionsSection}Order Time: ${orderTimeStr}

Please confirm this order.`;

  return message;
};

export const generateWhatsAppClickToChatUrl = (targetPhone, message) => {
  const cleanPhone = sanitizePhoneNumber(targetPhone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
};
