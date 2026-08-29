import { ManageTaxonomyScreen } from "@/components/ManageTaxonomyScreen";
import { samplePurposes, sampleTransactions } from "@/data/sampleData";

export default function ManagePurposes() {
  const items = samplePurposes.map((p) => ({
    id: p.id,
    name: p.name,
    usageCount: sampleTransactions.filter((t) => t.purpose === p.name).length,
  }));

  return <ManageTaxonomyScreen title="Manage Purposes" initialItems={items} singularLabel="purpose" />;
}
