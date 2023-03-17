interface ActionProps {
  status: string;
  message: string;
  methodName: string;
}

const messages = {
  deposit: {
    title: {
      success: "Funds deposited successfully!",
      error: "Funds deposited failed",
    },
    message: {
      success: "Wait at least 30 minutes to withdraw",
      error: "The funds had been sent back to your wallet.",
    },
  },

  allowlist: {
    title: {
      success: "Applied address",
      error: "Applied address failed",
    },
    message: {
      success: "The address was applied to the allowlist",
      error: "An error occurred when applying the address in the allowlist",
    },
  },
  withdraw: {
    title: {
      success: "Withdraw send",
      error: "Withdraw failed",
    },
    message: {
      success: "The funds has been withdraw to the address.",
      error:
        "An error occured. It may be intermittent due to RPC cache, please try again in 10 minutes.",
    },
  },
};

export const returnMessages = (action: ActionProps) => {
  const message = messages[action.methodName].message[action.status];
  const title = messages[action.methodName].title[action.status];

  return { title, message };
};
