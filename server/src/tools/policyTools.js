
const policies = {
  return: {
    title: "Return Policy",
    returnWindow: "30 days",
    conditions: [
      "Product must be unused.",
      "Original packaging must be available.",
      "Proof of purchase is required.",
    ],
    refundProcessing: "5-7 business days after approval.",
  },
};

export const getReturnPolicy = async () => {
  const policy = policies.return;

  if (!policy) {
    return {
      success: false,
      error: "Return policy not found",
    };
  }

  return {
    success: true,
    data: policy,
  };
};
