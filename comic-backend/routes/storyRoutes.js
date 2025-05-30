// comic-backend/routes/storyRoutes.js
const express = require('express');
const {
    getStories,
    getStory,
    createStory,
    updateStory,
    deleteStory
} = require('../controllers/storyController');
const chapterRouter = require('./chapterRoutes');
const { protect, authorize } = require('../middlewares/authMiddleware');
const Story = require('../models/Story'); // Import model Story

const router = express.Router();

// Re-route into other resource routers
router.use('/:storyId/chapters', chapterRouter);

// Route để lấy danh sách các thể loại duy nhất
router.get('/categories', async (req, res) => {
    try {
        const categories = await Story.distinct('genres'); // Lấy các giá trị duy nhất của trường 'genres'
        if (!categories) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy thể loại nào.' });
        }
        res.status(200).json({ success: true, count: categories.length, data: categories.sort() });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách thể loại:', error);
        res.status(500).json({ success: false, error: 'Không thể lấy danh sách thể loại' });
    }
});

router
    .route('/')
    .get(getStories)
    .post(protect, createStory); // Ví dụ: bảo vệ route tạo truyện

router
    .route('/:id')
    .get(getStory)
    .put(protect, updateStory)   // Ví dụ: bảo vệ route cập nhật
    .delete(protect, deleteStory); // Ví dụ: bảo vệ route xóa

module.exports = router;
