import { eventBus } from '../state/events';
import { WorldRay } from './WorldRay';

/**
 * Input action types that can be mapped to physical inputs
 */
export enum InputAction {
  // Movement
  MOVE_UP = 'MOVE_UP',
  MOVE_DOWN = 'MOVE_DOWN',
  MOVE_LEFT = 'MOVE_LEFT',
  MOVE_RIGHT = 'MOVE_RIGHT',

  // Camera
  ROTATE_CAMERA_LEFT = 'ROTATE_CAMERA_LEFT',
  ROTATE_CAMERA_RIGHT = 'ROTATE_CAMERA_RIGHT',

  // Actions
  PRIMARY_ACTION = 'PRIMARY_ACTION',
  SECONDARY_ACTION = 'SECONDARY_ACTION',

  // UI
  PAUSE = 'PAUSE',
  INVENTORY = 'INVENTORY',

  // Debug
  TOGGLE_DEBUG = 'TOGGLE_DEBUG'
}

/**
 * Input state for tracking which actions are currently active
 */
interface InputState {
  [key: string]: boolean;
}

/**
 * Input axis values (normalized -1 to 1)
 */
interface InputAxes {
  moveX: number;
  moveY: number;
  aimX: number;
  aimY: number;
}

/**
 * Mouse state
 */
interface MouseState {
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  worldZ: number;
  isOnScreen: boolean;
}

/**
 * InputManager
 *
 * Handles keyboard, mouse, and gamepad inputs.
 * Maps physical inputs to game actions and provides an event-based system
 * for responding to input changes.
 */
export class InputManager {
  // Singleton instance
  private static instance: InputManager;

  // Input state tracking
  private keyState: { [key: string]: boolean } = {};
  private actionState: InputState = {};
  private axes: InputAxes = { moveX: 0, moveY: 0, aimX: 0, aimY: 0 };
  private mouse: MouseState = {
    x: 0, y: 0,
    worldX: 0, worldY: 0, worldZ: 0,
    isOnScreen: false
  };

  // Key mappings
  private keyMap: { [key: string]: InputAction } = {
    'w': InputAction.MOVE_UP,
    'arrowup': InputAction.MOVE_UP,
    's': InputAction.MOVE_DOWN,
    'arrowdown': InputAction.MOVE_DOWN,
    'a': InputAction.MOVE_LEFT,
    'arrowleft': InputAction.MOVE_LEFT,
    'd': InputAction.MOVE_RIGHT,
    'arrowright': InputAction.MOVE_RIGHT,
    'q': InputAction.ROTATE_CAMERA_LEFT,
    'e': InputAction.ROTATE_CAMERA_RIGHT,
    ' ': InputAction.PRIMARY_ACTION,
    'shift': InputAction.SECONDARY_ACTION,
    'escape': InputAction.PAUSE,
    'tab': InputAction.INVENTORY,
    'f12': InputAction.TOGGLE_DEBUG
  };

  // Constructor is private for singleton pattern
  private constructor() {
    this.setupEventListeners();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  /**
   * Set up DOM event listeners for input
   */
  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Mouse events
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    // Focus/blur events to reset input state when window loses focus
    window.addEventListener('blur', this.handleBlur.bind(this));

    // Prevent default behavior for keys we use
    window.addEventListener('keydown', (e) => {
      if (Object.keys(this.keyMap).includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    });

    console.log('InputManager initialized');
  }

  /**
   * Handle keydown events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();

    // Always update key state, even if it's already down
    // This helps with key repeat and makes movement more responsive
    this.keyState[key] = true;

    // Map to action if defined
    const action = this.keyMap[key];
    if (action) {
      this.setActionState(action, true);
    }

    // Update movement axes
    this.updateAxes();
  }

  /**
   * Handle keyup events
   */
  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();

    // Update key state
    if (this.keyState[key]) {
      this.keyState[key] = false;

      // Map to action if defined
      const action = this.keyMap[key];
      if (action) {
        this.setActionState(action, false);
      }

      // Update movement axes
      this.updateAxes();
    }
  }

  /**
   * Handle mouse movement
   */
  private handleMouseMove(event: MouseEvent): void {
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
    this.mouse.isOnScreen = true;

    // World position will be calculated in the update method
    // after we have access to the camera and renderer
  }

  /**
   * Handle mouse down events
   */
  private handleMouseDown(event: MouseEvent): void {
    if (event.button === 0) { // Left click
      this.setActionState(InputAction.PRIMARY_ACTION, true);
    } else if (event.button === 2) { // Right click
      this.setActionState(InputAction.SECONDARY_ACTION, true);
    }
  }

  /**
   * Handle mouse up events
   */
  private handleMouseUp(event: MouseEvent): void {
    if (event.button === 0) { // Left click
      this.setActionState(InputAction.PRIMARY_ACTION, false);
    } else if (event.button === 2) { // Right click
      this.setActionState(InputAction.SECONDARY_ACTION, false);
    }
  }

  /**
   * Handle window blur (reset all inputs)
   */
  private handleBlur(): void {
    // Reset all key and action states
    this.keyState = {};
    Object.keys(this.actionState).forEach(action => {
      this.setActionState(action as InputAction, false);
    });

    // Reset axes
    this.axes = { moveX: 0, moveY: 0, aimX: 0, aimY: 0 };
  }

  /**
   * Set an action's state and emit events if changed
   */
  private setActionState(action: InputAction, isActive: boolean): void {
    // Only emit events if the state actually changed
    if (this.actionState[action] !== isActive) {
      this.actionState[action] = isActive;

      // Emit events
      eventBus.emit(`input:${isActive ? 'pressed' : 'released'}`, action);
      eventBus.emit(`input:${action}:${isActive ? 'pressed' : 'released'}`);
    }
  }

  /**
   * Update movement axes based on current key states
   */
  private updateAxes(): void {
    // Calculate movement axes from WASD/arrow keys
    const up = this.isActionActive(InputAction.MOVE_UP) ? 1 : 0;
    const down = this.isActionActive(InputAction.MOVE_DOWN) ? 1 : 0;
    const left = this.isActionActive(InputAction.MOVE_LEFT) ? 1 : 0;
    const right = this.isActionActive(InputAction.MOVE_RIGHT) ? 1 : 0;

    // Calculate axes (-1 to 1 range)
    this.axes.moveX = right - left;
    this.axes.moveY = up - down;

    // Normalize diagonal movement
    if (this.axes.moveX !== 0 && this.axes.moveY !== 0) {
      const length = Math.sqrt(this.axes.moveX * this.axes.moveX + this.axes.moveY * this.axes.moveY);
      this.axes.moveX /= length;
      this.axes.moveY /= length;
    }

    // Emit movement change event for immediate response
    if (this.axes.moveX !== 0 || this.axes.moveY !== 0) {
      eventBus.emit('input:movement', { x: this.axes.moveX, y: this.axes.moveY });
    }
  }

  /**
   * Update method called each frame
   */
  public update(deltaTime: number): void {
    // Update mouse world position
    this.updateMouseWorldPosition();

    // Additional processing that needs to happen every frame
    // (e.g., gamepad polling)
  }

  /**
   * Check if an action is currently active
   */
  public isActionActive(action: InputAction): boolean {
    return this.actionState[action] || false;
  }

  /**
   * Get the current movement axes
   */
  public getMovementAxes(): { x: number, y: number } {
    return { x: this.axes.moveX, y: this.axes.moveY };
  }

  /**
   * Get the current mouse position
   */
  public getMousePosition(): { x: number, y: number } {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  /**
   * Get the mouse position in world coordinates
   */
  public getMouseWorldPosition(): { x: number, y: number, z: number } {
    return {
      x: this.mouse.worldX,
      y: this.mouse.worldY,
      z: this.mouse.worldZ
    };
  }

  /**
   * Update the mouse world position using raycasting
   */
  public updateMouseWorldPosition(groundY: number = 0): void {
    if (this.mouse.isOnScreen) {
      const worldPos = WorldRay.getMouseWorldPosition(
        this.mouse.x,
        this.mouse.y,
        groundY
      );

      if (worldPos) {
        this.mouse.worldX = worldPos.x;
        this.mouse.worldY = worldPos.y;
        this.mouse.worldZ = worldPos.z;

        // Calculate aim direction (for future use with projectiles)
        this.axes.aimX = worldPos.x - this.mouse.worldX;
        this.axes.aimY = worldPos.z - this.mouse.worldZ;

        // Normalize aim direction
        const aimLength = Math.sqrt(this.axes.aimX * this.axes.aimX + this.axes.aimY * this.axes.aimY);
        if (aimLength > 0) {
          this.axes.aimX /= aimLength;
          this.axes.aimY /= aimLength;
        }
      }
    }
  }
}

// Export singleton instance
export const inputManager = InputManager.getInstance();
