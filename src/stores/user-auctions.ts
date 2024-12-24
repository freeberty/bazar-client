import { persistentAtom } from '@nanostores/persistent';

interface UserAuction {
  hash: string;
  title: string;
  createdAt: number;
}

interface UserAuctionsStore {
  auctions: UserAuction[];
}

export const userAuctionsStore = persistentAtom<UserAuctionsStore>(
  'user-auctions',
  { auctions: [] },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

export function addUserAuction(auction: UserAuction) {
  const store = userAuctionsStore.get();
  if (!store.auctions.some(a => a.hash === auction.hash)) {
    userAuctionsStore.set({
      auctions: [...store.auctions, auction]
    });
  }
}
