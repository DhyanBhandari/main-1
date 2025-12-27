"""
Admin API Routes - Endpoints for admin operations.

Endpoints:
- POST /api/admin/signup - Organization signup (public)
- POST /api/admin/login - Admin login
- GET /api/admin/requests/pending - Get pending requests
- GET /api/admin/requests/all - Get all requests
- POST /api/admin/requests/approve - Approve request
- POST /api/admin/requests/reject - Reject request
- POST /api/admin/institutes/create - Create institute directly
- GET /api/admin/institutes - Get all institutes
- POST /api/admin/institutes/login - Institute login
- POST /api/admin/institutes/change-password - Change password
- POST /api/admin/email/send-credentials - Send credentials email
- GET /api/admin/stats - Get admin statistics
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any

from app.models.admin_models import (
    AccessRequestCreate,
    AccessRequest,
    ApproveRequestData,
    RejectRequestData,
    InstituteCreate,
    GeneratedCredentials,
    InstituteLogin,
    EmailData,
)
from app.services.admin_service import get_admin_service, AdminService

router = APIRouter(prefix="/admin", tags=["Admin"])


def get_service() -> AdminService:
    """Dependency to get admin service."""
    return get_admin_service()


# ==================== PUBLIC ENDPOINTS ====================


@router.post("/signup", response_model=Dict[str, Any])
async def organization_signup(
    data: AccessRequestCreate,
    service: AdminService = Depends(get_service),
):
    """
    Organization signup - creates an access request.

    This is a public endpoint for organizations to request dashboard access.
    """
    try:
        request_id = await service.create_access_request(data)
        return {
            "success": True,
            "message": "Your access request has been submitted. You will receive an email once approved.",
            "request_id": request_id,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login", response_model=Dict[str, Any])
async def admin_login(
    email: str,
    password: str,
    service: AdminService = Depends(get_service),
):
    """Admin login - verify admin credentials."""
    if service.verify_admin(email, password):
        return {
            "success": True,
            "email": email,
            "message": "Login successful",
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")


# ==================== ADMIN ENDPOINTS ====================


@router.get("/requests/pending", response_model=List[AccessRequest])
async def get_pending_requests(
    service: AdminService = Depends(get_service),
):
    """Get all pending access requests."""
    return await service.get_pending_requests()


@router.get("/requests/all", response_model=List[AccessRequest])
async def get_all_requests(
    service: AdminService = Depends(get_service),
):
    """Get all access requests."""
    return await service.get_all_requests()


@router.get("/requests/{request_id}", response_model=AccessRequest)
async def get_request(
    request_id: int,
    service: AdminService = Depends(get_service),
):
    """Get a specific access request."""
    request = await service.get_request_by_id(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return request


@router.post("/requests/approve", response_model=GeneratedCredentials)
async def approve_request(
    data: ApproveRequestData,
    service: AdminService = Depends(get_service),
):
    """
    Approve an access request.

    Creates an institute with the provided polygon coordinates
    and generates credentials.
    """
    try:
        credentials = await service.approve_request(data)
        return credentials
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/requests/reject")
async def reject_request(
    data: RejectRequestData,
    service: AdminService = Depends(get_service),
):
    """Reject an access request."""
    try:
        await service.reject_request(data)
        return {"success": True, "message": "Request rejected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/institutes/create", response_model=GeneratedCredentials)
async def create_institute(
    data: InstituteCreate,
    admin_email: str,
    service: AdminService = Depends(get_service),
):
    """
    Create institute directly (without access request).

    This allows admin to create an organization dashboard directly.
    """
    try:
        credentials = await service.create_institute_direct(data, admin_email)
        return credentials
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/institutes", response_model=List[Dict[str, Any]])
async def get_institutes(
    service: AdminService = Depends(get_service),
):
    """Get all institutes."""
    return await service.get_all_institutes()


@router.get("/institutes/{institute_id}", response_model=Dict[str, Any])
async def get_institute(
    institute_id: str,
    service: AdminService = Depends(get_service),
):
    """Get a specific institute."""
    institute = await service.get_institute_by_id(institute_id)
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")
    return institute


# ==================== INSTITUTE AUTH ENDPOINTS ====================


@router.post("/institutes/login", response_model=Dict[str, Any])
async def institute_login(
    data: InstituteLogin,
    service: AdminService = Depends(get_service),
):
    """Institute login."""
    try:
        session = await service.login_institute(data.institute_id, data.password)
        return {"success": True, **session}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/institutes/change-password")
async def change_password(
    institute_id: str,
    current_password: str,
    new_password: str,
    service: AdminService = Depends(get_service),
):
    """Change institute password."""
    try:
        await service.change_institute_password(institute_id, current_password, new_password)
        return {"success": True, "message": "Password changed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== EMAIL ENDPOINTS ====================


@router.post("/email/send-credentials")
async def send_credentials_email(
    data: EmailData,
    service: AdminService = Depends(get_service),
):
    """Send credentials email to organization."""
    try:
        success = await service.send_credentials_email(data)
        return {
            "success": success,
            "message": "Email sent successfully" if success else "Failed to send email",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== STATS ENDPOINTS ====================


@router.get("/stats", response_model=Dict[str, Any])
async def get_stats(
    service: AdminService = Depends(get_service),
):
    """Get admin dashboard statistics."""
    return await service.get_stats()


@router.get("/health")
async def admin_health():
    """Admin API health check."""
    return {"status": "healthy", "service": "admin"}
