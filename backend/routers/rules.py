from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import crud
import schemas
import database
from routers.auth import get_current_user
from models import User

router = APIRouter()


@router.get("/", response_model=List[schemas.Rule])
def read_rules(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    rules = crud.get_rules(db, user_id=current_user.id)
    return rules


@router.post("/", response_model=schemas.Rule)
def create_rule(
    rule: schemas.RuleCreate,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.create_rule(db=db, rule=rule, user_id=current_user.id)


@router.put("/{rule_id}", response_model=schemas.Rule)
def update_rule(
    rule_id: int,
    rule_update: schemas.RuleUpdate,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    updated = crud.update_rule(
        db=db, rule_id=rule_id, rule_update=rule_update, user_id=current_user.id
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Rule not found")
    return updated


@router.delete("/{rule_id}")
def delete_rule(
    rule_id: int,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    success = crud.delete_rule(db=db, rule_id=rule_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"ok": True}
