// Try to find the API endpoint by checking common Remix patterns
const BASE = "https://grandorder.gamepress.gg";

const endpoints = [
  "/_data/routes/_custom/routes/_site.summon-banner-list",
  "/_data/routes/summon-banner-list",
  "/_data/_custom/routes/_site.summon-banner-list",
  "/api/summon-banner-list",
  "/api/banners",
  "/api/summon-events",
  "/build/_custom/routes/_site.summon-banner-list.json",
];

for (const endpoint of endpoints) {
  try {
    const res = await fetch(BASE + endpoint, {
      headers: {
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    const status = res.status;
    const contentType = res.headers.get("content-type");
    const text = await res.text();
    const preview = text.substring(0, 200);
    console.log(`${endpoint}: ${status} (${contentType}) - ${preview}`);
  } catch (e) {
    console.log(`${endpoint}: ERROR - ${e.message}`);
  }
}
