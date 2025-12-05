export const getFileTypeColor = (fileType: string): string => {
  if (fileType.includes("pdf")) return "bg-red-100 text-red-600";
  if (fileType.includes("word") || fileType.includes("doc") || fileType.includes("officedocument.wordprocessingml"))
    return "bg-blue-100 text-blue-600";
  if (
    fileType.includes("image") ||
    fileType.includes("png") ||
    fileType.includes("jpg")
  )
    return "bg-green-100 text-green-600";
  return "bg-gray-100 text-gray-600";
};



export const getFriendlyFileType = (mimeType: string): string => {
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("officedocument.wordprocessingml")) return "DOCX";
  if (mimeType.includes("officedocument.spreadsheetml")) return "XLSX";
  if (mimeType.includes("officedocument.presentationml")) return "PPTX";
  if (mimeType.includes("word") || mimeType.includes("doc")) return "DOC";
  if (mimeType.includes("image")) return "Image";
  if (mimeType.includes("text")) return "Text";
  return "Document";
};