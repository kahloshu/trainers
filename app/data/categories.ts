import { supabase } from "@/lib/supabase";

export type Category = {
  id: string;
  label: string;
  displayOrder: number;
};

function rowToCategory(row: { id: string; label: string; display_order: number }): Category {
  return { id: row.id, label: row.label, displayOrder: row.display_order };
}

let _cache: Category[] | null = null;

export async function getCategories(): Promise<Category[]> {
  if (_cache) return _cache;
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) { console.error("[getCategories]", error); return []; }
  _cache = (data ?? []).map(rowToCategory);
  return _cache;
}

export function invalidateCategoriesCache() { _cache = null; }

export async function addCategory(id: string, label: string): Promise<boolean> {
  const { data: existing } = await supabase.from("categories").select("display_order").order("display_order", { ascending: false }).limit(1);
  const nextOrder = ((existing?.[0]?.display_order) ?? 0) + 1;
  const { error } = await supabase.from("categories").insert({ id, label, display_order: nextOrder });
  if (error) { console.error("[addCategory]", error); return false; }
  invalidateCategoriesCache();
  return true;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) console.error("[deleteCategory]", error);
  invalidateCategoriesCache();
}
