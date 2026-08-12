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


function getExtension(
  filename
) {
  if (!filename) {
    return "bin";
  }

  const parts =
    filename.split(".");

  if (
    parts.length < 2
  ) {
    return "bin";
  }

  return (
    parts
      .pop()
      ?.toLowerCase() ||
    "bin"
  );
}


export default async function handler(
  request
) {
  try {
    // ========================================================
    // METHOD
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
    // FORM DATA
    // ========================================================

    const formData =
      await request.formData();


    const file =
      formData.get(
        "file"
      );


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


    const extension =
      getExtension(
        file.name
      );


    console.log(
      "UPLOAD:",
      {
        name:
          file.name,

        type:
          file.type,

        size:
          file.size,

        extension,

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
      const allowedGovernmentIdTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];


      const allowedGovernmentIdExtensions = [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "pdf",
      ];


      const validMimeType =
        allowedGovernmentIdTypes
          .includes(
            file.type
          );


      const validExtension =
        allowedGovernmentIdExtensions
          .includes(
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


      // 5 MB
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


      // Private: no public URL
      return jsonResponse(
        {
          success: true,

          private:
            true,

          key,

          filename:
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
            file.size,
        },
        200
      );
    }


    // ========================================================
    // PUBLIC MEDIA
    // ========================================================

    const allowedPublicTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",

      "video/mp4",
      "video/webm",
      "video/quicktime",

      "application/pdf",
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

      "pdf",
    ];


    const validMimeType =
      allowedPublicTypes
        .includes(
          file.type
        );


    const validExtension =
      allowedPublicExtensions
        .includes(
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
              "MP4, WebM, MOV or PDF. "
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
    // FILE TYPE
    // ========================================================

    const isPdf =
      (
        file.type ===
        "application/pdf"
        ||
        extension ===
        "pdf"
      );


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


    const isImage =
      (
        file.type
          .startsWith(
            "image/"
          )
        ||
        [
          "jpg",
          "jpeg",
          "png",
          "webp",
          "gif",
        ].includes(
          extension
        )
      );


    // ========================================================
    // SIZE LIMIT
    // ========================================================

    let maxSize;


    if (isVideo) {
      maxSize =
        25 * 1024 * 1024;

    } else if (isPdf) {
      maxSize =
        10 * 1024 * 1024;

    } else {
      maxSize =
        10 * 1024 * 1024;
    }


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

              : isPdf
                ? (
                    "PDF must be "
                    +
                    "smaller than 10 MB."
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
    // FOLDER
    // ========================================================

    let folder =
      "files";


    if (isVideo) {
      folder =
        "videos";

    } else if (isImage) {
      folder =
        "images";

    } else if (isPdf) {
      folder =
        "documents";
    }


    // ========================================================
    // KEY
    // ========================================================

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
    // STORE
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
            (
              isPdf
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
            isVideo
              ? "video"

              : isImage
                ? "image"

                : isPdf
                  ? "pdf"

                  : "file",
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
          file.type ||
          (
            isPdf
              ? "application/pdf"
              : "application/octet-stream"
          ),

        size:
          file.size,

        category:
          isVideo
            ? "video"

            : isImage
              ? "image"

              : isPdf
                ? "pdf"

                : "file",
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