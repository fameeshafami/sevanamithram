(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const nav = document.querySelector("#nav-menu");
  const toggle = document.querySelector(".nav-toggle");
  const backTop = document.querySelector(".back-top");
  const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
  const sections = [...document.querySelectorAll("main section[id]")];

  const closeNav = () => {
    nav.classList.remove("open");
    toggle.classList.remove("active");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    document.body.classList.remove("nav-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.classList.toggle("active", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    document.body.classList.toggle("nav-open", isOpen);
  });

  navLinks.forEach((link) => link.addEventListener("click", closeNav));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });

  const updateScrollUI = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 25);
    backTop.classList.toggle("visible", y > 650);

    let activeId = "home";
    sections.forEach((section) => {
      if (y >= section.offsetTop - 150) activeId = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
    });
  };

  window.addEventListener("scroll", updateScrollUI, { passive: true });
  updateScrollUI();
  backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -35px" }
  );
  document.querySelectorAll('[class*="reveal-"]').forEach((element) => revealObserver.observe(element));

  const heroSlider = document.querySelector(".hero-slider");
  const heroSlides = [...document.querySelectorAll("[data-hero-slide]")];
  const heroCopySlides = [...document.querySelectorAll("[data-hero-copy]")];
  const heroDots = [...document.querySelectorAll("[data-hero-dot]")];
  const heroOrbitIconOne = document.querySelector("#hero-orbit-icon-one");
  const heroOrbitIconTwo = document.querySelector("#hero-orbit-icon-two");
  const heroOrbitIcons = [
    ["#i-government", "#i-document"],
    ["#i-passport", "#i-travel"],
    ["#i-card", "#i-certificate"]
  ];
  let activeHeroSlide = 0;
  let heroTimer;

  const showHeroSlide = (index) => {
    activeHeroSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeHeroSlide;
      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    heroCopySlides.forEach((copy, copyIndex) => {
      const isActive = copyIndex === activeHeroSlide;
      copy.classList.toggle("active", isActive);
      copy.setAttribute("aria-hidden", String(!isActive));
    });
    heroDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeHeroSlide;
      dot.classList.toggle("active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });
    const [iconOne, iconTwo] = heroOrbitIcons[activeHeroSlide];
    heroOrbitIconOne?.setAttribute("href", iconOne);
    heroOrbitIconTwo?.setAttribute("href", iconTwo);
  };

  const stopHeroSlider = () => window.clearInterval(heroTimer);
  const startHeroSlider = () => {
    stopHeroSlider();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      heroTimer = window.setInterval(() => showHeroSlide(activeHeroSlide + 1), 5000);
    }
  };

  if (heroSlider && heroSlides.length) {
    heroDots.forEach((dot, index) => dot.addEventListener("click", () => {
      showHeroSlide(index);
      startHeroSlider();
    }));
    heroSlider.addEventListener("mouseenter", stopHeroSlider);
    heroSlider.addEventListener("mouseleave", startHeroSlider);
    heroSlider.addEventListener("focusin", stopHeroSlider);
    heroSlider.addEventListener("focusout", startHeroSlider);
    document.addEventListener("visibilitychange", () => document.hidden ? stopHeroSlider() : startHeroSlider());
    startHeroSlider();
  }

  const counters = document.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const counter = entry.target;
        const target = Number(counter.dataset.count);
        const duration = 1600;
        const start = performance.now();
        const animate = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.floor(target * eased).toLocaleString("en-IN");
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        observer.unobserve(counter);
      });
    },
    { threshold: 0.7 }
  );
  counters.forEach((counter) => counterObserver.observe(counter));

  const form = document.querySelector("#contact-form");
  const formStatus = form.querySelector(".form-status");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    formStatus.className = "form-status";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to send your message.");
      formStatus.textContent = result.message;
      formStatus.className = "form-status show success";
      form.reset();
    } catch (error) {
      formStatus.textContent = error.message || "Something went wrong. Please call or WhatsApp us.";
      formStatus.className = "form-status show error";
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    }
  });

  document.querySelector("#year").textContent = new Date().getFullYear();
})();
