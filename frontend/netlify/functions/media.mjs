import {
  getStore,
} from "@netlify/blobs";


const PUBLIC_STORE =
  "foodkindl-media";


function jsonResponse(
  body,
  status = 200
) {
  return new Response(
    JSON.stringify(body),
    {
      status,

      headers: {
        "Content-Type":
          "application/json",
      },
    }
  );
}


export default async function handler(
  request
) {
  // ==========================================================
  // METHOD
  // ==========================================================

  if (
    request.method !== "GET"
  ) {
    return jsonResponse(
      {
        error:
          "Method not allowed.",
      },
      405
    );
  }


  try {
    // ========================================================
    // GET KEY
    // ========================================================

    const requestUrl =
      new URL(
        request.url
      );


    const key =
      requestUrl
        .searchParams
        .get("key");


    if (!key) {
      return jsonResponse(
        {
          error:
            "Missing media key.",
        },
        400
      );
    }


    // ========================================================
    // SECURITY
    //
    // This endpoint can ONLY read
    // the public media store.
    //
    // It cannot read Government IDs.
    // ========================================================

    if (
      key.startsWith(
        "government-ids/"
      )
    ) {
      return jsonResponse(
        {
          error:
            "Access denied.",
        },
        403
      );
    }


    // ========================================================
    // GET STORE
    // ========================================================

    const store =
      getStore(
        PUBLIC_STORE
      );


    // ========================================================
    // GET FILE
    // ========================================================

    const result =
      await store.getWithMetadata(
        key,
        {
          type:
            "blob",
        }
      );


    if (
      !result ||
      !result.data
    ) {
      return jsonResponse(
        {
          error:
            "Media not found.",
        },
        404
      );
    }


    // ========================================================
    // CONTENT TYPE
    // ========================================================

    const contentType =
      (
        result.metadata
          ?.contentType
        ||
        result.data
          ?.type
        ||
        "application/octet-stream"
      );


    // ========================================================
    // RESPONSE
    // ========================================================

    return new Response(
      result.data,
      {
        status: 200,

        headers: {
          "Content-Type":
            contentType,

          "Cache-Control":
            (
              "public, "
              +
              "max-age=86400"
            ),

          "X-Content-Type-Options":
            "nosniff",
        },
      }
    );


  } catch (error) {
    console.error(
      "NETLIFY BLOB READ ERROR:",
      error
    );


    return jsonResponse(
      {
        error:
          error?.message ||
          "Unable to load media.",
      },
      500
    );
  }
}