// comic-frontend/js/api.js
const API_BASE_URL = 'https://tuongtruyen.io.vn/api'; // Đảm bảo cổng này (5000) khớp với backend PORT của bạn

/**
 * Hàm chung để thực hiện các yêu cầu API đến backend.
 * @param {string} endpoint - Điểm cuối API (ví dụ: '/stories', '/stories/storyId/chapters').
 * @param {string} [method='GET'] - Phương thức HTTP (GET, POST, PUT, DELETE).
 * @param {object} [body=null] - Dữ liệu gửi đi cho POST/PUT.
 * @param {object} [customHeaders={}] - Các header tùy chỉnh.
 * @returns {Promise<any>} - Dữ liệu JSON từ API.
 * @throws {Error} - Ném lỗi nếu yêu cầu API thất bại.
 */
async function apiRequest(endpoint, method = 'GET', body = null, customHeaders = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('authToken'); // Lấy token từ localStorage (nếu có)

    const headers = {
        // 'Content-Type': 'application/json', // Sẽ được đặt tự động bởi fetch cho FormData
        ...customHeaders,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers,
    };

    // Chỉ đặt Content-Type là application/json nếu body không phải là FormData
    if (body && !(body instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
        config.body = body; // fetch sẽ tự động đặt Content-Type cho FormData
    }


    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                // Nếu không parse được JSON (ví dụ lỗi server trả về HTML)
                errorData = { message: `Yêu cầu thất bại với trạng thái ${response.status} ${response.statusText}` };
            }
            // Ưu tiên hiển thị lỗi cụ thể từ backend nếu có
            throw new Error(errorData.error || errorData.message || `Lỗi HTTP! Trạng thái: ${response.status}`);
        }

        // Xử lý trường hợp response không có nội dung (ví dụ: 204 No Content sau khi DELETE)
        if (response.status === 204 || response.headers.get("content-length") === "0") {
            return { success: true }; // Hoặc null, tùy theo cách bạn muốn xử lý
        }

        return await response.json(); // Phân tích cú pháp JSON từ response
    } catch (error) {
        console.error(`Yêu cầu API đến ${method} ${url} thất bại:`, error.message);
        // Bạn có thể thêm xử lý lỗi toàn cục ở đây, ví dụ: hiển thị thông báo cho người dùng
        // Hoặc nếu lỗi là 401 (Unauthorized), có thể điều hướng về trang đăng nhập.
        throw error; // Ném lại lỗi để nơi gọi có thể xử lý cụ thể
    }
}

export { apiRequest };

console.log("api.js (để tương tác với backend) đã được tải.");
