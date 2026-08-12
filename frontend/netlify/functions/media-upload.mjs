import {
  getStore,
} from "@netlify/blobs";

export default async function handler(
  request
) {
  try {
    if (request.method !== "POST") {
      return Response.json(
        {
          success: false,
          error: "Method not allowed.",
        },
        {
          status: 405,
        }
      );
    }

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (
      !file ||
      typeof file === "string"
    ) {
      return Response.json(
        {
          success: false,
          error: "No file selected.",
        },
        {
          status: 400,
        }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Unsupported file type.",
        },
        {
          status: 400,
        }
      );
    }

    // Images: 10 MB
    // Videos: 25 MB
    const isVideo =
      file.type.startsWith(
        "video/"
      );

    const maxSize =
      isVideo
        ? 25 * 1024 * 1024
        : 10 * 1024 * 1024;

    if (
      file.size > maxSize
    ) {
      return Response.json(
        {
          success: false,
          error: isVideo
            ? "Video must be smaller than 25 MB."
            : "Image must be smaller than 10 MB.",
        },
        {
          status: 400,
        }
      );
    }

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() ||
      "bin";

    const key =
      `${crypto.randomUUID()}.${extension}`;

    const store =
      getStore(
        "foodkindl-media"
      );

    await store.set(
      key,
      file,
      {
        metadata: {
          originalName:
            file.name,

          contentType:
            file.type,

          size:
            String(
              file.size
            ),

          uploadedAt:
            new Date()
              .toISOString(),
        },
      }
    );

    const origin =
      new URL(
        request.url
      ).origin;

    const mediaUrl =
      `${origin}/.netlify/functions/media?key=${encodeURIComponent(
        key
      )}`;

    return Response.json(
      {
        success: true,

        key,
        url: mediaUrl,

        filename:
          file.name,

        contentType:
          file.type,

        size:
          file.size,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "NETLIFY BLOB UPLOAD ERROR:",
      error
    );

    return Response.json(
      {
        success: false,

        error:
          error?.message ||
          "Unable to upload media.",
      },
      {
        status: 500,
      }
    );
  }
}