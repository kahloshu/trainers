import { supabase } from "@/lib/supabase";

/* ── 타입 ── */
export type Trainer = {
  id: string;
  name: string;
  specialty: string;
  careerYears: number;
  shortBio: string;
  introduction: string;
  career: string[];
  certifications: string[];
  tags: string[];
  ratingAvg: number;
  reviewCount: number;
  profileImage: string;
  galleryImages: string[];  // Supabase Storage public URLs
  kakaoId?: string;         // 카카오톡 오픈채팅 URL 또는 ID
  instagramId?: string;     // 인스타그램 URL 또는 @아이디
  featured?: boolean;
  isActive?: boolean;      // 활성/비활성
  branch?: string;         // 지점
  displayOrder?: number;   // 노출 순서
};

export type Review = {
  id: string;
  trainerId: string;
  authorMasked: string;
  rating: number;
  comment: string;
  daysAgo: number;
};

/* ── DB 행 → TypeScript 타입 변환 ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTrainer(row: any): Trainer {
  return {
    id:             row.id,
    name:           row.name,
    specialty:      row.specialty,
    careerYears:    row.career_years,
    shortBio:       row.short_bio,
    introduction:   row.introduction ?? "",
    career:         row.career ?? [],
    certifications: row.certifications ?? [],
    tags:           row.tags ?? [],
    ratingAvg:      Number(row.rating_avg),
    reviewCount:    row.review_count,
    profileImage:   row.profile_image ?? "",
    galleryImages:  row.gallery_images ?? [],
    kakaoId:        row.kakao_id ?? "",
    instagramId:    row.instagram_id ?? "",
    featured:       row.featured ?? false,
    isActive:       row.is_active ?? true,
    branch:         row.branch ?? "",
    displayOrder:   row.display_order ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToReview(row: any): Review {
  const createdAt = new Date(row.created_at).getTime();
  const daysAgo   = Math.floor((Date.now() - createdAt) / 86400000);
  return {
    id:           row.id,
    trainerId:    row.trainer_id,
    authorMasked: row.author_masked,
    rating:       row.rating,
    comment:      row.comment,
    daysAgo,
  };
}

/* ── CRUD ── */

export async function getAllTrainers(): Promise<Trainer[]> {
  const { data, error } = await supabase
    .from("trainers")
    .select("*")
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("featured", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) { console.error("[getAllTrainers]", error); return []; }
  return (data ?? []).map(rowToTrainer);
}

export async function getTrainerById(id: string): Promise<Trainer | null> {
  const { data, error } = await supabase
    .from("trainers")
    .select("*")
    .eq("id", id)
    .single();
  if (error) { console.error("[getTrainerById]", error); return null; }
  return data ? rowToTrainer(data) : null;
}

export async function addTrainer(t: Omit<Trainer, "ratingAvg" | "reviewCount">): Promise<void> {
  const { error } = await supabase.from("trainers").insert({
    id:             t.id,
    name:           t.name,
    specialty:      t.specialty,
    career_years:   t.careerYears,
    short_bio:      t.shortBio,
    introduction:   t.introduction,
    career:         t.career ?? [],
    certifications: t.certifications,
    tags:           t.tags,
    rating_avg:     0,
    review_count:   0,
    profile_image:  t.profileImage,
    gallery_images: t.galleryImages ?? [],
    kakao_id:       t.kakaoId ?? "",
    instagram_id:   t.instagramId ?? "",
    featured:       false,
    is_active:      t.isActive ?? true,
    branch:         t.branch ?? "",
    display_order:  t.displayOrder ?? 0,
  });
  if (error) console.error("[addTrainer]", error);
}

export async function updateTrainer(t: Trainer): Promise<boolean> {
  const { error } = await supabase.from("trainers").upsert({
    id:             t.id,
    name:           t.name,
    specialty:      t.specialty,
    career_years:   t.careerYears,
    short_bio:      t.shortBio,
    introduction:   t.introduction,
    career:         t.career ?? [],
    certifications: t.certifications,
    tags:           t.tags,
    rating_avg:     t.ratingAvg,
    review_count:   t.reviewCount,
    profile_image:  t.profileImage,
    gallery_images: t.galleryImages ?? [],
    kakao_id:       t.kakaoId ?? "",
    instagram_id:   t.instagramId ?? "",
    featured:       t.featured ?? false,
    is_active:      t.isActive ?? true,
    branch:         t.branch ?? "",
    display_order:  t.displayOrder ?? 0,
  });
  if (error) { console.error("[updateTrainer]", error); return false; }
  return true;
}

export async function deleteTrainer(id: string): Promise<void> {
  const { error } = await supabase.from("trainers").delete().eq("id", id);
  if (error) console.error("[deleteTrainer]", error);
}

export async function toggleFeatured(id: string): Promise<boolean> {
  const trainer = await getTrainerById(id);
  if (!trainer) return false;
  const { error } = await supabase
    .from("trainers")
    .update({ featured: !trainer.featured })
    .eq("id", id);
  if (error) { console.error("[toggleFeatured]", error); return false; }
  return !trainer.featured;
}

export async function toggleActive(id: string): Promise<boolean> {
  const trainer = await getTrainerById(id);
  if (!trainer) return false;
  const next = !(trainer.isActive ?? true);
  const { error } = await supabase
    .from("trainers")
    .update({ is_active: next })
    .eq("id", id);
  if (error) { console.error("[toggleActive]", error); return false; }
  return next;
}

/** 여러 트레이너의 display_order를 한 번에 업데이트 */
export async function updateDisplayOrders(
  updates: { id: string; displayOrder: number }[]
): Promise<void> {
  const promises = updates.map(({ id, displayOrder }) =>
    supabase.from("trainers").update({ display_order: displayOrder }).eq("id", id)
  );
  const results = await Promise.all(promises);
  results.forEach(({ error }) => {
    if (error) console.error("[updateDisplayOrders]", error);
  });
}

/* ── 리뷰 ── */

export async function getAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("[getAllReviews]", error); return []; }
  return (data ?? []).map(rowToReview);
}

export async function getReviewsByTrainerId(trainerId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: false });
  if (error) { console.error("[getReviewsByTrainerId]", error); return []; }
  return (data ?? []).map(rowToReview);
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) console.error("[deleteReview]", error);
}

/* ── 유틸 ── */

export function shuffleTrainers(trainers: Trainer[]): Trainer[] {
  const featured = trainers.filter((t) => t.featured && (t.isActive !== false));
  const rest     = [...trainers.filter((t) => !t.featured && (t.isActive !== false))].sort(() => Math.random() - 0.5);
  return [...featured, ...rest];
}

/* ── 갤러리 이미지 Storage ── */

/** 갤러리 이미지 1장 업로드 → public URL 반환 */
export async function uploadGalleryImage(
  trainerId: string,
  blob: Blob,
  ext: string
): Promise<string | null> {
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `trainers/${trainerId}/gallery/${filename}`;
  const { error } = await supabase.storage
    .from("trainer-images")
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) { console.error("[uploadGalleryImage]", error); return null; }
  const { data } = supabase.storage.from("trainer-images").getPublicUrl(path);
  return data.publicUrl;
}

/** 갤러리 이미지 여러 장 삭제 (Storage에서 제거) */
export async function deleteGalleryImages(urls: string[]): Promise<void> {
  const paths = urls
    .map((url) => {
      const m = url.match(/\/trainer-images\/(.+)$/);
      return m ? m[1] : null;
    })
    .filter((p): p is string => p !== null);
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from("trainer-images").remove(paths);
  if (error) console.error("[deleteGalleryImages]", error);
}

/* ── 카테고리 (정적) ── */
export const CATEGORIES = [
  { id: "all",        label: "전체"   },
  { id: "근력 향상",  label: "근력"   },
  { id: "다이어트",   label: "다이어트" },
  { id: "재활 트레이닝", label: "재활" },
  { id: "체형 교정",  label: "체형 교정" },
  { id: "필라테스",   label: "필라테스" },
  { id: "체력 증진",  label: "체력 증진" },
];

/* ── 지점 목록 (정적) ── */
export const BRANCHES = [
  "코엑스점", "IFC점", "잠실점", "역삼점",
];
