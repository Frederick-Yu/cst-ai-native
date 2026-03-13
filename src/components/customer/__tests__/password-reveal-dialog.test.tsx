import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { PasswordRevealDialog } from "@/components/customer/password-reveal-dialog";
import * as auditActions from "@/actions/audit.actions";

// Dialog 컴포넌트 모킹: 항상 열린 상태로 렌더링하여 내부 로직 테스트
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-root">{children}</div>
  ),
  DialogTrigger: ({ children }: { children: React.ReactNode; render?: React.ReactElement }) => (
    <div data-testid="dialog-trigger">{children}</div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/actions/audit.actions", () => ({
  revealPassword: jest.fn(),
}));

const mockRevealPassword = auditActions.revealPassword as jest.MockedFunction<
  typeof auditActions.revealPassword
>;

describe("PasswordRevealDialog", () => {
  const defaultProps = {
    systemInfoId: "info-1",
    systemInfoName: "테스트 시스템",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("비밀번호 보기 텍스트가 트리거 영역에 존재한다", () => {
    render(<PasswordRevealDialog {...defaultProps} />);
    expect(screen.getByText("비밀번호 보기")).toBeInTheDocument();
  });

  it("다이얼로그 내에 조회 사유 입력 필드가 존재한다", () => {
    render(<PasswordRevealDialog {...defaultProps} />);
    expect(screen.getByLabelText(/조회 사유/)).toBeInTheDocument();
  });

  it("조회 사유가 5자 미만이면 조회 버튼이 비활성화된다", () => {
    render(<PasswordRevealDialog {...defaultProps} />);
    const input = screen.getByLabelText(/조회 사유/);
    fireEvent.change(input, { target: { value: "짧음" } }); // 3자

    const revealButton = screen.getByRole("button", { name: "조회" });
    expect(revealButton).toBeDisabled();
  });

  it("조회 사유가 5자 이상이면 조회 버튼이 활성화된다", () => {
    render(<PasswordRevealDialog {...defaultProps} />);
    const input = screen.getByLabelText(/조회 사유/);
    fireEvent.change(input, { target: { value: "장애 대응 확인" } });

    const revealButton = screen.getByRole("button", { name: "조회" });
    expect(revealButton).not.toBeDisabled();
  });

  it("조회 성공 시 클립보드에 복사 버튼(aria-label)이 나타난다", async () => {
    mockRevealPassword.mockResolvedValue({
      success: true,
      passwordHash: "secret123",
    });

    render(<PasswordRevealDialog {...defaultProps} />);

    const input = screen.getByLabelText(/조회 사유/);
    fireEvent.change(input, { target: { value: "운영 장애 대응을 위한 접속 확인" } });

    const revealButton = screen.getByRole("button", { name: "조회" });

    await act(async () => {
      fireEvent.click(revealButton);
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "클립보드에 복사" })).toBeInTheDocument();
    });
  });

  it("조회 실패 시 에러 메시지가 role=alert으로 표시된다", async () => {
    mockRevealPassword.mockResolvedValue({
      success: false,
      error: "인증이 필요합니다",
    });

    render(<PasswordRevealDialog {...defaultProps} />);

    const input = screen.getByLabelText(/조회 사유/);
    fireEvent.change(input, { target: { value: "운영 장애 대응을 위한 접속 확인" } });

    const revealButton = screen.getByRole("button", { name: "조회" });

    await act(async () => {
      fireEvent.click(revealButton);
    });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
