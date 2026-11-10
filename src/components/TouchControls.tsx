/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Hand } from 'lucide-react';
import { PlayerController } from '../game/playerController.ts';

interface TouchControlsProps {
  controller: PlayerController | null;
  onInteract: () => void;
  canInteract: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ controller, onInteract, canInteract }) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const activeKeys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Detect touch capability or small screen
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768) {
      setIsTouchDevice(true);
    }
  }, []);

  if (!isTouchDevice || !controller) return null;

  const handleDirStart = (dir: 'up' | 'down' | 'left' | 'right') => {
    activeKeys.current[dir] = true;
    updateVirtualInput();
  };

  const handleDirEnd = (dir: 'up' | 'down' | 'left' | 'right') => {
    activeKeys.current[dir] = false;
    updateVirtualInput();
  };

  const updateVirtualInput = () => {
    if (!controller) return;
    let x = 0;
    let z = 0;
    if (activeKeys.current['up']) z -= 1;
    if (activeKeys.current['down']) z += 1;
    if (activeKeys.current['left']) x -= 1;
    if (activeKeys.current['right']) x += 1;

    controller.virtualInput.moveX = x;
    controller.virtualInput.moveZ = z;
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none">
      {/* Virtual D-pad on bottom left */}
      <div className="pointer-events-auto absolute bottom-24 left-4 flex flex-col items-center gap-1.5 opacity-80 sm:opacity-60 transition-opacity hover:opacity-100">
        <button
          onTouchStart={() => handleDirStart('up')}
          onTouchEnd={() => handleDirEnd('up')}
          onMouseDown={() => handleDirStart('up')}
          onMouseUp={() => handleDirEnd('up')}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/90 text-white shadow-lg active:bg-amber-500 active:text-slate-950"
        >
          <ArrowUp className="h-5 w-5" />
        </button>

        <div className="flex gap-1.5">
          <button
            onTouchStart={() => handleDirStart('left')}
            onTouchEnd={() => handleDirEnd('left')}
            onMouseDown={() => handleDirStart('left')}
            onMouseUp={() => handleDirEnd('left')}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/90 text-white shadow-lg active:bg-amber-500 active:text-slate-950"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onTouchStart={() => handleDirStart('down')}
            onTouchEnd={() => handleDirEnd('down')}
            onMouseDown={() => handleDirStart('down')}
            onMouseUp={() => handleDirEnd('down')}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/90 text-white shadow-lg active:bg-amber-500 active:text-slate-950"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
          <button
            onTouchStart={() => handleDirStart('right')}
            onTouchEnd={() => handleDirEnd('right')}
            onMouseDown={() => handleDirStart('right')}
            onMouseUp={() => handleDirEnd('right')}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/90 text-white shadow-lg active:bg-amber-500 active:text-slate-950"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Floating Action Button on bottom right */}
      <div className="pointer-events-auto absolute bottom-24 right-4 flex flex-col items-center gap-2">
        <button
          onClick={onInteract}
          disabled={!canInteract}
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-white shadow-xl transition active:scale-90 ${
            canInteract
              ? 'border-amber-400 bg-amber-500 text-slate-950 font-black shadow-amber-500/30'
              : 'border-slate-800 bg-slate-900/80 text-slate-500 opacity-60'
          }`}
        >
          <Hand className="h-6 w-6" />
        </button>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interact</span>
      </div>
    </div>
  );
};
