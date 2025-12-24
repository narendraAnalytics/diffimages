"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

const videos = [
  '/videos/video2.mp4',
  '/videos/video3.mp4',
  '/videos/videolearning1.mp4'
];

export default function HeroSection() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoEnd = () => {
    // Move to next video in the array
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  useEffect(() => {
    // Autoplay video when component mounts or video changes
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("Autoplay prevented:", error);
      });
    }
  }, [currentVideoIndex]);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted={isMuted}
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          onEnded={handleVideoEnd}
          key={currentVideoIndex}
        >
          <source src={videos[currentVideoIndex]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 md:px-12 lg:px-24">
        <div className="max-w-5xl text-center">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-6 leading-tight">
            <span className="bg-linear-to-r from-orange-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              AI FILM
            </span>
            <br />
            <span className="text-white">
              PRODUCTION
            </span>
            <br />
            <span className="bg-linear-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              WITHOUT LIMITS
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Transform your creative vision into reality with AI-powered
            film production technology
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300">
              Get Started
            </Button>
            <Button
              variant="outline"
              className="border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-6 text-lg hover:scale-105 transition-all duration-300"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Sound Toggle Button */}
      <button
        onClick={toggleSound}
        className="fixed bottom-8 right-8 z-20 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 group"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-white group-hover:text-orange-500 transition-colors" />
        ) : (
          <Volume2 className="w-6 h-6 text-orange-500 transition-colors" />
        )}
      </button>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <div className="w-1 h-3 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
