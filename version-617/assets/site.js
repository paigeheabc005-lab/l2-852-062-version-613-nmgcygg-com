(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function textOf(element) {
    return (element || "").toString().toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-target]"));
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
        restart();
      });
    });

    root.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });

    root.addEventListener("mouseleave", restart);
    restart();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".search-panel"));

    panels.forEach(function (panel) {
      var section = panel.closest("section") || document;
      var input = panel.querySelector(".filter-input");
      var select = panel.querySelector(".filter-select");
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card, .rank-row"));
      var empty = section.querySelector(".empty-message");

      function apply() {
        var query = textOf(input && input.value);
        var selected = textOf(select && select.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags,
            card.textContent
          ].map(textOf).join(" ");
          var type = textOf(card.dataset.type);
          var passQuery = !query || haystack.indexOf(query) !== -1;
          var passSelect = !selected || type.indexOf(selected) !== -1;
          var pass = passQuery && passSelect;

          card.style.display = pass ? "" : "none";
          if (pass) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
    });
  }

  function attachStream(video, source) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }

    video.src = source;
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".video-player"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-trigger");
      var message = player.querySelector(".player-message");
      var source = player.getAttribute("data-stream");
      var started = false;

      if (!video || !source) {
        return;
      }

      function start() {
        if (!started) {
          attachStream(video, source);
          video.setAttribute("controls", "controls");
          player.classList.add("is-playing");
          started = true;
        }

        var playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function () {
            if (message) {
              message.textContent = "请再次点击播放";
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (!started) {
          start();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
