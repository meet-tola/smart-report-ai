"use server";

import "server-only";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Get a public presentation without requiring authentication
 * This is used for the shared presentation view
 */
export async function getSharedPresentation(id: string) {
  try {
    const presentation = await prisma.document.findUnique({
      where: {
        id,
        isPublic: true, // Only fetch public presentations
        type: "PRESENTATION", // Assuming DocumentType.PRESENTATION enum value
      },
      include: {
        presentation: {
          select: {
            id: true,
            content: true,
            theme: true,
            outline: true,
            presentationStyle: true,
            language: true,
          },
        },
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!presentation) {
      return {
        success: false,
        message: "Presentation not found or not public",
      };
    }

    return {
      success: true,
      presentation,
    };
  } catch (error) {
    console.error("Error fetching shared presentation:", error);
    return {
      success: false,
      message: "Failed to fetch presentation",
    };
  }
}

/**
 * Toggle the public status of a presentation
 */
export async function togglePresentationPublicStatus(
  id: string,
  isPublic: boolean,
) {
  // Get the current session
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  // Check if user is authenticated
  const userId = supabaseUser?.id;
  if (!userId) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  try {
    // This requires auth and ownership verification
    const presentation = await prisma.document.update({
      where: {
        id,
        user: { authId: userId }, // Only the owner can change the public status
        type: "PRESENTATION", // Assuming DocumentType.PRESENTATION enum value
      },
      data: { isPublic },
    });

    return {
      success: true,
      message: isPublic
        ? "Presentation is now publicly accessible"
        : "Presentation is now private",
      presentation,
    };
  } catch (error) {
    console.error("Error updating presentation public status:", error);
    return {
      success: false,
      message: "Failed to update presentation public status",
    };
  }
}