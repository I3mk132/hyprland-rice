from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.routers import appointments, auth, departments, doctors, schedules, users

# Import models so they're registered on Base.metadata before create_all()
from app import models  # noqa: F401

app = FastAPI(
    title=settings.APP_NAME,
    description="REST API for a medical clinic appointment booking portal.",
    version="1.0.0",
)

# تعريف قائمة المصادر (Origins) المسموح لها بالاتصال بالـ API
origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    # في بيئة التطوير (Development) تقدر تستخدم "*" للسماح لجميع المصادر مؤقتاً:
    # "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # السماح لبورت الفرونت إند
    allow_credentials=True,       # السماح بمرور الكوكيز ورموز المصادقة (Tokens)
    allow_methods=["*"],          # السماح بجميع الميثودز (GET, POST, OPTIONS, إلخ)
    allow_headers=["*"],          # السماح بجميع الـ Headers (مثل Authorization و Content-Type)
)


@app.on_event("startup")
def on_startup():
    # For local/dev use. For production, prefer proper migrations (e.g. Alembic).
    Base.metadata.create_all(bind=engine)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}


app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(departments.router, prefix=settings.API_V1_PREFIX)
app.include_router(doctors.router, prefix=settings.API_V1_PREFIX)
app.include_router(schedules.router, prefix=settings.API_V1_PREFIX)
app.include_router(appointments.router, prefix=settings.API_V1_PREFIX)
