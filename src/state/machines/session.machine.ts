import { createMachine } from 'xstate';
import { assetManager } from '../../engine/AssetManager';

// Define session-specific event types
export type SessionEvent =
  | { type: 'ASSETS_LOADED' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'PLAYER_DEAD' };

// Create the session state machine (to be used as a nested machine)
export const sessionMachine = {
  id: 'session',
  initial: 'loading',
  states: {
    loading: {
      entry: 'startAssetLoading',
      on: {
        ASSETS_LOADED: 'playing'
      }
    },
    playing: {
      entry: 'initGameWorld',
      on: {
        PAUSE: 'paused',
        PLAYER_DEAD: 'gameOver'
      }
    },
    paused: {
      on: {
        RESUME: 'playing'
      }
    },
    gameOver: {
      on: {
        // Add transitions for game over state
      }
    }
  }
};

// These actions would be implemented in the parent machine
// or via middleware/side effects
