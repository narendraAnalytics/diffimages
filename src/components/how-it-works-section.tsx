"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Brain,
  Sparkles,
  Image as ImageIcon,
  Zap,
  Target,
  Trophy,
  Lightbulb,
  LayoutGrid,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Game modes data
const gameModes = [
  {
    icon: ImageIcon,
    title: 'Spot the Difference',
    description: 'Compare two AI-generated images and find 6-8 subtle differences',
    gradient: 'from-orange-500 to-pink-500',
    shadowColor: 'orange',
    features: [
      'Click to mark differences',
      'Visual precision training',
      'Pattern recognition skills',
      'Real-time AI validation'
    ]
  },
  {
    icon: Zap,
    title: "What's Wrong Here?",
    description: 'Find 5-7 logical errors and impossibilities in a single image',
    gradient: 'from-pink-500 to-rose-500',
    shadowColor: 'pink',
    features: [
      'Critical thinking challenges',
      'Real-world logic application',
      'Attention to detail',
      'AI-powered verification'
    ]
  },
  {
    icon: Brain,
    title: 'Logic Puzzles',
    description: 'Solve IQ tests, riddles, and reasoning challenges',
    gradient: 'from-blue-500 to-purple-500',
    shadowColor: 'blue',
    features: [
      'Pure cognitive challenges',
      'Mathematical reasoning',
      'Creative problem-solving',
      'Unlimited variety'
    ]
  }
];

// User journey steps
const steps = [
  {
    number: 1,
    icon: LayoutGrid,
    title: 'Choose Your Mode',
    description: 'Select from DIFF, WRONG, or LOGIC mode based on your mood',
    gradient: 'from-orange-500 to-pink-500'
  },
  {
    number: 2,
    icon: Lightbulb,
    title: 'Enter Your Topic',
    description: 'Type a custom topic or let AI surprise you with random themes',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    number: 3,
    icon: Target,
    title: 'Solve the Challenge',
    description: 'Race against the timer to find all answers',
    gradient: 'from-blue-500 to-purple-500'
  },
  {
    number: 4,
    icon: Trophy,
    title: 'Get Instant Feedback',
    description: 'See your score, review answers, and track your progress',
    gradient: 'from-green-500 to-emerald-500'
  }
];

// Key benefits
const benefits = [
  {
    icon: Sparkles,
    title: 'Powered by Google Gemini',
    description: 'Unlimited unique challenges generated on-demand',
    gradient: 'from-orange-500 to-pink-500'
  },
  {
    icon: Zap,
    title: 'Never the Same Twice',
    description: 'Infinite variety with custom topics of your choice',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    icon: Brain,
    title: 'Sharpen Your Mind',
    description: 'Improve focus, pattern recognition, and critical thinking',
    gradient: 'from-blue-500 to-purple-500'
  }
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);

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
      id="how-it-works"
      className="relative w-full py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-br from-orange-50/30 via-yellow-50/20 to-pink-50/30 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-500">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Brain className="w-12 h-12 text-orange-500 animate-breathe" />
              <Sparkles className="w-6 h-6 text-pink-500 absolute -top-1 -right-1 animate-pulse animate-spin-slow" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              How DiffGen Brain Training Works
            </span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-600 max-w-3xl mx-auto">
            Challenge your mind with AI-powered visual puzzles and logic challenges
          </p>
        </div>

        {/* Game Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {gameModes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <Card
                key={mode.title}
                className={`group relative bg-white/80 backdrop-blur-md border-white/20 hover:bg-white/90 hover:backdrop-blur-lg hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-2xl hover:shadow-${mode.shadowColor}-500/30 transition-all duration-300 rounded-2xl p-6 md:p-8 cursor-pointer animate-on-scroll opacity-0 translate-y-8 transition-all duration-500`}
                style={{ transitionDelay: `${index * 100}ms` }}
                tabIndex={0}
              >
                <CardContent className="p-0">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${mode.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-full h-full text-white ${
                      mode.title === 'Spot the Difference' ? 'animate-float' :
                      mode.title === "What's Wrong Here?" ? 'animate-wiggle' :
                      'animate-breathe'
                    }`} />
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl md:text-2xl font-bold mb-3 bg-linear-to-r ${mode.gradient} bg-clip-text text-transparent`}>
                    {mode.title}
                  </h3>

                  {/* Description */}
                  <p className="text-zinc-600 mb-4 leading-relaxed">
                    {mode.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2">
                    {mode.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-zinc-500">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* User Journey Steps */}
        <div className="mb-24">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-on-scroll opacity-0 translate-y-8 transition-all duration-500">
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Your Journey in 4 Simple Steps
            </span>
          </h3>

          {/* Desktop: Horizontal Timeline */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6 items-start">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={step.number} className="flex flex-col items-center">
                  {/* Step Card */}
                  <div
                    className="flex flex-col items-center text-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-500"
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    {/* Number Badge with Icon Overlay */}
                    <div className="relative mb-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.gradient} p-1 shadow-lg shadow-${step.gradient.split('-')[1]}-500/30`}>
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                          <span className={`text-2xl font-bold bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
                            {step.number}
                          </span>
                        </div>
                      </div>
                      <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r ${step.gradient} p-1.5 shadow-md`}>
                        <StepIcon className="w-full h-full text-white animate-bounce-gentle" />
                      </div>
                    </div>

                    {/* Content */}
                    <h4 className="text-lg font-bold text-zinc-900 mb-2">{step.title}</h4>
                    <p className="text-sm text-zinc-600">{step.description}</p>
                  </div>

                  {/* Arrow (not on last step) */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-[calc(25%+2rem)] top-8 w-[calc(25%-4rem)] flex items-center justify-center">
                      <ArrowRight className="w-8 h-8 text-orange-400/50" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile/Tablet: Vertical Timeline */}
          <div className="lg:hidden space-y-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.number}
                  className="flex items-start gap-6 animate-on-scroll opacity-0 translate-y-8 transition-all duration-500"
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Number Badge with Icon Overlay */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.gradient} p-1 shadow-lg shadow-${step.gradient.split('-')[1]}-500/30`}>
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        <span className={`text-2xl font-bold bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
                          {step.number}
                        </span>
                      </div>
                    </div>
                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r ${step.gradient} p-1.5 shadow-md`}>
                      <StepIcon className="w-full h-full text-white animate-bounce-gentle" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h4 className="text-lg font-bold text-zinc-900 mb-1">{step.title}</h4>
                    <p className="text-sm text-zinc-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Benefits */}
        <div className="mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-on-scroll opacity-0 translate-y-8 transition-all duration-500">
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Why Choose DiffGen?
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className={`group flex flex-col items-center text-center p-8 bg-white/80 backdrop-blur-md border-white/20 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-on-scroll opacity-0 translate-y-8 transition-all duration-500`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${benefit.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <BenefitIcon className={`w-full h-full text-white ${
                      benefit.title === 'Powered by Google Gemini' ? 'animate-pulse' :
                      benefit.title === 'Never the Same Twice' ? 'animate-spin-slow' :
                      'animate-bounce-gentle'
                    }`} />
                  </div>

                  {/* Title */}
                  <h4 className={`text-xl font-bold mb-2 bg-gradient-to-r ${benefit.gradient} bg-clip-text text-transparent`}>
                    {benefit.title}
                  </h4>

                  {/* Description */}
                  <p className="text-zinc-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-500" style={{ transitionDelay: '300ms' }}>
          <Link href="/sign-in">
            <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold text-lg px-8 py-6 rounded-full shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/70 hover:scale-105 transition-all duration-300">
              Get Started Now
            </Button>
          </Link>
          <p className="mt-4 text-sm text-zinc-500">No credit card required • Free to start</p>
        </div>
      </div>
    </section>
  );
}
