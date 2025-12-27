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
