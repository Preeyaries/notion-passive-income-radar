# Notion Passive Income Radar

A radar chart widget for Notion that reads the **Passive Income Summary** database live.
Built the same way as notion-life-calendar-widget: a static page plus a Vercel serverless API that talks to Notion.

- Axes: one per category row (Bank Interest, Stock Dividends, Fund Distributions, Other Income).
- The row that has **Sum Of Categories** filled is treated as the Total and shown as the headline number.
- Values come from the `Amount (THB)` formula (falls back to `Category Total`).
- Refreshes every 30 seconds, when the embed becomes visible again, and on the Refresh button.
- Log scale is the default because the categories differ by orders of magnitude. Linear scale is one click away.

## Notion connection permissions
Read only, so enable:
- Read content

Give the connection Content access to the **Passive Income Summary** database
**and** the **Passive Income** database (the rollup in the summary reads from it).

## Vercel environment variables
- `NOTION_TOKEN`
- `NOTION_DATABASE_ID` = the Passive Income Summary database ID (`6c7fd495c1214292ad00ea18d3103dee`)

Do not put the Notion token in GitHub.

## Embed in Notion
Paste the Vercel URL into the page and choose **Embed**.
Add `?theme=dark` or `?theme=light` to the URL to force a theme.

## Renaming columns
If you rename a column in Notion, update `PROPS` in `api/_notion.js`.
