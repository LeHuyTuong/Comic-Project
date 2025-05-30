// comic-backend/controllers/userController.js

const User = require('../models/User');
// Bạn có thể cần thêm các model khác nếu có sự tương tác

// @desc    Lấy tất cả người dùng
// @route   GET /api/users  (Hoặc một route admin riêng biệt như /api/admin/users)
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        // Giả sử bạn sẽ thêm phân trang, tìm kiếm, sắp xếp sau này
        const users = await User.find(); // Mặc định không trả về mật khẩu do select: false trong model
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        console.error('Lỗi khi lấy danh sách người dùng:', err.message);
        res.status(500).json({ success: false, error: 'Lỗi Server: ' + err.message });
    }
};

// @desc    Lấy thông tin một người dùng bằng ID
// @route   GET /api/users/:id (Hoặc /api/admin/users/:id)
// @access  Private/Admin
exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error(`Lỗi khi lấy người dùng ID ${req.params.id}:`, err.message);
        res.status(500).json({ success: false, error: 'Lỗi Server: ' + err.message });
    }
};

// @desc    Tạo người dùng mới (thường dùng cho admin, đăng ký công khai đã có ở authController)
// @route   POST /api/users (Hoặc /api/admin/users)
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;
        const user = await User.create({
            username,
            email,
            password,
            role
        });
        // Không trả về mật khẩu trong response
        const userResponse = { ...user._doc };
        delete userResponse.password;

        res.status(201).json({ success: true, data: userResponse });
    } catch (err) {
        console.error('Lỗi khi tạo người dùng (admin):', err.message);
        if (err.code === 11000) { // Lỗi trùng lặp key
            const field = Object.keys(err.keyValue)[0];
            const message = field === 'email' ? 'Địa chỉ email này đã được sử dụng.' : `Tên người dùng '${username}' đã tồn tại.`;
            return res.status(400).json({ success: false, error: message });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        res.status(500).json({ success: false, error: 'Lỗi Server: ' + err.message });
    }
};


// @desc    Cập nhật thông tin người dùng (bởi Admin)
// @route   PUT /api/users/:id (Hoặc /api/admin/users/:id)
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
    try {
        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
        }

        // Chỉ admin mới được cập nhật thông tin qua route này (ví dụ)
        // Middleware authorize('admin') nên được dùng ở route

        // Các trường được phép cập nhật bởi admin
        const { username, email, role } = req.body;
        const fieldsToUpdate = {};
        if (username) fieldsToUpdate.username = username;
        if (email) fieldsToUpdate.email = email;
        if (role) fieldsToUpdate.role = role;
        
        // Không cho phép cập nhật mật khẩu qua route này.
        // Nếu muốn cập nhật mật khẩu cho người dùng (bởi admin), nên có cơ chế riêng.

        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ success: false, error: 'Không có thông tin nào được cung cấp để cập nhật' });
        }

        user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user // Mật khẩu không được trả về do select: false trong model
        });
    } catch (err) {
        console.error(`Lỗi khi cập nhật người dùng ID ${req.params.id}:`, err.message);
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            const message = field === 'email' ? 'Địa chỉ email này đã được sử dụng.' : `Tên người dùng đã tồn tại.`;
            return res.status(400).json({ success: false, error: message });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Xóa người dùng
// @route   DELETE /api/users/:id (Hoặc /api/admin/users/:id)
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
        }

        // Ngăn admin tự xóa chính mình (ví dụ)
        // Giả sử req.user được thiết lập bởi middleware 'protect'
        if (req.user && req.user.id === user._id.toString()) {
             return res.status(400).json({ success: false, error: 'Admin không thể tự xóa chính mình.' });
        }


        // Cân nhắc: Khi xóa người dùng, bạn có muốn xóa các dữ liệu liên quan không?
        // Ví dụ: xóa các truyện, chương mà người dùng này tạo (nếu có trường 'user' trong model Story/Chapter)
        // await Story.deleteMany({ user: req.params.id });

        await user.deleteOne();

        res.status(200).json({
            success: true,
            data: { message: 'Người dùng đã được xóa thành công.' }
        });
    } catch (err) {
        console.error(`Lỗi khi xóa người dùng ID ${req.params.id}:`, err.message);
        res.status(500).json({ success: false, error: 'Lỗi Server: ' + err.message });
    }
};
