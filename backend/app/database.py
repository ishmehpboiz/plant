import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]

# NullPool-ish sizing: Vercel serverless functions are short-lived processes,
# so a large in-process pool just holds connections the pooler already manages.
engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=1, max_overflow=2)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
