-- Supabase SQL Editor 또는 마이그레이션 실행
-- applications 테이블에 신청번호 컬럼 추가

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS application_number TEXT UNIQUE;

-- 기존 데이터에 임시 신청번호 부여 (레거시 데이터 대응)
UPDATE applications
SET application_number = 'JG-' || EXTRACT(YEAR FROM created_at)::TEXT || '-' ||
  UPPER(SUBSTRING(MD5(id::TEXT) FROM 1 FOR 6))
WHERE application_number IS NULL;

-- 이후 신규 신청에서는 앱에서 생성해서 INSERT 시 전달됨
