import { getFloorSystems } from "@/app/actions/requests";
import { NewWorkRequestForm } from "@/components/requests/new-request-form";

export default async function NewWorkRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const { customer } = await searchParams;
  const { systems, layers } = await getFloorSystems();

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">Kërkesë për punime</h1>
      <NewWorkRequestForm systems={systems} layers={layers as never} initialCustomerId={customer} />
    </div>
  );
}
