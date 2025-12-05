

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import CloudConvert from "cloudconvert";

const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY as string);
export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    // Extract or fallback to a valid filename
    const originalName = file.name || "uploaded.pdf";

    // --- Create job ---
    const job = await cloudConvert.jobs.create({
      tasks: {
        import_upload: { operation: "import/upload" },
        convert_pdf_to_docx: {
          operation: "convert",
          input: ["import_upload"],
          input_format: "pdf",
          output_format: "docx",
        },
        export_result: {
          operation: "export/url",
          input: ["convert_pdf_to_docx"],
        },
      },
    });

    // --- Find and upload ---
    const uploadTask = job.tasks.find((t: any) => t.name === "import_upload");
    if (!uploadTask) throw new Error("Upload task not found.");

    const arrayBuffer = await file.arrayBuffer();

    // Send file name explicitly
    await cloudConvert.tasks.upload(
      uploadTask,
      Buffer.from(arrayBuffer),
      originalName
    );

    // --- Wait for job completion ---
    const completedJob = await cloudConvert.jobs.wait(job.id);

    const convertTask = completedJob.tasks.find((t: any) => t.name === "convert_pdf_to_docx");
    if (convertTask?.status !== "finished") {
      throw new Error(`Conversion failed or incomplete: ${convertTask?.status}`);
    }

    const exportTask = completedJob.tasks.find((t: any) => t.name === "export_result");
    if (!exportTask?.result?.files?.length) {
      console.error("Export task details:", exportTask);
      throw new Error("No exportable file found after conversion. Check CloudConvert job logs.");
    }

    const fileUrl = exportTask.result.files[0].url;
    if (!fileUrl) {
      throw new Error("File URL is undefined.");
    }

    // --- Fetch and encode the DOCX file ---
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Failed to fetch converted file from CloudConvert.");
    const arrayBufferDocx = await response.arrayBuffer();
    const base64Docx = Buffer.from(arrayBufferDocx).toString("base64");

    // --- Return JSON with base64 DOCX ---
    return NextResponse.json({
      success: true,
      fileData: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64Docx}`,
    });
  } catch (error: any) {
    console.error("CloudConvert Error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Conversion failed" },
      { status: 500 }
    );
  }
}
