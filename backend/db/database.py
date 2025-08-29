from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
)

sessionmaker = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = sessionmaker()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine)
    ensure_status_column()

def ensure_status_column():
    """
    Pastikan kolom 'status' ada di tabel transaksi. Jika belum ada, tambahkan otomatis.
    """
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('transaksi')]
    if 'status' not in columns:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE transaksi ADD COLUMN status VARCHAR(50) DEFAULT 'pending';"))
            conn.commit()