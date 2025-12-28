import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST: Create a new version
export async function POST(
  req: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const { name, content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Get the next version number for this document
    const latestVersion = await prisma.documentVersion.findFirst({
      where: { documentId: params.documentId },
      orderBy: { version: "desc" },
      select: { version: true },
    });

    const nextVersion = (latestVersion?.version || 0) + 1;

    const versionName =
      name ||
      `Auto Draft - ${new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} ${new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;

    const newVersion = await prisma.documentVersion.create({
      data: {
        documentId: params.documentId,
        name: versionName,
        content: JSON.stringify(content), // Store TipTap JSON
        version: nextVersion,
      },
    });

    return NextResponse.json({ version: newVersion });
  } catch (error) {
    console.error("Error creating version:", error);
    return NextResponse.json(
      { error: "Failed to create version" },
      { status: 500 }
    );
  }
}

// GET: List all versions for a document
export async function GET(
  req: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const versions = await prisma.documentVersion.findMany({
      where: { documentId: params.documentId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        version: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ versions });
  } catch (error) {
    console.error("Error fetching versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch versions" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const { versionId } = await req.json();

    if (!versionId) {
      return NextResponse.json(
        { error: "versionId is required" },
        { status: 400 }
      );
    }

    const version = await prisma.documentVersion.findUnique({
      where: { id: versionId },
      select: { content: true },
    });

    if (!version) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }

    // Update the main document's content
    await prisma.document.update({
      where: { id: params.documentId },
      data: {
        content: version.content,
        updatedAt: new Date(),
      },
    });

    // Optional: bump the document's version field if you want to track current version
    // await prisma.document.update({
    //   where: { id: params.documentId },
    //   data: { version: { increment: 1 } },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error restoring version:", error);
    return NextResponse.json(
      { error: "Failed to restore version" },
      { status: 500 }
    );
  }
}