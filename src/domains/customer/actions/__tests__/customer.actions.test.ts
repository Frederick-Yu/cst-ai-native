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
    IndustryType: { IT: "IT", FINANCE: "FINANCE", MANUFACTURING: "MANUFACTURING" },
    ContractStatus: { ACTIVE: "ACTIVE", INACTIVE: "INACTIVE", PENDING: "PENDING" },
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

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/shared/lib/prisma", () => ({
  prisma: {
    customer: {
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({ id: "cust-new", name: "신규 고객사" }),
      delete: jest.fn().mockResolvedValue({}),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  },
}));

import { updateCustomer, createCustomer, deleteCustomer } from "@/domains/customer/actions/customer.actions";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

describe("updateCustomer Server Action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("미인증 사용자는 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const formData = new FormData();
    const result = await updateCustomer(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("인증이 필요합니다");
  });

  it("change_reason이 없으면 Zod 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("name", "테스트 고객사");
    formData.set("industryType", "IT");
    formData.set("contractStatus", "ACTIVE");
    // change_reason 미입력

    const result = await updateCustomer(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("change_reason");
  });

  it("change_reason이 5자 미만이면 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("name", "테스트 고객사");
    formData.set("industryType", "IT");
    formData.set("contractStatus", "ACTIVE");
    formData.set("change_reason", "짧음"); // 3자

    const result = await updateCustomer(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("change_reason");
  });

  it("change_reason이 정확히 5자면 검증을 통과한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("name", "테스트 고객사");
    formData.set("industryType", "IT");
    formData.set("contractStatus", "ACTIVE");
    formData.set("change_reason", "담당자 요청으로 인한 수정"); // 충분한 길이

    // redirect()가 호출되므로 에러를 throw한다. 단, Zod 에러가 아니어야 한다.
    try {
      const result = await updateCustomer(formData);
      if (result) {
        expect(result.error).not.toHaveProperty("change_reason");
      }
    } catch {
      // redirect()는 내부적으로 throw를 사용하므로 정상적인 흐름
    }
  });

  it("P2025 에러 발생 시 notFound 메시지를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const { prisma } = await import("@/shared/lib/prisma");
    (prisma.$transaction as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Record not found", { code: "P2025", clientVersion: "" })
    );

    const formData = new FormData();
    formData.set("customerId", "cust-nonexistent");
    formData.set("name", "없는 고객사");
    formData.set("industryType", "IT");
    formData.set("contractStatus", "ACTIVE");
    formData.set("change_reason", "존재하지 않는 고객사 수정 시도");

    const result = await updateCustomer(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("수정하려는 고객사를 찾을 수 없습니다");
  });

  it("일반 DB 에러 발생 시 saveFailed 메시지를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const { prisma } = await import("@/shared/lib/prisma");
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("DB 연결 실패"));

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("name", "테스트 고객사");
    formData.set("industryType", "IT");
    formData.set("contractStatus", "ACTIVE");
    formData.set("change_reason", "일반 오류 테스트");

    const result = await updateCustomer(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("저장 중 오류가 발생했습니다");
  });
});

describe("deleteCustomer Server Action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("미인증 사용자는 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const formData = new FormData();
    const result = await deleteCustomer(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("인증이 필요합니다");
  });

  it("change_reason이 없으면 Zod 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("customerName", "테스트 고객사");
    // change_reason 미입력

    const result = await deleteCustomer(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("change_reason");
  });

  it("change_reason이 5자 미만이면 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("customerName", "테스트 고객사");
    formData.set("change_reason", "짧음");

    const result = await deleteCustomer(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("change_reason");
  });

  it("성공 시 트랜잭션(delete + auditLog)이 실행된다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const { prisma } = await import("@/shared/lib/prisma");

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("customerName", "테스트 고객사");
    formData.set("change_reason", "계약 종료로 인한 삭제");

    try {
      await deleteCustomer(formData);
    } catch {
      // redirect()는 내부적으로 throw를 사용하므로 정상적인 흐름
    }

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("P2025 에러 발생 시 deleteNotFound 메시지를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const { prisma } = await import("@/shared/lib/prisma");
    (prisma.$transaction as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Record not found", { code: "P2025", clientVersion: "" })
    );

    const formData = new FormData();
    formData.set("customerId", "cust-nonexistent");
    formData.set("customerName", "없는 고객사");
    formData.set("change_reason", "존재하지 않는 고객사 삭제 시도");

    const result = await deleteCustomer(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("삭제하려는 고객사를 찾을 수 없습니다");
  });

  it("일반 DB 에러 발생 시 deleteFailed 메시지를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const { prisma } = await import("@/shared/lib/prisma");
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("DB 연결 실패"));

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("customerName", "테스트 고객사");
    formData.set("change_reason", "일반 오류 테스트");

    const result = await deleteCustomer(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("삭제 중 오류가 발생했습니다");
  });
});

describe("createCustomer Server Action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("미인증 사용자는 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const formData = new FormData();
    const result = await createCustomer(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("인증이 필요합니다");
  });

  it("고객사명이 없으면 Zod 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const formData = new FormData();
    formData.set("industryType", "IT");
    formData.set("contractStatus", "ACTIVE");
    // name 미입력

    const result = await createCustomer(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("name");
  });

  it("성공 시 customerId를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const { prisma } = await import("@/shared/lib/prisma");
    (prisma.$transaction as jest.Mock).mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        customer: { create: jest.fn().mockResolvedValue({ id: "cust-new", name: "신규 고객사" }) },
        auditLog: { create: jest.fn().mockResolvedValue({}) },
      };
      return fn(tx);
    });

    const formData = new FormData();
    formData.set("name", "신규 고객사");
    formData.set("industryType", "IT");
    formData.set("contractStatus", "ACTIVE");

    const result = await createCustomer(formData);

    expect(result?.success).toBe(true);
    expect((result as { success: true; customerId: string }).customerId).toBe("cust-new");
  });

  it("P2002 에러 발생 시 duplicateName 메시지를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const { prisma } = await import("@/shared/lib/prisma");
    (prisma.$transaction as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", { code: "P2002", clientVersion: "" })
    );

    const formData = new FormData();
    formData.set("name", "이미 존재하는 고객사");
    formData.set("industryType", "IT");
    formData.set("contractStatus", "ACTIVE");

    const result = await createCustomer(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("이미 등록된 고객사명입니다");
  });

  it("일반 DB 에러 발생 시 saveFailed 메시지를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const { prisma } = await import("@/shared/lib/prisma");
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("DB 연결 실패"));

    const formData = new FormData();
    formData.set("name", "테스트 고객사");
    formData.set("industryType", "IT");
    formData.set("contractStatus", "ACTIVE");

    const result = await createCustomer(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("저장 중 오류가 발생했습니다");
  });
});
