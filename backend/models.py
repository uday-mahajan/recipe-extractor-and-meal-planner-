import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from database import Base


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url = Column(Text, unique=True, nullable=False, index=True)

    # Core recipe fields
    title = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    cuisine = Column(String(200), nullable=True)
    difficulty = Column(String(50), nullable=True)

    # Time fields (in minutes)
    prep_time = Column(Integer, nullable=True)
    cook_time = Column(Integer, nullable=True)
    total_time = Column(Integer, nullable=True)
    servings = Column(Integer, nullable=True)

    # Structured data stored as JSONB
    # ingredients: [{quantity, unit, item}]
    ingredients = Column(JSON, nullable=True)

    # steps: [{step_number, instruction}]
    steps = Column(JSON, nullable=True)

    # tags: [str]
    tags = Column(JSON, nullable=True)

    # nutrition: {calories, protein_g, carbs_g, fat_g}
    nutrition = Column(JSON, nullable=True)

    # substitutions: [{original, substitute, reason}]
    substitutions = Column(JSON, nullable=True)

    # shopping_list: {category: [items]}
    shopping_list = Column(JSON, nullable=True)

    # related_recipes: [{title, description, why_it_pairs}]
    related_recipes = Column(JSON, nullable=True)

    # Raw scraped text — kept for re-processing
    raw_text = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
