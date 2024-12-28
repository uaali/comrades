import { Content } from "@/types";
import { truncateText } from "@/utils/truncateText";
import Image from "next/image";

const ContentCard = ({ content }: { content: Content }) => {
  const { previewUrl, title, description, price } = content;
  return (
    <div className="rounded flex-col overflow-hidden border-primary-200 border w-40 font-inter justify-between flex">
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
        <p className="font-bold text-primary-200">Ksh. {price}</p>
      </div>
    </div>
  );
};

export default ContentCard;
