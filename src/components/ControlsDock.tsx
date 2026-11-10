/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Gauge, Move, Compass } from 'lucide-react';

interface ControlsDockProps {
  onTeleport: (location: 'entrance' | 'aisle1' | 'aisle2' | 'aisle3' | 'aisle4' | 'checkout') => void;
  speedMode: 'normal' | 'fast';
  onToggleSpeed: () => void;
  currentZone: string;
}

export const ControlsDock: React.FC<ControlsDockProps> = ({
  onTeleport,
  speedMode,
  onToggleSpeed,
  currentZone,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className="pointer-events-auto fixed z-40 transition-transform duration-300"
      style={{
        bottom: isCollapsed ? '-82px' : '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 'min(940px, 94vw)',
        width: '100%',
      }}
    >
      {/* Collapse Toggle Handle */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-900/90 px-3.5 py-1 text-[11px] font-semibold text-slate-300 shadow-lg backdrop-blur-md transition hover:bg-slate-800 hover:text-white"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="h-3.5 w-3.5 text-amber-400" />
              <span>Show Store Nav & Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              <span>Hide Controls (Zen View)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Dock Container */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-slate-700/60 bg-slate-900/90 p-2.5 px-4 shadow-2xl backdrop-blur-md text-xs">
        {/* Current Location Badge */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Current Zone</span>
            <span className="text-xs font-bold text-white truncate max-w-[130px] sm:max-w-[180px] block">
              {currentZone}
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block h-6 w-px bg-slate-700/60" />

        {/* Quick Teleport Nav Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 mr-1">
            <MapPin className="h-3.5 w-3.5 text-amber-400" /> Jump to:
          </span>

          <button
            onClick={() => onTeleport('entrance')}
            className="rounded-xl border border-slate-700/60 bg-slate-800/80 px-2.5 py-1.5 font-medium text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white transition whitespace-nowrap"
          >
            Entrance
          </button>

          <button
            onClick={() => onTeleport('aisle1')}
            className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1.5 font-medium text-emerald-300 hover:bg-emerald-900/50 hover:text-white transition whitespace-nowrap"
            title="Aashirvaad Atta, Tata Salt, Fortune Oil"
          >
            Aisle 1: Staples
          </button>

          <button
            onClick={() => onTeleport('aisle2')}
            className="rounded-xl border border-amber-500/30 bg-amber-950/40 px-2.5 py-1.5 font-medium text-amber-300 hover:bg-amber-900/50 hover:text-white transition whitespace-nowrap"
            title="Maggi Noodles, Parle-G, Good Day, Lay's"
          >
            Aisle 2: Maggi & Snacks
          </button>

          <button
            onClick={() => onTeleport('aisle3')}
            className="rounded-xl border border-sky-500/30 bg-sky-950/40 px-2.5 py-1.5 font-medium text-sky-300 hover:bg-sky-900/50 hover:text-white transition whitespace-nowrap"
            title="Amul Milk, Dairy Milk Silk, Butter"
          >
            Aisle 3: Dairy & Silk
          </button>

          <button
            onClick={() => onTeleport('aisle4')}
            className="rounded-xl border border-red-500/30 bg-red-950/40 px-2.5 py-1.5 font-medium text-red-300 hover:bg-red-900/50 hover:text-white transition whitespace-nowrap"
            title="Coca-Cola, Frooti"
          >
            Aisle 4: Drinks
          </button>

          <button
            onClick={() => onTeleport('checkout')}
            className="rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-600/40 to-teal-600/40 px-3 py-1.5 font-bold text-cyan-200 hover:from-cyan-600/60 hover:to-teal-600/60 hover:text-white transition whitespace-nowrap"
          >
            Billing Counter
          </button>
        </div>

        {/* Speed Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleSpeed}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-semibold transition ${
              speedMode === 'fast'
                ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                : 'border-slate-700/60 bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Fast Walk / Normal Walk"
          >
            <Gauge className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">{speedMode === 'fast' ? 'Fast Run' : 'Normal Walk'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
