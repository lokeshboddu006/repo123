import logging
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from config import settings
from providers.manager import provider_manager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_service")

try:
    from services.indictrans_service import indic_trans_service
except ImportError as e:
    logger.error(f"Failed to import indic_trans_service: {e}")
    indic_trans_service = None

app = FastAPI(
    title="AI Service for Multilingual Communication Platform",
    description="Production-grade AI content generation microservice.",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ai-service"
    }

# --- Request / Response Schemas ---
class GenerateRequest(BaseModel):
    prompt: str
    language: str
    channel: str
    tone: Optional[str] = "formal"

class TranslateRequest(BaseModel):
    text: str
    source_language: str
    target_language: str

class PersonalizeRequest(BaseModel):
    template: str
    recipient_data: Dict[str, Any]

class SentimentRequest(BaseModel):
    text: str

class QualityRequest(BaseModel):
    text: str
    language: str

# --- API Endpoints ---
@app.post("/api/v1/generate")
@app.post("/generate")
def generate_content(req: GenerateRequest):
    # Validation
    if not req.prompt or not req.prompt.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Prompt must not be empty.")
    if not req.language or not req.language.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Language must not be empty.")
    if not req.channel or not req.channel.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Channel must not be empty.")

    tone = req.tone.strip() if req.tone and req.tone.strip() else "formal"

    try:
        result = provider_manager.generate_content(
            prompt=req.prompt.strip(),
            language=req.language.strip(),
            channel=req.channel.strip(),
            tone=tone
        )
        return result
    except Exception as e:
        logger.error(f"Generate endpoint error: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating content. Please try again."
        )

@app.post("/api/v1/translate")
@app.post("/translate")
def translate_content(req: TranslateRequest):
    if indic_trans_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Translation service is not initialized properly."
        )

    try:
        result = indic_trans_service.translate(
            text=req.text,
            source_language=req.source_language,
            target_language=req.target_language
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Translate endpoint error: {type(e).__name__} - {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during translation."
        )

@app.post("/api/v1/personalize")
def personalize_content(req: PersonalizeRequest):
    return {
        "status": "not_implemented",
        "message": "AI personalization service placeholder.",
        "input": req.dict()
    }

@app.post("/api/v1/sentiment")
def analyze_sentiment(req: SentimentRequest):
    return {
        "status": "not_implemented",
        "message": "AI sentiment analysis service placeholder.",
        "input": req.dict()
    }

@app.post("/api/v1/quality")
def check_quality(req: QualityRequest):
    return {
        "status": "not_implemented",
        "message": "AI quality check service placeholder.",
        "input": req.dict()
    }
