import { NextRequest, NextResponse } from 'next/server';

const MINIMAX_API_URL = 'https://api.minimaxi.com/v1/chat/completions';
const MINIMAX_MODEL = 'MiniMax-M2.5-highspeed';

function stripThinking(content: string): string {
  return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ProjectContext {
  name: string;
  scientist: string;
  org: string;
  industry: string;
  trl: number;
  score: number;
  summary: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, projectContext } = (await req.json()) as {
      messages: ChatMessage[];
      projectContext?: ProjectContext;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 });
    }

    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: '服务配置错误' }, { status: 500 });
    }

    const systemPrompt = projectContext
      ? `你是赛乔 Agent，一位专业的科技成果转化顾问，服务于科技园区和孵化器平台。你具备以下专业能力：
1. 深度理解科技成果的技术价值和商业化路径
2. 熟悉风险投资、产业资本、政府产业基金等各类投资主体的需求
3. 掌握知识产权保护、技术转让、股权投资等商业化模式
4. 了解各行业市场趋势和竞争格局
5. 能够为科研人员和投资人提供专业、务实、有针对性的建议

当前正在讨论的科技项目信息：
- 项目名称：${projectContext.name}
- 科研人员：${projectContext.scientist}
- 所属机构：${projectContext.org}
- 行业领域：${projectContext.industry}
- 技术成熟度（TRL）：${projectContext.trl}/9
- AI综合评分：${projectContext.score}/100
- 项目摘要：${projectContext.summary}

请基于以上项目信息，以专业、严谨、务实的风格回答用户的问题。回答要结合具体项目特点，提供有针对性的建议，避免空泛表述。`
      : `你是赛乔 Agent，一位专业的科技成果转化顾问，专注于帮助科研人员评估技术成果的商业化潜力。你具备以下能力：
1. 深度理解科技成果的技术价值和商业化路径
2. 熟悉风险投资、产业资本、政府产业基金等各类投资主体的需求
3. 掌握知识产权保护、技术转让、股权投资等商业化模式
4. 了解各行业市场趋势和竞争格局
5. 能够为科研人员提供专业、务实、有针对性的商业化建议

请以专业、亲切的风格与用户交流，给出具体且有参考价值的建议。`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    let response: Response;
    try {
      response = await fetch(MINIMAX_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MINIMAX_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 4000,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('MiniMax API error:', response.status, errText);
      return NextResponse.json(
        { error: `AI 服务调用失败（${response.status}），请稍后重试` },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Check for MiniMax application-level errors (HTTP 200 but error in body)
    if (data.base_resp?.status_code && data.base_resp.status_code !== 0) {
      console.error('MiniMax app error:', data.base_resp);
      return NextResponse.json(
        { error: `AI 服务错误：${data.base_resp.status_msg}` },
        { status: 502 }
      );
    }

    const raw: string = data.choices?.[0]?.message?.content ?? '';
    const content = stripThinking(raw);

    if (!content) {
      return NextResponse.json({ error: 'AI 未返回有效内容，请重试' }, { status: 502 });
    }

    return NextResponse.json({ content });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ error: '请求超时，请重试' }, { status: 408 });
    }
    console.error('Chat route error:', err);
    return NextResponse.json({ error: '服务暂时不可用，请稍后重试' }, { status: 500 });
  }
}
