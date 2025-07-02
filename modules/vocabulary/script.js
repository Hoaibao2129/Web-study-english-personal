/**
 * Vocabulary Module Script
 * Xử lý logic chọn từ vựng và chuyển đến practice
 */

class VocabularyApp {
    constructor() {
        this.vocabularyData = null;
        this.selectedCategories = new Set();
        this.selectedWords = new Set();
        this.currentScreen = 'welcome';
        
        this.init();
    }

    async init() {
        try {
            // Wait for vocabulary data to load
            await this.loadVocabularyData();
            this.setupEventListeners();
            this.hideLoading();
        } catch (error) {
            console.error('Error initializing vocabulary app:', error);
            this.showError('Không thể tải dữ liệu từ vựng. Vui lòng thử lại!');
        }
    }

    async loadVocabularyData() {
        // Wait a bit for vocabulary manager to load
        let attempts = 0;
        while (!window.vocabularyManager?.data && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!window.vocabularyManager?.data) {
            throw new Error('Vocabulary data not available');
        }

        this.vocabularyData = window.vocabularyManager.data;
        console.log('Vocabulary data loaded:', this.vocabularyData);
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        
        // Initialize counter
        this.updateSelectedCount();
    }

    showError(message) {
        document.getElementById('loading').innerHTML = `
            <div class="error-screen">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 style="color: #e74c3c; margin-bottom: 0.5rem;">Oops! Có lỗi xảy ra</h3>
                <p style="color: #7f8c8d; margin-bottom: 1rem;">${message}</p>
                <button onclick="location.reload()" class="retry-btn">
                    <i class="fas fa-redo"></i>
                    <span>Thử lại</span>
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            window.location.href = '../../index.html';
        });

        // Welcome screen
        document.getElementById('startSelectBtn').addEventListener('click', () => {
            this.showCategoryScreen();
        });

        // Category screen
        document.getElementById('selectAllCategoriesBtn').addEventListener('click', () => {
            this.selectAllCategories();
        });

        document.getElementById('nextToCategoryBtn').addEventListener('click', () => {
            this.showWordScreen();
        });

        // Word screen
        document.getElementById('selectAllWordsBtn').addEventListener('click', () => {
            this.selectAllWords();
        });

        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAllSelections();
        });

        document.getElementById('startPracticeBtn').addEventListener('click', () => {
            this.startPractice();
        });

        // Back section buttons
        document.querySelectorAll('.back-section-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleBackSection(e);
            });
        });
    }

    showCategoryScreen() {
        this.hideAllSections();
        document.getElementById('categoryScreen').style.display = 'block';
        this.currentScreen = 'category';
        this.renderCategories();
    }

    showWordScreen() {
        this.hideAllSections();
        document.getElementById('wordScreen').style.display = 'block';
        this.currentScreen = 'word';
        this.renderWords();
    }

    hideAllSections() {
        document.querySelectorAll('.section').forEach(section => {
            section.style.display = 'none';
        });
    }

    handleBackSection(e) {
        switch(this.currentScreen) {
            case 'category':
                this.hideAllSections();
                document.getElementById('welcomeScreen').style.display = 'block';
                this.currentScreen = 'welcome';
                break;
            case 'word':
                this.showCategoryScreen();
                break;
        }
    }

    renderCategories() {
        const categoryGrid = document.getElementById('categoryGrid');
        categoryGrid.innerHTML = '';

        Object.keys(this.vocabularyData).forEach(categoryId => {
            const category = this.vocabularyData[categoryId];
            const isSelected = this.selectedCategories.has(categoryId);
            
            const categoryCard = document.createElement('div');
            categoryCard.className = `category-card ${isSelected ? 'selected' : ''}`;
            categoryCard.innerHTML = `
                <div class="category-header">
                    <input type="checkbox" class="category-checkbox" data-category="${categoryId}" ${isSelected ? 'checked' : ''}>
                    <h3 class="category-title">${category.title}</h3>
                </div>
                <p class="category-description">${category.description}</p>
                <div class="category-stats">
                    <i class="fas fa-book"></i>
                    <span>${category.words.length} từ vựng</span>
                </div>
            `;

            // Add click handler
            categoryCard.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = categoryCard.querySelector('.category-checkbox');
                    checkbox.checked = !checkbox.checked;
                    this.toggleCategory(categoryId, checkbox.checked);
                }
            });

            // Add checkbox handler
            const checkbox = categoryCard.querySelector('.category-checkbox');
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                this.toggleCategory(categoryId, e.target.checked);
            });

            categoryGrid.appendChild(categoryCard);
        });

        this.updateCategoryButtons();
    }

    toggleCategory(categoryId, isSelected) {
        if (isSelected) {
            this.selectedCategories.add(categoryId);
            // Automatically select all words in this category
            const categoryWords = this.vocabularyData[categoryId].words;
            categoryWords.forEach(word => {
                this.selectedWords.add(`${categoryId}:${word.word}`);
            });
        } else {
            this.selectedCategories.delete(categoryId);
            // Remove all words from this category
            const categoryWords = this.vocabularyData[categoryId].words;
            categoryWords.forEach(word => {
                this.selectedWords.delete(`${categoryId}:${word.word}`);
            });
        }

        this.updateCategoryUI();
        this.updateSelectedCount();
    }

    updateCategoryUI() {
        document.querySelectorAll('.category-card').forEach(card => {
            const checkbox = card.querySelector('.category-checkbox');
            const categoryId = checkbox.dataset.category;
            const isSelected = this.selectedCategories.has(categoryId);
            
            card.classList.toggle('selected', isSelected);
            checkbox.checked = isSelected;
        });

        this.updateCategoryButtons();
    }

    updateCategoryButtons() {
        const nextBtn = document.getElementById('nextToCategoryBtn');
        nextBtn.disabled = this.selectedCategories.size === 0;
    }

    selectAllCategories() {
        Object.keys(this.vocabularyData).forEach(categoryId => {
            this.selectedCategories.add(categoryId);
            // Also select all words in each category
            const categoryWords = this.vocabularyData[categoryId].words;
            categoryWords.forEach(word => {
                this.selectedWords.add(`${categoryId}:${word.word}`);
            });
        });
        this.updateCategoryUI();
        this.updateSelectedCount();
    }

    renderWords() {
        const wordCategories = document.getElementById('wordCategories');
        wordCategories.innerHTML = '';

        this.selectedCategories.forEach(categoryId => {
            const category = this.vocabularyData[categoryId];
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'word-category';
            
            categoryDiv.innerHTML = `
                <div class="word-category-header" data-category="${categoryId}">
                    <input type="checkbox" class="category-select-all" data-category="${categoryId}">
                    <h3 class="word-category-title">${category.title}</h3>
                    <span class="word-count">(${category.words.length} từ)</span>
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </div>
                <div class="word-list" data-category="${categoryId}">
                    ${category.words.map(word => `
                        <div class="word-item">
                            <input type="checkbox" class="word-checkbox" data-word="${categoryId}:${word.word}">
                            <div class="word-content">
                                <div class="word-term">${word.word}</div>
                                <div class="word-definition">${word.definition}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            wordCategories.appendChild(categoryDiv);

            // Setup category header click (toggle)
            const header = categoryDiv.querySelector('.word-category-header');
            header.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    categoryDiv.classList.toggle('collapsed');
                }
            });

            // Setup category select all
            const selectAllCheckbox = categoryDiv.querySelector('.category-select-all');
            selectAllCheckbox.addEventListener('change', (e) => {
                e.stopPropagation();
                this.toggleCategoryWords(categoryId, e.target.checked);
            });

            // Setup individual word checkboxes
            categoryDiv.querySelectorAll('.word-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    this.toggleWord(e.target.dataset.word, e.target.checked);
                });
            });
        });

        this.updateWordSelections();
        this.updateSelectedCount();
    }

    toggleCategoryWords(categoryId, isSelected) {
        const category = this.vocabularyData[categoryId];
        
        category.words.forEach(word => {
            const wordKey = `${categoryId}:${word.word}`;
            if (isSelected) {
                this.selectedWords.add(wordKey);
            } else {
                this.selectedWords.delete(wordKey);
            }
        });

        this.updateWordSelections();
        this.updateSelectedCount();
    }

    toggleWord(wordKey, isSelected) {
        if (isSelected) {
            this.selectedWords.add(wordKey);
        } else {
            this.selectedWords.delete(wordKey);
        }

        this.updateWordSelections();
        this.updateSelectedCount();
    }

    updateWordSelections() {
        // Update individual word checkboxes
        document.querySelectorAll('.word-checkbox').forEach(checkbox => {
            const wordKey = checkbox.dataset.word;
            const isSelected = this.selectedWords.has(wordKey);
            checkbox.checked = isSelected;
            
            // Update word item visual state
            const wordItem = checkbox.closest('.word-item');
            wordItem.classList.toggle('selected', isSelected);
        });

        // Update category select-all checkboxes
        document.querySelectorAll('.category-select-all').forEach(checkbox => {
            const categoryId = checkbox.dataset.category;
            const categoryWords = this.vocabularyData[categoryId].words;
            const selectedCount = categoryWords.filter(word => 
                this.selectedWords.has(`${categoryId}:${word.word}`)
            ).length;
            
            checkbox.checked = selectedCount === categoryWords.length;
            checkbox.indeterminate = selectedCount > 0 && selectedCount < categoryWords.length;
        });

        this.updatePracticeButton();
    }

    selectAllWords() {
        this.selectedCategories.forEach(categoryId => {
            const category = this.vocabularyData[categoryId];
            category.words.forEach(word => {
                this.selectedWords.add(`${categoryId}:${word.word}`);
            });
        });
        this.updateWordSelections();
        this.updateSelectedCount();
    }

    clearAllSelections() {
        this.selectedWords.clear();
        this.updateWordSelections();
        this.updateSelectedCount();
    }

    updateSelectedCount() {
        const count = this.selectedWords.size;
        const selectedCountElement = document.getElementById('selectedCount');
        if (selectedCountElement) {
            selectedCountElement.textContent = `${count} từ đã chọn`;
            console.log('Updated selected count:', count);
        }
    }

    updatePracticeButton() {
        const practiceBtn = document.getElementById('startPracticeBtn');
        const count = this.selectedWords.size;
        
        practiceBtn.disabled = count === 0;
        practiceBtn.querySelector('.practice-count').textContent = `(${count} từ)`;
    }

    startPractice() {
        if (this.selectedWords.size === 0) {
            alert('Vui lòng chọn ít nhất một từ vựng để luyện tập!');
            return;
        }

        // Convert selected words to practice format
        const practiceWords = [];
        
        this.selectedWords.forEach(wordKey => {
            const [categoryId, wordTerm] = wordKey.split(':');
            const category = this.vocabularyData[categoryId];
            const word = category.words.find(w => w.word === wordTerm);
            
            if (word) {
                practiceWords.push({
                    english: word.word,
                    vietnamese: word.definition
                });
            }
        });

        // Save to localStorage for practice module
        localStorage.setItem('practiceWords', JSON.stringify(practiceWords));
        localStorage.setItem('practiceSource', 'vocabulary');

        // Navigate to practice module
        window.location.href = '../practice-word/index.html';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VocabularyApp();
}); 