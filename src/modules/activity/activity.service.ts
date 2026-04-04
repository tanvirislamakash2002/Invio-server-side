import { prisma } from "../../lib/prisma";

interface GetAllActivitiesParams {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  entityType?: string;
  action?: string;
}

export const activityService = {
  getRecent: async (limit: number = 10) => {
    return await prisma.activity.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        order: { select: { orderNumber: true } },
      },
    });
  },

  getAll: async ({ page, limit, skip, sortBy, sortOrder, entityType, action }: GetAllActivitiesParams) => {
    const where: any = {};
    
    if (entityType) {
      where.entityType = entityType;
    }
    
    if (action) {
      where.action = { contains: action, mode: "insensitive" };
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        take: limit,
        skip,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: { select: { name: true, email: true } },
          order: { select: { orderNumber: true } },
        },
      }),
      prisma.activity.count({ where }),
    ]);

    return {
      data: activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Helper method to create activity (used by other modules)
  create: async (data: {
    action: string;
    description: string;
    entityType: string;
    entityId: string;
    userId: string;
    orderId?: string;
  }) => {
    return await prisma.activity.create({
      data: {
        action: data.action,
        description: data.description,
        entityType: data.entityType as any,
        entityId: data.entityId,
        userId: data.userId,
        orderId: data.orderId || null,
      },
    });
  },
};