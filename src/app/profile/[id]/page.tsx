import ContentContainer from "@/app/components/sections/ContentContainer";
import FavouriteUser from "@/app/components/sections/FavouriteUser";
import { db } from "@/lib/firebase/admin";
import { Content } from "@/types";

const UserContent = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const contentRef = db.collection("uploads").where("publisher", "==", id);
  const contentSnap = await contentRef.get();
  const content = contentSnap.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      } as Content)
  );
  return (
    <div className="p-4 md:px-6">
      <FavouriteUser publisherId={id} />
      <p className="my-4 font-poppinsB font-bold">Content</p>
      <ContentContainer
        content={content}
        selectedCourse=""
        currentCategory="all"
        enableLoadMore={false}
      />
    </div>
  );
};

export default UserContent;
