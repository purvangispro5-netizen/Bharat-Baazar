/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Receipt,
  QrCode,
  CreditCard,
  Banknote,
  Printer,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { CartItem, BillReceipt } from '../types/game.ts';
import { soundManager } from '../audio/soundManager.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onCompleteShopping: () => void;
  onClearCart: () => void;
}

type CheckoutStep = 'scanning' | 'payment' | 'receipt';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  onCompleteShopping,
  onClearCart,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<CheckoutStep>('scanning');
  const [scannedIndex, setScannedIndex] = useState<number>(0);
  const [selectedPayment, setSelectedPayment] = useState<'UPI' | 'CASH' | 'CARD'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<BillReceipt | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = subtotal >= 250 ? Math.round(subtotal * 0.1) : 0;
  const taxable = subtotal - discount;
  const cgst = Math.round(taxable * 0.025 * 100) / 100;
  const sgst = Math.round(taxable * 0.025 * 100) / 100;
  const grandTotal = Math.round(taxable + cgst + sgst);

  // Auto-progress item scanning on conveyor belt
  useEffect(() => {
    if (step === 'scanning') {
      if (scannedIndex < cart.length) {
        const timer = setTimeout(() => {
          soundManager.playScannerBeep();
          setScannedIndex((prev) => prev + 1);
        }, 750);
        return () => clearTimeout(timer);
      } else {
        // All items scanned, ring cash register
        const timer = setTimeout(() => {
          soundManager.playRegisterChime();
          setStep('payment');
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [step, scannedIndex, cart.length]);

  const handleConfirmPayment = () => {
    setIsProcessingPayment(true);
    // Simulate real-time payment gateway latency
    setTimeout(() => {
      const now = new Date();
      const newReceipt: BillReceipt = {
        invoiceNumber: `INV-BB-${Math.floor(100000 + Math.random() * 900000)}`,
        dateTime: `${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
        items: cart.map((item) => ({
          name: item.product.name,
          brand: item.product.brand,
          qty: item.quantity,
          rate: item.product.price,
          gstRate: 5,
          total: item.product.price * item.quantity,
        })),
        subtotal,
        cgst,
        sgst,
        discount,
        grandTotal,
        paymentMode: selectedPayment,
        upiRefNumber: selectedPayment === 'UPI' ? `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}` : undefined,
      };

      setReceipt(newReceipt);
      setIsProcessingPayment(false);
      setStep('receipt');
      soundManager.playSuccessJingle();

      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444'],
        });
      } catch {
        // Fallback gracefully
      }
    }, 1400);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleFinishAndReset = () => {
    onClearCart();
    onCompleteShopping();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Step Indicator Top Bar */}
        <div className="border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                POS
              </span>
              <h2 className="text-base font-bold text-white">Express Billing Counter 01</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className={step === 'scanning' ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                1. Scanning
              </span>
              <span className="text-slate-700">→</span>
              <span className={step === 'payment' ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                2. Payment
              </span>
              <span className="text-slate-700">→</span>
              <span className={step === 'receipt' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                3. Invoice
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: CONVEYOR BELT SCANNING */}
          {step === 'scanning' && (
            <div className="space-y-6 text-center py-4">
              <div className="relative mx-auto flex h-32 w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 p-4 shadow-inner">
                {/* Red Laser Barcode Scanner Beam */}
                <div className="absolute top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse" />

                {/* Conveyor Belt Stripes */}
                <div className="absolute bottom-2 left-0 right-0 h-4 bg-slate-800 flex items-center justify-around opacity-60">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-full w-2 bg-slate-900 -skew-x-12" />
                  ))}
                </div>

                {/* Currently Scanning Item */}
                {cart[scannedIndex] ? (
                  <div className="relative z-10 flex flex-col items-center animate-in zoom-in-75 duration-200">
                    <div className="rounded-xl bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-300">
                      SCANNING ITEM {scannedIndex + 1} OF {cart.length}
                    </div>
                    <div className="mt-2 text-lg font-bold text-white">
                      {cart[scannedIndex].product.name}
                    </div>
                    <div className="text-sm font-extrabold text-emerald-400">
                      ₹{cart[scannedIndex].product.price} × {cart[scannedIndex].quantity} = ₹
                      {cart[scannedIndex].product.price * cart[scannedIndex].quantity}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> All items scanned! Preparing bill...
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="mx-auto max-w-md space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${(scannedIndex / cart.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Conveyor belt running • Automated optical laser scanning active
                </p>
              </div>

              {/* Scanned Items Summary Mini-table */}
              <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-800/40 p-3 text-left space-y-1.5 max-h-48 overflow-y-auto">
                {cart.slice(0, scannedIndex).map((item) => (
                  <div key={item.product.id} className="flex justify-between text-xs text-slate-300">
                    <span>
                      ✓ {item.product.name} ({item.quantity}x)
                    </span>
                    <span className="font-semibold text-white">₹{item.product.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          {step === 'payment' && (
            <div className="space-y-6 py-2">
              <div className="text-center">
                <h3 className="text-lg font-extrabold text-white">Select Payment Mode</h3>
                <p className="text-xs text-slate-400">Total Payable: ₹{grandTotal} (Incl. of GST)</p>
              </div>

              {/* Payment Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* UPI Option */}
                <button
                  type="button"
                  onClick={() => setSelectedPayment('UPI')}
                  className={`flex flex-col items-center rounded-2xl border p-4 text-center transition ${
                    selectedPayment === 'UPI'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 mb-2">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold text-white">Instant UPI / QR</span>
                  <span className="text-[11px] text-slate-400">GPay, PhonePe, Paytm</span>
                </button>

                {/* Cash Option */}
                <button
                  type="button"
                  onClick={() => setSelectedPayment('CASH')}
                  className={`flex flex-col items-center rounded-2xl border p-4 text-center transition ${
                    selectedPayment === 'CASH'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 mb-2">
                    <Banknote className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold text-white">Cash Tender</span>
                  <span className="text-[11px] text-slate-400">Pay at counter</span>
                </button>

                {/* Card Option */}
                <button
                  type="button"
                  onClick={() => setSelectedPayment('CARD')}
                  className={`flex flex-col items-center rounded-2xl border p-4 text-center transition ${
                    selectedPayment === 'CARD'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 mb-2">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold text-white">RuPay / Card</span>
                  <span className="text-[11px] text-slate-400">Tap / Chip POS</span>
                </button>
              </div>

              {/* Payment Preview Section */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                {selectedPayment === 'UPI' && (
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="h-28 w-28 rounded-xl bg-white p-2 shadow flex items-center justify-center">
                      <div className="h-24 w-24 bg-slate-950 rounded flex flex-col items-center justify-center text-cyan-400 text-[10px] font-mono leading-tight">
                        <QrCode className="h-14 w-14 text-white" />
                        <span>BHARAT BAZAAR</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white">Scan UPI QR to Pay ₹{grandTotal}</div>
                      <p className="text-xs text-slate-400">
                        Accepted: Google Pay, PhonePe, Paytm, BHIM, Navi, CRED, and any banking UPI app.
                      </p>
                      <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> 100% Encrypted & NPCI Verified
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment === 'CASH' && (
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between font-medium">
                      <span>Total Bill Amount:</span>
                      <span className="text-white font-bold">₹{grandTotal}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Cash Tendered:</span>
                      <span className="text-amber-400 font-bold">₹{Math.ceil(grandTotal / 100) * 100}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-1 font-bold text-emerald-400">
                      <span>Change Due:</span>
                      <span>₹{Math.ceil(grandTotal / 100) * 100 - grandTotal}</span>
                    </div>
                  </div>
                )}

                {selectedPayment === 'CARD' && (
                  <div className="space-y-2 text-xs text-slate-300">
                    <p className="text-slate-300">
                      Insert or Tap your RuPay, Visa, or Mastercard on the Pinelabs EDC machine.
                    </p>
                    <div className="rounded bg-slate-900 p-2 text-emerald-400 font-mono text-center">
                      CARD READER READY • WAITING FOR PIN
                    </div>
                  </div>
                )}
              </div>

              {/* Pay Now Button */}
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessingPayment}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 text-base font-extrabold text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-400 active:scale-98 disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    Authorizing Payment...
                  </span>
                ) : (
                  <>
                    <span>Complete Payment & Generate Invoice (₹{grandTotal})</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 3: FINAL INDIAN SUPERMARKET TAX INVOICE */}
          {step === 'receipt' && receipt && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-extrabold text-white">Payment Successful!</h3>
                <p className="text-xs text-slate-400">
                  Thank you for shopping at Bharat Super Bazaar! Phir Milenge!
                </p>
              </div>

              {/* Authentic Indian Kirana Supermarket Receipt Card */}
              <div className="receipt-paper mx-auto max-w-lg rounded-2xl bg-white p-5 text-slate-950 shadow-2xl font-mono text-xs border border-slate-200">
                {/* Store Header */}
                <div className="text-center border-b border-dashed border-slate-400 pb-3">
                  <h4 className="text-base font-extrabold tracking-tight">BHARAT SUPER BAZAAR</h4>
                  <p className="text-[10px] text-slate-600">Unit of Apna Kirana Hypermarkets Pvt. Ltd.</p>
                  <p className="text-[10px] text-slate-600">Sector 14, Main Market, New Delhi - 110001</p>
                  <p className="text-[10px] font-semibold text-slate-800">GSTIN: 27AABCB1234F1Z5</p>
                  <p className="text-[10px] font-bold mt-1 text-emerald-700">TAX INVOICE / CASH MEMO</p>
                </div>

                {/* Bill Meta */}
                <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>Invoice No:</span>
                    <span className="font-bold">{receipt.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date & Time:</span>
                    <span>{receipt.dateTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span>Ramesh K. (Counter 01)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Mode:</span>
                    <span className="font-bold text-emerald-800">{receipt.paymentMode}</span>
                  </div>
                  {receipt.upiRefNumber && (
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>Ref No:</span>
                      <span>{receipt.upiRefNumber}</span>
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div className="py-2.5 border-b border-dashed border-slate-400">
                  <div className="flex justify-between font-bold text-[10px] text-slate-600 pb-1">
                    <span className="w-1/2">ITEM NAME</span>
                    <span className="w-12 text-center">QTY</span>
                    <span className="w-14 text-right">RATE</span>
                    <span className="w-14 text-right">TOTAL</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {receipt.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] leading-tight">
                        <span className="w-1/2 truncate font-semibold">{item.name}</span>
                        <span className="w-12 text-center">{item.qty}</span>
                        <span className="w-14 text-right">₹{item.rate}</span>
                        <span className="w-14 text-right font-bold">₹{item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{receipt.subtotal}</span>
                  </div>
                  {receipt.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Special Discount (10%):</span>
                      <span>-₹{receipt.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>CGST (2.5%):</span>
                    <span>₹{receipt.cgst}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>SGST (2.5%):</span>
                    <span>₹{receipt.sgst}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold border-t border-slate-800 pt-1.5 mt-1">
                    <span>NET AMOUNT:</span>
                    <span className="text-emerald-800">₹{receipt.grandTotal}</span>
                  </div>
                </div>

                {/* Footer notes */}
                <div className="pt-3 text-center space-y-1 text-[10px] text-slate-600">
                  <p className="font-bold text-slate-800">SAVINGS TODAY: ₹{receipt.discount} (Enjoy your meal!)</p>
                  <p>*** SAVE NATURE, SAY NO TO PLASTIC BAGS ***</p>
                  <p>Goods once sold can be exchanged within 7 days with bill.</p>
                  <p className="font-semibold text-slate-900 mt-1">।। धन्यवाद - फिर मिलेंगे ।।</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="flex flex-1 w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Tax Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinishAndReset}
                  className="flex flex-1 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-xs font-bold text-slate-950 hover:brightness-110 transition shadow-lg shadow-emerald-500/20"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>New Grocery Run</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
