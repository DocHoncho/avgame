import { defineStore } from 'pinia';
import { interpret } from 'xstate';
import { appMachine } from './machines/app.machine';

export const useAppStore = defineStore('app', {
  state: () => ({
    currentState: 'initializing',
    service: null as any,
    context: {}
  }),
  
  actions: {
    init() {
      // Create and start the XState service
      this.service = interpret(appMachine)
        .onTransition((state) => {
          this.currentState = state.value;
          this.context = state.context;
        })
        .start();
      
      // In development, expose the service to window for debugging
      if (import.meta.env.DEV) {
        (window as any).appService = this.service;
      }
    },
    
    send(event: string, payload = {}) {
      if (this.service) {
        this.service.send({ type: event, ...payload });
      } else {
        console.error('State machine service not initialized');
      }
    }
  }
});
