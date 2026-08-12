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
    "openai/gpt-oss-20b:fastest",
).strip()


HF_API_URL = (
    "https://router.huggingface.co/v1/chat/completions"
)


# ============================================================
# NORMALIZE LIST
# ============================================================

def normalize_list(
    value,
):
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

def clean_json_response(
    text,
):
    text = str(
        text or ""
    ).strip()

    if not text:
        return ""

    # Remove Markdown fences
    text = re.sub(
        r"^```(?:json)?\s*",
        "",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"\s*```$",
        "",
        text,
    )

    text = text.strip()

    # Extract first JSON object
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

def get_provider_error(
    response,
):
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

    # Hugging Face sometimes returns
    # more useful generation information.
    failed_generation = (
        data.get(
            "failed_generation"
        )
    )

    if failed_generation:
        print(
            "FAILED GENERATION:",
            failed_generation,
        )

    return message


# ============================================================
# SYSTEM PROMPT
# ============================================================

def build_system_prompt():
    return """
You are FoodKindl AI, a practical home-cooking assistant.

Your job is to create accurate and realistic recipes.

Always create the exact dish requested by the user.

Do not replace the requested dish with another dish.

Return ONLY one valid JSON object.

Do not use Markdown.
Do not use ```json.
Do not add explanations before the JSON.
Do not add explanations after the JSON.

The JSON object must contain these keys:

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
""".strip()


# ============================================================
# USER PROMPT
# ============================================================

def build_user_prompt(
    dish_name,
):
    return f"""
Create a home-cooking recipe for exactly:

{dish_name}

Return ONLY this JSON structure:

{{
  "description": "Short description of the dish",
  "prep_time": "10 minutes",
  "cook_time": "20 minutes",
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

- The dish must remain exactly "{dish_name}".
- Use realistic ingredients.
- Include quantities.
- Usually provide 6 to 12 ingredients.
- Usually provide 4 to 8 cooking steps.
- Keep each step concise.
- Give practical home-cooking instructions.
- Include one useful cooking tip.
- Include one relevant food-safety tip.
- Do not include videos.
- Do not include Markdown.
- Return only valid JSON.
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
            800,

        "stream":
            False,
    }

    # IMPORTANT:
    #
    # Do NOT send:
    #
    # response_format
    # json_schema
    # strict=True
    #
    # Some Hugging Face providers/models
    # reject generations when strict JSON
    # validation fails.

    try:
        response = requests.post(
            HF_API_URL,
            headers=headers,
            json=payload,
            timeout=120,
        )

    except requests.Timeout as error:
        raise RuntimeError(
            (
                "FoodKindl AI request "
                "timed out."
            )
        ) from error

    except requests.ConnectionError as error:
        raise RuntimeError(
            (
                "FoodKindl could not "
                "connect to Hugging Face."
            )
        ) from error

    except requests.RequestException as error:
        raise RuntimeError(
            (
                "FoodKindl AI request "
                f"failed: {str(error)}"
            )
        ) from error

    # ========================================================
    # PROVIDER ERROR
    # ========================================================

    if response.status_code >= 400:
        provider_error = (
            get_provider_error(
                response
            )
        )

        print(
            "\n======================================"
        )

        print(
            "HUGGING FACE ERROR"
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
            "BODY:",
            response.text,
        )

        print(
            "======================================\n"
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
                    "Hugging Face "
                    "authentication failed. "
                    "Check HF_TOKEN."
                )
            )

        if response.status_code == 403:
            raise RuntimeError(
                (
                    "HF_TOKEN does not have "
                    "permission to use "
                    "Inference Providers."
                )
            )

        if response.status_code == 404:
            raise RuntimeError(
                (
                    f"The model '{HF_MODEL}' "
                    "is not available through "
                    "the selected provider."
                )
            )

        if response.status_code == 429:
            raise RuntimeError(
                (
                    "Hugging Face rate limit "
                    "reached. Try again shortly."
                )
            )

        raise RuntimeError(
            (
                "Hugging Face error: "
                f"{provider_error}"
            )
        )

    # ========================================================
    # RESPONSE JSON
    # ========================================================

    try:
        provider_data = (
            response.json()
        )

    except ValueError as error:
        print(
            "INVALID HUGGING FACE RESPONSE:"
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
    # EXTRACT CONTENT
    # ========================================================

    try:
        content = (
            provider_data[
                "choices"
            ][0][
                "message"
            ][
                "content"
            ]
        )

    except (
        KeyError,
        IndexError,
        TypeError,
    ) as error:
        print(
            "UNEXPECTED HF RESPONSE:"
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

    if not content:
        raise RuntimeError(
            (
                "Hugging Face returned "
                "an empty response."
            )
        )

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
            "JSON ERROR:",
            str(error),
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

    ingredients = normalize_list(
        data.get(
            "ingredients",
            [],
        )
    )

    steps = normalize_list(
        data.get(
            "steps",
            [],
        )
    )

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

    # Ensure reasonable limits
    ingredients = (
        ingredients[:15]
    )

    steps = (
        steps[:10]
    )

    title = (
        clean_dish.title()
    )

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
                            "Dish name must "
                            "be 100 characters "
                            "or fewer."
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
                "Recipe generated successfully:",
                recipe["title"],
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