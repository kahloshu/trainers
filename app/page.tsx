import { getCategoriesCached, getTrainersForListCached } from "@/app/data/public-cache";
import TrainerListClient from "@/app/components/TrainerListClient";

export default async function TrainerListPage() {
  const [trainers, categories] = await Promise.all([
    getTrainersForListCached(),
    getCategoriesCached(),
  ]);

  return <TrainerListClient trainers={trainers} categories={categories} />;
}
