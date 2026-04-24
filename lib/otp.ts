/** 6자리 OTP 생성 */
export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** SMS 발송 (SMS 서비스 연동 시 여기에 구현) */
export async function sendSms(phone: string, code: string): Promise<void> {
  // TODO: Twilio / 네이버 클라우드 SMS 등 연동
  console.log(`[OTP] ${phone} → ${code}`);
}
