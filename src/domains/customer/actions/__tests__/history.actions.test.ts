jest.mock("@prisma/client", () => {
  class PrismaClientKnownRequestError extends Error {
    code: string;
    constructor(message: string, { code }: { code: string }) {
      super(message);
      this.name = "PrismaClientKnownRequestError";
      this.code = code;
    }
  }
  return {
    EventType: {
      INSTALLATION: "INSTALLATION",
      MAINTENANCE: "MAINTENANCE",
      INCIDENT: "INCIDENT",
      UPDATE: "UPDATE",
      MEETING: "MEETING",
      OTHER: "OTHER",
    },
    Prisma: { PrismaClientKnownRequestError },
  };
});

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
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  },
}));

import { createHistory, updateHistory, deleteHistory } from "@/domains/customer/actions/history.actions";
import { getServerSession } from "next-auth";
import { prisma } from "@/shared/lib/prisma";
import { Prisma } from "@prisma/client";

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
    formData.set("eventType", "INSTALLATION");
    formData.set("title", "v2.1.0 구축");
    formData.set("content", "운영 서버 신규 구축을 완료했습니다.");

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

describe("updateHistory Server Action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("미인증 사용자는 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const formData = new FormData();
    const result = await updateHistory(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("인증이 필요합니다");
  });

  it("change_reason이 없으면 Zod 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const formData = new FormData();
    formData.set("historyId", "hist-1");
    formData.set("customerId", "cust-1");
    formData.set("eventType", "MAINTENANCE");
    formData.set("title", "정기 점검");
    formData.set("content", "점검 내용입니다");
    // change_reason 미입력

    const result = await updateHistory(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("change_reason");
  });

  it("change_reason이 5자 미만이면 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const formData = new FormData();
    formData.set("historyId", "hist-1");
    formData.set("customerId", "cust-1");
    formData.set("eventType", "MAINTENANCE");
    formData.set("title", "정기 점검");
    formData.set("content", "점검 내용입니다");
    formData.set("change_reason", "짧음");

    const result = await updateHistory(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("change_reason");
  });

  it("유효한 데이터로 이력을 수정하고 AuditLog가 트랜잭션에 포함된다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    (prisma.$transaction as jest.Mock).mockResolvedValue([]);

    const formData = new FormData();
    formData.set("historyId", "hist-1");
    formData.set("customerId", "cust-1");
    formData.set("eventType", "UPDATE");
    formData.set("title", "패치 적용");
    formData.set("content", "보안 패치를 적용했습니다.");
    formData.set("change_reason", "내용 오류 수정으로 인한 변경");

    const result = await updateHistory(formData);

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

  it("P2025 에러 발생 시 notFound 메시지를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    (prisma.$transaction as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Record not found", { code: "P2025", clientVersion: "" })
    );

    const formData = new FormData();
    formData.set("historyId", "hist-nonexistent");
    formData.set("customerId", "cust-1");
    formData.set("eventType", "MAINTENANCE");
    formData.set("title", "없는 이력");
    formData.set("content", "내용");
    formData.set("change_reason", "존재하지 않는 이력 수정 시도");

    const result = await updateHistory(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("수정하려는 이력을 찾을 수 없습니다");
  });

  it("일반 DB 에러 발생 시 saveFailed 메시지를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("DB 연결 실패"));

    const formData = new FormData();
    formData.set("historyId", "hist-1");
    formData.set("customerId", "cust-1");
    formData.set("eventType", "MAINTENANCE");
    formData.set("title", "정기 점검");
    formData.set("content", "점검 내용입니다");
    formData.set("change_reason", "일반 오류 테스트");

    const result = await updateHistory(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("저장 중 오류가 발생했습니다");
  });
});

describe("deleteHistory Server Action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("미인증 사용자는 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const formData = new FormData();
    const result = await deleteHistory(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("인증이 필요합니다");
  });

  it("change_reason이 없으면 Zod 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    const formData = new FormData();
    formData.set("historyId", "hist-1");
    formData.set("customerId", "cust-1");
    formData.set("historyTitle", "정기 점검");
    // change_reason 미입력

    const result = await deleteHistory(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("change_reason");
  });

  it("성공 시 트랜잭션(delete + auditLog)이 실행된다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    (prisma.$transaction as jest.Mock).mockResolvedValue([]);

    const formData = new FormData();
    formData.set("historyId", "hist-1");
    formData.set("customerId", "cust-1");
    formData.set("historyTitle", "정기 점검");
    formData.set("change_reason", "잘못 등록된 이력 삭제");

    const result = await deleteHistory(formData);

    expect(result?.success).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actionType: "DELETE",
          userId: "user-1",
        }),
      })
    );
  });

  it("P2025 에러 발생 시 deleteNotFound 메시지를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    (prisma.$transaction as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Record not found", { code: "P2025", clientVersion: "" })
    );

    const formData = new FormData();
    formData.set("historyId", "hist-nonexistent");
    formData.set("customerId", "cust-1");
    formData.set("historyTitle", "없는 이력");
    formData.set("change_reason", "존재하지 않는 이력 삭제 시도");

    const result = await deleteHistory(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("삭제하려는 이력을 찾을 수 없습니다");
  });

  it("일반 DB 에러 발생 시 deleteFailed 메시지를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("DB 연결 실패"));

    const formData = new FormData();
    formData.set("historyId", "hist-1");
    formData.set("customerId", "cust-1");
    formData.set("historyTitle", "정기 점검");
    formData.set("change_reason", "일반 오류 테스트");

    const result = await deleteHistory(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("삭제 중 오류가 발생했습니다");
  });
});
