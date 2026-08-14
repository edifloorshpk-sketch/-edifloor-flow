import { getProductCatalog } from "@/app/actions/orders";
import { NewOrderForm } from "@/components/orders/new-order-form";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const { customer } = await searchParams;
  const products = await getProductCatalog();

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">Porosi produktesh</h1>
      <NewOrderForm products={products as never} initialCustomerId={customer} />
    </div>
  );
}
