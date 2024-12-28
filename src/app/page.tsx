import { db } from "@/lib/firebase/admin";
import HomeBanner from "./components/sections/HomeBanner";
import HomePage from "./components/sections/HomePage";
import { Content } from "@/types";

const fetchContent = async () => {
  //fetch 20 documents from firestore using admin sdk

  try {
    const collectionRef = db.collection("uploads");
    const snapshot = await collectionRef.limit(3).orderBy("createdAt", "desc").get();
    const documents = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
      };
    });
    return documents as Content[];
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

export default async function Home() {
  const content = await fetchContent();
  return (
    <div className="p-4 md:px-6">
      <div className="flex md:hidden">
        <HomeBanner />
      </div>
      <HomePage content={content} />
    </div>
  );
}
