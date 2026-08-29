// Look for any data loading patterns in the HTML
const res = await fetch("https://grandorder.gamepress.gg/summon-banner-list");
const html = await res.text();

// Search for common data patterns
const patterns = [
  { name: "fetch(", regex: /fetch\s*\(\s*["']([^"']+)["']/g },
  { name: "axios", regex: /axios\.[a-z]+\s*\(\s*["']([^"']+)["']/g },
  { name: "XMLHttpRequest", regex: /\.open\s*\(\s*["'][^"']+["']\s*,\s*["']([^"']+)["']/g },
  { name: "import(", regex: /import\s*\(\s*["']([^"']+)["']/g },
  { name: "script src", regex: /src\s*=\s*["']([^"']*\.js[^"']*)["']/g },
  { name: "link href", regex: /href\s*=\s*["']([^"']*\.js[^"']*)["']/g },
];

patterns.forEach(({ name, regex }) => {
  const matches = [...html.matchAll(regex)];
  if (matches.length > 0) {
    console.log(`\n${name} (${matches.length} matches):`);
    matches.slice(0, 10).forEach(m => console.log(`  ${m[1]}`));
  }
});

// Also look for any JSON-LD or structured data
const jsonLd = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
if (jsonLd) {
  console.log(`\nJSON-LD (${jsonLd.length} blocks):`);
  jsonLd.forEach(j => console.log(`  ${j.substring(0, 200)}`));
}

// Look for any data attributes
const dataAttrs = html.match(/data-[a-z-]+=["'][^"']+["']/g);
if (dataAttrs) {
  console.log(`\nData attributes (${dataAttrs.length} total):`);
  const unique = [...new Set(dataAttrs.map(d => d.split("=")[0]))];
  unique.slice(0, 20).forEach(d => console.log(`  ${d}`));
}
