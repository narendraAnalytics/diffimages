"use client";

import { useEffect, useRef, useState } from 'react';
import { Mail, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Intersection Observer for scroll animations
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Add actual form submission logic
    console.log('Form submitted:', formData);

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    // Reset form
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative w-full py-24 px-6 md:px-12 lg:px-24
                 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30
                 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-500">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Mail className="w-12 h-12 text-blue-500 animate-breathe" />
              <Sparkles className="w-6 h-6 text-purple-500 absolute -top-1 -right-1 animate-pulse animate-spin-slow" />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Get In Touch
            </span>
          </h2>

          <p className="text-lg md:text-xl text-zinc-600 max-w-3xl mx-auto">
            Have questions or want to collaborate? We'd love to hear from you!
          </p>
        </div>

        {/* Contact Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-500 delay-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-2">
                  Your Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-zinc-200
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                           transition-all duration-300"
                />
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-zinc-200
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                           transition-all duration-300"
                />
              </div>

              {/* Message Textarea */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-zinc-700 mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your project or inquiry..."
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border-2 border-zinc-200
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                           transition-all duration-300 resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500
                         hover:from-blue-600 hover:to-purple-600
                         text-white font-semibold px-8 py-6 text-lg
                         shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50
                         hover:scale-105 transition-all duration-300
                         flex items-center justify-center gap-2 rounded-lg"
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-500 delay-200">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg space-y-8">
              <h3 className="text-2xl font-bold text-zinc-800 mb-6">
                Contact Information
              </h3>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full
                              bg-gradient-to-r from-blue-500 to-purple-500
                              flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-800 mb-1">Email</h4>
                  <a href="mailto:contact@quickspot.com"
                     className="text-zinc-600 hover:text-blue-500 transition-colors">
                    contact@quickspot.com
                  </a>
                </div>
              </div>

              {/* Decorative Info */}
              <div className="pt-8 border-t border-zinc-200">
                <p className="text-zinc-600 text-sm leading-relaxed">
                  We typically respond within 24 hours. Feel free to reach out with any questions
                  about our AI-powered applications or collaboration opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
