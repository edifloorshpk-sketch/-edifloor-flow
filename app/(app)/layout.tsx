import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <TopBar fullName={profile?.full_name ?? user.email ?? ""} role={profile?.role ?? "shitje"} />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-4 md:pb-8">{children}</main>
      <BottomNav />
    </div>
  );
}
