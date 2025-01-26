import WithdrawalForm from "@/app/components/sections/WithdrawalForm";

const fetchWallet = async (id: string) => {
  const data = await fetch(`${process.env.BASE_URL}/api/intasend/get-wallet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  const wallet = await data.json();
  return wallet;
};

const Withdraw = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const wallet = await fetchWallet(id);

  let withdrawableAmount = wallet.available_balance - 15;
  if (withdrawableAmount < 1) withdrawableAmount = 0;
  return (
    <div className="p-4 md:px-6 font-inter">
      <p className="font-xl font-poppins font-bold md:text-2xl">Withdraw</p>
      <div className="my-4 text-gray-500">
        <p>Charges - 1.5%</p>
        <ul className="list-disc list-inside">
          <li>but cannot be less than Ksh.15</li>
          <li>or exceed Ksh. 100</li>
        </ul>
      </div>
      <div className="my-4">
        <p className="font-bold">Current Balance:</p>
        <p>Ksh. {wallet.available_balance}</p>
        <p>You can withdraw Ksh. {withdrawableAmount.toFixed(0)}</p>
      </div>
      <WithdrawalForm walletBalance={wallet.available_balance} />
    </div>
  );
};

export default Withdraw;
