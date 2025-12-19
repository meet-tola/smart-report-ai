"use server";
import "server-only";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { type Prisma, DocumentType } from "@prisma/client";

export type PresentationDocument = Prisma.DocumentGetPayload<{
  include: {
    presentation: true;
  };
}>;

const ITEMS_PER_PAGE = 10;

export async function fetchPresentations(page = 0) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  const userId = supabaseUser?.id;

  if (!userId) {
    return {
      items: [],
      hasMore: false,
    };
  }

  const skip = page * ITEMS_PER_PAGE;

  const items = await prisma.document.findMany({
    where: {
      user: { authId: userId },
      type: DocumentType.PRESENTATION,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: ITEMS_PER_PAGE,
    skip: skip,
  });

  const hasMore = items.length === ITEMS_PER_PAGE;

  return {
    items,
    hasMore,
  };
}

export async function fetchPublicPresentations(page = 0) {
  const skip = page * ITEMS_PER_PAGE;

  const [items, total] = await Promise.all([
    prisma.document.findMany({
      where: {
        type: DocumentType.PRESENTATION,
        isPublic: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: ITEMS_PER_PAGE,
      skip: skip,
      include: {
        presentation: true,
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    }),
    prisma.document.count({
      where: {
        type: DocumentType.PRESENTATION,
        isPublic: true,
      },
    }),
  ]);

  const hasMore = skip + ITEMS_PER_PAGE < total;

  return {
    items,
    hasMore,
  };
}

export async function fetchUserPresentations(userId: string, page = 0) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  const currentUserId = supabaseUser?.id;

  const skip = page * ITEMS_PER_PAGE;

  const [items, total] = await Promise.all([
    prisma.document.findMany({
      where: {
        user: { authId: userId },
        type: DocumentType.PRESENTATION,
        OR: [
          { isPublic: true },
          { user: { authId: currentUserId } },
        ],
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: ITEMS_PER_PAGE,
      skip: skip,
      include: {
        presentation: true,
      },
    }),
    prisma.document.count({
      where: {
        user: { authId: userId },
        type: DocumentType.PRESENTATION,
        OR: [{ isPublic: true }, { user: { authId: currentUserId } }],
      },
    }),
  ]);

  const hasMore = skip + ITEMS_PER_PAGE < total;

  return {
    items,
    hasMore,
  };
}