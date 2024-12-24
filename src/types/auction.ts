export interface Auction {
  title: string;
  description: string;
  images: string;
  bidStepSats: number;
  durationMonths: number;
  startTimestamp: number;
  finishTimestamp: number;
  status: "started" | "ended";
}

export interface FormData {
  title: string;
  description: string;
  images: string;
  bidStepSats: number;
  durationDays: number;
}
