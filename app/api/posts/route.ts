import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const GET = withAuth(async (request) => {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 100);
  const offset = Number(url.searchParams.get("offset")) || 0;
  const search = url.searchParams.get("search") || "";
  const sourceUrl = url.searchParams.get("sourceUrl") || "";
  const minLikes = Number(url.searchParams.get("minLikes")) || 0;
  const minShares = Number(url.searchParams.get("minShares")) || 0;
  const minComments = Number(url.searchParams.get("minComments")) || 0;
  const sortBy = url.searchParams.get("sortBy") || "createdAt";

  const where: Record<string, unknown> = {};

  if (search) {
    where.text = { contains: search, mode: "insensitive" };
  }
  if (sourceUrl) {
    where.sourceUrl = sourceUrl;
  }
  if (minLikes) {
    where.likes = { gte: minLikes };
  }
  if (minShares) {
    where.shares = { gte: minShares };
  }
  if (minComments) {
    where.comments = { gte: minComments };
  }

  const validSorts = [
    "createdAt",
    "likes",
    "shares",
    "comments",
  ] as const;
  const sortField = validSorts.includes(sortBy as (typeof validSorts)[number])
    ? sortBy
    : "createdAt";

  const [posts, total, analyzedCount, rewrittenCount] = await Promise.all([
    prisma.scrapedPost.findMany({
      where,
      orderBy: { [sortField]: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.scrapedPost.count({ where }),
    prisma.scrapedPost.count({
      where: { ...where, analysis: { not: null } },
    }),
    prisma.scrapedPost.count({
      where: { ...where, rewrittenContent: { not: null } },
    }),
  ]);

  return Response.json({ posts, total, analyzedCount, rewrittenCount });
});
