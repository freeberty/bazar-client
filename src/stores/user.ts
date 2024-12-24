import { persistentAtom } from '@nanostores/persistent';

export const userPubkey = persistentAtom<string | null>(
  'user-pubkey',
  null,
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

export const checkAndSetPubkey = async () => {
  try {
    const pubkey = await window.nostr?.getPublicKey();
    if (pubkey) {
      userPubkey.set(pubkey);
      return pubkey;
    }
  } catch (error) {
    console.error('Failed to get pubkey:', error);
  }
  return null;
};

export const unsetPubkey = async () => userPubkey.set(null);
