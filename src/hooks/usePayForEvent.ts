import { RELAY_DOMAIN } from "../constants/common";

export function usePayForEvent() {
  const getInvoice = async (eventId: string) => {
    try {
      const paymentResponse = await fetch(
        `https://${RELAY_DOMAIN}/pay-for-event?id=${eventId}`,
        { headers: new Headers({ "ngrok-skip-browser-warning": "69420" })}
      );
      
      if (!paymentResponse.ok) {
        throw new Error('Payment request failed');
      }
      
      return await paymentResponse.text();
    } catch (error) {
      throw error;
    }
  };

  return { getInvoice };
}
