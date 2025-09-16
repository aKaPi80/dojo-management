export class QRGenerator {
  static generateMemberQR(userId: string): string {
    // Generar un código QR único para cada miembro
    const baseUrl = window.location.origin;
    const qrCode = `SKBC-${userId}-${Date.now().toString(36)}`;
    return `${baseUrl}/member/${qrCode}`;
  }

  static generateQRCode(userId: string): string {
    // Código único para el carnet
    return `SKBC-${userId}-${Date.now().toString(36)}`;
  }

  static validateQRCode(qrCode: string): string | null {
    // Extraer el userId del código QR
    const parts = qrCode.split('-');
    if (parts.length >= 2 && parts[0] === 'SKBC') {
      return parts[1];
    }
    return null;
  }
}