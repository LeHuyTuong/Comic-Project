// comic-backend/controllers/authController.js

const User = require('../models/User');

// @desc    Đăng ký người dùng
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { username, email, password, role: requestedRole } = req.body;

        // Chỉ chấp nhận các vai trò nằm trong danh sách cho phép
        const allowedRoles = ['user']; // Mở rộng khi cần tạo admin qua route riêng
        const role = allowedRoles.includes(requestedRole) ? requestedRole : 'user';

        // Tạo người dùng với vai trò đã được kiểm soát
        const user = await User.create({
            username,
            email,
            password,
            role
        });

        sendTokenResponse(user, 201, res);

    } catch (err) {
        console.error('Lỗi đăng ký:', err.message);
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

// @desc    Đăng nhập người dùng
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Xác thực email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Vui lòng cung cấp email và mật khẩu' });
        }

        // Kiểm tra người dùng
        const user = await User.findOne({ email }).select('+password'); // Lấy cả trường password

        if (!user) {
            return res.status(401).json({ success: false, error: 'Email hoặc mật khẩu không hợp lệ' });
        }

        // Kiểm tra mật khẩu có khớp không
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Email hoặc mật khẩu không hợp lệ' });
        }

        sendTokenResponse(user, 200, res);

    } catch (err) {
        console.error('Lỗi đăng nhập:', err.message);
         res.status(500).json({ success: false, error: 'Lỗi Server: ' + err.message });
    }
};

// @desc    Lấy thông tin người dùng đang đăng nhập (profile)
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
    try {
        // req.user được thiết lập bởi middleware authMiddleware.protect
        const user = await User.findById(req.user.id); // Không cần select('+password') ở đây

        if (!user) {
             return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error('Lỗi khi lấy profile:', err.message);
        res.status(500).json({ success: false, error: 'Lỗi Server: ' + err.message });
    }
};

// Hàm tiện ích để lấy token từ model, tạo cookie và gửi response
const sendTokenResponse = (user, statusCode, res) => {
    // Tạo token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
        httpOnly: true // Cookie không thể được truy cập bởi JavaScript phía client
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true; // Chỉ gửi cookie qua HTTPS
    }

    // Không trả về mật khẩu trong response, ngay cả khi nó đã được select trong controller
    const userResponse = { ...user._doc };
    delete userResponse.password;


    res
        .status(statusCode)
        // .cookie('token', token, options) // Nếu bạn muốn sử dụng cookie để lưu token
        .json({
            success: true,
            token, // Gửi token trong body của response
            data: userResponse // Gửi thông tin người dùng (đã loại bỏ mật khẩu)
        });
};
