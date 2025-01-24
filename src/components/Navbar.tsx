"use client";

import UserMenu from "@/app/components/modals/UserMenu";
import { Dropdown } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdConstruction, MdDashboard, MdExplore } from "react-icons/md";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase/config";
import { useEffect, useState } from "react";
import SearchBar from "@/app/components/ui/SearchBar";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  collection,
  deleteDoc,
  doc,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import NotificationsModal from "@/app/components/modals/NotificationsModal";
import { Notification } from "@/types";
import toast from "react-hot-toast";

const searchPhrases = [
  "Type to search...",
  "Search notes ...",
  "Find by title ...",
  "Search content ...",
];

const Navbar = () => {
  const pathName = usePathname();
  const [user, loading] = useAuthState(auth);

  const [notifications] = useCollection(
    user && user.uid
      ? query(collection(db, "notifications"), where("userId", "==", user.uid))
      : null
  );
  const [fetchedNotifications, setFetchedNotifications] = useState<
    Notification[] | null
  >();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  useEffect(() => {
    if (!notifications) return;
    const data = notifications.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    })) as Notification[];
    setFetchedNotifications(data);
  }, [notifications, user]);

  const handleDeleteNotification = async (id: string) => {
    const docRef = doc(db, "notifications", id);
    await deleteDoc(docRef);
  };

  const handleToggleReadNotification = async (id: string, read: boolean) => {
    const docRef = doc(db, "notifications", id);
    await updateDoc(docRef, { read: !read });
  };

  const handleMarkAllReadNotification = () => {
    if (fetchedNotifications) {
      fetchedNotifications.forEach(async (notification) => {
        const docRef = doc(db, "notifications", notification.id);
        await updateDoc(docRef, { read: true });
      });
    }
  };

  const handleDeleteMultipleNotification = (ids: string[]) => {
    toast.loading("Deleting ...")
    try {
      ids.forEach(async (id) => {
        const docRef = doc(db, "notifications", id);
        await deleteDoc(docRef);
      });
      toast.dismiss()
      toast.success("Deleted successfully")
    } catch (error) {
      toast.dismiss()
      toast.error("Failed")
    }
  };

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
    { path: "/tools/images2pdf", label: "Images(s) 2 PDF" },
  ];

  return (
    <div>
      {/* Desktop Navbar */}
      <nav className="bg-secondary-200 md:px-6 p-4 items-center justify-between font-inter flex">
        <Link href="/">
          <Image
            src="/logo.svg"
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
        <SearchBar userId={user?.uid} searchPhrases={searchPhrases} />
        <UserMenu
          user={user}
          loading={loading}
          setIsNotificationModalOpen={setIsNotificationModalOpen}
          unreadNotifications={
            fetchedNotifications?.filter((n) => !n.read).length || 0
          }
        />
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-secondary-200 md:hidden z-50 shadow-lg">
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

      <NotificationsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={fetchedNotifications || []}
        onDelete={handleDeleteNotification}
        onToggleRead={handleToggleReadNotification}
        onMarkAllRead={handleMarkAllReadNotification}
        onDeleteMultiple={handleDeleteMultipleNotification}
      />
    </div>
  );
};

export default Navbar;
