/**
 * AI Checker - Chấm đáp án qua Vercel Function /api/grade
 * API key nằm trong biến môi trường groqApiKey trên Vercel, không gửi xuống trình duyệt
 */

const GRADE_API_URL = '/api/grade';
const AI_REQUEST_TIMEOUT_MS = 15000;

const aiState = {
    enabled: false,
    model: ''
};

/**
 * Hỏi server xem AI có được cấu hình không
 * @returns {Promise<{enabled: boolean, model: string}>}
 */
async function initAIChecker() {
    try {
        const response = await fetch(GRADE_API_URL, { cache: 'no-store' });
        if (response.ok) {
            const data = await response.json();
            aiState.enabled = data.enabled === true;
            aiState.model = String(data.model || '');
        }
    } catch (error) {
        console.warn('Không kết nối được /api/grade:', error);
    }
    return { ...aiState };
}

function isAICheckEnabled() {
    return aiState.enabled;
}

function getAIModel() {
    return aiState.model;
}

/**
 * Gửi đáp án lên server để Groq chấm
 * @param {'en'|'vi'} answerLanguage - Ngôn ngữ user cần nhập
 * @returns {Promise<{correct: boolean, feedback: string}>}
 */
async function checkAnswerWithAI(word, reference, userAnswer, answerLanguage = 'en') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(GRADE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word, reference, answer: userAnswer, answerLanguage }),
            signal: controller.signal
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error(data?.error || `Server lỗi ${response.status}`);
        }

        return {
            correct: data?.correct === true,
            feedback: String(data?.feedback || '')
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('AI phản hồi quá lâu');
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

window.initAIChecker = initAIChecker;
window.isAICheckEnabled = isAICheckEnabled;
window.getAIModel = getAIModel;
window.checkAnswerWithAI = checkAnswerWithAI;
