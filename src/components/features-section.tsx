"use client";

import { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  LayoutGrid,
  CheckCircle,
  Mic,
  Timer,
  TrendingUp,
  Rocket
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Features data
const features = [
  {
    id: 1,
    icon: Sparkles,
    title: 'Unlimited AI-Generated Challenges',
    description: 'Powered by Google Gemini AI, every challenge is unique. Never run out of puzzles with infinite AI-generated content tailored to your preferences.',
    gradient: 'from-orange-500 to-pink-500',
    shadowColor: 'orange',
    badge: 'Powered by Gemini',
    stats: 'Unlimited unique puzzles',
    size: 'large', // 2 cols on lg
    animation: 'rotate',
    hasParticles: true
  },
  {
    id: 2,
    icon: LayoutGrid,
    title: '3 Training Modes',
    description: 'DIFF mode for spot-the-difference, WRONG mode for logical errors, LOGIC mode for IQ puzzles. Switch modes to target different cognitive skills.',
    gradient: 'from-pink-500 to-rose-500',
    shadowColor: 'pink',
    modes: ['DIFF', 'WRONG', 'LOGIC'],
    size: 'medium', // 1 col
    animation: 'scale'
  },
  {
    id: 3,
    icon: CheckCircle,
    title: 'Instant Feedback',
    description: 'Advanced AI analyzes your answers in real-time, providing immediate validation and helpful hints to improve your skills.',
    gradient: 'from-green-500 to-emerald-500',
    shadowColor: 'green',
    size: 'small', // 1 col
    animation: 'pulse'
  },
  {
    id: 4,
    icon: Mic,
    title: 'Voice-Activated Controls',
    description: 'Speak your answers with our advanced voice recognition system. Perfect for hands-free training sessions and accessibility.',
    gradient: 'from-blue-500 to-purple-500',
    shadowColor: 'blue',
    size: 'large', // 2 cols
    animation: 'waveform',
    isInteractive: true
  },
  {
    id: 5,
    icon: Timer,
    title: '15-Second Quick Sessions',
    description: 'Fast-paced 15-second challenges keep you focused and engaged. Perfect for quick brain training breaks throughout your day.',
    gradient: 'from-cyan-500 to-blue-500',
    shadowColor: 'cyan',
    size: 'large', // 2 cols
    animation: 'countdown'
  },
  {
    id: 6,
    icon: TrendingUp,
    title: 'Track Your Growth',
    description: 'Comprehensive session history and performance analytics help you monitor improvement and identify areas for growth.',
    gradient: 'from-indigo-500 to-purple-500',
    shadowColor: 'indigo',
    stats: 'View all sessions',
    size: 'medium', // 1 col
    animation: 'chart'
  }
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeVoice, setActiveVoice] = useState(false);

  // Scroll animation with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative w-full py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-br from-pink-50/30 via-orange-50/20 to-rose-50/30 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-500">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Rocket className="w-12 h-12 text-pink-500 animate-breathe" />
              <Sparkles className="w-6 h-6 text-orange-500 absolute -top-1 -right-1 animate-spin-slow" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              Powerful Features for Maximum Brain Engagement
            </span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-600 max-w-3xl mx-auto">
            Everything you need to train your mind effectively
          </p>
        </div>

        {/* Bento Grid - Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                className={`group relative bg-white/80 backdrop-blur-lg border-white/30 hover:bg-white/90 hover:backdrop-blur-xl hover:scale-102 hover:-translate-y-1 shadow-xl hover:shadow-2xl hover:shadow-${feature.shadowColor}-500/40 transition-all duration-300 rounded-3xl overflow-hidden animate-on-scroll opacity-0 translate-y-8 transition-all duration-500 ${
                  feature.size === 'large' ? 'lg:col-span-2' : 'lg:col-span-1'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
                tabIndex={0}
              >
                {/* Floating Particles Background (for AI feature) */}
                {feature.hasParticles && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-10 w-2 h-2 bg-orange-400 rounded-full animate-float opacity-60"></div>
                    <div className="absolute top-20 right-20 w-3 h-3 bg-pink-400 rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-20 left-20 w-2 h-2 bg-rose-400 rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }}></div>
                  </div>
                )}

                <CardContent className="p-6 md:p-8 relative z-10">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-full h-full text-white ${
                      feature.animation === 'rotate' ? 'animate-spin-slow' :
                      feature.animation === 'scale' ? 'animate-breathe' :
                      feature.animation === 'pulse' ? 'animate-pulse' :
                      feature.animation === 'waveform' ? 'animate-bounce-gentle' :
                      feature.animation === 'countdown' ? 'animate-spin-slow' :
                      'animate-float'
                    }`} />
                  </div>

                  {/* Badge (if present) */}
                  {feature.badge && (
                    <div className={`inline-block px-3 py-1 mb-3 rounded-full text-xs font-semibold bg-gradient-to-r ${feature.gradient} text-white shadow-md`}>
                      {feature.badge}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className={`text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-zinc-600 mb-4 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Mode Pills (for 3 Modes feature) */}
                  {feature.modes && (
                    <div className="flex gap-2 flex-wrap mt-4">
                      {feature.modes.map((mode, idx) => (
                        <div
                          key={mode}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 text-sm font-semibold hover:scale-105 transition-transform duration-200"
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                          {mode}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Voice Waveform (for Voice feature) */}
                  {feature.animation === 'waveform' && (
                    <div
                      className="flex items-center justify-center gap-1 mt-6 h-16 cursor-pointer"
                      onClick={() => setActiveVoice(!activeVoice)}
                    >
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 rounded-full bg-gradient-to-t ${feature.gradient} transition-all duration-300 ${
                            activeVoice ? 'animate-sound-wave' : 'h-4'
                          }`}
                          style={{
                            animationDelay: `${i * 100}ms`,
                            height: activeVoice ? '100%' : '16px'
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {/* Timer Countdown (for Timer feature) */}
                  {feature.animation === 'countdown' && (
                    <div className="flex items-center justify-center mt-6">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="url(#gradient-timer)"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray="251.2"
                            strokeDashoffset="62.8"
                            className="transition-all duration-1000 animate-pulse"
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="gradient-timer" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#06b6d4" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">15</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progress Chart (for Progress feature) */}
                  {feature.animation === 'chart' && (
                    <div className="mt-6 h-20">
                      <svg className="w-full h-full" viewBox="0 0 200 60">
                        <defs>
                          <linearGradient id="gradient-chart" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                        <polyline
                          points="0,50 40,40 80,30 120,35 160,20 200,10"
                          fill="none"
                          stroke="url(#gradient-chart)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="animate-chart-draw"
                        />
                        {/* Data points */}
                        {[0, 40, 80, 120, 160, 200].map((x, i) => {
                          const yPoints = [50, 40, 30, 35, 20, 10];
                          return (
                            <circle
                              key={i}
                              cx={x}
                              cy={yPoints[i]}
                              r="4"
                              fill="url(#gradient-chart)"
                              className="animate-scale-in"
                              style={{ animationDelay: `${i * 100}ms` }}
                            />
                          );
                        })}
                      </svg>
                    </div>
                  )}

                  {/* Stats (if present) */}
                  {feature.stats && (
                    <div className="mt-4 text-sm font-semibold text-zinc-500">
                      {feature.stats}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
