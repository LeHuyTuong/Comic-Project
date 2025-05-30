// comic-backend/controllers/chapterController.js

const Chapter = require('../models/Chapter');
const Story = require('../models/Story'); // Cần để kiểm tra story tồn tại

// @desc    Lấy tất cả các chương của một truyện cụ thể
// @route   GET /api/stories/:storyId/chapters
// @access  Public
exports.getChaptersByStory = async (req, res, next) => {
    try {
        const storyId = req.params.storyId;
        // Kiểm tra xem storyId có tồn tại không
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy truyện với ID này' });
        }

        const chapters = await Chapter.find({ story: storyId }).sort({ chapterNumber: 1 }); // Sắp xếp theo số chương tăng dần
        res.status(200).json({
            success: true,
            count: chapters.length,
            data: chapters
        });
    } catch (err) {
        console.error(`Lỗi khi lấy các chương cho truyện ID ${req.params.storyId}:`, err.message);
        res.status(500).json({ success: false, error: 'Lỗi Server: ' + err.message });
    }
};

// @desc    Lấy thông tin một chương cụ thể (trong một truyện)
// @route   GET /api/stories/:storyId/chapters/:chapterId
// @access  Public
exports.getChapter = async (req, res, next) => {
    try {
        const chapter = await Chapter.findOne({ _id: req.params.chapterId, story: req.params.storyId });

        if (!chapter) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy chương trong truyện này' });
        }

        res.status(200).json({
            success: true,
            data: chapter
        });
    } catch (err) {
        console.error(`Lỗi khi lấy chương ID ${req.params.chapterId} cho truyện ID ${req.params.storyId}:`, err.message);
        res.status(500).json({ success: false, error: 'Lỗi Server: ' + err.message });
    }
};

// @desc    Tạo một chương mới cho một truyện
// @route   POST /api/stories/:storyId/chapters
// @access  Private (nên thêm middleware xác thực sau)
exports.createChapter = async (req, res, next) => {
    try {
        const storyId = req.params.storyId;
        // Kiểm tra xem storyId có tồn tại không
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy truyện để thêm chương' });
        }

        const { title, chapterNumber, pages } = req.body;

        // Kiểm tra xem chapterNumber đã tồn tại cho story này chưa
        const existingChapter = await Chapter.findOne({ story: storyId, chapterNumber: chapterNumber });
        if (existingChapter) {
            return res.status(400).json({ success: false, error: 'Số chương này đã tồn tại cho truyện này.' });
        }

        const chapter = await Chapter.create({
            story: storyId,
            title,
            chapterNumber,
            pages
        });

        res.status(201).json({
            success: true,
            data: chapter
        });
    } catch (err) {
        console.error(`Lỗi khi tạo chương cho truyện ID ${req.params.storyId}:`, err.message);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        res.status(500).json({ success: false, error: 'Lỗi Server: ' + err.message });
    }
};

// @desc    Cập nhật một chương
// @route   PUT /api/stories/:storyId/chapters/:chapterId
// @access  Private (nên thêm middleware xác thực sau)
exports.updateChapter = async (req, res, next) => {
    try {
        let chapter = await Chapter.findOne({ _id: req.params.chapterId, story: req.params.storyId });

        if (!chapter) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy chương' });
        }

        // Thêm kiểm tra quyền ở đây nếu cần

        // Nếu chapterNumber được cập nhật, kiểm tra sự trùng lặp
        if (req.body.chapterNumber && req.body.chapterNumber !== chapter.chapterNumber) {
            const existingChapter = await Chapter.findOne({
                story: req.params.storyId,
                chapterNumber: req.body.chapterNumber,
                _id: { $ne: req.params.chapterId } // Loại trừ chính chương đang cập nhật
            });
            if (existingChapter) {
                return res.status(400).json({ success: false, error: 'Số chương này đã tồn tại cho truyện này sau khi cập nhật.' });
            }
        }

        const updatedChapter = await Chapter.findByIdAndUpdate(req.params.chapterId, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: updatedChapter
        });
    } catch (err) {
        console.error(`Lỗi khi cập nhật chương ID ${req.params.chapterId}:`, err.message);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Xóa một chương
// @route   DELETE /api/stories/:storyId/chapters/:chapterId
// @access  Private (nên thêm middleware xác thực sau)
exports.deleteChapter = async (req, res, next) => {
    try {
        const chapter = await Chapter.findOne({ _id: req.params.chapterId, story: req.params.storyId });

        if (!chapter) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy chương' });
        }

        // Thêm kiểm tra quyền ở đây nếu cần

        await chapter.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error(`Lỗi khi xóa chương ID ${req.params.chapterId}:`, err.message);
        res.status(500).json({ success: false, error: 'Lỗi Server: ' + err.message });
    }
};
