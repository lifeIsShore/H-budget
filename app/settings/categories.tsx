import { useCategories } from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { ManageTaxonomyScreen } from "@/components/ManageTaxonomyScreen";

export default function ManageCategories() {
  const { categories, loading, add, edit, remove } = useCategories();
  const { transactions } = useTransactions();

  const items = categories.map((c) => ({
    id: c.id,
    name: c.name,
    usageCount: transactions.filter((t) => t.categoryId === c.id).length,
  }));

  return (
    <ManageTaxonomyScreen
      title="Manage Categories"
      items={items}
      singularLabel="category"
      loading={loading}
      onAdd={add}
      onEdit={edit}
      onDelete={remove}
    />
  );
}
