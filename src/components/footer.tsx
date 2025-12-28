"use client";

import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navigation = [
    { name: 'Home', href: '#hero' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Features', href: '#features' },
    { name: 'Projects', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'Email', icon: Mail, href: 'mailto:contact@diffgen.com' },
  ];

  return (
    <footer className="relative w-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              DiffGen
            </h3>
            <p className="text-zinc-400 mb-4 max-w-md">
              AI-powered difference detection and brain training platform.
              Challenge yourself with unlimited AI-generated puzzles.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-zinc-700/50 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500
                           flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-zinc-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-zinc-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-zinc-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-zinc-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-700 my-8"></div>

        {/* Bottom Section - Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-400 text-sm text-center md:text-left">
            © {currentYear} DiffGen. All rights reserved.
          </p>

          <p className="text-zinc-400 text-sm flex items-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> by DiffGen Team
          </p>
        </div>
      </div>
    </footer>
  );
}
