import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const GET = withAuth(async (request) => {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return Response.json({ error: "Thieu ID bai viet" }, { status: 400 });
  }

  const post = await prisma.scrapedPost.findUnique({
    where: { id },
    include: {
      nicheProfile: true,
      rewrites: {
        include: { nicheProfile: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post) {
    return Response.json(
      { error: "Khong tim thay bai viet" },
      { status: 404 }
    );
  }

  return Response.json({ post });
});
