import json
import os
import re
import traceback

import torch

from rest_framework import (
    permissions,
    status,
)

from rest_framework.response import Response
from rest_framework.views import APIView

from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
)


# ============================================================
# CONFIGURATION
# ============================================================

# Smaller model = considerably faster on CPU.
MODEL_NAME = os.environ.get(
    "FOODKINDL_TEXT_MODEL",
    "Qwen/Qwen2.5-0.5B-Instruct",
)

# Keep recipe output compact so generation finishes faster.
MAX_NEW_TOKENS = int(
    os.environ.get(
        "FOODKINDL_MAX_NEW_TOKENS",
        "320",
    )
)


# ============================================================
# CPU PERFORMANCE
# ============================================================

if not torch.cuda.is_available():
    cpu_count = os.cpu_count() or 4

    torch.set_num_threads(
        max(
            1,
            min(
                cpu_count,
                8,
            ),
        )
    )

    try:
        torch.set_num_interop_threads(
            1
        )
    except RuntimeError:
        pass


# ============================================================
# MODEL CACHE
# ============================================================

_tokenizer = None
_model = None


# ============================================================
# LOAD MODEL
# ============================================================

def get_model():
    global _tokenizer
    global _model

    if (
        _tokenizer is not None
        and _model is not None
    ):
        return (
            _tokenizer,
            _model,
        )

    print(
        "================================="
    )

    print(
        "Loading FoodKindl AI model:"
    )

    print(
        MODEL_NAME
    )

    print(
        "================================="
    )


    _tokenizer = (
        AutoTokenizer
        .from_pretrained(
            MODEL_NAME,
        )
    )


    # --------------------------------------------------------
    # GPU
    # --------------------------------------------------------

    if torch.cuda.is_available():

        print(
            "GPU detected."
        )

        print(
            "Loading model on CUDA..."
        )

        _model = (
            AutoModelForCausalLM
            .from_pretrained(
                MODEL_NAME,

                torch_dtype=(
                    torch.float16
                ),

                low_cpu_mem_usage=False,
            )
        )

        _model = _model.to(
            "cuda"
        )


    # --------------------------------------------------------
    # CPU
    # --------------------------------------------------------

    else:

        print(
            "GPU not detected."
        )

        print(
            "Loading model on CPU..."
        )

        _model = (
            AutoModelForCausalLM
            .from_pretrained(
                MODEL_NAME,

                torch_dtype=(
                    torch.float32
                ),

                low_cpu_mem_usage=False,
            )
        )

        _model = _model.to(
            "cpu"
        )


    _model.eval()


    model_device = next(
        _model.parameters()
    ).device


    print(
        "FoodKindl AI model loaded."
    )

    print(
        "Model device:",
        model_device,
    )


    return (
        _tokenizer,
        _model,
    )


# ============================================================
# GENERATE MODEL RESPONSE
# ============================================================

def generate_text(
    system_prompt,
    user_prompt,
):
    tokenizer, model = (
        get_model()
    )


    device = next(
        model.parameters()
    ).device


    messages = [
        {
            "role": "system",

            "content":
                system_prompt,
        },

        {
            "role": "user",

            "content":
                user_prompt,
        },
    ]


    # --------------------------------------------------------
    # Build Qwen chat prompt
    # --------------------------------------------------------

    prompt_text = (
        tokenizer
        .apply_chat_template(
            messages,

            tokenize=False,

            add_generation_prompt=True,
        )
    )


    # --------------------------------------------------------
    # Tokenize
    # --------------------------------------------------------

    model_inputs = tokenizer(
        prompt_text,

        return_tensors="pt",

        truncation=True,

        max_length=1024,
    )


    # Make sure model and input are on the same device.
    model_inputs = {
        key:
            value.to(device)

        for key, value
        in model_inputs.items()
    }


    input_length = (
        model_inputs[
            "input_ids"
        ].shape[-1]
    )


    # --------------------------------------------------------
    # Generate
    # --------------------------------------------------------

    with torch.inference_mode():

        output = model.generate(
            **model_inputs,

            max_new_tokens=(
                MAX_NEW_TOKENS
            ),

            do_sample=False,

            num_beams=1,

            use_cache=True,

            repetition_penalty=1.04,

            pad_token_id=(
                tokenizer
                .eos_token_id
            ),

            eos_token_id=(
                tokenizer
                .eos_token_id
            ),
        )


    # Only decode newly generated text.
    generated_tokens = (
        output[0][
            input_length:
        ]
    )


    result = tokenizer.decode(
        generated_tokens,

        skip_special_tokens=True,
    )


    return result.strip()


# ============================================================
# CLEAN JSON
# ============================================================

def clean_json_response(
    text
):
    text = str(
        text or ""
    ).strip()


    if text.startswith(
        "```json"
    ):
        text = text[7:]


    elif text.startswith(
        "```"
    ):
        text = text[3:]


    if text.endswith(
        "```"
    ):
        text = text[:-3]


    text = text.strip()


    # Extract JSON if the model included
    # accidental explanatory text.
    match = re.search(
        r"\{.*\}",
        text,
        flags=re.DOTALL,
    )


    if match:
        return (
            match.group(0)
            .strip()
        )


    return text


# ============================================================
# NORMALIZE LIST
# ============================================================

def normalize_list(
    value
):
    if not isinstance(
        value,
        list,
    ):
        return []


    cleaned = []


    for item in value:

        item = str(
            item
        ).strip()


        if item:
            cleaned.append(
                item
            )


    return cleaned


# ============================================================
# GENERATE RECIPE
# ============================================================

def generate_recipe(
    dish_name
):
    clean_dish = str(
        dish_name
    ).strip()


    # --------------------------------------------------------
    # SYSTEM PROMPT
    # --------------------------------------------------------

    system_prompt = """
You are FoodKindl AI.

You are an expert home-cooking recipe assistant.

Create practical, accurate and concise recipes.

Always create the exact dish requested by the user.

Never replace the requested dish with another dish.

Return ONLY valid JSON.

Do not use Markdown.

Do not add commentary outside the JSON.
"""


    # --------------------------------------------------------
    # USER PROMPT
    # --------------------------------------------------------

    user_prompt = f"""
Create a concise recipe for exactly:

"{clean_dish}"

The recipe MUST be for "{clean_dish}".

Return only JSON in this exact format:

{{
  "description": "short 1 or 2 sentence description",
  "prep_time": "example: 10 minutes",
  "cook_time": "example: 15 minutes",
  "servings": "example: 2",
  "ingredients": [
    "ingredient with quantity"
  ],
  "steps": [
    "clear cooking instruction"
  ],
  "tips": "one short cooking tip",
  "food_safety": "one short relevant food safety tip"
}}

Rules:

- Use realistic ingredients.
- Include quantities.
- Use 6 to 10 ingredients when appropriate.
- Use 4 to 7 cooking steps.
- Keep each step short.
- Do not generate another dish.
- Do not repeat information.
- Do not include a video.
"""


    # --------------------------------------------------------
    # MODEL GENERATION
    # --------------------------------------------------------

    raw_response = generate_text(
        system_prompt,
        user_prompt,
    )


    print(
        "RAW AI RESPONSE:"
    )

    print(
        raw_response
    )


    cleaned_response = (
        clean_json_response(
            raw_response
        )
    )


    # --------------------------------------------------------
    # PARSE JSON
    # --------------------------------------------------------

    try:

        data = json.loads(
            cleaned_response
        )


    except json.JSONDecodeError as error:

        print(
            "INVALID JSON RESPONSE:"
        )

        print(
            cleaned_response
        )


        raise RuntimeError(
            (
                "The AI returned an "
                "invalid recipe format."
            )
        ) from error


    # --------------------------------------------------------
    # INGREDIENTS
    # --------------------------------------------------------

    ingredients = (
        normalize_list(
            data.get(
                "ingredients",
                [],
            )
        )
    )


    # --------------------------------------------------------
    # STEPS
    # --------------------------------------------------------

    steps = (
        normalize_list(
            data.get(
                "steps",
                [],
            )
        )
    )


    if not ingredients:

        raise RuntimeError(
            (
                "The AI did not generate "
                "a valid ingredient list."
            )
        )


    if not steps:

        raise RuntimeError(
            (
                "The AI did not generate "
                "valid cooking instructions."
            )
        )


    # --------------------------------------------------------
    # IMPORTANT
    #
    # Title comes from user search.
    #
    # Egg Bhurji can therefore NEVER
    # become Paneer Butter Masala.
    # --------------------------------------------------------

    title = (
        clean_dish
        .title()
    )


    return {

        "title":
            title,


        "description":
            str(
                data.get(
                    "description",
                    (
                        f"A FoodKindl "
                        f"recipe for "
                        f"{title}."
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
# AI RECIPE API
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

        # ----------------------------------------------------
        # GET QUERY
        # ----------------------------------------------------

        query = str(
            request.data.get(
                "query",
                "",
            )
        ).strip()


        # ----------------------------------------------------
        # VALIDATION
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
                "================================="
            )

            print(
                "Generating recipe:",
                query,
            )

            print(
                "================================="
            )


            recipe = (
                generate_recipe(
                    query
                )
            )


            print(
                "Recipe generated successfully:",
                recipe[
                    "title"
                ],
            )


            # ------------------------------------------------
            # ARTICLE ONLY
            #
            # NO VIDEO
            # NO VIDEO JOB
            # NO DIFFUSERS
            # NO CUDA REQUIREMENT
            # ------------------------------------------------

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
                "RECIPE GENERATION ERROR:",
                repr(error),
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