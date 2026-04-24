/** 전화번호를 단방향 해시로 변환 — 원본 복원 불가 */
export async function hashPhone(phone: string): Promise<string> {
  const normalized = phone.replace(/\D/g, "");
  const data = new TextEncoder().encode("jg:" + normalized);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
