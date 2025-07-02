/**
 * Practice Word Module JavaScript
 * Quản lý tính năng luyện tập từ vựng
 */

// === GLOBAL VARIABLES === //
let wordList = [];
let currentWordIndex = 0;
let practiceMode = 0; // 1: EN -> VI, 2: VI -> EN
let correctAnswers = 0;
let skippedWords = 0;

// Kiểm tra và load data từ vocabulary module
document.addEventListener('DOMContentLoaded', function() {
    checkForVocabularyData();
});

/**
 * Kiểm tra và load data từ vocabulary module nếu có
 */
function checkForVocabularyData() {
    const practiceWords = localStorage.getItem('practiceWords');
    const practiceSource = localStorage.getItem('practiceSource');
    
    if (practiceWords && practiceSource === 'vocabulary') {
        try {
            const words = JSON.parse(practiceWords);
            if (words && words.length > 0) {
                console.log(`Đã nhận ${words.length} từ vựng từ Vocabulary module:`, words);
                
                // Tự động điền vào textarea
                const wordListTextarea = document.getElementById('wordList');
                if (wordListTextarea) {
                    const formattedText = words.map(word => 
                        `${word.english} : ${word.vietnamese}`
                    ).join('\n');
                    wordListTextarea.value = formattedText;
                    
                    // Hiển thị thông báo
                    setTimeout(() => {
                        showAlert(`Đã tải ${words.length} từ vựng từ Vocabulary module! Nhấn "Bắt đầu" để tiếp tục.`, 'success');
                    }, 500);
                }
                
                // Xóa data khỏi localStorage để tránh conflict
                localStorage.removeItem('practiceWords');
                localStorage.removeItem('practiceSource');
            }
        } catch (error) {
            console.error('Error loading vocabulary data:', error);
            localStorage.removeItem('practiceWords');
            localStorage.removeItem('practiceSource');
        }
    }
}

// === UTILITY FUNCTIONS === //

/**
 * Chuyển đổi text input thành array object
 * @param {string} text - Text từ textarea
 * @returns {Array} - Array các object word
 */
function convertTextToWordArray(text) {
    const lines = text.trim().split('\n').filter(line => line.trim());
    return lines.map(line => {
        const parts = line.split(':').map(item => item.trim());
        if (parts.length >= 2) {
            return {
                english: parts[0],
                vietnamese: parts.slice(1).join(':') // Cho phép dấu : trong nghĩa tiếng Việt
            };
        }
        return null;
    }).filter(word => word !== null);
}

/**
 * Trộn ngẫu nhiên array
 * @param {Array} array - Array cần trộn
 * @returns {Array} - Array đã được trộn
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Normalize text để so sánh (bỏ dấu, viết thường, trim)
 * @param {string} text - Text cần normalize
 * @returns {string} - Text đã normalize
 */
function normalizeText(text) {
    return text
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
        .replace(/đ/g, "d")
        .replace(/[^\w\s]/g, "") // Bỏ dấu câu
        .replace(/\s+/g, " "); // Normalize khoảng trắng
}

// === SECTION MANAGEMENT === //

/**
 * Hiển thị section cụ thể và ẩn các section khác
 * @param {string} sectionId - ID của section cần hiển thị
 */
function showSection(sectionId) {
    const sections = [
        'wordInputSection',
        'modeSelectionSection', 
        'practiceSection',
        'completionSection'
    ];
    
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = id === sectionId ? 'block' : 'none';
        }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Thêm hiệu ứng chuyển section mượt mà
 * @param {string} sectionId - ID section mới
 */
function transitionToSection(sectionId) {
    // Fade out current section
    const currentSection = document.querySelector('.section-card[style*="block"], .section-card:not([style*="none"])');
    if (currentSection) {
        currentSection.style.opacity = '0';
        currentSection.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            showSection(sectionId);
            
            // Fade in new section
            const newSection = document.getElementById(sectionId);
            if (newSection) {
                newSection.style.opacity = '0';
                newSection.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    newSection.style.transition = 'all 0.5s ease';
                    newSection.style.opacity = '1';
                    newSection.style.transform = 'translateY(0)';
                }, 50);
            }
        }, 300);
    } else {
        showSection(sectionId);
    }
}

// === STEP 1: WORD INPUT === //

/**
 * Xử lý danh sách từ vựng từ input
 */
function processWordList() {
    const input = document.getElementById('wordList').value;
    
    if (!input.trim()) {
        showAlert('Vui lòng nhập danh sách từ vựng!', 'warning');
        return;
    }
    
    const words = convertTextToWordArray(input);
    
    if (words.length === 0) {
        showAlert('Không tìm thấy từ vựng hợp lệ! Vui lòng kiểm tra định dạng: English : Definition', 'error');
        return;
    }
    
    if (words.length < 3) {
        showAlert('Vui lòng nhập ít nhất 3 từ vựng để bắt đầu luyện tập!', 'warning');
        return;
    }
    
    // Lưu và trộn danh sách từ
    wordList = shuffleArray(words);
    console.log(`Đã tải ${wordList.length} từ vựng:`, wordList);
    
    // Bỏ qua step chọn mode, chuyển thẳng sang practice
    startDirectPractice();
}

// === STEP 2: DIRECT PRACTICE (SKIP MODE SELECTION) === //

/**
 * Bắt đầu luyện tập trực tiếp (bỏ qua chọn mode)
 */
function startDirectPractice() {
    // Reset các biến đếm
    currentWordIndex = 0;
    correctAnswers = 0;
    skippedWords = 0;
    
    console.log('Bắt đầu luyện tập trực tiếp - English Word → Definition');
    
    // Chuyển thẳng sang practice section
    transitionToSection('practiceSection');
    startPractice();
}

/**
 * Chọn chế độ luyện tập (deprecated - giữ lại để tương thích)
 * @param {number} mode - 1: EN->VI, 2: VI->EN
 */
function selectMode(mode) {
    startDirectPractice();
}

// === STEP 3: PRACTICE SESSION === //

/**
 * Bắt đầu phiên luyện tập
 */
function startPractice() {
    updateProgress();
    displayCurrentWord();
    
    // Focus vào input answer
    setTimeout(() => {
        const answerInput = document.getElementById('wordType');
        if (answerInput) {
            answerInput.focus();
        }
    }, 500);
}

/**
 * Cập nhật thanh progress
 */
function updateProgress() {
    const progressText = document.getElementById('progressText');
    const progressFill = document.getElementById('progressFill');
    
    if (progressText) {
        progressText.textContent = `Câu ${currentWordIndex + 1} / ${wordList.length}`;
    }
    
    if (progressFill) {
        const percentage = ((currentWordIndex + 1) / wordList.length) * 100;
        progressFill.style.width = `${percentage}%`;
    }
}

/**
 * Hiển thị từ hiện tại
 */
function displayCurrentWord() {
    if (currentWordIndex >= wordList.length) {
        showCompletionScreen();
        return;
    }
    
    const wordInput = document.getElementById('wordInput');
    const currentWord = wordList[currentWordIndex];
    
    if (wordInput && currentWord) {
        // Luôn hiển thị English word
        wordInput.value = currentWord.english;
        wordInput.setAttribute('placeholder', 'English word displayed here');
    }
    
    // Clear answer input và focus vào đó
    const answerInput = document.getElementById('wordType');
    if (answerInput) {
        answerInput.value = '';
        answerInput.setAttribute('placeholder', 'Enter the definition in English...');
        answerInput.focus();
        
        // Add Enter key support
        answerInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        };
    }
    
    // Reset buttons
    resetPracticeButtons();
    hideWarning();
}

/**
 * Kiểm tra đáp án
 */
function checkAnswer() {
    const answerInput = document.getElementById('wordType');
    const userAnswer = answerInput.value.trim();
    
    if (!userAnswer) {
        showAlert('Please enter a definition!', 'warning');
        return;
    }
    
    const currentWord = wordList[currentWordIndex];
    // Luôn so sánh với definition (vietnamese field chứa definition tiếng Anh)
    const correctAnswer = currentWord.vietnamese;
    
    // Normalize để so sánh (toLowerCase + trim spaces)
    const normalizedUser = userAnswer.toLowerCase().trim().replace(/\s+/g, ' ');
    const normalizedCorrect = correctAnswer.toLowerCase().trim().replace(/\s+/g, ' ');
    
    console.log('User answer:', normalizedUser);
    console.log('Correct answer:', normalizedCorrect);
    console.log('Match:', normalizedUser === normalizedCorrect);
    
    if (normalizedUser === normalizedCorrect) {
        // Đáp án đúng
        correctAnswers++;
        showAlert('Correct! 🎉', 'success');
        setTimeout(() => {
            nextWord();
        }, 1000);
    } else {
        // Đáp án sai
        showWarning();
        showRetryButtons();
    }
}

/**
 * Chuyển sang từ tiếp theo
 */
function nextWord() {
    currentWordIndex++;
    updateProgress();
    
    if (currentWordIndex >= wordList.length) {
        showCompletionScreen();
    } else {
        setTimeout(() => {
            displayCurrentWord();
        }, 300);
    }
}

/**
 * Thử lại từ hiện tại
 */
function tryAgain() {
    hideWarning();
    resetPracticeButtons();
    
    // Focus vào input
    const answerInput = document.getElementById('wordType');
    if (answerInput) {
        answerInput.focus();
        answerInput.select(); // Select text để user có thể gõ lại
    }
}

/**
 * Bỏ qua từ hiện tại
 */
function skipWord() {
    skippedWords++;
    
    // Hiển thị đáp án đúng trong 3 giây
    const answerInput = document.getElementById('wordType');
    const currentWord = wordList[currentWordIndex];
    const correctAnswer = currentWord.vietnamese; // Definition
    
    if (answerInput) {
        answerInput.value = `✓ ${correctAnswer}`;
        answerInput.style.background = '#d4edda';
        answerInput.style.color = '#155724';
        answerInput.style.borderColor = '#c3e6cb';
    }
    
    setTimeout(() => {
        if (answerInput) {
            answerInput.style.background = '';
            answerInput.style.color = '';
            answerInput.style.borderColor = '';
        }
        nextWord();
    }, 3000);
}

// === UI HELPERS === //

/**
 * Hiển thị warning message
 */
function showWarning() {
    const warningMessage = document.getElementById('warningMessage');
    if (warningMessage) {
        warningMessage.style.display = 'flex';
        warningMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Ẩn warning message
 */
function hideWarning() {
    const warningMessage = document.getElementById('warningMessage');
    if (warningMessage) {
        warningMessage.style.display = 'none';
    }
}

/**
 * Hiển thị nút thử lại và bỏ qua
 */
function showRetryButtons() {
    const nextBtn = document.getElementById('nextWordBtn');
    const tryAgainBtn = document.getElementById('tryAgainBtn');
    const skipBtn = document.getElementById('skipBtn');
    
    if (nextBtn) nextBtn.style.display = 'none';
    if (tryAgainBtn) tryAgainBtn.style.display = 'inline-flex';
    if (skipBtn) skipBtn.style.display = 'inline-flex';
}

/**
 * Reset về trạng thái button ban đầu
 */
function resetPracticeButtons() {
    const nextBtn = document.getElementById('nextWordBtn');
    const tryAgainBtn = document.getElementById('tryAgainBtn');
    const skipBtn = document.getElementById('skipBtn');
    
    if (nextBtn) {
        nextBtn.style.display = 'inline-flex';
        nextBtn.innerHTML = '<i class="fas fa-check"></i> Check Answer';
    }
    if (tryAgainBtn) tryAgainBtn.style.display = 'none';
    if (skipBtn) skipBtn.style.display = 'none';
}

// === STEP 4: COMPLETION === //

/**
 * Hiển thị màn hình hoàn thành
 */
function showCompletionScreen() {
    transitionToSection('completionSection');
    
    // Cập nhật thống kê
    setTimeout(() => {
        animateStats();
    }, 500);
}

/**
 * Animate hiển thị thống kê với hiệu ứng đếm
 */
function animateStats() {
    const totalElement = document.getElementById('totalWords');
    const correctElement = document.getElementById('correctAnswers');
    const skippedElement = document.getElementById('skippedWords');
    
    // Animate số liệu
    if (totalElement) animateNumber(totalElement, 0, wordList.length, 1000);
    if (correctElement) animateNumber(correctElement, 0, correctAnswers, 1200);
    if (skippedElement) animateNumber(skippedElement, 0, skippedWords, 1400);
}

/**
 * Animate số đếm
 * @param {Element} element - Element chứa số
 * @param {number} start - Số bắt đầu
 * @param {number} end - Số kết thúc
 * @param {number} duration - Thời gian (ms)
 */
function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// === NAVIGATION === //

/**
 * Quay lại trang chủ
 */
function goBack() {
    if (confirm('Bạn có chắc muốn quay lại trang chủ? Tiến trình hiện tại sẽ bị mất.')) {
        window.location.href = '../../index.html';
    }
}

/**
 * Restart luyện tập
 */
function restartPractice() {
    if (confirm('Bạn có muốn luyện tập lại với danh sách từ vựng này?')) {
        // Reset variables
        currentWordIndex = 0;
        correctAnswers = 0;
        skippedWords = 0;
        
        // Shuffle lại từ vựng
        wordList = shuffleArray(wordList);
        
        // Quay lại màn chọn mode
        transitionToSection('modeSelectionSection');
    }
}

// === ALERT SYSTEM === //

/**
 * Hiển thị thông báo
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại: success, warning, error, info
 */
function showAlert(message, type = 'info') {
    // Tạo alert element
    const alert = document.createElement('div');
    alert.className = `custom-alert alert-${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle', 
        error: 'fas fa-times-circle',
        info: 'fas fa-info-circle'
    };
    
    alert.innerHTML = `
        <i class="${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    // Thêm CSS nếu chưa có
    addAlertStyles();
    
    // Thêm vào body
    document.body.appendChild(alert);
    
    // Hiển thị với animation
    setTimeout(() => {
        alert.classList.add('show');
    }, 100);
    
    // Tự động xóa sau 3 giây
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }, 3000);
}

/**
 * Thêm CSS cho alert system
 */
function addAlertStyles() {
    if (document.querySelector('#alert-styles')) return;
    
    const css = `
        .custom-alert {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 10px;
            padding: 1rem 1.5rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            min-width: 300px;
        }
        
        .custom-alert.show {
            opacity: 1;
            transform: translateX(0);
        }
        
        .custom-alert i {
            font-size: 1.2rem;
        }
        
        .custom-alert span {
            font-weight: 500;
        }
        
        .alert-success { border-left: 4px solid #27ae60; }
        .alert-success i { color: #27ae60; }
        
        .alert-warning { border-left: 4px solid #f39c12; }
        .alert-warning i { color: #f39c12; }
        
        .alert-error { border-left: 4px solid #e74c3c; }
        .alert-error i { color: #e74c3c; }
        
        .alert-info { border-left: 4px solid #3498db; }
        .alert-info i { color: #3498db; }
        
        @media (max-width: 576px) {
            .custom-alert {
                right: 10px;
                left: 10px;
                min-width: auto;
            }
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'alert-styles';
    style.textContent = css;
    document.head.appendChild(style);
}

// === EVENT LISTENERS === //

// Xử lý Enter key trong answer input
document.addEventListener('DOMContentLoaded', function() {
    const answerInput = document.getElementById('wordType');
    if (answerInput) {
        answerInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                
                // Kiểm tra button nào đang hiển thị
                const nextBtn = document.getElementById('nextWordBtn');
                const tryAgainBtn = document.getElementById('tryAgainBtn');
                
                if (nextBtn && nextBtn.style.display !== 'none') {
                    checkAnswer();
                } else if (tryAgainBtn && tryAgainBtn.style.display !== 'none') {
                    tryAgain();
                }
            }
        });
    }
    
    console.log('Practice Word module loaded! 🚀');
});

// Xử lý page unload
window.addEventListener('beforeunload', function(event) {
    if (currentWordIndex > 0 && currentWordIndex < wordList.length) {
        event.preventDefault();
        event.returnValue = 'Bạn có chắc muốn rời khỏi trang? Tiến trình luyện tập sẽ bị mất.';
    }
});

// === GLOBAL FUNCTIONS === //
window.processWordList = processWordList;
window.selectMode = selectMode;
window.checkAnswer = checkAnswer;
window.tryAgain = tryAgain;
window.skipWord = skipWord;
window.goBack = goBack;
window.restartPractice = restartPractice; 