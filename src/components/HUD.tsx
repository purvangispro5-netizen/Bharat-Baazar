/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingCart, Volume2, VolumeX, Music, Compass, ListChecks, HelpCircle } from 'lucide-react';
import { PlayerFocus } from '../game/playerController.ts';
import { CartItem, ShoppingMissionItem } from '../types/game.ts';

interface HUDProps {
  focus: PlayerFocus | null;
  cart: CartItem[];
  shoppingMission: ShoppingMissionItem[];
  onInteract: () => void;
  onOpenCart: () => void;
  onOpenMission: () => void;
  onOpenHelp: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isBgmActive: boolean;
  onToggleBGM: () => void;
  playerPos: { x: number; z: number };
}

export const HUD: React.FC<HUDProps> = ({
  focus,
  cart,
  shoppingMission,
  onInteract,
  onOpenCart,
  onOpenMission,
  onOpenHelp,
  isMuted,
  onToggleMute,
  isBgmActive,
  onToggleBGM,
  playerPos,
}) => {
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Calculate mission completion percentage
  const completedMissionCount = shoppingMission.filter((m) => {
    const inCart = cart.find((c) => c.product.id === m.productId);
    return inCart && inCart.quantity >= m.requiredQty;
  }).length;

  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="pointer-events-auto flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Supermarket Brand Badge */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/80 px-4 py-2 shadow-xl backdrop-blur-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 font-bold text-white shadow-md">
            🇮🇳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white sm:text-lg">
                BHARAT BAZAAR
              </span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                3D SIMULATOR
              </span>
            </div>
            <p className="text-xs text-amber-300/80">भारत सुपर बाज़ार • Supermarket</p>
          </div>
        </div>

        {/* Center Mission Reminder Pill */}
        <button
          onClick={onOpenMission}
          className="group hidden items-center gap-2 rounded-2xl border border-amber-500/30 bg-slate-900/80 px-4 py-2 text-left shadow-lg backdrop-blur-md transition hover:border-amber-400 hover:bg-slate-800/90 sm:flex"
        >
          <ListChecks className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Mom's Kirana List
              </span>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.2 text-[11px] font-bold text-amber-300">
                {completedMissionCount}/{shoppingMission.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">Click to view items</p>
          </div>
        </button>

        {/* Right Action Icons & Cart Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/80 text-slate-300 shadow-md backdrop-blur-md transition hover:bg-slate-800 hover:text-white"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
          </button>

          {/* Supermarket BGM Music Toggle */}
          <button
            onClick={onToggleBGM}
            title={isBgmActive ? 'Stop Ambient Music' : 'Play Supermarket Music'}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/80 shadow-md backdrop-blur-md transition hover:bg-slate-800 ${
              isBgmActive ? 'text-amber-400 border-amber-500/50' : 'text-slate-400'
            }`}
          >
            <Music className="h-4 w-4" />
          </button>

          {/* Help Controls */}
          <button
            onClick={onOpenHelp}
            title="How to Play"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/80 text-slate-300 shadow-md backdrop-blur-md transition hover:bg-slate-800 hover:text-white"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* Shopping Cart Pill Button */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 font-medium text-white shadow-lg transition hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/25 active:scale-95"
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-slate-950">
                  {totalItemCount}
                </span>
              )}
            </div>
            <div className="text-left leading-tight hidden xs:block">
              <div className="text-[11px] font-semibold text-emerald-100">CART</div>
              <div className="text-xs font-bold">₹{totalAmount}</div>
            </div>
          </button>
        </div>
      </header>

      {/* Center Crosshair Reticle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className={`h-3 w-3 rounded-full border-2 transition-all duration-150 ${
            focus
              ? 'scale-150 border-amber-400 bg-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
              : 'border-white/60 bg-white/10'
          }`}
        />
      </div>

      {/* Interactive Item Focus Prompt Banner (Anchored right above center or bottom) */}
      {focus && (
        <div className="pointer-events-auto absolute bottom-32 left-1/2 -translate-x-1/2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-400/60 bg-slate-950/90 px-5 py-3 shadow-2xl backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow">
              E
            </div>

            {focus.type === 'product' && focus.product ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{focus.product.name}</span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-black text-emerald-400">
                    ₹{focus.product.price}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {focus.product.hindiName} • Press <kbd className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-amber-300 font-mono">E</kbd> or Click to add to cart
                </p>
              </div>
            ) : (
              <div>
                <div className="text-sm font-bold text-emerald-400">Checkout Billing Counter</div>
                <p className="text-xs text-slate-300">
                  Press <kbd className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-amber-300 font-mono">E</kbd> to place items on conveyor & pay
                </p>
              </div>
            )}

            <button
              onClick={onInteract}
              className="ml-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md transition hover:brightness-110 active:scale-95"
            >
              {focus.type === 'product' ? 'Pick Up' : 'Checkout'}
            </button>
          </div>
        </div>
      )}

      {/* Floating Minimap (Top Left / Side) */}
      <div className="pointer-events-auto absolute top-20 left-4 hidden sm:block">
        <div className="group relative rounded-2xl border border-slate-700/60 bg-slate-900/80 p-2.5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-1.5 text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              <Compass className="h-3 w-3 text-cyan-400" /> STORE RADAR
            </span>
            <span className="text-[10px] text-slate-500">24m x 22m</span>
          </div>

          {/* Minimap Canvas representation */}
          <div className="relative h-28 w-32 rounded-lg bg-slate-950/90 border border-slate-800 overflow-hidden">
            {/* Aisles */}
            <div className="absolute left-2 top-3 h-16 w-3 rounded-sm bg-emerald-700/60" title="Aisle 1: Groceries" />
            <div className="absolute left-9 top-3 h-16 w-3 rounded-sm bg-amber-600/60" title="Aisle 2: Snacks" />
            <div className="absolute left-16 top-3 h-16 w-3 rounded-sm bg-sky-600/60" title="Aisle 3: Dairy" />
            <div className="absolute left-23 top-3 h-16 w-3 rounded-sm bg-red-600/60" title="Aisle 4: Beverages" />

            {/* Billing Counters */}
            <div className="absolute bottom-2 left-5 h-2 w-8 rounded-sm bg-cyan-500/80" title="Billing Counter" />
            <div className="absolute bottom-2 left-17 h-2 w-8 rounded-sm bg-cyan-500/80" title="Billing Counter" />

            {/* Player Marker */}
            {/* Convert player world coordinates (-12 to 12 in X, -11 to 11 in Z) to map % */}
            <div
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-amber-400 shadow-[0_0_8px_#fbbf24]"
              style={{
                left: `${Math.max(5, Math.min(95, ((playerPos.x + 12) / 24) * 100))}%`,
                top: `${Math.max(5, Math.min(95, ((playerPos.z + 11) / 22) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
