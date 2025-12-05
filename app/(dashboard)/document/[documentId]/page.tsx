import DocumentCanvas from "@/components/document-canvas"; 
import { headers } from "next/headers";

export default async function EditDocument({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const headersList = await headers(); 

  const res = await fetch(`${baseUrl}/api/document/${documentId}`, {
    method: "GET",
    cache: "no-store",
    headers: headersList,
  });

  if (!res.ok) {
    console.error("Failed to fetch document:", res.statusText);
    return <div className="p-6">Document not found or unauthorized.</div>;
  }

  const { document } = await res.json();

  const effectiveFileType = document.fileType || (document.content ? "html" : (document.status === 'pending' ? "pending" : ""));
  const effectiveFileData = document.fileUrl || "";
  const isPending = document.status === 'pending';

  return (
    <div>
      <DocumentCanvas
        fileType={effectiveFileType}
        fileData={effectiveFileData}
        documentId={document.id}
        isPending={isPending}
        status={document.status} 
      />
    </div>
  );
}