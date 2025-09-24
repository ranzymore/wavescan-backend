import { prisma } from "../utils/db.js";

export async function createStore(userId: string, name: string) {
  return prisma.$transaction(async (tx) => {
    const store = await tx.store.create({
      data: {
        name,
        userId,
        memberships: {
          create: {
            role: "owner",
            status: "active",
            userId,
          },
        },
      },
      include: { memberships: true },
    });

    return store;
  });
}

export async function getStores(userId: string) {
  return prisma.store.findMany({
    where: {
      memberships: {
        some: { userId },
      },
    },
    include: { memberships: true },
  });
}

export async function getStore(userId: string, id: string) {
  return prisma.store.findFirst({
    where: {
      id,
      memberships: {
        some: { userId },
      },
    },
    include: { memberships: true, categories: true, products: true },
  });
}

export async function updateStore(userId: string, id: string, data: any) {
  // Ensure membership
  const membership = await prisma.membership.findUnique({
    where: { userId_storeId: { userId, storeId: id } },
  });
  if (!membership) throw new Error("Unauthorized");

  return prisma.store.update({
    where: { id },
    data,
    include: { memberships: true },
  });
}

export async function deleteStore(userId: string, id: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_storeId: { userId, storeId: id } },
  });
  if (!membership || membership.role !== "owner") {
    throw new Error("Only owner can delete store");
  }

  return prisma.store.delete({
    where: { id },
  });
}
