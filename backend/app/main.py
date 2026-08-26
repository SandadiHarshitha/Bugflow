from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    Request,
    UploadFile,
    File,
)

from fastapi.responses import (
    RedirectResponse,
    FileResponse,
)

from fastapi.security import OAuth2PasswordRequestForm

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from pydantic import BaseModel

from starlette.middleware.sessions import SessionMiddleware

from authlib.integrations.starlette_client import OAuth

import os
import shutil
import uuid
import json
import httpx

from dotenv import load_dotenv


# ==================================================
# LOAD ENVIRONMENT
# ==================================================

load_dotenv()


# ==================================================
# APP IMPORTS
# ==================================================

import app.models

from app.database import (
    engine,
    Base,
    get_db,
)
from app.sprint_routes import router as sprint_router
from app.time_routes import router as time_router
from app.notification_routes import router as notification_router
from app.report_routes import router as report_router


from app.schemas import (
    UserCreate,
    UserResponse,
    ProjectCreate,
    ProjectResponse,
    IssueCreate,
    IssueResponse,
    CommentCreate,
    CommentResponse,
    ActivityResponse,
    AttachmentResponse,
    AIClassificationRequest,
    AIClassificationResponse,
    AIClassificationSave,
)

from app.crud import (
    create_user,
    authenticate_user,

    create_project,
    get_projects,
    get_project_by_id,
    update_project,
    delete_project,

    create_issue,
    get_issues,
    get_issue_by_id,
    update_issue,
    delete_issue,

    create_comment,
    get_comments_by_issue,
    delete_comment,

    create_activity,
    get_issue_activity,
)

from app.auth import (
    create_access_token,
    get_current_user,
)
from app.roles import require_roles, normalize_role

from app.models import User, Issue, Comment, IssueActivity, IssueAttachment,Notification


# ==================================================
# ENVIRONMENT VARIABLES
# ==================================================

GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY"
)

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "bugflow_secret_key_12345"
)

GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID"
)

GOOGLE_CLIENT_SECRET = os.getenv(
    "GOOGLE_CLIENT_SECRET"
)


# ==================================================
# APP
# ==================================================

app = FastAPI(
    title="BugFlow API",
    version="1.0.0",
)
app.include_router(
    sprint_router,
    prefix=""
)


app.include_router(
    time_router,
    prefix=""
)

app.include_router(
    notification_router,
    prefix=""
)

app.include_router(
    report_router,
    prefix=""
)


# ==================================================
# DEBUG - ROUTES
# ==================================================

print("SPRINT ROUTER INCLUDED")
print("APP ROUTES AFTER INCLUDE:")

for route in app.routes:
    print(
        type(route),
        getattr(route, "path", None)
    )


# ==================================================
# SESSION MIDDLEWARE
# Required by Authlib OAuth
# ==================================================

app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY,
    same_site="lax",
    https_only=False,
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ==================================================
# DATABASE
# ==================================================

Base.metadata.create_all(
    bind=engine
)

# ==================================================
# FILE UPLOADS
# ==================================================

UPLOAD_DIR = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads"
)

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# ==================================================
# GOOGLE OAUTH CONFIGURATION
# ==================================================

oauth = OAuth()


if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:

    oauth.register(

        name="google",

        client_id=GOOGLE_CLIENT_ID,

        client_secret=GOOGLE_CLIENT_SECRET,

        server_metadata_url=(
            "https://accounts.google.com/"
            ".well-known/openid-configuration"
        ),

        client_kwargs={
            "scope": "openid email profile"
        },
    )


# ==================================================
# HOME
# ==================================================

@app.get("/")
def home():

    return {
        "message": "Welcome to BugFlow 🚀"
    }


# ==================================================
# REGISTER
# ==================================================

@app.post(
    "/register",
    response_model=UserResponse
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    return create_user(
        db,
        user
    )


# ==================================================
# LOGIN
# ==================================================

@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm =
        Depends(),

    db: Session = Depends(get_db)
):

    db_user = authenticate_user(
        db,
        form_data.username,
        form_data.password
    )

    if not db_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": db_user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ==================================================
# CURRENT USER
# ==================================================

@app.get("/me")
def get_me(
    current_user: User = Depends(
        get_current_user
    )
):

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }


# ==================================================
# GOOGLE LOGIN
# ==================================================

@app.get("/auth/google")
async def google_login(
    request: Request
):

    if not GOOGLE_CLIENT_ID:

        raise HTTPException(
            status_code=500,
            detail=(
                "GOOGLE_CLIENT_ID is not configured"
            )
        )

    if not GOOGLE_CLIENT_SECRET:

        raise HTTPException(
            status_code=500,
            detail=(
                "GOOGLE_CLIENT_SECRET is not configured"
            )
        )

    redirect_uri = request.url_for(
        "google_callback"
    )

    return await oauth.google.authorize_redirect(
        request,
        redirect_uri
    )


# ==================================================
# GOOGLE CALLBACK
# ==================================================

@app.get(
    "/auth/google/callback",
    name="google_callback"
)
async def google_callback(
    request: Request,
    db: Session = Depends(get_db)
):

    try:

        # ------------------------------------------
        # Exchange authorization code for token
        # ------------------------------------------

        token = (
            await oauth.google
            .authorize_access_token(request)
        )


        # ------------------------------------------
        # Get Google user information
        # ------------------------------------------

        user_info = token.get(
            "userinfo"
        )


        if not user_info:

            user_info = (
                await oauth.google.userinfo(
                    token=token
                )
            )


        email = user_info.get(
            "email"
        )

        name = user_info.get(
            "name"
        )


        # ------------------------------------------
        # Validate Google response
        # ------------------------------------------

        if not email:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Google account email "
                    "was not provided"
                )
            )


        # ------------------------------------------
        # Find existing BugFlow user
        # ------------------------------------------

        db_user = (
            db.query(User)
            .filter(
                User.email == email
            )
            .first()
        )


        # ------------------------------------------
        # User does not exist
        # ------------------------------------------

        if not db_user:

            frontend_url = (
                "http://localhost:5173"
            )

            return RedirectResponse(
                url=(
                    f"{frontend_url}"
                    f"/?google_error="
                    f"user_not_registered"
                    f"&google_email="
                    f"{email}"
                )
            )


        # ------------------------------------------
        # Create BugFlow JWT
        # ------------------------------------------

        access_token = (
            create_access_token(
                data={
                    "sub": db_user.email
                }
            )
        )


        # ------------------------------------------
        # Send token to React
        # ------------------------------------------

        frontend_url = (
            "http://localhost:5173"
        )


        return RedirectResponse(
            url=(
                f"{frontend_url}"
                f"/?google_token="
                f"{access_token}"
            )
        )


    except HTTPException:

        raise


    except Exception as error:

        print(
            "Google OAuth Error:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Google authentication failed"
            )
        )


# ==================================================
# GET DEVELOPERS
# ==================================================

@app.get("/developers")
def get_developers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: User = Depends(require_roles("Manager", "Admin"))
):

    developers = (
        db.query(User)
        .filter(User.role == "Developer")
        .all()
    )

    return [
        {
            "id": developer.id,
            "name": developer.name,
            "email": developer.email,
            "role": developer.role
        }
        for developer in developers
    ]


# ==================================================
# CREATE PROJECT
# ==================================================

@app.post(
    "/projects",
    response_model=ProjectResponse
)
def add_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: User = Depends(require_roles("Manager", "Admin"))
):

    return create_project(
        db,
        project
    )


# ==================================================
# GET ALL PROJECTS
# ==================================================

@app.get(
    "/projects",
    response_model=list[ProjectResponse]
)
def read_projects(
    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    )
):

    return get_projects(
        db
    )


# ==================================================
# GET PROJECT BY ID
# ==================================================

@app.get(
    "/projects/{project_id}",
    response_model=ProjectResponse
)
def read_project(
    project_id: int,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    )
):

    project = get_project_by_id(
        db,
        project_id
    )

    if not project:

        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return project


# ==================================================
# UPDATE PROJECT
# ==================================================

@app.put(
    "/projects/{project_id}",
    response_model=ProjectResponse
)
def edit_project(
    project_id: int,
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: User = Depends(require_roles("Manager", "Admin"))
):

    updated_project = update_project(
        db,
        project_id,
        project
    )

    if not updated_project:

        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return updated_project


# ==================================================
# DELETE PROJECT
# ==================================================

@app.delete(
    "/projects/{project_id}"
)
def remove_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: User = Depends(require_roles("Manager", "Admin"))
):

    deleted_project = delete_project(
        db,
        project_id
    )

    if not deleted_project:

        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return {
        "message":
            "Project deleted successfully"
    }


# ==================================================
# CREATE ISSUE
# ==================================================

@app.post(
    "/issues",
    response_model=IssueResponse
)
def add_issue(
    issue: IssueCreate,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    )
):

    new_issue = create_issue(
        db,
        issue,
        current_user.id
    )

    create_activity(
        db=db,
        issue_id=new_issue.id,
        user_id=current_user.id,
        action="Issue Created",
        details=f"Issue '{new_issue.title}' was created"
    )

    return new_issue


# ==================================================
# GET ALL ISSUES
# ==================================================

@app.get(
    "/issues",
    response_model=list[IssueResponse]
)
def read_issues(
    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    )
):

    return get_issues(
        db
    )


# ==================================================
# GET ISSUE BY ID
# ==================================================

@app.get(
    "/issues/{issue_id}",
    response_model=IssueResponse
)
def read_issue(
    issue_id: int,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    )
):

    issue = get_issue_by_id(
        db,
        issue_id
    )

    if not issue:

        raise HTTPException(
            status_code=404,
            detail="Issue not found"
        )

    return issue


# ==================================================
# UPDATE ISSUE
# ==================================================

@app.put(
    "/issues/{issue_id}",
    response_model=IssueResponse
)
def edit_issue(
    issue_id: int,

    issue: IssueCreate,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    )
):

    existing_issue = get_issue_by_id(
        db,
        issue_id
    )

    if not existing_issue:

        raise HTTPException(
            status_code=404,
            detail="Issue not found"
        )

    old_title = existing_issue.title
    old_description = existing_issue.description
    old_project_id = existing_issue.project_id
    old_status = existing_issue.status
    old_priority = existing_issue.priority
    old_assigned_to = existing_issue.assigned_to

    updated_issue = update_issue(
        db,
        issue_id,
        issue
    )

    if not updated_issue:

        raise HTTPException(
            status_code=404,
            detail="Issue not found"
        )

    changed_details = []

    if old_title != updated_issue.title:
        changed_details.append("Title")

    if old_description != updated_issue.description:
        changed_details.append("Description")

    if old_project_id != updated_issue.project_id:
        changed_details.append("Project")

    if changed_details:
        create_activity(
            db=db,
            issue_id=updated_issue.id,
            user_id=current_user.id,
            action="Issue Updated",
            details=(
                "Updated: " + ", ".join(changed_details)
            )
        )

    if old_status != updated_issue.status:
        create_activity(
            db=db,
            issue_id=updated_issue.id,
            user_id=current_user.id,
            action="Status Changed",
            details=f"{old_status} → {updated_issue.status}"
        )

    if old_priority != updated_issue.priority:
        create_activity(
            db=db,
            issue_id=updated_issue.id,
            user_id=current_user.id,
            action="Priority Changed",
            details=f"{old_priority} → {updated_issue.priority}"
        )

    if old_assigned_to != updated_issue.assigned_to:

        if updated_issue.assigned_to is None:
            details = "Developer assignment removed"
        else:
            developer = (
                db.query(User)
                .filter(
                    User.id == updated_issue.assigned_to
                )
                .first()
            )

            if developer:
                details = (
                    f"Assigned to developer: "
                    f"{developer.name}"
                )
            else:
                details = (
                    f"Assigned to developer ID: "
                    f"{updated_issue.assigned_to}"
                )

        create_activity(
            db=db,
            issue_id=updated_issue.id,
            user_id=current_user.id,
            action="Developer Assigned",
            details=details
        )
            # ==================================================
    # CREATE NOTIFICATION FOR ASSIGNED DEVELOPER
    # ==================================================

    if updated_issue.assigned_to is not None:
        db.add(
            Notification(
                user_id=updated_issue.assigned_to,
                issue_id=updated_issue.id,
                message=(
                    f"You have been assigned to issue "
                    f"#{updated_issue.id}: "
                    f"{updated_issue.title}"
                ),
                notification_type="assignment",
                is_read=False,
            )
        )

        db.commit()

    return updated_issue


# ==================================================
# DELETE ISSUE
# ==================================================

@app.delete(
    "/issues/{issue_id}"
)
def remove_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: User = Depends(require_roles("Manager", "Admin"))
):

    deleted_issue = delete_issue(
        db,
        issue_id
    )

    if not deleted_issue:

        raise HTTPException(
            status_code=404,
            detail="Issue not found"
        )

    return {
        "message":
            "Issue deleted successfully"
    }


# ==================================================
# COMMENTS
# ==================================================

@app.post(
    "/issues/{issue_id}/comments",
    response_model=CommentResponse
)
def create_issue_comment(
    issue_id: int,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    issue = db.query(Issue).filter(
        Issue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue not found"
        )

    if comment.issue_id != issue_id:
        raise HTTPException(
            status_code=400,
            detail="Issue ID mismatch"
        )

    new_comment = create_comment(
        db,
        comment,
        current_user.id
    )

    create_activity(
        db=db,
        issue_id=issue_id,
        user_id=current_user.id,
        action="Comment Added",
        details="A comment was added to the issue"
    )

    return new_comment


@app.get(
    "/issues/{issue_id}/comments",
    response_model=list[CommentResponse]
)
def get_issue_comments(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    issue = db.query(Issue).filter(
        Issue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue not found"
        )

    return get_comments_by_issue(
        db,
        issue_id
    )


@app.delete(
    "/comments/{comment_id}"
)
def delete_issue_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    comment = db.query(Comment).filter(
        Comment.id == comment_id
    ).first()

    if not comment:
        raise HTTPException(
            status_code=404,
            detail="Comment not found"
        )

    if comment.created_by != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can delete only your own comments"
        )

    delete_comment(
        db,
        comment_id
    )

    return {
        "message": "Comment deleted successfully"
    }


# ==================================================
# ISSUE ATTACHMENTS
# ==================================================

@app.post(
    "/issues/{issue_id}/attachments",
    response_model=AttachmentResponse
)
async def upload_issue_attachment(
    issue_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issue = db.query(Issue).filter(
        Issue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue not found"
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected"
        )

    original_name = os.path.basename(file.filename)
    extension = os.path.splitext(original_name)[1]
    stored_name = (
        f"{uuid.uuid4().hex}{extension}"
    )
    file_path = os.path.join(
        UPLOAD_DIR,
        stored_name
    )

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

        attachment = IssueAttachment(
            issue_id=issue_id,
            uploaded_by=current_user.id,
            filename=original_name,
            file_path=file_path,
            content_type=file.content_type
        )

        db.add(attachment)
        db.commit()
        db.refresh(attachment)

        create_activity(
            db=db,
            issue_id=issue_id,
            user_id=current_user.id,
            action="File Attached",
            details=(
                f"File '{original_name}' was attached"
            )
        )

        return attachment

    except Exception:
        db.rollback()

        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=500,
            detail="Failed to upload attachment"
        )


@app.get(
    "/issues/{issue_id}/attachments",
    response_model=list[AttachmentResponse]
)
def get_issue_attachments(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issue = db.query(Issue).filter(
        Issue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue not found"
        )

    return (
        db.query(IssueAttachment)
        .filter(
            IssueAttachment.issue_id == issue_id
        )
        .order_by(
            IssueAttachment.created_at.asc()
        )
        .all()
    )


@app.get(
    "/attachments/{attachment_id}"
)
def download_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attachment = (
        db.query(IssueAttachment)
        .filter(
            IssueAttachment.id == attachment_id
        )
        .first()
    )

    if not attachment:
        raise HTTPException(
            status_code=404,
            detail="Attachment not found"
        )

    if not os.path.exists(
        attachment.file_path
    ):
        raise HTTPException(
            status_code=404,
            detail="Attachment file not found"
        )

    return FileResponse(
        path=attachment.file_path,
        filename=attachment.filename,
        media_type=(
            attachment.content_type
            or "application/octet-stream"
        )
    )


@app.delete(
    "/attachments/{attachment_id}"
)
def delete_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attachment = (
        db.query(IssueAttachment)
        .filter(
            IssueAttachment.id == attachment_id
        )
        .first()
    )

    if not attachment:
        raise HTTPException(
            status_code=404,
            detail="Attachment not found"
        )

    if attachment.uploaded_by != current_user.id:
        raise HTTPException(
            status_code=403,
            detail=(
                "You can delete only your own attachments"
            )
        )

    issue_id = attachment.issue_id
    filename = attachment.filename
    file_path = attachment.file_path

    db.delete(attachment)
    db.commit()

    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass

    create_activity(
        db=db,
        issue_id=issue_id,
        user_id=current_user.id,
        action="File Removed",
        details=(
            f"File '{filename}' was removed"
        )
    )

    return {
        "message":
            "Attachment deleted successfully"
    }


# ==================================================
# ISSUE ACTIVITY
# ==================================================

@app.get(
    "/issues/{issue_id}/activity",
    response_model=list[ActivityResponse]
)
def get_issue_activity_history(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    issue = db.query(Issue).filter(
        Issue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue not found"
        )

    return get_issue_activity(
        db,
        issue_id
    )


# ==================================================
# AI REQUEST MODEL
# ==================================================

class AIEnhanceRequest(
    BaseModel
):

    description: str


# ==================================================
# GEMINI - ENHANCE DESCRIPTION
# ==================================================

@app.post(
    "/ai/enhance-description"
)
async def enhance_description(
    request: AIEnhanceRequest,

    current_user: User = Depends(
        get_current_user
    )
):

    # ------------------------------------------
    # Check API key
    # ------------------------------------------

    if not GEMINI_API_KEY:

        raise HTTPException(
            status_code=500,
            detail=(
                "Gemini API key is not configured"
            )
        )


    # ------------------------------------------
    # Validate description
    # ------------------------------------------

    if not request.description.strip():

        raise HTTPException(
            status_code=400,
            detail=(
                "Description cannot be empty"
            )
        )


    # ------------------------------------------
    # Prompt
    # ------------------------------------------

    prompt = f"""
You are a professional software bug report assistant.

Rewrite the following bug description into a
professional, clear and concise description suitable
for a software bug tracking system.

Rules:

1. Keep the original meaning.
2. Do not invent technical details.
3. Do not assume information not provided.
4. Clearly explain the problem.
5. Use professional software-development language.
6. Keep it concise.
7. Return only the improved description.
8. Do not use markdown.
9. Do not write "Description:".

Original description:

{request.description}
"""


    # ------------------------------------------
    # Gemini endpoint
    # ------------------------------------------

    url = (
        "https://generativelanguage.googleapis.com/"
        "v1beta/models/gemini-3.6-flash:"
        "generateContent"
    )


    # ------------------------------------------
    # Headers
    # ------------------------------------------

    headers = {

        "Content-Type":
            "application/json",

        "x-goog-api-key":
            GEMINI_API_KEY,
    }


    # ------------------------------------------
    # Payload
    # ------------------------------------------

    payload = {

        "contents": [

            {
                "parts": [

                    {
                        "text": prompt
                    }

                ]
            }

        ],

        "generationConfig": {

            "maxOutputTokens": 300

        }

    }


    # ------------------------------------------
    # Gemini request
    # ------------------------------------------

    try:

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:

            response = await client.post(

                url,

                headers=headers,

                json=payload

            )


        # ------------------------------------------
        # Gemini error
        # ------------------------------------------

        if response.status_code != 200:

            print(
                "Gemini API Error:",
                response.status_code
            )

            print(
                response.text
            )


            try:

                google_error = (
                    response.json()
                )

            except Exception:

                google_error = {
                    "message":
                        response.text
                }


            raise HTTPException(

                status_code=500,

                detail={
                    "message":
                        "Gemini API request failed",

                    "google_error":
                        google_error
                }

            )


        # ------------------------------------------
        # Parse response
        # ------------------------------------------

        data = response.json()


        candidates = data.get(
            "candidates",
            []
        )


        if not candidates:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Gemini did not generate "
                    "a response"
                )
            )


        content = candidates[0].get(
            "content",
            {}
        )


        parts = content.get(
            "parts",
            []
        )


        if not parts:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Gemini returned an empty response"
                )
            )


        enhanced_description = (
            parts[0]
            .get("text", "")
            .strip()
        )


        if not enhanced_description:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Gemini returned empty text"
                )
            )


        # ------------------------------------------
        # Return
        # ------------------------------------------

        return {

            "original_description":
                request.description,

            "enhanced_description":
                enhanced_description

        }


    except httpx.RequestError as error:

        print(
            "Gemini connection error:",
            repr(error)
        )


        raise HTTPException(

            status_code=500,

            detail=(
                "Could not connect to Gemini API"
            )

        )

# ==================================================
# AI DEFECT CLASSIFICATION
# ==================================================

@app.post(
    "/ai/classify-issue",
    response_model=AIClassificationResponse
)
async def classify_issue(
    data: AIClassificationRequest,
    current_user: User = Depends(get_current_user)
):

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured"
        )

    if not data.title.strip():
        raise HTTPException(
            status_code=400,
            detail="Issue title cannot be empty"
        )

    if not data.description.strip():
        raise HTTPException(
            status_code=400,
            detail="Issue description cannot be empty"
        )

    prompt = f"""
You are a professional software defect classification assistant.

Analyze the following software defect.

Return ONLY valid JSON.
Do not use markdown.
Do not use ```json.
Do not add any explanation outside the JSON.

Allowed category values:
- Authentication
- Payment
- UI
- Database
- API
- Performance
- Security
- Deployment
- Other

Allowed defect_type values:
- Functional
- UI
- Performance
- Security
- Compatibility
- Data
- Configuration
- Other

Allowed severity values:
- Critical
- High
- Medium
- Low

Allowed priority values:
- Critical
- High
- Medium
- Low

Determine:
1. category
2. module
3. defect_type
4. severity
5. priority
6. reason

Rules:
- Use only the allowed values for category, defect_type, severity and priority.
- module must be a short application or technical module name.
- Do not invent information.
- Base the classification only on the title and description.
- reason must be short and clear.

Issue Title:
{data.title}

Issue Description:
{data.description}

Return exactly this JSON structure:
{{
    "category": "Payment",
    "module": "Checkout",
    "defect_type": "Functional",
    "severity": "High",
    "priority": "High",
    "reason": "The payment workflow is blocked."
}}
"""

    url = (
        "https://generativelanguage.googleapis.com/"
        "v1beta/models/gemini-3.6-flash:generateContent"
    )

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
    }

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 500,
            "responseMimeType": "application/json",
        },
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url,
                headers=headers,
                json=payload,
            )

        if response.status_code != 200:
            print("Gemini Classification Error:", response.status_code)
            print(response.text)
            raise HTTPException(
                status_code=500,
                detail="Gemini classification request failed",
            )

        result = response.json()
        candidates = result.get("candidates", [])

        if not candidates:
            raise HTTPException(
                status_code=500,
                detail="Gemini did not return a classification",
            )

        parts = (
            candidates[0]
            .get("content", {})
            .get("parts", [])
        )

        if not parts:
            raise HTTPException(
                status_code=500,
                detail="Gemini returned an empty classification",
            )

        text = parts[0].get("text", "").strip()

        if not text:
            raise HTTPException(
                status_code=500,
                detail="Gemini returned empty text",
            )

        # Gemini can occasionally wrap JSON in markdown or add extra text.
        # Extract the JSON object before parsing it.
        if text.startswith("```"):
            text = text.replace("```json", "", 1)
            text = text.replace("```", "", 1)
            text = text.strip()

        start = text.find("{")
        end = text.rfind("}")

        if start == -1 or end == -1 or end < start:
            print("Gemini raw response:")
            print(text)
            raise HTTPException(
                status_code=500,
                detail="Gemini did not return a JSON object",
            )

        json_text = text[start:end + 1]

        try:
            classification = json.loads(json_text)
        except json.JSONDecodeError as error:
            print("Gemini raw response:")
            print(text)
            print("JSON parsing error:", repr(error))
            raise HTTPException(
                status_code=500,
                detail="Gemini returned invalid JSON",
            )

        return AIClassificationResponse(
            category=classification.get("category", "Other"),
            module=classification.get("module", "Unknown"),
            defect_type=classification.get("defect_type", "Other"),
            severity=classification.get("severity", "Medium"),
            priority=classification.get("priority", "Medium"),
            reason=classification.get("reason", "No reason provided."),
        )

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Gemini returned invalid JSON",
        )

    except httpx.RequestError as error:
        print("Gemini connection error:", repr(error))
        raise HTTPException(
            status_code=500,
            detail="Could not connect to Gemini API",
        )


# ==================================================
# SAVE AI CLASSIFICATION
# ==================================================

@app.put(
    "/issues/{issue_id}/ai-classification",
    response_model=IssueResponse
)
def save_ai_classification(
    issue_id: int,
    data: AIClassificationSave,
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
            detail="Issue not found",
        )

    issue.category = data.category
    issue.module = data.module
    issue.defect_type = data.defect_type
    issue.severity = data.severity
    issue.priority = data.priority

    db.commit()
    db.refresh(issue)

    create_activity(
        db=db,
        issue_id=issue.id,
        user_id=current_user.id,
        action="AI Classification Updated",
        details=(
            f"Category: {issue.category}, "
            f"Module: {issue.module}, "
            f"Type: {issue.defect_type}, "
            f"Severity: {issue.severity}, "
            f"Priority: {issue.priority}"
        ),
    )

    return issue