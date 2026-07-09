/* Bushbuckridge Mall — interactions & animations */
(function () {
  "use strict";

  /* ---------- sticky header ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (window.scrollY > 30) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
    document.querySelectorAll(".main-nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("revealed");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll("[data-reveal],[data-stagger]").forEach(function (el) {
    io.observe(el);
  });

  /* ---------- animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1800;
    var t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var cio = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCount(e.target);
          cio.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach(function (el) {
    cio.observe(el);
  });

  /* ---------- scroll parallax ---------- */
  var plxEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (plxEls.length && !reducedMotion) {
    var plxTick = false;
    var updateParallax = function () {
      plxTick = false;
      plxEls.forEach(function (img) {
        var box = img.closest(".parallax-band, .page-hero") || img.parentElement;
        var r = box.getBoundingClientRect();
        if (r.bottom < -80 || r.top > window.innerHeight + 80) return;
        var speed = parseFloat(img.getAttribute("data-parallax")) || 0.15;
        var center = r.top + r.height / 2 - window.innerHeight / 2;
        img.style.transform = "translateY(" + (center * speed).toFixed(1) + "px)";
      });
    };
    var requestPlx = function () {
      if (!plxTick) {
        plxTick = true;
        requestAnimationFrame(updateParallax);
      }
    };
    window.addEventListener("scroll", requestPlx, { passive: true });
    window.addEventListener("resize", requestPlx, { passive: true });
    updateParallax();
  }

  /* ---------- marquee: duplicate track content for seamless loop ---------- */
  document.querySelectorAll(".marquee-track").forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* ---------- demo forms: mailto handoff + success note ---------- */
  document.querySelectorAll("form[data-mailto]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var to = form.getAttribute("data-mailto");
      var subject = form.getAttribute("data-subject") || "Website enquiry — Bushbuckridge Mall";
      var lines = [];
      form.querySelectorAll("input,select,textarea").forEach(function (f) {
        if (f.name && f.value) lines.push(f.name + ": " + f.value);
      });
      var ok = form.querySelector(".form-success");
      if (ok) ok.style.display = "block";
      window.location.href =
        "mailto:" + to +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));
    });
  });
})();
