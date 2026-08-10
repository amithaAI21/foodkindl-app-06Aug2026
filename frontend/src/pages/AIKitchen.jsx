import AIRecipeSearch
  from "../components/AIRecipeSearch";


export default function AIKitchen() {
  return (
    <main className="app-page ai-kitchen-page">

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


      <AIRecipeSearch />

    </main>
  );
}