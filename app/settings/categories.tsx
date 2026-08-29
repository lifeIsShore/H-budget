import { ManageTaxonomyScreen } from "@/components/ManageTaxonomyScreen";
import { sampleTransactions } from "@/data/sampleData";

const categoryNames = ["Travel", "Food", "Equipment", "Software", "Other"];

export default function ManageCategories() {
  const items = categoryNames.map((name, i) => ({
    id: String(i + 1),
    name,
    usageCount: sampleTransactions.filter((t) => t.category === name).length,
  }));

  return <ManageTaxonomyScreen title="Manage Categories" initialItems={items} singularLabel="category" />;
}
