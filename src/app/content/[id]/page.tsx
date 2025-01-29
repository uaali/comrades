import IntasendBadge from "@/app/components/ui/IntasendBadge";
import PurchaseContentBtn from "@/app/components/ui/PurchaseContentBtn";
import { getDocument } from "@/lib/firebase/admin";
import { Content } from "@/types";
import Image from "next/image";
import Link from "next/link";

const fetchContent = async (id: string) => {
  try {
    const data = await getDocument("uploads", id);
    if (!data) {
      return null;
    }
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
    } as Content;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = await fetchContent(id);

  if (!content) {
    return {
      title: "Content not found",
      description: "The requested content could not be found.",
    };
  }

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.title,
      description: content.description,
      url: `https://comrades.tirigist.com/content/${content.contentId}`,
      siteName: "Tirigist Comrades",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
    },
  };
}

const ContentPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const content = await fetchContent(id);
  if (!content) {
    return <div>Content not found</div>;
  }
  const {
    title,
    description,
    price,
    course,
    contentId,
    tags,
    publisher,
    previewUrl,
    createdAt,
  } = content;
  return (
    <div className="p-4 md:px-6 font-inter flex flex-col md:flex-row">
      <div className="space-y-4 w-full md:w-1/2 lg:w-1/3 flex flex-col items-center">
        <Image
          src={previewUrl}
          className="w-full h-auto border-primary-200 border rounded"
          width={400}
          height={400}
          alt={title}
        />
        <div className="flex w-full justify-between items-center">
          <p className="font-bold text-primary-200 text-3xl self-end">
            KSh. {price}
          </p>
          <PurchaseContentBtn contentId={contentId} />
        </div>
        <IntasendBadge />
      </div>
      <div className="w-full md:w-1/2 lg:w-2/3 my-4 md:my-0 md:pl-4">
        <div className="space-y-3">
          <p className="text-2xl font-poppinsB font-bold">{title}</p>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 font-bold tracking-wide">
              {createdAt.toLocaleDateString()}
            </p>
            <Link href={`/profile/${publisher}`}>
              <p className="text-primary-200 text-sm hover:underline">
                See my other content
              </p>
            </Link>
          </div>
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag) => (
              <span key={tag} className="text-gray-800">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-5">
          <p className="font-bold tracking-wide font-poppins">Description</p>
          <p>{description}</p>
        </div>
        {course !== "" && (
          <div className="mt-5">
            <p className="font-bold tracking-wide font-poppins">Course</p>
            <p>{course}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentPage;
