import React from 'react';
import { Camera, FolderOpen, Layers, Settings, LogOut, Plus, ChevronRight } from 'lucide-react';

// --- MOCK DATA (Imagine this coming from your Zustand store / backend) ---
const mockCapsules = [
  { id: '1', name: 'DENVER_WINTER_CORE', items: 14, lastUpdated: '2026-03-20T14:30:00Z', status: 'active' },
  { id: '2', name: 'ATL_SUMMER_TECH', items: 8, lastUpdated: '2026-03-18T09:15:00Z', status: 'draft' },
  { id: '3', name: 'SLC_DAILY_UNIFORM', items: 22, lastUpdated: '2026-03-15T18:45:00Z', status: 'active' },
];

const MOCK_USAGE = { current: 44, limit: 50, tier: 'free' };

// --- COMPONENTS ---

const Sidebar = () => (
  <aside className="hidden md:flex flex-col w-64 h-screen border-r border-[#111111] bg-[#F9F9F9] p-6 justify-between shrink-0">
    <div>
      {/* Brand Header */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-4 h-4 bg-[#FF4500]"></div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111111] uppercase">Index</h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-4 font-mono text-sm">
        <button className="flex items-center gap-3 text-[#111111] hover:text-[#FF4500] transition-colors w-full text-left">
          <Layers size={18} />
          <span>[ ALL_ASSETS ]</span>
        </button>
        <button className="flex items-center gap-3 text-[#FF4500] w-full text-left">
          <FolderOpen size={18} />
          <span>[ CAPSULES ]</span>
        </button>
        <button className="flex items-center gap-3 text-[#111111] hover:text-[#FF4500] transition-colors w-full text-left">
          <Settings size={18} />
          <span>[ SYSTEM_PREFS ]</span>
        </button>
      </nav>
    </div>

    {/* Storage / Tier Gate Tracker */}
    <div className="space-y-4">
      <div className="border border-[#111111] p-4 bg-white">
        <div className="flex justify-between items-end mb-2 font-mono text-xs uppercase text-[#111111]">
          <span>Capacity</span>
          <span>{MOCK_USAGE.current} / {MOCK_USAGE.limit}</span>
        </div>
        <div className="w-full h-2 bg-[#F9F9F9] border border-[#111111]">
          <div 
            className="h-full bg-[#FF4500]" 
            style={{ width: `${(MOCK_USAGE.current / MOCK_USAGE.limit) * 100}%` }}
          ></div>
        </div>
        {MOCK_USAGE.tier === 'free' && (
          <button className="mt-4 w-full py-2 bg-[#111111] text-[#F9F9F9] font-mono text-xs uppercase hover:bg-[#FF4500] transition-colors">
            Expand Storage
          </button>
        )}
      </div>
      
      <button className="flex items-center gap-3 text-[#111111] hover:text-[#FF4500] transition-colors w-full text-left font-mono text-sm">
        <LogOut size={18} />
        <span>[ END_SESSION ]</span>
      </button>
    </div>
  </aside>
);

const CapsuleCard = ({ capsule }) => (
  <div className="group border border-[#111111] bg-white cursor-pointer hover:border-[#FF4500] transition-colors flex flex-col h-64">
    {/* Visual Placeholder for the Canvas Preview */}
    <div className="flex-1 border-b border-[#111111] p-4 flex items-center justify-center bg-[#F9F9F9] group-hover:bg-white transition-colors relative overflow-hidden">
        <Layers className="text-[#111111] opacity-20" size={48} />
        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-[#FF4500]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <span className="font-mono text-xs text-[#FF4500] bg-white border border-[#FF4500] px-3 py-1 flex items-center gap-1">
                 OPEN_CANVAS <ChevronRight size={14}/>
             </span>
        </div>
    </div>
    
    {/* Metadata Section */}
    <div className="p-4 flex flex-col gap-1">
      <h3 className="font-bold text-[#111111] truncate uppercase">{capsule.name}</h3>
      <div className="flex justify-between font-mono text-xs text-[#111111]/70 mt-2">
        <span>ASSETS: {capsule.items.toString().padStart(2, '0')}</span>
        <span>MOD: {new Date(capsule.lastUpdated).toLocaleDateString()}</span>
      </div>
    </div>
  </div>
);

export default function IndexDashboard() {
  return (
    <div className="flex h-screen w-full bg-[#F9F9F9] font-sans selection:bg-[#FF4500] selection:text-white">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TopBar */}
        <header className="h-20 border-b border-[#111111] px-6 lg:px-12 flex items-center justify-between bg-white shrink-0">
          <div className="font-mono text-sm text-[#111111]">
            <span className="text-[#FF4500]">SYSTEM</span> // CAPSULES
          </div>
          
          {/* Primary Action */}
          <button className="flex items-center gap-2 bg-[#FF4500] text-white px-5 py-2.5 font-bold hover:bg-[#111111] transition-colors shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] active:shadow-[0px_0px_0px_0px_rgba(17,17,17,1)] active:translate-y-1 active:translate-x-1 border border-[#111111]">
            <Camera size={18} />
            <span className="uppercase text-sm tracking-wide">Ingest Asset</span>
          </button>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12">
          
          {/* Header & Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-4xl font-bold text-[#111111] uppercase tracking-tighter mb-2">Active Capsules</h2>
              <p className="font-mono text-sm text-[#111111]/60">Select a project to enter the canvas.</p>
            </div>
            
            <button className="flex items-center gap-2 text-[#111111] border border-[#111111] px-4 py-2 hover:bg-[#111111] hover:text-white transition-colors font-mono text-sm uppercase bg-white">
              <Plus size={16} /> Init_Capsule
            </button>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockCapsules.map((capsule) => (
              <CapsuleCard key={capsule.id} capsule={capsule} />
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}