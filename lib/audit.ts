import { prisma } from './prisma'

export async function createAuditLog(params: {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  detail?: string
  ipAddress?: string
}) {
  try {
    await prisma.auditLog.create({ data: params })
  } catch (e) {
    console.error('Audit log error:', e)
  }
}
