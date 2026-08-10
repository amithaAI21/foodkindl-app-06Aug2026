import json
import os
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

def normalize_list(value):
    if not isinstance(value, list):
        return []

    return [
        str(item).strip()
        for item in value
        if str(item).strip()
    ]


# ============================================================
# PROVIDER ERROR
# ============================================================

def get_provider_error(response):
    try:
        data = response.json()

        error_value = (
            data.get("error")
            or data.get("message")
            or data.get("detail")
            or response.text
        )

        if isinstance(
            error_value,
            dict,
        ):
            return (
                error_value.get("message")
                or str(error_value)
            )

        return str(error_value)

    except Exception:
        return (
            response.text
            or "Unknown Hugging Face error."
        )


# ============================================================
# HUGGING FACE REQUEST
# ============================================================

def generate_ai_recipe_json(
    dish_name,
):
    if not HF_TOKEN:
        raise RuntimeError(
            "HF_TOKEN is not configured."
        )

    system_prompt = """
You are FoodKindl AI.

You are an expert home-cooking assistant.

Create accurate, practical and concise recipes.

Always create the exact dish requested by the user.

Never replace the requested dish with another dish.

Follow the provided JSON schema exactly.

Do not return Markdown.

Do not return commentary outside the JSON object.
"""

    user_prompt = f"""
Create a recipe for exactly this dish:

"{dish_name}"

Important requirements:

- The recipe must remain "{dish_name}".
- Use realistic ingredients.
- Include realistic quantities.
- Include 6 to 10 ingredients when appropriate.
- Include 4 to 7 clear cooking steps.
- Keep each step concise.
- Include one useful cooking tip.
- Include one relevant food-safety tip.
- Do not include video content.
"""

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
                    system_prompt,
            },
            {
                "role":
                    "user",

                "content":
                    user_prompt,
            },
        ],

        "temperature":
            0.2,

        "max_tokens":
            600,

        "stream":
            False,

        "response_format": {
            "type":
                "json_schema",

            "json_schema": {
                "name":
                    "foodkindl_recipe",

                "strict":
                    True,

                "schema": {
                    "type":
                        "object",

                    "properties": {
                        "description": {
                            "type":
                                "string",
                        },

                        "prep_time": {
                            "type":
                                "string",
                        },

                        "cook_time": {
                            "type":
                                "string",
                        },

                        "servings": {
                            "type":
                                "string",
                        },

                        "ingredients": {
                            "type":
                                "array",

                            "items": {
                                "type":
                                    "string",
                            },
                        },

                        "steps": {
                            "type":
                                "array",

                            "items": {
                                "type":
                                    "string",
                            },
                        },

                        "tips": {
                            "type":
                                "string",
                        },

                        "food_safety": {
                            "type":
                                "string",
                        },
                    },

                    "required": [
                        "description",
                        "prep_time",
                        "cook_time",
                        "servings",
                        "ingredients",
                        "steps",
                        "tips",
                        "food_safety",
                    ],

                    "additionalProperties":
                        False,
                },
            },
        },
    }


    # --------------------------------------------------------
    # SEND REQUEST
    # --------------------------------------------------------

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


    # --------------------------------------------------------
    # PROVIDER ERROR
    # --------------------------------------------------------

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


    # --------------------------------------------------------
    # RESPONSE JSON
    # --------------------------------------------------------

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


    # --------------------------------------------------------
    # EXTRACT CONTENT
    # --------------------------------------------------------

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


    # --------------------------------------------------------
    # PARSE STRUCTURED JSON
    # --------------------------------------------------------

    try:
        recipe_data = json.loads(
            content
        )

    except json.JSONDecodeError as error:

        print(
            "INVALID STRUCTURED JSON:"
        )

        print(
            content
        )

        raise RuntimeError(
            (
                "The AI returned an "
                "invalid recipe format."
            )
        ) from error


    return recipe_data


# ============================================================
# GENERATE RECIPE
# ============================================================

def generate_recipe(
    dish_name,
):
    clean_dish = str(
        dish_name
    ).strip()

    data = generate_ai_recipe_json(
        clean_dish
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


    # Always keep exact user-requested dish
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


        # ----------------------------------------------------
        # VALIDATE
        # ----------------------------------------------------

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


        # ----------------------------------------------------
        # GENERATE
        # ----------------------------------------------------

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
                    status
                    .HTTP_200_OK
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