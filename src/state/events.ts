// Define all event types used in the game

// App-level events
export enum AppEventType {
  START_NEW_GAME = 'START_NEW_GAME',
  CONTINUE = 'CONTINUE',
  OPEN_SETTINGS = 'OPEN_SETTINGS',
  EXIT_TO_MENU = 'EXIT_TO_MENU'
}

// Session-level events
export enum SessionEventType {
  ASSETS_LOADED = 'ASSETS_LOADED',
  PAUSE = 'PAUSE',
  RESUME = 'RESUME',
  PLAYER_DEAD = 'PLAYER_DEAD'
}

// Game events
export enum GameEventType {
  DAMAGE_DONE = 'DAMAGE_DONE',
  ITEM_COLLECTED = 'ITEM_COLLECTED',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE'
}

// Event bus for game events
class EventBus {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const eventBus = new EventBus();
