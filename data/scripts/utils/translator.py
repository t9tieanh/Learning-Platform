import os
import deepl
from .env_loader import load_env

load_env()

DEEPL_API_KEY = os.getenv('DEEPL_API_KEY') or os.getenv('DEEPL_AUTH_KEY')
_translator = None
_translation_cache = {}

def get_translator():
    global _translator
    if _translator is not None:
        return _translator

    if not DEEPL_API_KEY:
        return None

    try:
        _translator = deepl.Translator(DEEPL_API_KEY)
    except Exception as e:
        print(f"Warning: Could not initialize Deepl translator: {e}")
        _translator = None

    return _translator

def translate_to_vietnamese(text):
    """Translates text to Vietnamese with caching."""
    if not text:
        return ''

    normalized = text.strip()
    if not normalized:
        return ''

    if normalized in _translation_cache:
        return _translation_cache[normalized]

    translator = get_translator()
    if not translator:
        return normalized

    try:
        # Use target_lang='VI' for Vietnamese
        result = translator.translate_text(normalized, target_lang='VI')
        translated_text = result.text.strip()
        if not translated_text:
            translated_text = normalized
    except Exception as e:
        print(f"Warning: Deepl translation failed: {e}")
        translated_text = normalized

    _translation_cache[normalized] = translated_text
    return translated_text
