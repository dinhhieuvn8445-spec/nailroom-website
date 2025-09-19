$(document).ready(function() {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Hero Slider
    $('.hero-slick').slick({
        dots: true,
        infinite: true,
        speed: 500,
        fade: true,
        cssEase: 'linear',
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: false
    });

    // Testimonial Slider
    $('.home-test-slick').slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });

    // Services Slider
    $('.home-services-slick').slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });

    // Partner Slider
    $('.partner-slick').slick({
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 6,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            }
        ]
    });

    // Language Switcher
    $('.language-toggle').click(function(e) {
        e.preventDefault();
        $(this).siblings('.language-menu').toggle();
    });

    // Close language menu when clicking outside
    $(document).click(function(e) {
        if (!$(e.target).closest('.language-switcher').length) {
            $('.language-menu').hide();
        }
    });

    // Smooth scrolling for anchor links
    $('a[href^="#"]').on('click', function(event) {
        var target = $(this.getAttribute('href'));
        if (target.length) {
            event.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 80
            }, 1000);
        }
    });

    // Navbar scroll effect
    $(window).scroll(function() {
        if ($(this).scrollTop() > 100) {
            $('.site-navigation').addClass('scrolled');
        } else {
            $('.site-navigation').removeClass('scrolled');
        }
    });

    // Service hover effects
    $('.service-item').hover(
        function() {
            $(this).find('.service-image img').addClass('hovered');
        },
        function() {
            $(this).find('.service-image img').removeClass('hovered');
        }
    );

    // Blog item hover effects
    $('.blog-item').hover(
        function() {
            $(this).find('.blog-image img').addClass('hovered');
        },
        function() {
            $(this).find('.blog-image img').removeClass('hovered');
        }
    );

    // Client images lazy loading effect
    $('.client-image img').each(function() {
        var $img = $(this);
        var imgSrc = $img.attr('src');
        
        $img.on('load', function() {
            $img.addClass('loaded');
        });
        
        if ($img[0].complete) {
            $img.addClass('loaded');
        }
    });

    // Parallax effect for clients section background
    $(window).scroll(function() {
        var scrolled = $(this).scrollTop();
        var parallax = $('#clients');
        var speed = 0.5;
        
        if (parallax.length) {
            var yPos = -(scrolled * speed);
            parallax.css('background-position', 'center ' + yPos + 'px');
        }
    });

    // Counter animation for numbers (if any)
    function animateCounter(element, target) {
        var current = 0;
        var increment = target / 100;
        var timer = setInterval(function() {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.text(Math.floor(current));
        }, 20);
    }

    // Trigger counter animation when element comes into view
    $('.counter').each(function() {
        var $this = $(this);
        var target = parseInt($this.data('target'));
        
        $(window).scroll(function() {
            var elementTop = $this.offset().top;
            var elementBottom = elementTop + $this.outerHeight();
            var viewportTop = $(window).scrollTop();
            var viewportBottom = viewportTop + $(window).height();
            
            if (elementBottom > viewportTop && elementTop < viewportBottom && !$this.hasClass('animated')) {
                $this.addClass('animated');
                animateCounter($this, target);
            }
        });
    });

    // Form validation (if forms are added later)
    $('form').on('submit', function(e) {
        var isValid = true;
        
        $(this).find('input[required], textarea[required]').each(function() {
            if (!$(this).val().trim()) {
                isValid = false;
                $(this).addClass('error');
            } else {
                $(this).removeClass('error');
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
        }
    });

    // Mobile menu toggle
    $('.navbar-toggler').click(function() {
        $(this).toggleClass('active');
    });

    // Close mobile menu when clicking on a link
    $('.navbar-nav .nav-link').click(function() {
        if ($(window).width() < 992) {
            $('.navbar-collapse').collapse('hide');
            $('.navbar-toggler').removeClass('active');
        }
    });

    // Preloader (if needed)
    $(window).on('load', function() {
        $('.preloader').fadeOut('slow');
    });

    // Back to top button
    var backToTop = $('<div class="back-to-top"><i class="fas fa-chevron-up"></i></div>');
    $('body').append(backToTop);
    
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            backToTop.fadeIn();
        } else {
            backToTop.fadeOut();
        }
    });
    
    backToTop.click(function() {
        $('html, body').animate({scrollTop: 0}, 800);
    });

    // Image lazy loading for better performance
    $('img[data-src]').each(function() {
        var $img = $(this);
        var imgSrc = $img.data('src');
        
        $(window).scroll(function() {
            var elementTop = $img.offset().top;
            var elementBottom = elementTop + $img.outerHeight();
            var viewportTop = $(window).scrollTop();
            var viewportBottom = viewportTop + $(window).height();
            
            if (elementBottom > viewportTop && elementTop < viewportBottom && !$img.hasClass('loaded')) {
                $img.attr('src', imgSrc).addClass('loaded');
            }
        });
    });

    // Gallery Filter
    $('.filter-btn').click(function() {
        var filterValue = $(this).data('filter');
        
        // Update active button
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');
        
        // Filter gallery items
        if (filterValue === 'all') {
            $('.gallery-item').removeClass('hide');
        } else {
            $('.gallery-item').addClass('hide');
            $('.gallery-item.' + filterValue).removeClass('hide');
        }
    });

    // Load More Gallery Items
    $('.load-more-btn').click(function() {
        // Simulate loading more items
        $(this).text('Đang tải...').prop('disabled', true);
        
        setTimeout(function() {
            $('.load-more-btn').text('Xem thêm').prop('disabled', false);
            // Here you would typically load more gallery items via AJAX
        }, 1000);
    });

    // Lightbox configuration
    if (typeof lightbox !== 'undefined') {
        lightbox.option({
            'resizeDuration': 200,
            'wrapAround': true,
            'albumLabel': 'Hình %1 / %2'
        });
    }

    // Trigger scroll event on page load
    $(window).trigger('scroll');
});

// Additional CSS for dynamic elements
var additionalCSS = `
    .back-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background-color: #b7752b;
        color: white;
        border-radius: 50%;
        display: none;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1000;
        transition: all 0.3s;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    
    .back-to-top:hover {
        background-color: #a66825;
        transform: translateY(-2px);
    }
    
    .navbar-toggler.active {
        transform: rotate(90deg);
    }
    
    .site-navigation.scrolled {
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    
    .client-image img.loaded {
        opacity: 1;
        transform: scale(1);
    }
    
    .client-image img {
        opacity: 0;
        transform: scale(0.8);
        transition: all 0.5s ease;
    }
    
    .service-image img.hovered {
        transform: scale(1.05);
    }
    
    .blog-image img.hovered {
        transform: scale(1.05);
    }
    
    .error {
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
    }
    
    .preloader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #fff;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .preloader::after {
        content: '';
        width: 50px;
        height: 50px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #b7752b;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Inject additional CSS
$('<style>').text(additionalCSS).appendTo('head');

// ===== AUTHENTICATION FUNCTIONALITY =====

// Global authentication state
let currentUser = null;

// Check authentication status on page load
$(document).ready(function() {
    checkAuthStatus();
});

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth-status', {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.user;
            updateUIForLoggedInUser(data.user);
        } else {
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        updateUIForLoggedOutUser();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
    // Hide login button
    $('#loginButton').hide();
    
    // Show user dropdown
    $('#userDropdown').show();
    $('#usernameDisplay').text(user.username);
    
    // Show admin dropdown if user is admin
    if (user.role === 'admin') {
        $('#adminDropdown').show();
    } else {
        $('#adminDropdown').hide();
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    // Show login button
    $('#loginButton').show();
    
    // Hide user and admin dropdowns
    $('#userDropdown').hide();
    $('#adminDropdown').hide();
    
    currentUser = null;
}

// Show alert message
function showAlert(type, message) {
    const alertDiv = $('#authAlert');
    alertDiv.removeClass('alert-success alert-danger');
    alertDiv.addClass(`alert-${type}`);
    alertDiv.text(message);
    alertDiv.show();
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        alertDiv.hide();
    }, 5000);
}

// Toggle between login and register forms
$('#showRegisterForm').click(function(e) {
    e.preventDefault();
    $('#loginForm').hide();
    $('#registerForm').show();
    $('#loginTabTitle').removeClass('active');
    $('#registerTabTitle').addClass('active');
    $('#authAlert').hide();
});

$('#showLoginForm').click(function(e) {
    e.preventDefault();
    $('#registerForm').hide();
    $('#loginForm').show();
    $('#registerTabTitle').removeClass('active');
    $('#loginTabTitle').addClass('active');
    $('#authAlert').hide();
});

// Handle login form submission
$('#loginForm').submit(async function(e) {
    e.preventDefault();
    
    const username = $('#loginUsername').val();
    const password = $('#loginPassword').val();
    
    if (!username || !password) {
        showAlert('danger', 'Vui lòng nhập đầy đủ thông tin');
        return;
    }
    
    const submitBtn = $('#loginForm button[type="submit"]');
    const originalText = submitBtn.html();
    submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...').prop('disabled', true);
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('success', data.message);
            currentUser = data.user;
            
            // Update UI
            updateUIForLoggedInUser(data.user);
            
            // Close modal after 1.5 seconds
            setTimeout(() => {
                $('#loginModal').modal('hide');
                $('#loginForm')[0].reset();
            }, 1500);
            
        } else {
            showAlert('danger', data.message);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showAlert('danger', 'Lỗi kết nối, vui lòng thử lại sau');
    }
    
    submitBtn.html(originalText).prop('disabled', false);
});

// Handle register form submission
$('#registerForm').submit(async function(e) {
    e.preventDefault();
    
    const username = $('#registerUsername').val();
    const email = $('#registerEmail').val();
    const password = $('#registerPassword').val();
    const confirmPassword = $('#registerConfirmPassword').val();
    const fullName = $('#registerFullName').val();
    const phone = $('#registerPhone').val();
    const agreeTerms = $('#agreeTerms').is(':checked');
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
        showAlert('danger', 'Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('danger', 'Mật khẩu xác nhận không khớp');
        return;
    }
    
    if (password.length < 3) {
        showAlert('danger', 'Mật khẩu phải có ít nhất 3 ký tự');
        return;
    }
    
    if (!agreeTerms) {
        showAlert('danger', 'Vui lòng đồng ý với điều khoản sử dụng');
        return;
    }
    
    const submitBtn = $('#registerForm button[type="submit"]');
    const originalText = submitBtn.html();
    submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Đang đăng ký...').prop('disabled', true);
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                username,
                email,
                password,
                fullName,
                phone
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('success', data.message);
            currentUser = data.user;
            
            // Update UI
            updateUIForLoggedInUser(data.user);
            
            // Close modal after 1.5 seconds
            setTimeout(() => {
                $('#loginModal').modal('hide');
                $('#registerForm')[0].reset();
            }, 1500);
            
        } else {
            showAlert('danger', data.message);
        }
        
    } catch (error) {
        console.error('Register error:', error);
        showAlert('danger', 'Lỗi kết nối, vui lòng thử lại sau');
    }
    
    submitBtn.html(originalText).prop('disabled', false);
});

// Handle logout
$('#logoutBtn').click(async function(e) {
    e.preventDefault();
    
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateUIForLoggedOutUser();
            showAlert('success', data.message);
        }
        
    } catch (error) {
        console.error('Logout error:', error);
        updateUIForLoggedOutUser();
    }
});

// Reset modal when hidden
$('#loginModal').on('hidden.bs.modal', function() {
    $('#loginForm')[0].reset();
    $('#registerForm')[0].reset();
    $('#authAlert').hide();
    
    // Show login form by default
    $('#registerForm').hide();
    $('#loginForm').show();
    $('#registerTabTitle').removeClass('active');
    $('#loginTabTitle').addClass('active');
});

// ===== DYNAMIC CONTENT LOADING FROM DATABASE =====

// Load all dynamic content from database
async function loadDynamicContent() {
    try {
        console.log('Loading dynamic content from database...');
        
        // Load all sections
        await Promise.all([
            loadHeaderContent(),
            loadHeroContent(), 
            loadAboutContent(),
            loadServicesContent(),
            loadGalleryContent(),
            loadCelebritiesContent(),
            loadTestimonialsContent(),
            loadStoresContent(),
            loadCTAContent(),
            loadFooterContent()
        ]);
        
        console.log('All dynamic content loaded successfully');
    } catch (error) {
        console.error('Error loading dynamic content:', error);
    }
}

// Load header content from database
async function loadHeaderContent() {
    try {
        const response = await fetch('/api/content/header');
        const result = await response.json();
        
        if (result.success && result.content) {
            const content = result.content;
            
            // Update logo text
            if (content.logo_text && content.logo_text.value) {
                $('.navbar-brand').text(content.logo_text.value);
            }
            
            // Update phone number
            if (content.phone && content.phone.value) {
                $('.topbar-left-info li:first-child a').text(content.phone.value);
                $('.topbar-left-info li:first-child a').attr('href', `tel:${content.phone.value}`);
            }
            
            // Update email
            if (content.email && content.email.value) {
                $('.topbar-left-info li:nth-child(2) a').text(content.email.value);
                $('.topbar-left-info li:nth-child(2) a').attr('href', `mailto:${content.email.value}`);
            }
        }
    } catch (error) {
        console.error('Error loading header content:', error);
    }
}

// Load hero content from database
async function loadHeroContent() {
    try {
        const response = await fetch('/api/content/hero');
        const result = await response.json();
        
        if (result.success && result.content) {
            const content = result.content;
            
            // Update hero title
            if (content.title && content.title.value) {
                $('.hero-content h1').text(content.title.value);
            }
            
            // Update hero slogan
            if (content.slogan && content.slogan.value) {
                $('.hero-content p').text(content.slogan.value);
            }
            
            // Update Korean text
            if (content.korean_text && content.korean_text.value) {
                $('.hero-content .korean-text').text(content.korean_text.value);
            }
            
            // Update background image
            if (content.background_image && content.background_image.value) {
                $('.hero-slide').css('background-image', `url('${content.background_image.value}')`);
            }
        }
    } catch (error) {
        console.error('Error loading hero content:', error);
    }
}

// Load about content from database
async function loadAboutContent() {
    try {
        const response = await fetch('/api/content/about');
        const result = await response.json();
        
        if (result.success && result.content) {
            const content = result.content;
            
            // Update about title
            if (content.title && content.title.value) {
                $('#about .section-title').text(content.title.value);
            }
            
            // Update quote
            if (content.quote && content.quote.value) {
                $('#about .quote').text(content.quote.value);
            }
            
            // Update descriptions
            for (let i = 1; i <= 3; i++) {
                const desc = content[`description_${i}`];
                if (desc && desc.value) {
                    $(`#about .description-${i}`).text(desc.value);
                }
            }
        }
    } catch (error) {
        console.error('Error loading about content:', error);
    }
}

// Load services from database
async function loadServicesContent() {
    try {
        const response = await fetch('/api/services');
        const result = await response.json();
        
        if (result.success && result.services && result.services.length > 0) {
            const servicesContainer = $('.home-services-slick');
            servicesContainer.empty();
            
            result.services.forEach(service => {
                const serviceHtml = `
                    <div class="service-item">
                        <div class="service-image">
                            <img src="${service.image || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}" alt="${service.name}">
                        </div>
                        <div class="service-content">
                            <h3>${service.name}</h3>
                            <p>${service.description || ''}</p>
                            <div class="service-price">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price)}</div>
                        </div>
                    </div>
                `;
                servicesContainer.append(serviceHtml);
            });
            
            // Reinitialize slick slider
            if (servicesContainer.hasClass('slick-initialized')) {
                servicesContainer.slick('unslick');
            }
            servicesContainer.slick({
                dots: true,
                infinite: true,
                speed: 500,
                slidesToShow: 3,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 4000,
                responsive: [
                    {
                        breakpoint: 992,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1
                        }
                    }
                ]
            });
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// Load gallery from database
async function loadGalleryContent() {
    try {
        const response = await fetch('/api/gallery');
        const result = await response.json();
        
        if (result.success && result.gallery && result.gallery.length > 0) {
            const galleryContainer = $('.gallery-grid');
            galleryContainer.empty();
            
            result.gallery.forEach(item => {
                const galleryHtml = `
                    <div class="gallery-item">
                        <img src="${item.image_url}" alt="${item.title || 'Gallery image'}">
                        <div class="gallery-overlay">
                            <h4>${item.title || ''}</h4>
                            <p>${item.description || ''}</p>
                        </div>
                    </div>
                `;
                galleryContainer.append(galleryHtml);
            });
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
    }
}

// Load celebrities from database
async function loadCelebritiesContent() {
    try {
        const response = await fetch('/api/celebrities');
        const result = await response.json();
        
        if (result.success && result.celebrities && result.celebrities.length > 0) {
            const celebritiesContainer = $('.celebrities-grid');
            celebritiesContainer.empty();
            
            result.celebrities.forEach(celebrity => {
                const celebrityHtml = `
                    <div class="celebrity-item">
                        <img src="${celebrity.image_url}" alt="${celebrity.name}">
                        <div class="celebrity-info">
                            <h4>${celebrity.name}</h4>
                            <p>${celebrity.profession || ''}</p>
                        </div>
                    </div>
                `;
                celebritiesContainer.append(celebrityHtml);
            });
        }
    } catch (error) {
        console.error('Error loading celebrities:', error);
    }
}

// Load testimonials from database
async function loadTestimonialsContent() {
    try {
        const response = await fetch('/api/testimonials');
        const result = await response.json();
        
        if (result.success && result.testimonials && result.testimonials.length > 0) {
            const testimonialsContainer = $('.home-test-slick');
            testimonialsContainer.empty();
            
            result.testimonials.forEach(testimonial => {
                const testimonialHtml = `
                    <div class="testimonial-item">
                        <div class="testimonial-content">
                            <p>"${testimonial.content}"</p>
                        </div>
                        <div class="testimonial-author">
                            <img src="${testimonial.customer_image || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'}" alt="${testimonial.customer_name}">
                            <div class="author-info">
                                <h4>${testimonial.customer_name}</h4>
                                <p>${testimonial.customer_location || ''}</p>
                            </div>
                        </div>
                    </div>
                `;
                testimonialsContainer.append(testimonialHtml);
            });
            
            // Reinitialize slick slider
            if (testimonialsContainer.hasClass('slick-initialized')) {
                testimonialsContainer.slick('unslick');
            }
            testimonialsContainer.slick({
                dots: true,
                infinite: true,
                speed: 500,
                slidesToShow: 3,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 5000,
                responsive: [
                    {
                        breakpoint: 992,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1
                        }
                    }
                ]
            });
        }
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

// Load stores from database
async function loadStoresContent() {
    try {
        const response = await fetch('/api/stores');
        const result = await response.json();
        
        if (result.success && result.stores && result.stores.length > 0) {
            const storesContainer = $('.stores-grid');
            storesContainer.empty();
            
            result.stores.forEach(store => {
                const storeHtml = `
                    <div class="store-item">
                        <div class="store-info">
                            <h4>${store.name}</h4>
                            <p><i class="fas fa-map-marker-alt"></i> ${store.address}</p>
                            ${store.phone ? `<p><i class="fas fa-phone"></i> ${store.phone}</p>` : ''}
                            ${store.working_hours ? `<p><i class="fas fa-clock"></i> ${store.working_hours}</p>` : ''}
                        </div>
                    </div>
                `;
                storesContainer.append(storeHtml);
            });
        }
    } catch (error) {
        console.error('Error loading stores:', error);
    }
}

// Load CTA content from database
async function loadCTAContent() {
    try {
        const response = await fetch('/api/content/cta');
        const result = await response.json();
        
        if (result.success && result.content) {
            const content = result.content;
            
            // Update CTA title
            if (content.title && content.title.value) {
                $('.cta-section h2').text(content.title.value);
            }
            
            // Update CTA subtitle
            if (content.subtitle && content.subtitle.value) {
                $('.cta-section .cta-subtitle').text(content.subtitle.value);
            }
            
            // Update CTA description
            if (content.description && content.description.value) {
                $('.cta-section p').text(content.description.value);
            }
            
            // Update CTA button
            if (content.button_text && content.button_text.value) {
                $('.cta-section .cta-button').text(content.button_text.value);
            }
            
            if (content.button_url && content.button_url.value) {
                $('.cta-section .cta-button').attr('href', content.button_url.value);
            }
            
            // Update phone display
            if (content.phone && content.phone.value) {
                $('.cta-section .cta-phone').text(content.phone.value);
            }
            
            // Update background and colors
            if (content.background_image && content.background_image.value) {
                $('.cta-section').css('background-image', `url('${content.background_image.value}')`);
            }
            
            if (content.bg_color && content.bg_color.value) {
                $('.cta-section').css('background-color', content.bg_color.value);
            }
        }
    } catch (error) {
        console.error('Error loading CTA content:', error);
    }
}

// Load footer content from database
async function loadFooterContent() {
    try {
        const response = await fetch('/api/content/footer');
        const result = await response.json();
        
        if (result.success && result.content) {
            const content = result.content;
            
            // Update footer logo
            if (content.logo && content.logo.value) {
                $('.footer .footer-logo').text(content.logo.value);
            }
            
            // Update footer description
            if (content.description && content.description.value) {
                $('.footer .footer-description').text(content.description.value);
            }
            
            // Update contact info
            if (content.phone && content.phone.value) {
                $('.footer .footer-phone').html(`<i class="fas fa-phone"></i> ${content.phone.value}`);
            }
            
            if (content.email && content.email.value) {
                $('.footer .footer-email').html(`<i class="fas fa-envelope"></i> ${content.email.value}`);
            }
            
            if (content.address && content.address.value) {
                $('.footer .footer-address').html(`<i class="fas fa-map-marker-alt"></i> ${content.address.value}`);
            }
            
            if (content.working_hours && content.working_hours.value) {
                $('.footer .footer-hours').text(content.working_hours.value);
            }
            
            // Update copyright
            if (content.copyright && content.copyright.value) {
                $('.footer .footer-copyright').text(content.copyright.value);
            }
        }
    } catch (error) {
        console.error('Error loading footer content:', error);
    }
}

// Initialize dynamic content loading
$(document).ready(function() {
    // Load dynamic content after page is ready
    setTimeout(loadDynamicContent, 1000);
});