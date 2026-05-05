from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime


# ── Request schemas ──────────────────────────────────────────────────────────

class ExtractRecipeRequest(BaseModel):
    url: str


# ── Sub-schemas ───────────────────────────────────────────────────────────────

class Ingredient(BaseModel):
    quantity: Optional[str] = None
    unit: Optional[str] = None
    item: str


class Step(BaseModel):
    step_number: int
    instruction: str


class Nutrition(BaseModel):
    calories: Optional[int] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None


class Substitution(BaseModel):
    original: str
    substitute: str
    reason: str


class RelatedRecipe(BaseModel):
    title: str
    description: str
    why_it_pairs: str


# ── Response schemas ──────────────────────────────────────────────────────────

class RecipeResponse(BaseModel):
    id: UUID
    url: str
    title: Optional[str]
    description: Optional[str]
    cuisine: Optional[str]
    difficulty: Optional[str]
    prep_time: Optional[int]
    cook_time: Optional[int]
    total_time: Optional[int]
    servings: Optional[int]
    ingredients: Optional[List[Dict[str, Any]]]
    steps: Optional[List[Dict[str, Any]]]
    tags: Optional[List[str]]
    nutrition: Optional[Dict[str, Any]]
    substitutions: Optional[List[Dict[str, Any]]]
    shopping_list: Optional[Dict[str, List[str]]]
    related_recipes: Optional[List[Dict[str, Any]]]
    created_at: datetime

    class Config:
        from_attributes = True


class RecipeListItem(BaseModel):
    id: UUID
    url: str
    title: Optional[str]
    cuisine: Optional[str]
    difficulty: Optional[str]
    total_time: Optional[int]
    servings: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True
