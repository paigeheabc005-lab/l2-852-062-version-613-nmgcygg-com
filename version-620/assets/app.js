(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    var carousel = document.querySelector(".hero-carousel");
    if (carousel) {
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
    }
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    if (!cards.length) {
      return;
    }
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".movie-filter"));
    var typeSelects = Array.prototype.slice.call(document.querySelectorAll(".type-filter"));
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";

    inputs.forEach(function (input) {
      if (q) {
        input.value = q;
      }
      input.addEventListener("input", apply);
    });

    typeSelects.forEach(function (select) {
      select.addEventListener("change", apply);
    });

    function apply() {
      var keyword = normalize(inputs.map(function (input) {
        return input.value;
      }).join(" "));
      var type = normalize(typeSelects.map(function (select) {
        return select.value;
      }).join(" "));

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
        var typeMatch = !type || normalize(card.dataset.type).indexOf(type) !== -1;
        var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle("hidden-card", !(typeMatch && keywordMatch));
      });
    }

    apply();
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".play-cover");
      if (!video) {
        return;
      }
      var source = video.dataset.video;
      var prepared = false;
      var hls = null;

      function prepare() {
        if (prepared || !source) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        prepare();
        shell.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            video.setAttribute("controls", "controls");
          });
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (!prepared || video.paused) {
          play();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
