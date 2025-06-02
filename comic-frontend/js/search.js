// comic-frontend/js/search.js
async function initSearchPage() {
    console.log("Đang khởi tạo Trang Tìm Kiếm với dữ liệu từ Backend...");
    const searchForm = document.getElementById('advanced-search-form');
    const searchResultsList = document.getElementById('search-results-list');
    const searchCategorySelect = document.getElementById('search-category');
    const paginationContainer = document.getElementById('search-pagination'); // Thêm ID này vào search.html

    if (!searchForm || !searchResultsList || !searchCategorySelect || !paginationContainer) {
        console.error("Một hoặc nhiều phần tử cho trang tìm kiếm không được tìm thấy.");
        if(searchResultsList) searchResultsList.innerHTML = '<p class="col-span-full text-center py-10 text-red-500">Lỗi giao diện trang tìm kiếm.</p>';
        return;
    }

    // Tải danh sách thể loại cho dropdown
    try {
        const categoriesResponse = await apiRequest('/stories/categories'); // Giả sử có endpoint này ở backend
                                                                        // Hoặc lấy từ một nguồn cố định nếu không có API
        if (categoriesResponse && categoriesResponse.success && categoriesResponse.data) {
            searchCategorySelect.innerHTML = '<option value="">Tất cả thể loại</option>'; // Giữ lại option mặc định
            categoriesResponse.data.forEach(category => {
                // Giả sử category là một string hoặc có trường name
                const categoryName = typeof category === 'string' ? category : category.name;
                const option = document.createElement('option');
                option.value = categoryName.toLowerCase(); // Hoặc ID nếu backend dùng ID
                option.textContent = categoryName;
                searchCategorySelect.appendChild(option);
            });
        } else {
             console.warn("Không thể tải danh sách thể loại cho tìm kiếm:", categoriesResponse ? categoriesResponse.error : "Lỗi không xác định");
             // Sử dụng danh sách thể loại mặc định nếu API lỗi
            const defaultCategories = ["Action", "Comedy", "Romance", "Fantasy", "Manhua", "Adventure"];
            searchCategorySelect.innerHTML = '<option value="">Tất cả thể loại</option>';
            defaultCategories.forEach(catName => {
                const option = document.createElement('option');
                option.value = catName.toLowerCase();
                option.textContent = catName;
                searchCategorySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Lỗi tải thể loại cho tìm kiếm:", error);
    }


    let currentSearchPage = 1;
    let currentSearchParams = new URLSearchParams();


    async function performSearch(page = 1) {
        currentSearchPage = page;
        searchResultsList.innerHTML = '<p class="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">Đang tìm kiếm...</p>';
        paginationContainer.innerHTML = ''; // Xóa phân trang cũ

        const formData = new FormData(searchForm);
        const params = new URLSearchParams();
        for (const pair of formData) {
            if (pair[1]) { // Chỉ thêm vào params nếu có giá trị
               params.append(pair[0], pair[1]);
            }
        }
        params.set('page', currentSearchPage);
        params.set('limit', 18); // 18 truyện mỗi trang
        currentSearchParams = params; // Lưu lại params hiện tại cho phân trang

        // Cập nhật URL trình duyệt
        history.pushState(null, '', `${window.location.pathname}?${params.toString()}`);


        try {
            const response = await apiRequest(`/stories?${params.toString()}`);

            if (response.success && response.data) {
                const comics = response.data;
                const comicCardTemplate = await fetch('components/comic-card.html').then(res => res.text());

                searchResultsList.innerHTML = ''; // Xóa loading
                if (comics.length === 0) {
                    searchResultsList.innerHTML = '<p class="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">Không tìm thấy truyện nào phù hợp với tiêu chí của bạn.</p>';
                } else {
                    comics.forEach(comic => {
                        const cardHtml = populateComicCard(comicCardTemplate, comic);
                        searchResultsList.insertAdjacentHTML('beforeend', cardHtml);
                    });
                }
                renderSearchPagination(response.pagination, response.total, response.count);
            } else {
                throw new Error(response.error || 'Không thể thực hiện tìm kiếm.');
            }
        } catch (error) {
            console.error("Lỗi tìm kiếm:", error);
            searchResultsList.innerHTML = `<p class="col-span-full text-center text-red-500 py-10">Lỗi khi tìm kiếm: ${error.message}</p>`;
        }
    }
    
    function renderSearchPagination(paginationData, totalItems, itemsOnPage) {
        // Hàm renderPagination tương tự như trong category.js
        // Bạn có thể tách hàm này ra js/utils.js để tái sử dụng
        if (!paginationData && totalItems <= itemsOnPage) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '<ul class="inline-flex items-center -space-x-px">';
        const limit = 18;
        const totalPages = Math.ceil(totalItems / limit);

        // Nút Previous
        if (paginationData && paginationData.prev) {
            paginationHTML += `<li><a href="#" data-page="${paginationData.prev.page}" class="search-pagination-link py-2 px-3 ml-0 leading-tight text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Trước</a></li>`;
        } else {
            paginationHTML += `<li><span class="py-2 px-3 ml-0 leading-tight text-gray-400 bg-white rounded-l-lg border border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500">Trước</span></li>`;
        }

        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentSearchPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
         if (totalPages > maxPagesToShow && endPage - startPage + 1 < maxPagesToShow) {
             startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        if (startPage > 1) {
            paginationHTML += `<li><a href="#" data-page="1" class="search-pagination-link py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">1</a></li>`;
            if (startPage > 2) {
                paginationHTML += `<li><span class="py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">...</span></li>`;
            }
        }
        for (let i = startPage; i <= endPage; i++) {
            if (i === currentSearchPage) {
                paginationHTML += `<li><span aria-current="page" class="z-10 py-2 px-3 leading-tight text-blue-600 bg-blue-50 border border-blue-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white">${i}</span></li>`;
            } else {
                paginationHTML += `<li><a href="#" data-page="${i}" class="search-pagination-link py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">${i}</a></li>`;
            }
        }
        if (endPage < totalPages) {
             if (endPage < totalPages - 1) {
                paginationHTML += `<li><span class="py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">...</span></li>`;
            }
            paginationHTML += `<li><a href="#" data-page="${totalPages}" class="search-pagination-link py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">${totalPages}</a></li>`;
        }

        // Nút Next
        if (paginationData && paginationData.next) {
            paginationHTML += `<li><a href="#" data-page="${paginationData.next.page}" class="search-pagination-link py-2 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Sau</a></li>`;
        } else {
            paginationHTML += `<li><span class="py-2 px-3 leading-tight text-gray-400 bg-white rounded-r-lg border border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500">Sau</span></li>`;
        }
        paginationHTML += '</ul>';
        paginationContainer.innerHTML = paginationHTML;

        document.querySelectorAll('.search-pagination-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.closest('a').dataset.page);
                performSearch(page);
            });
        });
    }


    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        performSearch(1); // Khi submit form, tìm từ trang 1
    });

    // Kiểm tra nếu có query params trên URL khi tải trang (ví dụ từ bookmark hoặc link trực tiếp)
    const initialUrlParams = new URLSearchParams(window.location.search);
    if (initialUrlParams.has('name') || initialUrlParams.has('category') || initialUrlParams.has('author') || initialUrlParams.has('status')) {
        // Điền form từ URL params
        document.getElementById('search-name').value = initialUrlParams.get('name') || '';
        document.getElementById('search-author').value = initialUrlParams.get('author') || '';
        document.getElementById('search-category').value = initialUrlParams.get('category') || '';
        document.getElementById('search-status').value = initialUrlParams.get('status') || '';
        document.getElementById('search-sort').value = initialUrlParams.get('sort') || 'relevance'; // Giả sử 'relevance' là giá trị mặc định
        currentSearchPage = parseInt(initialUrlParams.get('page')) || 1;
        performSearch(currentSearchPage);
    }
     // Xử lý khi người dùng nhấn nút back/forward của trình duyệt
    window.addEventListener('popstate', () => {
        const newParams = new URLSearchParams(window.location.search);
        // Điền lại form từ newParams và thực hiện tìm kiếm
        document.getElementById('search-name').value = newParams.get('name') || '';
        document.getElementById('search-author').value = newParams.get('author') || '';
        document.getElementById('search-category').value = newParams.get('category') || '';
        document.getElementById('search-status').value = newParams.get('status') || '';
        document.getElementById('search-sort').value = newParams.get('sort') || 'relevance';
        const newPage = parseInt(newParams.get('page')) || 1;
        performSearch(newPage);
    });
}
export { initSearchPage };

console.log("search.js đã được tải và sẵn sàng tương tác với backend.");

// Endpoint lấy danh sách thể loại ở backend (ví dụ)
// Trong comic-backend/routes/storyRoutes.js, thêm:
/*
router.get('/categories', async (req, res) => {
    try {
        const categories = await Story.distinct('genres');
        res.status(200).json({ success: true, data: categories.sort() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Không thể lấy danh sách thể loại' });
    }
});
*/
// Bạn cần thêm route này vào backend và đảm bảo nó hoạt động.
