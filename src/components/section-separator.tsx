"use client";

export default function SectionSeparator() {
  return (
    <div className="relative w-full h-20 md:h-24 overflow-hidden">
      {/* Animated Wave SVG */}
      <svg
        className="absolute bottom-0 w-full h-full"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient Definition */}
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" /> {/* orange-500 */}
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.9" /> {/* pink-500 */}
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.9" /> {/* rose-500 */}
          </linearGradient>
        </defs>

        {/* Wave Path with Animation */}
        <g className="animate-wave-flow">
          <path
            d="M0,40 C300,80 600,0 900,40 C1050,60 1150,80 1200,40 L1200,120 L0,120 Z"
            fill="url(#wave-gradient)"
          />
          {/* Duplicate wave for seamless loop */}
          <path
            d="M1200,40 C1500,80 1800,0 2100,40 C2250,60 2350,80 2400,40 L2400,120 L1200,120 Z"
            fill="url(#wave-gradient)"
          />
        </g>

        {/* Secondary wave layer for depth */}
        <g className="animate-wave-flow-reverse opacity-40">
          <path
            d="M0,60 C300,20 600,100 900,60 C1050,40 1150,20 1200,60 L1200,120 L0,120 Z"
            fill="url(#wave-gradient)"
          />
          <path
            d="M1200,60 C1500,20 1800,100 2100,60 C2250,40 2350,20 2400,60 L2400,120 L1200,120 Z"
            fill="url(#wave-gradient)"
          />
        </g>
      </svg>
    </div>
  );
}
