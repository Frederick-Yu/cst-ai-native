import { SignUpForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "회원가입 | Customer Success Tracker",
};

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-950 px-4">
      <SignUpForm />
    </main>
  );
}
