import { persistentAtom } from '@nanostores/persistent';
import type { Event } from 'nostr-tools';

interface BidsStore {
  [auctionId: string]: {
    bids: Event[];
    lastFetchTime: number;
  };
}

export const bidsStore = persistentAtom<BidsStore>(
  'bids-store',
  {},
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);
