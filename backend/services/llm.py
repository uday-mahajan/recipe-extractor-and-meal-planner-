import json
import re
import time
import google.generativeai as genai
from config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    generation_config=genai.GenerationConfig(
        temperature=0.2,
        response_mime_type="application/json",
    ),
)


EXTRACTION_PROMPT = """You are a professional recipe data extraction assistant.
Analyze the following scraped recipe page content and return a single JSON object.

SCRAPED CONTENT:
{content}

SOURCE URL: {url}

Return a JSON object with EXACTLY these fields (use null if unknown):

{{
  "title": "",
  "description": "",
  "cuisine": "",
  "difficulty": "",
  "prep_time": null,
  "cook_time": null,
  "total_time": null,
  "servings": null,
  "tags": [],
  "ingredients": [],
  "steps": [],
  "nutrition": {{
    "calories": null,
    "protein_g": null,
    "carbs_g": null,
    "fat_g": null
  }},
  "substitutions": [],
  "shopping_list": {{}},
  "related_recipes": []
}}

Rules:
- Return ONLY valid JSON
- Times must be integers in minutes
- Always include ALL keys
"""


# ─────────────────────────────────────────────────────────────
# MAIN FUNCTION
# ─────────────────────────────────────────────────────────────
def extract_recipe_with_llm(scraped_content: str, url: str) -> dict:

    prompt = EXTRACTION_PROMPT.format(
        content=scraped_content[:6000],
        url=url,
    )

    for attempt in range(3):
        try:
            response = model.generate_content(prompt)
            raw_text = response.text.strip()

            cleaned = _clean_json(raw_text)
            data = json.loads(cleaned)

            # 🔥 FINAL PIPELINE
            data = _normalize_data(data)
            data = _fix_structure(data)

            return data

        except Exception as e:
            if attempt == 2:
                raise ValueError(f"LLM extraction failed after retries: {e}")
            time.sleep(1)


# ─────────────────────────────────────────────────────────────
# CLEAN JSON
# ─────────────────────────────────────────────────────────────
def _clean_json(text: str) -> str:
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    text = re.sub(r",\s*}", "}", text)
    text = re.sub(r",\s*]", "]", text)

    return text.strip()


# ─────────────────────────────────────────────────────────────
# NORMALIZATION
# ─────────────────────────────────────────────────────────────
def _normalize_data(data: dict) -> dict:

    def to_int(val):
        if val is None:
            return None
        if isinstance(val, int):
            return val
        if isinstance(val, str):
            nums = re.findall(r"\d+", val)
            return int(nums[0]) if nums else None
        return None

    data["prep_time"] = to_int(data.get("prep_time"))
    data["cook_time"] = to_int(data.get("cook_time"))
    data["total_time"] = to_int(data.get("total_time"))
    data["servings"] = to_int(data.get("servings"))

    difficulty = str(data.get("difficulty", "")).lower()
    if difficulty not in ["easy", "medium", "hard"]:
        data["difficulty"] = "medium"

    data["ingredients"] = data.get("ingredients") or []
    data["steps"] = data.get("steps") or []
    data["tags"] = data.get("tags") or []
    data["substitutions"] = data.get("substitutions") or []
    data["related_recipes"] = data.get("related_recipes") or []

    nutrition = data.get("nutrition") or {}
    data["nutrition"] = {
        "calories": to_int(nutrition.get("calories")),
        "protein_g": nutrition.get("protein_g"),
        "carbs_g": nutrition.get("carbs_g"),
        "fat_g": nutrition.get("fat_g"),
    }

    data["shopping_list"] = data.get("shopping_list") or {}

    return data


# ─────────────────────────────────────────────────────────────
# 🔥 STRUCTURE FIX (IMPORTANT)
# ─────────────────────────────────────────────────────────────
def _fix_structure(data: dict) -> dict:

    # ── Ingredients ───────────────────────────────────────────
    fixed_ingredients = []
    for ing in data.get("ingredients", []):
        if isinstance(ing, dict):
            fixed_ingredients.append(ing)
        else:
            fixed_ingredients.append({
                "quantity": None,
                "unit": None,
                "item": str(ing)
            })
    data["ingredients"] = fixed_ingredients

    # ── Steps ─────────────────────────────────────────────────
    fixed_steps = []
    for i, step in enumerate(data.get("steps", []), start=1):
        if isinstance(step, dict):
            fixed_steps.append(step)
        else:
            fixed_steps.append({
                "step_number": i,
                "instruction": str(step)
            })
    data["steps"] = fixed_steps

    # ── Related Recipes ───────────────────────────────────────
    fixed_related = []
    for rec in data.get("related_recipes", []):
        if isinstance(rec, dict):
            fixed_related.append(rec)
        else:
            fixed_related.append({
                "title": str(rec),
                "description": "",
                "why_it_pairs": ""
            })
    data["related_recipes"] = fixed_related

    return data