import React from "react";
import { render, screen } from "@testing-library/react";
import { AddHistoryDialog } from "@/domains/customer/components/add-history-dialog";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

jest.mock("@/domains/customer/actions/history.actions", () => ({
  createHistory: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn() },
}));

jest.mock("@prisma/client", () => ({
  EventType: {
    INSTALLATION: "INSTALLATION",
    MAINTENANCE: "MAINTENANCE",
    INCIDENT: "INCIDENT",
    UPDATE: "UPDATE",
    MEETING: "MEETING",
    OTHER: "OTHER",
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

describe("AddHistoryDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseActionState.mockReturnValue([null, jest.fn(), false]);
  });

  it("이벤트 유형, 제목, 내용 필드가 렌더링된다", () => {
    render(<AddHistoryDialog customerId="cust-1" />);
    expect(screen.getByLabelText(/이벤트 유형/)).toBeInTheDocument();
    expect(screen.getByLabelText(/제목/)).toBeInTheDocument();
    expect(screen.getByLabelText(/내용/)).toBeInTheDocument();
  });

  it("저장 버튼이 렌더링된다", () => {
    render(<AddHistoryDialog customerId="cust-1" />);
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
  });

  it("isPending=true 일 때 버튼이 비활성화되고 '저장 중...' 텍스트가 표시된다", () => {
    mockUseActionState.mockReturnValue([null, jest.fn(), true]);
    render(<AddHistoryDialog customerId="cust-1" />);
    expect(screen.getByRole("button", { name: "저장 중..." })).toBeDisabled();
  });

  it("서버에서 필드 에러가 오면 에러 메시지가 표시된다", () => {
    mockUseActionState.mockReturnValue([
      { success: false, error: { title: ["제목은 필수입니다"] } },
      jest.fn(),
      false,
    ]);
    render(<AddHistoryDialog customerId="cust-1" />);
    expect(screen.getByText("제목은 필수입니다")).toBeInTheDocument();
  });

  it("서버에서 문자열 에러가 오면 role=alert으로 표시된다", () => {
    mockUseActionState.mockReturnValue([
      { success: false, error: "저장 중 오류가 발생했습니다" },
      jest.fn(),
      false,
    ]);
    render(<AddHistoryDialog customerId="cust-1" />);
    expect(screen.getByRole("alert")).toHaveTextContent("저장 중 오류가 발생했습니다");
  });

  it("이벤트 유형 드롭다운 기본값이 'MAINTENANCE'이다", () => {
    render(<AddHistoryDialog customerId="cust-1" />);
    const select = screen.getByLabelText(/이벤트 유형/) as HTMLSelectElement;
    expect(select.value).toBe("MAINTENANCE");
  });
});
