import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await req.json() // 'APPROVE' | 'REJECT' | 'HOLD'

  const statusMap: Record<string, string> = {
    APPROVE: 'APPROVED',
    REJECT: 'REJECTED',
    HOLD: 'HOLD',
  }

  const rec = await prisma.aiRecommendation.update({
    where: { id: params.id },
    data: {
      status: statusMap[action] || 'PENDING',
      userId: (session.user as any).id,
      ...(action === 'APPROVE' && { appliedAt: new Date() }),
    },
  })

  return NextResponse.json({ recommendation: rec })
}
