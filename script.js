const root = document.documentElement;
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ---------- theme toggle ----------

function currentTheme() {
    return root.dataset.theme || (prefersDark.matches ? 'dark' : 'light');
}

function setTheme(theme) {
    root.dataset.theme = theme;
    try {
        localStorage.setItem('theme', theme);
    } catch (e) {}
}

document.querySelector('.theme-toggle').addEventListener('click', (event) => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';

    if (!document.startViewTransition || reduceMotion.matches) {
        setTheme(next);
        return;
    }

    // grow a circle from the button to reveal the new theme
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    document.startViewTransition(() => setTheme(next)).ready.then(() => {
        root.animate(
            { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 550, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
        );
    });
});

// ---------- local time (IST) ----------

const clock = document.querySelector('[data-clock]');
const timeFormat = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
});

function tick() {
    clock.textContent = timeFormat.format(new Date());
}

tick();
setInterval(tick, 10000);

document.querySelector('[data-year]').textContent = new Date().getFullYear();

// ---------- card spotlight ----------

document.querySelectorAll('.card, .project').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--y', `${event.clientY - rect.top}px`);
    });
});

// ---------- highlight the nav link for the section on screen ----------

const navLinks = [...document.querySelectorAll('.nav-links a')];

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => {
                if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'true');
                else link.removeAttribute('aria-current');
            });
        });
    },
    { rootMargin: '-45% 0px -50% 0px' }
);

navLinks.forEach((link) => {
    const section = document.querySelector(link.hash);
    if (section) observer.observe(section);
});
