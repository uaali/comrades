import { Content } from "@/types";
import { truncateText } from "@/utils/truncateText";
import Image from "next/image";
import Link from "next/link";

const ContentCard = ({ content }: { content: Content }) => {
  const { previewUrl, title, description, price } = content;

  function formatDate(date: Date) {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
    };

    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString("en-US", options);
    }

    return date.getFullYear().toString();
  }
  return (
    <Link
      href={`/content/${content.id}`}
      className="rounded flex-col shadow overflow-hidden border-primary-200 border w-40 font-inter justify-between flex"
    >
      <Image
        src={previewUrl}
        width={200}
        height={200}
        alt={title}
        className="w-40 h-40"
      />
      <div className="my-2 px-1 flex flex-col h-auto justify-between flex-1">
        <div className="space-y-1">
          <p className="font-bold text-sm">{truncateText(title, 50)}</p>
          <p className="text-sm">{truncateText(description, 60)}</p>
        </div>
        <div className="flex justify-between items-center my-1">
          <p className="font-bold text-primary-200">Ksh. {price}</p>
          <p className="text-xs text-gray-400 font-light">
            {formatDate(content.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ContentCard;
