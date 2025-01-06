"use client";

import { useState, useEffect } from "react";
import ContentCard from "./ContentCard";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { Content } from "@/types";
import { db } from "@/lib/firebase/config";

interface ContentContainerProps {
  content: Content[];
  selectedCourse: string;
  currentCategory: string;
 enableLoadMore?: boolean;
}

const ContentContainer = ({
  content: initialContent,
  selectedCourse,
  currentCategory,
  enableLoadMore = true,
}: ContentContainerProps) => {
  const [content, setContent] = useState(initialContent);
  const [filteredContent, setFilteredContent] = useState(initialContent);
  const [lastVisible, setLastVisible] = useState(
    initialContent.length > 0 ? initialContent[initialContent.length - 1] : null
  );
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Filter content based on selected filters
    const newFilteredContent = content.filter((item) => {
      const courseMatch = !selectedCourse || item.course === selectedCourse;
      const categoryMatch =
        currentCategory === "all" || item.tags.includes(currentCategory);
      return courseMatch && categoryMatch;
    });

    setFilteredContent(newFilteredContent);
  }, [content, selectedCourse, currentCategory]);

  const loadMore = async () => {
    if (!lastVisible || loading || !hasMore) return;

    try {
      setLoading(true);
      let baseQuery = query(
        collection(db, "uploads"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible.createdAt),
        limit(20)
      );

      // Add filters based on selection
      const filters = [];

      if (selectedCourse) {
        filters.push(where("course", "==", selectedCourse));
      }

      if (currentCategory !== "all") {
        filters.push(where("tags", "array-contains", currentCategory));
      }

      // Combine base query with filters
      const q =
        filters.length > 0
          ? query(
              collection(db, "uploads"),
              ...filters,
              orderBy("createdAt", "desc"),
              startAfter(lastVisible.createdAt),
              limit(20)
            )
          : baseQuery;

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

      setContent((prevContent) => [...prevContent, ...newContent]);
      setLastVisible(newContent[newContent.length - 1]);
    } catch (error) {
      console.error("Error loading more content:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset content when filters change
  useEffect(() => {
    setContent(initialContent);
    setLastVisible(
      initialContent.length > 0
        ? initialContent[initialContent.length - 1]
        : null
    );
    setHasMore(true);
  }, [selectedCourse, currentCategory, initialContent]);

  return (
    <div>
      {filteredContent.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No content found for the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredContent.map((item) => (
            <ContentCard key={item.id} content={item} />
          ))}
        </div>
      )}
      {hasMore && enableLoadMore && filteredContent.length > 0 && (
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

export default ContentContainer;
