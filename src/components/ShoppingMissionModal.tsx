/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, CheckCircle2, Circle, MapPin, Sparkles } from 'lucide-react';
import { ShoppingMissionItem, CartItem, INDIAN_PRODUCTS } from '../types/game.ts';

interface ShoppingMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: ShoppingMissionItem[];
  cart: CartItem[];
  onTeleportToAisle: (aisleNumber: number) => void;
}

export const ShoppingMissionModal: React.FC<ShoppingMissionModalProps> = ({
  isOpen,
  onClose,
  mission,
  cart,
  onTeleportToAisle,
}) => {
  if (!isOpen) return null;

  const completedCount = mission.filter((m) => {
    const item = cart.find((c) => c.product.id === m.productId);
    return item && item.quantity >= m.requiredQty;
  }).length;

  const isAllComplete = completedCount === mission.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 font-bold">
              📝
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Mom's Kirana Grocery List</h2>
              <p className="text-xs text-amber-300/80">मम्मी की बाज़ार लिस्ट • Session Task Challenge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="border-b border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300">Shopping Goal Progress</span>
            <span className="font-bold text-amber-400">
              {completedCount} of {mission.length} items acquired
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${(completedCount / mission.length) * 100}%` }}
            />
          </div>
          {isAllComplete && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/15 p-2.5 text-xs text-emerald-300 font-medium">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Great job! All mission items gathered! Head to Billing Counter to pay!</span>
            </div>
          )}
        </div>

        {/* Item Checklist */}
        <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
          {mission.map((missionItem) => {
            const product = INDIAN_PRODUCTS.find((p) => p.id === missionItem.productId);
            if (!product) return null;

            const cartItem = cart.find((c) => c.product.id === missionItem.productId);
            const inCartQty = cartItem ? cartItem.quantity : 0;
            const isFinished = inCartQty >= missionItem.requiredQty;

            return (
              <div
                key={missionItem.productId}
                className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition ${
                  isFinished
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-slate-200'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isFinished ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isFinished ? 'line-through text-slate-400' : 'text-white'}`}>
                        {product.name}
                      </span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                        Need {missionItem.requiredQty}x
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 italic mt-0.5">"{missionItem.note}"</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <MapPin className="h-3 w-3 text-cyan-400" />
                      <span>{product.shelfLocation.sectionName} (Aisle {product.shelfLocation.aisle})</span>
                    </div>
                  </div>
                </div>

                {/* Teleport / Status button */}
                <div>
                  {!isFinished ? (
                    <button
                      onClick={() => {
                        onTeleportToAisle(product.shelfLocation.aisle);
                        onClose();
                      }}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-slate-700 hover:text-white transition"
                    >
                      Go to Aisle {product.shelfLocation.aisle}
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-lg">
                      Ready ({inCartQty})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950 p-4 text-center">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-slate-800 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
          >
            Close & Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
