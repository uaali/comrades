import { useState } from "react";
import ContentCard from "./ContentCard";
import { collection, getDocs, limit, orderBy, query, startAfter } from "firebase/firestore";
import { Content } from "@/types";
import { db } from "@/lib/firebase/config";

const ContentContainer = ({ content: initialContent }: { content: Content[] }) => {
    const [content, setContent] = useState(initialContent);
    const [lastVisible, setLastVisible] = useState(
      initialContent.length > 0 ? initialContent[initialContent.length - 1] : null
    );
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
  
    const loadMore = async () => {
      if (!lastVisible || loading || !hasMore) return;
      
      try {
        setLoading(true);
        const q = query(
          collection(db, "uploads"),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible.createdAt),
          limit(20)
        );
        
        const querySnapshot = await getDocs(q);
        const newContent = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
          };
        }) as Content[];
  
        if (newContent.length === 0) {
          setHasMore(false);
          return;
        }
  
        setContent([...content, ...newContent]);
        setLastVisible(newContent[newContent.length - 1]);
      } catch (error) {
        console.error("Error loading more content:", error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {content.map((content) => (
            <ContentCard key={crypto.randomUUID()} content={content} />
          ))}
        </div>
        {hasMore && (
          <button
            className="text-primary-200 md:my-5 mt-4 text-center w-full disabled:opacity-50 font-semibold" 
            onClick={loadMore}
            disabled={loading || !hasMore}
          >
            {loading ? "Loading..." : "Load More>>"}
          </button>
        )}
      </div>
    );
  };

  export default ContentContainer