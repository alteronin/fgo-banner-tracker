// Check what scripts the GamePress page loads
const res = await fetch("https://grandorder.gamepress.gg/summon-banner-list");
const html = await res.text();

console.log("HTML length:", html.length);

// Find all script tags
const scriptRegex = /<script[^>]*(?:src="([^"]*)")?[^>]*>([\s\S]*?)<\/script>/g;
let match;
let scriptCount = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  scriptCount++;
  const src = match[1];
  const content = match[2];
  if (src) {
    console.log(`Script ${scriptCount}: src=${src}`);
  } else if (content.length > 0) {
    console.log(`Script ${scriptCount}: inline (${content.length} chars) - starts with: ${content.substring(0, 100)}`);
  }
}

console.log(`\nTotal scripts: ${scriptCount}`);

// Look for any JSON data patterns
const jsonPatterns = [
  /window\.__[A-Z_]+\s*=/g,
  /"summonEventList"/g,
  /"banner_list"/g,
  /"servants"/g,
];

jsonPatterns.forEach(pattern => {
  const matches = html.match(pattern);
  console.log(`${pattern}: ${matches ? matches.length + ' matches' : 'no matches'}`);
});
