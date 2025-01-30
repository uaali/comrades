import React, { useEffect, useState } from "react";

const RECOMMENDED_TAGS = ["lecture notes", "study guide", "past paper", "others"];
const MAX_TAGS = 6;

const TagsInput = ({
  setResultTags,
}: {
  setResultTags: (tags: string[]) => void;
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [selectedRecommendedTag, setSelectedRecommendedTag] = useState("");

  useEffect(() => {
    setResultTags(tags);
  }, [tags]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && customTagInput.trim()) {
      if (tags.length >= MAX_TAGS) {
        alert(`Maximum ${MAX_TAGS} tags allowed`);
        return;
      }
      const newTag = customTagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setCustomTagInput("");
      }
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const handleRecommendedTagChange = (tag: string) => {
    setSelectedRecommendedTag(tag);
    setTags((prevTags) => {
      const filteredTags = prevTags.filter(
        (t) => !RECOMMENDED_TAGS.includes(t)
      );
      return [...filteredTags, tag];
    });
  };

  return (
    <div className="mt-5">
      <label className="text-sm tracking-wide font-semibold block mb-2">
        Tags (Maximum {MAX_TAGS})
      </label>

      <div className="mb-4">
        <p className="text-sm mb-2">Select content type:</p>
        <div className="flex gap-4">
          {RECOMMENDED_TAGS.map((tag) => (
            <label key={tag} className="flex items-center text-sm ">
              <input
                type="radio"
                name="recommendedTag"
                value={tag}
                checked={selectedRecommendedTag === tag}
                onChange={() => handleRecommendedTagChange(tag)}
                className="mr-2"
              />
              {tag}
            </label>
          ))}
        </div>
      </div>

      <input
        type="text"
        value={customTagInput}
        onChange={(e) => setCustomTagInput(e.target.value)}
        onKeyDown={handleAddTag}
        placeholder="Add custom tags (press Enter)"
        className="rounded-lg border-primary-500 shadow-lg p-2 w-full mb-2"
        disabled={tags.length >= MAX_TAGS}
      />

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center"
          >
            {tag}
            <button
              onClick={() => handleDeleteTag(tag)}
              className="ml-2 text-gray-600 hover:text-red-500"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagsInput;
