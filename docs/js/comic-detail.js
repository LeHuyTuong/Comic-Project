// comic-frontend/js/comic-detail.js
import { apiRequest } from './api.js';
import { populateChapterItem } from './main.js';

async function initComicDetailPage() {
    console.log("Đang khởi tạo Trang Chi Tiết Truyện với dữ liệu từ Backend...");
    const comicDetailContent = document.getElementById('comic-detail-content');
    if (!comicDetailContent) {
        console.error("Không tìm thấy phần tử nội dung chi tiết truyện.");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const comicId = params.get('id');

    if (!comicId) {
        comicDetailContent.innerHTML = '<p class="text-red-500 text-center p-6">Không tìm thấy ID truyện trong URL.</p>';
        return;
    }

    comicDetailContent.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center p-10">Đang tải thông tin truyện...</p>';

    try {
        // Lấy thông tin truyện
        const comicResponse = await apiRequest(`/stories/${comicId}`);
        if (!comicResponse.success || !comicResponse.data) {
            throw new Error(comicResponse.error || 'Không thể tải thông tin truyện.');
        }
        const comic = comicResponse.data;
        document.title = `${comic.title || 'Chi tiết truyện'} - Web Đọc Truyện`;

        // Lấy danh sách chương
        const chaptersResponse = await apiRequest(`/stories/${comicId}/chapters`);
        let chapters = [];
        if (chaptersResponse.success && chaptersResponse.data) {
            chapters = chaptersResponse.data; // API đã sắp xếp chương mới nhất ở đầu (chapterNumber giảm dần)
                                            // hoặc chapterNumber tăng dần tùy vào backend
                                            // Hiện tại backend sort chapterNumber tăng dần
        } else {
            console.warn("Không thể tải danh sách chương:", chaptersResponse.error);
        }
        
        comicDetailContent.innerHTML = `
            <div class="flex flex-col md:flex-row gap-6 md:gap-8">
                <div class="md:w-1/3 lg:w-1/4 flex-shrink-0">
                    <img src="${comic.coverImage || 'assets/images/cover-placeholder.jpg'}" alt="Bìa truyện ${comic.title}" class="w-full h-auto object-cover rounded-lg shadow-xl aspect-[2/3]" onerror="this.onerror=null;this.src='https://placehold.co/400x600/eeeeee/999999?text=Ảnh+Bìa&font=roboto';">
                </div>
                <div class="md:w-2/3 lg:w-3/4 space-y-3">
                    <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 break-words">${comic.title || 'Chưa có tiêu đề'}</h1>
                    <p class="text-gray-700 dark:text-gray-300"><strong class="font-semibold">Tác giả:</strong> ${comic.author || 'Đang cập nhật'}</p>
                    <p class="text-gray-700 dark:text-gray-300"><strong class="font-semibold">Thể loại:</strong> ${comic.genres && comic.genres.length > 0 ? comic.genres.join(', ') : 'Chưa rõ'}</p>
                    <p class="text-gray-700 dark:text-gray-300"><strong class="font-semibold">Trạng thái:</strong> ${comic.status === 'ongoing' ? 'Đang cập nhật' : (comic.status === 'completed' ? 'Hoàn thành' : 'Tạm ngưng')}</p>
                    <p class="text-gray-700 dark:text-gray-300"><strong class="font-semibold">Lượt xem:</strong> ${comic.views ? comic.views.toLocaleString() : '0'}</p>
                    <div class="mt-2 flex items-center">
                        <strong class="font-semibold mr-2">Đánh giá:</strong>
                        <span class="text-yellow-400">
                            ${[...Array(5)].map((_, i) => `<i class="fa-${i < Math.round(comic.rating || 0) ? 'solid' : 'regular'} fa-star"></i>`).join('')}
                        </span>
                        <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">(${comic.rating || 0}/5)</span>
                    </div>
                    <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <strong class="font-semibold block mb-1 text-gray-800 dark:text-gray-200">Mô tả:</strong>
                        <p class="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">${comic.description || 'Chưa có mô tả.'}</p>
                    </div>
                    <div class="mt-4 flex flex-wrap gap-3">
                        <a href="${chapters.length > 0 ? `chapter-reader.html?comicId=${comic._id}&chapterId=${chapters[0]._id}` : '#'}" 
                           class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-lg shadow transition-colors text-center text-sm sm:text-base ${chapters.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
                            <i class="fas fa-book-open mr-1 sm:mr-2"></i>Đọc từ đầu
                        </a>
                        <button id="follow-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow transition-colors text-sm sm:text-base">
                            <i class="fas fa-heart mr-1 sm:mr-2"></i>Theo dõi
                        </button>
                         <a href="${chapters.length > 0 ? `chapter-reader.html?comicId=${comic._id}&chapterId=${chapters[chapters.length - 1]._id}` : '#'}" 
                           class="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-5 rounded-lg shadow transition-colors text-center text-sm sm:text-base ${chapters.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
                            <i class="fas fa-list-ol mr-1 sm:mr-2"></i>Đọc mới nhất
                        </a>
                    </div>
                </div>
            </div>

            <div class="mt-10">
                <h2 class="text-xl sm:text-2xl font-bold mb-4 border-b-2 border-blue-500 pb-2">Danh Sách Chương</h2>
                <div id="chapter-list-container" class="max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-700/50 rounded-md shadow p-2 space-y-1">
                    </div>
            </div>
        `;

        const chapterListContainer = document.getElementById('chapter-list-container');
        if (chapters && chapters.length > 0) {
            const chapterItemTemplate = await fetch('components/chapter-item.html').then(res => res.text());
            // Sắp xếp chương theo chapterNumber giảm dần (mới nhất lên đầu) nếu backend chưa làm
            // chapters.sort((a, b) => b.chapterNumber - a.chapterNumber); 
            // Backend đã sort chapterNumber tăng dần, nên ta đảo ngược lại để hiển thị mới nhất lên đầu
            chapters.reverse().forEach(chapter => { 
                const chapterHtml = populateChapterItem(chapterItemTemplate, chapter, comic._id);
                chapterListContainer.insertAdjacentHTML('beforeend', chapterHtml);
            });
        } else {
            chapterListContainer.innerHTML = '<p class="p-4 text-gray-500 dark:text-gray-400 text-center">Chưa có chương nào cho truyện này.</p>';
        }

        const followButton = document.getElementById('follow-btn');
        if (followButton) {
            followButton.addEventListener('click', () => {
                // Thay thế alert bằng modal hoặc thông báo tùy chỉnh
                alert('Chức năng theo dõi sẽ được phát triển trong tương lai!');
            });
        }

    } catch (error) {
        console.error("Lỗi khởi tạo trang chi tiết truyện:", error);
        comicDetailContent.innerHTML = `<p class="text-red-500 text-center p-10">Lỗi tải thông tin truyện: ${error.message}</p>`;
    }
}
export { initComicDetailPage };
console.log("comic-detail.js đã được tải và sẵn sàng tương tác với backend.");

