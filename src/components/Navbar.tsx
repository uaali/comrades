"use client";

import UserMenu from "@/app/components/modals/UserMenu";
import { Dropdown } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdConstruction, MdDashboard, MdExplore } from "react-icons/md";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/config";

const Navbar = () => {
  const pathName = usePathname();
  const [user, loading] = useAuthState(auth);

  const navLinks = [
    { path: "/", label: "Explore", icon: <MdExplore className="w-5 h-5" /> },
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
    },
  ];

  const tools = [
    { path: "/tools/report-gen", label: "Lab Report Gen" },
    { path: "/tools/docx2pdf", label: "Docx 2 PDF" },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-secondary-200 md:px-6 p-4 items-center justify-between font-inter flex">
        <Link href="/">
          <Image
            src="/logo-blue-svg.svg"
            alt="Logo"
            width={40}
            height={40}
            className="w-8 h-8 md:w-10 md:h-10"
          />
        </Link>
        <div className="gap-4 md:gap-11 text-text-50 hidden md:flex">
          {navLinks.map((link) => (
            <Link
              href={link.path}
              key={link.path}
              className="text-sm md:text-base"
            >
              <div className="flex items-center space-x-2">
                {link.icon}
                <p>{link.label}</p>
              </div>
              <div
                className={`${
                  pathName === link.path
                    ? "border-primary-200 border w-3/4 transition-all duration-500"
                    : "w-0"
                }`}
              ></div>
            </Link>
          ))}

          <Dropdown
            label=""
            dismissOnClick={true}
            renderTrigger={() => (
              <div className="hover:cursor-pointer text-sm md:text-base flex space-x-2 items-center">
                <MdConstruction className="w-5 h-5" />
                <p>Tools</p>
              </div>
            )}
          >
            {tools.map((tool) => (
              <Dropdown.Item as="a" href={tool.path} key={tool.path}>
                {tool.label}
              </Dropdown.Item>
            ))}
          </Dropdown>
        </div>
        <UserMenu user={user} loading={loading} />
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-secondary-200 md:hidden">
        <div className="flex justify-around items-center h-16 px-4">
          {navLinks.map((link) => (
            <Link
              href={link.path}
              key={link.path}
              className={`flex flex-col items-center space-y-1 ${
                pathName === link.path ? "text-primary-200" : "text-text-50"
              }`}
            >
              {link.icon}
              <span className="text-xs">{link.label}</span>
            </Link>
          ))}

          <Dropdown
            label=""
            dismissOnClick={true}
            renderTrigger={() => (
              <div className="flex flex-col items-center space-y-1">
                <MdConstruction className="w-5 h-5" />
                <span className="text-xs">Tools</span>
              </div>
            )}
          >
            {tools.map((tool) => (
              <Dropdown.Item as="a" href={tool.path} key={tool.path}>
                {tool.label}
              </Dropdown.Item>
            ))}
          </Dropdown>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
