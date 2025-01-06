import ContentContainer from "@/app/components/sections/ContentContainer";
import { searchClient } from "@/lib/algolia/client";
import { db, getDocument } from "@/lib/firebase/admin";
import { Content } from "@/types";

const SearchPage = async ({
  params,
}: {
  params: Promise<{ query: string }>;
}) => {
  const { query } = await params;
  const results = await searchClient.searchSingleIndex({
    indexName: "uploads",
    searchParams: { query },
  });
  const contentPromises = results.hits.map(async (hit) => {
    const doc = await db.collection("uploads").doc(hit.objectID).get();
    return {
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data()!.createdAt.toDate(),
    };
  });
  const uploads = await Promise.all(contentPromises);
  const content = uploads.filter(
    (upload): upload is Content => upload !== null
  );
  console.log(content);
  return (
    <div className="p-4 md:px-6">
      <p className="font-bold tracking-wide font-inter">Search Results for: <span className="font-poppins">{query}</span></p>
      <div className="my-4">
        <ContentContainer
          selectedCourse=""
          currentCategory="all"
          content={content}
          enableLoadMore={false}
        />
      </div>
    </div>
  );
};

export default SearchPage;
