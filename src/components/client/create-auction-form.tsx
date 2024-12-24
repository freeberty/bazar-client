import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { DateTime } from 'luxon';
import { usePublishEvent } from '../../hooks/nostr';
import { userPubkey } from '../../stores/user';
import { type UnsignedEvent, type Event, getEventHash } from "nostr-tools";
import type { FormData } from '../../types/auction.ts';
import { usePayForEvent } from '../../hooks/usePayForEvent.ts';
import { addUserAuction, userAuctionsStore } from '../../stores/user-auctions.ts';

export const CreateAuctionForm = () => {
  const $userPubkey = useStore(userPubkey);
  const $userAuctions = useStore(userAuctionsStore);
  const [mounted, setMounted] = useState(false);
  const { publishEvent } = usePublishEvent();
  const { getInvoice } = usePayForEvent();
  const [paymentData, setPaymentData] = useState<string | null>(null);
  const [preparedEvent, setPreparedEvent] = useState<Event | null>(null);
  const [auctionHash, setAuctionHash] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    images: '',
    bidStepSats: 1000,
    durationDays: 30,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateHash = () => {
    const hash = Math.random().toString(36).substring(2, 15);
    setAuctionHash(hash);
  };

  useEffect(() => {
    generateHash();
  }, []);

  const prepareAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!$userPubkey || !auctionHash) return;

    const auction = {
      ...formData,
      startTimestamp: DateTime.utc().toUnixInteger(),
      finishTimestamp: DateTime.utc().plus({ days: formData.durationDays }).toUnixInteger(),
      status: "started"
    };

    const event: UnsignedEvent = {
      content: JSON.stringify(auction),
      kind: 33222,
      tags: [["d", auctionHash]],
      created_at: DateTime.utc().toUnixInteger(),
      pubkey: $userPubkey,
    };

    const eventId = getEventHash(event);
    
    try {
      const invoice = await getInvoice(eventId);
      setPaymentData(invoice);
      setPreparedEvent(await window.nostr?.signEvent(event) || null);
    } catch (error) {
      alert('Failed to get payment info: ' + error);
    }
  };

  const publishAuction = async () => {
    try {
      if (!preparedEvent) return;
      await publishEvent(preparedEvent);
      
      // Add to user auctions store
      addUserAuction({
        hash: auctionHash,
        title: formData.title,
        createdAt: DateTime.utc().toUnixInteger()
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        images: '',
        bidStepSats: 1000,
        durationDays: 1
      });
      setPaymentData(null);
      setPreparedEvent(null);
      generateHash();
    } catch (error) {
      alert('Failed to publish auction: ' + error);
    }
  };

  return (
    <div className="form-container">
      <h2>Create New Auction</h2>
      <form onSubmit={prepareAuction}>
        <div className="form-group">
          <label htmlFor="auctionHash">Auction Hash</label>
          <div className="hash-input-group">
            <input
              id="auctionHash"
              value={auctionHash}
              onChange={(e) => setAuctionHash(e.target.value)}
              required
            />
            <button 
              type="button"
              onClick={generateHash}
              className="generate-hash"
            >
              Generate New
            </button>
          </div>
          {mounted && $userAuctions.auctions.length > 0 && (
            <select 
              onChange={(e) => setAuctionHash(e.target.value)}
              className="hash-select"
            >
              <option value="">Select existing hash</option>
              {$userAuctions.auctions.map(auction => (
                <option key={auction.hash} value={auction.hash}>
                  {auction.title} ({auction.hash})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bidStep">Minimum Bid Step (sats)</label>
          <input
            id="bidStep"
            type="number"
            value={formData.bidStepSats}
            onChange={(e) => setFormData({ ...formData, bidStepSats: parseInt(e.target.value) })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="duration">Duration (days)</label>
          <input
            id="duration"
            type="number"
            value={formData.durationDays}
            onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
            required
          />
        </div>

        <div className="button-group">
          {!preparedEvent ? (
            <button type="submit">Pay for event</button>
          ) : (
            <>
              <button 
                type="button" 
                onClick={publishAuction}
                disabled={!preparedEvent}
              >
                Publish Auction
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setPreparedEvent(null);
                  setPaymentData(null);
                }}
                className="secondary"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </form>

      {paymentData && (
        <div className="payment-info">
          <h4>Payment Information:</h4>
          <pre>{paymentData}</pre>
        </div>
      )}
    </div>
  );
};