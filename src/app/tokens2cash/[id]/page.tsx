import TokensForm from "@/app/components/sections/TokensForm";
import { db } from "@/lib/firebase/admin";

const Tokens2Cash = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const userRef = db.collection("users").doc(id);
  const userDoc = await userRef.get();
  const user = userDoc.data();
  if (!user) return <div>User not found</div>;
  return (
    <div className="p-4 md:px-4 font-inter">
      <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-2">
        <p className="font-bold text-lg md:text-2xl font-poppinsB">
          Convert Your Tokens to Real Money
        </p>
        <p>{user.tokenBalance} Tokens</p>
      </div>
      <div className="my-2">
        <p className="text-sm">
          Tokens are our way of saying thank you. We share our profit with you
          after your referred user sells something in this platform. The more
          you referrer the more you get.
        </p>
        <p className="font-bold font-poppins">Terms & Rate</p>
        <ul className="list-inside list-disc text-gray-500">
          <li>1 Ksh = 10 tokens</li>
          <li>Minimum Token for conversion is 10</li>
        </ul>
      </div>
      <TokensForm tokens={user.tokenBalance} />
    </div>
  );
};

export default Tokens2Cash;
