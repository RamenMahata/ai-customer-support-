const mockOrders = {
  "ORD-1024": {
    orderId: "ORD-1024",
    status: "shipped",
    estimatedDelivery: "2026-11-03",
    trackingNumber: "TRK-98765",
  },

  "ORD-1025": {
    orderId: "ORD-1025",
    status: "processing",
    estimatedDelivery: "2026-11-06",
    trackingNumber: null,
  },
};

export const getOrderStatus = async ({ orderId }) => {
  const order = mockOrders[orderId];

  if (!order) {
    return {
      success: false,
      error: "Order not found",
    };
  }

  return {
    success: true,
    data: order,
  };
};