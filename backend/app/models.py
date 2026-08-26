from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Float,
    Boolean,
    func
)

from app.database import Base


# ==================================================
# USER
# ==================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

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
        nullable=False
    )


# ==================================================
# PROJECT
# ==================================================

class Project(Base):
    __tablename__ = "projects"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

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

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

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
        nullable=False
    )

    priority = Column(
        String(50),
        nullable=False
    )

    # ==================================================
    # AI CLASSIFICATION
    # ==================================================

    category = Column(
        String(100),
        nullable=True
    )

    module = Column(
        String(100),
        nullable=True
    )

    defect_type = Column(
        String(100),
        nullable=True
    )

    severity = Column(
        String(50),
        nullable=True
    )

    # ==================================================
    # RELATIONSHIPS
    # ==================================================

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False
    )

    assigned_to = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )


# ==================================================
# COMMENT
# ==================================================

class Comment(Base):
    __tablename__ = "comments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    content = Column(
        String(1000),
        nullable=False
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    issue_id = Column(
        Integer,
        ForeignKey("issues.id"),
        nullable=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )


# ==================================================
# ISSUE ACTIVITY
# ==================================================

class IssueActivity(Base):
    __tablename__ = "issue_activity"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    issue_id = Column(
        Integer,
        ForeignKey("issues.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    action = Column(
        String(100),
        nullable=False
    )

    details = Column(
        String(500),
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )


# ==================================================
# ISSUE ATTACHMENT
# ==================================================

class IssueAttachment(Base):
    __tablename__ = "issue_attachments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    issue_id = Column(
        Integer,
        ForeignKey("issues.id"),
        nullable=False
    )

    uploaded_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
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
        server_default=func.now()
    )


# ==================================================
# TIME LOG
# ==================================================

class TimeLog(Base):
    __tablename__ = "time_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    issue_id = Column(
        Integer,
        ForeignKey("issues.id", ondelete="CASCADE"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
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
        server_default=func.now()
    )


# ==================================================
# NOTIFICATION
# ==================================================

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    issue_id = Column(
        Integer,
        ForeignKey("issues.id", ondelete="SET NULL"),
        nullable=True
    )

    message = Column(
        String(500),
        nullable=False
    )

    notification_type = Column(
        String(50),
        nullable=False,
        default="info"
    )

    is_read = Column(
        Boolean,
        nullable=False,
        default=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )