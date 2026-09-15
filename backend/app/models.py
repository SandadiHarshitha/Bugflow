from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Float,
    Boolean,
    func,
    Index
)

from app.database import Base


# ==================================================
# USER
# ==================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(100),
        unique=True,
        nullable=False
    )

    password = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(50),
        nullable=False,
        index=True
    )


# ==================================================
# PROJECT
# ==================================================

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)

    project_name = Column(
        String(100),
        nullable=False
    )

    description = Column(
        String(255),
        nullable=False
    )


# ==================================================
# ISSUE
# ==================================================

class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(
        String(200),
        nullable=False
    )

    description = Column(
        String(500),
        nullable=False
    )

    status = Column(
        String(50),
        nullable=False,
        index=True
    )

    priority = Column(
        String(50),
        nullable=False,
        index=True
    )

    # ==================================================
    # AI CLASSIFICATION
    # ==================================================

    category = Column(
        String(100),
        nullable=True,
        index=True
    )

    module = Column(
        String(100),
        nullable=True,
        index=True
    )

    defect_type = Column(
        String(100),
        nullable=True,
        index=True
    )

    severity = Column(
        String(50),
        nullable=True,
        index=True
    )

    # ==================================================
    # RELATIONSHIPS
    # ==================================================

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False,
        index=True
    )

    assigned_to = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )

    # ==================================================
    # DATABASE OPTIMIZATION
    # ==================================================

    __table_args__ = (
        Index(
            "ix_issues_project_status",
            "project_id",
            "status"
        ),
        Index(
            "ix_issues_assigned_status",
            "assigned_to",
            "status"
        ),
        Index(
            "ix_issues_project_priority",
            "project_id",
            "priority"
        ),
    )


# ==================================================
# COMMENT
# ==================================================

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)

    content = Column(
        String(1000),
        nullable=False
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    issue_id = Column(
        Integer,
        ForeignKey("issues.id"),
        nullable=False,
        index=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        index=True
    )

    # ==================================================
    # DATABASE OPTIMIZATION
    # ==================================================

    __table_args__ = (
        Index(
            "ix_comments_issue_created",
            "issue_id",
            "created_at"
        ),
    )


# ==================================================
# ISSUE ACTIVITY
# ==================================================

class IssueActivity(Base):
    __tablename__ = "issue_activity"

    id = Column(Integer, primary_key=True, index=True)

    issue_id = Column(
        Integer,
        ForeignKey("issues.id"),
        nullable=False,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    action = Column(
        String(100),
        nullable=False,
        index=True
    )

    details = Column(
        String(500),
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        index=True
    )

    # ==================================================
    # DATABASE OPTIMIZATION
    # ==================================================

    __table_args__ = (
        Index(
            "ix_activity_issue_created",
            "issue_id",
            "created_at"
        ),
        Index(
            "ix_activity_user_created",
            "user_id",
            "created_at"
        ),
    )


# ==================================================
# ISSUE ATTACHMENT
# ==================================================

class IssueAttachment(Base):
    __tablename__ = "issue_attachments"

    id = Column(Integer, primary_key=True, index=True)

    issue_id = Column(
        Integer,
        ForeignKey("issues.id"),
        nullable=False,
        index=True
    )

    uploaded_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    filename = Column(
        String(255),
        nullable=False
    )

    file_path = Column(
        String(500),
        nullable=False
    )

    content_type = Column(
        String(100),
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        index=True
    )


# ==================================================
# TIME LOG
# ==================================================

class TimeLog(Base):
    __tablename__ = "time_logs"

    id = Column(Integer, primary_key=True, index=True)

    issue_id = Column(
        Integer,
        ForeignKey("issues.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    hours = Column(
        Float,
        nullable=False
    )

    description = Column(
        String(500),
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        index=True
    )

    # ==================================================
    # DATABASE OPTIMIZATION
    # ==================================================

    __table_args__ = (
        Index(
            "ix_timelogs_issue_user",
            "issue_id",
            "user_id"
        ),
        Index(
            "ix_timelogs_issue_created",
            "issue_id",
            "created_at"
        ),
    )


# ==================================================
# NOTIFICATION
# ==================================================

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    issue_id = Column(
        Integer,
        ForeignKey("issues.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    message = Column(
        String(500),
        nullable=False
    )

    notification_type = Column(
        String(50),
        nullable=False,
        default="info",
        index=True
    )

    is_read = Column(
        Boolean,
        nullable=False,
        default=False,
        index=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        index=True
    )

    # ==================================================
    # DATABASE OPTIMIZATION
    # ==================================================

    __table_args__ = (
        Index(
            "ix_notifications_user_read",
            "user_id",
            "is_read"
        ),
        Index(
            "ix_notifications_user_created",
            "user_id",
            "created_at"
        ),
    )