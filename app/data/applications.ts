import { supabase } from "@/lib/supabase";

/* ── 타입 ── */
export type AppStatus =
  | "pending"            // 레거시 (접수됨으로 표시)
  | "received"           // 접수됨
  | "checking"           // 확인중
  | "contact_scheduled"  // 연락 예정
  | "scheduling"         // 일정 조율중
  | "confirmed"          // 확정됨
  | "completed"          // 완료
  | "cancelled";         // 취소됨

export type Application = {
  id: string;
  applicationNumber: string;
  applicantName: string;
  applicantPhone: string;
  trainerId: string;
  trainerName: string;
  purposes: string[];
  preferredDays: string[];
  preferredTimes: string[];
  userMessage: string;
  adminNote: string;
  status: AppStatus;
  createdAt: string;
  createdMinutesAgo: number;
};

/* ── 신청번호 생성 ── */
// 예측하기 어려운 6자리 (혼동되는 0,O,1,I 제외)
function generateApplicationNumber(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `JG-${year}-${suffix}`;
}

/* ── 전화번호 마스킹 ── */
export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})-(\d{3,4})-(\d{4})/, (_, p1, p2, p3) => {
    return `${p1}-${"*".repeat(p2.length)}-${p3}`;
  });
}

/* ── DB 행 변환 ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToApp(row: any): Application {
  const createdAt = row.created_at as string;
  const createdMinutesAgo = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 60000
  );
  return {
    id:                row.id,
    applicationNumber: row.application_number ?? "",
    applicantName:     row.applicant_name,
    applicantPhone:    row.applicant_phone,
    trainerId:         row.trainer_id,
    trainerName:       row.trainer_name,
    purposes:          row.purposes ?? [],
    preferredDays:     row.preferred_days ?? [],
    preferredTimes:    row.preferred_times ?? [],
    userMessage:       row.user_message ?? "",
    adminNote:         row.admin_note ?? "",
    status:            row.status as AppStatus,
    createdAt,
    createdMinutesAgo,
  };
}

/* ── CRUD ── */

export async function getAllApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("[getAllApplications]", error); return []; }
  return (data ?? []).map(rowToApp);
}

export async function getApplicationById(id: string): Promise<Application | null> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();
  if (error) { console.error("[getApplicationById]", error); return null; }
  return data ? rowToApp(data) : null;
}

/** 신청번호로 단건 조회 */
export async function getApplicationByNumber(
  applicationNumber: string
): Promise<Application | null> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("application_number", applicationNumber.toUpperCase().trim())
    .single();
  if (error) { console.error("[getApplicationByNumber]", error); return null; }
  return data ? rowToApp(data) : null;
}

/** 전화번호로 복수 조회 (최근순) */
export async function getApplicationsByPhone(
  phone: string
): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("applicant_phone", phone.trim())
    .order("created_at", { ascending: false });
  if (error) { console.error("[getApplicationsByPhone]", error); return []; }
  return (data ?? []).map(rowToApp);
}

/** 이름 + 전화번호로 복수 조회 (최근순) */
export async function getApplicationsByContact(
  name: string,
  phone: string
): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("applicant_name", name.trim())
    .eq("applicant_phone", phone.trim())
    .order("created_at", { ascending: false });
  if (error) { console.error("[getApplicationsByContact]", error); return []; }
  return (data ?? []).map(rowToApp);
}

/** 신청 등록 — 생성된 신청번호 반환 */
export async function addApplication(
  app: Omit<Application, "id" | "applicationNumber" | "createdAt" | "createdMinutesAgo" | "adminNote">
): Promise<string | null> {
  const applicationNumber = generateApplicationNumber();
  const { error } = await supabase.from("applications").insert({
    application_number: applicationNumber,
    applicant_name:     app.applicantName,
    applicant_phone:    app.applicantPhone,
    trainer_id:         app.trainerId,
    trainer_name:       app.trainerName,
    purposes:           app.purposes,
    preferred_days:     app.preferredDays,
    preferred_times:    app.preferredTimes,
    user_message:       app.userMessage,
    admin_note:         "",
    status:             app.status,
  });
  if (error) { console.error("[addApplication]", error); return null; }
  return applicationNumber;
}

export async function updateApplicationStatus(
  id: string,
  status: AppStatus
): Promise<void> {
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id);
  if (error) console.error("[updateApplicationStatus]", error);
}

export async function updateApplicationTrainer(
  id: string,
  trainerId: string,
  trainerName: string
): Promise<void> {
  const { error } = await supabase
    .from("applications")
    .update({ trainer_id: trainerId, trainer_name: trainerName })
    .eq("id", id);
  if (error) console.error("[updateApplicationTrainer]", error);
}

export async function updateApplicationNote(
  id: string,
  adminNote: string
): Promise<void> {
  const { error } = await supabase
    .from("applications")
    .update({ admin_note: adminNote })
    .eq("id", id);
  if (error) console.error("[updateApplicationNote]", error);
}

/* ── 레이블 ── */
export const STATUS_LABEL: Record<AppStatus, string> = {
  pending:           "접수됨",
  received:          "접수됨",
  checking:          "확인중",
  contact_scheduled: "연락 예정",
  scheduling:        "일정 조율중",
  confirmed:         "확정됨",
  completed:         "완료",
  cancelled:         "취소됨",
};

export const STATUS_COLOR: Record<AppStatus, { text: string; bg: string; dot: string }> = {
  pending:           { text: "#60a5fa", bg: "rgba(96,165,250,0.10)",  dot: "#60a5fa" },
  received:          { text: "#60a5fa", bg: "rgba(96,165,250,0.10)",  dot: "#60a5fa" },
  checking:          { text: "#fbbf24", bg: "rgba(251,191,36,0.10)",  dot: "#fbbf24" },
  contact_scheduled: { text: "#a78bfa", bg: "rgba(167,139,250,0.10)", dot: "#a78bfa" },
  scheduling:        { text: "#fb923c", bg: "rgba(251,146,60,0.10)",  dot: "#fb923c" },
  confirmed:         { text: "#fbbf24", bg: "rgba(234,179,8,0.10)",   dot: "#eab308" },
  completed:         { text: "#34d399", bg: "rgba(52,211,153,0.10)",  dot: "#10b981" },
  cancelled:         { text: "#a0a0a0", bg: "rgba(90,90,90,0.10)",    dot: "#5a5a5a" },
};

export const DAY_LABEL: Record<string, string> = {
  weekday:  "평일",
  saturday: "토요일",
  sunday:   "일요일",
};

export const TIME_LABEL: Record<string, string> = {
  morning:   "오전",
  afternoon: "오후",
  evening:   "저녁",
};

export function timeAgoLabel(minutes: number): string {
  if (minutes < 1)  return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const h = Math.floor(minutes / 60);
  if (h < 24)       return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7)        return `${d}일 전`;
  return `${Math.floor(d / 7)}주 전`;
}
