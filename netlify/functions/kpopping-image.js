const PROFILE_BASE = "https://kpopping.com/profiles/idol/";

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&#x2F;", "/");
}

function extractMeta(html, property) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i")
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtml(match[1]);
  }
  return null;
}

exports.handler = async function(event) {
  const raw = event.queryStringParameters?.slugs || "";
  const slugs = raw.split(",").map(s => s.trim()).filter(Boolean).slice(0, 5);

  if (!slugs.length || slugs.some(slug => !/^[A-Za-z0-9-]+$/.test(slug))) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid slug" }) };
  }

  for (const slug of slugs) {
    const source = PROFILE_BASE + encodeURIComponent(slug);
    try {
      const response = await fetch(source, {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; GirlGroupQuiz/1.0)",
          "accept": "text/html,application/xhtml+xml"
        },
        redirect: "follow"
      });

      if (!response.ok) continue;
      const html = await response.text();
      const image =
        extractMeta(html, "og:image") ||
        extractMeta(html, "twitter:image") ||
        extractMeta(html, "twitter:image:src");

      if (image && /^https?:\/\//i.test(image)) {
        return {
          statusCode: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "public, max-age=21600, s-maxage=86400",
            "access-control-allow-origin": "*"
          },
          body: JSON.stringify({ image, source: response.url || source })
        };
      }
    } catch (_) {}
  }

  return {
    statusCode: 404,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ error: "No image found" })
  };
};
