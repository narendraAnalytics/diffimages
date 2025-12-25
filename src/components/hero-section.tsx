"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, useUser } from "@clerk/nextjs";

const videos = [
  '/videos/video2.mp4',
  '/videos/video3.mp4',
  '/videos/video1.mp4'
];

export default function HeroSection() {
  // Get current user data
  const { user } = useUser();

  // Dual video system state
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [preloadVideoIndex, setPreloadVideoIndex] = useState(1);
  const [showingActive, setShowingActive] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showSoundIndicator, setShowSoundIndicator] = useState(true);

  // Refs for both video elements
  const activeVideoRef = useRef<HTMLVideoElement>(null);
  const preloadVideoRef = useRef<HTMLVideoElement>(null);

  // Start playing the active video when component mounts
  useEffect(() => {
    if (activeVideoRef.current) {
      activeVideoRef.current.play().catch((error) => {
        console.log("Initial autoplay prevented:", error);
      });
    }
  }, []); // Empty dependency array - run once on mount

  // Sound toggle for both videos
  const toggleSound = () => {
    const newMutedState = !isMuted;
    if (activeVideoRef.current) {
      activeVideoRef.current.muted = newMutedState;
    }
    if (preloadVideoRef.current) {
      preloadVideoRef.current.muted = newMutedState;
    }
    setIsMuted(newMutedState);
    setShowSoundIndicator(false); // Hide indicator after first click
  };

  // Handle active video ending - crossfade to preload
  const handleActiveVideoEnd = () => {
    // Switch to showing preload video
    setShowingActive(false);

    // Pause the active video that's becoming hidden
    if (activeVideoRef.current) {
      activeVideoRef.current.pause();
    }

    // Update indices for next cycle - skip currently visible video
    const nextActiveIndex = (activeVideoIndex + 2) % videos.length;
    setActiveVideoIndex(nextActiveIndex);

    // Reload new source in active video AFTER transition completes
    setTimeout(() => {
      if (activeVideoRef.current) {
        activeVideoRef.current.pause(); // Ensure it's paused
        activeVideoRef.current.load();
      }
    }, 1100); // Wait for 1000ms CSS transition + 100ms buffer

    // Ensure preload video plays
    if (preloadVideoRef.current) {
      preloadVideoRef.current.muted = isMuted; // Sync muted state
      preloadVideoRef.current.currentTime = 0;
      preloadVideoRef.current.play().catch((error) => {
        console.log("Preload video play prevented:", error);
      });
    }
  };

  // Handle preload video ending - crossfade to active
  const handlePreloadVideoEnd = () => {
    // Switch to showing active video
    setShowingActive(true);

    // Pause the preload video that's becoming hidden
    if (preloadVideoRef.current) {
      preloadVideoRef.current.pause();
    }

    // Update indices for next cycle - skip currently visible video
    const nextPreloadIndex = (preloadVideoIndex + 2) % videos.length;
    setPreloadVideoIndex(nextPreloadIndex);

    // Reload new source in preload video AFTER transition completes
    setTimeout(() => {
      if (preloadVideoRef.current) {
        preloadVideoRef.current.pause(); // Ensure it's paused
        preloadVideoRef.current.load();
      }
    }, 1100); // Wait for 1000ms CSS transition + 100ms buffer

    // Ensure active video plays
    if (activeVideoRef.current) {
      activeVideoRef.current.muted = isMuted; // Sync muted state
      activeVideoRef.current.currentTime = 0;
      activeVideoRef.current.play().catch((error) => {
        console.log("Active video play prevented:", error);
      });
    }
  };

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Dual Video Background System */}
      <div className="absolute inset-0 w-full h-full">
        {/* Active Video */}
        <video
          ref={activeVideoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            showingActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          muted={isMuted}
          playsInline
          preload="auto"
          onEnded={handleActiveVideoEnd}
        >
          <source src={videos[activeVideoIndex]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Preload Video */}
        <video
          ref={preloadVideoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            !showingActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          muted={isMuted}
          playsInline
          preload="auto"
          onEnded={handlePreloadVideoEnd}
        >
          <source src={videos[preloadVideoIndex]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70 z-20"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-30 flex flex-col items-start justify-center h-full px-6 md:px-12 lg:px-24">
        <div className="max-w-2xl text-left mt-85">
          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8">
            Transform your creative vision into reality with AI-powered
            film production technology
          </p>

          {/* Welcome Button - Only shown when user is logged in */}
          <SignedIn>
            <Button className="bg-linear-to-r from-orange-500 via-pink-500 to-rose-500 hover:from-orange-600 hover:via-pink-600 hover:to-rose-600 text-white font-semibold text-lg px-8 py-6 rounded-full shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/70 hover:scale-105 transition-all duration-300 animate-pulse">
              Welcome {user?.username || user?.firstName || 'User'}!
            </Button>
          </SignedIn>
        </div>
      </div>

      {/* Sound Indicator - Animated */}
      {showSoundIndicator && (
        <div className="fixed bottom-8 right-24 z-40 animate-bounce">
          <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-white/50 shadow-lg flex items-center gap-2">
            <span className="text-sm font-semibold bg-linear-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Turn on sound
            </span>
            <span className="text-orange-500">→</span>
          </div>
        </div>
      )}

      {/* Sound Toggle Button */}
      <button
        onClick={toggleSound}
        className="fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 group"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-white group-hover:text-orange-500 transition-colors" />
        ) : (
          <Volume2 className="w-6 h-6 text-orange-500 transition-colors" />
        )}
      </button>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <div className="w-1 h-3 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
