from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


# ==================================================
# USER
# ==================================================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ==================================================
# PROJECT
# ==================================================

class ProjectCreate(BaseModel):
    project_name: str
    description: str


class ProjectResponse(BaseModel):
    id: int
    project_name: str
    description: str

    class Config:
        from_attributes = True


# ==================================================
# ISSUE
# ==================================================

class IssueCreate(BaseModel):
    title: str
    description: str
    status: str
    priority: str
    project_id: int
    assigned_to: Optional[int] = None


class IssueResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    priority: str

    # AI classification
    category: Optional[str] = None
    module: Optional[str] = None
    defect_type: Optional[str] = None
    severity: Optional[str] = None

    created_by: int
    project_id: int
    assigned_to: Optional[int] = None

    class Config:
        from_attributes = True


# ==================================================
# AI CLASSIFICATION
# ==================================================

class AIClassificationRequest(BaseModel):
    title: str
    description: str


class AIClassificationResponse(BaseModel):
    category: str
    module: str
    defect_type: str
    severity: str
    priority: str
    reason: str


class AIClassificationSave(BaseModel):
    category: str
    module: str
    defect_type: str
    severity: str
    priority: str


# ==================================================
# COMMENT
# ==================================================

class CommentCreate(BaseModel):
    content: str
    issue_id: int


class CommentResponse(BaseModel):
    id: int
    content: str
    created_by: int
    issue_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================================================
# ISSUE ACTIVITY
# ==================================================

class ActivityResponse(BaseModel):
    id: int
    issue_id: int
    user_id: int
    action: str
    details: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================================================
# ISSUE ATTACHMENT
# ==================================================

class AttachmentResponse(BaseModel):
    id: int
    issue_id: int
    uploaded_by: int
    filename: str
    file_path: str
    content_type: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================================================
# TIME TRACKING
# ==================================================

class TimeLogCreate(BaseModel):
    issue_id: int
    hours: float
    description: Optional[str] = None


class TimeLogResponse(BaseModel):
    id: int
    issue_id: int
    user_id: int
    hours: float
    description: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================================================
# ISSUE WORKFLOW
# ==================================================

class IssueStatusUpdate(BaseModel):
    status: str


# ==================================================
# AUDIT
# ==================================================

class AuditResponse(BaseModel):
    id: int
    issue_id: int
    user_id: int
    action: str
    details: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================================================
# NOTIFICATIONS
# ==================================================

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    issue_id: Optional[int] = None
    message: str
    notification_type: str
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationRead(BaseModel):
    is_read: bool = True