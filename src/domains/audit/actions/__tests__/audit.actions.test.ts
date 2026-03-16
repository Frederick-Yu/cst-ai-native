import { revealPassword } from "@/domains/audit/actions/audit.actions";

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/shared/lib/auth", () => ({
  authOptions: {},
}));

jest.mock("@/shared/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/shared/lib/prisma";

describe("revealPassword Server Action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("미인증 사용자는 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const result = await revealPassword("info-1", "장애 대응을 위한 확인");

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toBe("인증이 필요합니다");
  });

  it("accessReason이 5자 미만이면 Zod 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const result = await revealPassword("info-1", "짧음"); // 3자

    expect(result.success).toBe(false);
    const error = (result as { success: false; error: Record<string, string[]> }).error;
    expect(error).toHaveProperty("accessReason");
  });

  it("시스템 정보를 찾을 수 없으면 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });
    const mockTx = {
      systemInfo: { findUnique: jest.fn().mockResolvedValue(null) },
      auditLog: { create: jest.fn() },
    };
    (prisma.$transaction as jest.Mock).mockImplementation((callback: (tx: typeof mockTx) => Promise<unknown>) =>
      callback(mockTx)
    );

    const result = await revealPassword("info-1", "장애 대응을 위한 접속 확인");

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toBe("시스템 정보를 찾을 수 없습니다");
  });

  it("저장된 비밀번호가 없으면 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });
    const mockTx = {
      systemInfo: {
        findUnique: jest.fn().mockResolvedValue({
          passwordHash: null,
          customerId: "cust-1",
          name: "테스트 시스템",
        }),
      },
      auditLog: { create: jest.fn() },
    };
    (prisma.$transaction as jest.Mock).mockImplementation((callback: (tx: typeof mockTx) => Promise<unknown>) =>
      callback(mockTx)
    );

    const result = await revealPassword("info-1", "장애 대응을 위한 접속 확인");

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toBe("저장된 비밀번호가 없습니다");
  });

  it("성공 시 passwordHash를 반환하고 AuditLog를 트랜잭션 내에서 기록한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });
    const mockTx = {
      systemInfo: {
        findUnique: jest.fn().mockResolvedValue({
          passwordHash: "secret123",
          customerId: "cust-1",
          name: "테스트 시스템",
        }),
      },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    (prisma.$transaction as jest.Mock).mockImplementation((callback: (tx: typeof mockTx) => Promise<unknown>) =>
      callback(mockTx)
    );

    const result = await revealPassword("info-1", "장애 대응을 위한 접속 확인");

    expect(result.success).toBe(true);
    expect((result as { success: true; passwordHash: string }).passwordHash).toBe("secret123");
    expect(mockTx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actionType: "ACCESS",
          userId: "user-1",
        }),
      })
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("트랜잭션 실패 시 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("DB 연결 실패"));

    const result = await revealPassword("info-1", "장애 대응을 위한 접속 확인");

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toBe("조회 중 오류가 발생했습니다");
  });
});
