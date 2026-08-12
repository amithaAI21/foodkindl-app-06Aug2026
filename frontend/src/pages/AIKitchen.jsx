import {
  ArrowLeft,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import AIRecipeSearch
  from "../components/AIRecipeSearch";


export default function AIKitchen() {
  const navigate = useNavigate();

  return (
    <main className="app-page ai-kitchen-page">

      {/* BACK BUTTON */}

      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
      </div>


      {/* PAGE HEADER */}

      <section className="ai-kitchen-page-header">

        <div className="eyebrow left">
          FoodKindl AI
        </div>

        <h1>
          AI Kitchen
        </h1>

        <p>
          Discover recipes,
          ingredients, cooking
          instructions and helpful
          food tips with FoodKindl AI.
        </p>

      </section>


      {/* AI RECIPE SEARCH */}

      <AIRecipeSearch />

    </main>
  );
}