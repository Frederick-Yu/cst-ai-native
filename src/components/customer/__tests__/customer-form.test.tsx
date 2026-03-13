import React from "react";
import { render, screen } from "@testing-library/react";
import { CustomerForm } from "@/components/customer/customer-form";

// useRouter mock
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

// Server Action mock
jest.mock("@/actions/customer.actions", () => ({
  createCustomer: jest.fn(),
}));

// useActionState: 초기 state null, 액션을 교체해서 내부 상태 테스트
jest.mock("react", () => {
  const actual = jest.requireActual<typeof import("react")>("react");
  return {
    ...actual,
    useActionState: jest.fn(),
  };
});

import { useActionState } from "react";

const mockUseActionState = useActionState as jest.Mock;

describe("CustomerForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 기본: 초기 state null, isPending false
    mockUseActionState.mockReturnValue([null, jest.fn(), false]);
  });

  it("고객사명, 업종, 계약상태, 설명 입력 필드가 렌더링된다", () => {
    render(<CustomerForm />);

    expect(screen.getByLabelText(/고객사명/)).toBeInTheDocument();
    expect(screen.getByLabelText(/업종/)).toBeInTheDocument();
    expect(screen.getByLabelText(/계약 상태/)).toBeInTheDocument();
    expect(screen.getByLabelText(/설명/)).toBeInTheDocument();
  });

  it("고객사명 입력 필드는 aria-required='true'를 가진다", () => {
    render(<CustomerForm />);
    expect(screen.getByLabelText(/고객사명/)).toHaveAttribute("aria-required", "true");
  });

  it("등록 버튼이 노출된다", () => {
    render(<CustomerForm />);
    expect(screen.getByRole("button", { name: "고객사 등록" })).toBeInTheDocument();
  });

  it("isPending=true 일 때 버튼이 비활성화되고 '등록 중...' 텍스트가 표시된다", () => {
    mockUseActionState.mockReturnValue([null, jest.fn(), true]);
    render(<CustomerForm />);

    const submitButton = screen.getByRole("button", { name: "등록 중..." });
    expect(submitButton).toBeDisabled();
  });

  it("서버에서 필드 검증 에러가 오면 고객사명 에러 메시지가 role=alert으로 표시된다", () => {
    mockUseActionState.mockReturnValue([
      { success: false, error: { name: ["고객사명은 필수입니다"] } },
      jest.fn(),
      false,
    ]);
    render(<CustomerForm />);

    const errorEl = screen.getByRole("alert");
    expect(errorEl).toBeInTheDocument();
    expect(errorEl).toHaveTextContent("고객사명은 필수입니다");
  });

  it("에러 메시지가 있을 때 고객사명 필드의 aria-invalid와 aria-describedby가 설정된다", () => {
    mockUseActionState.mockReturnValue([
      { success: false, error: { name: ["고객사명은 필수입니다"] } },
      jest.fn(),
      false,
    ]);
    render(<CustomerForm />);

    const input = screen.getByLabelText(/고객사명/);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "name-error");
  });

  it("서버에서 문자열 에러가 오면 role=alert으로 표시된다", () => {
    mockUseActionState.mockReturnValue([
      { success: false, error: "저장 중 오류가 발생했습니다" },
      jest.fn(),
      false,
    ]);
    render(<CustomerForm />);

    expect(screen.getByRole("alert")).toHaveTextContent("저장 중 오류가 발생했습니다");
  });

  it("취소 버튼이 존재한다", () => {
    render(<CustomerForm />);
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
  });

  it("업종 드롭다운에 '기타'가 기본으로 선택된다", () => {
    render(<CustomerForm />);
    const select = screen.getByLabelText(/업종/) as HTMLSelectElement;
    expect(select.value).toBe("OTHER");
  });
});
