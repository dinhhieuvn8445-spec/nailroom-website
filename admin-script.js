// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    // Initialize sidebar navigation
    initSidebarNavigation();
    
    // Initialize file uploads
    initFileUploads();
    
    // Initialize editor toolbar
    initEditorToolbar();
    
    // Check authentication
    checkAuthentication();
}

// Sidebar Navigation
function initSidebarNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all content sections
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Show selected section
            const targetSection = document.getElementById(sectionId + '-section');
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// File Upload Handling
function initFileUploads() {
    const fileUploadAreas = document.querySelectorAll('.file-upload-area');
    
    fileUploadAreas.forEach(area => {
        const fileInput = area.querySelector('.file-input');
        
        area.addEventListener('click', () => {
            fileInput.click();
        });
        
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.style.borderColor = 'var(--admin-accent)';
            area.style.backgroundColor = 'var(--admin-hover)';
        });
        
        area.addEventListener('dragleave', (e) => {
            e.preventDefault();
            area.style.borderColor = 'var(--admin-border)';
            area.style.backgroundColor = 'var(--admin-bg-secondary)';
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.style.borderColor = 'var(--admin-border)';
            area.style.backgroundColor = 'var(--admin-bg-secondary)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload(files[0], area);
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0], area);
            }
        });
    });
}

function handleFileUpload(file, uploadArea) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    
    if (!allowedTypes.includes(file.type)) {
        showNotification('Định dạng file không được hỗ trợ!', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showNotification('File quá lớn! Vui lòng chọn file nhỏ hơn 10MB.', 'error');
        return;
    }
    
    // Show upload progress
    const progressBar = createProgressBar();
    uploadArea.appendChild(progressBar);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                uploadArea.removeChild(progressBar);
                showUploadSuccess(uploadArea, file);
                showNotification('Upload thành công!', 'success');
            }, 500);
        }
        
        progressBar.querySelector('.progress-fill').style.width = progress + '%';
        progressBar.querySelector('.progress-text').textContent = Math.round(progress) + '%';
    }, 200);
}

function createProgressBar() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'upload-progress';
    progressContainer.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
        <div class="progress-text">0%</div>
    `;
    
    // Add CSS for progress bar
    const style = document.createElement('style');
    style.textContent = `
        .upload-progress {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            text-align: center;
        }
        .progress-bar {
            width: 100%;
            height: 6px;
            background-color: var(--admin-bg-primary);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 10px;
        }
        .progress-fill {
            height: 100%;
            background-color: var(--admin-accent);
            width: 0%;
            transition: width 0.3s ease;
        }
        .progress-text {
            color: var(--admin-text-primary);
            font-size: 12px;
        }
    `;
    document.head.appendChild(style);
    
    return progressContainer;
}

function showUploadSuccess(uploadArea, file) {
    const icon = uploadArea.querySelector('i');
    const text = uploadArea.querySelector('p');
    
    if (file.type.startsWith('image/')) {
        icon.className = 'fas fa-image';
        text.textContent = `Đã tải lên: ${file.name}`;
    } else if (file.type.startsWith('video/')) {
        icon.className = 'fas fa-video';
        text.textContent = `Đã tải lên: ${file.name}`;
    }
    
    uploadArea.style.borderColor = 'var(--admin-success)';
    uploadArea.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
}

// Editor Toolbar
function initEditorToolbar() {
    const toolbarButtons = document.querySelectorAll('.editor-toolbar button');
    
    toolbarButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.querySelector('i').classList[1].split('-')[1];
            applyTextFormatting(action);
        });
    });
}

function applyTextFormatting(action) {
    const textarea = document.querySelector('.editor-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = selectedText;
    
    switch(action) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            break;
        case 'underline':
            formattedText = `<u>${selectedText}</u>`;
            break;
        case 'ul':
            formattedText = `\n- ${selectedText}`;
            break;
        case 'link':
            const url = prompt('Nhập URL:');
            if (url) {
                formattedText = `[${selectedText}](${url})`;
            }
            break;
    }
    
    if (formattedText !== selectedText) {
        textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start, start + formattedText.length);
    }
}

// Feature Management
function addFeature() {
    showAddFeatureModal();
}

function showAddFeatureModal() {
    const modal = new bootstrap.Modal(document.getElementById('addFeatureModal'));
    modal.show();
}

function addNewFeature() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('addFeatureModal'));
    const nameInput = document.querySelector('#addFeatureModal input[type="text"]');
    const descInput = document.querySelector('#addFeatureModal textarea');
    const iconSelect = document.querySelector('#addFeatureModal select');
    
    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    const icon = iconSelect.value;
    
    if (!name || !description) {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    // Add to sidebar feature list
    addFeatureToSidebar(name);
    
    // Add to features grid
    addFeatureToGrid(name, description, icon);
    
    // Clear form
    nameInput.value = '';
    descInput.value = '';
    iconSelect.selectedIndex = 0;
    
    modal.hide();
    showNotification('Đã thêm tính năng mới!', 'success');
}

function addFeatureToSidebar(name) {
    const featureList = document.querySelector('.feature-list');
    const featureItem = document.createElement('div');
    featureItem.className = 'feature-item';
    featureItem.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${name}</span>
        <div class="feature-controls">
            <button class="btn-edit" onclick="editFeature(this)"><i class="fas fa-edit"></i></button>
            <button class="btn-delete" onclick="deleteFeature(this)"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    featureList.appendChild(featureItem);
}

function addFeatureToGrid(name, description, icon) {
    const featuresGrid = document.querySelector('.features-grid');
    const addCard = document.querySelector('.add-feature-card');
    
    const featureCard = document.createElement('div');
    featureCard.className = 'feature-card';
    featureCard.innerHTML = `
        <div class="feature-icon">
            <i class="${icon}"></i>
        </div>
        <h6>${name}</h6>
        <p>${description}</p>
        <div class="feature-actions">
            <button class="btn btn-sm btn-outline-primary" onclick="editFeatureCard(this)">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteFeatureCard(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    featuresGrid.insertBefore(featureCard, addCard);
}

function editFeature(button) {
    const featureItem = button.closest('.feature-item');
    const nameSpan = featureItem.querySelector('span');
    const currentName = nameSpan.textContent;
    
    const newName = prompt('Nhập tên mới:', currentName);
    if (newName && newName.trim() !== '') {
        nameSpan.textContent = newName.trim();
        showNotification('Đã cập nhật tính năng!', 'success');
    }
}

function deleteFeature(button) {
    if (confirm('Bạn có chắc chắn muốn xóa tính năng này?')) {
        const featureItem = button.closest('.feature-item');
        featureItem.remove();
        showNotification('Đã xóa tính năng!', 'success');
    }
}

function editFeatureCard(button) {
    const card = button.closest('.feature-card');
    const name = card.querySelector('h6').textContent;
    const description = card.querySelector('p').textContent;
    
    const newName = prompt('Nhập tên mới:', name);
    if (newName && newName.trim() !== '') {
        card.querySelector('h6').textContent = newName.trim();
    }
    
    const newDesc = prompt('Nhập mô tả mới:', description);
    if (newDesc && newDesc.trim() !== '') {
        card.querySelector('p').textContent = newDesc.trim();
    }
    
    showNotification('Đã cập nhật tính năng!', 'success');
}

function deleteFeatureCard(button) {
    if (confirm('Bạn có chắc chắn muốn xóa tính năng này?')) {
        const card = button.closest('.feature-card');
        card.remove();
        showNotification('Đã xóa tính năng!', 'success');
    }
}

// Authentication
function checkAuthentication() {
    fetch('/api/auth-status')
        .then(response => response.json())
        .then(data => {
            if (!data.authenticated) {
                window.location.href = '/login.html';
            } else if (data.user.role !== 'admin') {
                showNotification('Bạn không có quyền truy cập trang này!', 'error');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Auth check error:', error);
        });
}

function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        fetch('/api/logout', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/';
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
        });
    }
}

// Save Functions
function saveHeroSection() {
    const formData = {
        videoTitle: document.querySelector('#hero-section input[type="text"]').value,
        videoUrl: document.querySelector('#hero-section input[type="url"]').value,
        description: document.querySelector('#hero-section textarea').value,
        icon: document.querySelector('#hero-section select').value
    };
    
    // Here you would typically send this data to your backend
    console.log('Saving hero section:', formData);
    showNotification('Đã lưu thay đổi!', 'success');
}

function saveContentSection() {
    const formData = {
        title: document.querySelector('#content-section input[type="text"]').value,
        shortDescription: document.querySelector('#content-section textarea:first-of-type').value,
        content: document.querySelector('#content-section .editor-content').value
    };
    
    // Here you would typically send this data to your backend
    console.log('Saving content section:', formData);
    showNotification('Đã lưu thay đổi!', 'success');
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="closeNotification(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 80px;
                right: 20px;
                background-color: var(--admin-bg-secondary);
                border: 1px solid var(--admin-border);
                border-radius: 6px;
                padding: 15px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                z-index: 1001;
                animation: slideIn 0.3s ease;
            }
            .notification-success {
                border-left: 4px solid var(--admin-success);
            }
            .notification-error {
                border-left: 4px solid var(--admin-danger);
            }
            .notification-info {
                border-left: 4px solid var(--admin-accent);
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--admin-text-primary);
            }
            .notification-close {
                background: none;
                border: none;
                color: var(--admin-text-muted);
                cursor: pointer;
                padding: 5px;
            }
            .notification-close:hover {
                color: var(--admin-text-primary);
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            closeNotification(notification.querySelector('.notification-close'));
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    notification.style.animation = 'slideOut 0.3s ease';
    
    // Add slideOut animation
    if (!document.querySelector('#slideout-animation')) {
        const style = document.createElement('style');
        style.id = 'slideout-animation';
        style.textContent = `
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const sidebar = document.querySelector('.admin-sidebar');
    sidebar.classList.toggle('show');
}

// Page Management Functions
// Removed duplicate functions - using the ones at the end of file

function addNewPage() {
    const pageName = prompt('Nhập tên trang mới:');
    if (pageName && pageName.trim() !== '') {
        const pageId = pageName.toLowerCase().replace(/\s+/g, '-');
        addPageToList(pageId, pageName);
        showNotification('Đã thêm trang mới!', 'success');
    }
}

function addPageToList(pageId, pageName) {
    const pageList = document.querySelector('.page-list');
    const pageItem = document.createElement('div');
    pageItem.className = 'page-item';
    pageItem.setAttribute('data-page', pageId);
    pageItem.innerHTML = `
        <i class="fas fa-file-alt"></i>
        <span>${pageName}</span>
        <div class="page-controls">
            <button class="btn-edit" onclick="editPage('${pageId}')"><i class="fas fa-edit"></i></button>
            <button class="btn-view" onclick="viewPage('${pageId}')"><i class="fas fa-eye"></i></button>
        </div>
    `;
    
    const addButton = pageList.nextElementSibling;
    pageList.appendChild(pageItem);
}

// Menu Management Functions
function addMenuItem() {
    const menuName = prompt('Nhập tên menu:');
    if (!menuName || menuName.trim() === '') return;
    
    const menuUrl = prompt('Nhập URL (ví dụ: /about.html):');
    if (!menuUrl || menuUrl.trim() === '') return;
    
    const menuIcon = prompt('Nhập class icon (ví dụ: fas fa-info):') || 'fas fa-link';
    
    addMenuItemToList(menuName.trim(), menuUrl.trim(), menuIcon.trim());
    showNotification('Đã thêm mục menu mới!', 'success');
}

function addMenuItemToList(name, url, icon) {
    const menuList = document.querySelector('.menu-items-list');
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.innerHTML = `
        <div class="menu-item-content">
            <i class="${icon}"></i>
            <span>${name}</span>
            <small>${url}</small>
        </div>
        <div class="menu-item-actions">
            <button class="btn btn-sm btn-outline-primary" onclick="editMenuItem(this)"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteMenuItem(this)"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    menuList.appendChild(menuItem);
}

function editMenuItem(button) {
    const menuItem = button.closest('.menu-item');
    const nameSpan = menuItem.querySelector('span');
    const urlSmall = menuItem.querySelector('small');
    const iconElement = menuItem.querySelector('i');
    
    const newName = prompt('Nhập tên mới:', nameSpan.textContent);
    if (newName && newName.trim() !== '') {
        nameSpan.textContent = newName.trim();
    }
    
    const newUrl = prompt('Nhập URL mới:', urlSmall.textContent);
    if (newUrl && newUrl.trim() !== '') {
        urlSmall.textContent = newUrl.trim();
    }
    
    const newIcon = prompt('Nhập class icon mới:', iconElement.className);
    if (newIcon && newIcon.trim() !== '') {
        iconElement.className = newIcon.trim();
    }
    
    showNotification('Đã cập nhật mục menu!', 'success');
}

function deleteMenuItem(button) {
    if (confirm('Bạn có chắc chắn muốn xóa mục menu này?')) {
        const menuItem = button.closest('.menu-item');
        menuItem.remove();
        showNotification('Đã xóa mục menu!', 'success');
    }
}

// Save Functions for new sections
function saveHeaderSection() {
    const formData = {
        websiteName: document.querySelector('#header-section input[placeholder="Nhập tên website"]').value,
        slogan: document.querySelector('#header-section input[placeholder="Nhập slogan"]').value,
        phone: document.querySelector('#header-section input[placeholder="Số điện thoại"]').value,
        email: document.querySelector('#header-section input[placeholder="Email"]').value,
        address: document.querySelector('#header-section input[placeholder="Địa chỉ"]').value
    };
    
    console.log('Saving header section:', formData);
    showNotification('Đã lưu thông tin header!', 'success');
}

function saveNavigation() {
    const menuItems = [];
    document.querySelectorAll('.menu-item').forEach(item => {
        const name = item.querySelector('span').textContent;
        const url = item.querySelector('small').textContent;
        const icon = item.querySelector('i').className;
        menuItems.push({ name, url, icon });
    });
    
    console.log('Saving navigation:', menuItems);
    showNotification('Đã lưu menu điều hướng!', 'success');
}

function saveFooterSection() {
    const formData = {
        companyInfo: document.querySelector('#footer-section textarea').value,
        socialLinks: [],
        contactInfo: {}
    };
    
    console.log('Saving footer section:', formData);
    showNotification('Đã lưu thông tin footer!', 'success');
}

function saveColors() {
    const colors = {};
    document.querySelectorAll('.color-picker-item').forEach(item => {
        const label = item.querySelector('label').textContent;
        const value = item.querySelector('.color-value').value;
        colors[label] = value;
    });
    
    console.log('Saving colors:', colors);
    showNotification('Đã áp dụng bảng màu mới!', 'success');
}

// Page Editor Functions
let currentEditingPage = null;
let editorMode = 'code'; // 'visual' or 'code'

function toggleEditorMode(mode) {
    editorMode = mode;
    const visualEditor = document.getElementById('visual-editor');
    const codeEditor = document.getElementById('code-editor');
    const visualBtn = document.getElementById('visual-mode-btn');
    const codeBtn = document.getElementById('code-mode-btn');
    
    if (mode === 'visual') {
        visualEditor.style.display = 'block';
        codeEditor.style.display = 'none';
        visualBtn.classList.add('active');
        codeBtn.classList.remove('active');
        
        // Sync content from code to visual
        const codeContent = document.getElementById('code-editor-content').value;
        document.getElementById('visual-editor-content').innerHTML = codeContent;
    } else {
        visualEditor.style.display = 'none';
        codeEditor.style.display = 'block';
        codeBtn.classList.add('active');
        visualBtn.classList.remove('active');
        
        // Sync content from visual to code
        const visualContent = document.getElementById('visual-editor-content').innerHTML;
        document.getElementById('code-editor-content').value = visualContent;
    }
}

function loadPageForEdit(pageName) {
    if (!pageName) return;
    
    currentEditingPage = pageName;
    document.getElementById('current-page-name').textContent = getPageDisplayName(pageName);
    document.getElementById('editing-page-status').textContent = getPageDisplayName(pageName);
    
    // Show loading state
    const codeEditor = document.getElementById('code-editor-content');
    const visualEditor = document.getElementById('visual-editor-content');
    
    codeEditor.value = 'Đang tải nội dung trang...';
    visualEditor.innerHTML = '<div class="editor-loading"><i class="fas fa-spinner"></i>Đang tải nội dung trang...</div>';
    
    // Load page content via AJAX
    fetch(`/admin/load-page/${pageName}`, {
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                codeEditor.value = data.content;
                visualEditor.innerHTML = data.content;
                
                // Mark page as being edited
                markPageAsEditing(pageName);
                
                showNotification(`Đã tải nội dung trang ${getPageDisplayName(pageName)}`, 'success');
            } else {
                throw new Error(data.message || 'Failed to load page');
            }
        })
        .catch(error => {
            console.error('Error loading page:', error);
            codeEditor.value = 'Lỗi khi tải nội dung trang. Vui lòng thử lại.';
            visualEditor.innerHTML = '<p>Lỗi khi tải nội dung trang. Vui lòng thử lại.</p>';
            showNotification('Lỗi khi tải nội dung trang', 'error');
        });
}

function getPageDisplayName(pageName) {
    const pageNames = {
        'index': 'Trang chủ',
        'gioi-thieu': 'Giới thiệu',
        'dich-vu': 'Dịch vụ',
        'gallery': 'Gallery',
        'blog': 'Blog',
        'lien-he': 'Liên hệ'
    };
    return pageNames[pageName] || pageName;
}

function markPageAsEditing(pageName) {
    // Remove editing class from all pages
    document.querySelectorAll('.page-item').forEach(item => {
        item.classList.remove('editing');
    });
    
    // Add editing class to current page
    const pageItems = document.querySelectorAll('.page-item');
    pageItems.forEach(item => {
        const pageText = item.querySelector('.page-name').textContent.toLowerCase();
        if ((pageName === 'index' && pageText.includes('trang chủ')) ||
            (pageName === 'gioi-thieu' && pageText.includes('giới thiệu')) ||
            (pageName === 'dich-vu' && pageText.includes('dịch vụ')) ||
            (pageName === 'gallery' && pageText.includes('gallery')) ||
            (pageName === 'blog' && pageText.includes('blog')) ||
            (pageName === 'lien-he' && pageText.includes('liên hệ'))) {
            item.classList.add('editing');
        }
    });
}

function savePage() {
    if (!currentEditingPage) {
        showNotification('Vui lòng chọn trang để chỉnh sửa', 'warning');
        return;
    }
    
    // Get content based on current editor mode
    let content;
    if (editorMode === 'visual') {
        content = document.getElementById('visual-editor-content').innerHTML;
    } else {
        content = document.getElementById('code-editor-content').value;
    }
    
    // Show saving status
    const lastSavedElement = document.getElementById('last-saved');
    lastSavedElement.innerHTML = '<span class="save-status saving"><i class="fas fa-spinner fa-spin"></i>Đang lưu...</span>';
    
    // Send to server
    fetch('/admin/save-page', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            page: currentEditingPage,
            content: content
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const now = new Date().toLocaleString('vi-VN');
            lastSavedElement.innerHTML = `<span class="save-status saved"><i class="fas fa-check"></i>${now}</span>`;
            showNotification(`Đã lưu trang ${getPageDisplayName(currentEditingPage)}`, 'success');
        } else {
            throw new Error(data.message || 'Lỗi khi lưu trang');
        }
    })
    .catch(error => {
        console.error('Error saving page:', error);
        lastSavedElement.innerHTML = '<span class="save-status error"><i class="fas fa-exclamation-triangle"></i>Lỗi lưu</span>';
        showNotification('Lỗi khi lưu trang: ' + error.message, 'error');
    });
}

function previewPage() {
    if (!currentEditingPage) {
        showNotification('Vui lòng chọn trang để xem trước', 'warning');
        return;
    }
    
    // Open preview in new window
    const previewUrl = `/${currentEditingPage === 'index' ? '' : currentEditingPage + '.html'}`;
    window.open(previewUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
}

// Visual Editor Functions
function formatText(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('visual-editor-content').focus();
}

function insertLink() {
    const url = prompt('Nhập URL:');
    if (url) {
        formatText('createLink', url);
    }
}

function insertImage() {
    const url = prompt('Nhập URL hình ảnh:');
    if (url) {
        formatText('insertImage', url);
    }
}

// Auto-save functionality
let autoSaveTimer;
function setupAutoSave() {
    const codeEditor = document.getElementById('code-editor-content');
    const visualEditor = document.getElementById('visual-editor-content');
    
    function triggerAutoSave() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            if (currentEditingPage) {
                savePage();
            }
        }, 30000); // Auto-save after 30 seconds of inactivity
    }
    
    codeEditor.addEventListener('input', triggerAutoSave);
    visualEditor.addEventListener('input', triggerAutoSave);
}

// Enhanced page management
function editPageContent(pageName) {
    // Switch to page editor section
    showSection('page-editor-section');
    
    // Load the page for editing
    document.getElementById('page-selector').value = pageName;
    loadPageForEdit(pageName);
}

function previewPageFromList(pageName) {
    const previewUrl = `/${pageName === 'index' ? '' : pageName + '.html'}`;
    window.open(previewUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
}

// Functions for sidebar page management
function editPage(pageName) {
    editPageContent(pageName);
}

function viewPage(pageName) {
    previewPageFromList(pageName);
}

// Color Management
function initColorPickers() {
    const colorInputs = document.querySelectorAll('.color-input');
    colorInputs.forEach(input => {
        input.addEventListener('change', function() {
            const valueInput = this.nextElementSibling;
            if (valueInput && valueInput.classList.contains('color-value')) {
                valueInput.value = this.value;
            }
        });
    });
    
    const colorValues = document.querySelectorAll('.color-value');
    colorValues.forEach(input => {
        input.addEventListener('input', function() {
            const colorInput = this.previousElementSibling;
            if (colorInput && colorInput.classList.contains('color-input')) {
                colorInput.value = this.value;
            }
        });
    });
}

// Widget Management
function toggleWidget(element) {
    element.classList.toggle('active');
    const widgetName = element.closest('.widget-item').querySelector('.widget-name').textContent;
    const isActive = element.classList.contains('active');
    
    showNotification(`Widget "${widgetName}" đã được ${isActive ? 'bật' : 'tắt'}!`, 'info');
}

// Layout Management
function selectLayout(element) {
    document.querySelectorAll('.layout-option').forEach(option => {
        option.classList.remove('active');
    });
    element.classList.add('active');
    
    const layoutName = element.querySelector('h6').textContent;
    showNotification(`Đã chọn layout: ${layoutName}`, 'success');
}

// Responsive Design Preview
function selectDevice(element) {
    document.querySelectorAll('.device-preview').forEach(device => {
        device.classList.remove('active');
    });
    element.classList.add('active');
    
    const deviceName = element.querySelector('.device-name').textContent;
    showNotification(`Đang xem trước trên: ${deviceName}`, 'info');
}

// Image Management
function uploadImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = function(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            addImageToGallery(file);
        });
    };
    
    input.click();
}

function addImageToGallery(file) {
    const gallery = document.querySelector('.image-gallery');
    if (!gallery) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <img src="${e.target.result}" alt="${file.name}">
            <div class="image-overlay">
                <div class="image-actions">
                    <button onclick="editImage(this)" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteImage(this)" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        gallery.appendChild(imageItem);
    };
    
    reader.readAsDataURL(file);
    showNotification(`Đã thêm hình ảnh: ${file.name}`, 'success');
}

function editImage(button) {
    const imageItem = button.closest('.image-item');
    const img = imageItem.querySelector('img');
    
    const newAlt = prompt('Nhập mô tả hình ảnh:', img.alt);
    if (newAlt !== null) {
        img.alt = newAlt;
        showNotification('Đã cập nhật thông tin hình ảnh!', 'success');
    }
}

function deleteImage(button) {
    if (confirm('Bạn có chắc chắn muốn xóa hình ảnh này?')) {
        const imageItem = button.closest('.image-item');
        imageItem.remove();
        showNotification('Đã xóa hình ảnh!', 'success');
    }
}

// Initialize new features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    initColorPickers();
    setupAutoSave();
    
    // Add event listeners for toggle switches
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.addEventListener('click', function() {
            toggleWidget(this);
        });
    });
    
    // Add event listeners for layout options
    document.querySelectorAll('.layout-option').forEach(option => {
        option.addEventListener('click', function() {
            selectLayout(this);
        });
    });
    
    // Add event listeners for device previews
    document.querySelectorAll('.device-preview').forEach(device => {
        device.addEventListener('click', function() {
            selectDevice(this);
        });
    });
});

// Add mobile menu button for responsive design
if (window.innerWidth <= 768) {
    const navbar = document.querySelector('.admin-navbar');
    const menuButton = document.createElement('button');
    menuButton.className = 'mobile-menu-btn';
    menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    menuButton.onclick = toggleMobileMenu;
    navbar.insertBefore(menuButton, navbar.firstChild);
}