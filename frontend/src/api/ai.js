import api from './axios';

export const generateContent = async ({ prompt, language, channel, tone, length = 'standard' }) => {
    // Length guidance can be embedded into prompt for real provider influence
    let lengthDirective = "";
    if (length === 'brief') {
        lengthDirective = " [LENGTH DIRECTIVE: Keep output very brief, concise, and punchy (1-2 sentences max).]";
    } else if (length === 'detailed') {
        lengthDirective = " [LENGTH DIRECTIVE: Provide a detailed, comprehensive public announcement with clear instructions, helpful background context, and actionable bullet points.]";
    } else {
        lengthDirective = " [LENGTH DIRECTIVE: Standard clear public communication length, 3-4 sentences.]";
    }

    const response = await api.post('/ai/generate/', {
        prompt: prompt + lengthDirective,
        language,
        channel,
        tone
    });
    return response.data;
};

export const translateContent = async ({ text, sourceLanguage = 'English', targetLanguage }) => {
    const response = await api.post('/ai/translate/', {
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage
    });
    return response.data;
};

export const checkAiHealth = async () => {
    try {
        const response = await api.get('/health/');
        if (response.status === 200) {
            return true;
        }
        return false;
    } catch {
        return false;
    }
};
