import { revealPassword } from "@/actions/audit.actions";

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    systemInfo: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

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
    (prisma.systemInfo.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await revealPassword("info-1", "장애 대응을 위한 접속 확인");

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toBe("시스템 정보를 찾을 수 없습니다");
  });

  it("저장된 비밀번호가 없으면 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });
    (prisma.systemInfo.findUnique as jest.Mock).mockResolvedValue({
      passwordHash: null,
      customerId: "cust-1",
      name: "테스트 시스템",
    });

    const result = await revealPassword("info-1", "장애 대응을 위한 접속 확인");

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toBe("저장된 비밀번호가 없습니다");
  });

  it("성공 시 passwordHash를 반환하고 AuditLog를 기록한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });
    (prisma.systemInfo.findUnique as jest.Mock).mockResolvedValue({
      passwordHash: "secret123",
      customerId: "cust-1",
      name: "테스트 시스템",
    });
    (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

    const result = await revealPassword("info-1", "장애 대응을 위한 접속 확인");

    expect(result.success).toBe(true);
    expect((result as { success: true; passwordHash: string }).passwordHash).toBe("secret123");
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actionType: "ACCESS",
          userId: "user-1",
        }),
      })
    );
  });
});
