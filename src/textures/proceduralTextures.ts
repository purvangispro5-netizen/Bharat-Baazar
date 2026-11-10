/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Product } from '../types/game.ts';

// Cache generated textures so we don't recreate canvases repeatedly
const textureCache = new Map<string, THREE.CanvasTexture>();

function setupCanvasTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Supermarket Floor: Polished supermarket tiles with subtle speckled marble pattern & grout lines
 */
export function getFloorTexture(): THREE.CanvasTexture {
  const key = 'floor-tile';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Tile background (warm off-white/pearl)
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, size, size);

  // 4x4 Grid of tiles
  const tiles = 4;
  const tileSize = size / tiles;

  for (let x = 0; x < tiles; x++) {
    for (let y = 0; y < tiles; y++) {
      const tx = x * tileSize;
      const ty = y * tileSize;

      // Subtle marble/granite speckling
      const brightness = 240 + Math.sin(x * 12 + y * 8) * 6;
      ctx.fillStyle = `rgb(${brightness}, ${brightness - 2}, ${brightness - 5})`;
      ctx.fillRect(tx + 2, ty + 2, tileSize - 4, tileSize - 4);

      // Fine flecks
      for (let i = 0; i < 35; i++) {
        const fx = tx + Math.random() * (tileSize - 6);
        const fy = ty + Math.random() * (tileSize - 6);
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(210, 215, 220, 0.4)' : 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(fx, fy, 1.5, 1.5);
      }

      // Subtle diagonal sheen line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx + 5, ty + tileSize - 5);
      ctx.lineTo(tx + tileSize - 5, ty + 5);
      ctx.stroke();
    }
  }

  // Grout lines
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 3;
  for (let i = 0; i <= tiles; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tileSize, 0);
    ctx.lineTo(i * tileSize, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * tileSize);
    ctx.lineTo(size, i * tileSize);
    ctx.stroke();
  }

  const texture = setupCanvasTexture(canvas);
  texture.repeat.set(10, 10);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Supermarket Ceiling Texture with LED troffer lights
 */
export function getCeilingTexture(): THREE.CanvasTexture {
  const key = 'ceiling-grid';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, size, size);

  // Acoustic panels
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  const step = 128;
  for (let x = 0; x < size; x += step) {
    for (let y = 0; y < size; y += step) {
      ctx.strokeRect(x, y, step, step);

      // Recessed fluorescent / LED panel in center
      if ((x + y) % (step * 2) === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 16, y + 24, step - 32, step - 48);
        ctx.strokeStyle = '#cbd5e1';
        ctx.strokeRect(x + 16, y + 24, step - 32, step - 48);
      }
    }
  }

  const texture = setupCanvasTexture(canvas);
  texture.repeat.set(8, 8);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Aisle Overhead Hanging Sign
 */
export function createAisleBannerTexture(
  aisleNumber: number,
  englishName: string,
  hindiName: string,
  primaryColor: string
): THREE.CanvasTexture {
  const key = `aisle-${aisleNumber}-${englishName}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 360);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(0.5, '#1e293b');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 360);

  // Outer border with gold accent
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 1008, 344);

  // Left circle badge: Aisle number
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.arc(140, 180, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AISLE / रास्ता', 140, 140);

  ctx.font = 'bold 84px system-ui, sans-serif';
  ctx.fillText(`${aisleNumber}`, 140, 215);

  // Right text content: English & Hindi category titles
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.fillText(englishName, 280, 160);

  ctx.fillStyle = '#fbbf24';
  ctx.font = '500 44px system-ui, sans-serif';
  ctx.fillText(hindiName, 280, 235);

  // Decorative supermarket bottom bar
  ctx.fillStyle = primaryColor;
  ctx.fillRect(280, 265, 680, 8);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText('BHARAT SUPER BAZAAR • QUALITY GUARANTEED', 280, 305);

  const texture = setupCanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Supermarket Wall Banners (Offers, Indian Branding)
 */
export function createWallPosterTexture(type: 'welcome' | 'offers' | 'digital' | 'organic'): THREE.CanvasTexture {
  const key = `poster-${type}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d')!;

  if (type === 'welcome') {
    // Saffron and Green Indian Welcome Banner
    const grad = ctx.createLinearGradient(0, 0, 800, 600);
    grad.addColorStop(0, '#ea580c');
    grad.addColorStop(0.5, '#ffffff');
    grad.addColorStop(1, '#16a34a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(40, 40, 720, 520);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.fillText('॥ शुभ लाभ ॥', 400, 110);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 62px system-ui, sans-serif';
    ctx.fillText('BHARAT BAZAAR', 400, 200);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 44px system-ui, sans-serif';
    ctx.fillText('भारत सुपर बाज़ार', 400, 270);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '400 28px system-ui, sans-serif';
    ctx.fillText('Fresh Groceries • Honest Prices • Indian Pride', 400, 340);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.fillText('✓ 100% Vegetarian Certified Staples', 400, 410);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText('Apna Kirana, Modern Style!', 400, 480);
  } else if (type === 'offers') {
    // Festive Dhamaka Offers
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(0, 0, 800, 600);

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 760, 560);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#facc15';
    ctx.font = '900 64px system-ui, sans-serif';
    ctx.fillText('FESTIVE DHAMAKA', 400, 130);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px system-ui, sans-serif';
    ctx.fillText('FLAT 20% to 50% OFF!', 400, 220);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.fillText('On Atta, Dal, Edible Oil & Snacks', 400, 300);

    ctx.fillStyle = '#ffffff';
    ctx.font = '28px system-ui, sans-serif';
    ctx.fillText('Buy 1 Get 1 Free on Select Biscuits', 400, 370);

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(150, 430, 500, 70);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.fillText('BEST PRICE GUARANTEE', 400, 478);
  } else if (type === 'digital') {
    // UPI & Digital Payment Banner
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 800, 600);

    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(20, 20, 760, 560);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 44px system-ui, sans-serif';
    ctx.fillText('DIGITAL INDIA PAYMENTS', 400, 110);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px system-ui, sans-serif';
    ctx.fillText('Scan & Pay with UPI', 400, 190);

    // Draw stylized QR symbol
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(320, 240, 160, 160);
    ctx.fillStyle = '#000000';
    ctx.fillRect(335, 255, 45, 45);
    ctx.fillRect(420, 255, 45, 45);
    ctx.fillRect(335, 340, 45, 45);
    ctx.fillRect(390, 310, 30, 30);
    ctx.fillRect(435, 340, 30, 30);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText('Google Pay • PhonePe • Paytm • BHIM', 400, 460);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('No extra transaction charges on Cards & UPI', 400, 510);
  } else {
    // Fresh organic vegetables / daily staples
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, 800, 600);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 56px system-ui, sans-serif';
    ctx.fillText('FARM FRESH DIRECT', 400, 140);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px system-ui, sans-serif';
    ctx.fillText('Supporting Indian Farmers 🇮🇳', 400, 230);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '30px system-ui, sans-serif';
    ctx.fillText('Unadulterated Chakki Fresh Quality', 400, 320);
    ctx.fillText('Laboratory Tested Purity & Hygiene', 400, 380);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.fillText('100% Satisfaction or Money Back', 400, 480);
  }

  const texture = setupCanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Creates high resolution procedural texture for individual Indian grocery products
 */
export function createProductTexture(product: Product): THREE.CanvasTexture {
  const key = `prod-tex-${product.id}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Background color
  ctx.fillStyle = product.colorTheme.primary;
  ctx.fillRect(0, 0, 512, 512);

  // Distinct branded art per item
  switch (product.id) {
    case 'maggi-noodles': {
      // Classic Maggi Yellow with Red Header Banner
      ctx.fillStyle = '#dc2626'; // Maggi Red
      ctx.fillRect(0, 0, 512, 140);

      // Yellow curved oval badge for MAGGI
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(256, 70, 160, 50, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#dc2626';
      ctx.font = '900 64px "Arial Black", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Maggi', 256, 88);

      // 2-MINUTE NOODLES
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px system-ui, sans-serif';
      ctx.fillText('2-MINUTE NOODLES', 256, 185);

      // MASALA
      ctx.fillStyle = '#7f1d1d';
      ctx.font = '900 52px system-ui, sans-serif';
      ctx.fillText('MASALA', 256, 245);

      // Steaming bowl illustration
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(256, 350, 100, 0, Math.PI);
      ctx.fill();

      // Golden noodles strands
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 5;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(220 + i * 10, 335, 15, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Veg green square
      drawVegSymbol(ctx, 430, 420);

      // Price Tag
      drawPriceTag(ctx, `₹${product.price}`, 50, 420);
      break;
    }

    case 'parle-g': {
      // Warm yellow/cream background
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(0, 0, 512, 512);

      // Red Parle stripe
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 40, 512, 110);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 68px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Parle-G', 256, 120);

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 32px system-ui, sans-serif';
      ctx.fillText('ORIGINAL GLUCO BISCUITS', 256, 195);

      // Iconic Parle girl caricature portrait
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(256, 310, 85, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Girl face & hair
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(256, 290, 40, 0, Math.PI, true);
      ctx.fill();
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(256, 305, 35, 0, Math.PI * 2);
      ctx.fill();

      // Eyes & smile
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(245, 300, 4, 0, Math.PI * 2);
      ctx.arc(267, 300, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(256, 312, 12, 0, Math.PI);
      ctx.stroke();

      // Red frock dress
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(230, 350);
      ctx.lineTo(282, 350);
      ctx.lineTo(295, 390);
      ctx.lineTo(217, 390);
      ctx.closePath();
      ctx.fill();

      drawVegSymbol(ctx, 430, 430);
      drawPriceTag(ctx, `₹${product.price}`, 50, 430);
      break;
    }

    case 'amul-milk': {
      // Sky blue and white carton
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, 512, 512);

      // White bottom curve
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(256, 420, 300, 160, 0, 0, Math.PI * 2);
      ctx.fill();

      // Amul Red Logo
      ctx.fillStyle = '#dc2626';
      ctx.font = '900 78px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Amul', 256, 120);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px system-ui, sans-serif';
      ctx.fillText('Taaza', 256, 185);

      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillText('HOMOGENISED TONED MILK', 256, 340);

      ctx.fillStyle = '#64748b';
      ctx.font = '22px system-ui, sans-serif';
      ctx.fillText('Net Content: 500 ml', 256, 380);

      // Cow graphic
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText('The Taste of India 🇮🇳', 256, 240);

      drawVegSymbol(ctx, 430, 430);
      drawPriceTag(ctx, `₹${product.price}`, 50, 430);
      break;
    }

    case 'dairy-milk': {
      // Cadbury Regal Purple
      ctx.fillStyle = '#4c1d95';
      ctx.fillRect(0, 0, 512, 512);

      // Gold diagonal gloss lines
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(-100, 100);
      ctx.lineTo(600, 400);
      ctx.stroke();

      // Cadbury cursive script style
      ctx.fillStyle = '#fde047';
      ctx.font = 'italic bold 44px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Cadbury', 256, 110);

      // Dairy Milk block
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 58px system-ui, sans-serif';
      ctx.fillText('Dairy Milk', 256, 180);

      // Silk badge
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'italic 900 68px Georgia, serif';
      ctx.fillText('Silk', 256, 260);

      // Two glasses pouring milk graphic
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px system-ui, sans-serif';
      ctx.fillText('Pure Creamy Indulgence', 256, 330);

      drawVegSymbol(ctx, 430, 430);
      drawPriceTag(ctx, `₹${product.price}`, 50, 430);
      break;
    }

    case 'good-day': {
      // Golden yellow butter biscuit
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, 0, 512, 512);

      // Britannia banner
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 30, 512, 70);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BRITANNIA', 256, 82);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 68px system-ui, sans-serif';
      ctx.fillText('Good Day', 256, 185);

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 36px system-ui, sans-serif';
      ctx.fillText('BUTTER COOKIES', 256, 240);

      // Smiling cookie graphic
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(256, 340, 75, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Cookie smile ridges
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 4;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(256, 320 + i * 12, 35 - i * 4, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
      }

      drawVegSymbol(ctx, 430, 430);
      drawPriceTag(ctx, `₹${product.price}`, 50, 430);
      break;
    }

    case 'aashirvaad-atta': {
      // Red and gold Indian sack
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(0, 0, 512, 512);

      // Gold center oval
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.ellipse(256, 256, 210, 220, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 8;
      ctx.stroke();

      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 32px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ITC', 256, 120);

      ctx.font = '900 50px system-ui, sans-serif';
      ctx.fillText('AASHIRVAAD', 256, 180);

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 44px system-ui, sans-serif';
      ctx.fillText('SHUDH CHAKKI ATTA', 256, 240);

      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 28px system-ui, sans-serif';
      ctx.fillText('100% Whole Wheat Flour', 256, 290);

      ctx.fillStyle = '#991b1b';
      ctx.font = 'bold 34px system-ui, sans-serif';
      ctx.fillText('5 kg Net', 256, 350);

      drawVegSymbol(ctx, 410, 420);
      drawPriceTag(ctx, `₹${product.price}`, 50, 420);
      break;
    }

    case 'tata-salt': {
      // Tata Salt royal blue & crisp white
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(0, 0, 512, 512);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(30, 30, 452, 452);

      ctx.fillStyle = '#1e3a8a';
      ctx.font = '900 60px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TATA', 256, 120);

      ctx.fillStyle = '#dc2626';
      ctx.font = '900 70px system-ui, sans-serif';
      ctx.fillText('SALT', 256, 195);

      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 34px system-ui, sans-serif';
      ctx.fillText('DESH KA NAMAK', 256, 260);

      ctx.fillStyle = '#475569';
      ctx.font = '24px system-ui, sans-serif';
      ctx.fillText('Vacuum Evaporated Iodised Salt', 256, 310);
      ctx.fillText('1 kg Pack', 256, 350);

      drawVegSymbol(ctx, 420, 420);
      drawPriceTag(ctx, `₹${product.price}`, 50, 420);
      break;
    }

    case 'fortune-oil': {
      // Golden yellow sunflower bottle
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(0, 0, 512, 512);

      ctx.fillStyle = '#fef08a';
      ctx.fillRect(40, 80, 432, 350);

      ctx.fillStyle = '#b45309';
      ctx.font = '900 58px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('fortune', 256, 160);

      ctx.fillStyle = '#e11d48';
      ctx.font = '900 48px system-ui, sans-serif';
      ctx.fillText('SUNLITE', 256, 225);

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 28px system-ui, sans-serif';
      ctx.fillText('Refined Sunflower Oil', 256, 280);
      ctx.fillText('Enriched with Vit A & D', 256, 320);

      drawVegSymbol(ctx, 420, 410);
      drawPriceTag(ctx, `₹${product.price}`, 50, 410);
      break;
    }

    case 'lays-chips': {
      // Blue India's Magic Masala
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, 512, 512);

      // Yellow Lays Sun Logo
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(256, 180, 85, 0, Math.PI * 2);
      ctx.fill();

      // Red ribbon
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(100, 155, 312, 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 900 54px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("Lay's", 256, 198);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 36px system-ui, sans-serif';
      ctx.fillText("INDIA'S MAGIC MASALA", 256, 305);

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText('Spicy & Tangy Potato Chips', 256, 350);

      drawVegSymbol(ctx, 430, 430);
      drawPriceTag(ctx, `₹${product.price}`, 50, 430);
      break;
    }

    case 'coca-cola': {
      // Iconic Crimson Red
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 0, 512, 512);

      // White contour ribbon
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(0, 360);
      ctx.bezierCurveTo(150, 320, 300, 400, 512, 330);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 900 68px "Times New Roman", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Coca-Cola', 256, 210);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px system-ui, sans-serif';
      ctx.fillText('ORIGINAL TASTE', 256, 280);

      drawVegSymbol(ctx, 430, 430);
      drawPriceTag(ctx, `₹${product.price}`, 50, 430);
      break;
    }

    case 'frooti-mango': {
      // Sunny Mango Orange
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, 0, 512, 512);

      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 50, 512, 60);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 78px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Frooti', 256, 190);

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 36px system-ui, sans-serif';
      ctx.fillText('FRESH \'N\' JUICY', 256, 250);

      ctx.fillStyle = '#15803d';
      ctx.font = 'bold 32px system-ui, sans-serif';
      ctx.fillText('MANGO DRINK', 256, 305);

      drawVegSymbol(ctx, 430, 430);
      drawPriceTag(ctx, `₹${product.price}`, 50, 430);
      break;
    }

    case 'amul-butter': {
      // Yellow with red polka dots
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(0, 0, 512, 512);

      // Polka dots
      ctx.fillStyle = '#f87171';
      for (let x = 30; x < 512; x += 80) {
        for (let y = 30; y < 512; y += 80) {
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillStyle = '#dc2626';
      ctx.font = '900 68px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Amul', 256, 150);

      ctx.fillStyle = '#1e3a8a';
      ctx.font = '900 60px system-ui, sans-serif';
      ctx.fillText('BUTTER', 256, 220);

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 28px system-ui, sans-serif';
      ctx.fillText('Utterly Butterly Delicious!', 256, 280);

      drawVegSymbol(ctx, 430, 430);
      drawPriceTag(ctx, `₹${product.price}`, 50, 430);
      break;
    }

    default: {
      // Generic branded pack
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(product.name, 256, 200);
      drawPriceTag(ctx, `₹${product.price}`, 50, 430);
      break;
    }
  }

  const texture = setupCanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Standard Indian Green Veg Symbol
 */
function drawVegSymbol(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 4;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 22, y - 22, 44, 44);
  ctx.strokeRect(x - 22, y - 22, 44, 44);

  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Supermarket price badge
 */
function drawPriceTag(ctx: CanvasRenderingContext2D, priceStr: string, x: number, y: number) {
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.roundRect(x, y - 25, 120, 50, 10);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(priceStr, x + 60, y + 10);
}

/**
 * Texture for checkout counter screen (POS Cash Register display)
 */
export function createPOSScreenTexture(): THREE.CanvasTexture {
  const key = 'pos-screen';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 384);

  // POS Header
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, 512, 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px monospace';
  ctx.fillText('BHARAT BAZAAR POS • COUNTER 01', 20, 40);

  // Item lines
  ctx.fillStyle = '#22c55e';
  ctx.font = '20px monospace';
  ctx.fillText('READY TO SCAN ITEMS...', 20, 110);

  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Awaiting Barcode Input [LASER READY]', 20, 150);

  // Status bottom bar
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 300, 512, 84);
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 32px monospace';
  ctx.fillText('TOTAL: ₹0.00', 20, 350);

  const texture = setupCanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Texture for UPI QR code stand at checkout counter
 */
export function createUPIStandTexture(): THREE.CanvasTexture {
  const key = 'upi-stand';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 340;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 340);

  // UPI Header Bar
  ctx.fillStyle = '#0070ba';
  ctx.fillRect(0, 0, 256, 55);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SCAN & PAY HERE', 128, 35);

  // QR Code Box
  ctx.fillStyle = '#000000';
  ctx.fillRect(38, 75, 180, 180);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(44, 81, 168, 168);

  // QR Pattern
  ctx.fillStyle = '#000000';
  // Top-left finder
  ctx.fillRect(54, 91, 40, 40);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(62, 99, 24, 24);
  ctx.fillStyle = '#000000';
  ctx.fillRect(70, 107, 8, 8);

  // Top-right finder
  ctx.fillRect(162, 91, 40, 40);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(170, 99, 24, 24);
  ctx.fillStyle = '#000000';
  ctx.fillRect(178, 107, 8, 8);

  // Bottom-left finder
  ctx.fillRect(54, 199, 40, 40);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(62, 207, 24, 24);
  ctx.fillStyle = '#000000';
  ctx.fillRect(70, 215, 8, 8);

  // Center logo
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(128, 165, 16, 0, Math.PI * 2);
  ctx.fill();

  // Bottom logos text
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText('BHIM UPI • GPay • PhonePe', 128, 290);
  ctx.fillStyle = '#16a34a';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText('All Bank Apps Accepted', 128, 315);

  const texture = setupCanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}
