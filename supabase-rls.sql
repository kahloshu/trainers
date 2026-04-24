-- =====================================================
-- James Gym — Row Level Security 정책
-- Supabase 대시보드 > SQL Editor에서 실행
-- =====================================================

-- RLS 활성화
ALTER TABLE trainers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_otp      ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_sessions ENABLE ROW LEVEL SECURITY;

-- ── trainers ──────────────────────────────────────
-- anon: 활성 트레이너만 읽기 (공개 페이지)
CREATE POLICY "anon_read_active_trainers" ON trainers
  FOR SELECT TO anon
  USING (is_active = true);

-- authenticated (대시보드 관리자): 전체 CRUD
CREATE POLICY "admin_all_trainers" ON trainers
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── categories ────────────────────────────────────
CREATE POLICY "anon_read_categories" ON categories
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "admin_all_categories" ON categories
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── reviews ───────────────────────────────────────
-- anon: 읽기 + 작성 (reviewer_phone은 해시 저장이므로 노출 무방)
CREATE POLICY "anon_read_reviews" ON reviews
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_insert_reviews" ON reviews
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "admin_all_reviews" ON reviews
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── applications ──────────────────────────────────
-- anon: 신청 제출 + 본인 조회 (전화번호 기반 /my, /lookup 페이지)
-- 주의: 전화번호를 아는 사람은 타인 신청 내역 조회 가능 (알려진 한계)
--       향후 OTP 인증 후 API Route를 통한 조회로 개선 권장
CREATE POLICY "anon_insert_applications" ON applications
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_read_applications" ON applications
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "admin_all_applications" ON applications
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── trainer_otp ───────────────────────────────────
-- 정책 없음 = anon/authenticated 접근 불가
-- service_role(supabaseAdmin)만 접근 가능 → API Route에서 처리

-- ── trainer_sessions ──────────────────────────────
-- 정책 없음 = anon/authenticated 접근 불가
-- service_role(supabaseAdmin)만 접근 가능 → API Route에서 처리
