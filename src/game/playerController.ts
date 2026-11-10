/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { InteractiveObject } from './supermarketScene.ts';
import { soundManager } from '../audio/soundManager.ts';
import { Product } from '../types/game.ts';

export interface PlayerFocus {
  type: 'product' | 'checkout';
  product?: Product;
  distance: number;
  position: THREE.Vector3;
}

export interface PlayerControllerOptions {
  camera: THREE.PerspectiveCamera;
  collisionBoxes: THREE.Box3[];
  interactiveObjects: InteractiveObject[];
  cartGroup: THREE.Group;
  domElement: HTMLElement;
  onFocusChange: (focus: PlayerFocus | null) => void;
  onInteract: (focus: PlayerFocus) => void;
}

const _moveDir = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _side = new THREE.Vector3();
const _nextPos = new THREE.Vector3();
const _playerBox = new THREE.Box3();

export class PlayerController {
  private camera: THREE.PerspectiveCamera;
  private collisionBoxes: THREE.Box3[];
  private interactiveObjects: InteractiveObject[];
  private cartGroup: THREE.Group;
  private domElement: HTMLElement;
  private onFocusChange: (focus: PlayerFocus | null) => void;
  private onInteract: (focus: PlayerFocus) => void;

  public position: THREE.Vector3 = new THREE.Vector3(0, 1.65, 8.8);
  private yaw: number = 0; // horizontal rotation in radians (0 is looking -Z into aisles)
  private pitch: number = 0; // vertical rotation
  private isPointerLocked: boolean = false;
  private isDragging: boolean = false;
  private previousMousePosition = { x: 0, y: 0 };

  private keys: { [key: string]: boolean } = {};
  public moveSpeed: number = 3.6; // m/s
  public sprintSpeed: number = 5.2;

  private currentFocus: PlayerFocus | null = null;
  private footstepTimer: number = 0;
  private cartRattleTimer: number = 0;

  // Touch virtual joystick state
  public virtualInput = {
    moveX: 0,
    moveZ: 0,
    lookX: 0,
    lookY: 0,
  };

  constructor(options: PlayerControllerOptions) {
    this.camera = options.camera;
    this.collisionBoxes = options.collisionBoxes;
    this.interactiveObjects = options.interactiveObjects;
    this.cartGroup = options.cartGroup;
    this.domElement = options.domElement;
    this.onFocusChange = options.onFocusChange;
    this.onInteract = options.onInteract;

    this.bindEvents();
    this.updateCameraTransform();
  }

  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    this.domElement.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);

    // Pointer lock support for FPS style immersion
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);
  }

  public requestPointerLock() {
    try {
      this.domElement.requestPointerLock();
    } catch {
      // Ignored if blocked
    }
  }

  public exitPointerLock() {
    if (document.exitPointerLock) {
      document.exitPointerLock();
    }
  }

  private handlePointerLockChange = () => {
    this.isPointerLocked = document.pointerLockElement === this.domElement;
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    this.keys[key] = true;

    if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
      if (this.currentFocus) {
        e.preventDefault();
        this.onInteract(this.currentFocus);
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    this.keys[key] = false;
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (this.isPointerLocked) {
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;
      this.rotateView(movementX * 0.0024, movementY * 0.0024);
    } else if (this.isDragging) {
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
      this.rotateView(deltaX * 0.0035, deltaY * 0.0035);
    }
  };

  private handleMouseUp = () => {
    this.isDragging = false;
  };

  public rotateView(deltaYaw: number, deltaPitch: number) {
    this.yaw -= deltaYaw;
    this.pitch -= deltaPitch;
    // Clamp pitch between -70 deg and +65 deg
    const maxPitch = (65 * Math.PI) / 180;
    const minPitch = (-70 * Math.PI) / 180;
    this.pitch = Math.max(minPitch, Math.min(maxPitch, this.pitch));
    this.updateCameraTransform();
  }

  private updateCameraTransform() {
    this.camera.position.copy(this.position);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  public update(delta: number) {
    // 1. Process movement inputs
    _moveDir.set(0, 0, 0);

    let moveZ = 0;
    let moveX = 0;

    if (this.keys['w'] || this.keys['arrowup']) moveZ -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveZ += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    // Apply touch joystick input
    moveX += this.virtualInput.moveX;
    moveZ += this.virtualInput.moveZ;

    // Apply touch look input
    if (this.virtualInput.lookX !== 0 || this.virtualInput.lookY !== 0) {
      this.rotateView(this.virtualInput.lookX * delta * 2.5, this.virtualInput.lookY * delta * 2.5);
    }

    const isMoving = Math.abs(moveX) > 0.05 || Math.abs(moveZ) > 0.05;
    const isSprint = this.keys['shift'];
    const currentSpeed = isSprint ? this.sprintSpeed : this.moveSpeed;

    if (isMoving) {
      // Forward vector projected on horizontal floor plane
      _forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
      _side.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();

      _moveDir.addScaledVector(_forward, -moveZ);
      _moveDir.addScaledVector(_side, moveX);
      if (_moveDir.lengthSq() > 0) {
        _moveDir.normalize();
      }

      const stepDist = currentSpeed * delta;
      const proposedDeltaX = _moveDir.x * stepDist;
      const proposedDeltaZ = _moveDir.z * stepDist;

      // 2. Collision Detection: test X and Z separately for smooth wall sliding
      const playerRadius = 0.42;

      // Test X movement
      _nextPos.set(this.position.x + proposedDeltaX, this.position.y, this.position.z);
      _playerBox.setFromCenterAndSize(
        new THREE.Vector3(_nextPos.x, 1.0, _nextPos.z),
        new THREE.Vector3(playerRadius * 2, 1.8, playerRadius * 2)
      );

      let collideX = false;
      for (const box of this.collisionBoxes) {
        if (_playerBox.intersectsBox(box)) {
          collideX = true;
          break;
        }
      }
      if (!collideX) {
        this.position.x = _nextPos.x;
      }

      // Test Z movement
      _nextPos.set(this.position.x, this.position.y, this.position.z + proposedDeltaZ);
      _playerBox.setFromCenterAndSize(
        new THREE.Vector3(_nextPos.x, 1.0, _nextPos.z),
        new THREE.Vector3(playerRadius * 2, 1.8, playerRadius * 2)
      );

      let collideZ = false;
      for (const box of this.collisionBoxes) {
        if (_playerBox.intersectsBox(box)) {
          collideZ = true;
          break;
        }
      }
      if (!collideZ) {
        this.position.z = _nextPos.z;
      }

      // Sound triggers
      this.footstepTimer += delta;
      const stepInterval = isSprint ? 0.32 : 0.45;
      if (this.footstepTimer > stepInterval) {
        this.footstepTimer = 0;
        soundManager.playFootstep();
      }

      this.cartRattleTimer += delta;
      if (this.cartRattleTimer > 0.55) {
        this.cartRattleTimer = 0;
        soundManager.playCartRattle();
      }
    }

    this.updateCameraTransform();

    // 3. Shopping Cart Follow Kinematics:
    // Cart stays positioned ~1.3m in front of the player and faces same yaw
    const cartTargetX = this.position.x - Math.sin(this.yaw) * 1.3;
    const cartTargetZ = this.position.z - Math.cos(this.yaw) * 1.3;

    // Smooth exponential damping so cart glides realistically
    this.cartGroup.position.x = THREE.MathUtils.damp(this.cartGroup.position.x, cartTargetX, 12, delta);
    this.cartGroup.position.z = THREE.MathUtils.damp(this.cartGroup.position.z, cartTargetZ, 12, delta);
    this.cartGroup.position.y = 0; // stays firmly on ground
    this.cartGroup.rotation.y = THREE.MathUtils.damp(this.cartGroup.rotation.y, this.yaw, 10, delta);

    // 4. Interaction Proximity & Reticle Raycast
    this.updateFocus();
  }

  private updateFocus() {
    let closestFocus: PlayerFocus | null = null;
    let minDistance = 2.4; // interaction reach in meters

    _forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();

    for (const obj of this.interactiveObjects) {
      const dist = this.position.distanceTo(obj.position);
      if (dist < minDistance) {
        // Check dot product to ensure object is in front of player's gaze (at least 45 degree cone)
        const toObj = _nextPos.copy(obj.position).sub(this.position).normalize();
        const dot = _forward.dot(toObj);

        if (dot > 0.45) {
          if (dist < minDistance) {
            minDistance = dist;
            closestFocus = {
              type: obj.type,
              product: obj.product,
              distance: dist,
              position: obj.position.clone(),
            };
          }
        }
      }
    }

    if (
      (!this.currentFocus && closestFocus) ||
      (this.currentFocus && !closestFocus) ||
      (this.currentFocus && closestFocus && (this.currentFocus.product?.id !== closestFocus.product?.id || this.currentFocus.type !== closestFocus.type))
    ) {
      this.currentFocus = closestFocus;
      this.onFocusChange(this.currentFocus);
    }
  }

  public teleport(x: number, z: number, yaw: number = 0) {
    this.position.set(x, 1.65, z);
    this.yaw = yaw;
    this.pitch = 0;
    this.cartGroup.position.set(x - Math.sin(yaw) * 1.3, 0, z - Math.cos(yaw) * 1.3);
    this.cartGroup.rotation.y = yaw;
    this.updateCameraTransform();
  }

  public dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.domElement.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
  }
}
