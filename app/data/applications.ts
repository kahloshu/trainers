import { supabase } from "@/lib/supabase";

/* ── 타입 ── */
export type AppStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type Application = {
  id: string;
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
  createdAt: string;       // ISO 문자열
  createdMinutesAgo: number; // 표시용 (computed)
};

/* ── DB 행 변환 ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToApp(row: any): Application {
  const createdAt       = row.created_at as string;
  const createdMinutesAgo = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 60000
  );
  return {
    id:               row.id,
    applicantName:    row.applicant_name,
    applicantPhone:   row.applicant_phone,
    trainerId:        row.trainer_id,
    trainerName:      row.trainer_name,
    purposes:         row.purposes ?? [],
    preferredDays:    row.preferred_days ?? [],
    preferredTimes:   row.preferred_times ?? [],
    userMessage:      row.user_message ?? "",
    adminNote:        row.admin_note ?? "",
    status:           row.status as AppStatus,
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

export async function addApplication(
  app: Omit<Application, "id" | "createdAt" | "createdMinutesAgo" | "adminNote">
): Promise<void> {
  const { error } = await supabase.from("applications").insert({
    applicant_name:  app.applicantName,
    applicant_phone: app.applicantPhone,
    trainer_id:      app.trainerId,
    trainer_name:    app.trainerName,
    purposes:        app.purposes,
    preferred_days:  app.preferredDays,
    preferred_times: app.preferredTimes,
    user_message:    app.userMessage,
    admin_note:      "",
    status:          app.status,
  });
  if (error) console.error("[addApplication]", error);
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

/* ── 레이블 (정적) ── */
export const STATUS_LABEL: Record<AppStatus, string> = {
  pending:   "대기 중",
  confirmed: "확정됨",
  completed: "완료",
  cancelled: "취소됨",
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
