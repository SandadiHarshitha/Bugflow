import json
import re

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import get_current_user
from app.models import User


router = APIRouter(prefix="/ai", tags=["AI Intelligence"])


class SimilarIssueItem(BaseModel):
    id: int
    title: str
    description: str = ""


class SimilarIssuesRequest(BaseModel):
    title: str
    description: str
    issues: list[SimilarIssueItem] = []


class ResolutionRequest(BaseModel):
    title: str
    description: str
    category: str = "Other"
    module: str = "Unknown"
    defect_type: str = "Other"
    severity: str = "Medium"
    priority: str = "Medium"


def _extract_json(text: str):
    text = (text or "").strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, flags=re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


async def _gemini_json(prompt: str, api_key: str):
    url = (
        "https://generativelanguage.googleapis.com/"
        "v1beta/models/gemini-2.0-flash:generateContent"
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 1200,
            "responseMimeType": "application/json",
        },
    }

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key,
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        response = await client.post(
            url,
            headers=headers,
            json=payload,
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini API error: {response.text[:500]}",
        )

    result = response.json()

    try:
        text = result["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        raise HTTPException(
            status_code=500,
            detail="Gemini returned an unexpected response.",
        )

    try:
        return _extract_json(text)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Gemini returned invalid JSON.",
        )


@router.post("/similar-issues")
async def find_similar_issues(
    data: SimilarIssuesRequest,
    current_user: User = Depends(get_current_user),
):
    from app.main import GEMINI_API_KEY

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured.",
        )

    candidates = [
        {
            "id": item.id,
            "title": item.title,
            "description": item.description,
        }
        for item in data.issues[:30]
    ]

    if not candidates:
        return {"matches": []}

    prompt = f"""
You are a software defect similarity analyzer.

Compare the NEW DEFECT with the EXISTING DEFECTS.
Use semantic meaning, not just matching words.
Two defects are similar when they describe the same underlying
problem, user action, component, failure behavior, or root-cause area.

NEW DEFECT:
Title: {data.title}
Description: {data.description}

EXISTING DEFECTS:
{json.dumps(candidates, ensure_ascii=False)}

Return ONLY valid JSON with this exact structure:
{{
  "matches": [
    {{
      "issue_id": 123,
      "similarity": 0.82,
      "reason": "Both describe the same payment submission failure."
    }}
  ]
}}

Rules:
- similarity must be between 0 and 1.
- Return at most 5 matches.
- Return only matches with similarity >= 0.55.
- Sort from highest similarity to lowest.
- Do not invent issue IDs.
- If there are no meaningful matches, return an empty matches array.
"""

    result = await _gemini_json(prompt, GEMINI_API_KEY)
    allowed_ids = {item.id for item in candidates}
    matches = []

    for match in result.get("matches", []):
        try:
            issue_id = int(match.get("issue_id"))
            similarity = float(match.get("similarity", 0))
        except (TypeError, ValueError):
            continue

        if issue_id not in allowed_ids or similarity < 0.55:
            continue

        issue = next(
            item for item in candidates if item["id"] == issue_id
        )

        matches.append(
            {
                "issue_id": issue_id,
                "title": issue["title"],
                "description": issue["description"],
                "similarity": round(min(similarity, 1.0), 2),
                "reason": str(match.get("reason", "Similar defect detected.")),
            }
        )

    matches.sort(key=lambda item: item["similarity"], reverse=True)

    return {"matches": matches[:5]}


@router.post("/resolution-assistance")
async def resolution_assistance(
    data: ResolutionRequest,
    current_user: User = Depends(get_current_user),
):
    from app.main import GEMINI_API_KEY

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured.",
        )

    prompt = f"""
You are a senior software debugging assistant helping a defect-tracking team.

Analyze this defect and provide practical resolution assistance.
Do not pretend to know information that is not supplied.
Clearly label suggestions as suggestions.

Title: {data.title}
Description: {data.description}
Category: {data.category}
Module: {data.module}
Defect Type: {data.defect_type}
Severity: {data.severity}
Priority: {data.priority}

Return ONLY valid JSON:
{{
  "summary": "short explanation of the likely problem",
  "possible_causes": ["cause 1", "cause 2"],
  "investigation_steps": ["step 1", "step 2", "step 3"],
  "suggested_resolution": ["action 1", "action 2"],
  "verification_steps": ["test 1", "test 2"],
  "risk_level": "Low|Medium|High"
}}

Rules:
- Keep each item concise.
- Give 2-4 possible causes.
- Give 3-6 investigation steps.
- Give 2-5 suggested resolution actions.
- Give 2-4 verification steps.
- Do not invent logs, stack traces, versions, or database details.
"""

    result = await _gemini_json(prompt, GEMINI_API_KEY)

    return {
        "summary": str(result.get("summary", "No summary available.")),
        "possible_causes": result.get("possible_causes", []),
        "investigation_steps": result.get("investigation_steps", []),
        "suggested_resolution": result.get("suggested_resolution", []),
        "verification_steps": result.get("verification_steps", []),
        "risk_level": str(result.get("risk_level", "Medium")),
    }