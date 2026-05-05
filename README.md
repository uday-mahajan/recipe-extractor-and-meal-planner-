# RecipeAI — Full Stack Recipe Extractor

## Stack
- **Frontend**: React 18 + Vite + Lucide icons
- **Backend**: FastAPI + SQLAlchemy
- **Scraping**: BeautifulSoup4 (HTML only)
- **LLM**: Anthropic Claude (claude-sonnet-4)
- **Database**: PostgreSQL 15
- **Infra**: Docker Compose

---

## Quickstart

### 1. Clone & configure
```bash
git clone <repo>
cd recipe-app
cp .env.example .env
# Edit .env and paste your Anthropic API key
```

### 2. Start everything
```bash
docker-compose up --build
```

| Service  | URL                         |
|----------|-----------------------------|
| Frontend | http://localhost:5173       |
| Backend  | http://localhost:8000       |
| API docs | http://localhost:8000/docs  |
| DB       | localhost:5432              |

---

## API Endpoints

### Tab 1 — Recipe Extraction

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recipes/extract` | Scrape URL + extract via LLM |
| GET  | `/api/recipes/` | List all saved recipes |
| GET  | `/api/recipes/{id}` | Get single recipe |
| DELETE | `/api/recipes/{id}` | Delete recipe |

**POST `/api/recipes/extract`**
```json
{ "url": "https://www.allrecipes.com/recipe/23891/grilled-cheese-sandwich/" }
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Classic Grilled Cheese",
  "cuisine": "American",
  "difficulty": "easy",
  "prep_time": 5,
  "cook_time": 10,
  "total_time": 15,
  "servings": 2,
  "ingredients": [
    { "quantity": "4", "unit": "slices", "item": "white bread" },
    { "quantity": "2", "unit": "tbsp", "item": "butter" }
  ],
  "steps": [
    { "step_number": 1, "instruction": "Spread butter on one side of each bread slice." }
  ],
  "nutrition": { "calories": 380, "protein_g": 14, "carbs_g": 32, "fat_g": 22 },
  "substitutions": [...],
  "shopping_list": { "dairy": ["butter", "cheddar"], "bakery": ["white bread"] },
  "related_recipes": [...]
}
```

---

## Project Structure

```
recipe-app/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── main.py           # FastAPI app
│   ├── config.py         # Settings (env vars)
│   ├── database.py       # SQLAlchemy session
│   ├── models.py         # Recipe DB model
│   ├── schemas.py        # Pydantic schemas
│   ├── routers/
│   │   └── recipes.py    # /api/recipes/*
│   ├── services/
│   │   ├── scraper.py    # BeautifulSoup HTML scraper
│   │   └── llm.py        # Claude API calls
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/client.js
        └── components/
            ├── RecipeExtractor.jsx
            └── RecipeCard.jsx
```

---

## How It Works

```
User pastes URL
      │
      ▼
RecipeExtractor.jsx  →  POST /api/recipes/extract
      │
      ▼
scraper.py (BeautifulSoup)
  1. requests.get(url)
  2. Try JSON-LD schema.org/Recipe
  3. Try recipe-card CSS selectors
  4. Fallback to body text
      │
      ▼
llm.py (Claude Sonnet)
  - Structured extraction prompt
  - Returns JSON with title, ingredients,
    steps, nutrition, substitutions,
    shopping_list, related_recipes
      │
      ▼
PostgreSQL  →  Response  →  RecipeCard.jsx
```
