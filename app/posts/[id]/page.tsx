import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/posts/post-detail";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
    notFound();
  }

  const serialized = {
    ...post,
    postDate: post.postDate?.toISOString() || null,
    createdAt: post.createdAt.toISOString(),
    nicheProfile: post.nicheProfile
      ? { ...post.nicheProfile, createdAt: post.nicheProfile.createdAt.toISOString() }
      : null,
    rewrites: post.rewrites.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      nicheProfile: r.nicheProfile
        ? { ...r.nicheProfile, createdAt: r.nicheProfile.createdAt.toISOString() }
        : null,
    })),
  };

  return <PostDetail post={serialized} />;
}
