import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { NavBar } from "./nav-bar";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export async function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      <NavBar />
      <main className="min-h-[calc(100vh-3.5rem)] bg-stone-50">
        {children}
      </main>
    </>
  );
}
