import { getTrainersForList } from "@/app/data/trainers";
import { getCategories } from "@/app/data/categories";
import TrainerListClient from "@/app/components/TrainerListClient";

export const dynamic = "force-dynamic";

export default async function TrainerListPage() {
  const [trainers, categories] = await Promise.all([
    getTrainersForList(),
    getCategories(),
  ]);

  return <TrainerListClient trainers={trainers} categories={categories} />;
}
