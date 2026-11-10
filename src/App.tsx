/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { setupSupermarketScene, SupermarketSceneContext } from './game/supermarketScene.ts';
import { PlayerController, PlayerFocus } from './game/playerController.ts';
import { Product, CartItem, ShoppingMissionItem, INITIAL_SHOPPING_MISSION } from './types/game.ts';
import { soundManager } from './audio/soundManager.ts';
import { HUD } from './components/HUD.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { ShoppingMissionModal } from './components/ShoppingMissionModal.tsx';
import { HelpModal } from './components/HelpModal.tsx';
import { ControlsDock } from './components/ControlsDock.tsx';
import { TouchControls } from './components/TouchControls.tsx';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneContextRef = useRef<SupermarketSceneContext | null>(null);
  const playerControllerRef = useRef<PlayerController | null>(null);

  // Game UI State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [focus, setFocus] = useState<PlayerFocus | null>(null);
  const [shoppingMission] = useState<ShoppingMissionItem[]>(INITIAL_SHOPPING_MISSION);
  const [playerPos, setPlayerPos] = useState<{ x: number; z: number }>({ x: 0, z: 8.8 });
  const [currentZone, setCurrentZone] = useState<string>('Supermarket Entrance');
  const [speedMode, setSpeedMode] = useState<'normal' | 'fast'>('normal');

  // Modals & Panels
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMissionOpen, setIsMissionOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Audio State
  const [isMuted, setIsMuted] = useState(false);
  const [isBgmActive, setIsBgmActive] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  // Update 3D Physical Shopping Cart Items when cart state changes
  useEffect(() => {
    if (sceneContextRef.current) {
      sceneContextRef.current.updateCartItems(cart);
    }
  }, [cart]);

  // Add product to cart logic
  const handleAddProduct = useCallback((product: Product, startPos?: THREE.Vector3) => {
    soundManager.playPickup();

    if (sceneContextRef.current && startPos) {
      sceneContextRef.current.animatePickupItem(product, startPos, () => {
        // Animation finished
      });
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    showToast(`✓ Picked up ${product.name} (₹${product.price})`);
  }, [showToast]);

  // Interaction dispatcher (Product pickup or Checkout trigger)
  const handleInteract = useCallback(() => {
    if (!focus) return;

    if (focus.type === 'product' && focus.product) {
      handleAddProduct(focus.product, focus.position);
    } else if (focus.type === 'checkout') {
      if (cart.length === 0) {
        showToast('Your cart is empty! Pick up some items before billing.');
      } else {
        setIsCheckoutOpen(true);
      }
    }
  }, [focus, cart.length, handleAddProduct, showToast]);

  // Initialize Three.js WebGL Scene & Player Loop
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const sceneCtx = setupSupermarketScene(canvasMountRef.current);
    sceneContextRef.current = sceneCtx;

    // Detect software WebGL as per skill
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const controller = new PlayerController({
      camera: sceneCtx.camera,
      collisionBoxes: sceneCtx.collisionBoxes,
      interactiveObjects: sceneCtx.interactiveObjects,
      cartGroup: sceneCtx.cartGroup,
      domElement: canvasMountRef.current,
      onFocusChange: (newFocus) => {
        setFocus(newFocus);
      },
      onInteract: () => {
        // Handled by latest handleInteract via ref or direct call
      },
    });
    playerControllerRef.current = controller;

    let frameId = 0;
    const clock = new THREE.Clock();

    // Paced loop on software WebGL as per skill
    function afterDraw(cb: () => void) {
      const gl = sceneCtx.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    let zoneUpdateTimer = 0;

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);

      controller.update(delta);

      // Pulse scanner laser if checkout is active
      if (sceneCtx.scannerLaserMesh) {
        sceneCtx.scannerLaserMesh.visible = Math.sin(performance.now() * 0.005) > 0.2;
      }

      sceneCtx.renderer.render(sceneCtx.scene, sceneCtx.camera);

      // Periodically update player position for minimap and current zone
      zoneUpdateTimer += delta;
      if (zoneUpdateTimer > 0.2) {
        zoneUpdateTimer = 0;
        const px = controller.position.x;
        const pz = controller.position.z;
        setPlayerPos({ x: px, z: pz });

        // Calculate supermarket zone description
        if (pz > 5.0 && pz < 8.0) {
          setCurrentZone('Billing & Checkout Counters');
        } else if (pz >= 8.0) {
          setCurrentZone('Supermarket Entrance / Carts');
        } else if (px < -5.5) {
          setCurrentZone('Aisle 1: Staples (Atta, Salt, Oil)');
        } else if (px >= -5.5 && px < 0) {
          setCurrentZone('Aisle 2: Snacks (Maggi, Parle-G, Lays)');
        } else if (px >= 0 && px < 5.5) {
          setCurrentZone('Aisle 3: Dairy (Amul Milk, Silk, Butter)');
        } else {
          setCurrentZone('Aisle 4: Beverages (Coca-Cola, Frooti)');
        }
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controller.dispose();
      sceneCtx.dispose();
    };
  }, []);

  // Update speed in controller
  const handleToggleSpeed = () => {
    if (!playerControllerRef.current) return;
    if (speedMode === 'normal') {
      playerControllerRef.current.moveSpeed = 5.2;
      setSpeedMode('fast');
      showToast('Fast Walk Mode Activated ⚡');
    } else {
      playerControllerRef.current.moveSpeed = 3.6;
      setSpeedMode('normal');
      showToast('Normal Walk Mode');
    }
  };

  // Teleport helper
  const handleTeleport = (location: 'entrance' | 'aisle1' | 'aisle2' | 'aisle3' | 'aisle4' | 'checkout') => {
    if (!playerControllerRef.current) return;
    soundManager.playFootstep();

    switch (location) {
      case 'entrance':
        playerControllerRef.current.teleport(0, 8.8, 0);
        showToast('Teleported to Supermarket Entrance');
        break;
      case 'aisle1':
        playerControllerRef.current.teleport(-6.5, 0, 0);
        showToast('Teleported to Aisle 1: Groceries & Staples');
        break;
      case 'aisle2':
        playerControllerRef.current.teleport(-1.2, 0, 0);
        showToast('Teleported to Aisle 2: Maggi & Biscuits');
        break;
      case 'aisle3':
        playerControllerRef.current.teleport(4.5, 0, 0);
        showToast('Teleported to Aisle 3: Dairy & Chocolates');
        break;
      case 'aisle4':
        playerControllerRef.current.teleport(9.8, 0, 0);
        showToast('Teleported to Aisle 4: Beverages & Juices');
        break;
      case 'checkout':
        playerControllerRef.current.teleport(-2.5, 7.8, Math.PI);
        showToast('Arrived at Billing Counter 01');
        break;
    }
  };

  // Audio toggles
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
    showToast(nextMuted ? 'Audio Muted' : 'Audio Unmuted');
  };

  const handleToggleBGM = () => {
    const active = soundManager.toggleBGM();
    setIsBgmActive(active);
    showToast(active ? 'Playing Supermarket Music 🎵' : 'Supermarket Music Paused');
  };

  // Cart operations
  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    soundManager.playDrop();
    showToast('Item removed from cart');
  };

  const handleClearCart = () => {
    setCart([]);
    soundManager.playDrop();
    showToast('Shopping cart emptied');
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Mount Container */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating HUD Overlays */}
      <HUD
        focus={focus}
        cart={cart}
        shoppingMission={shoppingMission}
        onInteract={handleInteract}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMission={() => setIsMissionOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isBgmActive={isBgmActive}
        onToggleBGM={handleToggleBGM}
        playerPos={playerPos}
      />

      {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion as per skill) */}
      <ControlsDock
        onTeleport={handleTeleport}
        speedMode={speedMode}
        onToggleSpeed={handleToggleSpeed}
        currentZone={currentZone}
      />

      {/* Mobile Touch Virtual Controls */}
      <TouchControls
        controller={playerControllerRef.current}
        onInteract={handleInteract}
        canInteract={!!focus}
      />

      {/* Slide-over Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          handleTeleport('checkout');
          setIsCheckoutOpen(true);
        }}
      />

      {/* Billing Counter & Invoice Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onClearCart={handleClearCart}
        onCompleteShopping={() => {
          handleTeleport('entrance');
          showToast('Thank you for shopping at Bharat Super Bazaar! Visit again!');
        }}
      />

      {/* Mom's Grocery Mission Checklist Modal */}
      <ShoppingMissionModal
        isOpen={isMissionOpen}
        onClose={() => setIsMissionOpen(false)}
        mission={shoppingMission}
        cart={cart}
        onTeleportToAisle={(aisle) => {
          if (aisle === 1) handleTeleport('aisle1');
          else if (aisle === 2) handleTeleport('aisle2');
          else if (aisle === 3) handleTeleport('aisle3');
          else if (aisle === 4) handleTeleport('aisle4');
        }}
      />

      {/* How to play / Instructions modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="pointer-events-none fixed top-16 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="rounded-2xl border border-amber-400/40 bg-slate-900/95 px-4 py-2 text-xs font-bold text-amber-300 shadow-2xl backdrop-blur-md">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
