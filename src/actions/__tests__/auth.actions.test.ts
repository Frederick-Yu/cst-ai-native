import { signUp } from "@/actions/auth.actions";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    fd.append(key, value);
  }
  return fd;
}

const validData = {
  name: "홍길동",
  email: "test@example.com",
  password: "password123",
  confirmPassword: "password123",
};

describe("signUp Server Action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("필수 필드 누락 시 Zod 검증 에러를 반환한다", async () => {
    const result = await signUp(makeFormData({ name: "", email: "", password: "", confirmPassword: "" }));

    expect(result?.success).toBe(false);
    const error = (result as { success: false; error: Record<string, string[]> }).error;
    expect(error).toHaveProperty("name");
    expect(error).toHaveProperty("email");
  });

  it("비밀번호 불일치 시 검증 에러를 반환한다", async () => {
    const result = await signUp(
      makeFormData({ ...validData, confirmPassword: "different123" })
    );

    expect(result?.success).toBe(false);
    const error = (result as { success: false; error: Record<string, string[]> }).error;
    expect(error).toHaveProperty("confirmPassword");
  });

  it("이미 존재하는 이메일이면 에러를 반환한다", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "existing-user" });

    const result = await signUp(makeFormData(validData));

    expect(result?.success).toBe(false);
    const error = (result as { success: false; error: Record<string, string[]> }).error;
    expect(error).toHaveProperty("email");
    expect(error.email[0]).toBe("이미 사용 중인 이메일입니다");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("성공 시 user + auditLog를 트랜잭션으로 생성하고 redirect한다", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const createdUser = { id: "new-user-1", name: "홍길동", email: "test@example.com" };
    const mockTx = {
      user: { create: jest.fn().mockResolvedValue(createdUser) },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    (prisma.$transaction as jest.Mock).mockImplementation(
      (callback: (tx: typeof mockTx) => Promise<unknown>) => callback(mockTx)
    );

    await signUp(makeFormData(validData));

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockTx.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "test@example.com",
          role: "VIEWER",
        }),
      })
    );
    expect(mockTx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: createdUser.id,
          actionType: "CREATE",
          accessReason: "신규 회원가입",
        }),
      })
    );
    expect(redirect).toHaveBeenCalledWith("/login?registered=1");
  });

  it("DB 오류 발생 시 에러를 반환한다", async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("DB 연결 실패"));

    const result = await signUp(makeFormData(validData));

    expect(result?.success).toBe(false);
    expect((result as { success: false; error: string }).error).toBe("회원가입 중 오류가 발생했습니다");
  });

  it("트랜잭션 실패 시 에러를 반환한다", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("트랜잭션 실패"));

    const result = await signUp(makeFormData(validData));

    expect(result?.success).toBe(false);
    expect((result as { success: false; error: string }).error).toBe("회원가입 중 오류가 발생했습니다");
  });
});
