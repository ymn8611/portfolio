const MAX_SKILL_LEVEL = 5;
const SKILL_LABELS = ["", "Mới bắt đầu", "Cơ bản", "Khá", "Tốt", "Rất tốt"];


const root = document.documentElement;
const readyCallbacks = [];

function whenReady(callback) {
  if (root.classList.contains("is-locked")) readyCallbacks.push(callback);
  else callback();
}

function setupIntro() {
  const intro = document.getElementById("intro");
  const book = document.getElementById("intro-book");
  const cover = document.getElementById("intro-cover");
  const scan = document.getElementById("intro-scan");
  const log = document.getElementById("intro-log");
  const fill = document.getElementById("intro-fill");
  const openButton = document.getElementById("intro-open");
  const skipButton = document.getElementById("intro-skip");

  const checks = [
    "Xác minh danh tính: Mai Như Ý",
    "Ngành học: Công nghệ thông tin",
    "Hành lý: HTML · CSS · JS · Python · Java · Git · C++",
    "Dự án mang theo: 2",
    "Hoàn tất. Chào mừng bạn!",
  ];
  let isFinished = false;
  let timers = [];

  function finish() {
    if (isFinished) return;
    isFinished = true;
    timers.forEach(clearTimeout);
    intro.classList.add("is-leaving");

    const unlock = () => {
      root.classList.remove("is-locked");
      window.scrollTo(0, 0);
      readyCallbacks.forEach((callback) => callback());
    };

    const fallback = setTimeout(unlock, 1100);
    intro.addEventListener("transitionend", () => {
      clearTimeout(fallback);
      if (root.classList.contains("is-locked")) unlock();
    }, { once: true });
  }

  function startScan() {
    cover.hidden = true;
    scan.hidden = false;

    checks.forEach((text, index) => {
      timers.push(setTimeout(() => {
        const item = document.createElement("li");
        item.textContent = text;
        log.appendChild(item);
        fill.style.width = `${((index + 1) / checks.length) * 100}%`;
        timers.push(setTimeout(() => item.classList.add("is-done"), 350));
      }, index * 550));
    });
    timers.push(setTimeout(finish, checks.length * 550 + 700));
  }

  openButton.addEventListener("click", () => {
    book.classList.add("is-open");
    openButton.disabled = true;
    timers.push(setTimeout(startScan, 850));
  });
  skipButton.addEventListener("click", finish);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") finish();
  });
  openButton.focus();
}

function setupThemeToggle() {
  const themeButton = document.getElementById("theme-btn");

  // Khôi phục lựa chọn đã lưu (nếu trình duyệt cho phép)
  try {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) root.dataset.theme = savedTheme;
  } catch (error) {
  }

  themeButton.addEventListener("click", () => {
    const currentTheme =
      root.dataset.theme ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    root.dataset.theme = nextTheme;
    try {
      localStorage.setItem("theme", nextTheme);
    } catch (error) {
      /* bỏ qua */
    }
  });
}

function setupActiveNavLink() {
  const navLinks = document.querySelectorAll(".navbar__link");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  navLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) observer.observe(section);
  });
}

function createSkillBar(level) {
  const bar = document.createElement("div");
  bar.className = "skill__bar";
  bar.setAttribute("role", "img");
  bar.setAttribute("aria-label", `Mức ${level} trên ${MAX_SKILL_LEVEL}`);

  for (let i = 0; i < MAX_SKILL_LEVEL; i++) {
    const cell = document.createElement("span");
    cell.className = "skill__cell";
    bar.appendChild(cell);
  }
  return bar;
}

function fillSkillBar(bar, level) {
  const cells = bar.querySelectorAll(".skill__cell");
  for (let i = 0; i < level; i++) {
    setTimeout(() => cells[i].classList.add("is-filled"), i * 150);
  }
}

function setupSkillBars() {
  document.querySelectorAll(".skill").forEach((skill) => {
    const level = Number(skill.dataset.level);
    const bar = createSkillBar(level);
    skill.appendChild(bar);

    const label = document.createElement("p");
    label.className = "skill__level";
    label.textContent = `${SKILL_LABELS[level]} · ${level}/${MAX_SKILL_LEVEL}`;
    skill.appendChild(label);

    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (!entries[0].isIntersecting) return;
        fillSkillBar(bar, level);
        obs.disconnect();
      },
      { threshold: 0.6 }
    );
    observer.observe(bar);
  });
}

function setupStamps() {
  document.querySelectorAll(".stamp").forEach((stamp) => {
    stamp.addEventListener("click", () => {
      const randomAngle = Math.floor(Math.random() * 21) - 10; 
      stamp.style.setProperty("--stamp-angle", `${randomAngle}deg`);
    });
  });
}

function setupFlightPath() {
  const route = document.getElementById("flight-path");
  const plane = document.getElementById("plane");
  const routeLength = route.getTotalLength();
  let isTicking = false;

  function movePlane() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

    const distance = progress * routeLength;
    const point = route.getPointAtLength(distance);
    const ahead = route.getPointAtLength(Math.min(distance + 1, routeLength));
    const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;

    plane.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);
    isTicking = false;
  }

  window.addEventListener("scroll", () => {
    if (isTicking) return;
    isTicking = true;
    requestAnimationFrame(movePlane);
  });
  window.addEventListener("resize", movePlane);
  movePlane();
}

function setupReveal() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const selector = ".section__title, .section__subtitle, .passport, .goal, .skill, .visa, .project, .stamp, .contact__card";
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("is-visible");
        el.addEventListener("transitionend", (event) => {
          if (event.target === el) el.classList.remove("reveal", "is-visible");
        }, { once: true });
        obs.unobserve(el);
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(selector).forEach((el, index) => {
    el.classList.add("reveal");
    el.style.setProperty("--delay", `${(index % 4) * 120}ms`);
    observer.observe(el);
  });
}

function setupTyping() {
  const role = document.querySelector("[data-words]");
  const target = document.getElementById("typed");
  if (!role || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const words = role.dataset.words.split("|");
  let wordIndex = 0;
  let charIndex = words[0].length;
  let isDeleting = true;

  function tick() {
    const word = words[wordIndex];
    charIndex += isDeleting ? -1 : 1;
    target.textContent = word.slice(0, charIndex);

    let delay = isDeleting ? 45 : 90;
    if (!isDeleting && charIndex === word.length) {
      isDeleting = true;
      delay = 1600;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 300;
    }
    setTimeout(tick, delay);
  }
  setTimeout(tick, 2000);
}

function setupCounters() {
  const counters = document.querySelectorAll(".stats__num");
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = Number(el.dataset.count);
      const decimals = Number(el.dataset.decimals || 0);
      const start = performance.now();

      function step(now) {
        const t = Math.min((now - start) / 1200, 1);
        el.textContent = (end * (1 - Math.pow(1 - t, 3))).toFixed(decimals);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  });
  counters.forEach((el) => observer.observe(el));
}

function setupTilt() {
  if (!matchMedia("(hover: hover)").matches) return;

  document.querySelectorAll(".project").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

function setupScrollUi() {
  const progress = document.getElementById("progress");
  const toTop = document.getElementById("to-top");

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    toTop.classList.toggle("is-show", window.scrollY > 600);
  }

  window.addEventListener("scroll", () => requestAnimationFrame(update));
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  update();
}

function setupCopyEmail() {
  const button = document.getElementById("copy-email");
  const note = button.querySelector("small");

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.email);
      note.textContent = "Đã sao chép!";
    } catch (error) {
      note.textContent = button.dataset.email;
    }
    setTimeout(() => (note.textContent = "bấm để copy"), 2000);
  });
}

setupIntro();
setupThemeToggle();
setupActiveNavLink();
setupSkillBars();
setupStamps();
setupFlightPath();
whenReady(setupReveal);
whenReady(setupTyping);
whenReady(setupCounters);
setupTilt();
setupScrollUi();
setupCopyEmail();