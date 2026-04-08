const APIFY_BASE = "https://api.apify.com/v2";
const SCRAPER_ID = "apify~facebook-posts-scraper";

export interface ScrapedPostData {
  text: string;
  likes: number;
  shares: number;
  comments: number;
  postUrl?: string;
  date?: string;
}

export async function scrapeFacebookPosts(
  fanpageUrl: string,
  limit: number = 50
): Promise<ScrapedPostData[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error("APIFY_API_TOKEN chua duoc cau hinh");

  const runRes = await fetch(`${APIFY_BASE}/acts/${SCRAPER_ID}/runs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startUrls: [{ url: fanpageUrl }],
      resultsLimit: limit,
    }),
  });
  if (!runRes.ok) throw new Error(`Apify run failed: ${runRes.status}`);
  const run = await runRes.json();
  const runId = run.data?.id;
  if (!runId) throw new Error("Khong the khoi tao scraper");

  const deadline = Date.now() + 5 * 60 * 1000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await fetch(`${APIFY_BASE}/actor-runs/${runId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const status = await statusRes.json();
    if (status.data?.status === "SUCCEEDED") break;
    if (
      status.data?.status === "FAILED" ||
      status.data?.status === "ABORTED"
    ) {
      throw new Error(`Scraper that bai: ${status.data?.status}`);
    }
  }

  const datasetId = run.data?.defaultDatasetId;
  const itemsRes = await fetch(
    `${APIFY_BASE}/datasets/${datasetId}/items?limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const items = await itemsRes.json();

  return (items || [])
    .filter((item: Record<string, unknown>) => item.text)
    .map((item: Record<string, unknown>) => ({
      text: (item.text as string) || "",
      likes: Number(item.likes) || 0,
      shares: Number(item.shares) || 0,
      comments: Number(item.comments) || 0,
      postUrl: (item.url as string) || (item.postUrl as string) || "",
      date: (item.time as string) || (item.date as string) || "",
    }));
}
