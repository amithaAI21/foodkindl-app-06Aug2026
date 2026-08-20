import {
  getStore,
} from "@netlify/blobs";


const GOVERNMENT_ID_STORE =
  "foodkindl-government-ids";


// ============================================================
// RESPONSE HELPERS
// ============================================================

function textResponse(
  message,
  status = 200
) {
  return new Response(
    message,
    {
      status,

      headers: {
        "Content-Type":
          "text/plain; charset=utf-8",
      },
    }
  );
}


// ============================================================
// GOVERNMENT ID
// ============================================================

export default async function handler(
  request
) {

  try {

    // ========================================================
    // METHOD
    // ========================================================

    if (
      request.method !==
      "GET"
    ) {

      return textResponse(
        "Method not allowed.",
        405
      );

    }


    // ========================================================
    // GET KEY
    // ========================================================

    const url =
      new URL(
        request.url
      );


    const key =
      url.searchParams.get(
        "key"
      );


    if (!key) {

      return textResponse(
        "Government ID key is required.",
        400
      );

    }


    // ========================================================
    // BASIC KEY VALIDATION
    // ========================================================

    if (
      !key.startsWith(
        "government-ids/"
      )
    ) {

      return textResponse(
        "Invalid Government ID key.",
        400
      );

    }


    // ========================================================
    // STORE
    // ========================================================

    const store =
      getStore(
        GOVERNMENT_ID_STORE
      );


    // ========================================================
    // READ FILE + METADATA
    // ========================================================

    const entry =
      await store.getWithMetadata(
        key,
        {
          type:
            "arrayBuffer",
        }
      );


    if (
      !entry ||
      !entry.data
    ) {

      return textResponse(
        "Government ID was not found.",
        404
      );

    }


    // ========================================================
    // METADATA
    // ========================================================

    const metadata =
      entry.metadata || {};


    const contentType =
      metadata.contentType ||
      "application/octet-stream";


    const originalName =
      metadata.originalName ||
      "government-id";


    // ========================================================
    // RETURN FILE
    // ========================================================

    return new Response(
      entry.data,
      {
        status: 200,

        headers: {

          "Content-Type":
            contentType,

          "Content-Disposition":
            `inline; filename="${originalName.replace(
              /"/g,
              ""
            )}"`,

          "Cache-Control":
            "private, no-store, max-age=0",

          "X-Content-Type-Options":
            "nosniff",
        },
      }
    );


  } catch (
    error
  ) {

    console.error(
      "GOVERNMENT ID READ ERROR:",
      error
    );


    return textResponse(
      "Unable to load Government ID.",
      500
    );

  }
}