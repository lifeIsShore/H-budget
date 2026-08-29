import { usePurposes } from "@/hooks/usePurposes";
import { useTransactions } from "@/hooks/useTransactions";
import { ManageTaxonomyScreen } from "@/components/ManageTaxonomyScreen";

export default function ManagePurposes() {
  const { purposes, loading, add, edit, remove } = usePurposes();
  const { transactions } = useTransactions();

  const items = purposes.map((p) => ({
    id: p.id,
    name: p.name,
    // Count real transactions referencing this purpose
    usageCount: transactions.filter((t) => t.purposeId === p.id).length,
  }));

  return (
    <ManageTaxonomyScreen
      title="Manage Purposes"
      items={items}
      singularLabel="purpose"
      loading={loading}
      onAdd={add}
      onEdit={edit}
      onDelete={remove}
    />
  );
}
