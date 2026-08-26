from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.models import (
    User,
    Project,
    Issue,
    Comment,
    IssueActivity,
    TimeLog,
    Notification,
    IssueAttachment,
)

from app.schemas import (
    UserCreate,
    ProjectCreate,
    IssueCreate,
    CommentCreate
)


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ==================================================
# USER
# ==================================================

def create_user(
    db: Session,
    user: UserCreate
):

    hashed_password = pwd_context.hash(
        user.password
    )

    db_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def authenticate_user(
    db: Session,
    email: str,
    password: str
):

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        return None

    if not pwd_context.verify(
        password,
        user.password
    ):
        return None

    return user


# ==================================================
# PROJECT
# ==================================================

def create_project(
    db: Session,
    project: ProjectCreate
):

    db_project = Project(
        project_name=project.project_name,
        description=project.description
    )

    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    return db_project


def get_projects(db: Session):

    return db.query(Project).all()


def get_project_by_id(
    db: Session,
    project_id: int
):

    return (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )


def update_project(
    db: Session,
    project_id: int,
    project: ProjectCreate
):

    db_project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not db_project:
        return None

    db_project.project_name = project.project_name
    db_project.description = project.description

    db.commit()
    db.refresh(db_project)

    return db_project


def delete_project(
    db: Session,
    project_id: int
):

    db_project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not db_project:
        return None

    db.delete(db_project)
    db.commit()

    return db_project


# ==================================================
# ISSUE
# ==================================================

def create_issue(
    db: Session,
    issue: IssueCreate,
    user_id: int
):

    db_issue = Issue(
        title=issue.title,
        description=issue.description,
        status=issue.status,
        priority=issue.priority,
        created_by=user_id,
        project_id=issue.project_id,
        assigned_to=issue.assigned_to
    )

    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)

    return db_issue


def get_issues(db: Session):

    return db.query(Issue).all()


def get_issue_by_id(
    db: Session,
    issue_id: int
):

    return (
        db.query(Issue)
        .filter(Issue.id == issue_id)
        .first()
    )


def update_issue(
    db: Session,
    issue_id: int,
    issue: IssueCreate
):

    db_issue = (
        db.query(Issue)
        .filter(Issue.id == issue_id)
        .first()
    )

    if not db_issue:
        return None

    db_issue.title = issue.title
    db_issue.description = issue.description
    db_issue.status = issue.status
    db_issue.priority = issue.priority
    db_issue.project_id = issue.project_id
    db_issue.assigned_to = issue.assigned_to

    db.commit()
    db.refresh(db_issue)

    return db_issue


def delete_issue(
    db: Session,
    issue_id: int
):
    db_issue = (
        db.query(Issue)
        .filter(Issue.id == issue_id)
        .first()
    )

    if not db_issue:
        return None

    # Delete related issue activities
    db.query(IssueActivity).filter(
        IssueActivity.issue_id == issue_id
    ).delete(synchronize_session=False)

    # Delete related comments
    db.query(Comment).filter(
        Comment.issue_id == issue_id
    ).delete(synchronize_session=False)

    # Delete related attachments
    db.query(IssueAttachment).filter(
        IssueAttachment.issue_id == issue_id
    ).delete(synchronize_session=False)

    # Delete related time logs
    db.query(TimeLog).filter(
        TimeLog.issue_id == issue_id
    ).delete(synchronize_session=False)

    # Notifications can remain, but remove their issue reference
    db.query(Notification).filter(
        Notification.issue_id == issue_id
    ).update(
        {"issue_id": None},
        synchronize_session=False
    )

    # Now delete the issue
    db.delete(db_issue)

    db.commit()

    return db_issue

# ==================================================
# COMMENT
# ==================================================

def create_comment(
    db: Session,
    comment: CommentCreate,
    user_id: int
):

    db_comment = Comment(
        content=comment.content,
        created_by=user_id,
        issue_id=comment.issue_id
    )

    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    return db_comment


def get_comments_by_issue(
    db: Session,
    issue_id: int
):

    return (
        db.query(Comment)
        .filter(Comment.issue_id == issue_id)
        .order_by(Comment.created_at.asc())
        .all()
    )


def delete_comment(
    db: Session,
    comment_id: int
):

    db_comment = (
        db.query(Comment)
        .filter(Comment.id == comment_id)
        .first()
    )

    if not db_comment:
        return None

    db.delete(db_comment)
    db.commit()

    return db_comment


# ==================================================
# ISSUE ACTIVITY
# ==================================================

def create_activity(
    db: Session,
    issue_id: int,
    user_id: int,
    action: str,
    details: str = None
):

    activity = IssueActivity(
        issue_id=issue_id,
        user_id=user_id,
        action=action,
        details=details
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return activity


def get_issue_activity(
    db: Session,
    issue_id: int
):

    return (
        db.query(IssueActivity)
        .filter(
            IssueActivity.issue_id == issue_id
        )
        .order_by(
            IssueActivity.created_at.asc()
        )
        .all()
    )