/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Product, INDIAN_PRODUCTS, AISLE_SECTIONS } from '../types/game.ts';
import {
  getFloorTexture,
  getCeilingTexture,
  createAisleBannerTexture,
  createWallPosterTexture,
  createProductTexture,
  createPOSScreenTexture,
  createUPIStandTexture,
} from '../textures/proceduralTextures.ts';

export interface InteractiveObject {
  type: 'product' | 'checkout';
  product?: Product;
  mesh: THREE.Object3D;
  position: THREE.Vector3;
}

export interface SupermarketSceneContext {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  interactiveObjects: InteractiveObject[];
  collisionBoxes: THREE.Box3[];
  cartGroup: THREE.Group;
  cartItemsGroup: THREE.Group;
  updateCartItems: (cartItems: { product: Product; quantity: number }[]) => void;
  scannerLaserMesh: THREE.Mesh;
  animatePickupItem: (product: Product, startPos: THREE.Vector3, onComplete: () => void) => void;
  dispose: () => void;
}

// Pre-allocated vectors for math operations to prevent GC
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();

export function setupSupermarketScene(container: HTMLDivElement): SupermarketSceneContext {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  // 1. Detect software WebGL as per Three.js skill
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

  // 2. Renderer setup
  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);

  // 3. Scene & Camera
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0f172a');
  scene.fog = new THREE.FogExp2('#0f172a', 0.025);

  const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 80);
  camera.position.set(0, 1.65, 9.5); // Player starts near entrance facing aisles

  // 4. Room Environment for studio PBR reflections
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  pmremGenerator.dispose();

  // 5. Lighting Setup
  // Hemisphere light: cool sky, warm ground
  const hemiLight = new THREE.HemisphereLight('#fef08a', '#1e293b', 0.9);
  hemiLight.position.set(0, 10, 0);
  scene.add(hemiLight);

  // Directional key light with shadows
  const keyLight = new THREE.DirectionalLight('#ffffff', 1.4);
  keyLight.position.set(6, 12, 6);
  if (!isSoftwareGl) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    const d = 16;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
  }
  scene.add(keyLight);

  // Soft fill light
  const fillLight = new THREE.DirectionalLight('#93c5fd', 0.6);
  fillLight.position.set(-8, 10, -6);
  scene.add(fillLight);

  // Aisle strip lights along the ceiling
  for (let z = -6; z <= 6; z += 4) {
    const stripLight = new THREE.PointLight('#fef9c3', 0.5, 9, 1.5);
    stripLight.position.set(0, 4.2, z);
    scene.add(stripLight);
  }

  const collisionBoxes: THREE.Box3[] = [];
  const interactiveObjects: InteractiveObject[] = [];

  // 6. Supermarket Architecture Geometry
  // Floor: 24m wide x 22m long
  const floorTex = getFloorTexture();
  floorTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: 0.25,
    metalness: 0.1,
  });
  const floorGeo = new THREE.PlaneGeometry(24, 22);
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = !isSoftwareGl;
  scene.add(floorMesh);

  // Ceiling
  const ceilingTex = getCeilingTexture();
  const ceilingMat = new THREE.MeshStandardMaterial({
    map: ceilingTex,
    roughness: 0.8,
    metalness: 0.1,
  });
  const ceilingMesh = new THREE.Mesh(floorGeo, ceilingMat);
  ceilingMesh.rotation.x = Math.PI / 2;
  ceilingMesh.position.y = 4.8;
  scene.add(ceilingMesh);

  // Perimeter Walls (Back, Front, Left, Right)
  const wallMat = new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    roughness: 0.7,
    metalness: 0.05,
  });
  const wallDarkMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.6,
    metalness: 0.2,
  });

  // Back wall (Z = -11)
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 4.8, 0.4), wallMat);
  backWall.position.set(0, 2.4, -11);
  scene.add(backWall);
  collisionBoxes.push(new THREE.Box3().setFromObject(backWall));

  // Left wall (X = -12)
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.8, 22), wallMat);
  leftWall.position.set(-12, 2.4, 0);
  scene.add(leftWall);
  collisionBoxes.push(new THREE.Box3().setFromObject(leftWall));

  // Right wall (X = 12)
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.8, 22), wallMat);
  rightWall.position.set(12, 2.4, 0);
  scene.add(rightWall);
  collisionBoxes.push(new THREE.Box3().setFromObject(rightWall));

  // Front wall with entrance & exit openings (Z = 11)
  const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(7, 4.8, 0.4), wallDarkMat);
  frontWallLeft.position.set(-8.5, 2.4, 11);
  scene.add(frontWallLeft);
  collisionBoxes.push(new THREE.Box3().setFromObject(frontWallLeft));

  const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(7, 4.8, 0.4), wallDarkMat);
  frontWallRight.position.set(8.5, 2.4, 11);
  scene.add(frontWallRight);
  collisionBoxes.push(new THREE.Box3().setFromObject(frontWallRight));

  // Entrance turnstile / gate backstop
  const frontWallCenter = new THREE.Mesh(new THREE.BoxGeometry(2, 4.8, 0.4), wallDarkMat);
  frontWallCenter.position.set(0, 2.4, 11);
  scene.add(frontWallCenter);
  collisionBoxes.push(new THREE.Box3().setFromObject(frontWallCenter));

  // Boundary wall behind the entrance (preventing walking out into infinity)
  const boundaryBackstop = new THREE.Mesh(new THREE.BoxGeometry(24, 4.8, 0.4), wallDarkMat);
  boundaryBackstop.position.set(0, 2.4, 11.2);
  collisionBoxes.push(new THREE.Box3().setFromObject(boundaryBackstop));

  // Wall Posters (Indian Branding & Offers)
  const posterConfigs = [
    { type: 'welcome' as const, pos: new THREE.Vector3(0, 2.8, -10.75), rotY: 0, size: [5.2, 2.6] },
    { type: 'offers' as const, pos: new THREE.Vector3(-11.75, 2.8, -4), rotY: Math.PI / 2, size: [3.8, 2.2] },
    { type: 'digital' as const, pos: new THREE.Vector3(11.75, 2.8, -4), rotY: -Math.PI / 2, size: [3.8, 2.2] },
    { type: 'organic' as const, pos: new THREE.Vector3(-11.75, 2.8, 3), rotY: Math.PI / 2, size: [3.8, 2.2] },
  ];

  posterConfigs.forEach((cfg) => {
    const posterTex = createWallPosterTexture(cfg.type);
    const posterMat = new THREE.MeshStandardMaterial({
      map: posterTex,
      roughness: 0.3,
      metalness: 0.1,
    });
    const posterMesh = new THREE.Mesh(new THREE.PlaneGeometry(cfg.size[0], cfg.size[1]), posterMat);
    posterMesh.position.copy(cfg.pos);
    posterMesh.rotation.y = cfg.rotY;
    scene.add(posterMesh);
  });

  // 7. Gondola Shelves Construction
  // 4 Main Aisles: X coords = -8.2 (Aisle 1), -2.8 (Aisle 2), 2.8 (Aisle 3), 8.2 (Aisle 4)
  const aislePositions = [
    { aisleNumber: 1, x: -8.2 },
    { aisleNumber: 2, x: -2.8 },
    { aisleNumber: 3, x: 2.8 },
    { aisleNumber: 4, x: 8.2 },
  ];

  const shelfMetalMat = new THREE.MeshStandardMaterial({
    color: '#cbd5e1',
    roughness: 0.35,
    metalness: 0.7,
  });

  const shelfBaseMat = new THREE.MeshStandardMaterial({
    color: '#334155',
    roughness: 0.5,
    metalness: 0.5,
  });

  aislePositions.forEach((aisle) => {
    const aisleData = AISLE_SECTIONS.find((a) => a.aisleNumber === aisle.aisleNumber)!;
    const shelfLength = 9.0;
    const shelfDepth = 1.4;
    const shelfHeight = 2.4;
    const shelfZ = -0.5;

    // Gondola shelf group
    const gondola = new THREE.Group();
    gondola.position.set(aisle.x, 0, shelfZ);

    // Shelf base deck
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(shelfDepth, 0.25, shelfLength), shelfBaseMat);
    baseMesh.position.y = 0.125;
    baseMesh.castShadow = !isSoftwareGl;
    baseMesh.receiveShadow = !isSoftwareGl;
    gondola.add(baseMesh);

    // Center divider pegboard
    const centerDivider = new THREE.Mesh(new THREE.BoxGeometry(0.08, shelfHeight, shelfLength), shelfBaseMat);
    centerDivider.position.y = shelfHeight / 2;
    gondola.add(centerDivider);

    // Upright steel support posts
    for (let pz = -shelfLength / 2; pz <= shelfLength / 2; pz += 2.25) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, shelfHeight, 0.12), shelfMetalMat);
      post.position.set(0, shelfHeight / 2, pz);
      gondola.add(post);
    }

    // 3 Tiered horizontal shelves on each side (+X and -X)
    const shelfLevels = [0.55, 1.25, 1.95];
    const shelfEdgeMat = new THREE.MeshStandardMaterial({
      color: aisleData.color,
      roughness: 0.4,
      metalness: 0.3,
    });

    shelfLevels.forEach((sy) => {
      // Shelf trays (left and right)
      const trayLeft = new THREE.Mesh(new THREE.BoxGeometry(shelfDepth / 2 - 0.05, 0.04, shelfLength), shelfMetalMat);
      trayLeft.position.set(-shelfDepth / 4, sy, 0);
      trayLeft.castShadow = !isSoftwareGl;
      trayLeft.receiveShadow = !isSoftwareGl;
      gondola.add(trayLeft);

      const trayRight = new THREE.Mesh(new THREE.BoxGeometry(shelfDepth / 2 - 0.05, 0.04, shelfLength), shelfMetalMat);
      trayRight.position.set(shelfDepth / 4, sy, 0);
      trayRight.castShadow = !isSoftwareGl;
      trayRight.receiveShadow = !isSoftwareGl;
      gondola.add(trayRight);

      // Colored price tag edge rail
      const edgeLeft = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, shelfLength), shelfEdgeMat);
      edgeLeft.position.set(-shelfDepth / 2 + 0.02, sy - 0.01, 0);
      gondola.add(edgeLeft);

      const edgeRight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, shelfLength), shelfEdgeMat);
      edgeRight.position.set(shelfDepth / 2 - 0.02, sy - 0.01, 0);
      gondola.add(edgeRight);
    });

    // Hanging Aisle category sign
    const signTex = createAisleBannerTexture(aisle.aisleNumber, aisleData.name, aisleData.hindiName, aisleData.color);
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.2,
      metalness: 0.1,
    });
    const signMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 0.06), signMat);
    signMesh.position.set(0, 3.6, shelfLength / 2 + 0.2);
    gondola.add(signMesh);

    // Hanging chains from ceiling
    const chainMat = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.8, roughness: 0.2 });
    const chain1 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.8), chainMat);
    chain1.position.set(-0.9, 4.2, shelfLength / 2 + 0.2);
    gondola.add(chain1);
    const chain2 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.8), chainMat);
    chain2.position.set(0.9, 4.2, shelfLength / 2 + 0.2);
    gondola.add(chain2);

    scene.add(gondola);

    // Add shelf bounding box for collision detection
    const shelfBox = new THREE.Box3();
    shelfBox.setFromCenterAndSize(
      new THREE.Vector3(aisle.x, shelfHeight / 2, shelfZ),
      new THREE.Vector3(shelfDepth + 0.4, shelfHeight, shelfLength + 0.4)
    );
    collisionBoxes.push(shelfBox);
  });

  // 8. Place Products on the Shelves
  // Each product gets custom 3D composite geometry + procedural branding texture
  INDIAN_PRODUCTS.forEach((product) => {
    const tex = createProductTexture(product);
    const productMat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.4,
      metalness: 0.1,
    });

    const levelYMap = [0.65, 1.35, 2.05];
    const itemY = levelYMap[product.shelfLocation.shelfLevel] || 1.35;

    // Create 3 identical stock units lined up neatly side by side on the shelf
    for (let stockIdx = -1; stockIdx <= 1; stockIdx++) {
      const itemGroup = createProductModel(product, productMat);
      const posX = product.shelfLocation.positionX;
      const posZ = product.shelfLocation.positionZ + stockIdx * 0.42;

      itemGroup.position.set(posX, itemY, posZ);
      // Face outward towards aisle path
      itemGroup.rotation.y = posX < 0 ? Math.PI / 2 : -Math.PI / 2;

      itemGroup.userData = {
        productId: product.id,
        product,
        interactive: true,
      };

      scene.add(itemGroup);

      // Middle unit acts as main interactive proxy
      if (stockIdx === 0) {
        interactiveObjects.push({
          type: 'product',
          product,
          mesh: itemGroup,
          position: new THREE.Vector3(posX, itemY, posZ),
        });
      }
    }
  });

  // 9. Billing Counters & Checkout Lane
  // Placed at front of supermarket near exit (Z = 5.8)
  const counterGroup = new THREE.Group();
  counterGroup.position.set(-2.5, 0, 6.2);

  const counterBaseMat = new THREE.MeshStandardMaterial({
    color: '#0284c7', // Bright Indian supermarket blue
    roughness: 0.4,
    metalness: 0.2,
  });
  const counterTopMat = new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    roughness: 0.2,
    metalness: 0.3,
  });
  const conveyorBeltMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.8,
    metalness: 0.1,
  });

  // Main Counter L-shape body
  const counterBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.9, 1.2), counterBaseMat);
  counterBase.position.set(0, 0.45, 0);
  counterBase.castShadow = !isSoftwareGl;
  counterBase.receiveShadow = !isSoftwareGl;
  counterGroup.add(counterBase);

  // Countertop
  const counterTop = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.08, 1.3), counterTopMat);
  counterTop.position.set(0, 0.94, 0);
  counterGroup.add(counterTop);

  // Conveyor Belt
  const conveyorBelt = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 0.65), conveyorBeltMat);
  conveyorBelt.position.set(-0.6, 0.99, 0);
  counterGroup.add(conveyorBelt);

  // Barcode Scanner glass window
  const scannerWindowMat = new THREE.MeshStandardMaterial({
    color: '#dc2626',
    roughness: 0.1,
    metalness: 0.9,
    emissive: '#ef4444',
    emissiveIntensity: 0.6,
  });
  const scannerWindow = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.25), scannerWindowMat);
  scannerWindow.position.set(0.65, 0.99, 0);
  counterGroup.add(scannerWindow);

  // Laser beam mesh that pulses when scanning
  const laserMat = new THREE.MeshBasicMaterial({
    color: '#ff0000',
    transparent: true,
    opacity: 0.7,
  });
  const scannerLaserMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.12, 0.4, 8), laserMat);
  scannerLaserMesh.position.set(0.65, 1.15, 0);
  scannerLaserMesh.rotation.z = Math.PI;
  counterGroup.add(scannerLaserMesh);

  // Cash Register / POS Monitor
  const posMonitorGroup = new THREE.Group();
  posMonitorGroup.position.set(1.2, 0.98, -0.2);

  const posStand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 0.25),
    new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8, roughness: 0.3 })
  );
  posStand.position.y = 0.125;
  posMonitorGroup.add(posStand);

  const posScreenTex = createPOSScreenTexture();
  const posScreenMat = new THREE.MeshBasicMaterial({ map: posScreenTex });
  const posScreenMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.05), posScreenMat);
  posScreenMesh.position.set(0, 0.35, 0);
  posScreenMesh.rotation.y = -Math.PI / 4;
  posMonitorGroup.add(posScreenMesh);
  counterGroup.add(posMonitorGroup);

  // UPI QR Code Stand
  const upiTex = createUPIStandTexture();
  const upiStandMat = new THREE.MeshStandardMaterial({ map: upiTex, roughness: 0.2, metalness: 0.1 });
  const upiStand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.02), upiStandMat);
  upiStand.position.set(0.65, 1.12, 0.45);
  upiStand.rotation.y = -Math.PI / 12;
  counterGroup.add(upiStand);

  // Cashier attendant avatar
  const cashierGroup = createCashierAvatar();
  cashierGroup.position.set(0.65, 0, -0.75);
  counterGroup.add(cashierGroup);

  // Overhead Checkout Lane Sign: "COUNTER 1 - EXPRESS BILLING"
  const counterSignCanvas = document.createElement('canvas');
  counterSignCanvas.width = 512;
  counterSignCanvas.height = 180;
  const cctx = counterSignCanvas.getContext('2d')!;
  cctx.fillStyle = '#16a34a';
  cctx.fillRect(0, 0, 512, 180);
  cctx.strokeStyle = '#facc15';
  cctx.lineWidth = 6;
  cctx.strokeRect(6, 6, 500, 168);
  cctx.fillStyle = '#ffffff';
  cctx.textAlign = 'center';
  cctx.font = 'bold 36px system-ui, sans-serif';
  cctx.fillText('COUNTER 1 • BILLING', 256, 75);
  cctx.fillStyle = '#fef08a';
  cctx.font = 'bold 28px system-ui, sans-serif';
  cctx.fillText('नकद / UPI / कार्ड भुगतान', 256, 130);

  const counterSignTex = new THREE.CanvasTexture(counterSignCanvas);
  counterSignTex.colorSpace = THREE.SRGBColorSpace;
  const counterSign = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.7, 0.06),
    new THREE.MeshStandardMaterial({ map: counterSignTex, roughness: 0.2 })
  );
  counterSign.position.set(0, 3.2, 0);
  counterGroup.add(counterSign);

  scene.add(counterGroup);

  // Billing counter collision box
  const counterBox = new THREE.Box3();
  counterBox.setFromCenterAndSize(
    new THREE.Vector3(-2.5, 0.6, 6.2),
    new THREE.Vector3(4.2, 1.5, 1.8)
  );
  collisionBoxes.push(counterBox);

  // Register billing counter as interactive target
  interactiveObjects.push({
    type: 'checkout',
    mesh: counterGroup,
    position: new THREE.Vector3(-2.5, 1.0, 6.2),
  });

  // Second Express Billing Counter on the right side
  const counter2Group = counterGroup.clone(true);
  counter2Group.position.set(3.5, 0, 6.2);
  scene.add(counter2Group);

  const counter2Box = new THREE.Box3();
  counter2Box.setFromCenterAndSize(
    new THREE.Vector3(3.5, 0.6, 6.2),
    new THREE.Vector3(4.2, 1.5, 1.8)
  );
  collisionBoxes.push(counter2Box);

  interactiveObjects.push({
    type: 'checkout',
    mesh: counter2Group,
    position: new THREE.Vector3(3.5, 1.0, 6.2),
  });

  // 10. Procedural 3D Shopping Cart Model
  // Built as a composite 8-part procedural THREE.Group
  const cartGroup = new THREE.Group();
  const cartWireMat = new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    metalness: 0.9,
    roughness: 0.15,
  });
  const cartHandleMat = new THREE.MeshStandardMaterial({
    color: '#dc2626', // Iconic Indian supermarket red plastic handle
    roughness: 0.4,
    metalness: 0.1,
  });
  const wheelRubberMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.8,
    metalness: 0.2,
  });

  // Wire basket rim
  const rimMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.9), cartWireMat);
  rimMesh.position.y = 0.88;
  cartGroup.add(rimMesh);

  // Basket bottom
  const basketBottom = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.02, 0.75), cartWireMat);
  basketBottom.position.y = 0.48;
  cartGroup.add(basketBottom);

  // Basket wire walls (slanted sides)
  const basketSideL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.4, 0.82), cartWireMat);
  basketSideL.position.set(-0.31, 0.68, 0);
  basketSideL.rotation.z = -0.1;
  cartGroup.add(basketSideL);

  const basketSideR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.4, 0.82), cartWireMat);
  basketSideR.position.set(0.31, 0.68, 0);
  basketSideR.rotation.z = 0.1;
  cartGroup.add(basketSideR);

  const basketFront = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.4, 0.02), cartWireMat);
  basketFront.position.set(0, 0.68, -0.42);
  cartGroup.add(basketFront);

  const basketBack = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.4, 0.02), cartWireMat);
  basketBack.position.set(0, 0.68, 0.42);
  cartGroup.add(basketBack);

  // Red plastic push handle
  const handleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.62), cartHandleMat);
  handleMesh.rotation.z = Math.PI / 2;
  handleMesh.position.set(0, 0.94, 0.52);
  cartGroup.add(handleMesh);

  // Lower tubular frame chassis
  const chassisMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.8), cartWireMat);
  chassisMesh.position.y = 0.22;
  cartGroup.add(chassisMesh);

  // 4 Caster wheels with rubber tires
  const wheelOffsets = [
    [-0.24, -0.32],
    [0.24, -0.32],
    [-0.24, 0.32],
    [0.24, 0.32],
  ];
  wheelOffsets.forEach(([wx, wz]) => {
    const wheelFork = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12), cartWireMat);
    wheelFork.position.set(wx, 0.14, wz);
    cartGroup.add(wheelFork);

    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 12), wheelRubberMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, 0.06, wz);
    cartGroup.add(wheel);
  });

  // Container inside basket where picked product items will visually appear!
  const cartItemsGroup = new THREE.Group();
  cartItemsGroup.position.set(0, 0.52, 0);
  cartGroup.add(cartItemsGroup);

  scene.add(cartGroup);

  // Position cart in front of player initially
  cartGroup.position.set(0, 0, 8.5);

  // Helper to re-render physical 3D items inside the shopping cart
  const updateCartItems = (cartItems: { product: Product; quantity: number }[]) => {
    // Clear old items inside cart
    while (cartItemsGroup.children.length > 0) {
      cartItemsGroup.remove(cartItemsGroup.children[0]);
    }

    let itemCounter = 0;
    cartItems.forEach((cartItem) => {
      const tex = createProductTexture(cartItem.product);
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 });

      // Add miniature version for each quantity (capped at 4 per item to fit basket)
      const renderCount = Math.min(cartItem.quantity, 4);
      for (let i = 0; i < renderCount; i++) {
        const mini = createProductModel(cartItem.product, mat);
        mini.scale.set(0.65, 0.65, 0.65);

        // Arrange in a neat 2x3 grid inside basket
        const col = itemCounter % 3;
        const row = Math.floor(itemCounter / 3) % 2;
        const layer = Math.floor(itemCounter / 6);

        mini.position.set(
          (col - 1) * 0.18 + (Math.random() - 0.5) * 0.04,
          layer * 0.12,
          (row - 0.5) * 0.28 + (Math.random() - 0.5) * 0.04
        );
        mini.rotation.y = (Math.random() - 0.5) * 0.4;
        mini.rotation.z = (Math.random() - 0.5) * 0.1;

        cartItemsGroup.add(mini);
        itemCounter++;
      }
    });
  };

  // 11. Animated Pickup Arc
  const animatePickupItem = (product: Product, startPos: THREE.Vector3, onComplete: () => void) => {
    const tex = createProductTexture(product);
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 });
    const flyingMesh = createProductModel(product, mat);
    flyingMesh.position.copy(startPos);
    scene.add(flyingMesh);

    const startTime = performance.now();
    const duration = 500; // ms

    const targetPos = cartGroup.position.clone().add(new THREE.Vector3(0, 0.7, 0));

    const animFrame = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      // Arc interpolation with parabolic height
      _vec3A.copy(startPos).lerp(targetPos, ease);
      _vec3A.y += Math.sin(progress * Math.PI) * 0.6; // upward arc

      flyingMesh.position.copy(_vec3A);
      flyingMesh.rotation.y += 0.1;
      flyingMesh.rotation.x += 0.05;
      const s = 1 - ease * 0.35;
      flyingMesh.scale.set(s, s, s);

      if (progress < 1) {
        requestAnimationFrame(animFrame);
      } else {
        scene.remove(flyingMesh);
        onComplete();
      }
    };

    requestAnimationFrame(animFrame);
  };

  // Window resize handler
  const handleResize = () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);

  return {
    scene,
    renderer,
    camera,
    interactiveObjects,
    collisionBoxes,
    cartGroup,
    cartItemsGroup,
    updateCartItems,
    scannerLaserMesh,
    animatePickupItem,
    dispose: () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    },
  };
}

/**
 * Creates distinct 3D procedural models for different Indian supermarket items
 */
function createProductModel(product: Product, material: THREE.Material): THREE.Group {
  const group = new THREE.Group();

  switch (product.modelType) {
    case 'bottle': {
      // Cylindrical bottle with tapered neck and screw cap (Fortune Oil / Coca-Cola)
      const isCoke = product.id === 'coca-cola';
      const bodyRadius = isCoke ? 0.07 : 0.085;
      const bodyHeight = 0.26;

      const body = new THREE.Mesh(new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 16), material);
      body.position.y = bodyHeight / 2;
      group.add(body);

      // Tapered neck
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.03, bodyRadius, 0.08, 16), material);
      neck.position.y = bodyHeight + 0.04;
      group.add(neck);

      // Red/Yellow bottle cap
      const capMat = new THREE.MeshStandardMaterial({
        color: isCoke ? '#dc2626' : '#eab308',
        roughness: 0.2,
        metalness: 0.1,
      });
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.03, 16), capMat);
      cap.position.y = bodyHeight + 0.095;
      group.add(cap);
      break;
    }

    case 'packet': {
      // Pillow packet with crimped top and bottom seals (Maggi, Lays, Tata Salt, Dairy Milk)
      const isMaggi = product.id === 'maggi-noodles';
      const isLays = product.id === 'lays-chips';
      const pw = isLays ? 0.22 : 0.24;
      const ph = isLays ? 0.28 : (isMaggi ? 0.18 : 0.22);
      const pd = isLays ? 0.08 : (isMaggi ? 0.06 : 0.04);

      const packetBody = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, pd), material);
      packetBody.position.y = ph / 2;
      group.add(packetBody);

      // Crimped seal edges (silver/foil shimmer)
      const crimpMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.3, metalness: 0.8 });
      const topCrimp = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.01, 0.015, 0.01), crimpMat);
      topCrimp.position.set(0, ph + 0.007, 0);
      group.add(topCrimp);

      const botCrimp = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.01, 0.015, 0.01), crimpMat);
      botCrimp.position.set(0, 0.007, 0);
      group.add(botCrimp);
      break;
    }

    case 'sack': {
      // Plump flour sack with stitched top (Aashirvaad Atta)
      const sackMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.44, 0.18), material);
      sackMesh.position.y = 0.22;
      group.add(sackMesh);

      // Stitched top fold
      const foldMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 });
      const topFold = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 12), foldMat);
      topFold.rotation.z = Math.PI / 2;
      topFold.position.set(0, 0.44, 0);
      group.add(topFold);
      break;
    }

    case 'box':
    default: {
      // Cardboard carton / biscuit box (Parle-G, Good Day, Amul Milk, Frooti)
      const isMilk = product.id === 'amul-milk';
      const bw = isMilk ? 0.14 : 0.2;
      const bh = isMilk ? 0.26 : 0.14;
      const bd = isMilk ? 0.12 : 0.12;

      const box = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), material);
      box.position.y = bh / 2;
      group.add(box);

      if (isMilk) {
        // Gable top triangular roof fold for milk carton
        const gableMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.3 });
        const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, bw, 3), gableMat);
        roof.rotation.z = Math.PI / 2;
        roof.position.set(0, bh + 0.02, 0);
        group.add(roof);
      }
      break;
    }
  }

  return group;
}

/**
 * Creates friendly 3D Cashier NPC Avatar behind checkout counter
 */
function createCashierAvatar(): THREE.Group {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: '#d4a373', roughness: 0.6 });
  const uniformMat = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.5 }); // Indian green supermarket apron
  const hairMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.8 });

  // Torso / Supermarket vest
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.75, 12), uniformMat);
  torso.position.y = 1.05;
  group.add(torso);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), skinMat);
  head.position.y = 1.58;
  group.add(head);

  // Hair
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), hairMat);
  hair.position.y = 1.62;
  group.add(hair);

  // Name tag ("Ramesh - Senior Cashier")
  const tagMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const tag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.02), tagMat);
  tag.position.set(0.1, 1.25, 0.24);
  group.add(tag);

  return group;
}
