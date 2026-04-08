import { prisma } from "@/lib/db";
import { clearSessionCookie } from "@/lib/auth";

const SESSION_COOKIE = "session_token";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const tokenMatch = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${SESSION_COOKIE}=`));

      if (tokenMatch) {
        const token = tokenMatch.split("=")[1];
        if (token) {
          await prisma.session.deleteMany({ where: { token } });
        }
      }
    }

    await clearSessionCookie();

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Đã xảy ra lỗi" },
      { status: 500 }
    );
  }
}
