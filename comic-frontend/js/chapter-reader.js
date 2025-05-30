// comic-frontend/js/chapter-reader.js
async function initChapterReaderPage() {
    console.log("Đang khởi tạo Trang Đọc Truyện với dữ liệu từ Backend...");
    const chapterImagesContainer = document.getElementById('chapter-images');
    const comicTitleElement = document.getElementById('comic-title-reader');
    const chapterTitleElement = document.getElementById('chapter-title-reader');
    const chapterSelect = document.getElementById('chapter-select');
    const prevChapterBtn = document.getElementById('prev-chapter-btn');
    const nextChapterBtn = document.getElementById('next-chapter-btn');

    if (!chapterImagesContainer || !comicTitleElement || !chapterTitleElement || !chapterSelect || !prevChapterBtn || !nextChapterBtn) {
        console.error("Một hoặc nhiều phần tử cho trang đọc truyện không được tìm thấy.");
        if(chapterImagesContainer) chapterImagesContainer.innerHTML = '<p class="text-red-500 p-5 text-center">Lỗi giao diện đọc truyện. Vui lòng thử lại.</p>';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const comicId = params.get('comicId');
    let currentChapterId = params.get('chapterId');

    if (!comicId || !currentChapterId) {
        chapterImagesContainer.innerHTML = '<p class="text-red-500 text-center p-5">Thiếu thông tin truyện hoặc chương để hiển thị.</p>';
        return;
    }

    chapterImagesContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center p-10">Đang tải dữ liệu chương...</p>';

    try {
        // Lấy thông tin truyện (để hiển thị tên truyện)
        const comicResponse = await apiRequest(`/stories/${comicId}`);
        if (!comicResponse.success || !comicResponse.data) {
            throw new Error(comicResponse.error || 'Không tìm thấy thông tin truyện.');
        }
        const comic = comicResponse.data;
        comicTitleElement.textContent = comic.title;
        document.title = `Đọc ${comic.title} - Web Đọc Truyện`;

        // Lấy tất cả các chương của truyện này để tạo dropdown và điều hướng
        const chaptersResponse = await apiRequest(`/stories/${comicId}/chapters`);
        if (!chaptersResponse.success || !chaptersResponse.data || chaptersResponse.data.length === 0) {
            throw new Error(chaptersResponse.error || 'Không tìm thấy danh sách chương cho truyện này.');
        }
        const allChaptersForComic = chaptersResponse.data; // API đã sort chapterNumber tăng dần

        // Điền vào chapter select dropdown (sắp xếp theo chapterNumber để dễ chọn)
        chapterSelect.innerHTML = '';
        allChaptersForComic.forEach(chap => {
            const option = document.createElement('option');
            option.value = chap._id; // Sử dụng _id của chapter
            option.textContent = chap.title || `Chương ${chap.chapterNumber}`;
            if (chap._id === currentChapterId) {
                option.selected = true;
            }
            chapterSelect.appendChild(option);
        });

        // Hàm để tải và hiển thị nội dung một chương cụ thể
        const loadChapterContent = async (chapterIdToLoad) => {
            currentChapterId = chapterIdToLoad; // Cập nhật chapter ID hiện tại
            // Cập nhật URL mà không tải lại trang (tùy chọn)
            const newUrl = `chapter-reader.html?comicId=${comicId}&chapterId=${chapterIdToLoad}`;
            history.pushState({ path: newUrl }, '', newUrl);

            chapterImagesContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center p-10">Đang tải ảnh truyện...</p>';

            // Lấy chi tiết chương hiện tại (bao gồm mảng 'pages')
            const currentChapterDetailsResponse = await apiRequest(`/stories/${comicId}/chapters/${chapterIdToLoad}`);
            if (!currentChapterDetailsResponse.success || !currentChapterDetailsResponse.data) {
                chapterImagesContainer.innerHTML = `<p class="text-red-500 text-center p-5">Lỗi tải nội dung chương: ${currentChapterDetailsResponse.error || 'Không tìm thấy chương'}</p>`;
                return;
            }
            const currentChapter = currentChapterDetailsResponse.data;
            chapterTitleElement.textContent = currentChapter.title || `Chương ${currentChapter.chapterNumber}`;

            if (currentChapter.pages && currentChapter.pages.length > 0) {
                let imagesHTML = '';
                currentChapter.pages.forEach((imageUrl, index) => {
                    // Sử dụng ảnh placeholder nếu URL không hợp lệ hoặc để test
                    const actualImageUrl = imageUrl && imageUrl.startsWith('http') ? imageUrl : `https://placehold.co/800x1200/2c3e50/ecf0f1?text=${encodeURIComponent(currentChapter.title || 'Trang')}+${index + 1}&font=montserrat`;
                    imagesHTML += `<img src="${actualImageUrl}" alt="Trang ${index + 1} - ${currentChapter.title}" class="mb-0.5" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/800x1200/e74c3c/ffffff?text=Lỗi+tải+ảnh&font=montserrat';">`;
                });
                chapterImagesContainer.innerHTML = imagesHTML;
            } else {
                chapterImagesContainer.innerHTML = `<p class="text-gray-500 dark:text-gray-400 text-center p-10">Chương này chưa có nội dung hình ảnh.</p>`;
            }
            window.scrollTo({ top: 0, behavior: 'auto' }); // Cuộn lên đầu trang khi tải chương mới

            // Cập nhật nút điều hướng Previous/Next
            const currentIndexInAllChapters = allChaptersForComic.findIndex(c => c._id === chapterIdToLoad);

            // Nút "Chap Sau" (chương có chapterNumber lớn hơn, hoặc index lớn hơn trong mảng đã sort tăng dần)
            if (currentIndexInAllChapters < allChaptersForComic.length - 1) {
                nextChapterBtn.href = `chapter-reader.html?comicId=${comicId}&chapterId=${allChaptersForComic[currentIndexInAllChapters + 1]._id}`;
                nextChapterBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                nextChapterBtn.href = '#';
                nextChapterBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }

            // Nút "Chap Trước" (chương có chapterNumber nhỏ hơn, hoặc index nhỏ hơn)
            if (currentIndexInAllChapters > 0) {
                prevChapterBtn.href = `chapter-reader.html?comicId=${comicId}&chapterId=${allChaptersForComic[currentIndexInAllChapters - 1]._id}`;
                prevChapterBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                prevChapterBtn.href = '#';
                prevChapterBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
            // Cập nhật giá trị được chọn trong dropdown
            chapterSelect.value = chapterIdToLoad;
        };

        // Tải nội dung chương ban đầu
        await loadChapterContent(currentChapterId);

        // Listener cho dropdown chọn chương
        chapterSelect.addEventListener('change', (event) => {
            loadChapterContent(event.target.value);
        });

        // Listener cho nút điều hướng (để JS xử lý thay vì tải lại trang hoàn toàn)
        const handleNavButtonClick = (buttonElement, event) => {
            if (buttonElement.classList.contains('cursor-not-allowed')) {
                event.preventDefault();
            } else {
                const targetChapterId = new URL(buttonElement.href).searchParams.get('chapterId');
                if (targetChapterId) {
                    event.preventDefault(); // Ngăn điều hướng mặc định
                    loadChapterContent(targetChapterId);
                }
            }
        };
        prevChapterBtn.addEventListener('click', (e) => handleNavButtonClick(prevChapterBtn, e));
        nextChapterBtn.addEventListener('click', (e) => handleNavButtonClick(nextChapterBtn, e));

        // Điều hướng bằng phím mũi tên
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { // Chap trước
                if (!prevChapterBtn.classList.contains('cursor-not-allowed')) {
                    prevChapterBtn.click();
                }
            } else if (e.key === 'ArrowRight') { // Chap sau
                 if (!nextChapterBtn.classList.contains('cursor-not-allowed')) {
                    nextChapterBtn.click();
                }
            }
        });

    } catch (error) {
        console.error("Lỗi khởi tạo trang đọc truyện:", error);
        chapterImagesContainer.innerHTML = `<p class="text-red-500 text-center p-10">Đã xảy ra lỗi khi tải dữ liệu chương: ${error.message}</p>`;
        // Vô hiệu hóa các nút điều khiển nếu có lỗi nghiêm trọng
        prevChapterBtn.classList.add('opacity-50', 'cursor-not-allowed');
        nextChapterBtn.classList.add('opacity-50', 'cursor-not-allowed');
        chapterSelect.disabled = true;
    }
}
console.log("chapter-reader.js đã được tải và sẵn sàng tương tác với backend.");

