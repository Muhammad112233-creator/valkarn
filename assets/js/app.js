/* VALKARN — shared front-end behaviour.
   No frameworks, no build step. Everything degrades if JS is off.
   Sections: utils / loader / header / menu / smooth scroll / reveals /
   text splitting / tabs / carousel / tilt / sheet / audio / transitions. */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var body = doc.body;
  var isHome = body.classList.contains("home");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches;

  function $(sel, ctx) {
    return (ctx || doc).querySelector(sel);
  }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));
  }
  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }
  function on(el, ev, fn, opt) {
    if (el) el.addEventListener(ev, fn, opt);
  }

  /* ----------------------------------------------------------------- *
   * 1. Loader
   * ----------------------------------------------------------------- */
  var Loader = (function () {
    var el = $(".loader");
    if (!el)
      return {
        done: function (cb) {
          cb();
        },
      };

    var fills = $$("[data-loader-fill]", el);
    var counts = $$("[data-loader-count]", el);
    var inner = $(".loader__inner", el);
    var enter = $("[data-enter]", el);
    var callbacks = [];
    var shown = 0;
    var target = 0;
    var finished = false;

    // Progress is driven by real image decoding, with a floor so the
    // counter always moves even on a warm cache.
    var imgs = $$("img").filter(function (i) {
      return i.loading !== "lazy";
    });
    var total = Math.max(imgs.length, 1);
    var loaded = 0;
    imgs.forEach(function (img) {
      if (img.complete) {
        loaded++;
        return;
      }
      var bump = function () {
        loaded++;
      };
      on(img, "load", bump);
      on(img, "error", bump);
    });

    var start = performance.now();
    function tick(now) {
      var byImages = loaded / total;
      var byTime = clamp((now - start) / 1250, 0, 1); // never stalls
      target = Math.max(byTime, Math.min(byImages, 1) * 0.9);
      shown += (target * 100 - shown) * 0.14;
      var v = Math.min(Math.round(shown), 100);
      fills.forEach(function (f) {
        f.style.transform = "scaleY(" + v / 100 + ")";
      });
      counts.forEach(function (c) {
        c.textContent = v;
        var side = c.getAttribute("data-loader-count");
        c.style[side === "bottom" ? "bottom" : "top"] =
          "calc(" + v + "% - 1.3em)";
      });
      if (v >= 100 && !finished) {
        finished = true;
        ready();
        return;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(function () {
      if (inner) inner.classList.add("is-in");
      requestAnimationFrame(tick);
    });

    function ready() {
      if (enter && isHome) {
        enter.classList.add("is-in");
        enter.style.pointerEvents = "auto";
        on(enter, "click", dismiss);
      } else {
        setTimeout(dismiss, 260);
      }
    }

    function dismiss() {
      if (el.classList.contains("is-out")) return;
      el.classList.add("is-out");
      body.classList.remove("is-loading");
      setTimeout(function () {
        el.style.display = "none";
      }, 1300);
      callbacks.forEach(function (cb) {
        cb();
      });
    }

    return {
      done: function (cb) {
        if (el.classList.contains("is-out")) cb();
        else callbacks.push(cb);
      },
    };
  })();

  /* ----------------------------------------------------------------- *
   * 2. Header show / fill state
   * ----------------------------------------------------------------- */
  var header = $(".header");
  if (header) {
    header.classList.add("is-hidden");
    Loader.done(function () {
      setTimeout(function () {
        header.classList.remove("is-hidden");
      }, 420);
    });

    if (!isHome) {
      var hero = $(".hero");
      var fillPoint = function () {
        return hero ? hero.offsetHeight - 140 : 120;
      };
      var lastY = 0;
      var onScroll = function () {
        var y = window.scrollY;
        header.classList.toggle("is-filled", y > fillPoint());
        // hide on the way down, bring it back on the way up
        if (y > 260 && y > lastY + 4) header.classList.add("is-hidden");
        else if (y < lastY - 4 || y < 120) header.classList.remove("is-hidden");
        lastY = y;
      };
      on(window, "scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ----------------------------------------------------------------- *
   * 3. Menu panel
   * ----------------------------------------------------------------- */
  (function () {
    var openBtn = $("[data-menu-open]");
    var closeBtn = $("[data-menu-close]");
    var overlay = $(".menu-overlay");
    var panel = $(".menu-panel");
    if (!openBtn || !panel) return;

    var lastFocus = null;
    function open() {
      lastFocus = doc.activeElement;
      body.classList.add("is-menu-open");
      openBtn.setAttribute("aria-expanded", "true");
      var first = $("a", panel);
      if (first)
        setTimeout(function () {
          first.focus();
        }, 380);
      // stagger the links in
      $$(".menu-nav a", panel).forEach(function (a, i) {
        a.style.transitionDelay = 120 + i * 55 + "ms";
        a.style.opacity = "0";
        a.style.transform = "translateX(-18px)";
        requestAnimationFrame(function () {
          a.style.opacity = "";
          a.style.transform = "";
        });
      });
    }
    function close() {
      body.classList.remove("is-menu-open");
      openBtn.setAttribute("aria-expanded", "false");
      $$(".menu-nav a", panel).forEach(function (a) {
        a.style.transitionDelay = "";
      });
      if (lastFocus) lastFocus.focus();
    }
    on(openBtn, "click", open);
    on(closeBtn, "click", close);
    on(overlay, "click", close);
    on(doc, "keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("is-menu-open"))
        close();
    });
  })();

  /* ----------------------------------------------------------------- *
   * 4. Smooth scroll (inner pages, pointer devices only)
   * ----------------------------------------------------------------- */
  if (!isHome && !reduced && !isTouch) {
    var current = window.scrollY;
    var goal = current;
    var running = false;

    function maxScroll() {
      return doc.documentElement.scrollHeight - window.innerHeight;
    }
    function loop() {
      current += (goal - current) * 0.11;
      if (Math.abs(goal - current) < 0.4) {
        current = goal;
        running = false;
      }
      window.scrollTo(0, current);
      if (running) requestAnimationFrame(loop);
    }
    on(
      window,
      "wheel",
      function (e) {
        if (e.ctrlKey) return;
        if (e.target.closest && e.target.closest("[data-native-scroll]"))
          return;
        e.preventDefault();
        goal = clamp(goal + e.deltaY, 0, maxScroll());
        if (!running) {
          running = true;
          requestAnimationFrame(loop);
        }
      },
      { passive: false },
    );
    // keep the virtual position honest when something else scrolls us
    on(
      window,
      "scroll",
      function () {
        if (!running) {
          current = goal = window.scrollY;
        }
      },
      { passive: true },
    );
    on(window, "resize", function () {
      current = goal = window.scrollY;
    });
  }

  /* ----------------------------------------------------------------- *
   * 5. Text splitting + reveals
   * ----------------------------------------------------------------- */
  function splitChars(el) {
    var text = el.textContent;
    el.textContent = "";
    var frag = doc.createDocumentFragment();
    var words = text.split(/(\s+)/);
    words.forEach(function (word) {
      if (/^\s+$/.test(word)) {
        frag.appendChild(doc.createTextNode(" "));
        return;
      }
      var w = doc.createElement("span");
      w.style.display = "inline-block";
      w.style.whiteSpace = "nowrap";
      word.split("").forEach(function (ch) {
        var s = doc.createElement("span");
        s.className = "tr-char";
        s.textContent = ch;
        w.appendChild(s);
      });
      frag.appendChild(w);
    });
    el.appendChild(frag);
    $$(".tr-char", el).forEach(function (c, i) {
      c.style.transitionDelay = i * 0.016 + "s";
    });
  }

  function splitLines(el) {
    var html = el.innerHTML;
    el.setAttribute("data-source", html);
    var text = el.textContent.replace(/\s+/g, " ").trim();
    el.textContent = "";
    var probe = doc.createElement("span");
    text.split(" ").forEach(function (word, i) {
      var w = doc.createElement("span");
      w.className = "tr-word";
      w.style.display = "inline-block";
      w.textContent = word;
      probe.appendChild(w);
      if (i < text.split(" ").length - 1)
        probe.appendChild(doc.createTextNode(" "));
    });
    el.appendChild(probe);

    // group words by their vertical offset, then wrap each row
    var rows = [];
    $$(".tr-word", el).forEach(function (w) {
      var top = w.offsetTop;
      var row = rows[rows.length - 1];
      if (!row || Math.abs(row.top - top) > 4) {
        rows.push({ top: top, words: [w] });
      } else {
        row.words.push(w);
      }
    });
    el.textContent = "";
    rows.forEach(function (row, i) {
      var line = doc.createElement("span");
      line.className = "tr-line";
      var innerSpan = doc.createElement("span");
      innerSpan.textContent = row.words
        .map(function (w) {
          return w.textContent;
        })
        .join(" ");
      innerSpan.style.transitionDelay = i * 0.07 + "s";
      line.appendChild(innerSpan);
      el.appendChild(line);
    });
  }

  function prepareTextReveals() {
    $$(".tr").forEach(function (el) {
      if (el.dataset.prepared) return;
      el.dataset.prepared = "1";
      if (reduced) {
        el.classList.add("is-ready", "is-in");
        return;
      }
      if (el.dataset.animation === "char") splitChars(el);
      else splitLines(el);
      el.classList.add("is-ready");
    });
  }

  /* Reveal scanner.
     Deliberately not an IntersectionObserver: several of these elements are
     hidden with clip-path, which collapses the intersection rect to nothing
     and the callback then never fires. A rect check on scroll is boring,
     predictable, and cheap enough at this element count. */
  var watched = [];
  var scanQueued = false;

  function observe(el) {
    if (el.dataset.watched) return;
    el.dataset.watched = "1";
    watched.push({
      el: el,
      delay: parseFloat(el.dataset.delay || 0) * 1000,
      repeat: el.dataset.repeat === "true",
    });
  }

  function scan() {
    scanQueued = false;
    var h = window.innerHeight;
    for (var i = watched.length - 1; i >= 0; i--) {
      var item = watched[i];
      var r = item.el.getBoundingClientRect();
      var inView = r.top < h * 0.88 && r.bottom > -h * 0.25;
      if (inView) {
        if (!item.el.classList.contains("is-in")) {
          (function (it) {
            setTimeout(function () {
              it.el.classList.add("is-in");
            }, it.delay);
          })(item);
        }
        if (!item.repeat) watched.splice(i, 1);
      } else if (item.repeat) {
        item.el.classList.remove("is-in");
      }
    }
  }

  function queueScan() {
    if (scanQueued) return;
    scanQueued = true;
    requestAnimationFrame(scan);
  }

  on(window, "scroll", queueScan, { passive: true });
  on(window, "resize", queueScan);

  function bindReveals() {
    prepareTextReveals();
    $$("[data-reveal], .tr, .badge, .btn, .sword-v").forEach(observe);
    scan();
  }

  /* ----------------------------------------------------------------- *
   * 6. Hero intro
   * ----------------------------------------------------------------- */
  Loader.done(function () {
    var hero = $(".hero");
    if (hero) {
      requestAnimationFrame(function () {
        hero.classList.add("is-in");
      });
    }
    bindReveals();
  });
  // If the loader is already gone (fast cache), still wire things up.
  setTimeout(bindReveals, 2400);

  /* ----------------------------------------------------------------- *
   * 7. Tabs / filtering
   * ----------------------------------------------------------------- */
  $$("[data-tabs]").forEach(function (group) {
    var triggers = $$("[data-tab]", group);
    var targetSel = group.getAttribute("data-tabs-target");
    var items = targetSel ? $$(targetSel + " [data-cat]") : [];

    function select(value) {
      triggers.forEach(function (t) {
        t.setAttribute("aria-selected", String(t.dataset.tab === value));
      });
      items.forEach(function (item) {
        var show = value === "all" || item.dataset.cat === value;
        item.hidden = !show;
        if (show) {
          item.style.animation = "none";
          void item.offsetWidth;
          item.style.animation = "";
        }
      });
      var panels = $$("[data-tab-panel]", group);
      panels.forEach(function (p) {
        p.hidden = p.dataset.tabPanel !== value;
      });
    }
    triggers.forEach(function (t) {
      on(t, "click", function () {
        select(t.dataset.tab);
      });
      on(t, "keydown", function (e) {
        var i = triggers.indexOf(t);
        if (e.key === "ArrowRight") triggers[(i + 1) % triggers.length].focus();
        if (e.key === "ArrowLeft")
          triggers[(i - 1 + triggers.length) % triggers.length].focus();
      });
    });
    var initial =
      group.getAttribute("data-tabs-default") ||
      (triggers[0] && triggers[0].dataset.tab);
    if (initial) select(initial);
  });

  /* ----------------------------------------------------------------- *
   * 8. Carousels (drag + arrows)
   * ----------------------------------------------------------------- */
  $$(".carousel").forEach(function (car) {
    var track = $(".carousel__track", car);
    var prev = $("[data-car-prev]", car);
    var next = $("[data-car-next]", car);
    if (!track) return;

    function step() {
      var first = track.firstElementChild;
      return first ? first.getBoundingClientRect().width + 28 : 240;
    }
    function sync() {
      if (prev) prev.disabled = track.scrollLeft < 8;
      if (next)
        next.disabled =
          track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    }
    on(prev, "click", function () {
      track.scrollBy({ left: -step() * 2, behavior: "smooth" });
    });
    on(next, "click", function () {
      track.scrollBy({ left: step() * 2, behavior: "smooth" });
    });
    on(track, "scroll", sync, { passive: true });
    sync();

    // pointer drag
    var down = false;
    var startX = 0;
    var startLeft = 0;
    var moved = 0;
    on(track, "pointerdown", function (e) {
      if (e.pointerType === "touch") return;
      down = true;
      moved = 0;
      startX = e.clientX;
      startLeft = track.scrollLeft;
      track.classList.add("is-dragging");
      track.setPointerCapture(e.pointerId);
    });
    on(track, "pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      track.scrollLeft = startLeft - dx;
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
      on(track, ev, function () {
        if (!down) return;
        down = false;
        track.classList.remove("is-dragging");
      });
    });
    on(
      track,
      "click",
      function (e) {
        if (moved > 6) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true,
    );
  });

  /* ----------------------------------------------------------------- *
   * 9. Card tilt
   * ----------------------------------------------------------------- */
  if (!isTouch && !reduced) {
    $$("[data-tilt]").forEach(function (card) {
      var rect = null;
      on(card, "pointerenter", function () {
        rect = card.getBoundingClientRect();
      });
      on(card, "pointermove", function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateY(" +
          px * 7 +
          "deg) rotateX(" +
          -py * 9 +
          "deg) translateY(-6px)";
      });
      on(card, "pointerleave", function () {
        card.style.transform = "";
        rect = null;
      });
    });
  }

  /* ----------------------------------------------------------------- *
   * 10. Preview sheet
   * ----------------------------------------------------------------- */
  (function () {
    var sheet = $(".sheet");
    if (!sheet) return;
    var mount = $("[data-sheet-mount]", sheet);
    var backdrop = $(".sheet-backdrop");
    var opener = null;

    function open(id) {
      var tpl = $('template[data-preview="' + id + '"]');
      if (!tpl || !mount) return;
      mount.innerHTML = "";
      mount.appendChild(tpl.content.cloneNode(true));
      body.classList.add("is-sheet-open");
      sheet.setAttribute("aria-hidden", "false");
      prepareTextReveals();
      $$(".tr, [data-reveal]", mount).forEach(function (el) {
        setTimeout(function () {
          el.classList.add("is-in");
        }, 260);
      });
      var close = $(".sheet__close", sheet);
      if (close)
        setTimeout(function () {
          close.focus();
        }, 200);
    }
    function close() {
      body.classList.remove("is-sheet-open");
      sheet.setAttribute("aria-hidden", "true");
      if (opener) opener.focus();
      setTimeout(function () {
        if (!body.classList.contains("is-sheet-open") && mount)
          mount.innerHTML = "";
      }, 700);
    }
    $$("[data-sheet-open]").forEach(function (btn) {
      on(btn, "click", function (e) {
        e.preventDefault();
        opener = btn;
        open(btn.getAttribute("data-sheet-open"));
      });
    });
    on(sheet, "click", function (e) {
      if (e.target.closest(".sheet__close")) close();
    });
    on(backdrop, "click", close);
    on(doc, "keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("is-sheet-open"))
        close();
    });
  })();

  /* ----------------------------------------------------------------- *
   * 11. Ambient audio (synthesised — no media files to ship)
   * ----------------------------------------------------------------- */
  (function () {
    var buttons = $$(".audio-toggle button");
    if (!buttons.length) return;
    var ctx = null;
    var master = null;
    var playing = false;

    function build() {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      // wind: filtered pink-ish noise, slowly sweeping
      var len = ctx.sampleRate * 4;
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var data = buf.getChannelData(0);
      var last = 0;
      for (var i = 0; i < len; i++) {
        var white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.2;
      }
      var noise = ctx.createBufferSource();
      noise.buffer = buf;
      noise.loop = true;
      var band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 420;
      band.Q.value = 0.7;
      var noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.5;
      noise.connect(band).connect(noiseGain).connect(master);
      noise.start();

      // drone: two detuned low oscillators
      [55, 82.5].forEach(function (f, idx) {
        var osc = ctx.createOscillator();
        osc.type = idx ? "triangle" : "sine";
        osc.frequency.value = f;
        var g = ctx.createGain();
        g.gain.value = idx ? 0.035 : 0.06;
        osc.connect(g).connect(master);
        osc.start();
      });

      // slow LFO on the wind filter so it breathes
      var lfo = ctx.createOscillator();
      lfo.frequency.value = 0.06;
      var lfoGain = ctx.createGain();
      lfoGain.gain.value = 240;
      lfo.connect(lfoGain).connect(band.frequency);
      lfo.start();
      return true;
    }

    function setState(next) {
      playing = next;
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(playing));
      });
      try {
        localStorage.setItem("valkarn:sound", playing ? "on" : "off");
      } catch (err) {}
      if (!ctx) return;
      var now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(playing ? 0.18 : 0, now, 0.6);
    }

    buttons.forEach(function (btn) {
      on(btn, "click", function () {
        if (!ctx && !build()) return;
        if (ctx.state === "suspended") ctx.resume();
        setState(!playing);
      });
    });

    // Autoplay is not allowed until a gesture; remember the choice instead.
    var stored = null;
    try {
      stored = localStorage.getItem("valkarn:sound");
    } catch (e) {}
    if (stored === "on") {
      var kick = function () {
        if (!ctx && build()) setState(true);
        doc.removeEventListener("pointerdown", kick);
        doc.removeEventListener("keydown", kick);
      };
      on(doc, "pointerdown", kick);
      on(doc, "keydown", kick);
    }
  })();

  /* ----------------------------------------------------------------- *
   * 12. Brush page transition
   * ----------------------------------------------------------------- */
  (function () {
    var veil = $(".veil");
    if (!veil) return;

    // arriving: wipe the veil away
    requestAnimationFrame(function () {
      veil.classList.add("is-clearing");
      setTimeout(function () {
        veil.className = "veil";
      }, 800);
    });

    if (reduced) return;
    on(doc, "click", function (e) {
      var a = e.target.closest && e.target.closest("a");
      if (!a) return;
      if (
        a.target === "_blank" ||
        a.hasAttribute("download") ||
        a.dataset.noTransition !== undefined
      )
        return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || /^(mailto|tel|http)/.test(href))
        return;
      if (a.origin && a.origin !== location.origin) return;
      e.preventDefault();
      veil.className = "veil is-covering";
      setTimeout(function () {
        location.href = href;
      }, 560);
    });
  })();

  /* ----------------------------------------------------------------- *
   * 13. Newsletter / contact forms (no backend — template friendly)
   * ----------------------------------------------------------------- */
  $$("form[data-demo-form]").forEach(function (form) {
    on(form, "submit", function (e) {
      e.preventDefault();
      var ok = $(".form-ok", form);
      if (ok) ok.classList.add("is-in");
      form.reset();
    });
  });

  /* ----------------------------------------------------------------- *
   * 14. Footer year + current nav state
   * ----------------------------------------------------------------- */
  $$("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  var here = location.pathname.split("/").pop() || "index.html";
  $$(".menu-nav a").forEach(function (a) {
    if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page");
  });

  window.VALKARN = { $: $, $$: $$, Loader: Loader, bindReveals: bindReveals };
})();
