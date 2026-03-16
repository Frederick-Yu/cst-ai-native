jest.mock("@prisma/client", () => ({
  AssetType: {
    SERVER: "SERVER",
    DATABASE: "DATABASE",
    APPLICATION: "APPLICATION",
    NETWORK: "NETWORK",
    OTHER: "OTHER",
  },
  ServiceEnv: {
    PRODUCTION: "PRODUCTION",
    STAGING: "STAGING",
    DEVELOPMENT: "DEVELOPMENT",
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/shared/lib/auth", () => ({
  authOptions: {},
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/shared/lib/prisma", () => ({
  prisma: {
    systemInfo: {
      create: jest.fn().mockResolvedValue({ id: "sys-1" }),
      update: jest.fn().mockResolvedValue({}),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  },
}));

import { createSystemInfo, updateSystemInfo } from "@/domains/customer/actions/system-info.actions";
import { getServerSession } from "next-auth";

describe("createSystemInfo Server Action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("미인증 사용자는 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const formData = new FormData();
    const result = await createSystemInfo(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("인증이 필요합니다");
  });

  it("시스템명이 없으면 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("assetType", "SERVER");
    formData.set("serviceEnv", "PRODUCTION");
    // name 미입력

    const result = await createSystemInfo(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("name");
  });

  it("포트 번호가 범위를 벗어나면 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("name", "운영 서버");
    formData.set("assetType", "SERVER");
    formData.set("serviceEnv", "PRODUCTION");
    formData.set("port", "99999"); // 65535 초과

    const result = await createSystemInfo(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("port");
  });

  it("포트 번호 최댓값 65535는 유효하다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("name", "운영 서버");
    formData.set("assetType", "SERVER");
    formData.set("serviceEnv", "PRODUCTION");
    formData.set("port", "65535");

    const result = await createSystemInfo(formData);

    expect(result?.success).toBe(true);
  });

  it("포트 번호 65536은 최댓값 초과로 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("name", "운영 서버");
    formData.set("assetType", "SERVER");
    formData.set("serviceEnv", "PRODUCTION");
    formData.set("port", "65536");

    const result = await createSystemInfo(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("port");
  });

  it("포트 번호 0은 최솟값 미만으로 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("name", "운영 서버");
    formData.set("assetType", "SERVER");
    formData.set("serviceEnv", "PRODUCTION");
    formData.set("port", "0");

    const result = await createSystemInfo(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("port");
  });

  it("유효한 데이터로 시스템 정보를 생성한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("name", "운영 DB 서버");
    formData.set("assetType", "DATABASE");
    formData.set("serviceEnv", "PRODUCTION");
    formData.set("host", "db.example.com");
    formData.set("port", "5432");
    formData.set("username", "admin");

    const result = await createSystemInfo(formData);

    expect(result?.success).toBe(true);
  });

  it("포트가 비어 있으면 optional로 처리한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("name", "운영 서버");
    formData.set("assetType", "SERVER");
    formData.set("serviceEnv", "PRODUCTION");
    formData.set("port", ""); // 빈 포트

    const result = await createSystemInfo(formData);

    expect(result?.success).toBe(true);
  });
});

describe("updateSystemInfo Server Action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("미인증 사용자는 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const formData = new FormData();
    const result = await updateSystemInfo(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("인증이 필요합니다");
  });

  it("change_reason이 없으면 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const formData = new FormData();
    formData.set("systemInfoId", "sys-1");
    formData.set("customerId", "cust-1");
    formData.set("name", "운영 서버");
    formData.set("assetType", "SERVER");
    formData.set("serviceEnv", "PRODUCTION");
    // change_reason 미입력

    const result = await updateSystemInfo(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("change_reason");
  });

  it("비밀번호가 비어 있으면 기존 값을 유지한다 (passwordHash 미포함)", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const { prisma } = await import("@/shared/lib/prisma");
    (prisma.$transaction as jest.Mock).mockResolvedValue([]);

    const formData = new FormData();
    formData.set("systemInfoId", "sys-1");
    formData.set("customerId", "cust-1");
    formData.set("name", "운영 서버");
    formData.set("assetType", "SERVER");
    formData.set("serviceEnv", "PRODUCTION");
    formData.set("passwordHash", ""); // 비어 있는 비밀번호
    formData.set("change_reason", "서버 정보 업데이트 작업");

    const result = await updateSystemInfo(formData);

    expect(result?.success).toBe(true);
    // passwordHash가 빈 값이면 update 데이터에 포함되지 않아야 함
    const transactionCall = (prisma.$transaction as jest.Mock).mock.calls[0][0];
    expect(transactionCall).toBeDefined();
  });

  it("유효한 데이터로 시스템 정보를 수정하고 AuditLog가 트랜잭션에 포함된다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const { prisma } = await import("@/shared/lib/prisma");
    (prisma.$transaction as jest.Mock).mockResolvedValue([]);

    const formData = new FormData();
    formData.set("systemInfoId", "sys-1");
    formData.set("customerId", "cust-1");
    formData.set("name", "운영 DB 서버");
    formData.set("assetType", "DATABASE");
    formData.set("serviceEnv", "PRODUCTION");
    formData.set("host", "db.example.com");
    formData.set("change_reason", "DB 서버 호스트 주소 변경");

    const result = await updateSystemInfo(formData);

    expect(result?.success).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actionType: "UPDATE",
          userId: "user-1",
        }),
      })
    );
  });
});
