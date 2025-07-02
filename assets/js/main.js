/**
 * English Study App - Main JavaScript
 * Xử lý điều hướng và tương tác chính
 */

// === NAVIGATION FUNCTIONS === //

/**
 * Điều hướng đến tính năng được chọn
 * @param {string} feature - Tên tính năng ('practice-word', 'vocabulary')
 */
function navigateToFeature(feature) {
    // Thêm hiệu ứng loading
    showLoadingEffect();
    
    // Delay để hiệu ứng mượt mà
    setTimeout(() => {
        switch(feature) {
            case 'practice-word':
                window.location.href = './modules/practice-word/index.html';
                break;
            case 'vocabulary':
                window.location.href = './modules/vocabulary/index.html';
                break;
            default:
                console.error('Feature không tồn tại:', feature);
        }
    }, 500);
}

/**
 * Hiển thị thông báo "Sắp ra mắt" cho tính năng chưa hoàn thành
 */
function showComingSoon() {
    // Tạo modal thông báo
    const modal = createModal(
        'Tính năng sắp ra mắt! 🚀',
        'Tính năng Vocabulary đang được phát triển và sẽ sớm có mặt. Hãy quay lại sau nhé!',
        'info'
    );
    
    document.body.appendChild(modal);
    
    // Hiển thị modal
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
    
    // Tự động đóng sau 3 giây
    setTimeout(() => {
        closeModal(modal);
    }, 3000);
}

// === UI EFFECTS === //

/**
 * Hiển thị hiệu ứng loading khi chuyển trang
 */
function showLoadingEffect() {
    // Tạo overlay loading
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>Đang tải...</p>
        </div>
    `;
    
    // Thêm CSS cho loading
    const loadingCSS = `
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(102, 126, 234, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .loading-overlay.show {
            opacity: 1;
        }
        
        .loading-content {
            text-align: center;
            color: white;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    
    // Thêm CSS vào head nếu chưa có
    if (!document.querySelector('#loading-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = loadingCSS;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(loadingOverlay);
    
    // Hiển thị loading
    setTimeout(() => {
        loadingOverlay.classList.add('show');
    }, 50);
}

// === MODAL FUNCTIONS === //

/**
 * Tạo modal thông báo
 * @param {string} title - Tiêu đề modal
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại modal ('info', 'success', 'warning', 'error')
 * @returns {HTMLElement} - Element modal
 */
function createModal(title, message, type = 'info') {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    
    // Icon theo loại modal
    const icons = {
        info: 'fas fa-info-circle',
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle'
    };
    
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content ${type}">
            <div class="modal-header">
                <i class="${icons[type]}"></i>
                <h3>${title}</h3>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeModal(this.closest('.custom-modal'))">
                    Đã hiểu
                </button>
            </div>
        </div>
    `;
    
    // Thêm CSS cho modal nếu chưa có
    addModalStyles();
    
    // Đóng modal khi click backdrop
    modal.querySelector('.modal-backdrop').addEventListener('click', () => {
        closeModal(modal);
    });
    
    return modal;
}

/**
 * Đóng modal
 * @param {HTMLElement} modal - Element modal cần đóng
 */
function closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

/**
 * Thêm CSS cho modal
 */
function addModalStyles() {
    if (document.querySelector('#modal-styles')) return;
    
    const modalCSS = `
        .custom-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .custom-modal.show {
            opacity: 1;
            visibility: visible;
        }
        
        .modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
        }
        
        .modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 90%;
            width: 400px;
            transition: transform 0.3s ease;
        }
        
        .custom-modal.show .modal-content {
            transform: translate(-50%, -50%) scale(1);
        }
        
        .modal-header {
            padding: 2rem 2rem 1rem;
            text-align: center;
            border-bottom: 1px solid #eee;
        }
        
        .modal-header i {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #667eea;
        }
        
        .modal-header h3 {
            margin: 0;
            color: #2c3e50;
            font-size: 1.3rem;
            font-weight: 600;
        }
        
        .modal-body {
            padding: 1.5rem 2rem;
            text-align: center;
        }
        
        .modal-body p {
            margin: 0;
            color: #7f8c8d;
            line-height: 1.6;
        }
        
        .modal-footer {
            padding: 1rem 2rem 2rem;
            text-align: center;
        }
        
        .modal-footer .btn {
            background: linear-gradient(45deg, #667eea, #764ba2);
            border: none;
            color: white;
            padding: 0.75rem 2rem;
            border-radius: 25px;
            font-weight: 500;
            transition: transform 0.2s ease;
        }
        
        .modal-footer .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        /* Colors for different modal types */
        .modal-content.success .modal-header i { color: #27ae60; }
        .modal-content.warning .modal-header i { color: #f39c12; }
        .modal-content.error .modal-header i { color: #e74c3c; }
        
        /* Responsive */
        @media (max-width: 576px) {
            .modal-content {
                width: 95%;
                margin: 0 auto;
            }
            
            .modal-header {
                padding: 1.5rem 1.5rem 1rem;
            }
            
            .modal-body {
                padding: 1rem 1.5rem;
            }
            
            .modal-footer {
                padding: 1rem 1.5rem 1.5rem;
            }
            
            .modal-header i {
                font-size: 2.5rem;
            }
            
            .modal-header h3 {
                font-size: 1.2rem;
            }
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = modalCSS;
    document.head.appendChild(style);
}

// === UTILITY FUNCTIONS === //

/**
 * Debounce function để tránh click nhiều lần
 * @param {Function} func - Hàm cần debounce
 * @param {number} wait - Thời gian chờ (ms)
 * @returns {Function} - Hàm đã được debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// === EVENT LISTENERS === //

// Chờ DOM load xong
document.addEventListener('DOMContentLoaded', function() {
    console.log('English Study App đã sẵn sàng! 🚀');
    
    // Thêm hiệu ứng appear cho các cards
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// Xử lý resize window
window.addEventListener('resize', debounce(() => {
    // Có thể thêm logic xử lý resize ở đây
    console.log('Window resized');
}, 250));

// Prevent right click (optional - có thể bỏ nếu không cần)
// document.addEventListener('contextmenu', e => e.preventDefault());

// === GLOBAL FUNCTIONS === //
// Làm cho các function có thể gọi từ HTML
window.navigateToFeature = navigateToFeature;
window.showComingSoon = showComingSoon;
window.closeModal = closeModal; 