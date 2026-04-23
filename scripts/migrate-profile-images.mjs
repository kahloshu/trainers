/**
 * 기존 트레이너의 base64 프로필 이미지를 Supabase Storage로 이전합니다.
 *
 * 실행 방법:
 *   node scripts/migrate-profile-images.mjs
 *
 * 필요 환경변수 (.env.local에서 자동 로드):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  (또는 SUPABASE_SERVICE_ROLE_KEY)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// .env.local 파싱
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => l.split("=").map((s) => s.trim()))
);

const SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"];
const SUPABASE_KEY = env["SUPABASE_SERVICE_ROLE_KEY"] ?? env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ SUPABASE_URL 또는 KEY가 없습니다.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  // base64로 저장된 트레이너만 가져오기
  const { data: trainers, error } = await supabase
    .from("trainers")
    .select("id, name, profile_image");

  if (error) { console.error("❌ 트레이너 조회 실패:", error.message); process.exit(1); }

  const base64Trainers = trainers.filter((t) => t.profile_image?.startsWith("data:"));
  console.log(`📋 base64 이미지 트레이너: ${base64Trainers.length}명`);

  if (base64Trainers.length === 0) {
    console.log("✅ 이전할 이미지가 없습니다.");
    return;
  }

  let success = 0;
  let fail = 0;

  for (const trainer of base64Trainers) {
    process.stdout.write(`  → ${trainer.name} (${trainer.id}) ... `);

    try {
      // base64 → Buffer
      const base64Data = trainer.profile_image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Storage 업로드
      const path = `trainers/${trainer.id}/profile.jpg`;
      const { error: upErr } = await supabase.storage
        .from("trainer-images")
        .upload(path, buffer, { contentType: "image/jpeg", upsert: true });

      if (upErr) { console.log(`❌ 업로드 실패: ${upErr.message}`); fail++; continue; }

      // public URL 가져오기
      const { data: urlData } = supabase.storage.from("trainer-images").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      // DB 업데이트
      const { error: dbErr } = await supabase
        .from("trainers")
        .update({ profile_image: publicUrl })
        .eq("id", trainer.id);

      if (dbErr) { console.log(`❌ DB 업데이트 실패: ${dbErr.message}`); fail++; continue; }

      console.log(`✅ ${publicUrl.slice(-40)}`);
      success++;
    } catch (e) {
      console.log(`❌ 오류: ${e.message}`);
      fail++;
    }
  }

  console.log(`\n완료: 성공 ${success}명 / 실패 ${fail}명`);
}

run();
