from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import Column, Date, ForeignKey, Integer, String, Table
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import Base, get_db
from app.models import User, Project, Issue


sprint_issues = Table(
    "sprint_issues",
    Base.metadata,
    Column("sprint_id", Integer, ForeignKey("sprints.id", ondelete="CASCADE"), primary_key=True),
    Column("issue_id", Integer, ForeignKey("issues.id", ondelete="CASCADE"), primary_key=True),
)


class Sprint(Base):
    __tablename__ = "sprints"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    goal = Column(String(500), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(30), nullable=False, default="Planned")


class SprintCreate(BaseModel):
    project_id: int
    name: str
    goal: str = ""
    start_date: date
    end_date: date
    status: str = "Planned"


class SprintResponse(BaseModel):
    id: int
    project_id: int
    name: str
    goal: Optional[str] = None
    start_date: date
    end_date: date
    status: str

    class Config:
        from_attributes = True


class SprintIssueRequest(BaseModel):
    issue_id: int


router = APIRouter(prefix="/sprints", tags=["Sprints"])


@router.post("", response_model=SprintResponse)
def create_sprint(
    data: SprintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.start_date > data.end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date.")

    project = db.query(Project).filter(Project.id == data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    if data.status not in {"Planned", "Active", "Completed"}:
        raise HTTPException(status_code=400, detail="Invalid sprint status.")

    sprint = Sprint(
        project_id=data.project_id,
        name=data.name.strip(),
        goal=data.goal.strip(),
        start_date=data.start_date,
        end_date=data.end_date,
        status=data.status,
    )
    db.add(sprint)
    db.commit()
    db.refresh(sprint)
    return sprint


@router.get("", response_model=list[SprintResponse])
def get_sprints(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Sprint)
    if project_id is not None:
        query = query.filter(Sprint.project_id == project_id)
    return query.order_by(Sprint.start_date.desc()).all()


@router.get("/{sprint_id}", response_model=SprintResponse)
def get_sprint(
    sprint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found.")
    return sprint


@router.put("/{sprint_id}", response_model=SprintResponse)
def update_sprint(
    sprint_id: int,
    data: SprintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found.")
    if data.start_date > data.end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date.")
    if data.status not in {"Planned", "Active", "Completed"}:
        raise HTTPException(status_code=400, detail="Invalid sprint status.")

    sprint.project_id = data.project_id
    sprint.name = data.name.strip()
    sprint.goal = data.goal.strip()
    sprint.start_date = data.start_date
    sprint.end_date = data.end_date
    sprint.status = data.status
    db.commit()
    db.refresh(sprint)
    return sprint


@router.delete("/{sprint_id}")
def delete_sprint(
    sprint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found.")

    db.execute(sprint_issues.delete().where(sprint_issues.c.sprint_id == sprint_id))
    db.delete(sprint)
    db.commit()
    return {"message": "Sprint deleted successfully."}


@router.post("/{sprint_id}/issues")
def assign_issue_to_sprint(
    sprint_id: int,
    data: SprintIssueRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found.")

    issue = db.query(Issue).filter(Issue.id == data.issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found.")

    if issue.project_id != sprint.project_id:
        raise HTTPException(status_code=400, detail="Issue and sprint must belong to the same project.")

    existing = db.execute(
        sprint_issues.select().where(
            sprint_issues.c.sprint_id == sprint_id,
            sprint_issues.c.issue_id == data.issue_id,
        )
    ).first()

    if existing:
        return {"message": "Issue is already assigned to this sprint."}

    db.execute(
        sprint_issues.insert().values(
            sprint_id=sprint_id,
            issue_id=data.issue_id,
        )
    )
    db.commit()
    return {
        "message": "Issue assigned to sprint successfully.",
        "sprint_id": sprint_id,
        "issue_id": data.issue_id,
    }


@router.delete("/{sprint_id}/issues/{issue_id}")
def remove_issue_from_sprint(
    sprint_id: int,
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = db.execute(
        sprint_issues.delete().where(
            sprint_issues.c.sprint_id == sprint_id,
            sprint_issues.c.issue_id == issue_id,
        )
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Issue is not assigned to this sprint.")
    db.commit()
    return {"message": "Issue removed from sprint."}


@router.get("/{sprint_id}/issues")
def get_sprint_issues(
    sprint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found.")

    rows = db.execute(
        sprint_issues.select().where(sprint_issues.c.sprint_id == sprint_id)
    ).fetchall()
    issue_ids = [row.issue_id for row in rows]
    if not issue_ids:
        return []

    return db.query(Issue).filter(Issue.id.in_(issue_ids)).all()