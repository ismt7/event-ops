import { NextResponse } from "next/server";

type ModelsRequest = {
  apiKey?: string;
};

type ModelResponse = {
  data?: Array<{ id?: string }>;
  error?: { message?: string };
};

export async function POST(request: Request) {
  let payload: ModelsRequest | null = null;

  try {
    payload = (await request.json()) as ModelsRequest;
  } catch {
    return NextResponse.json(
      { error: "不正なリクエストです。" },
      { status: 400 }
    );
  }

  const apiKey = payload?.apiKey?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: "APIキーが必要です。" },
      { status: 400 }
    );
  }

  const response = await fetch("https://api.openai.com/v1/models", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const data = (await response.json().catch(() => null)) as ModelResponse | null;

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error?.message ?? "OpenAI APIエラーが発生しました。" },
      { status: response.status }
    );
  }

  const models = Array.isArray(data?.data)
    ? data!.data
        .map((item) => item?.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
        .sort((a, b) => a.localeCompare(b))
    : [];

  return NextResponse.json({ models });
}
