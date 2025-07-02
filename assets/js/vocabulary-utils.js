/**
 * Vocabulary Utility Functions
 * Các hàm tiện ích để xử lý dữ liệu từ vựng
 */

class VocabularyManager {
    constructor() {
        this.data = null;
        this.loadData();
    }

    /**
     * Load vocabulary data từ file JSON
     */
    async loadData() {
        try {
            // Tự động xác định đường dẫn dựa trên vị trí hiện tại
            let jsonPath = './assets/data/vocabulary.json';
            
            // Nếu đang ở trong module thì cần đi lên 2 cấp
            if (window.location.pathname.includes('/modules/')) {
                jsonPath = '../../assets/data/vocabulary.json';
            }
            
            console.log('Loading vocabulary data from:', jsonPath);
            const response = await fetch(jsonPath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.data = await response.json();
            console.log('Vocabulary data loaded successfully!', this.data);
            return this.data;
        } catch (error) {
            console.error('Error loading vocabulary data:', error);
            return null;
        }
    }

    /**
     * Lấy tất cả categories
     */
    getCategories() {
        if (!this.data) return [];
        
        return Object.keys(this.data).map(key => ({
            id: key,
            title: this.data[key].title,
            description: this.data[key].description,
            wordCount: this.data[key].words.length
        }));
    }

    /**
     * Lấy từ vựng theo category
     */
    getWordsByCategory(categoryId) {
        if (!this.data || !this.data[categoryId]) return [];
        return this.data[categoryId].words;
    }

    /**
     * Lấy tất cả từ vựng từ mọi category
     */
    getAllWords() {
        if (!this.data) return [];
        
        let allWords = [];
        Object.keys(this.data).forEach(categoryId => {
            const categoryWords = this.data[categoryId].words.map(word => ({
                ...word,
                category: categoryId,
                categoryTitle: this.data[categoryId].title
            }));
            allWords = allWords.concat(categoryWords);
        });
        return allWords;
    }

    /**
     * Tìm kiếm từ vựng theo từ khóa
     */
    searchWords(keyword) {
        const allWords = this.getAllWords();
        const searchTerm = keyword.toLowerCase();
        
        return allWords.filter(word => 
            word.word.toLowerCase().includes(searchTerm) ||
            word.definition.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Lấy từ vựng ngẫu nhiên để luyện tập
     */
    getRandomWords(count = 10, categoryId = null) {
        let words = categoryId ? this.getWordsByCategory(categoryId) : this.getAllWords();
        
        // Shuffle array
        const shuffled = [...words].sort(() => 0.5 - Math.random());
        
        // Return first 'count' items
        return shuffled.slice(0, count);
    }

    /**
     * Lấy thống kê tổng thể
     */
    getStatistics() {
        if (!this.data) return { totalCategories: 0, totalWords: 0, averageWordsPerCategory: 0 };
        
        const categories = Object.keys(this.data);
        let totalWords = 0;
        
        categories.forEach(categoryId => {
            totalWords += this.data[categoryId].words.length;
        });
        
        return {
            totalCategories: categories.length,
            totalWords: totalWords,
            averageWordsPerCategory: Math.round(totalWords / categories.length)
        };
    }

    /**
     * Chuyển đổi vocabulary data thành format cho Practice Word module
     */
    convertToPracticeFormat(categoryId = null) {
        const words = categoryId ? this.getWordsByCategory(categoryId) : this.getAllWords();
        
        return words.map(word => ({
            english: word.word,
            vietnamese: word.definition
        }));
    }

    /**
     * Tạo flashcards từ vocabulary data
     */
    generateFlashcards(categoryId = null, count = null) {
        let words = categoryId ? this.getWordsByCategory(categoryId) : this.getAllWords();
        
        if (count) {
            words = this.getRandomWords(count, categoryId);
        }
        
        return words.map((word, index) => ({
            id: index + 1,
            front: word.word || word.english,
            back: word.definition || word.vietnamese,
            category: word.category || 'mixed',
            categoryTitle: word.categoryTitle || 'Mixed'
        }));
    }

    /**
     * Xuất vocabulary data thành CSV
     */
    exportToCSV(categoryId = null) {
        const words = categoryId ? this.getWordsByCategory(categoryId) : this.getAllWords();
        
        let csv = 'Word,Definition,Category\n';
        words.forEach(word => {
            const wordText = (word.word || word.english).replace(/"/g, '""');
            const definition = (word.definition || word.vietnamese).replace(/"/g, '""');
            const category = word.category || word.categoryTitle || '';
            csv += `"${wordText}","${definition}","${category}"\n`;
        });
        
        return csv;
    }

    /**
     * Download CSV file
     */
    downloadCSV(categoryId = null, filename = 'vocabulary.csv') {
        const csv = this.exportToCSV(categoryId);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    /**
     * Lấy từ có độ khó tương ứng (dựa trên độ dài definition)
     */
    getWordsByDifficulty(difficulty = 'medium', categoryId = null) {
        const words = categoryId ? this.getWordsByCategory(categoryId) : this.getAllWords();
        
        return words.filter(word => {
            const defLength = word.definition.length;
            switch(difficulty) {
                case 'easy': return defLength < 50;
                case 'medium': return defLength >= 50 && defLength < 100;
                case 'hard': return defLength >= 100;
                default: return true;
            }
        });
    }

    /**
     * Tìm từ tương tự (có chung từ khóa trong definition)
     */
    findSimilarWords(word) {
        const allWords = this.getAllWords();
        const targetWords = word.definition.toLowerCase().split(' ').filter(w => w.length > 3);
        
        return allWords.filter(w => {
            if (w.word === word.word) return false;
            const definition = w.definition.toLowerCase();
            return targetWords.some(targetWord => definition.includes(targetWord));
        }).slice(0, 5);
    }
}

// Tạo instance global
const vocabularyManager = new VocabularyManager();

// Export cho browser
if (typeof window !== 'undefined') {
    window.VocabularyManager = VocabularyManager;
    window.vocabularyManager = vocabularyManager;
}

// Export cho Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VocabularyManager, vocabularyManager };
} 