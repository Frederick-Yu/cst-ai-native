import bcrypt from "bcryptjs";

// authorize 로직을 독립적으로 테스트하기 위한 헬퍼
async function authorize(
  credentials: { email: string; password: string } | undefined,
  user: { id: string; email: string; name: string; role: string; passwordHash: string | null } | null
) {
  if (!credentials?.email || !credentials?.password) return null;
  if (!user || !user.passwordHash) return null;

  const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
  if (!isValid) return null;

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

describe("authorize 로직", () => {
  const passwordHash = bcrypt.hashSync("correctPassword", 10);

  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    name: "테스트 유저",
    role: "ADMIN",
    passwordHash,
  };

  it("credentials가 없으면 null 반환", async () => {
    expect(await authorize(undefined, mockUser)).toBeNull();
  });

  it("이메일이 빈 문자열이면 null 반환", async () => {
    expect(await authorize({ email: "", password: "correctPassword" }, mockUser)).toBeNull();
  });

  it("비밀번호가 빈 문자열이면 null 반환", async () => {
    expect(await authorize({ email: "test@example.com", password: "" }, mockUser)).toBeNull();
  });

  it("user가 null이면 null 반환", async () => {
    expect(await authorize({ email: "test@example.com", password: "correctPassword" }, null)).toBeNull();
  });

  it("passwordHash가 null이면 null 반환", async () => {
    expect(
      await authorize({ email: "test@example.com", password: "correctPassword" }, { ...mockUser, passwordHash: null })
    ).toBeNull();
  });

  it("비밀번호가 틀리면 null 반환", async () => {
    expect(
      await authorize({ email: "test@example.com", password: "wrongPassword" }, mockUser)
    ).toBeNull();
  });

  it("올바른 credentials이면 user 정보 반환", async () => {
    const result = await authorize({ email: "test@example.com", password: "correctPassword" }, mockUser);
    expect(result).not.toBeNull();
    expect(result?.id).toBe("user-1");
    expect(result?.email).toBe("test@example.com");
    expect(result?.role).toBe("ADMIN");
  });

  it("반환된 user 객체에 passwordHash 포함되지 않음", async () => {
    const result = await authorize({ email: "test@example.com", password: "correctPassword" }, mockUser);
    expect(result).not.toHaveProperty("passwordHash");
  });
});
