-- trainers 테이블에 phone 컬럼 추가
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS phone TEXT;

-- OTP 코드 테이블 (전화번호 인증용)
CREATE TABLE IF NOT EXISTS trainer_otp (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  phone        TEXT        NOT NULL,
  code         TEXT        NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  used         BOOLEAN     DEFAULT FALSE,
  attempt_count INTEGER    DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 세션 테이블 (로그인 유지용)
CREATE TABLE IF NOT EXISTS trainer_sessions (
  token      UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID        NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_trainer_otp_phone    ON trainer_otp(phone, expires_at);
CREATE INDEX IF NOT EXISTS idx_trainer_sessions_tok ON trainer_sessions(token, expires_at);

-- anon 키로 API Route에서 접근 허용 (RLS 비활성화)
ALTER TABLE trainer_otp      DISABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_sessions DISABLE ROW LEVEL SECURITY;
