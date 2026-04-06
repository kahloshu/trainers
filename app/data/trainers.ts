export type Trainer = {
  id: string;
  name: string;
  specialty: string;
  careerYears: number;
  shortBio: string;
  introduction: string;
  certifications: string[];
  tags: string[];
  ratingAvg: number;
  reviewCount: number;
  profileImage: string;
};

export type Review = {
  id: string;
  trainerId: string;
  authorMasked: string;
  rating: number;
  comment: string;
  daysAgo: number;
};

export const TRAINERS: Trainer[] = [
  {
    id: "1",
    name: "김민준",
    specialty: "퍼스널 트레이닝",
    careerYears: 7,
    shortBio: "몸의 변화보다 습관의 변화를 만들어 드립니다.",
    introduction:
      "10년간 국가대표 선수 출신의 트레이너로, 기능성 훈련과 체형 교정을 전문으로 합니다. 각 회원의 체력 수준과 목표에 맞는 프로그램을 설계하며, 운동이 삶의 루틴이 될 수 있도록 함께합니다. 현재 제임스짐 소속으로 활동 중입니다.",
    certifications: [
      "생활스포츠지도사 2급",
      "NSCA-CPT 자격 보유",
      "前 국가대표 트레이닝 코치",
      "現 제임스짐 소속 7년차",
    ],
    tags: ["근력 향상", "체형 교정", "재활 트레이닝"],
    ratingAvg: 4.9,
    reviewCount: 23,
    profileImage: "",
  },
  {
    id: "2",
    name: "박서연",
    specialty: "다이어트 · 필라테스",
    careerYears: 5,
    shortBio: "지속 가능한 몸을 함께 만들어 갑니다.",
    introduction:
      "무리하지 않으면서도 확실히 변화하는 방법을 알고 있습니다. 다이어트와 필라테스를 접목한 프로그램으로 체형 개선과 함께 일상적인 컨디션 향상을 도와드립니다. 특히 처음 운동을 시작하는 분들께 편안한 환경을 제공합니다.",
    certifications: [
      "생활스포츠지도사 2급",
      "필라테스 지도자 1급",
      "식품영양학과 졸업",
      "現 제임스짐 소속 5년차",
    ],
    tags: ["다이어트", "필라테스", "체형 교정"],
    ratingAvg: 4.7,
    reviewCount: 18,
    profileImage: "",
  },
  {
    id: "3",
    name: "이강훈",
    specialty: "기능성 트레이닝",
    careerYears: 9,
    shortBio: "운동이 삶의 일부가 될 수 있도록 돕겠습니다.",
    introduction:
      "스포츠 과학을 기반으로 한 기능성 트레이닝 전문 트레이너입니다. 단순한 근육 강화를 넘어 일상 동작의 효율을 높이고, 부상 없이 오래 운동할 수 있는 몸을 만드는 데 집중합니다. 9년의 현장 경험을 통해 다양한 체력 수준의 회원을 지도해 왔습니다.",
    certifications: [
      "체육학 학사",
      "CSCS 공인 전문 트레이너",
      "KPTI 기능성 트레이닝 강사",
      "現 제임스짐 소속 9년차",
    ],
    tags: ["근력 향상", "재활 트레이닝", "체력 증진"],
    ratingAvg: 4.8,
    reviewCount: 41,
    profileImage: "",
  },
  {
    id: "4",
    name: "최유진",
    specialty: "여성 전문 트레이닝",
    careerYears: 4,
    shortBio: "작은 변화가 쌓여 큰 결과를 만듭니다.",
    introduction:
      "여성 체형의 특성을 깊이 이해하고, 무릎·골반·어깨 등 여성에게 취약한 부위를 집중적으로 관리하는 프로그램을 운영합니다. 다이어트부터 산전·산후 회복, 필라테스까지 여성의 라이프스타일 전반을 함께 설계합니다.",
    certifications: [
      "생활스포츠지도사 2급",
      "필라테스 지도자 자격",
      "산전산후 운동 전문 과정 수료",
      "現 제임스짐 소속 4년차",
    ],
    tags: ["다이어트", "필라테스", "체형 교정"],
    ratingAvg: 4.6,
    reviewCount: 12,
    profileImage: "",
  },
  {
    id: "5",
    name: "정동현",
    specialty: "재활 · 체형 교정",
    careerYears: 11,
    shortBio: "통증 없이, 오래 운동할 수 있는 몸을 만듭니다.",
    introduction:
      "스포츠 재활 분야에서 11년을 전문적으로 활동해 온 트레이너입니다. 허리 디스크, 무릎 통증, 어깨 충돌 증후군 등 만성 통증을 가진 분들에게 특화된 프로그램을 제공합니다. 의료진과의 협업 경험을 바탕으로 안전하고 체계적인 재활 운동을 설계합니다.",
    certifications: [
      "운동처방사 자격",
      "스포츠 재활 전문 과정 수료",
      "병원 연계 재활 트레이닝 5년",
      "現 제임스짐 소속 11년차",
    ],
    tags: ["재활 트레이닝", "체형 교정", "근력 향상"],
    ratingAvg: 5.0,
    reviewCount: 37,
    profileImage: "",
  },
  {
    id: "6",
    name: "한수빈",
    specialty: "체력 증진 · 다이어트",
    careerYears: 3,
    shortBio: "처음 시작하는 분들을 가장 잘 압니다.",
    introduction:
      "운동을 처음 시작하는 분들에게 낯설지 않은 환경과 속도를 제공합니다. 기초 체력부터 차근차근 쌓아 올리며, 꾸준히 이어갈 수 있는 습관을 함께 만들어 드립니다. 과하지 않은 운동 강도로 시작하여 점진적으로 성장하는 과정을 즐겁게 경험할 수 있도록 안내합니다.",
    certifications: [
      "생활스포츠지도사 2급",
      "퍼스널 트레이너 전문 과정 수료",
      "現 제임스짐 소속 3년차",
    ],
    tags: ["다이어트", "체력 증진"],
    ratingAvg: 4.5,
    reviewCount: 8,
    profileImage: "",
  },
];

export const REVIEWS: Review[] = [
  { id: "r1", trainerId: "1", authorMasked: "이*영", rating: 5, comment: "정말 꼼꼼하게 봐주세요. 자세 교정부터 세세하게 챙겨주셔서 좋았습니다.", daysAgo: 3 },
  { id: "r2", trainerId: "1", authorMasked: "박*준", rating: 5, comment: "처음이라 긴장했는데 편하게 설명해 주셔서 좋았어요.", daysAgo: 7 },
  { id: "r3", trainerId: "1", authorMasked: "최*호", rating: 5, comment: "운동 목적에 맞게 프로그램을 잘 구성해 주셨습니다.", daysAgo: 14 },
  { id: "r4", trainerId: "2", authorMasked: "김*연", rating: 5, comment: "부드럽게 시작할 수 있어서 부담이 없었어요.", daysAgo: 2 },
  { id: "r5", trainerId: "2", authorMasked: "이*현", rating: 4, comment: "친절하고 체계적으로 알려주십니다. 다음에도 신청할 것 같아요.", daysAgo: 10 },
  { id: "r6", trainerId: "3", authorMasked: "정*우", rating: 5, comment: "기능성 훈련의 개념부터 잘 설명해 주셔서 이해하기 쉬웠습니다.", daysAgo: 5 },
  { id: "r7", trainerId: "3", authorMasked: "한*진", rating: 5, comment: "오래된 허리 통증이 나아지는 느낌입니다.", daysAgo: 12 },
  { id: "r8", trainerId: "3", authorMasked: "오*수", rating: 4, comment: "전문적이고 신뢰가 갑니다.", daysAgo: 20 },
  { id: "r9", trainerId: "4", authorMasked: "장*민", rating: 5, comment: "여성 트레이닝에 특화되어 있어서 편안했습니다.", daysAgo: 6 },
  { id: "r10", trainerId: "5", authorMasked: "류*훈", rating: 5, comment: "무릎 통증이 있었는데 안전하게 운동할 수 있었습니다.", daysAgo: 4 },
  { id: "r11", trainerId: "5", authorMasked: "윤*경", rating: 5, comment: "재활 전문이라 믿고 맡길 수 있었어요.", daysAgo: 9 },
  { id: "r12", trainerId: "6", authorMasked: "강*혁", rating: 5, comment: "처음인데 전혀 어렵지 않게 안내해 주셨어요.", daysAgo: 1 },
];

export const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "근력 향상", label: "근력" },
  { id: "다이어트", label: "다이어트" },
  { id: "재활 트레이닝", label: "재활" },
  { id: "체형 교정", label: "체형 교정" },
  { id: "필라테스", label: "필라테스" },
  { id: "체력 증진", label: "체력 증진" },
];

/* ── localStorage 기반 동적 트레이너 (페이지 간 공유) ── */
const STORAGE_KEY = "jamesgym_trainers";

function getStoredTrainers(): Trainer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Trainer[]) : [];
  } catch {
    return [];
  }
}

export function addTrainer(t: Trainer): void {
  if (typeof window === "undefined") return;
  const existing = getStoredTrainers();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([t, ...existing]));
}

export function deleteTrainer(id: string): void {
  if (typeof window === "undefined") return;
  const existing = getStoredTrainers();
  const filtered = existing.filter((t) => t.id !== id);
  if (filtered.length !== existing.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
}

export function updateTrainer(updated: Trainer): void {
  if (typeof window === "undefined") return;
  const existing = getStoredTrainers();
  const idx = existing.findIndex((t) => t.id === updated.id);
  if (idx !== -1) {
    existing[idx] = updated;
  } else {
    // 정적 배열 트레이너를 처음 수정할 때 localStorage에 추가
    existing.unshift(updated);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getAllTrainers(): Trainer[] {
  const stored = getStoredTrainers();
  const storedIds = new Set(stored.map((t) => t.id));
  // localStorage 버전이 있으면 정적 배열 버전은 제외 (중복 방지)
  const staticOnly = TRAINERS.filter((t) => !storedIds.has(t.id));
  return [...stored, ...staticOnly];
}

export function shuffleTrainers(trainers: Trainer[]): Trainer[] {
  return [...trainers].sort(() => Math.random() - 0.5);
}

export function getTrainerById(id: string): Trainer | undefined {
  return getAllTrainers().find((t) => t.id === id);
}

export function getReviewsByTrainerId(trainerId: string): Review[] {
  return REVIEWS.filter((r) => r.trainerId === trainerId);
}
