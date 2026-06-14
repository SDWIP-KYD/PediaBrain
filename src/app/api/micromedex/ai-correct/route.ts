import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

let _pool: Pool | null = null;
function getPool() {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 5000,
    });
    _pool.on("error", () => { _pool = null; });
  }
  return _pool;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const apiKey = process.env.TIANYUAI_API_KEY;
    const apiUrl = process.env.TIANYUAI_BASE_URL || "https://tianyuai.lol/v1";

    if (!apiKey) {
      return NextResponse.json({ error: "AI not configured" }, { status: 500 });
    }

    // Ask AI to correct the drug name
    const aiRes = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        max_tokens: 150,
        stream: false,
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You are a drug name spell-checker. Given a possibly misspelled drug name, return ONLY the corrected drug name. If you cannot determine the correct name, return the original input. No explanation, no extra text. Just the drug name.",
          },
          {
            role: "user",
            content: query,
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      return NextResponse.json({ corrected: query, suggestions: [] });
    }

    const aiData = await aiRes.json();
    const corrected =
      aiData.choices?.[0]?.message?.content?.trim() || query;

    // Search for the corrected name in DB
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, name, drug_class, is_pediatric_approved, neonatal_safe,
              substr(uses_summary, 1, 120) as uses_preview
       FROM micromedex_drugs
       WHERE LOWER(name) = LOWER($1)
          OR LOWER(name) LIKE LOWER($2) || '%'
          OR LOWER(name) LIKE '%' || LOWER($2) || '%'
       ORDER BY
         CASE WHEN LOWER(name) = LOWER($1) THEN 0
              WHEN LOWER(name) LIKE LOWER($2) || '%' THEN 1
              ELSE 2 END,
         LENGTH(name) ASC
       LIMIT 5`,
      [corrected, corrected]
    );

    return NextResponse.json({
      original: query,
      corrected: corrected !== query ? corrected : null,
      suggestions: result.rows,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
