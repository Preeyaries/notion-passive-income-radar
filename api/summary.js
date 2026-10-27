const { notionFetch, getDataSource, serializePage } = require("./_notion");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const ds = await getDataSource();
    let rows = [], cursor;
    do {
      const j = await notionFetch(`/v1/data_sources/${ds.id}/query`, {
        method: "POST",
        body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) })
      });
      rows.push(...(j.results || []).map(serializePage));
      cursor = j.has_more ? j.next_cursor : undefined;
    } while (cursor);

    const categories = rows
      .filter(r => !r.isTotal && r.name)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    const totalRow = rows.find(r => r.isTotal);
    const computed = Math.round(categories.reduce((t, r) => t + r.amount, 0) * 100) / 100;

    res.status(200).json({
      categories: categories.map(({ name, amount }) => ({ name, amount })),
      total: totalRow ? totalRow.amount : computed,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Unable to read Notion summary." });
  }
};
