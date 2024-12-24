import { useEffect } from 'react';
import { getRelay } from '../../hooks/nostr';
import type { Event } from 'nostr-tools';
import { DateTime } from 'luxon';
import { bidsStore } from '../../stores/bids';

export function GlobalBidsListener() {
  useEffect(() => {
    let sub: { close: () => void } | null = null;

    async function subscribeToBids() {
      try {
        const relay = await getRelay();
        sub = relay.subscribe(
          [{ kinds: [1077] }],
          {
            onevent(event: Event) {
              const auctionId = event.tags.find(tag => tag[0] === 'e')?.[1];
              if (!auctionId) return;

              const currentStore = bidsStore.get();
              const auctionBids = currentStore[auctionId] || { bids: [], lastFetchTime: 0 };

              if (!auctionBids.bids.find(b => b.id === event.id)) {
                bidsStore.set({
                  ...currentStore,
                  [auctionId]: {
                    bids: [...auctionBids.bids, event],
                    lastFetchTime: DateTime.utc().toUnixInteger(),
                  }
                });
              }
            },
            oneose() {
              console.log('Global bids EOSE received');
            }
          }
        );
      } catch (error) {
        console.error('Failed to connect relay from global bids listener:', error);
      }
    }

    subscribeToBids();

    return () => {
      if (sub) {
        console.log('Closing global bids subscription');
        sub.close();
      }
    };
  }, []);

  return null;
}
