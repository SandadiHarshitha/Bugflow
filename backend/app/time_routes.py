from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import User, Issue, TimeLog
from app.schemas import TimeLogCreate, TimeLogResponse


router = APIRouter(
    prefix="/time",
    tags=["Time Tracking"]
)


# ==================================================
# ADD TIME LOG
# ==================================================

@router.post(
    "/logs",
    response_model=TimeLogResponse
)
def add_time_log(
    data: TimeLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.hours <= 0:
        raise HTTPException(
            status_code=400,
            detail="Hours must be greater than 0."
        )

    issue = (
        db.query(Issue)
        .filter(Issue.id == data.issue_id)
        .first()
    )

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue not found."
        )

    time_log = TimeLog(
        issue_id=data.issue_id,
        user_id=current_user.id,
        hours=data.hours,
        description=data.description,
    )

    db.add(time_log)
    db.commit()
    db.refresh(time_log)

    return time_log


# ==================================================
# GET ISSUE TIME LOGS
# ==================================================

@router.get(
    "/issues/{issue_id}",
    response_model=list[TimeLogResponse]
)
def get_issue_time_logs(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    issue = (
        db.query(Issue)
        .filter(Issue.id == issue_id)
        .first()
    )

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue not found."
        )

    return (
        db.query(TimeLog)
        .filter(TimeLog.issue_id == issue_id)
        .order_by(TimeLog.created_at.desc())
        .all()
    )


# ==================================================
# GET TOTAL LOGGED HOURS
# ==================================================

@router.get("/issues/{issue_id}/total")
def get_total_logged_hours(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    issue = (
        db.query(Issue)
        .filter(Issue.id == issue_id)
        .first()
    )

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue not found."
        )

    logs = (
        db.query(TimeLog)
        .filter(TimeLog.issue_id == issue_id)
        .all()
    )

    total = sum(log.hours for log in logs)

    return {
        "issue_id": issue_id,
        "total_hours": round(total, 2),
    }


# ==================================================
# DELETE TIME LOG
# ==================================================

@router.delete("/logs/{log_id}")
def delete_time_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = (
        db.query(TimeLog)
        .filter(TimeLog.id == log_id)
        .first()
    )

    if not log:
        raise HTTPException(
            status_code=404,
            detail="Time log not found."
        )

    # Only the person who created the log or an admin
    # can delete it.
    if (
        log.user_id != current_user.id
        and current_user.role.lower() != "admin"
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot delete this time log."
        )

    db.delete(log)
    db.commit()

    return {
        "message": "Time log deleted successfully."
    }