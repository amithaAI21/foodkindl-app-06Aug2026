import logging

import requests

from django.conf import settings


logger = logging.getLogger(
    __name__
)


FAST2SMS_URL = (
    "https://www.fast2sms.com/dev/bulkV2"
)


# ============================================================
# NORMALIZE INDIAN PHONE NUMBER
# ============================================================

def normalize_indian_number(
    phone_number,
):

    if not phone_number:
        return ""


    number = (
        str(phone_number)
        .strip()
        .replace(" ", "")
        .replace("-", "")
        .replace("(", "")
        .replace(")", "")
    )


    # +919746711754
    # ->
    # 9746711754

    if (
        number.startswith("+91")
        and len(number) == 13
    ):
        number = number[3:]


    # 919746711754
    # ->
    # 9746711754

    elif (
        number.startswith("91")
        and len(number) == 12
    ):
        number = number[2:]


    if (
        not number.isdigit()
        or len(number) != 10
    ):
        return ""


    return number


# ============================================================
# BUILD SOS MESSAGE
# ============================================================

def build_sos_message(
    *,
    user,
    sos_event,
):

    user_name = (
        user.get_full_name().strip()
        or user.first_name
        or "A FoodKindl member"
    )


    message = (
        f"FOODKINDL SOS ALERT: "
        f"{user_name} may be in danger and needs help. "
        f"Please contact them immediately."
    )


    if (
        sos_event.latitude is not None
        and
        sos_event.longitude is not None
    ):

        map_url = (
            "https://maps.google.com/?q="
            f"{sos_event.latitude},"
            f"{sos_event.longitude}"
        )


        message += (
            f" Location: {map_url}"
        )


    return message


# ============================================================
# SEND ONE FAST2SMS MESSAGE
# ============================================================

def send_fast2sms(
    *,
    phone_number,
    message,
):

    api_key = (
        settings.FAST2SMS_API_KEY
    )


    if not api_key:

        return {
            "success":
                False,

            "error":
                "FAST2SMS_API_KEY is not configured.",
        }


    number = (
        normalize_indian_number(
            phone_number
        )
    )


    if not number:

        return {
            "success":
                False,

            "error":
                "Invalid Indian phone number.",
        }


    headers = {
        "Authorization":
            api_key,

        "Content-Type":
            "application/json",
    }


    payload = {
        "route":
            "q",

        "message":
            message,

        "numbers":
            number,

        "sms_details":
            "1",
    }


    try:

        response = requests.post(
            FAST2SMS_URL,
            headers=headers,
            json=payload,
            timeout=12,
        )


        try:

            response_data = (
                response.json()
            )

        except ValueError:

            response_data = {
                "raw":
                    response.text
            }


        logger.info(
            "Fast2SMS response status=%s number=%s response=%s",
            response.status_code,
            number,
            response_data,
        )


        if (
            response.ok
            and
            response_data.get(
                "return"
            ) is not False
        ):

            return {
                "success":
                    True,

                "number":
                    number,

                "provider_response":
                    response_data,
            }


        return {
            "success":
                False,

            "number":
                number,

            "error":
                response_data,
        }


    except requests.RequestException as exc:

        logger.exception(
            "Fast2SMS request failed."
        )


        return {
            "success":
                False,

            "number":
                number,

            "error":
                str(exc),
        }


# ============================================================
# SEND SOS TO TRUSTED CONTACTS
# ============================================================

def send_sos_to_contacts(
    *,
    user,
    sos_event,
    contacts,
):

    message = (
        build_sos_message(
            user=user,
            sos_event=sos_event,
        )
    )


    results = []


    for contact in contacts:

        result = (
            send_fast2sms(
                phone_number=
                    contact.phone_number,

                message=
                    message,
            )
        )


        results.append(
            {
                "contact_id":
                    contact.id,

                "contact_name":
                    contact.name,

                **result,
            }
        )


    return results