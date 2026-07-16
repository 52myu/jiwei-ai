// ========== 粒子背景 ==========
(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };
    let animId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = ['34,211,238', '139,92,246', '236,72,153'][Math.floor(Math.random() * 3)];
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    this.x -= dx * 0.01;
                    this.y -= dy * 0.01;
                }
            }

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
            ctx.fill();
        }
    }

    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const opacity = (1 - dist / 150) * 0.15;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(34,211,238,${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connectParticles();
        animId = requestAnimationFrame(animate);
    }
    animate();

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animId);
        } else {
            animate();
        }
    });
})();

// ========== 导航栏 ==========
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(3, 7, 18, 0.95)';
    } else {
        navbar.style.background = 'rgba(3, 7, 18, 0.8)';
    }

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 72;
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
    });
});

// 移动端菜单
const mobileToggle = document.querySelector('.mobile-toggle');
const navMenu = document.querySelector('.nav-links');

if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('mobile-open');
        mobileToggle.classList.toggle('active');
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('mobile-open');
            mobileToggle.classList.remove('active');
        });
    });
}

// ========== 滚动入场动画 ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-up').forEach(el => {
    observer.observe(el);
});

// ========== 数字动画 ==========
function animateNumber(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

const numberObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            const target = parseInt(entry.target.dataset.target, 10);
            if (!isNaN(target)) {
                animateNumber(entry.target, target);
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => {
    numberObserver.observe(el);
});

// ========== Toast ==========
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// ========== 复制微信号 ==========
function copyWechat(el) {
    const text = el.textContent.trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('微信号已复制：' + text);
        }).catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        showToast('微信号已复制：' + text);
    } catch (e) {
        showToast('复制失败，请手动复制');
    }
    document.body.removeChild(ta);
}

// ========== 联系表单 ==========
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        console.log('表单提交:', Object.fromEntries(formData));
        showToast('消息已发送！我会尽快回复。');
        this.reset();
    });
}

// ========== Console Logo ==========
console.log(
    '%c Ji Ji %c 全栈开发工程师 ',
    'background: linear-gradient(135deg, #22d3ee, #8b5cf6); color: #030712; font-family: monospace; font-size: 16px; font-weight: bold; padding: 6px 12px; border-radius: 6px 0 0 6px;',
    'background: #111827; color: #22d3ee; font-family: monospace; font-size: 16px; padding: 6px 12px; border-radius: 0 6px 6px 0; border: 1px solid #1e293b;'
);
