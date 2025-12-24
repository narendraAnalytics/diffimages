"use client";

import React, { useState, useEffect } from "react";

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  gradientFrom: string;
  gradientTo: string;
}

export function Tooltip({ children, text, gradientFrom, gradientTo }: TooltipProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="group/tooltip relative inline-flex">
      {children}

      {/* Only render tooltip after client mount to prevent hydration errors */}
      {isMounted && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
            opacity-0 pointer-events-none
            group-hover/tooltip:opacity-100
            transition-all duration-200 ease-out
            -translate-y-1 group-hover/tooltip:translate-y-0"
        >
          {/* Tooltip Content */}
          <div className="relative px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-white/50">
            <span
              className={`text-sm font-semibold whitespace-nowrap bg-linear-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}
            >
              {text}
            </span>
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/90"></div>
          </div>
        </div>
      )}
    </div>
  );
}
