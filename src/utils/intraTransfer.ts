export async function intraTransfer(
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    narrative: string
  ) {
    // Ensure amount is rounded to 2 decimal places
    const formattedAmount = Number(amount.toFixed(2)).toString();
  
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Bearer ${process.env.INTASEND_API_KEY_SECRET}`,
      },
      body: JSON.stringify({
        wallet_id: toWalletId,
        amount: formattedAmount,
        narrative: narrative,
      }),
    };
  
    const response = await fetch(
      `https://payment.intasend.com/api/v1/wallets/${fromWalletId}/intra_transfer/`,
      options
    );
  
    const responseData = await response.json();
  
    if (!response.ok) {
      throw new Error(
        `IntaSend transfer failed: ${response.statusText} - ${JSON.stringify(
          responseData
        )}`
      );
    }
  
    return responseData;
  }