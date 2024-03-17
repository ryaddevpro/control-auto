"use client";
import { useEffect, useState } from "react"; // Import useEffect and useState
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { FaRegUser } from "react-icons/fa";

const Navbar = () => {
  const [isMounted, setIsMounted] = useState(false); // State variable to track mounting
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true); // Update state variable after component has mounted
  }, []); // Empty dependency array ensures this effect only runs once after mount

  const navItems = [
    { label: "Gestion Client", href: "#" },
    { label: "Gestion Financiere", href: "#" },
  ];
  return (
    <React.Fragment>
      <div className="h-16 bg-primary text-white pr-12">
        <div className="flex justify-between">
          <div className="">
            <ul className="flex gap-3 justify-between items-center">
              <li className="h-full">
                <Image
                  src={`https://i.imgur.com/2e542tV.png`}
                  width={50}
                  height={50}
                  className="object-cover h-16 w-full"
                  alt=""
                />
              </li>
              <li className="text-2xl">|</li>
              <li className="text-xl">Controle auto</li>
            </ul>
          </div>
          <div className="flex items-center">
            <ul className="flex gap-12 h-full text-xl justify-between items-center">
              {navItems.map((x, index) => {
                return (
                  <Link
                    key={index}
                    href={``}
                    className={`hover:text-secondary h-full flex items-center  ${
                      pathname == x.href ? "border-b-4 border-secondary" : ""
                    } `}
                  >
                    {x.label}
                  </Link>
                );
              })}

              <li>
                {" "}
                <div>
                  {isMounted && ( // Render components only after mounting
                    <React.Fragment>
                      <SignedIn>
                        <UserButton
                          userProfileUrl="/user-profile"
                          userProfileMode="navigation"
                        />
                      </SignedIn>
                      <SignedOut>
                        <div>
                          <SignInButton redirectUrl="/">
                            <FaRegUser className="h-5 w-5 hover:scale-105" />
                          </SignInButton>
                        </div>
                      </SignedOut>
                    </React.Fragment>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Navbar;
