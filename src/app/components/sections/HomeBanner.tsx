import Image from "next/image";
import Link from "next/link";
import { FaGears } from "react-icons/fa6";
import { GiGears } from "react-icons/gi";
import { MdArrowForward } from "react-icons/md";

const HomeBanner = () => {
  return (
    <div className="bg-primary-200 p-3 rounded-lg w-full md:w-80">
      <p className="text-lg md:text-xl font-poppinsB text-secondary-200 font-bold tracking-wide mb-2">
        Explore our amazing tools
      </p>
      <div className="flex justify-between">
        <Link
          href="/tools/examai"
          className="relative flex items-center justify-center"
        >
          <p className="absolute font-bold text-sm font-poppins text-white text-wrap m-1 text-center">
            Exam AI
          </p>
          <Image
            src="/images/ailabreportgenimage.png"
            width={1024}
            height={1024}
            alt="Image Illustration of ai lab report generator"
            className="w-32 h-32 opacity-25 rounded-lg border-secondary-100 border-2"
          />
          <div className="absolute bottom-2 text-sm bg-accent-200 rounded-xl p-1 text-white flex gap-1 items-center hover:bg-accent-300">
            <p>Exam AI</p>
            <MdArrowForward className="w-4 h-4" />
          </div>
        </Link>
        <Link href="/tools/images2pdf" className="flex items-center flex-col">
          <Image
            src="/images/images2pdf.jpg"
            width={1024}
            height={768}
            className="w-[128px] h-[96px] rounded"
            alt="Docx to PDF illustration"
          />
          <div className="text-sm bg-accent-200 rounded-xl px-3 py-1 text-white flex gap-1 items-center hover:bg-accent-300 my-1">
            <FaGears className="w-4 h-4" />
            <p>Convert (Free)</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HomeBanner;
