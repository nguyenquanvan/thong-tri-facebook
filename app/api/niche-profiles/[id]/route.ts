import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const PUT = withAuth(async (request) => {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return Response.json({ error: "Thieu ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, toneOfVoice, keywords, bannedWords, desiredLength, ctaTemplate } = body;

    const profile = await prisma.nicheProfile.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(toneOfVoice !== undefined && { toneOfVoice: toneOfVoice || null }),
        ...(keywords !== undefined && { keywords: keywords || null }),
        ...(bannedWords !== undefined && { bannedWords: bannedWords || null }),
        ...(desiredLength !== undefined && { desiredLength: desiredLength || null }),
        ...(ctaTemplate !== undefined && { ctaTemplate: ctaTemplate || null }),
      },
    });

    return Response.json({ profile });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Loi cap nhat ngach";
    return Response.json({ error: message }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request) => {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return Response.json({ error: "Thieu ID" }, { status: 400 });
    }

    await prisma.nicheProfile.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Loi xoa ngach";
    return Response.json({ error: message }, { status: 500 });
  }
});
