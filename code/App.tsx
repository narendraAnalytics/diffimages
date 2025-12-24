import React, { useState } from 'react';
import { GameScreen } from './components/GameScreen';
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  HelpCircle, 
  Search, 
  Bell, 
  User,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Play Game', active: true },
    { icon: <History size={20} />, label: 'Game History', active: false },
    { icon: <Settings size={20} />, label: 'Settings', active: false },
    { icon: <HelpCircle size={20} />, label: 'How to Play', active: false },
  ];

  return (
    <div className="flex h-screen bg-[#fafafa] text-zinc-900 font-sans overflow-hidden">
      {/* Sidebar - Shadcn Style */}
      <aside className={`
        ${isSidebarOpen ? 'w-64' : 'w-20'} 
        bg-white border-r border-zinc-200 flex flex-col transition-all duration-300 ease-in-out z-50
        hidden md:flex
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
          </div>
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight">DiffGen <span className="text-zinc-400 font-normal">AI</span></span>}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item, idx) => (
            <button
              key={idx}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                ${item.active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}
              `}
            >
              {item.icon}
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100">
           <button className="flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium w-full">
             <User size={20} />
             {isSidebarOpen && <span>Free Account</span>}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-zinc-100 rounded-md text-zinc-500 hidden md:block"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text" 
                placeholder="Search challenges..." 
                className="bg-zinc-50 border border-zinc-200 rounded-full pl-10 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden border border-zinc-300">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-auto bg-zinc-50/50 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto h-full">
            <GameScreen />
          </div>
        </div>
      </main>
    </div>
  );
}
