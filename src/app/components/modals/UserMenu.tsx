"use client";

import React, { useState, useRef, useEffect } from "react";
import { IoLogOutOutline, IoLogInOutline } from "react-icons/io5";
import Link from "next/link";
import Image from "next/image";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { MdReceiptLong, MdSettings } from "react-icons/md";

interface User {
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}

interface UserMenuProps {
  user: User | null | undefined;
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const router = useRouter();
  return (
    <div className="relative" ref={menuRef as any}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {user?.photoURL ? (
          <div className="relative">
            <Image
              width={32}
              height={32}
              src={user.photoURL}
              alt="Profile"
              className="h-8 w-8 rounded-full border-primary-200 border"
            />
          </div>
        ) : (
          <button className="text-primary-200 font-semibold text-sm tracking-wide">
            Sign In
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {user ? (
              <>
                {/* User Info */}
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user.displayName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200 my-1" />

                {/* Menu Items */}
                <Link
                  href="/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <MdSettings className="mr-2 h-4 w-4" />
                  <p>Profile Settings</p>
                </Link>
                <Link
                  href="/transactions"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <MdReceiptLong className="mr-2 h-4 w-4" />
                  <p>Transactions</p>
                </Link>
                {/* Divider */}
                <div className="h-px bg-gray-200 my-1" />

                {/* Sign Out Button */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut(auth);
                    router.push("/");
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <IoLogOutOutline className="mr-2 h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              // Sign In Button
              <button
                onClick={() => {
                  setIsOpen(false);
                  signInWithPopup(auth, provider);
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <IoLogInOutline className="mr-2 h-4 w-4" />
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
