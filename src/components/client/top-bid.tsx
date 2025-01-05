import { useStore } from '@nanostores/react';
import { bidsStore } from '../../stores/bids';
import { DateTime } from 'luxon';
import { shortenPubkey } from '../../utils/helpers';
import { useEffect, useState } from 'react';

export const TopBid = ({ auctionId }: { auctionId: string }) => {
  const store = useStore(bidsStore);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="top-bid">Loading current bid...</div>;
  }

  // Get bids for this auction from the store
  const auctionBids = store[auctionId]?.bids || [];
  const topBid = [...auctionBids]
    .sort((a, b) => parseInt(b.content) - parseInt(a.content))[0];

  if (!topBid) {
    return (
      <div className="top-bid">
        <p className="no-bids">No bids yet</p>
      </div>
    );
  }

  return (
    <div className="top-bid">
      <div className="top-bid-content">
        <div className="bid">
          <span className="label">Top bid: </span>
          <span className="value">{parseInt(topBid.content)} sats by {shortenPubkey({ pubkey: topBid.pubkey, start: 4, end: 4 })} {DateTime.fromSeconds(topBid.created_at).toRelative()}</span>
        </div>
      </div>
    </div>
  );
};
