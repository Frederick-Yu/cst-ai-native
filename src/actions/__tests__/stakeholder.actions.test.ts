jest.mock("@prisma/client", () => ({
  StakeholderRole: {
    CONTACT: "CONTACT",
    MANAGER: "MANAGER",
    TECHNICAL: "TECHNICAL",
    EXECUTIVE: "EXECUTIVE",
  },
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

jest.mock("@/lib/prisma", () => ({
  prisma: {
    stakeholder: {
      create: jest.fn().mockResolvedValue({ id: "stk-1" }),
      update: jest.fn().mockResolvedValue({}),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  },
}));

import { createStakeholder, updateStakeholder } from "@/actions/stakeholder.actions";
import { getServerSession } from "next-auth";

describe("createStakeholder Server Action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("미인증 사용자는 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const formData = new FormData();
    const result = await createStakeholder(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("인증이 필요합니다");
  });

  it("담당자명이 없으면 Zod 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("role", "CONTACT");
    // name 미입력

    const result = await createStakeholder(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("name");
  });

  it("이메일 형식이 올바르지 않으면 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("name", "홍길동");
    formData.set("role", "CONTACT");
    formData.set("email", "invalid-email");

    const result = await createStakeholder(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("email");
  });

  it("유효한 데이터로 담당자를 생성한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const formData = new FormData();
    formData.set("customerId", "cust-1");
    formData.set("name", "홍길동");
    formData.set("role", "CONTACT");
    formData.set("email", "hong@example.com");
    formData.set("phone", "010-1234-5678");

    const result = await createStakeholder(formData);

    expect(result?.success).toBe(true);
  });

  it("customerId가 없으면 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const formData = new FormData();
    formData.set("name", "홍길동");
    formData.set("role", "CONTACT");

    const result = await createStakeholder(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("customerId");
  });
});

describe("updateStakeholder Server Action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("미인증 사용자는 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const formData = new FormData();
    const result = await updateStakeholder(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toBe("인증이 필요합니다");
  });

  it("change_reason이 없으면 Zod 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const formData = new FormData();
    formData.set("stakeholderId", "stk-1");
    formData.set("customerId", "cust-1");
    formData.set("name", "홍길동");
    formData.set("role", "CONTACT");
    // change_reason 미입력

    const result = await updateStakeholder(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("change_reason");
  });

  it("change_reason이 5자 미만이면 검증 에러를 반환한다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const formData = new FormData();
    formData.set("stakeholderId", "stk-1");
    formData.set("customerId", "cust-1");
    formData.set("name", "홍길동");
    formData.set("role", "CONTACT");
    formData.set("change_reason", "짧음");

    const result = await updateStakeholder(formData);

    expect(result?.success).toBe(false);
    expect(result?.error).toHaveProperty("change_reason");
  });

  it("유효한 데이터로 담당자를 수정하고 트랜잭션이 실행된다", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", role: "MEMBER" },
    });

    const formData = new FormData();
    formData.set("stakeholderId", "stk-1");
    formData.set("customerId", "cust-1");
    formData.set("name", "홍길동");
    formData.set("role", "MANAGER");
    formData.set("email", "hong@example.com");
    formData.set("change_reason", "담당자 역할 변경으로 인한 수정");

    const { prisma } = await import("@/lib/prisma");
    (prisma.$transaction as jest.Mock).mockResolvedValue([]);

    const result = await updateStakeholder(formData);

    expect(result?.success).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
