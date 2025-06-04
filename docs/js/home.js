// comic-frontend/js/home.js
import { apiRequest } from './api.js';
import { populateComicCard } from './main.js';

async function initHomePage() {
    console.log("Đang khởi tạo Trang Chủ với dữ liệu từ Backend...");
    const featuredList = document.getElementById('featured-comics-list');
    const latestUpdatesList = document.getElementById('latest-updates-list');
    const topDayList = document.getElementById('top-day-list');
    const topWeekList = document.getElementById('top-week-list');
    const topMonthList = document.getElementById('top-month-list');

    if (!featuredList || !latestUpdatesList || !topDayList || !topWeekList || !topMonthList) {
        console.error("Một hoặc nhiều phần tử cho trang chủ không được tìm thấy.");
        return;
    }

    // Hiển thị trạng thái loading
    featuredList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 col-span-full text-center py-10">Đang tải truyện nổi bật...</p>';
    latestUpdatesList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 col-span-full text-center py-10">Đang tải truyện mới cập nhật...</p>';
    topDayList.innerHTML = '<li>Đang tải...</li>';
    topWeekList.innerHTML = '<li>Đang tải...</li>';
    topMonthList.innerHTML = '<li>Đang tải...</li>';

    try {
        // Lấy template card truyện
        const comicCardTemplate = await fetch('components/comic-card.html').then(res => res.text());

        // Hàm render danh sách truyện
        const renderComics = (element, comicsData, placeholderMessage) => {
            element.innerHTML = ''; // Xóa loading
            if (!comicsData || comicsData.length === 0) {
                element.innerHTML = `<p class="text-gray-500 dark:text-gray-400 col-span-full text-center py-10">${placeholderMessage}</p>`;
                return;
            }
            comicsData.forEach(comic => {
                const cardHtml = populateComicCard(comicCardTemplate, comic);
                element.insertAdjacentHTML('beforeend', cardHtml);
            });
        };
        
        // Hàm render bảng xếp hạng
        const renderRankingList = (listElement, comicsData, placeholderMessage) => {
            listElement.innerHTML = ''; // Xóa loading
            if (!comicsData || comicsData.length === 0) {
                listElement.innerHTML = `<li class="p-2 text-gray-500 dark:text-gray-400">${placeholderMessage}</li>`;
                return;
            }
            comicsData.slice(0, 5).forEach((comic, index) => { // Chỉ hiển thị top 5
                const listItem = `
                    <li class="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <a href="comic-detail.html?id=${comic._id}" class="truncate flex-grow text-sm hover:text-blue-500 dark:hover:text-blue-400">
                            <span class="font-bold text-blue-600 dark:text-blue-500 mr-2">${index + 1}.</span> ${comic.title}
                        </a>
                        <span class="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0"><i class="fas fa-eye mr-1"></i>${comic.views ? comic.views.toLocaleString() : '0'}</span>
                    </li>`;
                listElement.insertAdjacentHTML('beforeend', listItem);
            });
        };

        // Lấy truyện nổi bật (ví dụ: 6 truyện xem nhiều nhất)
        const featuredResponse = await apiRequest('/stories?limit=6&sort=-views');
        if (featuredResponse.success) {
            renderComics(featuredList, featuredResponse.data, 'Không có truyện nổi bật.');
        } else {
            featuredList.innerHTML = `<p class="text-red-500 col-span-full text-center py-10">Lỗi tải truyện nổi bật: ${featuredResponse.error}</p>`;
        }

        // Lấy truyện mới cập nhật (ví dụ: 12 truyện mới nhất)
        const latestResponse = await apiRequest('/stories?limit=12&sort=-updatedAt');
        if (latestResponse.success) {
            renderComics(latestUpdatesList, latestResponse.data, 'Chưa có truyện mới cập nhật.');
        } else {
            latestUpdatesList.innerHTML = `<p class="text-red-500 col-span-full text-center py-10">Lỗi tải truyện mới cập nhật: ${latestResponse.error}</p>`;
        }
        
        // Lấy bảng xếp hạng (ví dụ: Top Ngày, Tuần, Tháng đều lấy theo views giảm dần cho đơn giản)
        // Trong thực tế, bạn cần API riêng hoặc logic phức tạp hơn cho Top Tuần/Tháng
        const topDayResponse = await apiRequest('/stories?sort=-views&limit=5'); // Giả sử top ngày là top views
        if (topDayResponse.success) {
            renderRankingList(topDayList, topDayResponse.data, 'Chưa có BXH Ngày.');
            renderRankingList(topWeekList, topDayResponse.data, 'Chưa có BXH Tuần.'); // Cần API riêng
            renderRankingList(topMonthList, topDayResponse.data, 'Chưa có BXH Tháng.'); // Cần API riêng
        } else {
            const errorMsg = `<li class="p-2 text-red-500">Lỗi tải BXH: ${topDayResponse.error}</li>`;
            topDayList.innerHTML = errorMsg;
            topWeekList.innerHTML = errorMsg;
            topMonthList.innerHTML = errorMsg;
        }

    } catch (error) {
        console.error("Lỗi khởi tạo trang chủ:", error);
        const errorMsg = `<p class="text-red-500 col-span-full text-center py-10">Đã xảy ra lỗi khi tải dữ liệu: ${error.message}</p>`;
        if (featuredList) featuredList.innerHTML = errorMsg;
        if (latestUpdatesList) latestUpdatesList.innerHTML = errorMsg;
        // (Thêm cho ranking lists nếu muốn)
    }
}

export { initHomePage };

console.log("home.js đã được tải và sẵn sàng tương tác với backend.");
