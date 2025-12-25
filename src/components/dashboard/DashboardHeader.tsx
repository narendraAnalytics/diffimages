"use client";

import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';


export default function DashboardHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-orange-100 transition-colors">
              <Home className="w-6 h-6 text-orange-600" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold bg-linear-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            DiffGen Dashboard
          </h1>
        </div>

      </div>
    </header>
  );
}
