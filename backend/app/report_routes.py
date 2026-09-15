from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case

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
    """
    Optimized developer workload report.

    Instead of loading every issue into Python and filtering
    them separately for every user, aggregation is performed
    directly by PostgreSQL.
    """

    # --------------------------------------------------
    # Count assigned issues for each user
    # --------------------------------------------------

    workload_rows = (
        db.query(
            User.id.label("user_id"),
            User.name.label("name"),

            func.count(Issue.id).label("total"),

            func.sum(
                case(
                    (
                        Issue.status.notin_(["Resolved", "Closed"]),
                        1
                    ),
                    else_=0
                )
            ).label("open"),

            func.sum(
                case(
                    (
                        Issue.status.in_(["Resolved", "Closed"]),
                        1
                    ),
                    else_=0
                )
            ).label("completed"),
        )
        .outerjoin(
            Issue,
            Issue.assigned_to == User.id
        )
        .group_by(
            User.id,
            User.name
        )
        .all()
    )

    # --------------------------------------------------
    # Build same response structure as before
    # --------------------------------------------------

    result = []

    for row in workload_rows:
        result.append({
            "user_id": row.user_id,
            "name": row.name,
            "total": int(row.total or 0),
            "open": int(row.open or 0),
            "completed": int(row.completed or 0),
        })

    return result