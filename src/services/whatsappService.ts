/**
 * WhatsApp Deep Link Service for Tides of Knysna
 * Formats document URLs and reservation details into WhatsApp deep links (`https://wa.me/`)
 * with pre-filled messages and PDF attachment links.
 */

export interface WhatsAppMessageParams {
  phoneNumber?: string; // e.g. "+2781266956" or customer phone
  guestName: string;
  documentTitle: string;
  reservationNumber: string;
  roomNumber?: string;
  documentUrl?: string; // e.g. public download link or PDF reference
  additionalNotes?: string;
}

/**
 * Formats a WhatsApp deep link URL with pre-filled message
 */
export function generateWhatsAppDeepLink(params: WhatsAppMessageParams): string {
  const phone = params.phoneNumber ? params.phoneNumber.replace(/[^0-9]/g, '') : '2781266956';
  
  const textLines = [
    `*TIDES OF KNYSNA - GUEST SUITE*`,
    `Official Document Dispatch`,
    ``,
    `Dear ${params.guestName},`,
    `Here is your official document: *${params.documentTitle}*`,
    `Reservation: #${params.reservationNumber}${params.roomNumber ? ` (Room ${params.roomNumber})` : ''}`,
    ``,
    params.documentUrl ? `📄 View / Download Document PDF:\n${params.documentUrl}` : `📄 Generated PDF is ready on your portal.`,
    ``,
    params.additionalNotes ? `${params.additionalNotes}\n` : '',
    `Warm regards,`,
    `Concierge Desk & Instant Dispatch`,
    `Tel / WhatsApp: +27 81 266 956`
  ].filter(Boolean).join('\n');

  const encodedText = encodeURIComponent(textLines);
  return `https://wa.me/${phone}?text=${encodedText}`;
}

/**
 * Opens WhatsApp share window with pre-filled message and PDF link
 */
export function shareDocumentViaWhatsApp(params: WhatsAppMessageParams): void {
  const url = generateWhatsAppDeepLink(params);
  window.open(url, '_blank');
}
