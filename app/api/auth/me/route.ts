import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return Response.json(
      { error: "Chưa đăng nhập" },
      { status: 401 }
    );
  }

  return Response.json({ user: session.user });
}
