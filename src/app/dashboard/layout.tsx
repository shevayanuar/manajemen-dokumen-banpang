import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar user={session.user} />
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 p-4 lg:p-6 min-h-screen w-full" style={{ background: "var(--bg)" }}>
        {children}
      </main>
    </div>
  );
}