import {
  ChefHat,
  Clock3,
  Search,
  Share2,
  Sparkles,
  Users,
  Utensils,
} from "lucide-react";

import { useState } from "react";

import api from "../api";


export default function AIRecipeSearch() {
  const [query, setQuery] =
    useState("");

  const [recipe, setRecipe] =
    useState(null);

  const [generating, setGenerating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  // =========================================================
  // GENERATE RECIPE
  // =========================================================

  async function generateRecipe(event) {
    event.preventDefault();

    const cleanQuery =
      query.trim();

    if (!cleanQuery) {
      setError(
        "Enter the name of a dish."
      );

      return;
    }

    setGenerating(true);

    setError("");
    setMessage("");
    setRecipe(null);

    try {
      const response =
        await api.post(
          "/ai/recipe/",
          {
            query: cleanQuery,
          },
          {
            timeout: 300000,
          }
        );

      const generatedRecipe =
        response.data?.recipe;

      if (!generatedRecipe) {
        setError(
          "FoodKindl AI did not return a recipe."
        );

        return;
      }

      setRecipe(
        generatedRecipe
      );

    } catch (requestError) {
      console.error(
        "AI recipe generation error:",
        requestError.response?.data ||
          requestError
      );

      if (
        requestError.code ===
        "ECONNABORTED"
      ) {
        setError(
          "Recipe generation is taking longer than expected. Please try again."
        );

        return;
      }

      setError(
        requestError.response?.data
          ?.detail ||
          "FoodKindl AI could not generate this recipe."
      );

    } finally {
      setGenerating(false);
    }
  }


  // =========================================================
  // EXAMPLE SEARCH
  // =========================================================

  function chooseExample(dish) {
    setQuery(dish);

    setRecipe(null);
    setError("");
    setMessage("");
  }


  // =========================================================
  // BUILD SHARE TEXT
  // =========================================================

  function buildRecipeShareText() {
    if (!recipe) {
      return "";
    }

    const ingredients =
      (recipe.ingredients || [])
        .map(
          (ingredient) =>
            `• ${ingredient}`
        )
        .join("\n");

    const steps =
      (recipe.steps || [])
        .map(
          (step, index) =>
            `${index + 1}. ${step}`
        )
        .join("\n");


    return `${recipe.title}

${recipe.description || ""}

INGREDIENTS

${ingredients}

HOW TO MAKE IT

${steps}

${
  recipe.tips
    ? `FoodKindl Tip:
${recipe.tips}

`
    : ""
}${
  recipe.food_safety
    ? `Food Safety:
${recipe.food_safety}

`
    : ""
}Generated with FoodKindl AI Kitchen`;
  }


  // =========================================================
  // SHARE
  // =========================================================

  async function shareRecipe() {
    if (!recipe) {
      return;
    }

    setMessage("");
    setError("");

    const shareText =
      buildRecipeShareText();

    try {

      // Mobile / modern browser
      if (navigator.share) {

        await navigator.share({
          title:
            `${recipe.title} | FoodKindl`,

          text:
            shareText,

          url:
            window.location.href,
        });

        return;
      }


      // Desktop fallback
      await navigator.clipboard.writeText(
        shareText
      );

      setMessage(
        "Recipe copied to clipboard."
      );

    } catch (shareError) {

      if (
        shareError?.name ===
        "AbortError"
      ) {
        return;
      }

      console.error(
        "Recipe sharing error:",
        shareError
      );

      setError(
        "Recipe could not be shared."
      );
    }
  }


  // =========================================================
  // UI
  // =========================================================

  return (
    <section className="foodkindl-ai">

      {/* AI INTRO */}

      <div className="foodkindl-ai-header">

        <div className="foodkindl-ai-heading-copy">

          <div className="foodkindl-ai-label">
            <Sparkles size={15} />

            AI Recipe Assistant
          </div>

          <h2>
            What would you like
            to cook?
          </h2>

          <p>
            Search for any dish and
            FoodKindl AI will create
            ingredients, cooking steps
            and helpful tips.
          </p>

        </div>


        <div className="foodkindl-ai-icon">
          <ChefHat size={30} />
        </div>

      </div>


      {/* SEARCH */}

      <form
        className="foodkindl-ai-search"
        onSubmit={generateRecipe}
      >

        <div className="foodkindl-ai-search-input">

          <Search size={21} />

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="What do you want to cook? Try Egg Bhurji..."
            maxLength={120}
            autoComplete="off"
          />

        </div>


        <button
          type="submit"
          className="foodkindl-ai-generate"
          disabled={generating}
        >

          <Sparkles size={18} />

          {generating
            ? "Creating..."
            : "Create Recipe"}

        </button>

      </form>


      {/* SUGGESTIONS */}

      <div className="foodkindl-ai-suggestions">

        <span>
          Try
        </span>


        <button
          type="button"
          onClick={() =>
            chooseExample(
              "Egg Bhurji"
            )
          }
        >
          Egg Bhurji
        </button>


        <button
          type="button"
          onClick={() =>
            chooseExample(
              "Kerala Fish Curry"
            )
          }
        >
          Kerala Fish Curry
        </button>


        <button
          type="button"
          onClick={() =>
            chooseExample(
              "Avial"
            )
          }
        >
          Avial
        </button>


        <button
          type="button"
          onClick={() =>
            chooseExample(
              "Paneer Butter Masala"
            )
          }
        >
          Paneer Butter Masala
        </button>

      </div>


      {/* ERROR */}

      {error && (
        <div className="foodkindl-ai-error">
          {error}
        </div>
      )}


      {/* SUCCESS */}

      {message && (
        <div className="foodkindl-ai-message">
          {message}
        </div>
      )}


      {/* LOADING */}

      {generating && (
        <div className="foodkindl-ai-loading">

          <div className="foodkindl-ai-loading-icon">
            <Sparkles size={24} />
          </div>

          <div>
            <strong>
              Preparing your recipe
            </strong>

            <span>
              Creating ingredients,
              instructions and helpful
              cooking tips.
            </span>
          </div>

        </div>
      )}


      {/* RECIPE */}

      {recipe && (
        <article className="foodkindl-recipe">

          {/* RECIPE HEADER */}

          <header className="foodkindl-recipe-header">

            <div className="foodkindl-recipe-header-content">

              <div>

                <div className="foodkindl-recipe-label">
                  <ChefHat size={17} />

                  AI Recipe
                </div>


                <h2>
                  {recipe.title}
                </h2>


                {recipe.description && (
                  <p>
                    {recipe.description}
                  </p>
                )}

              </div>


              {/* SHARE */}

              <button
                type="button"
                className="foodkindl-recipe-share"
                onClick={shareRecipe}
              >

                <Share2 size={18} />

                Share Recipe

              </button>

            </div>

          </header>


          {/* META */}

          {(
            recipe.prep_time ||
            recipe.cook_time ||
            recipe.servings
          ) && (

            <div className="foodkindl-recipe-meta">


              {recipe.prep_time && (

                <div className="foodkindl-recipe-meta-item">

                  <div className="foodkindl-recipe-meta-icon">
                    <Clock3 size={18} />
                  </div>

                  <div>

                    <small>
                      Preparation
                    </small>

                    <strong>
                      {recipe.prep_time}
                    </strong>

                  </div>

                </div>

              )}


              {recipe.cook_time && (

                <div className="foodkindl-recipe-meta-item">

                  <div className="foodkindl-recipe-meta-icon">
                    <Utensils size={18} />
                  </div>

                  <div>

                    <small>
                      Cooking
                    </small>

                    <strong>
                      {recipe.cook_time}
                    </strong>

                  </div>

                </div>

              )}


              {recipe.servings && (

                <div className="foodkindl-recipe-meta-item">

                  <div className="foodkindl-recipe-meta-icon">
                    <Users size={18} />
                  </div>

                  <div>

                    <small>
                      Servings
                    </small>

                    <strong>
                      {recipe.servings}
                    </strong>

                  </div>

                </div>

              )}

            </div>

          )}


          {/* INGREDIENTS */}

          <section className="foodkindl-recipe-section">

            <div className="foodkindl-recipe-section-heading">

              <span>
                01
              </span>

              <div>

                <h3>
                  Ingredients
                </h3>

                <p>
                  Everything you need
                  before you start cooking.
                </p>

              </div>

            </div>


            <div className="foodkindl-ingredients">

              {(recipe.ingredients || [])
                .map(
                  (
                    ingredient,
                    index
                  ) => (

                    <div
                      className="foodkindl-ingredient"
                      key={index}
                    >

                      <span className="foodkindl-ingredient-dot" />

                      <span>
                        {ingredient}
                      </span>

                    </div>

                  )
                )}

            </div>

          </section>


          {/* STEPS */}

          <section className="foodkindl-recipe-section">

            <div className="foodkindl-recipe-section-heading">

              <span>
                02
              </span>

              <div>

                <h3>
                  How to make it
                </h3>

                <p>
                  Follow the steps
                  in sequence.
                </p>

              </div>

            </div>


            <div className="foodkindl-steps">

              {(recipe.steps || [])
                .map(
                  (
                    step,
                    index
                  ) => (

                    <div
                      className="foodkindl-step"
                      key={index}
                    >

                      <div className="foodkindl-step-number">
                        {index + 1}
                      </div>

                      <p>
                        {step}
                      </p>

                    </div>

                  )
                )}

            </div>

          </section>


          {/* NOTES */}

          {(
            recipe.tips ||
            recipe.food_safety
          ) && (

            <div className="foodkindl-recipe-notes">


              {recipe.tips && (

                <div className="foodkindl-recipe-note foodkindl-tip">

                  <Sparkles size={20} />

                  <div>

                    <strong>
                      FoodKindl Tip
                    </strong>

                    <p>
                      {recipe.tips}
                    </p>

                  </div>

                </div>

              )}


              {recipe.food_safety && (

                <div className="foodkindl-recipe-note foodkindl-safety">

                  <ChefHat size={20} />

                  <div>

                    <strong>
                      Food Safety
                    </strong>

                    <p>
                      {recipe.food_safety}
                    </p>

                  </div>

                </div>

              )}

            </div>

          )}

        </article>
      )}

    </section>
  );
}