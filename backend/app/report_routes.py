from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import User, Issue


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# ==================================================
# ISSUE REPORT
# ==================================================

@router.get("/issues")
def issue_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    issues = db.query(Issue).all()

    status = Counter()
    priority = Counter()
    severity = Counter()
    assignees = Counter()

    for issue in issues:
        status[issue.status or "Unknown"] += 1
        priority[issue.priority or "Unknown"] += 1
        severity[issue.severity or "Unknown"] += 1

        if issue.assigned_to:
            assignees[str(issue.assigned_to)] += 1
        else:
            assignees["Unassigned"] += 1

    return {
        "total_issues": len(issues),
        "status_distribution": dict(status),
        "priority_distribution": dict(priority),
        "severity_distribution": dict(severity),
        "assignee_distribution": dict(assignees),
    }


# ==================================================
# DEVELOPER WORKLOAD
# ==================================================

@router.get("/workload")
def developer_workload(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = db.query(User).all()
    issues = db.query(Issue).all()

    result = []

    for user in users:
        assigned = [
            issue
            for issue in issues
            if issue.assigned_to == user.id
        ]

        result.append({
            "user_id": user.id,
            "name": user.name,
            "total": len(assigned),
            "open": len([
                i for i in assigned
                if i.status not in {"Resolved", "Closed"}
            ]),
            "completed": len([
                i for i in assigned
                if i.status in {"Resolved", "Closed"}
            ]),
        })

    return result