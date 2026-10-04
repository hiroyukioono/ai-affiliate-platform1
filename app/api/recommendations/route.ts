import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import OpenAI from "openai"

// -----------------------------
// OLLAMA 版 AI 推奨生成関数
// -----------------------------
async function generateAiRecommendations(
  data: { analytics: any[] },
  site: { siteName: string; affiliateTitle: string | null; status: string }
) {
  // OpenAI APIキーは不要
  const client = new OpenAI({
    apiKey: "ollama",
    baseURL: "http://localhost:12000/v1",
  })

  const response = await client.chat.completions.create({
    model: "llama3.1:8b",   // ←あなたの Ollama モデル名に合わせる
    messages: [
      {
        role: "system",
        content:
          "Generate actionable recommendations for an affiliate site. Return a JSON object with a recommendations array. Each item must include type, title, description, reasoning, dataUsed, uncertainty, and priority.",
      },
      {
        role: "user",
        content: JSON.stringify({ site, analytics: data.analytics }),
      },
    ],
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error("No recommendations returned")

  const parsed = JSON.parse(content)

  if (!Array.isArray(parsed.recommendations)) {
    throw new Error("Invalid recommendation response")
  }

  return parsed.recommendations
}

// -----------------------------
// GET
// -----------------------------
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const siteId = searchParams.get('siteId')
  const status = searchParams.get('status')
  const type = searchParams.get('type')

  const where: any = {}
  if (siteId) where.siteId = siteId
  if (status) where.status = status
  if (type) where.type = type

  const recs = await prisma.aiRecommendation.findMany({
    where,
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    include: { site: { select: { name: true } } },
  })

  return NextResponse.json({ recommendations: recs })
}

// -----------------------------
// POST
// -----------------------------
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { siteId } = await req.json()

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: (session.user as any).id },
  })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  const analyticsData = await prisma.analytics.findMany({
    where: { siteId, date: { gte: startDate } },
    orderBy: { date: 'asc' },
  })

  try {
    const recs = await generateAiRecommendations(
      { analytics: analyticsData },
      {
        siteName: site.name,
        affiliateTitle: site.affiliateTitle,
        status: site.status,
      }
    )

    const created = await Promise.all(
      recs.map((rec) =>
        prisma.aiRecommendation.create({
          data: {
            siteId,
            type: rec.type,
            title: rec.title,
            description: rec.description,
            reasoning: rec.reasoning,
            dataUsed: JSON.stringify(rec.dataUsed),
            uncertainty: rec.uncertainty,
            priority: rec.priority,
            status: 'PENDING',
          },
        })
      )
    )

    return NextResponse.json({ recommendations: created }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Generation failed' }, { status: 500 })
  }
}
