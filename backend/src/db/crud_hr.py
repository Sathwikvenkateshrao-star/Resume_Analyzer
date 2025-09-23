from sqlalchemy.orm import Session
from src.db.models import HRUser
from src.utils.security import pwd_context

def get_hr_by_email(db: Session, email:str):
    return db.query(HRUser).filter(HRUser.email ==email).first()

def create_hr_user(db: Session,email:str , password:str):
    hashed_password = pwd_context.hash(password)
    db_user = HRUser(email=email, hashed_password = hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user