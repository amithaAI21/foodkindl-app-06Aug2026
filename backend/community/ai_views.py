import json
import os
import re
import traceback

import requests

from rest_framework import (
    permissions,
    status,
)

from rest_framework.response import Response
from rest_framework.views import APIView


# ============================================================
# CONFIGURATION
# ============================================================

HF_TOKEN = os.environ.get(
    "HF_TOKEN",
    "",
).strip()


HF_MODEL = os.environ.get(
    "FOODKINDL_AI_MODEL",
    "openai/gpt-oss-20b",
).strip()


HF_API_URL = (
    "https://router.huggingface.co/v1/chat/completions"
)


# ============================================================
# NORMALIZE LIST
# ============================================================

def normalize_list(value):

    if not isinstance(
        value,
        list,
    ):
        return []

    return [
        str(item).strip()
        for item in value
        if str(item).strip()
    ]


# ============================================================
# CLEAN AI JSON
# ============================================================

def clean_json_response(text):

    text = str(
        text or ""
    ).strip()

    if not text:
        return ""

    # Remove opening Markdown fence
    text = re.sub(
        r"^```(?:json)?\s*",
        "",
        text,
        flags=re.IGNORECASE,
    )

    # Remove closing Markdown fence
    text = re.sub(
        r"\s*```$",
        "",
        text,
    )

    text = text.strip()

    # Extract JSON object
    start = text.find("{")
    end = text.rfind("}")

    if (
        start != -1
        and end != -1
        and end > start
    ):
        text = text[
            start:end + 1
        ]

    return text.strip()


# ============================================================
# PROVIDER ERROR
# ============================================================

def get_provider_error(response):

    try:
        data = response.json()

    except ValueError:
        return (
            response.text
            or
            "Unknown Hugging Face error."
        )

    error_value = (
        data.get("error")
        or data.get("message")
        or data.get("detail")
    )

    if isinstance(
        error_value,
        dict,
    ):

        message = (
            error_value.get(
                "message"
            )
            or str(error_value)
        )

    else:

        message = str(
            error_value
            or response.text
            or "Unknown Hugging Face error."
        )

    failed_generation = (
        data.get(
            "failed_generation"
        )
    )

    if failed_generation:

        print(
            "\nFAILED GENERATION:"
        )

        print(
            failed_generation
        )

    return message


# ============================================================
# SYSTEM PROMPT
# ============================================================

def build_system_prompt():

    return """
You are FoodKindl AI, a practical home-cooking assistant.

Create accurate, realistic and practical home-cooking recipes.

Always create the exact dish requested by the user.

Do not replace the requested dish with another dish.

Return only one valid JSON object.

Do not use Markdown.

Do not add explanations before or after the JSON.

The JSON must contain exactly these keys:

description
prep_time
cook_time
servings
ingredients
steps
tips
food_safety

ingredients must be a JSON array of strings.

steps must be a JSON array of strings.

All other values must be strings.

Use double quotes for all JSON keys and string values.

Do not use trailing commas.

Make sure the JSON is complete before finishing.
""".strip()


# ============================================================
# USER PROMPT
# ============================================================

def build_user_prompt(
    dish_name,
):

    return f"""
Create a realistic home-cooking recipe for exactly:

{dish_name}

Return only this JSON structure:

{{
  "description": "Short description of the dish",
  "prep_time": "15 minutes",
  "cook_time": "30 minutes",
  "servings": "4",
  "ingredients": [
    "Ingredient with quantity"
  ],
  "steps": [
    "Cooking instruction"
  ],
  "tips": "One useful cooking tip",
  "food_safety": "One relevant food safety tip"
}}

Requirements:

- Keep the dish exactly "{dish_name}".
- Use ingredients appropriate for the requested cuisine or regional style.
- Include realistic quantities.
- Provide 6 to 15 ingredients.
- Provide 4 to 10 concise cooking steps.
- Keep the instructions practical for home cooking.
- Include one useful cooking tip.
- Include one relevant food-safety tip.
- Return valid JSON only.
""".strip()


# ============================================================
# CALL HUGGING FACE
# ============================================================

def generate_ai_text(
    dish_name,
):

    if not HF_TOKEN:

        raise RuntimeError(
            "HF_TOKEN is not configured."
        )

    headers = {
        "Authorization":
            f"Bearer {HF_TOKEN}",

        "Content-Type":
            "application/json",
    }

    payload = {
        "model":
            HF_MODEL,

        "messages": [
            {
                "role":
                    "system",

                "content":
                    build_system_prompt(),
            },
            {
                "role":
                    "user",

                "content":
                    build_user_prompt(
                        dish_name
                    ),
            },
        ],

        "temperature":
            0.2,

        "max_tokens":
            2000,

        "stream":
            False,
    }


    # ========================================================
    # SEND REQUEST
    # ========================================================

    try:

        response = requests.post(
            HF_API_URL,
            headers=headers,
            json=payload,
            timeout=120,
        )

    except requests.Timeout as error:

        raise RuntimeError(
            "FoodKindl AI request timed out."
        ) from error

    except requests.ConnectionError as error:

        raise RuntimeError(
            (
                "FoodKindl could not connect "
                "to Hugging Face."
            )
        ) from error

    except requests.RequestException as error:

        raise RuntimeError(
            (
                "FoodKindl AI request failed: "
                f"{str(error)}"
            )
        ) from error


    # ========================================================
    # STATUS DEBUG
    # ========================================================

    print(
        "\n======================================"
    )

    print(
        "HUGGING FACE RESPONSE"
    )

    print(
        "STATUS:",
        response.status_code,
    )

    print(
        "MODEL:",
        HF_MODEL,
    )

    print(
        "======================================"
    )


    # ========================================================
    # PROVIDER ERRORS
    # ========================================================

    if response.status_code >= 400:

        print(
            "\nHUGGING FACE ERROR BODY:"
        )

        print(
            response.text
        )

        provider_error = (
            get_provider_error(
                response
            )
        )

        if response.status_code == 400:

            raise RuntimeError(
                (
                    "Hugging Face rejected "
                    "the request: "
                    f"{provider_error}"
                )
            )

        if response.status_code == 401:

            raise RuntimeError(
                (
                    "Hugging Face authentication "
                    "failed. Check HF_TOKEN."
                )
            )

        if response.status_code == 403:

            raise RuntimeError(
                (
                    "HF_TOKEN does not have permission "
                    "to use Inference Providers."
                )
            )

        if response.status_code == 404:

            raise RuntimeError(
                (
                    f"The model '{HF_MODEL}' "
                    "is not available."
                )
            )

        if response.status_code == 429:

            raise RuntimeError(
                (
                    "Hugging Face rate limit reached. "
                    "Try again shortly."
                )
            )

        raise RuntimeError(
            (
                "Hugging Face error: "
                f"{provider_error}"
            )
        )


    # ========================================================
    # PARSE PROVIDER RESPONSE
    # ========================================================

    try:

        provider_data = (
            response.json()
        )

    except ValueError as error:

        print(
            "\nINVALID HUGGING FACE RESPONSE:"
        )

        print(
            response.text
        )

        raise RuntimeError(
            (
                "Hugging Face returned "
                "an invalid response."
            )
        ) from error


    # ========================================================
    # DEBUG FULL RESPONSE
    # ========================================================

    print(
        "\nFULL HF RESPONSE:"
    )

    print(
        provider_data
    )


    # ========================================================
    # GET MESSAGE
    # ========================================================

    try:

        message = (
            provider_data[
                "choices"
            ][0][
                "message"
            ]
        )

    except (
        KeyError,
        IndexError,
        TypeError,
    ) as error:

        print(
            "\nUNEXPECTED HF RESPONSE:"
        )

        print(
            provider_data
        )

        raise RuntimeError(
            (
                "Hugging Face returned "
                "an unexpected response."
            )
        ) from error


    # ========================================================
    # GET CONTENT
    #
    # GPT-OSS providers may return final output in different
    # message fields.
    # ========================================================

    content = (
        message.get("content")
        or message.get("reasoning_content")
        or message.get("reasoning")
        or ""
    )

    content = str(
        content
    ).strip()


    # ========================================================
    # EMPTY CONTENT
    # ========================================================

    if not content:

        print(
            "\nEMPTY HF MESSAGE:"
        )

        print(
            message
        )

        print(
            "\nFULL HF RESPONSE:"
        )

        print(
            provider_data
        )

        raise RuntimeError(
            (
                "Hugging Face returned empty content. "
                "Try again or use another model."
            )
        )


    # ========================================================
    # RAW OUTPUT
    # ========================================================

    print(
        "\nRAW AI RESPONSE:"
    )

    print(
        content
    )

    return content


# ============================================================
# PARSE RECIPE JSON
# ============================================================

def parse_recipe_json(
    content,
):

    cleaned = (
        clean_json_response(
            content
        )
    )

    print(
        "\nCLEANED AI RESPONSE:"
    )

    print(
        cleaned
    )

    if not cleaned:

        raise RuntimeError(
            "AI returned an empty recipe."
        )

    try:

        data = json.loads(
            cleaned
        )

    except json.JSONDecodeError as error:

        print(
            "\nINVALID RECIPE JSON:"
        )

        print(
            cleaned
        )

        print(
            "\nJSON ERROR:"
        )

        print(
            str(error)
        )

        raise RuntimeError(
            (
                "The AI returned an invalid "
                "recipe format. Please try again."
            )
        ) from error

    if not isinstance(
        data,
        dict,
    ):

        raise RuntimeError(
            (
                "The AI returned an invalid "
                "recipe object."
            )
        )

    return data


# ============================================================
# GENERATE RECIPE
# ============================================================

def generate_recipe(
    dish_name,
):

    clean_dish = str(
        dish_name
    ).strip()

    if not clean_dish:

        raise RuntimeError(
            "Dish name is required."
        )

    raw_response = (
        generate_ai_text(
            clean_dish
        )
    )

    data = (
        parse_recipe_json(
            raw_response
        )
    )


    # ========================================================
    # INGREDIENTS
    # ========================================================

    ingredients = normalize_list(
        data.get(
            "ingredients",
            [],
        )
    )


    # ========================================================
    # STEPS
    # ========================================================

    steps = normalize_list(
        data.get(
            "steps",
            [],
        )
    )


    # ========================================================
    # VALIDATE
    # ========================================================

    if not ingredients:

        raise RuntimeError(
            (
                "AI did not generate "
                "ingredients."
            )
        )

    if not steps:

        raise RuntimeError(
            (
                "AI did not generate "
                "cooking steps."
            )
        )


    # ========================================================
    # LIMITS
    # ========================================================

    ingredients = (
        ingredients[:20]
    )

    steps = (
        steps[:12]
    )


    # ========================================================
    # TITLE
    # ========================================================

    title = (
        clean_dish.title()
    )


    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    return {
        "title":
            title,

        "description":
            str(
                data.get(
                    "description",
                    (
                        f"A FoodKindl recipe "
                        f"for {title}."
                    ),
                )
            ).strip(),

        "prep_time":
            str(
                data.get(
                    "prep_time",
                    "",
                )
            ).strip(),

        "cook_time":
            str(
                data.get(
                    "cook_time",
                    "",
                )
            ).strip(),

        "servings":
            str(
                data.get(
                    "servings",
                    "",
                )
            ).strip(),

        "ingredients":
            ingredients,

        "steps":
            steps,

        "tips":
            str(
                data.get(
                    "tips",
                    "",
                )
            ).strip(),

        "food_safety":
            str(
                data.get(
                    "food_safety",
                    "",
                )
            ).strip(),
    }


# ============================================================
# API VIEW
# ============================================================

class AIRecipeGenerateView(
    APIView
):

    permission_classes = [
        permissions.IsAuthenticated,
    ]


    def post(
        self,
        request,
    ):

        query = str(
            request.data.get(
                "query",
                "",
            )
        ).strip()


        # ====================================================
        # VALIDATE
        # ====================================================

        if not query:

            return Response(
                {
                    "detail":
                        (
                            "Please enter "
                            "a dish name."
                        )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )


        if len(query) > 100:

            return Response(
                {
                    "detail":
                        (
                            "Dish name must be "
                            "100 characters or fewer."
                        )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )


        # ====================================================
        # GENERATE
        # ====================================================

        try:

            print(
                "\n======================================"
            )

            print(
                "FOODKINDL AI REQUEST"
            )

            print(
                "Dish:",
                query,
            )

            print(
                "Model:",
                HF_MODEL,
            )

            print(
                "HF token configured:",
                bool(HF_TOKEN),
            )

            print(
                "======================================"
            )


            recipe = generate_recipe(
                query
            )


            print(
                "\nRECIPE GENERATED SUCCESSFULLY:"
            )

            print(
                recipe["title"]
            )


            return Response(
                {
                    "query":
                        query,

                    "recipe":
                        recipe,
                },
                status=(
                    status.HTTP_200_OK
                ),
            )


        # ====================================================
        # ERROR
        # ====================================================

        except Exception as error:

            traceback.print_exc()

            print(
                "\nRECIPE GENERATION ERROR:"
            )

            print(
                repr(error)
            )

            return Response(
                {
                    "detail":
                        str(error),

                    "error_type":
                        type(
                            error
                        ).__name__,
                },
                status=(
                    status
                    .HTTP_500_INTERNAL_SERVER_ERROR
                ),
            )