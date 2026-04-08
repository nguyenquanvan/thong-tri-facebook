import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const GET = withAuth(async () => {
  const profiles = await prisma.nicheProfile.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ profiles });
});

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { name, description, toneOfVoice, keywords, bannedWords, desiredLength, ctaTemplate } = body;

    if (!name || !description) {
      return Response.json(
        { error: "Ten va mo ta la bat buoc" },
        { status: 400 }
      );
    }

    const profile = await prisma.nicheProfile.create({
      data: {
        name,
        description,
        toneOfVoice: toneOfVoice || null,
        keywords: keywords || null,
        bannedWords: bannedWords || null,
        desiredLength: desiredLength || null,
        ctaTemplate: ctaTemplate || null,
      },
    });

    return Response.json({ profile }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Loi tao ngach";
    return Response.json({ error: message }, { status: 500 });
  }
});
