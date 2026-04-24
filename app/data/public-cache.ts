import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";
import { rowToCategory, type Category } from "./categories";
import { type Trainer } from "./trainers";

const LIST_FIELDS =
  "id,name,specialty,tags,short_bio,profile_image,career_years,rating_avg,review_count,featured,is_active,branch,display_order";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTrainer(row: any): Trainer {
  return {
    id:            row.id,
    name:          row.name,
    specialty:     row.specialty,
    careerYears:   row.career_years,
    shortBio:      row.short_bio,
    introduction:  row.introduction ?? "",
    career:        row.career ?? [],
    certifications: row.certifications ?? [],
    tags:          row.tags ?? [],
    ratingAvg:     Number(row.rating_avg),
    reviewCount:   row.review_count,
    profileImage:  row.profile_image ?? "",
    galleryImages: row.gallery_images ?? [],
    kakaoId:       row.kakao_id ?? "",
    instagramId:   row.instagram_id ?? "",
    featured:      row.featured ?? false,
    isActive:      row.is_active ?? true,
    branch:        row.branch ?? "",
    displayOrder:  row.display_order ?? 0,
  };
}

export const getCategoriesCached = unstable_cache(
  async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) { console.error("[getCategoriesCached]", error); return []; }
    return (data ?? []).map(rowToCategory);
  },
  ["categories"],
  { revalidate: 300 } // 5분
);

export const getTrainersForListCached = unstable_cache(
  async (): Promise<Trainer[]> => {
    const { data, error } = await supabase
      .from("trainers")
      .select(LIST_FIELDS)
      .eq("is_active", true)
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("featured", { ascending: false });
    if (error) { console.error("[getTrainersForListCached]", error); return []; }
    return (data ?? []).map(rowToTrainer);
  },
  ["trainers-list"],
  { revalidate: 60 } // 1분
);
