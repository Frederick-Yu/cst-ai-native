jest.mock("@prisma/client", () => ({
  EventType: {
    MAINTENANCE: "MAINTENANCE",
    INCIDENT: "INCIDENT",
    DEPLOYMENT: "DEPLOYMENT",
    MEETING: "MEETING",
    OTHER: "OTHER",
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
    history: {
      create: jest.fn().mockResolvedValue({ id: "hist-1" }),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  },
}));

import { createHistory } from "@/domains/customer/actions/history.actions";
import { getServerSession } from "next-auth";
import { prisma } from "@/shared/lib/prisma";

describe("createHistory Server Action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("미인증 사용자는 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const formData = new FormData();
    const result = await createHistory(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("인증이 필요합니다");
  });

  it("제목이 없으면 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("eventType", "MAINTENANCE");
    formData.set("content", "정기 점검을 진행했습니다");
    // title 미입력

    const result = await createHistory(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("title");
  });

  it("내용이 없으면 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("eventType", "MAINTENANCE");
    formData.set("title", "정기 서버 점검");
    // content 미입력

    const result = await createHistory(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("content");
  });

  it("유효한 데이터로 이력을 생성하고 AuditLog가 트랜잭션에 포함된다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    (prisma.$transaction as jest.Mock).mockResolvedValue([]);

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("eventType", "DEPLOYMENT");
    formData.set("title", "v2.1.0 배포");
    formData.set("content", "운영 서버에 신규 버전 배포를 완료했습니다.");

    const result = await createHistory(formData);

    expect(result?.success).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actionType: "CREATE",
          userId: "user-1",
        }),
      })
    );
  });

  it("INCIDENT 이벤트 타입으로 이력을 생성할 수 있다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    (prisma.$transaction as jest.Mock).mockResolvedValue([]);

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("eventType", "INCIDENT");
    formData.set("title", "DB 연결 장애 발생");
    formData.set("content", "오전 10시경 DB 연결 장애 발생, 재시작으로 복구 완료.");

    const result = await createHistory(formData);

    expect(result?.success).toBe(true);
  });

  it("customerId가 없으면 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const formData = new FormData();
    formData.set("eventType", "MAINTENANCE");
    formData.set("title", "정기 점검");
    formData.set("content", "점검 내용");

    const result = await createHistory(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("customerId");
  });
});
