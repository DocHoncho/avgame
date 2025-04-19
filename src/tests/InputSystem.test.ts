import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InputAction, inputManager } from '../engine/InputManager';

// Mock the eventBus
vi.mock('../state/events', () => ({
  eventBus: {
    emit: vi.fn()
  }
}));

// Mock the WorldRay
vi.mock('../engine/WorldRay', () => ({
  WorldRay: {
    getMouseWorldPosition: vi.fn().mockReturnValue({ x: 10, y: 0, z: 10 })
  }
}));

describe('InputManager', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Reset input state by simulating window blur
    const blurEvent = new Event('blur');
    window.dispatchEvent(blurEvent);
  });
  
  it('should track key states correctly', () => {
    // Simulate key down
    const keyDownEvent = new KeyboardEvent('keydown', { key: 'w' });
    window.dispatchEvent(keyDownEvent);
    
    // Check if action is active
    expect(inputManager.isActionActive(InputAction.MOVE_UP)).toBe(true);
    
    // Simulate key up
    const keyUpEvent = new KeyboardEvent('keyup', { key: 'w' });
    window.dispatchEvent(keyUpEvent);
    
    // Check if action is inactive
    expect(inputManager.isActionActive(InputAction.MOVE_UP)).toBe(false);
  });
  
  it('should calculate movement axes correctly', () => {
    // Simulate pressing W and D
    const keyDownW = new KeyboardEvent('keydown', { key: 'w' });
    const keyDownD = new KeyboardEvent('keydown', { key: 'd' });
    
    window.dispatchEvent(keyDownW);
    window.dispatchEvent(keyDownD);
    
    // Get movement axes
    const { x, y } = inputManager.getMovementAxes();
    
    // Should be normalized for diagonal movement
    const expectedLength = Math.sqrt(1 * 1 + 1 * 1);
    const expectedX = 1 / expectedLength;
    const expectedY = 1 / expectedLength;
    
    expect(x).toBeCloseTo(expectedX);
    expect(y).toBeCloseTo(expectedY);
  });
  
  it('should reset state on window blur', () => {
    // Simulate key down
    const keyDownEvent = new KeyboardEvent('keydown', { key: 'w' });
    window.dispatchEvent(keyDownEvent);
    
    // Check if action is active
    expect(inputManager.isActionActive(InputAction.MOVE_UP)).toBe(true);
    
    // Simulate window blur
    const blurEvent = new Event('blur');
    window.dispatchEvent(blurEvent);
    
    // Check if action is inactive after blur
    expect(inputManager.isActionActive(InputAction.MOVE_UP)).toBe(false);
    
    // Check if axes are reset
    const { x, y } = inputManager.getMovementAxes();
    expect(x).toBe(0);
    expect(y).toBe(0);
  });
});
