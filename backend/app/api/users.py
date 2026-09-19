from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pwdlib import PasswordHash

from app.db.dependencies import get_db
from app.models.user import User


router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)


password_hash = PasswordHash.recommended()


# ============================================================
# REGISTER USER
# ============================================================

@router.post("/register")
def register_user(
    full_name: str,
    email: str,
    mobile: str,
    password: str,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Check existing email
    # --------------------------------------------------------

    existing_email = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # --------------------------------------------------------
    # Check existing mobile
    # --------------------------------------------------------

    existing_mobile = (
        db.query(User)
        .filter(User.mobile == mobile)
        .first()
    )

    if existing_mobile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number already registered",
        )

    # --------------------------------------------------------
    # Hash password
    # --------------------------------------------------------

    hashed_password = password_hash.hash(password)

    # --------------------------------------------------------
    # Create user
    # --------------------------------------------------------

    user = User(
        full_name=full_name,
        email=email,
        mobile=mobile,
        password_hash=hashed_password,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        "success": True,
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "fullName": user.full_name,
            "email": user.email,
            "mobile": user.mobile,
        },
    }


# ============================================================
# LOGIN USER
# ============================================================

@router.post("/login")
def login_user(
    email: str,
    password: str,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Find user by email
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    # --------------------------------------------------------
    # User not found
    # --------------------------------------------------------

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # --------------------------------------------------------
    # Verify password against Argon2 hash
    # --------------------------------------------------------

    password_valid = password_hash.verify(
        password,
        user.password_hash,
    )

    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # --------------------------------------------------------
    # Login successful
    # --------------------------------------------------------

    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user.id,
            "fullName": user.full_name,
            "email": user.email,
            "mobile": user.mobile,
        },
    }