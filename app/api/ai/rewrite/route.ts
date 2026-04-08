import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { callGemini } from "@/lib/gemini";

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { postId, nicheProfileId, nicheCustom } = body;

    if (!postId) {
      return Response.json({ error: "Thieu postId" }, { status: 400 });
    }

    const post = await prisma.scrapedPost.findUnique({ where: { id: postId } });
    if (!post) {
      return Response.json(
        { error: "Khong tim thay bai viet" },
        { status: 404 }
      );
    }

    let nicheInfo = "";
    let nicheProfile = null;

    if (nicheProfileId) {
      nicheProfile = await prisma.nicheProfile.findUnique({
        where: { id: nicheProfileId },
      });
      if (nicheProfile) {
        nicheInfo = `
NGACH VIET:
- Ten: ${nicheProfile.name}
- Mo ta: ${nicheProfile.description}
${nicheProfile.toneOfVoice ? `- Giong van: ${nicheProfile.toneOfVoice}` : ""}
${nicheProfile.keywords ? `- Tu khoa: ${nicheProfile.keywords}` : ""}
${nicheProfile.bannedWords ? `- Tu cam: ${nicheProfile.bannedWords}` : ""}
${nicheProfile.desiredLength ? `- Do dai mong muon: ${nicheProfile.desiredLength}` : ""}
${nicheProfile.ctaTemplate ? `- CTA mau: ${nicheProfile.ctaTemplate}` : ""}`;
      }
    } else if (nicheCustom) {
      nicheInfo = `\nNGACH VIET: ${nicheCustom}`;
    }

    const prompt = `Ban la chuyen gia viet content viral tren Facebook. Viet lai bai viet sau theo ngach duoc chi dinh, giu nguyen cac yeu to viral (hook manh, cam xuc, CTA).

BAI VIET GOC:
"""
${post.text}
"""
${nicheInfo}

Yeu cau:
- Giu cau truc viral tuong tu bai goc
- Thay doi noi dung phu hop voi ngach
- Giu hook manh me o dau bai
- Ket thuc bang CTA hap dan
- Viet bang tieng Viet
- Chi tra ve noi dung bai viet, khong giai thich them

BAI VIET MOI:`;

    const rewrittenContent = await callGemini(prompt, { temp: 0.8 });

    await prisma.scrapedPost.update({
      where: { id: postId },
      data: {
        rewrittenContent,
        nicheProfileId: nicheProfileId || null,
        nicheCustom: nicheCustom || null,
      },
    });

    await prisma.rewriteHistory.create({
      data: {
        postId,
        nicheProfileId: nicheProfileId || null,
        nicheCustom: nicheCustom || null,
        content: rewrittenContent,
      },
    });

    return Response.json({ rewrittenContent });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Loi viet lai AI";
    return Response.json({ error: message }, { status: 500 });
  }
});
