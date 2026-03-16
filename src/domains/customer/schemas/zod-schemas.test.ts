import { z } from "zod";

const ChangeReasonSchema = z.object({
  change_reason: z.string().min(5, "변경 사유는 5자 이상 입력해야 합니다"),
});

const AccessReasonSchema = z.object({
  access_reason: z.string().min(5, "조회 사유는 5자 이상 입력해야 합니다"),
});

describe("change_reason 검증", () => {
  it("5자 이상이면 통과한다", () => {
    const result = ChangeReasonSchema.safeParse({ change_reason: "장애 대응을 위한 수정" });
    expect(result.success).toBe(true);
  });

  it("빈 문자열은 실패한다", () => {
    const result = ChangeReasonSchema.safeParse({ change_reason: "" });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.change_reason).toContain(
      "변경 사유는 5자 이상 입력해야 합니다"
    );
  });

  it("4자 이하는 실패한다", () => {
    const result = ChangeReasonSchema.safeParse({ change_reason: "수정" });
    expect(result.success).toBe(false);
  });

  it("undefined는 실패한다", () => {
    const result = ChangeReasonSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("정확히 5자면 통과한다", () => {
    const result = ChangeReasonSchema.safeParse({ change_reason: "다섯글자임" }); // 5자
    expect(result.success).toBe(true);
  });
});

describe("access_reason 검증", () => {
  it("5자 이상이면 통과한다", () => {
    const result = AccessReasonSchema.safeParse({ access_reason: "운영 장애 대응 확인" });
    expect(result.success).toBe(true);
  });

  it("빈 문자열은 실패한다", () => {
    const result = AccessReasonSchema.safeParse({ access_reason: "" });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.access_reason).toContain(
      "조회 사유는 5자 이상 입력해야 합니다"
    );
  });

  it("4자 이하는 실패한다", () => {
    const result = AccessReasonSchema.safeParse({ access_reason: "확인" });
    expect(result.success).toBe(false);
  });

  it("undefined는 실패한다", () => {
    const result = AccessReasonSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
