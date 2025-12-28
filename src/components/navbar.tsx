"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip-custom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Home,
  Layers,
  Sparkles,
  LayoutGrid,
  Projector,
  Mail,
  Menu,
} from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const [isTransparent, setIsTransparent] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Make navbar solid after scrolling past hero
      if (currentScrollY > 100) {
        setIsTransparent(false);
      } else {
        setIsTransparent(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigationItems = [
    {
      name: "Home",
      href: "#home",
      icon: Home,
      defaultColor: "text-orange-500",
      hoverGradient: "group-hover:bg-linear-to-r group-hover:from-orange-500 group-hover:to-pink-500",
      hoverShadow: "hover:shadow-lg hover:shadow-orange-500/50",
      tooltipGradientFrom: "from-orange-500",
      tooltipGradientTo: "to-pink-500"
    },
    {
      name: "How It Works",
      href: "#how-it-works",
      icon: Layers,
      defaultColor: "text-blue-500",
      hoverGradient: "group-hover:bg-linear-to-r group-hover:from-blue-500 group-hover:to-purple-500",
      hoverShadow: "hover:shadow-lg hover:shadow-blue-500/50",
      tooltipGradientFrom: "from-blue-500",
      tooltipGradientTo: "to-purple-500"
    },
    {
      name: "Features",
      href: "#features",
      icon: LayoutGrid,
      defaultColor: "text-pink-500",
      hoverGradient: "group-hover:bg-linear-to-r group-hover:from-pink-500 group-hover:to-rose-500",
      hoverShadow: "hover:shadow-lg hover:shadow-pink-500/50",
      tooltipGradientFrom: "from-pink-500",
      tooltipGradientTo: "to-rose-500"
    },
    {
      name: "About",
      href: "#about",
      icon: Projector,
      defaultColor: "text-green-500",
      hoverGradient: "group-hover:bg-linear-to-r group-hover:from-green-500 group-hover:to-emerald-500",
      hoverShadow: "hover:shadow-lg hover:shadow-green-500/50",
      tooltipGradientFrom: "from-green-500",
      tooltipGradientTo: "to-emerald-500"
    },
    {
      name: "Contact",
      href: "#contact",
      icon: Mail,
      defaultColor: "text-indigo-500",
      hoverGradient: "group-hover:bg-linear-to-r group-hover:from-indigo-500 group-hover:to-blue-500",
      hoverShadow: "hover:shadow-lg hover:shadow-indigo-500/50",
      tooltipGradientFrom: "from-indigo-500",
      tooltipGradientTo: "to-blue-500"
    },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isTransparent
          ? "bg-transparent"
          : "bg-linear-to-br from-orange-50/95 via-yellow-50/95 to-pink-50/95 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="QuickSpot Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <span className="text-xl font-bold bg-linear-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            QuickSpot
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="flex items-center gap-4">
                <Tooltip
                  text={item.name}
                  gradientFrom={item.tooltipGradientFrom}
                  gradientTo={item.tooltipGradientTo}
                >
                  <a
                    href={item.href}
                    className={`group relative flex items-center justify-center w-12 h-12 rounded-xl
                      transition-all duration-300 ease-out
                      hover:scale-110
                      ${item.hoverGradient}
                      ${item.hoverShadow}`}
                    aria-label={item.name}
                  >
                    <Icon className={`w-6 h-6 ${item.defaultColor} group-hover:text-white transition-all duration-300 group-hover:scale-110`} />
                  </a>
                </Tooltip>

                {/* Decorative Icon after "How It Works" */}
                {item.name === "How It Works" && (
                  <Tooltip
                    text="Click Here"
                    gradientFrom="from-orange-500"
                    gradientTo="to-pink-500"
                  >
                    <div className="cursor-pointer group">
                      <Sparkles className="w-6 h-6 text-orange-400/60 animate-pulse
                                           group-hover:animate-spin transition-transform
                                           group-hover:scale-110" />
                    </div>
                  </Tooltip>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Button - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <SignedOut>
            <Link href="/sign-in">
              <Button className="bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>
        </div>

        {/* Mobile Menu */}
        <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-white/20"
              >
                <Menu className="h-5 w-5 text-gray-800" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-linear-to-br from-orange-50 via-yellow-50 to-pink-50 border-white/20"
            >
              <nav className="flex flex-col gap-4 mt-8">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center gap-3 px-4 py-3 text-base font-medium
                        text-gray-800 rounded-lg transition-all duration-300
                        hover:bg-white/30
                        ${item.hoverGradient}`}
                    >
                      <Icon className={`w-5 h-5 ${item.defaultColor} transition-transform duration-300 group-hover:scale-110 group-hover:text-white`} />
                      <span className="group-hover:text-white transition-colors">{item.name}</span>
                    </a>
                  );
                })}

                {/* Decorative Icon in Mobile Menu */}
                <div className="flex justify-center py-2">
                  <Sparkles className="w-8 h-8 text-orange-400/60 animate-pulse" />
                </div>

                <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-white/20">
                  <SignedOut>
                    <Link href="/sign-in">
                      <Button className="bg-linear-to-r from-orange-500 to-pink-500 w-full">
                        Get Started
                      </Button>
                    </Link>
                  </SignedOut>

                  <SignedIn>
                    <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-800">Your Account</span>
                      <UserButton
                        appearance={{
                          elements: {
                            avatarBox: "w-10 h-10"
                          }
                        }}
                        afterSignOutUrl="/"
                      />
                    </div>
                  </SignedIn>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
      </div>
    </nav>
  );
}
