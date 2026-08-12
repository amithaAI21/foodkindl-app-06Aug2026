import {
  getStore,
} from "@netlify/blobs";


const PUBLIC_STORE =
  "foodkindl-media";

const GOVERNMENT_ID_STORE =
  "foodkindl-government-ids";


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


function getExtension(filename) {
  if (!filename) {
    return "bin";
  }

  const parts =
    filename.split(".");

  if (parts.length < 2) {
    return "bin";
  }

  return (
    parts.pop()?.toLowerCase() ||
    "bin"
  );
}


export default async function handler(
  request
) {
  try {
    // ========================================================
    // METHOD CHECK
    // ========================================================

    if (
      request.method !==
      "POST"
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Method not allowed.",
        },
        405
      );
    }


    // ========================================================
    // READ FORM
    // ========================================================

    const formData =
      await request.formData();


    const file =
      formData.get("file");


    const uploadType =
      String(
        formData.get(
          "upload_type"
        ) || "public"
      )
        .trim()
        .toLowerCase();


    if (
      !file ||
      typeof file ===
        "string"
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "No file selected.",
        },
        400
      );
    }


    // Useful debugging
    console.log(
      "UPLOAD:",
      {
        name:
          file.name,

        type:
          file.type,

        size:
          file.size,

        uploadType,
      }
    );


    // ========================================================
    // GOVERNMENT ID
    // ========================================================

    if (
      uploadType ===
      "government_id"
    ) {
      const allowedGovernmentIdTypes =
        [
          "image/jpeg",
          "image/png",
          "image/webp",
          "application/pdf",
        ];


      const allowedGovernmentIdExtensions =
        [
          "jpg",
          "jpeg",
          "png",
          "webp",
          "pdf",
        ];


      const extension =
        getExtension(
          file.name
        );


      const validMimeType =
        allowedGovernmentIdTypes.includes(
          file.type
        );


      const validExtension =
        allowedGovernmentIdExtensions.includes(
          extension
        );


      if (
        !validMimeType &&
        !validExtension
      ) {
        return jsonResponse(
          {
            success: false,

            error:
              (
                "Government ID must be "
                +
                "JPG, JPEG, PNG, WebP or PDF. "
                +
                `Received type: ${
                  file.type ||
                  "unknown"
                }`
              ),
          },
          400
        );
      }


      // 5 MB Government ID limit
      const maxGovernmentIdSize =
        5 * 1024 * 1024;


      if (
        file.size >
        maxGovernmentIdSize
      ) {
        return jsonResponse(
          {
            success: false,

            error:
              (
                "Government ID must "
                +
                "be smaller than 5 MB."
              ),
          },
          400
        );
      }


      const key =
        (
          "government-ids/"
          +
          crypto.randomUUID()
          +
          "."
          +
          extension
        );


      const store =
        getStore(
          GOVERNMENT_ID_STORE
        );


      await store.set(
        key,
        file,
        {
          metadata: {
            originalName:
              file.name,

            contentType:
              file.type ||
              (
                extension ===
                "pdf"
                  ? "application/pdf"
                  : "application/octet-stream"
              ),

            size:
              String(
                file.size
              ),

            uploadedAt:
              new Date()
                .toISOString(),

            category:
              "government_id",
          },
        }
      );


      // IMPORTANT:
      // Do not return a public URL
      // for Government ID.

      return jsonResponse(
        {
          success: true,

          private:
            true,

          key,

          filename:
            file.name,

          contentType:
            file.type,

          size:
            file.size,
        },
        200
      );
    }


    // ========================================================
    // PUBLIC PROFILE / COMMUNITY MEDIA
    // ========================================================

    const allowedPublicTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",

      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];


    const allowedPublicExtensions = [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",

      "mp4",
      "webm",
      "mov",
    ];


    const extension =
      getExtension(
        file.name
      );


    const validMimeType =
      allowedPublicTypes.includes(
        file.type
      );


    const validExtension =
      allowedPublicExtensions.includes(
        extension
      );


    if (
      !validMimeType &&
      !validExtension
    ) {
      return jsonResponse(
        {
          success: false,

          error:
            (
              "Unsupported file type. "
              +
              "Use JPG, JPEG, PNG, WebP, GIF, "
              +
              "MP4, WebM or MOV. "
              +
              `Received type: ${
                file.type ||
                "unknown"
              }`
            ),
        },
        400
      );
    }


    // ========================================================
    // DETERMINE IMAGE / VIDEO
    // ========================================================

    const isVideo =
      (
        file.type
          .startsWith(
            "video/"
          )
        ||
        [
          "mp4",
          "webm",
          "mov",
        ].includes(
          extension
        )
      );


    // Images: 10 MB
    // Videos: 25 MB

    const maxSize =
      isVideo
        ? (
            25 *
            1024 *
            1024
          )
        : (
            10 *
            1024 *
            1024
          );


    if (
      file.size >
      maxSize
    ) {
      return jsonResponse(
        {
          success: false,

          error:
            isVideo
              ? (
                  "Video must be "
                  +
                  "smaller than 25 MB."
                )
              : (
                  "Image must be "
                  +
                  "smaller than 10 MB."
                ),
        },
        400
      );
    }


    // ========================================================
    // BLOB KEY
    // ========================================================

    const folder =
      isVideo
        ? "videos"
        : "images";


    const key =
      (
        `${folder}/`
        +
        crypto.randomUUID()
        +
        "."
        +
        extension
      );


    // ========================================================
    // SAVE TO NETLIFY BLOB
    // ========================================================

    const store =
      getStore(
        PUBLIC_STORE
      );


    await store.set(
      key,
      file,
      {
        metadata: {
          originalName:
            file.name,

          contentType:
            file.type ||
            "application/octet-stream",

          size:
            String(
              file.size
            ),

          uploadedAt:
            new Date()
              .toISOString(),

          category:
            isVideo
              ? "video"
              : "image",
        },
      }
    );


    // ========================================================
    // PUBLIC URL
    // ========================================================

    const origin =
      new URL(
        request.url
      ).origin;


    const mediaUrl =
      (
        `${origin}`
        +
        `/.netlify/functions/media`
        +
        `?key=${encodeURIComponent(
          key
        )}`
      );


    // ========================================================
    // RESPONSE
    // ========================================================

    return jsonResponse(
      {
        success: true,

        private:
          false,

        key,

        url:
          mediaUrl,

        filename:
          file.name,

        contentType:
          file.type,

        size:
          file.size,
      },
      200
    );


  } catch (error) {
    console.error(
      "NETLIFY BLOB UPLOAD ERROR:",
      error
    );


    return jsonResponse(
      {
        success: false,

        error:
          error?.message ||
          (
            "Unable to upload "
            +
            "the selected file."
          ),
      },
      500
    );
  }
}