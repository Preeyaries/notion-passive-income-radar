const NOTION_VERSION = "2025-09-03";

async function notionFetch(path, opt = {}) {
  if (!process.env.NOTION_TOKEN) throw new Error("Missing NOTION_TOKEN.");
  if (!process.env.NOTION_DATABASE_ID) throw new Error("Missing NOTION_DATABASE_ID.");

  const r = await fetch(`https://api.notion.com${path}`, {
    ...opt,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(opt.headers || {})
    }
  });

  const j = await r.json();
  if (!r.ok) throw new Error(j.message || `Notion API error ${r.status}`);
  return j;
}

async function getDataSource() {
  const db = await notionFetch(`/v1/databases/${process.env.NOTION_DATABASE_ID}`);
  if (!db.data_sources?.length) throw new Error("No data source found.");
  return db.data_sources[0];
}

function textOf(p) {
  if (!p) return "";
  if (p.type === "title") return (p.title || []).map(x => x.plain_text || "").join("");
  if (p.type === "rich_text") return (p.rich_text || []).map(x => x.plain_text || "").join("");
  return "";
}

function numberOf(p) {
  if (!p) return null;
  if (p.type === "number") return Number.isFinite(p.number) ? p.number : null;
  if (p.type === "formula" && p.formula?.type === "number")
    return Number.isFinite(p.formula.number) ? p.formula.number : null;
  if (p.type === "rollup" && p.rollup?.type === "number")
    return Number.isFinite(p.rollup.number) ? p.rollup.number : null;
  return null;
}

function relationCount(p) {
  return p?.type === "relation" ? (p.relation || []).length : 0;
}

// Property names in the "Passive Income Summary" database.
// Change these if you rename a column in Notion.
const PROPS = {
  name: "Type",
  amount: "Amount (THB)",
  categoryTotal: "Category Total",
  order: "Order",
  sumOf: "Sum Of Categories"
};

function serializePage(page) {
  const p = page.properties || {};
  const amount = numberOf(p[PROPS.amount]) ?? numberOf(p[PROPS.categoryTotal]) ?? 0;
  return {
    id: page.id,
    name: textOf(p[PROPS.name]),
    amount: Math.round(amount * 100) / 100,
    order: numberOf(p[PROPS.order]),
    isTotal: relationCount(p[PROPS.sumOf]) > 0
  };
}

module.exports = { notionFetch, getDataSource, serializePage };
