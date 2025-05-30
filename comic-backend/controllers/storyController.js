// comic-backend/controllers/storyController.js

const Story = require('../models/Story');
const Chapter = require('../models/Chapter'); // Cần thiết để xóa các chương liên quan khi xóa truyện

// @desc    Lấy tất cả truyện
// @route   GET /api/stories
// @access  Public
exports.getStories = async (req, res, next) => {
    try {
        // Có thể thêm phân trang, lọc, sắp xếp sau này nếu cần
        const stories = await Story.find().sort({ updatedAt: -1 }); // Sắp xếp theo truyện cập nhật gần nhất
        res.status(200).json({ success: true, count: stories.length, data: stories });
    } catch (err) {
        console.error('Lỗi khi lấy danh sách truyện:', err.message);
        res.status(500).json({ success: false, error: 'Lỗi Server: ' + err.message });
    }
};

// @desc    Lấy thông tin một truyện
// @route   GET /api/stories/:id
// @access  Public
exports.getStory = async (req, res, next) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy truyện' });
        }
        // Tùy chọn: tăng lượt xem ở đây
        story.views = (story.views || 0) + 1;
        await story.save({ validateBeforeSave: false }); // Bỏ qua validation khi chỉ cập nhật view

        res.status(200).json({ success: true, data: story });
    } catch (err) {
        console.error(`Lỗi khi lấy truyện ID ${req.params.id}:`, err.message);
        res.status(500).json({ success: false, error: 'Lỗi Server: ' + err.message });
    }
};

// @desc    Tạo truyện mới
// @route   POST /api/stories
// @access  Private (nên thêm middleware xác thực sau)
exports.createStory = async (req, res, next) => {
    try {
        const { title, author, genres, description, coverImage, status } = req.body;
        const story = await Story.create({
            title,
            author,
            genres,
            description,
            coverImage,
            status
        });
        res.status(201).json({ success: true, data: story });
    } catch (err) {
        console.error('Lỗi khi tạo truyện:', err.message);
        if (err.code === 11000) { // Lỗi trùng lặp key (ví dụ: title đã unique)
             return res.status(400).json({ success: false, error: 'Tiêu đề truyện đã tồn tại.' });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Cập nhật truyện
// @route   PUT /api/stories/:id
// @access  Private (nên thêm middleware xác thực sau)
exports.updateStory = async (req, res, next) => {
    try {
        let story = await Story.findById(req.params.id);
        if (!story) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy truyện' });
        }
        // Thêm kiểm tra quyền ở đây: if (story.user.toString() !== req.user.id && req.user.role !== 'admin') ...

        // Cập nhật các trường được cung cấp trong req.body
        // Loại bỏ các trường không được phép cập nhật nếu cần
        const allowedUpdates = ['title', 'author', 'genres', 'description', 'coverImage', 'status', 'rating'];
        const updates = {};
        for (const key in req.body) {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        }
        
        story = await Story.findByIdAndUpdate(req.params.id, updates, {
            new: true, // Trả về document đã được cập nhật
            runValidators: true // Chạy các trình xác thực của schema
        });
        res.status(200).json({ success: true, data: story });
    } catch (err) {
        console.error(`Lỗi khi cập nhật truyện ID ${req.params.id}:`, err.message);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Xóa truyện
// @route   DELETE /api/stories/:id
// @access  Private (nên thêm middleware xác thực sau)
exports.deleteStory = async (req, res, next) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy truyện' });
        }
        // Thêm kiểm tra quyền ở đây

        // Đồng thời xóa tất cả các chương liên quan đến truyện này
        await Chapter.deleteMany({ story: req.params.id });

        await story.deleteOne(); // Mongoose v6+ sử dụng deleteOne() trên document
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error(`Lỗi khi xóa truyện ID ${req.params.id}:`, err.message);
        res.status(500).json({ success: false, error: 'Lỗi Server: ' + err.message });
    }
};
