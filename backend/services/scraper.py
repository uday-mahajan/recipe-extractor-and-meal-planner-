import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup
import json
import re
from typing import Optional
import cloudscraper


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


# ─────────────────────────────────────────────────────────────
# Session (fallback)
# ─────────────────────────────────────────────────────────────
def _create_session():
    session = requests.Session()

    retries = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[403, 429, 500, 502, 503, 504],
    )

    adapter = HTTPAdapter(max_retries=retries)
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    session.headers.update(HEADERS)
    return session


# ─────────────────────────────────────────────────────────────
# Fetch page (ANTI-BOT FIX)
# ─────────────────────────────────────────────────────────────
def _fetch_page(url: str) -> str:

    # 1️⃣ Try cloudscraper
    try:
        scraper = cloudscraper.create_scraper()
        res = scraper.get(url, timeout=15)
        res.raise_for_status()

        # 🔥 detect block page
        if "Access Denied" in res.text or "403" in res.text:
            raise Exception("Blocked by site")

        return res.text

    except Exception:
        print("⚠️ Direct fetch blocked, trying fallback...")

    # 2️⃣ FINAL FIX → TEXTISE (bypass Cloudflare completely)
    try:
        proxy_url = f"https://textise.net/showtext.aspx?strURL={url}"
        res = requests.get(proxy_url, timeout=15)
        res.raise_for_status()

        print("✅ Fetched via textise proxy")
        return res.text

    except Exception as e:
        raise ValueError(f"Failed to fetch URL: {e}")

# ─────────────────────────────────────────────────────────────
# MAIN SCRAPER
# ─────────────────────────────────────────────────────────────
def scrape_recipe_page(url: str) -> str:
    try:
        html = _fetch_page(url)
    except Exception as e:
        raise ValueError(f"Failed to fetch URL: {e}")

    soup = BeautifulSoup(html, "lxml")

    # ── Remove noise ──────────────────────────────────────────
    for tag in soup(["script", "style", "nav", "footer", "header",
                     "aside", "iframe", "noscript", "form"]):
        tag.decompose()

    # ── 1. Try JSON-LD ────────────────────────────────────────
    json_ld_text = _extract_json_ld(soup)

    if json_ld_text:
        print("✅ JSON-LD FOUND")

        # 🔥 IMPORTANT: validate it's meaningful
        if len(json_ld_text.strip()) > 150:
            print("✅ JSON-LD is strong → using it")
            return json_ld_text
        else:
            print("⚠️ JSON-LD too weak → ignoring")

    else:
        print("⚠️ JSON-LD NOT FOUND")

    # ── 2. FORCE fallback (critical for Allrecipes) ───────────
    print("🔄 Trying recipe-card extraction...")

    card_text = _extract_recipe_card(soup)

    if card_text and len(card_text) > 150:
        print(f"✅ Recipe card extracted ({len(card_text)} chars)")
        return card_text

    # ── 3. FINAL fallback ─────────────────────────────────────
    print("🔄 Using body fallback...")

    body_text = _extract_body_text(soup)

    if not body_text or len(body_text) < 50:
        raise ValueError("Could not extract meaningful content from the URL.")

    print(f"📄 Body extracted ({len(body_text)} chars)")
    return body_text


# ─────────────────────────────────────────────────────────────
# JSON-LD EXTRACTION
# ─────────────────────────────────────────────────────────────
def _extract_json_ld(soup: BeautifulSoup) -> Optional[str]:
    scripts = soup.find_all("script", type="application/ld+json")

    for script in scripts:
        try:
            content = script.string
            if not content:
                continue

            data = json.loads(content)

            # Normalize everything into list
            items = []
            if isinstance(data, dict):
                items.append(data)
            elif isinstance(data, list):
                items.extend(data)

            for item in items:

                # Handle @graph (very common in Allrecipes)
                if isinstance(item, dict) and "@graph" in item:
                    for sub in item["@graph"]:
                        if _is_recipe_schema(sub):
                            return _format_recipe_text(sub)

                # Direct recipe object
                if _is_recipe_schema(item):
                    return _format_recipe_text(item)

        except Exception:
            continue

    return None


def _is_recipe_schema(obj: dict) -> bool:
    if not isinstance(obj, dict):
        return False

    schema_type = obj.get("@type", "")
    if isinstance(schema_type, list):
        return "Recipe" in schema_type

    return schema_type == "Recipe"


# ─────────────────────────────────────────────────────────────
# FORMAT CLEAN TEXT FOR LLM
# ─────────────────────────────────────────────────────────────
def _format_recipe_text(data: dict) -> str:
    title = data.get("name", "")
    description = data.get("description", "")

    ingredients = data.get("recipeIngredient", [])

    instructions = data.get("recipeInstructions", [])
    if isinstance(instructions, list):
        instructions = [
            step.get("text", "") if isinstance(step, dict) else str(step)
            for step in instructions
        ]

    prep_time = data.get("prepTime", "")
    cook_time = data.get("cookTime", "")
    total_time = data.get("totalTime", "")
    servings = data.get("recipeYield", "")

    return f"""
Title: {title}

Description:
{description}

Prep Time: {prep_time}
Cook Time: {cook_time}
Total Time: {total_time}
Servings: {servings}

Ingredients:
{chr(10).join(ingredients)}

Instructions:
{chr(10).join(instructions)}
"""


# ─────────────────────────────────────────────────────────────
# RECIPE CARD FALLBACK
# ─────────────────────────────────────────────────────────────
def _extract_recipe_card(soup: BeautifulSoup) -> str:
    selectors = [
        ".recipe", ".recipe-card", ".recipe-content", ".recipe-container",
        ".recipe-body", ".recipe-details", ".recipe-block",
        ".recipe-summary", ".recipe-ingredients", ".recipe-directions",
        ".o-RecipeInfo", ".o-Ingredients", ".o-Method",
        ".recipe__ingredients", ".recipe__instructions",
        "[data-recipe]", ".recipe-information",
        ".wprm-recipe", ".tasty-recipe", ".mv-recipe",
    ]

    collected = []

    for selector in selectors:
        elements = soup.select(selector)
        for el in elements:
            text = el.get_text(separator="\n", strip=True)
            if text and len(text) > 100:
                collected.append(text)

    if collected:
        return "\n\n".join(collected)

    return _extract_by_headings(soup)


# ─────────────────────────────────────────────────────────────
# HEADING FALLBACK
# ─────────────────────────────────────────────────────────────
def _extract_by_headings(soup: BeautifulSoup) -> str:
    keywords = re.compile(
        r"ingredient|instruction|direction|step|method|preparation|how to",
        re.IGNORECASE
    )

    collected = []

    title_tag = soup.find("h1")
    if title_tag:
        collected.append(f"Title: {title_tag.get_text(strip=True)}")

    for heading in soup.find_all(["h1", "h2", "h3", "h4"]):
        text = heading.get_text(strip=True)

        if keywords.search(text) or len(collected) == 0:
            section = [text]

            for sibling in heading.find_next_siblings():
                if sibling.name in ["h1", "h2", "h3", "h4"]:
                    break

                s_text = sibling.get_text(separator="\n", strip=True)
                if s_text:
                    section.append(s_text)

            collected.append("\n".join(section))

    return "\n\n".join(collected)


# ─────────────────────────────────────────────────────────────
# FINAL FALLBACK
# ─────────────────────────────────────────────────────────────
def _extract_body_text(soup: BeautifulSoup) -> str:
    body = soup.find("body") or soup
    text = body.get_text(separator="\n", strip=True)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text[:8000]