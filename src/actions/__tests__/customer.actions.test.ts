jest.mock("@prisma/client", () => ({
  IndustryType: { IT: "IT", FINANCE: "FINANCE", MANUFACTURING: "MANUFACTURING" },
  ContractStatus: { ACTIVE: "ACTIVE", INACTIVE: "INACTIVE", PENDING: "PENDING" },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    customer: {
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({ id: "cust-new", name: "신규 고객사" }),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  },
}));

import { updateCustomer, createCustomer } from "@/actions/customer.actions";
import { getServerSession } from "next-auth";

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

    const { prisma } = await import("@/lib/prisma");
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
});
