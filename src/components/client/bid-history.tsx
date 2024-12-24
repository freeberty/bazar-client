import { useStore } from '@nanostores/react';
import { bidsStore } from '../../stores/bids';
import { DateTime } from 'luxon';
import { shortenPubkey } from '../../utils/helpers';
import { useEffect, useState } from 'react';

export const BidHistory = ({ auctionId }: { auctionId: string }) => {
  const store = useStore(bidsStore);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="bid-history">Loading bids...</div>;
  }

  // Get bids for this auction from the store
  const auctionBids = store[auctionId]?.bids || [];
  const sortedBids = [...auctionBids].sort((a, b) => b.created_at - a.created_at).slice(0,5);

  return (
    <div className="bid-history">
      <h4>Bid History</h4>
      {sortedBids.length === 0 ? (
        <p>No bids yet</p>
      ) : (
        <ul>
          {sortedBids.map((bid) => (
            <li key={bid.id} className="bid-item">
              <span className="bidder">
                {shortenPubkey({ pubkey: bid.pubkey, start: 4, end: 4 })}
              </span>
              <span className="amount">
                {' '}{parseInt(bid.content)} sats{' '}
              </span>
              <span className="bid-time">
                {DateTime.fromSeconds(bid.created_at).toRelative()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};