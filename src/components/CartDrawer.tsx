/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../types/game.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = subtotal >= 250 ? Math.round(subtotal * 0.1) : 0;
  const taxable = subtotal - discount;
  const cgst = Math.round(taxable * 0.025 * 100) / 100;
  const sgst = Math.round(taxable * 0.025 * 100) / 100;
  const grandTotal = Math.round(taxable + cgst + sgst);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex h-full w-full max-w-md flex-col bg-slate-900 border-l border-slate-800 shadow-2xl text-slate-100">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Your Shopping Cart</h2>
              <p className="text-xs text-slate-400">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in trolley
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free delivery or offer banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 px-6 py-2.5 border-b border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            {subtotal >= 250 ? 'Flat 10% Supermarket Discount Applied!' : `Add ₹${250 - subtotal} more for 10% OFF!`}
          </span>
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition"
            >
              Empty Cart
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-slate-500 mb-4">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <h3 className="text-base font-bold text-white">Your cart is empty</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">
                Walk through the supermarket aisles using W, A, S, D and approach shelves to pick up Maggi, Parle-G, Amul Milk, and more!
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-semibold text-emerald-400 hover:bg-slate-700 transition"
              >
                Continue Exploring Aisles
              </button>
            </div>
          ) : (
            cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-800/60 p-3.5 transition hover:border-slate-700"
              >
                {/* Product details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-sm border border-emerald-500 bg-white"
                      title="100% Vegetarian"
                    >
                      <span className="block m-auto mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    </span>
                    <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                      {product.brand}
                    </span>
                  </div>

                  <h4 className="mt-1 text-sm font-semibold text-white truncate">{product.name}</h4>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                    <span>{product.weight}</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-400">₹{product.price} each</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-2 py-1">
                  <button
                    onClick={() => onUpdateQty(product.id, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
                    title="Decrease Quantity"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-6 text-center text-xs font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => onUpdateQty(product.id, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
                    title="Increase Quantity"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Item Total & Remove */}
                <div className="text-right min-w-[70px]">
                  <div className="text-sm font-bold text-white">₹{product.price * quantity}</div>
                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="mt-1 text-[11px] text-slate-500 hover:text-rose-400 transition"
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5 inline" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Breakdown & Checkout Footer */}
        {cart.length > 0 && (
          <div className="border-t border-slate-800 bg-slate-950/80 p-6 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-medium text-slate-200">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Store Discount (10%)</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>CGST (2.5%)</span>
                <span>₹{cgst}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST (2.5%)</span>
                <span>₹{sgst}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-base font-extrabold text-white">
                <span>Total Amount</span>
                <span className="text-emerald-400">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-400 active:scale-98"
            >
              <span>Proceed to Billing Counter</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Express billing at Counter 1 & 2
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
