import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scrapeFacebookPosts } from "@/lib/apify";

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { url, limit = 50 } = body;

    if (!url) {
      return Response.json({ error: "Thieu URL fanpage" }, { status: 400 });
    }

    const posts = await scrapeFacebookPosts(url, limit);

    // Extract page name from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    const pageName = pathParts[0] || urlObj.hostname;

    // Save to database
    const saved = await Promise.all(
      posts.map((post) =>
        prisma.scrapedPost.create({
          data: {
            sourceUrl: url,
            pageName,
            text: post.text,
            likes: post.likes,
            shares: post.shares,
            comments: post.comments,
            postUrl: post.postUrl || null,
            postDate: post.date ? new Date(post.date) : null,
          },
        })
      )
    );

    return Response.json({ count: saved.length, posts: saved });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Loi khong xac dinh";
    return Response.json({ error: message }, { status: 500 });
  }
});
