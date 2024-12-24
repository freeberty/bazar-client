import { atom } from 'nanostores';
import { Relay } from 'nostr-tools/relay';
import type { Event } from 'nostr-tools';
import { RELAY_DOMAIN } from '../../constants/common';
import { DateTime } from 'luxon';
import WebSocket from 'ws';

if (!global.WebSocket) {
  (global as any).WebSocket = WebSocket;
}

interface AuctionsState {
  events: Event[];
  lastFetchTime: number;
}

const FETCH_INTERVAL = 15; // 15 seconds

export const serverAuctionsStore = atom<AuctionsState>({
  events: [],
  lastFetchTime: 0
});

let relay: Relay | null = null;

export async function initializeRelay() {
  if (!relay) {
    try {
      const now = DateTime.utc().toUnixInteger();
      const currentState = serverAuctionsStore.get();
      const timeSinceLastFetch = now - currentState.lastFetchTime;

      // Only reconnect if enough time has passed
      if (timeSinceLastFetch >= FETCH_INTERVAL) {
        relay = await Relay.connect(`wss://${RELAY_DOMAIN}`);
        
        relay.subscribe(
          [{
            kinds: [33222],
            since: currentState.lastFetchTime || undefined
          }],
          {
            onevent(event: Event) {
              const currentState = serverAuctionsStore.get();
              const eventExists = currentState.events.some(e => e.id === event.id);
              
              if (!eventExists) {
                serverAuctionsStore.set({
                  events: [...currentState.events, event],
                  lastFetchTime: DateTime.utc().toUnixInteger()
                });
              }
            }
          }
        );
      }
    } catch (error) {
      console.error('Failed to initialize relay:', error);
      throw error;
    }
  }
  return relay;
}

// Function to manually close relay connection
export function closeRelay() {
  if (relay) {
    relay.close();
    relay = null;
  }
}

// Function to get current auctions
export function getAuctions(): Event[] {
  return serverAuctionsStore.get().events;
}
