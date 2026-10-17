export const initOrderSocket = (io) => {
  io.on('connection', (socket) => {
    // Customer joins their order's specific room
    socket.on('join_order_room', (orderNumber) => {
      if (orderNumber) {
        const room = `order:${orderNumber.toUpperCase()}`;
        socket.join(room);
      }
    });

    // Admin joins the admin stream
    socket.on('join_admin_room', () => {
      socket.join('admin-orders');
    });

    // Leave rooms
    socket.on('leave_order_room', (orderNumber) => {
      if (orderNumber) {
        socket.leave(`order:${orderNumber.toUpperCase()}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
};

export const emitOrderStatusUpdate = (io, order) => {
  if (!io) return;
  const room = `order:${order.orderNumber.toUpperCase()}`;
  io.to(room).emit('order_status_updated', {
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    statusTimeline: order.statusTimeline,
    updatedAt: order.updatedAt,
    cancellationReason: order.cancellationReason,
  });

  // Also broadcast to admin room
  io.to('admin-orders').emit('order_status_changed_admin', {
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    updatedAt: order.updatedAt,
  });
};

export const emitNewOrderToAdmin = (io, order) => {
  if (!io) return;
  io.to('admin-orders').emit('new_order_placed', {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    totalAmount: order.totalAmount,
    orderType: order.orderType,
    createdAt: order.createdAt,
    itemsCount: order.items?.length || 0,
  });
};
