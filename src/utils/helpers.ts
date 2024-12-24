export const shortenPubkey = ({ pubkey, start = 8, end = 8 }: { pubkey: string | null, start?: number, end?:number }): string => {
  if (!pubkey) return '';
  if (pubkey.length <= start + end) return pubkey;
  
  return `${pubkey.slice(0, start)}...${pubkey.slice(-end)}`;
};
