// comic-frontend/js/main.js

// Hàm để tải các component HTML (navbar, footer)
async function loadComponent(componentPath, targetElementId, callback) {
  try {
    const response = await fetch(componentPath);
    if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}, đường dẫn: ${componentPath}`);
    const html = await response.text();
    const targetElement = document.getElementById(targetElementId);
    if (targetElement) {
        targetElement.innerHTML = html;
        // Thực thi script bên trong component nếu có (ví dụ: script trong navbar.html)
        const scripts = targetElement.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            // Tạo một script element mới để trình duyệt thực thi nó
            const newScript = document.createElement('script');
            if (scripts[i].src) {
                newScript.src = scripts[i].src;
            } else {
                newScript.textContent = scripts[i].textContent;
            }
            // Thêm type="module" nếu script gốc có
            if (scripts[i].type === 'module') {
                newScript.type = 'module';
            }
            document.head.appendChild(newScript).parentNode.removeChild(newScript); // Một cách để thực thi script
        }

        if (callback && typeof callback === 'function') {
            callback(); // Gọi callback sau khi component được tải và script (nếu có) đã được thêm
        }
    } else {
        console.warn(`Không tìm thấy phần tử đích với ID '${targetElementId}' cho component '${componentPath}'.`);
    }
  } catch (error) {
    console.error(`Không thể tải component: ${componentPath}`, error);
    const targetElement = document.getElementById(targetElementId);
    if(targetElement) targetElement.innerHTML = `<p class="text-red-500">Lỗi tải ${componentPath.split('/').pop()}.</p>`;
  }
}

// Chuyển đổi Chế độ Tối/Sáng
function toggleDarkMode() {
    const htmlElement = document.documentElement;
    htmlElement.classList.toggle('dark');
    const isDarkMode = htmlElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDarkMode);

    // Cập nhật icon cho tất cả các nút chuyển chế độ tối
    const darkModeToggleButtons = document.querySelectorAll('.dark-mode-toggle-button');
    darkModeToggleButtons.forEach(button => {
        const icon = button.querySelector('i');
        if (icon) {
            if (isDarkMode) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    });
}

// Áp dụng chế độ tối đã lưu khi tải trang và thiết lập listener
function applyInitialDarkMode() {
    const htmlElement = document.documentElement;
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    const darkModeToggleButtons = document.querySelectorAll('.dark-mode-toggle-button');
     darkModeToggleButtons.forEach(button => {
        const icon = button.querySelector('i');
        if (icon) {
            if (htmlElement.classList.contains('dark')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
        // Đảm bảo chỉ có một listener được gắn
        button.removeEventListener('click', toggleDarkMode);
        button.addEventListener('click', toggleDarkMode);
    });
}

// Hàm tiện ích để điền dữ liệu vào template comic card
function populateComicCard(template, comic) {
    let populatedCard = template;
    // Sử dụng _id từ MongoDB
    populatedCard = populatedCard.replace(/{{comic_url}}/g, `comic-detail.html?id=${comic._id}`);
    populatedCard = populatedCard.replace(/{{image_url}}/g, comic.coverImage || 'assets/images/cover-placeholder.jpg');
    populatedCard = populatedCard.replace(/{{title}}/g, comic.title || 'Chưa có tiêu đề');
    const latestChapterName = comic.latest_chapter_info ? comic.latest_chapter_info.title : (comic.latest_chapter || 'Đang cập nhật'); // Giả sử backend có thể trả về latest_chapter_info
    populatedCard = populatedCard.replace(/{{latest_chapter_name}}/g, latestChapterName);
    populatedCard = populatedCard.replace(/{{views}}/g, comic.views ? comic.views.toLocaleString() : '0');
    return populatedCard;
}

// Hàm tiện ích để điền dữ liệu vào template chapter item
function populateChapterItem(template, chapter, comicId) {
    let populatedItem = template;
    // Sử dụng _id từ MongoDB cho chapter và comicId
    populatedItem = populatedItem.replace(/{{chapter_url}}/g, `chapter-reader.html?comicId=${comicId}&chapterId=${chapter._id}`);
    populatedItem = populatedItem.replace(/{{chapter_name}}/g, chapter.title || `Chương ${chapter.chapterNumber}`);
    const uploadDate = chapter.updatedAt ? new Date(chapter.updatedAt).toLocaleDateString('vi-VN') : 'N/A';
    populatedItem = populatedItem.replace(/{{upload_date}}/g, uploadDate);
    return populatedItem;
}


// Gọi applyInitialDarkMode khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    applyInitialDarkMode();
    // Các khởi tạo toàn cục khác có thể đặt ở đây
});

console.log("main.js đã được tải và các hàm đã được định nghĩa.");
