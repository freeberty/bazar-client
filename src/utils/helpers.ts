export const shortenPubkey = ({ pubkey, start = 8, end = 8 }: { pubkey: string | null, start?: number, end?:number }): string => {
  if (!pubkey) return '';
  if (pubkey.length <= start + end) return pubkey;
  
  return `${pubkey.slice(0, start)}...${pubkey.slice(-end)}`;
};

export const parseImagesFromDescription = (description: string): { imageUrl: string | null; cleanDescription: string } => {
  const imageRegex = /https?:\/\/[^\s<>"]+?\.(?:jpg|jpeg|png)(?:\?[^\s<>"]*)?/gi;
  const matches = description.match(imageRegex);
  const firstImage = matches ? matches[0] : null;
  
  const cleanDescription = description.replace(imageRegex, '').trim();
  
  return {
    imageUrl: firstImage,
    cleanDescription
  };
};
