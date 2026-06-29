import { EventEmitter } from 'events';

// Create a single shared event emitter instance for the application
export const appEvents = new EventEmitter();
