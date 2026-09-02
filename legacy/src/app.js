/* ---------------------------------------------------------------------------
   4M Cars landing page — behaviour only.
   All content is rendered at build time by scripts/build.mjs, so the page is
   complete and readable with JavaScript disabled. This file adds: the mobile
   menu, the inventory rail controls, the GoHighLevel lead post, the GHL chat
   widget loader, the GTM container, and the (phase 2) locale swap.
--------------------------------------------------------------------------- */
(function () {
  "use strict";

  var CFG = window.DEALER_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var isPlaceholder = function (v) {
    return !v || /^REPLACE|^GHL_WEBHOOK_URL$|X{4,}/.test(String(v));
  };

  /* ----------------------------- mobile menu ----------------------------- */
  var toggle = $("[data-menu-toggle]");
  var mobile = $("[data-mobile-menu]");
  if (toggle && mobile) {
    toggle.addEventListener("click", function () {
      var open = mobile.classList.toggle("hidden") === false;
      toggle.setAttribute("aria-expanded", String(open));
    });
    mobile.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        mobile.classList.add("hidden");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------------------------- hero catalogue ---------------------------
     Cross-fades through the lot photos on a timer, with arrows, dots and
     arrow-key stepping. Slide 1 ships in the HTML; the rest are fetched one
     ahead of where the viewer is, so eight slides cost one image on load.
     The timer stops for good on the first manual step (that is the pause
     mechanism), and never starts at all under prefers-reduced-motion.
  ---------------------------------------------------------------------- */
  var hero = $("[data-hero]");
  if (hero) {
    var slides = $$("[data-hero-slide]", hero);
    var dots = $$("[data-hero-dot]", hero);
    var caption = $("[data-hero-caption]", hero);
    var controls = $("[data-hero-controls]", hero);
    var index = 0;
    var timer = null;
    var stillRotating = true;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (slides.length > 1) {
      if (controls) controls.hidden = false;

      var load = function (i) {
        var img = slides[(i + slides.length) % slides.length];
        if (img && img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
      };

      var show = function (next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (img, i) {
          var on = i === index;
          img.classList.toggle("opacity-100", on);
          img.classList.toggle("opacity-0", !on);
          img.setAttribute("aria-hidden", String(!on));
        });
        dots.forEach(function (d, i) {
          var on = i === index;
          d.setAttribute("aria-current", String(on));
          d.classList.toggle("bg-brand", on);
          d.classList.toggle("bg-white/35", !on);
          d.classList.toggle("hover:bg-white/60", !on);
        });
        if (caption) caption.textContent = slides[index].dataset.caption || "";
        load(index);     // a dot can jump straight to a slide we never queued
        load(index + 1); // then stay one ahead in each direction
        load(index - 1);
      };

      var stop = function () { clearInterval(timer); timer = null; };
      var start = function () {
        if (reduced || !stillRotating || timer) return;
        timer = setInterval(function () { show(index + 1); }, Number(hero.dataset.interval) || 6000);
      };

      // A manual step is a deliberate choice — stop competing with it.
      var stepHero = function (by) { stillRotating = false; stop(); show(index + by); };

      $("[data-hero-prev]", hero).addEventListener("click", function () { stepHero(-1); });
      $("[data-hero-next]", hero).addEventListener("click", function () { stepHero(1); });
      dots.forEach(function (d, i) {
        d.addEventListener("click", function () { stillRotating = false; stop(); show(i); });
      });
      hero.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { e.preventDefault(); stepHero(-1); }
        if (e.key === "ArrowRight") { e.preventDefault(); stepHero(1); }
      });

      // Swipe — the gesture a phone user reaches for before the arrows.
      var swipeX = null;
      hero.addEventListener("pointerdown", function (e) {
        swipeX = e.pointerType === "mouse" ? null : e.clientX;
      });
      hero.addEventListener("pointerup", function (e) {
        if (swipeX === null) return;
        var dx = e.clientX - swipeX;
        swipeX = null;
        if (Math.abs(dx) > 40) stepHero(dx < 0 ? 1 : -1);
      });
      hero.addEventListener("pointercancel", function () { swipeX = null; });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      hero.addEventListener("focusin", stop);
      hero.addEventListener("focusout", start);
      document.addEventListener("visibilitychange", function () {
        document.hidden ? stop() : start();
      });

      load(1);
      start();
    }
  }

  /* --------------------------- inventory rail ---------------------------- */
  var rail = $("[data-rail]");
  if (rail) {
    var step = function () { return Math.min(rail.clientWidth * 0.8, 700); };
    var prev = $("[data-rail-prev]");
    var next = $("[data-rail-next]");
    if (prev) prev.addEventListener("click", function () { rail.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { rail.scrollBy({ left: step(), behavior: "smooth" }); });
  }

  /* ------------------------- lead form → GoHighLevel ---------------------- */
  var form = $("[data-lead-form]");
  var success = $("[data-lead-success]");
  var errorEl = $("[data-form-error]");
  var COPY = {
    missing: "Add your name and phone so we can confirm the time.",
    phone: "That phone number looks short — check it and try again.",
    failed: "That didn't go through. Call or WhatsApp us and we'll book it by hand."
  };

  var utm = function () {
    var out = {};
    try {
      new URLSearchParams(window.location.search).forEach(function (v, k) {
        if (/^utm_/i.test(k) || k === "gclid" || k === "fbclid") out[k] = v;
      });
    } catch (e) { /* no URLSearchParams — skip attribution, never block the lead */ }
    return out;
  };

  var consentText = function (id) {
    var label = document.querySelector('label[for="' + id + '"]');
    return label ? label.textContent.replace(/\s+/g, " ").trim() : "";
  };

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      errorEl.classList.add("hidden");

      var fd = new FormData(form);
      var name = (fd.get("name") || "").trim();
      var phone = (fd.get("phone") || "").trim();

      if (!name || !phone) {
        errorEl.textContent = COPY.missing;
        errorEl.classList.remove("hidden");
        form.elements[name ? "phone" : "name"].focus();
        return;
      }
      if (phone.replace(/\D/g, "").length < 7) {
        errorEl.textContent = COPY.phone;
        errorEl.classList.remove("hidden");
        form.elements.phone.focus();
        return;
      }

      var marketing = fd.get("sms_marketing") === "yes";
      var nonMarketing = fd.get("sms_nonmarketing") === "yes";
      var payload = {
        name: name,
        first_name: name.split(/\s+/)[0],
        last_name: name.split(/\s+/).slice(1).join(" "),
        phone: phone,
        email: (fd.get("email") || "").trim(),
        language: fd.get("language") || "en",
        vehicle: (fd.get("vehicle") || "").trim(),
        when: (fd.get("when") || "").trim(),
        sms_marketing: marketing,
        sms_nonmarketing: nonMarketing,
        // Snapshot of exactly what was agreed to, for the A2P consent record.
        sms_marketing_consent_text: marketing ? consentText("lead-sms-marketing") : "",
        sms_nonmarketing_consent_text: nonMarketing ? consentText("lead-sms-nonmarketing") : "",
        consent_captured_at: new Date().toISOString(),
        source: (CFG.site && CFG.site.leadSource) || "landing page",
        form: "test-drive",
        page_url: window.location.href,
        referrer: document.referrer || "",
        submitted_at: new Date().toISOString()
      };
      var attribution = utm();
      for (var k in attribution) payload[k] = attribution[k];

      var button = form.querySelector('button[type="submit"]');
      var label = button ? button.textContent : "";
      if (button) { button.disabled = true; button.textContent = "Sending…"; }

      var showSuccess = function () {
        form.classList.add("hidden");
        success.classList.remove("hidden");
        success.focus();
        success.scrollIntoView({ block: "center" });
        if (window.dataLayer) window.dataLayer.push({ event: "lead_submitted", form: "test-drive" });
      };
      var showError = function (why) {
        if (why) console.error("[lead] " + why);
        errorEl.textContent = COPY.failed;
        errorEl.classList.remove("hidden");
        if (button) { button.disabled = false; button.textContent = label; }
      };

      var endpoint = (CFG.integrations || {}).ghlLeadWebhookUrl;
      if (isPlaceholder(endpoint)) {
        console.warn(
          "[lead] DEMO MODE — integrations.ghlLeadWebhookUrl is still a placeholder in dealer-config.json, " +
          "so this lead was NOT sent anywhere. Payload:", payload
        );
        showSuccess();
        return;
      }

      var mode = (CFG.integrations || {}).leadSubmitMode === "no-cors" ? "no-cors" : "cors";
      fetch(endpoint, {
        method: "POST",
        mode: mode,
        headers: { "Content-Type": mode === "no-cors" ? "text/plain;charset=UTF-8" : "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          // no-cors responses are opaque (status 0) and cannot be inspected.
          if (mode === "no-cors" || res.ok) return showSuccess();
          showError("GHL responded " + res.status);
        })
        .catch(function (err) { showError(err && err.message); });
    });
  }

  var reset = $("[data-lead-reset]");
  if (reset) {
    reset.addEventListener("click", function () {
      form.reset();
      success.classList.add("hidden");
      form.classList.remove("hidden");
      var button = form.querySelector('button[type="submit"]');
      if (button) button.disabled = false;
      form.elements.name.focus();
    });
  }

  /* --------- third-party scripts, deferred until after interactive -------- */
  var afterInteractive = function (fn) {
    var run = function () { (window.requestIdleCallback || window.setTimeout)(fn, 1); };
    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
  };

  afterInteractive(function () {
    // Google Tag Manager. Container id comes from dealer-config.json and is
    // omitted entirely while it is a placeholder. No GA/gtag alongside it —
    // tags belong inside the container.
    var gtmId = window.__GTM_ID__;
    if (gtmId && !isPlaceholder(gtmId)) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      var g = document.createElement("script");
      g.async = true;
      g.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(gtmId);
      document.head.appendChild(g);
    }

    // GoHighLevel chat widget — ours, not DealerCenter's. Only ever injected
    // when a real widget id is present.
    var widgetId = (CFG.integrations || {}).ghlWidgetId;
    if (widgetId && !isPlaceholder(widgetId)) {
      var w = document.createElement("script");
      w.src = "https://widgets.leadconnectorhq.com/loader.js";
      w.setAttribute("data-resources-url", "https://widgets.leadconnectorhq.com/chat-widget/loader.js");
      w.setAttribute("data-widget-id", widgetId);
      document.body.appendChild(w);
    }
  });

  /* ------------------------------- i18n ----------------------------------
     Phase 2. Every translatable node carries data-i18n (textContent) or
     data-i18n-html (innerHTML). English lives in the markup, so a missing key
     is a no-op rather than a blank page, and an ES toggle is a dictionary
     drop-in — no markup rewrite.
  ------------------------------------------------------------------------ */
  var i18n = CFG.i18n || { defaultLocale: "en", locales: ["en"] };

  var wanted = (function () {
    try {
      var q = new URLSearchParams(window.location.search).get("lang");
      if (q) return q;
      return localStorage.getItem("lang") || i18n.defaultLocale;
    } catch (e) { return i18n.defaultLocale; }
  })();

  if (wanted && wanted !== i18n.defaultLocale && (i18n.locales || []).indexOf(wanted) !== -1) {
    fetch("/i18n/" + encodeURIComponent(wanted) + ".json")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (dict) {
        if (!dict) return;
        document.documentElement.lang = wanted;
        $$("[data-i18n]").forEach(function (el) {
          var v = dict[el.getAttribute("data-i18n")];
          if (v) el.textContent = v;
        });
        $$("[data-i18n-html]").forEach(function (el) {
          var v = dict[el.getAttribute("data-i18n-html")];
          if (v) el.innerHTML = v;
        });
        try { localStorage.setItem("lang", wanted); } catch (e) { /* private mode */ }
      })
      .catch(function () { /* dictionary missing — English stays */ });
  }
})();
