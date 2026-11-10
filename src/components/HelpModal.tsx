/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Keyboard, MousePointer, ShoppingCart, CreditCard, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 font-bold">
              🎮
            </div>
            <div>
              <h2 className="text-base font-bold text-white">How to Play Supermarket Simulator</h2>
              <p className="text-xs text-slate-400">Controls, Shortcuts & Objectives</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-300">
          {/* Movement */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Keyboard className="h-4 w-4 text-amber-400" />
              <span>Player Movement</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="flex items-center gap-2">
                <kbd className="rounded bg-slate-800 px-2 py-1 font-mono text-amber-300">W, A, S, D</kbd>
                <span>Walk Around</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="rounded bg-slate-800 px-2 py-1 font-mono text-amber-300">Shift</kbd>
                <span>Sprint / Run</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="rounded bg-slate-800 px-2 py-1 font-mono text-amber-300">Arrows</kbd>
                <span>Alternative Walk</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="rounded bg-slate-800 px-2 py-1 font-mono text-amber-300">E / Space</kbd>
                <span>Interact / Pick Up</span>
              </div>
            </div>
          </div>

          {/* Looking & Camera */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <MousePointer className="h-4 w-4 text-cyan-400" />
              <span>Camera & Looking</span>
            </div>
            <p>
              Click & drag anywhere on the 3D supermarket floor to turn your head. On desktop, click into the canvas for pointer lock immersion (press Esc anytime to release).
            </p>
          </div>

          {/* Shopping & Cart */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ShoppingCart className="h-4 w-4 text-emerald-400" />
              <span>Picking Up Products & Trolley</span>
            </div>
            <p>
              Walk up to shelves containing iconic Indian products: <span className="text-amber-300 font-semibold">Maggi Noodles, Parle-G, Amul Milk, Dairy Milk, Aashirvaad Atta, Tata Salt, Fortune Oil, Lay's, and Coca-Cola</span>. When in range, press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-amber-300">E</kbd> or click <b>Pick Up</b>. Items physically fly into your shopping cart!
            </p>
          </div>

          {/* Checkout */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <CreditCard className="h-4 w-4 text-indigo-400" />
              <span>Billing Counter Checkout</span>
            </div>
            <p>
              Once your shopping is done, proceed to <b>Counter 1 or 2</b> near the entrance. Press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-amber-300">E</kbd> to place items on the conveyor belt. Watch the optical laser scanner beep items and pay via <b>UPI / QR Code, Cash, or Card</b> to receive an authentic Indian Tax Invoice bill!
            </p>
          </div>

          {/* Feature Badge */}
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-amber-300">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Bonus: Check Mom's Grocery List to complete your household shopping challenge!</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950 p-4 text-center">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-xs font-bold text-slate-950 shadow transition hover:brightness-110"
          >
            Got It! Start Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
