/* VALKARN — the gate sequence on the front page.
   Five scenes stacked in Z. Scrolling pushes the camera through each
   archway: the current scene scales past you while the next one rises.
   Wheel / swipe / keyboard / side-nav all drive the same index. */
(function () {
  "use strict";

  var stage = document.querySelector(".stage");
  if (!stage) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var scenes = Array.prototype.slice.call(
    stage.querySelectorAll(".stage__scene"),
  );
  var gates = Array.prototype.slice.call(document.querySelectorAll(".gate"));
  var navBtns = Array.prototype.slice.call(
    document.querySelectorAll(".anchor-nav button"),
  );
  var hint = document.querySelector(".scroll-hint");
  var flash = document.querySelector(".stage__flash");
  var count = gates.length;

  var index = 0; // the gate we are locked to
  var pos = 0; // animated position, follows index
  var lastMove = 0;
  var wheelAcc = 0;
  var px = 0,
    py = 0,
    tx = 0,
    ty = 0; // pointer parallax

  /* ---------- state ------------------------------------------------ */
  function setIndex(next, instant) {
    next = Math.max(0, Math.min(count - 1, next));
    if (next === index) return;
    index = next;
    lastMove = performance.now();
    if (instant) pos = index;
    syncGateState();
    pulse();
    if (location.hash !== "#gate-" + (index + 1)) {
      history.replaceState(null, "", "#gate-" + (index + 1));
    }
  }

  function syncGateState() {
    gates.forEach(function (gate, i) {
      var active = i === index;
      gate.classList.toggle("is-active", active);
      gate.setAttribute("aria-hidden", active ? "false" : "true");
      // replay the copy animations each time a gate is entered
      var bits = gate.querySelectorAll(".tr, .badge, .btn, [data-reveal]");
      Array.prototype.forEach.call(bits, function (el, k) {
        if (active) {
          setTimeout(
            function () {
              el.classList.add("is-in");
            },
            90 + k * 70,
          );
        } else {
          el.classList.remove("is-in");
        }
      });
      Array.prototype.forEach.call(
        gate.querySelectorAll("a, button"),
        function (el) {
          el.tabIndex = active ? 0 : -1;
        },
      );
    });
    navBtns.forEach(function (b, i) {
      b.classList.toggle("active", i === index);
      b.setAttribute("aria-current", i === index ? "true" : "false");
    });
    if (hint) hint.style.opacity = index === count - 1 ? "0" : "1";
  }

  function pulse() {
    if (!flash || reduced) return;
    flash.style.transition = "none";
    flash.style.opacity = "0.16";
    requestAnimationFrame(function () {
      flash.style.transition = "opacity 0.9s cubic-bezier(0.22,1,0.36,1)";
      flash.style.opacity = "0";
    });
  }

  /* ---------- render ----------------------------------------------- */
  function render() {
    pos += (index - pos) * (reduced ? 1 : 0.105);
    if (Math.abs(index - pos) < 0.004) pos = index;

    tx += (px - tx) * 0.06;
    ty += (py - ty) * 0.06;

    scenes.forEach(function (scene, i) {
      var d = pos - i; // >0 : camera has gone past this scene
      var visible = Math.abs(d) < 1.35;
      scene.style.visibility = visible ? "visible" : "hidden";
      if (!visible) return;

      var scale = d >= 0 ? 1 + d * 0.55 : 1 + d * 0.16;
      var opacity = 1 - Math.min(Math.abs(d) * (d >= 0 ? 1.25 : 1.1), 1);
      var blur = Math.min(Math.abs(d) * 7, 9);
      var lift = -d * 7;

      scene.style.opacity = opacity.toFixed(3);
      scene.style.filter = "blur(" + blur.toFixed(2) + "px)";
      scene.style.transform =
        "translate3d(" +
        (tx * 14 - d * 1.2).toFixed(2) +
        "px," +
        (ty * 12 + lift).toFixed(2) +
        "px,0) scale(" +
        scale.toFixed(4) +
        ")";
      scene.style.zIndex = String(10 - i);
    });

    gates.forEach(function (gate, i) {
      var d = pos - i;
      var o = 1 - Math.min(Math.pow(Math.abs(d), 0.85) * 1.9, 1);
      gate.style.opacity = o.toFixed(3);
      gate.style.transform =
        "translate3d(" +
        (tx * 26).toFixed(2) +
        "px," +
        (-d * 46 + ty * 18).toFixed(2) +
        "vh,0) scale(" +
        (1 + (d >= 0 ? d * 0.18 : d * 0.06)).toFixed(4) +
        ")";
    });

    requestAnimationFrame(render);
  }

  /* ---------- input ------------------------------------------------- */
  var COOLDOWN = 820;
  function canMove() {
    return performance.now() - lastMove > COOLDOWN;
  }

  window.addEventListener(
    "wheel",
    function (e) {
      if (document.body.classList.contains("is-menu-open")) return;
      e.preventDefault();
      if (!canMove()) {
        wheelAcc = 0;
        return;
      }
      wheelAcc += e.deltaY;
      if (Math.abs(wheelAcc) > 42) {
        setIndex(index + (wheelAcc > 0 ? 1 : -1));
        wheelAcc = 0;
      }
    },
    { passive: false },
  );

  var touchY = null;
  window.addEventListener(
    "touchstart",
    function (e) {
      touchY = e.touches[0].clientY;
    },
    { passive: true },
  );
  window.addEventListener(
    "touchmove",
    function (e) {
      if (touchY === null || !canMove()) return;
      var dy = touchY - e.touches[0].clientY;
      if (Math.abs(dy) > 44) {
        setIndex(index + (dy > 0 ? 1 : -1));
        touchY = null;
      }
    },
    { passive: true },
  );
  window.addEventListener("touchend", function () {
    touchY = null;
  });

  window.addEventListener("keydown", function (e) {
    if (document.body.classList.contains("is-menu-open")) return;
    var map = {
      ArrowDown: 1,
      PageDown: 1,
      " ": 1,
      ArrowUp: -1,
      PageUp: -1,
    };
    if (e.key in map) {
      e.preventDefault();
      setIndex(index + map[e.key]);
    } else if (e.key === "Home") {
      setIndex(0);
    } else if (e.key === "End") {
      setIndex(count - 1);
    }
  });

  navBtns.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      setIndex(i);
    });
  });

  if (!reduced) {
    window.addEventListener("pointermove", function (e) {
      px = (e.clientX / window.innerWidth - 0.5) * 2;
      py = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  /* ---------- drifting dust ---------------------------------------- */
  (function dust() {
    var canvas = document.querySelector(".stage__dust");
    if (!canvas || reduced) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var motes = [];
    var w = 0,
      h = 0;

    function size() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var target = Math.round((w * h) / 16000);
      motes = [];
      for (var i = 0; i < target; i++) {
        motes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.6 + 0.3,
          vx: (Math.random() - 0.5) * 0.18,
          vy: -Math.random() * 0.22 - 0.03,
          a: Math.random() * 0.5 + 0.12,
          t: Math.random() * Math.PI * 2,
        });
      }
    }
    size();
    window.addEventListener("resize", size);

    (function frame() {
      ctx.clearRect(0, 0, w, h);
      var boost = performance.now() - lastMove < 900 ? 2.6 : 1;
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.t += 0.01;
        m.x += (m.vx + Math.sin(m.t) * 0.12) * boost;
        m.y += m.vy * boost;
        if (m.y < -10) {
          m.y = h + 10;
          m.x = Math.random() * w;
        }
        if (m.x < -10) m.x = w + 10;
        if (m.x > w + 10) m.x = -10;
        var flicker = 0.75 + Math.sin(m.t * 2.3) * 0.25;
        ctx.beginPath();
        ctx.fillStyle = "rgba(226,214,190," + (m.a * flicker).toFixed(3) + ")";
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    })();
  })();

  /* ---------- boot -------------------------------------------------- */
  var fromHash = parseInt((location.hash.match(/gate-(\d+)/) || [])[1], 10);
  if (fromHash >= 1 && fromHash <= count) {
    index = pos = fromHash - 1;
  }
  syncGateState();
  // hold the reveal until the loader is dismissed
  gates.forEach(function (gate) {
    Array.prototype.forEach.call(
      gate.querySelectorAll(".tr, .badge, .btn, [data-reveal]"),
      function (el) {
        el.classList.remove("is-in");
      },
    );
  });
  if (window.VALKARN && window.VALKARN.Loader) {
    window.VALKARN.Loader.done(function () {
      setTimeout(syncGateState, 500);
    });
  } else {
    syncGateState();
  }
  render();
})();
