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
class RiskRadarRequest(BaseModel):
    title: str
    description: str
    severity: str = "Medium"
    priority: str = "Medium"
    status: str = "Open"
    issue_age_days: int = 0
    reopened_count: int = 0
    assigned: bool = True
    role: str = "Manager"


class FixImpactRequest(BaseModel):
    title: str
    description: str
    module: str = "Unknown"
    category: str = "Other"
    severity: str = "Medium"
    priority: str = "Medium"
    fix_description: str = ""
class HistoricalIssueItem(BaseModel):
    id: int
    title: str
    description: str = ""
    category: str = "Other"
    module: str = "Unknown"
    severity: str = "Medium"
    priority: str = "Medium"
    status: str = "Open"


class HistoricalResolutionRequest(BaseModel):
    title: str
    description: str
    category: str = "Other"
    module: str = "Unknown"
    severity: str = "Medium"
    priority: str = "Medium"
    historical_issues: list[HistoricalIssueItem] = []


class EvidenceExplorerRequest(BaseModel):
    question: str
    current_issue: str = ""
    evidence: list[str] = []


class InvestigationRequest(BaseModel):
    title: str
    description: str
    category: str = "Other"
    module: str = "Unknown"
    severity: str = "Medium"
    priority: str = "Medium"
    historical_context: list[str] = []

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
        "v1beta/models/gemini-3.5-flash-lite:generateContent"
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
@router.post("/risk-radar")
async def defect_risk_radar(
    data: RiskRadarRequest,
    current_user: User = Depends(get_current_user),
):
    from app.main import GEMINI_API_KEY

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured.",
        )
    role_focus_instructions = {
        "Reporter": "Focus on the risk to the reported issue, user impact, and whether the issue needs attention or escalation.",
        "Developer": "Focus on engineering risk, technical impact, implementation complexity, and regression risk.",
        "Tester": "Focus on quality and verification risk, reproducibility, test coverage, and retesting needs.",
        "Manager": "Focus on project and team risk, priority, delivery impact, assignment, and unresolved work.",
        "Admin": "Focus on overall project risk, critical issues, system health, and cross-team impact.",
    }

    role_focus = role_focus_instructions.get(
        data.role,
        "Focus on the issue according to the user's responsibilities."
    )

    prompt = f"""
You are an AI defect risk analyst for a software issue tracking system.

Analyze the following defect and calculate its project risk.

DEFECT:
Title: {data.title}
Description: {data.description}
Severity: {data.severity}
Priority: {data.priority}
Status: {data.status}
Issue Age: {data.issue_age_days} days
Reopened Count: {data.reopened_count}
Assigned: {data.assigned}
User Role: {data.role}

ROLE-SPECIFIC FOCUS:
{role_focus}

The risk analysis MUST reflect the user's role.
Do not give the same perspective for every role.

Consider:
- Severity
- Priority
- How long the issue has remained open
- Reopened count
- Assignment status
- Current status

Return ONLY valid JSON:

{{
  "risk_level": "Low|Medium|High",
  "risk_score": 0,
  "risk_factors": [
    "factor 1",
    "factor 2",
    "factor 3"
  ],
  "recommendation": "short recommended action",
  "role_focus": "what the current user should focus on"
}}

Rules:
- risk_score must be between 0 and 100.
- High risk should generally be 70-100.
- Medium risk should generally be 40-69.
- Low risk should generally be 0-39.
- Give 2-5 risk factors.
- Keep recommendations concise.
- Do not invent information.
"""

    result = await _gemini_json(prompt, GEMINI_API_KEY)

    try:
        risk_score = int(result.get("risk_score", 50))
    except (TypeError, ValueError):
        risk_score = 50

    risk_score = max(0, min(100, risk_score))

    risk_level = str(
        result.get("risk_level", "Medium")
    )

    if risk_level not in {"Low", "Medium", "High"}:
        risk_level = "Medium"

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "risk_factors": result.get(
            "risk_factors",
            []
        ),
        "recommendation": str(
            result.get(
                "recommendation",
                "Review this issue and prioritize investigation."
            )
        ),
        "role_focus": str(
            result.get(
                "role_focus",
                "Review the issue based on your role."
            )
        ),
    }
@router.post("/fix-impact")
async def bug_fix_impact_predictor(
    data: FixImpactRequest,
    current_user: User = Depends(get_current_user),
):
    from app.main import GEMINI_API_KEY

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured.",
        )

    prompt = f"""
You are an AI software engineering risk analyst.

Analyze the expected impact of fixing this software defect.

DEFECT:
Title: {data.title}
Description: {data.description}
Module: {data.module}
Category: {data.category}
Severity: {data.severity}
Priority: {data.priority}

PROPOSED FIX:
{data.fix_description or "No detailed fix description was provided."}

Predict:
- Impact of the fix
- Regression risk
- Areas that may be affected
- Testing required
- Recommended action

Return ONLY valid JSON:

{{
  "impact_level": "Low|Medium|High",
  "impact_score": 0,
  "regression_risk": "Low|Medium|High",
  "affected_areas": [
    "area 1",
    "area 2"
  ],
  "testing_recommendations": [
    "test 1",
    "test 2",
    "test 3"
  ],
  "recommendation": "short recommendation",
  "reasoning": "short explanation"
}}

Rules:
- impact_score must be between 0 and 100.
- High impact should generally be 70-100.
- Medium impact should generally be 40-69.
- Low impact should generally be 0-39.
- Give 1-5 affected areas.
- Give 2-5 testing recommendations.
- Keep the reasoning concise.
- Do not invent technical details that were not provided.
"""

    result = await _gemini_json(
        prompt,
        GEMINI_API_KEY
    )

    try:
        impact_score = int(
            result.get("impact_score", 50)
        )
    except (TypeError, ValueError):
        impact_score = 50

    impact_score = max(
        0,
        min(100, impact_score)
    )

    impact_level = str(
        result.get("impact_level", "Medium")
    )

    if impact_level not in {
        "Low",
        "Medium",
        "High",
    }:
        impact_level = "Medium"

    regression_risk = str(
        result.get("regression_risk", "Medium")
    )

    if regression_risk not in {
        "Low",
        "Medium",
        "High",
    }:
        regression_risk = "Medium"

    return {
        "impact_level": impact_level,
        "impact_score": impact_score,
        "regression_risk": regression_risk,
        "affected_areas": result.get(
            "affected_areas",
            []
        ),
        "testing_recommendations": result.get(
            "testing_recommendations",
            []
        ),
        "recommendation": str(
            result.get(
                "recommendation",
                "Perform appropriate regression testing."
            )
        ),
        "reasoning": str(
            result.get(
                "reasoning",
                "Impact is based on the supplied defect information."
            )
        ),
    }
    # ============================================================
# HISTORICAL RESOLUTION INTELLIGENCE
# ============================================================

@router.post("/historical-resolution")
async def historical_resolution_intelligence(
    data: HistoricalResolutionRequest,
    current_user: User = Depends(get_current_user),
):
    from app.main import GEMINI_API_KEY

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured.",
        )

    historical = [
        {
            "id": item.id,
            "title": item.title,
            "description": item.description,
            "category": item.category,
            "module": item.module,
            "severity": item.severity,
            "priority": item.priority,
            "status": item.status,
        }
        for item in data.historical_issues[:30]
    ]

    if not historical:
        return {
            "matches": [],
            "root_cause": "No historical defects were provided.",
            "previous_resolution": "No previous resolution is available.",
            "investigation_guidance": [
                "Investigate the current defect using its description and module.",
                "Record the root cause and resolution for future reference.",
            ],
        }

    prompt = f"""
You are a historical software defect resolution intelligence assistant.

Analyze the CURRENT DEFECT and compare it with HISTORICAL DEFECTS.

CURRENT DEFECT:
Title: {data.title}
Description: {data.description}
Category: {data.category}
Module: {data.module}
Severity: {data.severity}
Priority: {data.priority}

HISTORICAL DEFECTS:
{json.dumps(historical, ensure_ascii=False)}

Identify the most relevant historical defects and explain how their
previous investigation or resolution could help with the current defect.

Return ONLY valid JSON:

{{
  "matches": [
    {{
      "issue_id": 123,
      "similarity": 0.85,
      "reason": "Why this historical defect is relevant."
    }}
  ],
  "root_cause": "Likely historical root cause if supported by evidence.",
  "previous_resolution": "Previous resolution approach if supported by evidence.",
  "investigation_guidance": [
    "Step 1",
    "Step 2",
    "Step 3"
  ]
}}

Rules:
- Return at most 5 historical matches.
- similarity must be between 0 and 1.
- Do not invent historical resolutions.
- Only use information supplied in the historical defects.
- If there is insufficient evidence, clearly say so.
- Keep investigation guidance practical.
"""

    result = await _gemini_json(prompt, GEMINI_API_KEY)

    allowed_ids = {item.id for item in data.historical_issues}

    matches = []

    for match in result.get("matches", []):
        try:
            issue_id = int(match.get("issue_id"))
            similarity = float(match.get("similarity", 0))
        except (TypeError, ValueError):
            continue

        if issue_id not in allowed_ids:
            continue

        matches.append({
            "issue_id": issue_id,
            "similarity": round(max(0, min(1, similarity)), 2),
            "reason": str(
                match.get(
                    "reason",
                    "Historical defect appears relevant."
                )
            ),
        })

    matches.sort(
        key=lambda item: item["similarity"],
        reverse=True,
    )

    return {
        "matches": matches[:5],
        "root_cause": str(
            result.get(
                "root_cause",
                "No historical root cause identified."
            )
        ),
        "previous_resolution": str(
            result.get(
                "previous_resolution",
                "No previous resolution identified."
            )
        ),
        "investigation_guidance": result.get(
            "investigation_guidance",
            []
        ),
    }


# ============================================================
# EXPLAINABLE EVIDENCE EXPLORER
# ============================================================

@router.post("/evidence-explorer")
async def evidence_explorer(
    data: EvidenceExplorerRequest,
    current_user: User = Depends(get_current_user),
):
    from app.main import GEMINI_API_KEY

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured.",
        )

    prompt = f"""
You are an explainable AI assistant for a software defect tracking system.

Answer the user's question using ONLY the supplied evidence.

QUESTION:
{data.question}

CURRENT ISSUE:
{data.current_issue}

AVAILABLE EVIDENCE:
{json.dumps(data.evidence, ensure_ascii=False)}

Return ONLY valid JSON:

{{
  "answer": "Clear answer based on the evidence.",
  "evidence_used": [
    "Evidence item used"
  ],
  "explanation": "Explain why the evidence supports the answer.",
  "confidence": "HIGH|MEDIUM|LOW"
}}

Rules:
- Do not invent evidence.
- If evidence is insufficient, say so.
- Confidence must reflect the amount and relevance of evidence.
- Keep the explanation concise.
"""

    result = await _gemini_json(prompt, GEMINI_API_KEY)

    confidence = str(
        result.get("confidence", "LOW")
    ).upper()

    if confidence not in {"HIGH", "MEDIUM", "LOW"}:
        confidence = "LOW"

    return {
        "answer": str(
            result.get(
                "answer",
                "Insufficient evidence to answer."
            )
        ),
        "evidence_used": result.get(
            "evidence_used",
            []
        ),
        "explanation": str(
            result.get(
                "explanation",
                "The answer is based on the supplied evidence."
            )
        ),
        "confidence": confidence,
    }


# ============================================================
# AI-POWERED ISSUE INVESTIGATION
# ============================================================

@router.post("/issue-investigation")
async def ai_issue_investigation(
    data: InvestigationRequest,
    current_user: User = Depends(get_current_user),
):
    from app.main import GEMINI_API_KEY

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured.",
        )

    prompt = f"""
You are an expert software defect investigator.

Investigate the following software defect using the supplied information
and historical context.

CURRENT DEFECT:
Title: {data.title}
Description: {data.description}
Category: {data.category}
Module: {data.module}
Severity: {data.severity}
Priority: {data.priority}

HISTORICAL CONTEXT:
{json.dumps(data.historical_context, ensure_ascii=False)}

Provide a practical investigation plan.

Return ONLY valid JSON:

{{
  "problem_summary": "Short summary of the defect.",
  "possible_root_causes": [
    "Possible cause 1",
    "Possible cause 2",
    "Possible cause 3"
  ],
  "investigation_steps": [
    "Step 1",
    "Step 2",
    "Step 3"
  ],
  "historical_insight": "Useful lesson from the supplied historical context.",
  "recommended_action": "Recommended next action.",
  "confidence": "HIGH|MEDIUM|LOW"
}}

Rules:
- Do not invent logs, stack traces, versions, or database information.
- Clearly distinguish possibilities from confirmed facts.
- Use historical context only when relevant.
- Give 2-5 possible root causes.
- Give 3-6 investigation steps.
- Keep the response concise.
"""

    result = await _gemini_json(prompt, GEMINI_API_KEY)

    confidence = str(
        result.get("confidence", "MEDIUM")
    ).upper()

    if confidence not in {"HIGH", "MEDIUM", "LOW"}:
        confidence = "MEDIUM"

    return {
        "problem_summary": str(
            result.get(
                "problem_summary",
                "No problem summary available."
            )
        ),
        "possible_root_causes": result.get(
            "possible_root_causes",
            []
        ),
        "investigation_steps": result.get(
            "investigation_steps",
            []
        ),
        "historical_insight": str(
            result.get(
                "historical_insight",
                "No historical insight available."
            )
        ),
        "recommended_action": str(
            result.get(
                "recommended_action",
                "Investigate the defect using the supplied information."
            )
        ),
        "confidence": confidence,
    }
    # ============================================================
# AI GITHUB CODE REVIEW + FIX SUGGESTIONS
# ============================================================

from urllib.parse import urlparse


class GitHubCodeReviewRequest(BaseModel):
    issue_id: int
    issue_title: str
    issue_description: str
    repo_url: str
    pr_number: int


@router.post("/github-code-review")
async def github_code_review(
    data: GitHubCodeReviewRequest,
    current_user: User = Depends(get_current_user),
):
    from app.main import GEMINI_API_KEY
    import os

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured.",
        )

    repo_url = data.repo_url.strip().rstrip("/")

    parsed = urlparse(repo_url)

    if parsed.netloc.lower() != "github.com":
        raise HTTPException(
            status_code=400,
            detail="Please provide a valid GitHub repository URL.",
        )

    repo_path = parsed.path.strip("/")

    parts = repo_path.split("/")

    if len(parts) < 2:
        raise HTTPException(
            status_code=400,
            detail="GitHub repository URL must look like https://github.com/owner/repository",
        )

    owner = parts[0]
    repo = parts[1]

    if data.pr_number <= 0:
        raise HTTPException(
            status_code=400,
            detail="Pull request number must be greater than 0.",
        )

    github_url = (
        f"https://api.github.com/repos/"
        f"{owner}/{repo}/pulls/{data.pr_number}"
    )

    github_headers = {
        "Accept": "application/vnd.github.v3.diff",
        "User-Agent": "BugFlow",
    }

    github_token = os.getenv("GITHUB_TOKEN")

    if github_token:
        github_headers["Authorization"] = f"Bearer {github_token}"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                github_url,
                headers=github_headers,
            )

        if response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail="GitHub pull request not found. Check repository and PR number.",
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"GitHub API error: HTTP {response.status_code}",
            )

        diff = response.text[:18000]

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to retrieve GitHub pull request: {error}",
        )

    if not diff.strip():
        raise HTTPException(
            status_code=400,
            detail="The pull request does not contain a readable code diff.",
        )

    prompt = f"""
You are an AI code reviewer inside BugFlow.

Review the GitHub pull request diff in relation to the BugFlow defect.

BUGFLOW ISSUE:
Title: {data.issue_title}
Description: {data.issue_description}

PULL REQUEST:
Repository: {owner}/{repo}
PR Number: {data.pr_number}

CODE DIFF:
{diff}

Analyze the changes carefully.

Look for:
- likely bugs
- runtime errors
- logic errors
- incorrect API usage
- security problems
- regression risks
- missing validation
- missing tests
- code quality problems

Return ONLY valid JSON:

{{
  "summary": "short overall review",
  "risk_level": "Low|Medium|High",
  "findings": [
    {{
      "severity": "Low|Medium|High|Critical",
      "file": "file name",
      "line": "line or changed section",
      "issue": "problem found",
      "reason": "why it matters"
    }}
  ],
  "suggested_fixes": [
    {{
      "file": "file name",
      "suggestion": "specific fix",
      "code": "optional short code snippet"
    }}
  ],
  "testing_recommendations": [
    "test recommendation 1",
    "test recommendation 2"
  ]
}}

Rules:
- Do not invent files or code that are not present in the diff.
- If no important problem is found, return an empty findings list.
- Keep findings concise.
- Keep code snippets short.
- Focus on useful engineering feedback.
"""

    result = await _gemini_json(
        prompt,
        GEMINI_API_KEY,
    )

    findings = result.get("findings", [])
    fixes = result.get("suggested_fixes", [])
    tests = result.get("testing_recommendations", [])

    if not isinstance(findings, list):
        findings = []

    if not isinstance(fixes, list):
        fixes = []

    if not isinstance(tests, list):
        tests = []

    risk_level = str(
        result.get("risk_level", "Medium")
    )

    if risk_level not in {"Low", "Medium", "High"}:
        risk_level = "Medium"

    return {
        "issue_id": data.issue_id,
        "repository": f"{owner}/{repo}",
        "pr_number": data.pr_number,
        "risk_level": risk_level,
        "summary": str(
            result.get(
                "summary",
                "AI code review completed."
            )
        ),
        "findings": findings[:10],
        "suggested_fixes": fixes[:10],
        "testing_recommendations": tests[:10],
    }
    # ============================================================
# PREDICTIVE SPRINT ANALYTICS
# ============================================================

class PredictiveSprintRequest(BaseModel):
    sprint_name: str
    total_issues: int = 0
    completed_issues: int = 0
    remaining_issues: int = 0
    high_priority_issues: int = 0
    unassigned_issues: int = 0
    developer_count: int = 0
    sprint_progress_percent: float = 0
    historical_sprints: list[dict] = []


@router.post("/predictive-sprint")
async def predictive_sprint_analytics(
    data: PredictiveSprintRequest,
    current_user: User = Depends(get_current_user),
):
    from app.main import GEMINI_API_KEY

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured.",
        )

    prompt = f"""
You are an AI Agile sprint analytics assistant.

Analyze the current BugFlow sprint and predict whether it is at risk of failing.

CURRENT SPRINT:
Name: {data.sprint_name}
Total Issues: {data.total_issues}
Completed Issues: {data.completed_issues}
Remaining Issues: {data.remaining_issues}
High Priority Issues: {data.high_priority_issues}
Unassigned Issues: {data.unassigned_issues}
Developers: {data.developer_count}
Sprint Progress: {data.sprint_progress_percent}%

HISTORICAL SPRINT DATA:
{data.historical_sprints[:10]}

Analyze:
- developer velocity
- completion progress
- remaining workload
- high priority work
- unassigned work
- historical sprint performance
- workload complexity

Return ONLY valid JSON:

{{
  "health_score": 0,
  "risk_level": "Healthy|Needs Attention|At Risk",
  "velocity_assessment": "short assessment",
  "completion_forecast": "short forecast",
  "risk_factors": [
    "factor 1",
    "factor 2"
  ],
  "recommendations": [
    "recommendation 1",
    "recommendation 2"
  ],
  "prediction": "short prediction explaining whether the sprint is likely to succeed"
}}

Rules:
- health_score must be 0-100.
- 75-100 = Healthy.
- 50-74 = Needs Attention.
- 0-49 = At Risk.
- Do not invent historical data.
- Keep responses concise.
"""

    result = await _gemini_json(
        prompt,
        GEMINI_API_KEY,
    )

    try:
        health_score = int(
            result.get("health_score", 50)
        )
    except (TypeError, ValueError):
        health_score = 50

    health_score = max(
        0,
        min(100, health_score)
    )

    risk_level = str(
        result.get(
            "risk_level",
            "Needs Attention"
        )
    )

    if risk_level not in {
        "Healthy",
        "Needs Attention",
        "At Risk",
    }:
        risk_level = "Needs Attention"

    return {
        "sprint_name": data.sprint_name,
        "health_score": health_score,
        "risk_level": risk_level,
        "velocity_assessment": str(
            result.get(
                "velocity_assessment",
                "Velocity assessment unavailable."
            )
        ),
        "completion_forecast": str(
            result.get(
                "completion_forecast",
                "Completion forecast unavailable."
            )
        ),
        "risk_factors": (
            result.get("risk_factors", [])
            if isinstance(
                result.get("risk_factors", []),
                list
            )
            else []
        ),
        "recommendations": (
            result.get("recommendations", [])
            if isinstance(
                result.get("recommendations", []),
                list
            )
            else []
        ),
        "prediction": str(
            result.get(
                "prediction",
                "Sprint prediction completed."
            )
        ),
    }
    