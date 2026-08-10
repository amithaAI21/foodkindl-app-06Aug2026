import { getStore } from "@netlify/blobs";

export default async (request) => {
  try {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({
          error: "Method not allowed",
        }),
        {
          status: 405,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (!file) {
      return new Response(
        JSON.stringify({
          error: "No file uploaded",
        }),
        {
          status: 400,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Unsupported file type",
        }),
        {
          status: 400,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "bin";

    const key =
      `community/${crypto.randomUUID()}.${extension}`;

    const store =
      getStore("foodkindl-media");

    await store.set(
      key,
      file,
      {
        metadata: {
          filename: file.name,
          contentType: file.type,
        },
      }
    );

    return Response.json({
      key,
      url:
        `/.netlify/functions/media?key=${encodeURIComponent(
          key
        )}`,
    });
  } catch (error) {
    console.error(
      "Upload failed:",
      error
    );

    return new Response(
      JSON.stringify({
        error:
          "Media upload failed",
      }),
      {
        status: 500,
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );
  }
};