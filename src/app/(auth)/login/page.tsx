import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "로그인 | Customer Success Tracker",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-950 px-4">
      <LoginForm />
    </main>
  );
}
