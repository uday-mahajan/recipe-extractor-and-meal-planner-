from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from database import get_db
from models import Recipe
from schemas import ExtractRecipeRequest, RecipeResponse, RecipeListItem
from services.scraper import scrape_recipe_page
from services.llm import extract_recipe_with_llm

router = APIRouter(prefix="/api/recipes", tags=["recipes"])


# 🔥 SAFETY FUNCTION (VERY IMPORTANT)
def ensure_dict_list(arr, key):
    fixed = []
    for i, item in enumerate(arr):
        if isinstance(item, dict):
            fixed.append(item)
        else:
            if key == "ingredients":
                fixed.append({
                    "quantity": None,
                    "unit": None,
                    "item": str(item)
                })
            elif key == "steps":
                fixed.append({
                    "step_number": i + 1,
                    "instruction": str(item)
                })
            elif key == "related_recipes":
                fixed.append({
                    "title": str(item),
                    "description": "",
                    "why_it_pairs": ""
                })
    return fixed


@router.post("/extract", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
def extract_recipe(payload: ExtractRecipeRequest, db: Session = Depends(get_db)):
    url = str(payload.url).strip()
    print(f"\n🔗 Incoming URL: {url}")

    # ── Check cache ─────────────────────────────
    existing = db.query(Recipe).filter(Recipe.url == url).first()
    if existing:
        print("⚡ Returning cached recipe")
        return existing

    # ── Step 1: Scrape ─────────────────────────
    try:
        print("🕷️ Starting scraping...")
        raw_text = scrape_recipe_page(url)
        print("✅ Scraping completed")

        if not raw_text or len(raw_text) < 50:
            raise ValueError("Scraped content too short")

    except Exception as e:
        print("⚠️ SCRAPER FAILED → switching to LLM-only mode:", str(e))

        raw_text = f"""
        Extract full recipe details from this URL:

        {url}

        Include ingredients, steps, cooking time, servings, and nutrition.
        """

    print(f"📄 Input text length for LLM: {len(raw_text)}")

    # ── Step 2: LLM extraction ─────────────────
    try:
        print("🤖 Sending to LLM...")
        recipe_data = extract_recipe_with_llm(raw_text, url)
        print("✅ LLM extraction successful")

    except ValueError as e:
        print("❌ LLM ERROR:", str(e))
        raise HTTPException(
            status_code=502,
            detail=f"LLM extraction failed: {e}"
        )

    # 🔥 SAFETY FIX (CRITICAL)
    recipe_data["ingredients"] = ensure_dict_list(recipe_data.get("ingredients", []), "ingredients")
    recipe_data["steps"] = ensure_dict_list(recipe_data.get("steps", []), "steps")
    recipe_data["related_recipes"] = ensure_dict_list(recipe_data.get("related_recipes", []), "related_recipes")

    # ── Step 3: Save to DB ─────────────────────
    recipe = Recipe(
        url=url,
        raw_text=raw_text[:5000],
        title=recipe_data.get("title"),
        description=recipe_data.get("description"),
        cuisine=recipe_data.get("cuisine"),
        difficulty=recipe_data.get("difficulty"),
        prep_time=recipe_data.get("prep_time"),
        cook_time=recipe_data.get("cook_time"),
        total_time=recipe_data.get("total_time"),
        servings=recipe_data.get("servings"),
        ingredients=recipe_data.get("ingredients", []),
        steps=recipe_data.get("steps", []),
        tags=recipe_data.get("tags", []),
        nutrition=recipe_data.get("nutrition"),
        substitutions=recipe_data.get("substitutions", []),
        shopping_list=recipe_data.get("shopping_list", {}),
        related_recipes=recipe_data.get("related_recipes", []),
    )

    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    print("💾 Recipe stored successfully")

    return recipe


@router.get("/", response_model=List[RecipeListItem])
def list_recipes(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(Recipe).order_by(Recipe.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(recipe_id: UUID, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(recipe_id: UUID, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.delete(recipe)
    db.commit()