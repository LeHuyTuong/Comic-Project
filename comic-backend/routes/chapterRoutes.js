const express = require('express');
const {
    getChaptersByStory, // This controller method is actually defined in storyController to get storyId first
    getChapter,
    createChapter,
    updateChapter,
    deleteChapter
} = require('../controllers/chapterController');
const { protect, authorize } = require('../middlewares/authMiddleware'); // Example

// The ':storyId' parameter is available because this router is merged with mergeParams: true
const router = express.Router({ mergeParams: true });

// Note: GET /api/stories/:storyId/chapters is handled by storyRoutes itself,
// which then calls getChaptersByStory or you can define it here too.
// Let's define all chapter-specific actions here.

router
    .route('/')
    .get(getChaptersByStory) // This will get all chapters for the :storyId from the merged params
    // .post(protect, createChapter); // Example of protected route
    .post(createChapter);

router
    .route('/:chapterId')
    .get(getChapter)
    // .put(protect, updateChapter)
    .put(updateChapter)
    // .delete(protect, deleteChapter);
    .delete(deleteChapter);

module.exports = router;