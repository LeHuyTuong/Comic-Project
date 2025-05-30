// comic-frontend/js/category.js
async function initCategoryPage() {
    console.log("Đang khởi tạo Trang Thể Loại với dữ liệu từ Backend...");
    const categoryNameElement = document.getElementById('category-name')?.querySelector('span');
    const categoryComicsList = document.getElementById('category-comics-list');
    const filterStatusSelect = document.getElementById('filter-status');
    const sortBySelect = document.getElementById('sort-by');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const paginationContainer = document.getElementById('pagination');


    if (!categoryNameElement || !categoryComicsList || !filterStatusSelect || !sortBySelect || !applyFiltersBtn || !paginationContainer) {
        console.error("Một hoặc nhiều phần tử cho trang thể loại không được tìm thấy.");
        if(categoryComicsList) categoryComicsList.innerHTML = '<p class="text-red-500 col-span-full text-center py-10">Lỗi giao diện trang thể loại.</p>';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const genreQuery = params.get('genre'); // ví dụ: 'action', 'romance'

    if (!genreQuery) {
        categoryNameElement.textContent = 'Không xác định';
        categoryComicsList.innerHTML = '<p class="text-red-500 col-span-full text-center py-10">Vui lòng chọn một thể loại từ menu.</p>';
        return;
    }

    const displayGenre = genreQuery.charAt(0).toUpperCase() + genreQuery.slice(1);
    categoryNameElement.textContent = displayGenre;
    document.title = `Thể Loại: ${displayGenre} - Web Đọc Truyện`;

    let currentPage = parseInt(params.get('page')) || 1;

    async function fetchAndDisplayComics(page = 1) {
        currentPage = page;
        categoryComicsList.innerHTML = '<p class="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">Đang tải danh sách truyện...</p>';
        paginationContainer.innerHTML = ''; // Xóa phân trang cũ

        try {
            const statusFilter = filterStatusSelect.value;
            const sortOption = sortBySelect.value;

            let apiEndpoint = `/stories?genre=${encodeURIComponent(genreQuery)}&page=${currentPage}&limit=18`; // 18 truyện mỗi trang

            if (statusFilter !== 'all') {
                apiEndpoint += `&status=${statusFilter}`;
            }
            if (sortOption) {
                // Backend xử lý sort: ví dụ 'name_asc' -> sort=title, 'views_desc' -> sort=-views
                let sortQuery;
                switch(sortOption) {
                    case 'name_asc': sortQuery = 'title'; break;
                    case 'name_desc': sortQuery = '-title'; break;
                    case 'views_desc': sortQuery = '-views'; break;
                    case 'updated_desc': sortQuery = '-updatedAt'; break;
                    default: sortQuery = '-updatedAt';
                }
                apiEndpoint += `&sort=${sortQuery}`;
            }

            const response = await apiRequest(apiEndpoint);

            if (response.success && response.data) {
                const comics = response.data;
                const comicCardTemplate = await fetch('components/comic-card.html').then(res => res.text());
                
                categoryComicsList.innerHTML = ''; // Xóa loading
                if (comics.length === 0) {
                    categoryComicsList.innerHTML = `<p class="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">Không có truyện nào thuộc thể loại "${displayGenre}" với bộ lọc hiện tại.</p>`;
                } else {
                    comics.forEach(comic => {
                        const cardHtml = populateComicCard(comicCardTemplate, comic);
                        categoryComicsList.insertAdjacentHTML('beforeend', cardHtml);
                    });
                }
                renderPagination(response.pagination, response.total, response.count);
            } else {
                throw new Error(response.error || 'Không thể tải danh sách truyện.');
            }

        } catch (error) {
            console.error(`Lỗi tải truyện cho thể loại ${genreQuery}:`, error);
            categoryComicsList.innerHTML = `<p class="text-red-500 col-span-full text-center py-10">Lỗi tải danh sách truyện: ${error.message}</p>`;
        }
    }
    
    function renderPagination(paginationData, totalItems, itemsOnPage) {
        if (!paginationData && totalItems <= itemsOnPage) { // Không cần phân trang nếu chỉ có 1 trang
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '<ul class="inline-flex items-center -space-x-px">';
        const limit = 18; // Số item mỗi trang, cần đồng bộ với API
        const totalPages = Math.ceil(totalItems / limit);

        // Nút Previous
        if (paginationData && paginationData.prev) {
            paginationHTML += `<li><a href="#" data-page="${paginationData.prev.page}" class="pagination-link py-2 px-3 ml-0 leading-tight text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Trước</a></li>`;
        } else {
            paginationHTML += `<li><span class="py-2 px-3 ml-0 leading-tight text-gray-400 bg-white rounded-l-lg border border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500">Trước</span></li>`;
        }

        // Số trang (hiển thị một vài trang xung quanh trang hiện tại)
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        if (totalPages > maxPagesToShow && endPage - startPage + 1 < maxPagesToShow) {
             startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }


        if (startPage > 1) {
            paginationHTML += `<li><a href="#" data-page="1" class="pagination-link py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">1</a></li>`;
            if (startPage > 2) {
                paginationHTML += `<li><span class="py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">...</span></li>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            if (i === currentPage) {
                paginationHTML += `<li><span aria-current="page" class="z-10 py-2 px-3 leading-tight text-blue-600 bg-blue-50 border border-blue-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white">${i}</span></li>`;
            } else {
                paginationHTML += `<li><a href="#" data-page="${i}" class="pagination-link py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">${i}</a></li>`;
            }
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<li><span class="py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">...</span></li>`;
            }
            paginationHTML += `<li><a href="#" data-page="${totalPages}" class="pagination-link py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">${totalPages}</a></li>`;
        }


        // Nút Next
        if (paginationData && paginationData.next) {
            paginationHTML += `<li><a href="#" data-page="${paginationData.next.page}" class="pagination-link py-2 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Sau</a></li>`;
        } else {
            paginationHTML += `<li><span class="py-2 px-3 leading-tight text-gray-400 bg-white rounded-r-lg border border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500">Sau</span></li>`;
        }

        paginationHTML += '</ul>';
        paginationContainer.innerHTML = paginationHTML;

        // Gắn event listener cho các nút phân trang
        document.querySelectorAll('.pagination-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.closest('a').dataset.page);
                const currentUrlParams = new URLSearchParams(window.location.search);
                currentUrlParams.set('page', page);
                history.pushState(null, '', `${window.location.pathname}?${currentUrlParams.toString()}`);
                fetchAndDisplayComics(page);
            });
        });
    }


    applyFiltersBtn.addEventListener('click', () => fetchAndDisplayComics(1)); // Khi lọc, về trang 1
    filterStatusSelect.addEventListener('change', () => fetchAndDisplayComics(1));
    sortBySelect.addEventListener('change', () => fetchAndDisplayComics(1));
    
    // Tải lần đầu
    fetchAndDisplayComics(currentPage);

    // Xử lý khi người dùng nhấn nút back/forward của trình duyệt
    window.addEventListener('popstate', () => {
        const newParams = new URLSearchParams(window.location.search);
        const newPage = parseInt(newParams.get('page')) || 1;
        fetchAndDisplayComics(newPage);
    });
}
console.log("category.js đã được tải và sẵn sàng tương tác với backend.");
