"use server";

import "server-only";

import { type PlateSlide } from "@/components/presentation/utils/parser";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { type InputJsonValue } from "@prisma/client/runtime/library";

export async function createPresentation({
  content,
  title,
  theme = "default",
  outline,
  imageSource,
  presentationStyle,
  language,
}: {
  content: {
    slides: PlateSlide[];
  };
  title: string;
  theme?: string;
  outline?: string[];
  imageSource?: string;
  presentationStyle?: string;
  language?: string;
}) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    throw new Error("Unauthorized");
  }
  const userId = supabaseUser.id;

  try {
    const presentation = await prisma.document.create({
      data: {
        type: "PRESENTATION",
        docType: "presentation",
        title: title ?? "Untitled Presentation",
        user: { connect: { authId: userId } },
        presentation: {
          create: {
            content: content as unknown as InputJsonValue,
            theme: theme,
            imageSource,
            presentationStyle,
            language,
            outline: outline,
          },
        },
      },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      message: "Presentation created successfully",
      presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to create presentation",
    };
  }
}

export async function createEmptyPresentation(
  title: string,
  theme = "default",
  language = "en-US",
) {
  const emptyContent: { slides: PlateSlide[] } = { slides: [] };

  return createPresentation({
    content: emptyContent,
    title,
    theme,
    language,
  });
}

export async function updatePresentation({
  id,
  content,
  prompt,
  title,
  theme,
  outline,
  searchResults,
  imageSource,
  presentationStyle,
  language,
  thumbnail,
}: {
  id: string;
  content?: {
    slides: PlateSlide[];
    config: Record<string, unknown>;
  };
  title?: string;
  theme?: string;
  prompt?: string;
  outline?: string[];
  searchResults?: Array<{ query: string; results: unknown[] }>;
  imageSource?: string;
  presentationStyle?: string;
  language?: string;
  thumbnail?: string;
}) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    throw new Error("Unauthorized");
  }
  const userId = supabaseUser.id;

  try {
    // Extract values from content if provided there
    const effectiveTheme = theme;
    const effectiveImageSource = imageSource;
    const effectivePresentationStyle = presentationStyle;
    const effectiveLanguage = language;

    // Update base document with all presentation data
    const presentation = await prisma.document.update({
      where: { 
        id,
        user: { authId: userId },
      },
      data: {
        title: title,
        thumbnail,
        presentation: {
          update: {
            prompt: prompt,
            content: content as unknown as InputJsonValue,
            theme: effectiveTheme,
            imageSource: effectiveImageSource,
            presentationStyle: effectivePresentationStyle,
            language: effectiveLanguage,
            outline,
            searchResults: searchResults as unknown as InputJsonValue,
          },
        },
      },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      message: "Presentation updated successfully",
      presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update presentation",
    };
  }
}

export async function updatePresentationTitle(id: string, title: string) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    throw new Error("Unauthorized");
  }
  const userId = supabaseUser.id;

  try {
    const presentation = await prisma.document.update({
      where: { 
        id,
        user: { authId: userId },
      },
      data: { title },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      message: "Presentation title updated successfully",
      presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update presentation title",
    };
  }
}

export async function deletePresentation(id: string) {
  return deletePresentations([id]);
}

export async function deletePresentations(ids: string[]) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    throw new Error("Unauthorized");
  }
  const userId = supabaseUser.id;

  try {
    // Delete the base documents using deleteMany (this will cascade delete the presentations)
    const result = await prisma.document.deleteMany({
      where: {
        id: {
          in: ids,
        },
        user: { authId: userId },
      },
    });

    const deletedCount = result.count;
    const failedCount = ids.length - deletedCount;

    if (failedCount > 0) {
      return {
        success: deletedCount > 0,
        message:
          deletedCount > 0
            ? `Deleted ${deletedCount} presentations, failed to delete ${failedCount} presentations`
            : "Failed to delete presentations",
        partialSuccess: deletedCount > 0,
      };
    }

    return {
      success: true,
      message:
        ids.length === 1
          ? "Presentation deleted successfully"
          : `${deletedCount} presentations deleted successfully`,
    };
  } catch (error) {
    console.error("Failed to delete presentations:", error);
    return {
      success: false,
      message: "Failed to delete presentations",
    };
  }
}

// Get the presentation with the presentation content
export async function getPresentation(id: string) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    throw new Error("Unauthorized");
  }
  const userId = supabaseUser.id;

  try {
    const presentation = await prisma.document.findUnique({
      where: { 
        id,
        OR: [
          { user: { authId: userId } },
          { isPublic: true },
        ],
      },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to fetch presentation",
    };
  }
}

export async function getPresentationContent(id: string) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    throw new Error("Unauthorized");
  }
  const userId = supabaseUser.id;

  try {
    const presentation = await prisma.document.findUnique({
      where: { 
        id,
        OR: [
          { user: { authId: userId } },
          { isPublic: true },
        ],
      },
      include: {
        presentation: {
          select: {
            id: true,
            content: true,
            theme: true,
            outline: true,
          },
        },
      },
    });

    if (!presentation) {
      return {
        success: false,
        message: "Presentation not found",
      };
    }

    return {
      success: true,
      presentation: presentation.presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to fetch presentation",
    };
  }
}

export async function updatePresentationTheme(id: string, theme: string) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    throw new Error("Unauthorized");
  }
  const userId = supabaseUser.id;

  try {
    const presentation = await prisma.document.update({
      where: { 
        id,
        user: { authId: userId },
      },
      data: {
        presentation: {
          update: { theme },
        },
      },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      message: "Presentation theme updated successfully",
      presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update presentation theme",
    };
  }
}

export async function duplicatePresentation(id: string, newTitle?: string) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    throw new Error("Unauthorized");
  }
  const userId = supabaseUser.id;

  try {
    // Get the original presentation
    const original = await prisma.document.findUnique({
      where: { 
        id,
        OR: [
          { user: { authId: userId } },
          { isPublic: true },
        ],
      },
      include: {
        presentation: true,
        user: true,
      },
    });

    if (!original?.presentation) {
      return {
        success: false,
        message: "Original presentation not found",
      };
    }

    // Create a new presentation with the same content
    const duplicated = await prisma.document.create({
      data: {
        type: "PRESENTATION",
        docType: "presentation",
        title: newTitle ?? `${original.title} (Copy)`,
        user: { connect: { authId: userId } },
        isPublic: false,
        presentation: {
          create: {
            content: original.presentation.content as unknown as InputJsonValue,
            theme: original.presentation.theme,
          },
        },
      },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      message: "Presentation duplicated successfully",
      presentation: duplicated,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to duplicate presentation",
    };
  }
}