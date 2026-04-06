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
  createdMinutesAgo: number; // 표시용
};

export const APPLICATIONS: Application[] = [
  {
    id: "a1",
    applicantName: "이*영",
    applicantPhone: "010-****-5678",
    trainerId: "1",
    trainerName: "김민준",
    purposes: ["다이어트", "근력 향상"],
    preferredDays: ["weekday", "saturday"],
    preferredTimes: ["morning", "afternoon"],
    userMessage: "허리 디스크 병력 있습니다. 무리하지 않는 선에서 진행 부탁드립니다.",
    adminNote: "",
    status: "pending",
    createdMinutesAgo: 2,
  },
  {
    id: "a2",
    applicantName: "박*준",
    applicantPhone: "010-****-2341",
    trainerId: "2",
    trainerName: "박서연",
    purposes: ["체형 교정"],
    preferredDays: ["weekday"],
    preferredTimes: ["evening"],
    userMessage: "",
    adminNote: "",
    status: "pending",
    createdMinutesAgo: 13,
  },
  {
    id: "a3",
    applicantName: "최*호",
    applicantPhone: "010-****-9012",
    trainerId: "3",
    trainerName: "이강훈",
    purposes: ["체력 증진"],
    preferredDays: ["saturday", "sunday"],
    preferredTimes: ["morning"],
    userMessage: "",
    adminNote: "트레이너에게 전달 완료. 목요일 오전 확인 예정.",
    status: "confirmed",
    createdMinutesAgo: 75,
  },
  {
    id: "a4",
    applicantName: "정*민",
    applicantPhone: "010-****-3344",
    trainerId: "5",
    trainerName: "정동현",
    purposes: ["재활·통증"],
    preferredDays: ["weekday"],
    preferredTimes: ["afternoon"],
    userMessage: "무릎 통증으로 계단 오르기가 힘듭니다.",
    adminNote: "",
    status: "pending",
    createdMinutesAgo: 142,
  },
  {
    id: "a5",
    applicantName: "한*진",
    applicantPhone: "010-****-5566",
    trainerId: "1",
    trainerName: "김민준",
    purposes: ["근력 향상"],
    preferredDays: ["weekday"],
    preferredTimes: ["morning"],
    userMessage: "",
    adminNote: "3월 15일 오전 10시 확정.",
    status: "confirmed",
    createdMinutesAgo: 380,
  },
  {
    id: "a6",
    applicantName: "오*수",
    applicantPhone: "010-****-7788",
    trainerId: "4",
    trainerName: "최유진",
    purposes: ["다이어트", "필라테스"],
    preferredDays: ["saturday"],
    preferredTimes: ["afternoon", "evening"],
    userMessage: "",
    adminNote: "",
    status: "completed",
    createdMinutesAgo: 2880,
  },
  {
    id: "a7",
    applicantName: "류*훈",
    applicantPhone: "010-****-9900",
    trainerId: "5",
    trainerName: "정동현",
    purposes: ["재활·통증"],
    preferredDays: ["weekday"],
    preferredTimes: ["morning", "afternoon"],
    userMessage: "어깨 충돌 증후군 진단 받았습니다.",
    adminNote: "의사 소견서 확인 필요.",
    status: "completed",
    createdMinutesAgo: 4320,
  },
  {
    id: "a8",
    applicantName: "강*혁",
    applicantPhone: "010-****-1122",
    trainerId: "6",
    trainerName: "한수빈",
    purposes: ["체력 증진"],
    preferredDays: ["sunday"],
    preferredTimes: ["afternoon"],
    userMessage: "",
    adminNote: "",
    status: "cancelled",
    createdMinutesAgo: 5760,
  },
];

export const STATUS_LABEL: Record<AppStatus, string> = {
  pending: "대기 중",
  confirmed: "확정됨",
  completed: "완료",
  cancelled: "취소됨",
};

export const DAY_LABEL: Record<string, string> = {
  weekday: "평일",
  saturday: "토요일",
  sunday: "일요일",
};

export const TIME_LABEL: Record<string, string> = {
  morning: "오전",
  afternoon: "오후",
  evening: "저녁",
};

export function timeAgoLabel(minutes: number): string {
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  return `${Math.floor(d / 7)}주 전`;
}

/* 통계 */
export function getStats() {
  return {
    pending:   APPLICATIONS.filter((a) => a.status === "pending").length,
    confirmed: APPLICATIONS.filter((a) => a.status === "confirmed").length,
    completed: APPLICATIONS.filter((a) => a.status === "completed").length,
    total:     APPLICATIONS.length,
  };
}
