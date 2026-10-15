/**
 * Vercel Serverless Function - Chấm đáp án bằng Groq
 * Env: groqApiKey (bắt buộc), groqModel (tùy chọn)
 *
 * GET  /api/grade -> { enabled, model }
 * POST /api/grade { word, reference, answer, answerLanguage } -> { correct, feedback }
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';
const GROQ_TIMEOUT_MS = 12000;
const MAX_FIELD_LENGTH = 500;

const GRADER_SYSTEM_PROMPT = `You are a strict but fair grader for an English vocabulary app used by Vietnamese learners.
Always reply with a single JSON object and nothing else, in exactly this shape:
{"correct": true or false, "feedback": "one short sentence in Vietnamese"}`;

function getApiKey() {
    return (process.env.groqApiKey || '').trim();
}

function getModel() {
    return (process.env.groqModel || '').trim() || DEFAULT_GROQ_MODEL;
}

function buildGradingPrompt(word, reference, userAnswer, answerLanguage) {
    if (answerLanguage === 'vi') {
        return `The learner sees an English word or phrase and must type its meaning in Vietnamese.

English word: "${word}"
Reference Vietnamese meaning (for guidance only): "${reference}"
Learner's answer: "${userAnswer}"

Grading rules:
- Judge whether the learner's Vietnamese answer is a correct meaning of the English word itself. The reference is only a hint and may be incomplete; do not require the learner to match it.
- Accept synonyms, other valid senses of the word, different word order, and missing Vietnamese diacritics or small typos.
- Mark "correct" = false if the meaning is wrong, too vague, or belongs to a different word.
- "feedback" is ONE short sentence in Vietnamese: explain what is wrong, or praise briefly if correct. Do not reveal the reference meaning when the answer is wrong.`;
    }

    return `The learner sees an English word and must type its definition in English.

Word: "${word}"
Reference definition: "${reference}"
Learner's answer: "${userAnswer}"

Grading rules:
- Mark "correct" = true if the learner's answer conveys the same core meaning as the reference definition, even with different wording, synonyms, or minor grammar/spelling mistakes.
- If the reference definition lists several senses (separated by ";"), capturing the main sense is enough.
- Mark "correct" = false if the meaning is wrong, too vague, describes a different word, or misses the essential idea.
- "feedback" is ONE short sentence in Vietnamese: explain what is missing/wrong, or praise briefly if correct. Do not reveal the full reference definition when the answer is wrong.`;
}

/**
 * Lấy object JSON từ nội dung model trả về (một số model không hỗ trợ JSON mode)
 */
function parseGradingResult(text) {
    const match = String(text).match(/\{[\s\S]*\}/);
    if (!match) {
        throw new Error('Model không trả về JSON');
    }
    const result = JSON.parse(match[0]);
    return {
        correct: result.correct === true,
        feedback: String(result.feedback || '')
    };
}

function readStringField(body, name) {
    const value = body?.[name];
    if (typeof value !== 'string' || !value.trim()) {
        return null;
    }
    return value.trim().slice(0, MAX_FIELD_LENGTH);
}

async function callGroq(apiKey, model, messages) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

    const payload = { model, messages, temperature: 0 };
    if (!model.startsWith('groq/compound')) {
        payload.response_format = { type: 'json_object' };
    }

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
            const detail = data?.error?.message || '';
            const error = new Error(`Groq API lỗi ${response.status}${detail ? `: ${detail}` : ''}`);
            error.status = 502;
            throw error;
        }

        const text = data?.choices?.[0]?.message?.content;
        if (!text) {
            throw new Error('Groq không trả về kết quả');
        }
        return parseGradingResult(text);
    } catch (error) {
        if (error.name === 'AbortError') {
            const timeoutError = new Error('Groq phản hồi quá lâu');
            timeoutError.status = 504;
            throw timeoutError;
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

module.exports = async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    const apiKey = getApiKey();
    const model = getModel();

    if (req.method === 'GET') {
        return res.status(200).json({ enabled: Boolean(apiKey), model });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'GET, POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!apiKey) {
        return res.status(503).json({ error: 'Server chưa cấu hình biến môi trường groqApiKey' });
    }

    let body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (_) {
            body = null;
        }
    }

    const word = readStringField(body, 'word');
    const reference = readStringField(body, 'reference');
    const answer = readStringField(body, 'answer');
    const answerLanguage = body?.answerLanguage === 'vi' ? 'vi' : 'en';

    if (!word || !reference || !answer) {
        return res.status(400).json({ error: 'Thiếu word, reference hoặc answer' });
    }

    try {
        const result = await callGroq(apiKey, model, [
            { role: 'system', content: GRADER_SYSTEM_PROMPT },
            { role: 'user', content: buildGradingPrompt(word, reference, answer, answerLanguage) }
        ]);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Grade error:', error);
        return res.status(error.status || 500).json({ error: error.message || 'Lỗi không xác định' });
    }
};
