import { useState } from 'react';
import { DateTime } from 'luxon';
import { useStore } from '@nanostores/react';
import { userPubkey } from '../../stores/user';
import { usePublishEvent } from '../../hooks/nostr';
import { getEventHash } from "nostr-tools";
import { usePayForEvent } from '../../hooks/usePayForEvent';

interface BidControlsProps {
  auctionId: string;
  bidStepSats: number;
  onCancel: () => void;
}

export const BidControls = ({ auctionId, bidStepSats, onCancel }: BidControlsProps) => {
  const $userPubkey = useStore(userPubkey);
  const [bidAmount, setBidAmount] = useState('');
  const [paymentData, setPaymentData] = useState<string | null>(null);
  const [preparedEvent, setPreparedEvent] = useState<any>(null);
  const { publishEvent } = usePublishEvent();
  const { getInvoice } = usePayForEvent();
  const increaseBid = () => {
    setBidAmount((prevBid) => (parseInt(prevBid || '0') + bidStepSats).toString());
    setPaymentData(null);
    setPreparedEvent(null);
  };

  const prepareBid = async () => {
    console.log('$userPubkey', $userPubkey);
    if (!$userPubkey) return;
    const event = {
      content: bidAmount,
      kind: 1077,
      tags: [["e", auctionId, "root"]],
      created_at: DateTime.utc().toUnixInteger(),
      pubkey: $userPubkey,
    };

    const eventId = getEventHash(event);
    
    try {
      const paymentData = await getInvoice(eventId);
      setPaymentData(paymentData);
      setPreparedEvent(await window.nostr?.signEvent(event));
    } catch (error) {
      alert('Failed to get payment info: ' + error);
    }
  };

  const publishBid = async () => {
    console.log('preparedEvent', preparedEvent);
    try {
      await publishEvent(preparedEvent);
      setBidAmount('');
      setPaymentData(null);
      setPreparedEvent(null);
      onCancel();
    } catch (error) {
      alert('Failed to publish bid: ' + error);
    }
  };

  return (
    <div className="bid-controls">
      <div className="bid-input-group">
        <input
          type="number"
          value={bidAmount}
          onChange={(e) => {
            setBidAmount(e.target.value);
            setPaymentData(null);
            setPreparedEvent(null);
          }}
          placeholder="Bid amount in sats"
          disabled
        />
        <button 
          type="button" 
          className="increment-btn"
          onClick={increaseBid}
        >
          +{bidStepSats}
        </button>
      </div>
      
      <div className="button-group">
          {!preparedEvent ? (
            <button onClick={prepareBid}>Pay for event</button>
          ) : (
          <>
            <button 
              onClick={publishBid}
              disabled={!preparedEvent} 
              className={!preparedEvent ? "disabled" : ""}
            >
              Publish Bid
            </button>
          </>
          )}
          <button onClick={onCancel} className="secondary">
            Cancel
          </button>
      </div>

      {paymentData && (
        <div className="payment-info">
          <h4>Payment Information:</h4>
          <pre>{paymentData}</pre>
        </div>
      )}
    </div>
  );
};
