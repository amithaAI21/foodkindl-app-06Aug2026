import { getStore } from "@netlify/blobs";

export default async (request) => {
  try {
    const url =
      new URL(request.url);

    const key =
      url.searchParams.get("key");

    if (!key) {
      return new Response(
        "Missing media key",
        {
          status: 400,
        }
      );
    }

    const store =
      getStore("foodkindl-media");

    const blob =
      await store.get(
        key,
        {
          type: "blob",
        }
      );

    if (!blob) {
      return new Response(
        "Media not found",
        {
          status: 404,
        }
      );
    }

    const metadata =
      await store.getMetadata(
        key
      );

    const contentType =
      metadata?.metadata
        ?.contentType ||
      "application/octet-stream";

    return new Response(
      blob,
      {
        headers: {
          "Content-Type":
            contentType,

          "Cache-Control":
            "public, max-age=86400",
        },
      }
    );
  } catch (error) {
    console.error(
      "Media retrieval failed:",
      error
    );

    return new Response(
      "Unable to load media",
      {
        status: 500,
      }
    );
  }
};