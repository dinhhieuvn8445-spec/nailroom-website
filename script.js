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