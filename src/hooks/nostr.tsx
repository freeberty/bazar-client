// src/lib/nostr.ts
import { Relay } from 'nostr-tools/relay'
import type { Event, Filter } from 'nostr-tools'
import { useCallback, useEffect, useState } from 'react'
import { RELAY_DOMAIN } from '../constants/common';

const RELAY_URL = `wss://${RELAY_DOMAIN}`;
let relayInstance: Relay | null = null;

export async function getRelay() {
  if (!relayInstance) {
    relayInstance = await Relay.connect(RELAY_URL)
    console.log(`Connected to ${relayInstance.url}`)
  }
  return relayInstance;
}

export function useNostrEvents({ filter, disabled = false }: { filter: Filter, disabled?: boolean }) {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (disabled) return;
    let sub: { close: () => void } | null = null;

    async function subscribe() {
      const relay = await getRelay();
      sub = relay.subscribe(
        [filter],
        {
          onevent(event) {
            setEvents(prev => [...prev, event]);
          },
          oneose() {
            console.log('EOSE received');
          }
        }
      );
    }

    subscribe();

    return () => {
      if (sub) sub.close();
    };
  }, [JSON.stringify(filter), disabled]);

  return { events };
}

export function usePublishEvent() {
  const publishEvent = useCallback(async (event: Event) => {
    try {
      const relay = await getRelay();
      console.log('Publishing event:', event);
      await relay.publish(event);
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }, []);

  return { publishEvent };
}


export async function closeRelay() {
  if (relayInstance) {
    relayInstance.close();
    relayInstance = null;
  }
}