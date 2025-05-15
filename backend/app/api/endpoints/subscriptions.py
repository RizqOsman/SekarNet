from typing import List, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...api.deps import get_db, get_current_active_user, get_current_admin, get_current_admin_or_technician
from ...models.user import User
from ...models.subscription import Subscription, SubscriptionStatus
from ...schemas.subscription import (
    Subscription as SubscriptionSchema,
    SubscriptionDetail,
    SubscriptionCreate,
    SubscriptionUpdate
)

router = APIRouter()


@router.get("/", response_model=List[SubscriptionSchema])
def read_subscriptions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Retrieve all subscriptions. Admin only.
    """
    subscriptions = db.query(Subscription).offset(skip).limit(limit).all()
    return subscriptions


@router.get("/me", response_model=List[SubscriptionSchema])
def read_my_subscriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve current user's subscriptions.
    """
    subscriptions = db.query(Subscription).filter(Subscription.user_id == current_user.id).all()
    return subscriptions


@router.post("/", response_model=SubscriptionSchema)
def create_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_in: SubscriptionCreate,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Create new subscription. Admin only.
    """
    # Calculate next payment date based on billing cycle
    next_payment_date = None
    if subscription_in.start_date:
        billing_day = subscription_in.billing_day
        
        # If start date is provided, calculate next payment date
        if subscription_in.billing_cycle == "monthly":
            # Set to the billing day of next month
            next_month = subscription_in.start_date.replace(
                day=1, 
                month=subscription_in.start_date.month + 1 if subscription_in.start_date.month < 12 else 1,
                year=subscription_in.start_date.year if subscription_in.start_date.month < 12 else subscription_in.start_date.year + 1
            )
            
            # Adjust for billing day (handle month length variations)
            import calendar
            _, last_day = calendar.monthrange(next_month.year, next_month.month)
            actual_billing_day = min(billing_day, last_day)
            next_payment_date = next_month.replace(day=actual_billing_day)
            
        elif subscription_in.billing_cycle == "quarterly":
            # Set to the billing day 3 months ahead
            month = subscription_in.start_date.month + 3
            year = subscription_in.start_date.year
            
            if month > 12:
                month = month - 12
                year += 1
                
            next_month = subscription_in.start_date.replace(
                day=1,
                month=month,
                year=year
            )
            
            # Adjust for billing day
            import calendar
            _, last_day = calendar.monthrange(next_month.year, next_month.month)
            actual_billing_day = min(billing_day, last_day)
            next_payment_date = next_month.replace(day=actual_billing_day)
            
        elif subscription_in.billing_cycle == "yearly":
            # Set to the billing day in the same month next year
            next_year = subscription_in.start_date.replace(
                year=subscription_in.start_date.year + 1
            )
            
            # Adjust for Feb 29 in leap years
            if subscription_in.start_date.month == 2 and subscription_in.start_date.day == 29:
                import calendar
                if not calendar.isleap(next_year.year):
                    next_year = next_year.replace(day=28)
                    
            next_payment_date = next_year
    
    # Create subscription
    subscription = Subscription(
        user_id=subscription_in.user_id,
        package_id=subscription_in.package_id,
        status=subscription_in.status,
        start_date=subscription_in.start_date,
        end_date=subscription_in.end_date,
        auto_renew=subscription_in.auto_renew,
        ip_address=subscription_in.ip_address,
        mac_address=subscription_in.mac_address,
        billing_cycle=subscription_in.billing_cycle,
        billing_day=subscription_in.billing_day,
        next_payment_date=next_payment_date,
        notes=subscription_in.notes
    )
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


@router.get("/{subscription_id}", response_model=SubscriptionDetail)
def read_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get subscription by ID.
    """
    subscription = (
        db.query(Subscription)
        .filter(Subscription.id == subscription_id)
        .first()
    )
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )
    
    # Check permissions: users can only see their own subscriptions, admins can see all
    if subscription.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
        
    return subscription


@router.put("/{subscription_id}", response_model=SubscriptionSchema)
def update_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_id: int,
    subscription_in: SubscriptionUpdate,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Update a subscription. Admin only.
    """
    subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )
    
    # Update subscription fields if provided in the input
    if subscription_in.status:
        subscription.status = subscription_in.status
    if subscription_in.start_date:
        subscription.start_date = subscription_in.start_date
    if subscription_in.end_date:
        subscription.end_date = subscription_in.end_date
    if subscription_in.auto_renew is not None:
        subscription.auto_renew = subscription_in.auto_renew
    if subscription_in.ip_address:
        subscription.ip_address = subscription_in.ip_address
    if subscription_in.mac_address:
        subscription.mac_address = subscription_in.mac_address
    if subscription_in.billing_cycle:
        subscription.billing_cycle = subscription_in.billing_cycle
    if subscription_in.billing_day:
        subscription.billing_day = subscription_in.billing_day
    if subscription_in.notes:
        subscription.notes = subscription_in.notes
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


@router.put("/{subscription_id}/suspend", response_model=SubscriptionSchema)
def suspend_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_id: int,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Suspend a subscription. Admin only.
    """
    subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )
    
    subscription.status = SubscriptionStatus.SUSPENDED
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


@router.put("/{subscription_id}/activate", response_model=SubscriptionSchema)
def activate_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_id: int,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Activate a subscription. Admin only.
    """
    subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )
    
    subscription.status = SubscriptionStatus.ACTIVE
    if not subscription.start_date:
        subscription.start_date = datetime.now()
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


@router.put("/{subscription_id}/cancel", response_model=SubscriptionSchema)
def cancel_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Cancel a subscription. User can cancel their own, admin can cancel any.
    """
    subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )
    
    # Check permissions
    if subscription.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    subscription.status = SubscriptionStatus.CANCELLED
    subscription.auto_renew = False
    
    # Set end date to end of current billing period if not already set
    if not subscription.end_date and subscription.next_payment_date:
        subscription.end_date = subscription.next_payment_date
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription