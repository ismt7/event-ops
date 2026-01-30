import { NextResponse } from "next/server";

type ChatRequest = {
  apiKey?: string;
  prompt?: string;
  model?: string;
};

export async function POST(request: Request) {
  let payload: ChatRequest | null = null;

  try {
    payload = (await request.json()) as ChatRequest;
  } catch {
    return NextResponse.json(
      { error: "不正なリクエストです。" },
      { status: 400 }
    );
  }

  const apiKey = payload?.apiKey?.trim();
  const prompt = payload?.prompt?.trim();
  const model = payload?.model?.trim() || "gpt-4.1-mini";

  if (!apiKey || !prompt) {
    return NextResponse.json(
      { error: "APIキーとプロンプトが必要です。" },
      { status: 400 }
    );
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "あなたはイベントレポートのQ&A作成を支援する日本語アシスタントです。",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | {
        choices?: Array<{ message?: { content?: string } }>;
        error?: { message?: string };
      }
    | null;

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error?.message ?? "OpenAI APIエラーが発生しました。" },
      { status: response.status }
    );
  }

  const content = data?.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ text: content });
}
