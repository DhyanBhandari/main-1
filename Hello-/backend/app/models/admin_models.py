"""
Admin Models - Data models for admin functionality.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class AccessRequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class PolygonPoint(BaseModel):
    lat: float
    lng: float
    label: Optional[str] = None


class AccessRequestCreate(BaseModel):
    """Data for creating a new access request (organization signup)."""
    organization_name: str
    organization_type: str
    email: EmailStr
    country_code: str
    phone_number: str
    message: str
    contact_name: Optional[str] = None


class AccessRequest(BaseModel):
    """Full access request data."""
    id: int
    organization_name: str
    organization_type: str
    email: str
    country_code: str
    phone_number: str
    full_phone: str
    message: str
    contact_name: Optional[str] = None
    status: AccessRequestStatus
    created_at: datetime
    updated_at: datetime
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    institute_id: Optional[str] = None
    rejection_reason: Optional[str] = None


class InstituteCreate(BaseModel):
    """Data for directly creating an institute (admin creates without request)."""
    organization_name: str
    organization_type: str
    email: EmailStr
    country_code: str
    phone_number: str
    polygon_points: List[PolygonPoint]
    password: Optional[str] = None  # None = auto-generate, or custom password


class Institute(BaseModel):
    """Full institute data."""
    id: int
    institute_id: str  # e.g., ORG-X7K2M9
    name: str
    organization_type: str
    email: str
    phone: str
    polygon_coordinates: List[List[float]]  # [[lat, lng], ...]
    requires_password_change: bool
    created_at: datetime
    updated_at: datetime
    created_by: str
    access_request_id: Optional[int] = None


class ApproveRequestData(BaseModel):
    """Data for approving an access request."""
    request_id: int
    polygon_points: List[PolygonPoint]
    admin_email: str
    password: Optional[str] = None  # None = auto-generate, or custom password


class RejectRequestData(BaseModel):
    """Data for rejecting an access request."""
    request_id: int
    reason: Optional[str] = None
    admin_email: str


class GeneratedCredentials(BaseModel):
    """Generated credentials after approval."""
    institute_id: str
    password: str
    login_url: str


class InstituteLogin(BaseModel):
    """Login credentials."""
    institute_id: str
    password: str


class EmailData(BaseModel):
    """Data for sending credential email."""
    to_email: EmailStr
    organization_name: str
    institute_id: str
    password: str
    login_url: str


class InstituteUpdate(BaseModel):
    """Data for updating institute details."""
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None
    email: Optional[EmailStr] = None
    country_code: Optional[str] = None
    phone_number: Optional[str] = None
    polygon_points: Optional[List[PolygonPoint]] = None
    new_password: Optional[str] = None  # None = no change, "auto" = generate, or custom value


class PasswordReset(BaseModel):
    """Reset institute password."""
    password: Optional[str] = None  # None = auto-generate, or custom value


class AdminUserCreate(BaseModel):
    """Data for creating a new admin user."""
    email: str
    password: str
    permissions: List[str]  # tab IDs: dashboards, pending, approved, all, notifications, baseline
    created_by: str


class AdminUserUpdate(BaseModel):
    """Data for updating an admin user."""
    permissions: Optional[List[str]] = None
    password: Optional[str] = None


class AdminUserResponse(BaseModel):
    """Admin user response data."""
    id: int
    email: str
    role: str
    permissions: List[str]
    created_at: str
    created_by: str


class BaselineAssessmentCreate(BaseModel):
    """Data for saving a baseline assessment."""
    admin_email: str
    label: Optional[str] = None
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    polygon_points: List[PolygonPoint]
    phi_response: dict
    overall_score: Optional[float] = None
    pillar_scores: Optional[dict] = None
    location_name: Optional[str] = None


class BaselineAssessmentResponse(BaseModel):
    """Baseline assessment record from Supabase."""
    id: str
    admin_email: str
    label: Optional[str] = None
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    polygon_points: list
    overall_score: Optional[float] = None
    pillar_scores: Optional[dict] = None
    location_name: Optional[str] = None
    created_at: str
