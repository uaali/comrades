import { useState, useEffect } from "react";
import { MdSearch } from "react-icons/md";
import { searchClient } from "@/lib/algolia/client";
import { SearchHit } from "@/types";
import { useRouter } from "next/navigation";
import TypingInput from "./TypingInput";
import aa from "search-insights";

const SearchBar = ({
  userId,
  searchPhrases,
}: {
  userId: string | undefined;
  searchPhrases: string[];
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryId, setQueryId] = useState<string | null>();

  const router = useRouter();

  const handleSearch = ({
    objectId,
    postion,
  }: {
    objectId: string;
    postion: number;
  }) => {
    setQuery("");
    if (queryId) {
      aa("clickedObjectIDsAfterSearch", {
        authenticatedUserToken: userId,
        eventName: "Content Clicked",
        index: "uploads",
        objectIDs: [objectId],
        queryID: queryId,
        positions: [postion],
      });
    }

    router.push(`/content/${objectId}`);
  };

  useEffect(() => {
    aa("init", {
      appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      apiKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!,
      useCookie: true,
    });
  }, []);

  useEffect(() => {
    if (query.trim().length > 5) {
      const fetchSuggestions = async () => {
        setLoading(true);
        setError(null);
        try {
          const results = await searchClient.searchSingleIndex({
            indexName: "uploads",
            searchParams: { query, clickAnalytics: true },
          });
          setQueryId(results.queryID);
          setSuggestions(results.hits as SearchHit[]);
        } catch (error) {
          setError("Error fetching suggestions. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      const debounceFetch = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(debounceFetch);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim().length > 0) {
      setQuery("");
      router.push(`/search/${query}`);
    }
  };

  return (
    <div className="relative">
      <TypingInput
        handleKeyDown={handleKeyDown}
        placeholders={searchPhrases}
        onChange={(e) => setQuery(e)}
        style={`${
          userId ? "w-52" : "w-40"
        } md:w-72 focus:ring-0 h-8 rounded-xl border-none p-2 outline-none bg-background-200`}
      />
      {userId && (
        <MdSearch
          onClick={() => {
            if (query.trim().length > 0) {
              setQuery("");
              router.push(`/search/${query}`);
            }
          }}
          className="text-accent-200 w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 hover:cursor-pointer"
        />
      )}
      {loading && (
        <div className="absolute left-0 w-full bg-white z-10 mt-2 p-2">
          Loading...
        </div>
      )}
      {error && (
        <div className="absolute left-0 w-full bg-red-100 z-10 mt-2 p-2">
          {error}
        </div>
      )}
      {!loading && suggestions.length > 0 && (
        <div className="absolute left-0 w-full bg-white border border-gray-300 shadow-md z-10 mt-2">
          <ul>
            {suggestions.map((suggestion, index) => (
              <div key={suggestion.objectID}>
                <li
                  onClick={() =>
                    handleSearch({
                      objectId: suggestion.objectID,
                      postion: index + 1,
                    })
                  }
                  className="p-2 cursor-pointer hover:bg-gray-100 my-1 text-sm"
                >
                  <h3>{suggestion.title}</h3>
                </li>
                <hr />
              </div>
            ))}
          </ul>
        </div>
      )}
      {!loading &&
        suggestions.length === 0 &&
        query.length > 10 &&
        query.trim() && (
          <div className="absolute left-0 w-full bg-white z-10 mt-2 p-2">
            No results found.
          </div>
        )}
    </div>
  );
};

export default SearchBar;
