import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { callGemini, extractJSON } from "@/lib/gemini";

interface AnalysisResult {
  hookAnalysis: string;
  emotionTriggers: string[];
  contentFormat: string;
  ctaAnalysis: string;
  viralScore: number;
  summary: string;
}

const DEFAULT_ANALYSIS: AnalysisResult = {
  hookAnalysis: "",
  emotionTriggers: [],
  contentFormat: "",
  ctaAnalysis: "",
  viralScore: 0,
  summary: "",
};

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { postId } = body;

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

    const prompt = `Ban la chuyen gia phan tich viral content tren Facebook. Phan tich bai viet sau va tra ve JSON:

BAI VIET:
"""
${post.text}
"""

METRICS: ${post.likes} likes, ${post.shares} shares, ${post.comments} comments

Tra ve dung dinh dang JSON sau (khong them gi khac):
{
  "hookAnalysis": "Phan tich cau mo dau / hook cua bai viet",
  "emotionTriggers": ["cam xuc 1", "cam xuc 2"],
  "contentFormat": "Mo ta cau truc / format bai viet",
  "ctaAnalysis": "Phan tich Call to Action",
  "viralScore": 85,
  "summary": "Tom tat ly do bai viet nay viral"
}`;

    const result = await callGemini(prompt, { temp: 0.3 });
    const analysis = extractJSON<AnalysisResult>(result, DEFAULT_ANALYSIS);

    await prisma.scrapedPost.update({
      where: { id: postId },
      data: { analysis: JSON.stringify(analysis) },
    });

    return Response.json({ analysis });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Loi phan tich AI";
    return Response.json({ error: message }, { status: 500 });
  }
});
