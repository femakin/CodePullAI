// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// This prevents multiple PrismaClient instances during development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
