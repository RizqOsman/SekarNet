from fastapi import APIRouter

from .endpoints import auth, users, packages, subscriptions, bills

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(packages.router, prefix="/packages", tags=["packages"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
api_router.include_router(bills.router, prefix="/bills", tags=["billing"])