// src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, FolderOpen, Users, Shield } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#FF4500] selection:text-white">
      {/* Nav */}
      <nav className="h-16 border-b border-[#111111] px-6 lg:px-12 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#FF4500]"></div>
          <span className="text-xl font-bold tracking-tight text-[#111111] uppercase">Index</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="font-mono text-xs uppercase text-[#111111] hover:text-[#FF4500] transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="font-mono text-xs uppercase bg-[#FF4500] text-white px-4 py-2 border border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 hover:bg-[#111111] transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 lg:px-12 py-24 lg:py-32 border-b border-[#111111] bg-white">
        <div className="max-w-3xl">
          <div className="font-mono text-xs text-[#FF4500] uppercase mb-4">Creative Asset Management</div>
          <h1 className="text-5xl lg:text-7xl font-bold text-[#111111] uppercase tracking-tighter leading-[0.9] mb-6">
            Organize.<br />Curate.<br />Create.
          </h1>
          <p className="text-lg text-[#111111]/70 max-w-xl mb-10 leading-relaxed">
            Index is where creative teams manage their digital assets. Organize projects into capsules, 
            collaborate with your team, and keep everything in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-[#FF4500] text-white px-8 py-4 font-bold uppercase text-sm tracking-wide border border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] active:shadow-none active:translate-y-1 active:translate-x-1 hover:bg-[#111111] transition-colors"
            >
              Init_Account <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold uppercase text-sm tracking-wide border border-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
            >
              Existing User
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-[#111111] bg-white p-8">
            <FolderOpen size={24} className="text-[#FF4500] mb-4" />
            <h3 className="font-bold text-[#111111] uppercase mb-2">Capsule System</h3>
            <p className="font-mono text-sm text-[#111111]/60">
              Group assets into capsules — curated collections for any project, campaign, or creative direction.
            </p>
          </div>
          <div className="border border-[#111111] bg-white p-8">
            <Users size={24} className="text-[#FF4500] mb-4" />
            <h3 className="font-bold text-[#111111] uppercase mb-2">Team Access</h3>
            <p className="font-mono text-sm text-[#111111]/60">
              Invite collaborators with role-based permissions. Viewers, editors, and admins — all controlled.
            </p>
          </div>
          <div className="border border-[#111111] bg-white p-8">
            <Shield size={24} className="text-[#FF4500] mb-4" />
            <h3 className="font-bold text-[#111111] uppercase mb-2">Tier Gating</h3>
            <p className="font-mono text-sm text-[#111111]/60">
              Free, Pro, and Enterprise tiers with storage limits, asset caps, and feature gates built in.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#111111] px-6 lg:px-12 py-8 bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#FF4500]"></div>
            <span className="font-mono text-xs text-[#111111]/60 uppercase">Index © 2026</span>
          </div>
          <div className="font-mono text-xs text-[#111111]/40">
            Built for creators who take their work seriously.
          </div>
        </div>
      </footer>
    </div>
  );
}