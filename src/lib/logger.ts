import { prisma } from "@/lib/prisma";

export async function logActivity({
  userId,
  action,
  entityId,
  entityType,
  details
}: {
  userId: string;
  action: string;
  entityId?: string;
  entityType: string;
  details?: any;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityId,
        entityType,
        details: details ? JSON.stringify(details) : "{}",
      }
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
