"""
Admin Service - Business logic for admin operations.

Handles:
- Access requests (signup flow)
- Institute creation and management
- Credential generation
- Email notifications
"""

import os
import json
import secrets
import string
import hashlib
import aiosqlite
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path

from app.models.admin_models import (
    AccessRequest,
    AccessRequestCreate,
    AccessRequestStatus,
    Institute,
    InstituteCreate,
    ApproveRequestData,
    RejectRequestData,
    GeneratedCredentials,
    PolygonPoint,
    EmailData,
)


# Database path
DB_PATH = Path(__file__).parent.parent.parent / "admin.db"

# Hardcoded admin accounts (same as frontend)
ADMIN_ACCOUNTS = [
    {"email": "dhyanbhandari200@gmail.com", "password": "Dhyan3016#"},
    {"email": "erthaloka@gmail.com", "password": "Freshstart4ever"},
]
ADMIN_EMAILS = [a["email"].lower() for a in ADMIN_ACCOUNTS]


class AdminService:
    """Service for admin operations."""

    def __init__(self):
        self.db_path = DB_PATH

    async def init_db(self) -> None:
        """Initialize the admin database tables."""
        async with aiosqlite.connect(self.db_path) as db:
            # Access requests table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS access_requests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    organization_name TEXT NOT NULL,
                    organization_type TEXT NOT NULL,
                    email TEXT NOT NULL,
                    country_code TEXT NOT NULL,
                    phone_number TEXT NOT NULL,
                    full_phone TEXT NOT NULL,
                    message TEXT NOT NULL,
                    contact_name TEXT,
                    status TEXT DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    approved_by TEXT,
                    approved_at TIMESTAMP,
                    institute_id TEXT,
                    rejection_reason TEXT
                )
            """)

            # Institutes table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS institutes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    institute_id TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    organization_type TEXT NOT NULL,
                    email TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    polygon_coordinates TEXT NOT NULL,
                    requires_password_change INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by TEXT NOT NULL,
                    access_request_id INTEGER,
                    FOREIGN KEY (access_request_id) REFERENCES access_requests(id)
                )
            """)

            await db.commit()
            print(f"Admin database initialized at {self.db_path}")

    # ==================== ADMIN AUTH ====================

    def verify_admin(self, email: str, password: str) -> bool:
        """Verify admin credentials."""
        for admin in ADMIN_ACCOUNTS:
            if admin["email"].lower() == email.lower() and admin["password"] == password:
                return True
        return False

    def is_admin_email(self, email: str) -> bool:
        """Check if email is an admin."""
        return email.lower() in ADMIN_EMAILS

    # ==================== ACCESS REQUESTS ====================

    async def create_access_request(self, data: AccessRequestCreate) -> int:
        """Create a new access request (organization signup)."""
        full_phone = f"{data.country_code}{data.phone_number}"

        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                """
                INSERT INTO access_requests
                (organization_name, organization_type, email, country_code, phone_number,
                 full_phone, message, contact_name, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
                """,
                (
                    data.organization_name,
                    data.organization_type,
                    data.email,
                    data.country_code,
                    data.phone_number,
                    full_phone,
                    data.message,
                    data.contact_name,
                ),
            )
            await db.commit()
            return cursor.lastrowid

    async def get_pending_requests(self) -> List[AccessRequest]:
        """Get all pending access requests."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                """
                SELECT * FROM access_requests
                WHERE status = 'pending'
                ORDER BY created_at DESC
                """
            )
            rows = await cursor.fetchall()
            return [self._row_to_access_request(row) for row in rows]

    async def get_all_requests(self) -> List[AccessRequest]:
        """Get all access requests."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT * FROM access_requests ORDER BY created_at DESC"
            )
            rows = await cursor.fetchall()
            return [self._row_to_access_request(row) for row in rows]

    async def get_request_by_id(self, request_id: int) -> Optional[AccessRequest]:
        """Get a specific access request."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT * FROM access_requests WHERE id = ?", (request_id,)
            )
            row = await cursor.fetchone()
            return self._row_to_access_request(row) if row else None

    def _row_to_access_request(self, row) -> AccessRequest:
        """Convert database row to AccessRequest model."""
        return AccessRequest(
            id=row["id"],
            organization_name=row["organization_name"],
            organization_type=row["organization_type"],
            email=row["email"],
            country_code=row["country_code"],
            phone_number=row["phone_number"],
            full_phone=row["full_phone"],
            message=row["message"],
            contact_name=row["contact_name"],
            status=AccessRequestStatus(row["status"]),
            created_at=datetime.fromisoformat(row["created_at"]) if row["created_at"] else datetime.now(),
            updated_at=datetime.fromisoformat(row["updated_at"]) if row["updated_at"] else datetime.now(),
            approved_by=row["approved_by"],
            approved_at=datetime.fromisoformat(row["approved_at"]) if row["approved_at"] else None,
            institute_id=row["institute_id"],
            rejection_reason=row["rejection_reason"],
        )

    # ==================== INSTITUTE MANAGEMENT ====================

    def generate_institute_id(self) -> str:
        """Generate unique institute ID (ORG-XXXXXX)."""
        chars = string.ascii_uppercase + string.digits
        suffix = "".join(secrets.choice(chars) for _ in range(6))
        return f"ORG-{suffix}"

    def generate_password(self, length: int = 12) -> str:
        """Generate secure random password."""
        chars = string.ascii_letters + string.digits + "!@#$%"
        return "".join(secrets.choice(chars) for _ in range(length))

    def hash_password(self, password: str) -> str:
        """Hash password using SHA-256 (simple hash for demo)."""
        # In production, use bcrypt or argon2
        return hashlib.sha256(password.encode()).hexdigest()

    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash."""
        return self.hash_password(password) == password_hash

    async def approve_request(self, data: ApproveRequestData) -> GeneratedCredentials:
        """Approve an access request and create institute."""
        # Get the request
        request = await self.get_request_by_id(data.request_id)
        if not request:
            raise ValueError("Access request not found")
        if request.status != AccessRequestStatus.PENDING:
            raise ValueError("Request is not pending")

        # Generate credentials
        institute_id = self.generate_institute_id()
        password = self.generate_password()
        password_hash = self.hash_password(password)

        # Convert polygon points to coordinates
        coordinates = [[p.lat, p.lng] for p in data.polygon_points]
        coordinates_json = json.dumps(coordinates)

        async with aiosqlite.connect(self.db_path) as db:
            # Create institute
            await db.execute(
                """
                INSERT INTO institutes
                (institute_id, name, organization_type, email, phone, password_hash,
                 polygon_coordinates, requires_password_change, created_by, access_request_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
                """,
                (
                    institute_id,
                    request.organization_name,
                    request.organization_type,
                    request.email,
                    request.full_phone,
                    password_hash,
                    coordinates_json,
                    data.admin_email,
                    data.request_id,
                ),
            )

            # Update request status
            await db.execute(
                """
                UPDATE access_requests
                SET status = 'approved', approved_by = ?, approved_at = ?,
                    institute_id = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    data.admin_email,
                    datetime.now().isoformat(),
                    institute_id,
                    datetime.now().isoformat(),
                    data.request_id,
                ),
            )

            await db.commit()

        login_url = os.environ.get("FRONTEND_URL", "http://localhost:8081") + "/institute/login"

        return GeneratedCredentials(
            institute_id=institute_id,
            password=password,
            login_url=login_url,
        )

    async def create_institute_direct(
        self, data: InstituteCreate, admin_email: str
    ) -> GeneratedCredentials:
        """Create institute directly (without access request)."""
        # Generate credentials
        institute_id = self.generate_institute_id()
        password = self.generate_password()
        password_hash = self.hash_password(password)

        # Convert polygon points to coordinates
        coordinates = [[p.lat, p.lng] for p in data.polygon_points]
        coordinates_json = json.dumps(coordinates)

        full_phone = f"{data.country_code}{data.phone_number}"

        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """
                INSERT INTO institutes
                (institute_id, name, organization_type, email, phone, password_hash,
                 polygon_coordinates, requires_password_change, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
                """,
                (
                    institute_id,
                    data.organization_name,
                    data.organization_type,
                    data.email,
                    full_phone,
                    password_hash,
                    coordinates_json,
                    admin_email,
                ),
            )
            await db.commit()

        login_url = os.environ.get("FRONTEND_URL", "http://localhost:8081") + "/institute/login"

        return GeneratedCredentials(
            institute_id=institute_id,
            password=password,
            login_url=login_url,
        )

    async def reject_request(self, data: RejectRequestData) -> None:
        """Reject an access request."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """
                UPDATE access_requests
                SET status = 'rejected', approved_by = ?, rejection_reason = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    data.admin_email,
                    data.reason,
                    datetime.now().isoformat(),
                    data.request_id,
                ),
            )
            await db.commit()

    async def get_all_institutes(self) -> List[Dict[str, Any]]:
        """Get all institutes."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT * FROM institutes ORDER BY created_at DESC"
            )
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def get_institute_by_id(self, institute_id: str) -> Optional[Dict[str, Any]]:
        """Get institute by institute_id."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT * FROM institutes WHERE institute_id = ?", (institute_id,)
            )
            row = await cursor.fetchone()
            return dict(row) if row else None

    # ==================== INSTITUTE AUTH ====================

    async def login_institute(self, institute_id: str, password: str) -> Dict[str, Any]:
        """Login institute and return session data."""
        institute = await self.get_institute_by_id(institute_id)
        if not institute:
            raise ValueError("Invalid credentials")

        if not self.verify_password(password, institute["password_hash"]):
            raise ValueError("Invalid credentials")

        return {
            "institute_id": institute["institute_id"],
            "name": institute["name"],
            "email": institute["email"],
            "requires_password_change": bool(institute["requires_password_change"]),
            "polygon_coordinates": eval(institute["polygon_coordinates"]),
        }

    async def change_institute_password(
        self, institute_id: str, current_password: str, new_password: str
    ) -> None:
        """Change institute password."""
        institute = await self.get_institute_by_id(institute_id)
        if not institute:
            raise ValueError("Institute not found")

        if not self.verify_password(current_password, institute["password_hash"]):
            raise ValueError("Current password is incorrect")

        new_hash = self.hash_password(new_password)

        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """
                UPDATE institutes
                SET password_hash = ?, requires_password_change = 0, updated_at = ?
                WHERE institute_id = ?
                """,
                (new_hash, datetime.now().isoformat(), institute_id),
            )
            await db.commit()

    # ==================== EMAIL ====================

    async def send_credentials_email(self, data: EmailData) -> bool:
        """
        Send credentials email.

        Uses EmailJS or similar service configured via environment variables.
        """
        # For now, just log and return success
        # In production, integrate with EmailJS, SendGrid, or Resend
        print(f"""
        ========== CREDENTIALS EMAIL ==========
        To: {data.to_email}
        Organization: {data.organization_name}

        Your Dashboard Access Credentials:
        -----------------------------------
        Institute ID: {data.institute_id}
        Password: {data.password}

        Login URL: {data.login_url}

        Please change your password on first login.
        =========================================
        """)

        # TODO: Implement actual email sending
        # emailjs_service_id = os.environ.get("EMAILJS_SERVICE_ID")
        # emailjs_template_id = os.environ.get("EMAILJS_TEMPLATE_ID")
        # emailjs_public_key = os.environ.get("EMAILJS_PUBLIC_KEY")

        return True

    # ==================== STATS ====================

    async def get_stats(self) -> Dict[str, Any]:
        """Get admin dashboard statistics."""
        async with aiosqlite.connect(self.db_path) as db:
            # Pending count
            cursor = await db.execute(
                "SELECT COUNT(*) FROM access_requests WHERE status = 'pending'"
            )
            pending_count = (await cursor.fetchone())[0]

            # Approved count
            cursor = await db.execute(
                "SELECT COUNT(*) FROM access_requests WHERE status = 'approved'"
            )
            approved_count = (await cursor.fetchone())[0]

            # Rejected count
            cursor = await db.execute(
                "SELECT COUNT(*) FROM access_requests WHERE status = 'rejected'"
            )
            rejected_count = (await cursor.fetchone())[0]

            # Total institutes
            cursor = await db.execute("SELECT COUNT(*) FROM institutes")
            institutes_count = (await cursor.fetchone())[0]

            return {
                "pending_requests": pending_count,
                "approved_requests": approved_count,
                "rejected_requests": rejected_count,
                "total_institutes": institutes_count,
            }


# Singleton instance
_admin_service: Optional[AdminService] = None


def get_admin_service() -> AdminService:
    """Get or create the admin service singleton."""
    global _admin_service
    if _admin_service is None:
        _admin_service = AdminService()
    return _admin_service
