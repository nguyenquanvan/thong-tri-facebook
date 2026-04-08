import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const GET = withAuth(async () => {
  const posts = await prisma.scrapedPost.findMany({
    select: { sourceUrl: true, pageName: true },
    distinct: ["sourceUrl"],
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ sources: posts });
});
