import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const rawFilename = formData.get("filename");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File tidak valid" },
        { status: 400 }
      );
    }

    const filename =
      typeof rawFilename === "string"
        ? rawFilename
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
        : `image-${Date.now()}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "products",
            public_id: filename,
            resource_type: "image",
            transformation: [
              { width: 1200, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error || !result) reject(error);
            else
              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
              });
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json(
      { error: "Upload gagal" },
      { status: 500 }
    );
  }
}
