# 🍽️ Recipe Extractor

## 🚀 Overview

This project extracts structured recipe data from any recipe blog URL using web scraping and a Large Language Model (LLM).

It converts unstructured webpage content into clean, structured JSON and stores it in a PostgreSQL database.

---

## ✨ Features

* 🔗 Extract recipe from URL
* 🧠 LLM-powered structured data extraction
* 🥗 Nutritional estimation (calories, protein, carbs, fat)
* 🔄 Ingredient substitutions
* 🛒 Auto-generated shopping list (grouped by category)
* 🍽️ Related recipe suggestions
* 📜 Recent history of extracted recipes
* 💾 PostgreSQL database storage

---

## 🛠️ Tech Stack

* **Backend:** FastAPI
* **Frontend:** React
* **Database:** PostgreSQL
* **LLM:** Gemini API
* **Scraping:** BeautifulSoup
* **Containerization:** Docker

---

## 📦 Project Structure

```
recipe-app/
│
├── backend/
│   ├── routers/
│   ├── services/
│   ├── models/
│   ├── schemas/
│   └── main.py
│
├── frontend/
│
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/uday-mahajan/recipe-extractor-and-meal-planner-.git
cd recipe-app
```

---

### 2. Create `.env` file (IMPORTANT)

```
GEMINI_API_KEY=your_api_key_here
```

---

### 3. Run using Docker

```bash
docker-compose up
```

---

## 🔗 API Endpoints

### Extract Recipe

```http
POST /api/recipes/extract
```

**Request Body:**

```json
{
  "url": "https://example.com/recipe"
}
```

---

### Get All Recipes

```http
GET /api/recipes
```

---

### Get Recipe by ID

```http
GET /api/recipes/{id}
```

---

## 🧠 Key Highlights

* Robust scraping with fallback strategies (handles blocked sites)
* JSON-LD parsing for accurate extraction
* LLM output normalization to ensure valid schema
* Automatic retry handling for LLM failures
* Secure API key handling using `.env`

---

## 🔐 Security Note

Sensitive data such as API keys are stored in environment variables and excluded using `.gitignore`.

---

## 📸 Demo 

<img width="1275" height="622" alt="Screenshot 2026-05-05 175513" src="https://github.com/user-attachments/assets/0ab04eda-6fd6-4ed2-9130-8b57bff1bd65" />


<img width="922" height="775" alt="Screenshot 2026-05-05 175444" src="https://github.com/user-attachments/assets/2f922409-df7c-4508-a843-2576dbb88bf2" />


<img width="1056" height="822" alt="Screenshot 2026-05-05 175332" src="https://github.com/user-attachments/assets/191257d2-939f-45e2-ba46-b7bb810f6def" />


<img width="1608" height="957" alt="Screenshot 2026-05-05 175108" src="https://github.com/user-attachments/assets/29469422-0159-478c-aef7-00910850ecfd" />



---

## 👨‍💻 Author

Uday Mahajan
