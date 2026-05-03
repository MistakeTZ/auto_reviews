from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    wb_api_token = Column(String, nullable=True)

    rules = relationship("Rule", back_populates="owner")
    reviews = relationship("Review", back_populates="owner")

class Rule(Base):
    __tablename__ = "rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    target = Column(String)  # 'general' or 'specific_nm'
    nm_id = Column(String, nullable=True)
    condition_rating_operator = Column(String) # 'exact', 'less_than', 'more_than'
    condition_rating = Column(Integer, nullable=True)
    condition_keyword = Column(String, nullable=True)
    action_text = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="rules")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    wb_review_id = Column(String, index=True)
    nm_id = Column(String)
    product_name = Column(String)
    rating = Column(Integer)
    text = Column(String)
    date = Column(String)
    status = Column(String, default="pending") # 'pending', 'auto-answered', 'manual-review'
    auto_answer_text = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="reviews")
