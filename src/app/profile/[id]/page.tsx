import FavouriteUser from "@/app/components/sections/FavouriteUser";
import { db } from "@/lib/firebase/admin";
import { Content } from "@/types";

const UserContent = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const contentRef = db.collection("uploads").where("contentId", "==", id);
  const contentSnap = await contentRef.get();
  const content = contentSnap.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Content)
  );
  return (
    <div className="p-4 md:px-6">
      <FavouriteUser publisherId={id} />
    </div>
  );
};

export default UserContent;
