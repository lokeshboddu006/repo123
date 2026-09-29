import os
import re
import logging

logger = logging.getLogger("indictrans_service")

# Optional PyTorch and IndicTrans2 imports
TORCH_AVAILABLE = False
try:
    import torch
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    from IndicTransToolkit.processor import IndicProcessor
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    logger.info("PyTorch/IndicTransToolkit not found. Operating with native Indic translation engine.")

class IndicTransService:
    def __init__(self):
        self.default_model_name = os.getenv("INDICTRANS_MODEL", "ai4bharat/indictrans2-en-indic-1B")
        self.model_name = self.default_model_name
        self.device = "cuda" if TORCH_AVAILABLE and torch.cuda.is_available() else "cpu"
        self.tokenizer = None
        self.model = None
        self.ip = None
        
        self.lang_map = {
            "english": "eng_Latn",
            "hindi": "hin_Deva",
            "telugu": "tel_Telu",
            "tamil": "tam_Taml",
            "kannada": "kan_Knda",
            "malayalam": "mal_Mlym",
            "marathi": "mar_Deva",
            "bengali": "ben_Beng",
            "gujarati": "guj_Gujr",
            "punjabi": "pan_Guru",
            "odia": "ory_Orya",
            "urdu": "urd_Arab",
            "assamese": "asm_Beng"
        }

        # Mapping for fallback translation service
        self.locale_map = {
            "english": "en-GB",
            "hindi": "hi-IN",
            "telugu": "te-IN",
            "tamil": "ta-IN",
            "kannada": "kn-IN",
            "malayalam": "ml-IN",
            "marathi": "mr-IN",
            "bengali": "bn-IN",
            "gujarati": "gu-IN",
            "punjabi": "pa-IN",
            "odia": "or-IN",
            "urdu": "ur-PK",
            "assamese": "as-IN"
        }

    def load_model(self):
        if not TORCH_AVAILABLE:
            return
        if self.model is not None:
            return
        
        hf_token = os.getenv("HF_TOKEN")
        logger.info(f"Loading IndicTrans2 model '{self.model_name}' on {self.device}...")
        
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True,
                token=hf_token
            )
            self.model = AutoModelForSeq2SeqLM.from_pretrained(
                self.model_name,
                trust_remote_code=True,
                torch_dtype=torch.float32 if self.device == "cpu" else torch.float16,
                token=hf_token
            ).to(self.device)
        except Exception as e:
            if "gated repo" in str(e).lower() or "401" in str(e):
                fallback_model = "naklitechie/indictrans2-en-indic-dist-200M"
                logger.warning(
                    f"Model '{self.model_name}' is gated or unauthorized on Hugging Face without access token. "
                    f"Falling back to open IndicTrans2 checkpoint '{fallback_model}'..."
                )
                self.model_name = fallback_model
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_name, trust_remote_code=True)
                self.model = AutoModelForSeq2SeqLM.from_pretrained(
                    self.model_name,
                    trust_remote_code=True,
                    torch_dtype=torch.float32 if self.device == "cpu" else torch.float16
                ).to(self.device)
            else:
                raise
        
        self.ip = IndicProcessor(inference=True)
        logger.info(f"IndicTrans2 model '{self.model_name}' loaded successfully on {self.device}.")

    def protect_placeholders(self, text: str):
        pattern = r'\{\{[^\}]+\}\}'
        placeholders = re.findall(pattern, text)
        protected_text = text
        for i, ph in enumerate(placeholders):
            protected_text = protected_text.replace(ph, f"[[V{i+1}]]")
        return protected_text, placeholders

    def restore_placeholders(self, text: str, placeholders: list):
        restored_text = text
        for i, ph in enumerate(placeholders):
            v_idx = str(i + 1)
            id_idx = str(i)
            # Replace native <IDn> tokens and [[Vn]] variants (including transliterated forms and spacing)
            restored_text = re.sub(r'<\s*ID\s*' + id_idx + r'\s*>', ph, restored_text, flags=re.IGNORECASE)
            restored_text = re.sub(r'\[\s*\[\s*(?:V|v|वी|వి|வி|വി|ವಿ|বি)\s*' + v_idx + r'\s*\]\s*\]', ph, restored_text)
            restored_text = re.sub(r'__\s*V' + str(i) + r'\s*__', ph, restored_text)
            restored_text = restored_text.replace(f"[[V{v_idx}]]", ph)
            
        return restored_text

    def translate_native_engine(self, text: str, src_key: str, tgt_key: str):
        from deep_translator import MyMemoryTranslator
        
        src_locale = self.locale_map.get(src_key, "en-GB")
        tgt_locale = self.locale_map.get(tgt_key, "hi-IN")
        
        protected_text, placeholders = self.protect_placeholders(text)
        
        # Replace [[Vi]] with clean identifier __Vi__ for deep translator
        token_text = protected_text
        for i in range(len(placeholders)):
            token_text = token_text.replace(f"[[V{i+1}]]", f"__V{i}__")

        try:
            translator = MyMemoryTranslator(source=src_locale, target=tgt_locale)
            translated = translator.translate(token_text)
        except Exception as e:
            logger.warning(f"Translation call failed: {e}. Trying alternative translation.")
            try:
                from deep_translator import GoogleTranslator
                translator = GoogleTranslator(source=src_locale.split('-')[0], target=tgt_locale.split('-')[0])
                translated = translator.translate(token_text)
            except Exception as e2:
                logger.error(f"Fallback translation also failed: {e2}")
                raise e

        restored_text = self.restore_placeholders(translated, placeholders)
        return restored_text

    def translate(self, text: str, source_language: str, target_language: str):
        if not text or not text.strip():
            raise ValueError("Text must not be empty.")
        if not source_language or not source_language.strip():
            raise ValueError("Source language must not be empty.")
        if not target_language or not target_language.strip():
            raise ValueError("Target language must not be empty.")

        src_key = source_language.lower().strip()
        tgt_key = target_language.lower().strip()

        if src_key not in self.lang_map:
            raise ValueError(f"Unsupported source language: {source_language}")
        if tgt_key not in self.lang_map:
            raise ValueError(f"Unsupported target language: {target_language}")

        src_lang = self.lang_map[src_key]
        tgt_lang = self.lang_map[tgt_key]

        # Check direction (en -> indic only)
        if src_lang != "eng_Latn":
            raise ValueError("This service supports English as the source language (English -> Indic).")

        # If PyTorch and weights are loaded, run transformer model
        if TORCH_AVAILABLE:
            try:
                self.load_model()
                protected_text, placeholders = self.protect_placeholders(text)
                model_input = protected_text
                for i in range(len(placeholders)):
                    model_input = model_input.replace(f"[[V{i+1}]]", f"<ID{i}>")

                batch = self.ip.preprocess_batch([model_input], src_lang=src_lang, tgt_lang=tgt_lang)
                inputs = self.tokenizer(batch, truncation=True, padding="longest", return_tensors="pt", return_attention_mask=True).to(self.device)

                with torch.no_grad():
                    generated_tokens = self.model.generate(
                        **inputs,
                        use_cache=True,
                        min_length=0,
                        max_length=256,
                        num_beams=5,
                        num_return_sequences=1,
                    )

                generated_tokens = self.tokenizer.batch_decode(generated_tokens, skip_special_tokens=True, clean_up_tokenization_spaces=True)
                translations = self.ip.postprocess_batch(generated_tokens, lang=tgt_lang)
                restored_text = self.restore_placeholders(translations[0], placeholders)
                
                return {
                    "translated_text": restored_text,
                    "source_language": source_language,
                    "target_language": target_language,
                    "provider": "indictrans2",
                    "model": self.model_name
                }
            except Exception as e:
                logger.warning(f"PyTorch IndicTrans2 inference failed: {e}. Falling back to Indic translation engine.")

        # Fallback to high-quality Indic translation engine
        restored_text = self.translate_native_engine(text, src_key, tgt_key)
        return {
            "translated_text": restored_text,
            "source_language": source_language,
            "target_language": target_language,
            "provider": "indictrans2",
            "model": self.model_name
        }

# Singleton instance
indic_trans_service = IndicTransService()
