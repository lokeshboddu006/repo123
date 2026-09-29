from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from api.services.ai_client import AIClient, AIServiceUnavailable

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint: GET /api/v1/health/
    """
    return Response({"status": "ok"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_generate(request):
    """
    AI Generate endpoint: POST /api/v1/ai/generate/
    """
    prompt = request.data.get("prompt")
    language = request.data.get("language")
    channel = request.data.get("channel")
    tone = request.data.get("tone", "formal")

    if not prompt or not str(prompt).strip():
        return Response({"error": "Prompt is required."}, status=status.HTTP_400_BAD_REQUEST)
    if not language or not str(language).strip():
        return Response({"error": "Language is required."}, status=status.HTTP_400_BAD_REQUEST)
    if not channel or not str(channel).strip():
        return Response({"error": "Channel is required."}, status=status.HTTP_400_BAD_REQUEST)
        
    supported_channels = ["SMS", "EMAIL", "WHATSAPP", "PUSH", "WEB"]
    if channel.upper() not in supported_channels:
        return Response({"error": f"Unsupported channel. Supported channels: {', '.join(supported_channels)}"}, status=status.HTTP_400_BAD_REQUEST)
        
    client = AIClient()
    try:
        result = client.generate_content(
            prompt=prompt,
            language=language,
            channel=channel.upper(),
            tone=tone
        )
        return Response(result, status=status.HTTP_200_OK)
    except AIServiceUnavailable as e:
        return Response(
            {"status": "error", "message": str(e)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_translate(request):
    """
    AI Translate endpoint: POST /api/v1/ai/translate/
    Translates text to Indic languages using IndicTrans2 service.
    """
    text = request.data.get("text")
    source_language = request.data.get("source_language", "English")
    target_language = request.data.get("target_language")

    if not text or not str(text).strip():
        return Response({"error": "Text is required."}, status=status.HTTP_400_BAD_REQUEST)
    if not target_language or not str(target_language).strip():
        return Response({"error": "Target language is required."}, status=status.HTTP_400_BAD_REQUEST)

    client = AIClient()
    try:
        result = client.translate_content(
            text=text.strip(),
            source_language=source_language.strip(),
            target_language=target_language.strip()
        )
        return Response(result, status=status.HTTP_200_OK)
    except AIServiceUnavailable as e:
        return Response(
            {"status": "error", "message": str(e)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

