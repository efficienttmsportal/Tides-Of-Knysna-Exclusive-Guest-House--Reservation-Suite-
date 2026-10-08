import { AttractionItem } from '../types';

export interface AttractionStatusResult {
  label: string;
  status: 'open' | 'closed';
}

export const getAttractionStatus = (att: AttractionItem): AttractionStatusResult => {
  const openingTime = att.openingTime || (att.isEmergency ? '00:00' : '08:00');
  const closingTime = att.closingTime || (att.isEmergency ? '23:59' : '17:00');

  if (att.isEmergency || openingTime === '24/7' || closingTime === '24/7' || (openingTime === '00:00' && closingTime === '23:59')) {
    return { label: '🟢 24/7 Open', status: 'open' };
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMin;

  const [openH, openM] = openingTime.split(':').map(Number);
  const [closeH, closeM] = closingTime.split(':').map(Number);

  if (isNaN(openH) || isNaN(closeH)) {
    return { label: `${openingTime} - ${closingTime}`, status: 'open' };
  }

  const openTimeVal = openH * 60 + (openM || 0);
  const closeTimeVal = closeH * 60 + (closeM || 0);

  const isOpen = currentTimeVal >= openTimeVal && currentTimeVal <= closeTimeVal;

  return {
    label: isOpen ? `🟢 Open Now (${openingTime} - ${closingTime})` : `🔴 Closed (Opens ${openingTime})`,
    status: isOpen ? 'open' : 'closed'
  };
};
