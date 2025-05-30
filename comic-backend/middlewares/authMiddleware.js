const jwt = require('jsonwebtoken');
const User = require('../models/User'); // To find user by ID from token

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }
    // else if (req.cookies.token) { // Alternative: Set token from cookie
    //   token = req.cookies.token;
    // }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route (no token)' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decoded); // Contains { id: '...', iat: ..., exp: ... }

        req.user = await User.findById(decoded.id); // Attach user to request object

        if (!req.user) {
             return res.status(401).json({ success: false, error: 'User not found for this token' });
        }

        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        return res.status(401).json({ success: false, error: 'Not authorized to access this route (token failed)' });
    }
};

// Grant access to specific roles (example for future use)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ // 403 Forbidden
                success: false,
                error: `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`
            });
        }
        next();
    };
};