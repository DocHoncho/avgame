import { createMachine, assign } from 'xstate';
import { sessionMachine } from './session.machine';
import { assetManager } from '../../engine/AssetManager';

// Define context and event types
export interface AppContext {
  seed?: number;
  saveData?: any;
}

export type AppEvent =
  | { type: 'START_NEW_GAME'; seed: number }
  | { type: 'CONTINUE' }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'EXIT_TO_MENU' };

// Create the app state machine
export const appMachine = createMachine<AppContext, AppEvent>({
  id: 'app',
  initial: 'initializing',
  states: {
    initializing: {
      on: {
        '': {
          target: 'mainMenu',
          // Add any initialization actions here
        }
      }
    },
    mainMenu: {
      on: {
        START_NEW_GAME: {
          target: 'session.loading',
          actions: assign({
            seed: (_, event) => event.seed
          })
        },
        CONTINUE: {
          target: 'session.loading',
          actions: 'loadSaveData'
        },
        OPEN_SETTINGS: 'settings'
      }
    },
    settings: {
      on: {
        EXIT_TO_MENU: 'mainMenu'
      }
    },
    session: {
      on: {
        EXIT_TO_MENU: 'mainMenu'
      },
      ...sessionMachine
    }
  }
}, {
  actions: {
    loadSaveData: assign({
      saveData: () => {
        // This would load from localStorage or IndexedDB in a real implementation
        return { /* mock save data */ };
      }
    })
  }
});
