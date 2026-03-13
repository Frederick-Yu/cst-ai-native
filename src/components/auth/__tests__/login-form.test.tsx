import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "../login-form";

// next-auth/react mock
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

// next/navigation mock
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// UI 컴포넌트 mock (base-ui 의존성 제거)
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ComponentProps<"button">) => (
    <button {...props}>{children}</button>
  ),
}));
jest.mock("@/components/ui/input", () => ({
  Input: (props: React.ComponentProps<"input">) => <input {...props} />,
}));
jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: React.ComponentProps<"label">) => (
    <label {...props}>{children}</label>
  ),
}));
jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock("lucide-react", () => ({
  ShieldAlert: () => <svg aria-hidden="true" />,
}));

import { signIn } from "next-auth/react";

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("이메일, 비밀번호 입력 필드와 제출 버튼이 렌더링됨", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
  });

  it("이메일 필드에 aria-required 속성 존재", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("이메일")).toHaveAttribute("aria-required", "true");
  });

  it("비밀번호 필드에 aria-required 속성 존재", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("비밀번호")).toHaveAttribute("aria-required", "true");
  });

  it("로그인 성공 시 /dashboard로 이동", async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: null });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "admin@example.com" } });
    fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "admin1234" } });
    fireEvent.submit(screen.getByRole("form", { name: "로그인 폼" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("로그인 실패 시 에러 메시지 표시", async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: "CredentialsSignin" });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "wrong@example.com" } });
    fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "wrongpassword" } });
    fireEvent.submit(screen.getByLabelText("이메일").closest("form")!);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "이메일 또는 비밀번호가 올바르지 않습니다."
      );
    });
  });

  it("로딩 중 버튼 비활성화", async () => {
    let resolve: (value: unknown) => void;
    (signIn as jest.Mock).mockImplementation(
      () => new Promise((r) => { resolve = r; })
    );

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "admin@example.com" } });
    fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "admin1234" } });
    fireEvent.submit(screen.getByLabelText("이메일").closest("form")!);

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });

    resolve!({ error: null });
  });
});
