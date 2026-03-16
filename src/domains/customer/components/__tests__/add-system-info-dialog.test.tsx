import React from "react";
import { render, screen } from "@testing-library/react";
import { AddSystemInfoDialog } from "@/domains/customer/components/add-system-info-dialog";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

jest.mock("@/domains/customer/actions/system-info.actions", () => ({
  createSystemInfo: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn() },
}));

jest.mock("@prisma/client", () => ({
  AssetType: {
    SERVER: "SERVER",
    DATABASE: "DATABASE",
    APPLICATION: "APPLICATION",
    NETWORK: "NETWORK",
    STORAGE: "STORAGE",
    OTHER: "OTHER",
  },
  ServiceEnv: {
    PRODUCTION: "PRODUCTION",
    STAGING: "STAGING",
    DEVELOPMENT: "DEVELOPMENT",
  },
}));

jest.mock("@/shared/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode; render?: React.ReactElement }) => (
    <div>{children}</div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("react", () => {
  const actual = jest.requireActual<typeof import("react")>("react");
  return { ...actual, useActionState: jest.fn() };
});

import { useActionState } from "react";
const mockUseActionState = useActionState as jest.Mock;

describe("AddSystemInfoDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseActionState.mockReturnValue([null, jest.fn(), false]);
  });

  it("시스템명, 유형, 환경, 호스트, 포트 필드가 렌더링된다", () => {
    render(<AddSystemInfoDialog customerId="cust-1" />);
    expect(screen.getByLabelText(/시스템명/)).toBeInTheDocument();
    expect(screen.getByLabelText(/유형/)).toBeInTheDocument();
    expect(screen.getByLabelText(/환경/)).toBeInTheDocument();
    expect(screen.getByLabelText(/호스트/)).toBeInTheDocument();
    expect(screen.getByLabelText(/포트/)).toBeInTheDocument();
  });

  it("저장 버튼이 렌더링된다", () => {
    render(<AddSystemInfoDialog customerId="cust-1" />);
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
  });

  it("isPending=true 일 때 버튼이 비활성화되고 '저장 중...' 텍스트가 표시된다", () => {
    mockUseActionState.mockReturnValue([null, jest.fn(), true]);
    render(<AddSystemInfoDialog customerId="cust-1" />);
    expect(screen.getByRole("button", { name: "저장 중..." })).toBeDisabled();
  });

  it("포트 에러가 있으면 에러 메시지가 표시된다", () => {
    mockUseActionState.mockReturnValue([
      { success: false, error: { port: ["포트 번호는 1~65535 사이여야 합니다"] } },
      jest.fn(),
      false,
    ]);
    render(<AddSystemInfoDialog customerId="cust-1" />);
    expect(screen.getByText("포트 번호는 1~65535 사이여야 합니다")).toBeInTheDocument();
  });

  it("서버에서 문자열 에러가 오면 role=alert으로 표시된다", () => {
    mockUseActionState.mockReturnValue([
      { success: false, error: "저장 중 오류가 발생했습니다" },
      jest.fn(),
      false,
    ]);
    render(<AddSystemInfoDialog customerId="cust-1" />);
    expect(screen.getByRole("alert")).toHaveTextContent("저장 중 오류가 발생했습니다");
  });

  it("유형 드롭다운 기본값이 'SERVER'이다", () => {
    render(<AddSystemInfoDialog customerId="cust-1" />);
    const select = screen.getByLabelText(/유형/) as HTMLSelectElement;
    expect(select.value).toBe("SERVER");
  });
});
