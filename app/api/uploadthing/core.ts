import "server-only";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { createClient } from "@/utils/supabase/server";

const f = createUploadthing();

export const utapi = new UTApi();
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const supabase = await createClient();
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();

      console.log(supabaseUser);
      // If you throw, the user will not be able to upload
      if (!supabaseUser) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: supabaseUser.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
  editorUploader: f({
    image: { maxFileSize: "4MB" },
    pdf: { maxFileSize: "16MB" },
    text: { maxFileSize: "16MB" },
    video: { maxFileSize: "64MB" },
  })
    .middleware(async () => {
      const supabase = await createClient();
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (!supabaseUser) throw new UploadThingError("Unauthorized");
      return { userId: supabaseUser.id };
    })
    .onUploadComplete(async ({ file }) => {
      // Simply return the file URL and name
      return {
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.ufsUrl,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;