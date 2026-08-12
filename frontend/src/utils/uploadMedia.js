export async function uploadMedia(file) {
  if (!file) {
    throw new Error(
      "No file selected."
    );
  }

  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  let response;

  try {
    response =
      await fetch(
        "/.netlify/functions/media-upload",
        {
          method: "POST",
          body: formData,
        }
      );
  } catch (networkError) {
    console.error(
      "MEDIA UPLOAD NETWORK ERROR:",
      networkError
    );

    throw new Error(
      "Could not connect to the media upload service."
    );
  }

  let responseText = "";

  try {
    responseText =
      await response.text();
  } catch (readError) {
    console.error(
      "MEDIA UPLOAD RESPONSE READ ERROR:",
      readError
    );

    throw new Error(
      "Could not read the media upload response."
    );
  }

  let data = null;

  if (responseText) {
    try {
      data =
        JSON.parse(
          responseText
        );
    } catch (parseError) {
      console.error(
        "MEDIA UPLOAD NON-JSON RESPONSE:",
        responseText
      );

      console.error(
        "PARSE ERROR:",
        parseError
      );

      throw new Error(
        "Media upload service returned an invalid response."
      );
    }
  }

  if (!response.ok) {
    console.error(
      "MEDIA UPLOAD FAILED:",
      {
        status:
          response.status,

        statusText:
          response.statusText,

        responseText,

        data,
      }
    );

    throw new Error(
      data?.error ||
        data?.detail ||
        `Upload failed with status ${response.status}.`
    );
  }

  if (!data) {
    console.error(
      "MEDIA UPLOAD EMPTY RESPONSE:",
      {
        status:
          response.status,

        statusText:
          response.statusText,

        responseText,
      }
    );

    throw new Error(
      "Media upload service returned an empty response."
    );
  }

  if (!data.success) {
    console.error(
      "MEDIA UPLOAD UNSUCCESSFUL:",
      data
    );

    throw new Error(
      data?.error ||
        "Media upload was not successful."
    );
  }

  if (!data.url) {
    console.error(
      "MEDIA UPLOAD URL MISSING:",
      data
    );

    throw new Error(
      "Media upload completed without returning a media URL."
    );
  }

  return {
    success:
      true,

    key:
      data.key || "",

    url:
      data.url,

    filename:
      data.filename ||
      file.name,

    contentType:
      data.contentType ||
      file.type,

    size:
      data.size ||
      file.size,
  };
}