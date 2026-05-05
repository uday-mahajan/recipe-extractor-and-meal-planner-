from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://recipe_user:recipe_pass@localhost:5432/recipe_db"
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
