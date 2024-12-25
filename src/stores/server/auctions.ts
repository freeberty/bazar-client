import { atom } from 'nanostores';
import { Relay } from 'nostr-tools/relay';
import type { Event } from 'nostr-tools';
import { FETCH_INTERVAL, RELAY_DOMAIN } from '../../constants/common';
import { DateTime } from 'luxon';
import WebSocket from 'ws';
import fs from 'fs/promises';
import path from 'path';

if (!global.WebSocket) {
  (global as any).WebSocket = WebSocket;
}

interface AuctionsState {
  events: Event[];
  lastFetchTime: number;
}

const DATA_DIR = import.meta.env.PROD ? '/data' : './';
const STORE_FILE = path.join(DATA_DIR, 'auctions.json');

export const serverAuctionsStore = atom<AuctionsState>({
  events: [],
  lastFetchTime: 0
});

async function initializeStore() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const data = await fs.readFile(STORE_FILE, 'utf-8');
    const state = JSON.parse(data);
    serverAuctionsStore.set(state);
  } catch (error) {
    console.log('Error while using default store state:', error);
  }
}

async function saveStore(state: AuctionsState) {
  try {
    await fs.writeFile(STORE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save store:', error);
  }
}

let relay: Relay | null = null;

export async function initializeRelay() {
  try {
    await initializeStore();
    
    if (!relay) {
      const now = DateTime.utc().toUnixInteger();
      const currentState = serverAuctionsStore.get();
      const timeSinceLastFetch = now - currentState.lastFetchTime;

      if (timeSinceLastFetch >= FETCH_INTERVAL) {
        relay = await Relay.connect(`wss://${RELAY_DOMAIN}`);
        
        relay.subscribe(
          [{
            kinds: [33222],
            since: currentState.lastFetchTime || undefined
          }],
          {
            onevent(event: Event) {
              try {
                const currentState = serverAuctionsStore.get();
                const eventExists = currentState.events.some(e => e.id === event.id);
                
                if (!eventExists) {
                  const newState = {
                    events: [...currentState.events, event],
                    lastFetchTime: DateTime.utc().toUnixInteger()
                  };
                  serverAuctionsStore.set(newState);
                  saveStore(newState).catch(console.error);
                }
              } catch (error) {
                console.error('Event processing error:', error);
              }
            }
          }
        );
      }
    }
  } catch (error) {
    console.error('Relay initialization failed:', error);
  }
  return relay;
}

export function closeRelay() {
  if (relay) {
    relay.close();
    relay = null;
  }
}

export function getAuctions(): Event[] {
  try {
    return serverAuctionsStore.get().events || [];
  } catch (error) {
    console.error('Failed to get auctions:', error);
    return [];
  }
}

// Subscribe to store changes
serverAuctionsStore.subscribe(async (state) => {
  await saveStore(state);
});
