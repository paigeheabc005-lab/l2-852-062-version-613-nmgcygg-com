(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobile = document.querySelector(".mobile-nav");
    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        var open = mobile.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var heroIndex = 0;
    var heroTimer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === heroIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === heroIndex);
      });
    }

    function restartHero() {
      if (heroTimer) {
        clearInterval(heroTimer);
      }
      if (slides.length > 1) {
        heroTimer = setInterval(function () {
          showHero(heroIndex + 1);
        }, 5200);
      }
    }

    document.querySelectorAll(".hero-control.prev").forEach(function (button) {
      button.addEventListener("click", function () {
        showHero(heroIndex - 1);
        restartHero();
      });
    });

    document.querySelectorAll(".hero-control.next").forEach(function (button) {
      button.addEventListener("click", function () {
        showHero(heroIndex + 1);
        restartHero();
      });
    });

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showHero(Number(dot.getAttribute("data-slide-to")) || 0);
        restartHero();
      });
    });

    showHero(0);
    restartHero();

    document.querySelectorAll("[data-scroll]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-scroll"));
        var dir = button.getAttribute("data-dir") === "left" ? -1 : 1;
        if (target) {
          target.scrollBy({ left: dir * 420, behavior: "smooth" });
        }
      });
    });

    document.querySelectorAll(".local-filter-input").forEach(function (input) {
      var area = document.querySelector(".local-card-area");
      if (!area) {
        return;
      }
      var items = Array.prototype.slice.call(area.querySelectorAll(".video-card"));
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        items.forEach(function (item) {
          var hay = [
            item.getAttribute("data-title") || "",
            item.getAttribute("data-region") || "",
            item.getAttribute("data-genre") || ""
          ].join(" ").toLowerCase();
          item.classList.toggle("is-hidden", q && hay.indexOf(q) === -1);
        });
      });
    });

    var searchBox = document.getElementById("search-box");
    var searchResults = document.getElementById("search-results");
    if (searchBox && searchResults && Array.isArray(window.siteSearchData)) {
      var params = new URLSearchParams(window.location.search);
      var incoming = params.get("q") || "";
      if (incoming) {
        searchBox.value = incoming;
      }

      function itemHtml(item) {
        return [
          '<article class="video-card">',
          '<a href="' + item.url + '" class="poster-link">',
          '<span class="poster-wrap">',
          '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '<span class="poster-shade"></span>',
          '<span class="play-mark">▶</span>',
          '<span class="corner-badge">' + escapeHtml(item.year) + '</span>',
          '</span>',
          '<span class="card-copy">',
          '<strong>' + escapeHtml(item.title) + '</strong>',
          '<em>' + escapeHtml(item.oneLine) + '</em>',
          '<span class="meta-row"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></span>',
          '</span>',
          '</a>',
          '</article>'
        ].join("");
      }

      function escapeHtml(value) {
        return String(value || "").replace(/[&<>'"]/g, function (ch) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
          }[ch];
        });
      }

      function renderSearch() {
        var q = searchBox.value.trim().toLowerCase();
        if (!q) {
          searchResults.innerHTML = '<div class="search-empty">输入关键词开始搜索。</div>';
          return;
        }
        var list = window.siteSearchData.filter(function (item) {
          var hay = [item.title, item.region, item.year, item.type, item.genre, item.oneLine, item.category].join(" ").toLowerCase();
          return hay.indexOf(q) !== -1;
        }).slice(0, 80);
        searchResults.innerHTML = list.length ? list.map(itemHtml).join("") : '<div class="search-empty">没有找到匹配内容。</div>';
      }

      searchBox.addEventListener("input", renderSearch);
      renderSearch();
    }

    var player = document.getElementById("movie-player");
    var cover = document.querySelector(".player-cover");
    if (player) {
      var videoUrl = player.getAttribute("data-video") || "";
      var activated = false;

      function bindPlayer() {
        if (activated || !videoUrl) {
          return;
        }
        activated = true;
        if (player.canPlayType("application/vnd.apple.mpegurl")) {
          player.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(videoUrl);
          hls.attachMedia(player);
        } else {
          player.src = videoUrl;
        }
      }

      function startPlayer() {
        bindPlayer();
        if (cover) {
          cover.classList.add("hidden");
        }
        var result = player.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", startPlayer);
      }
      player.addEventListener("click", function () {
        if (player.paused) {
          startPlayer();
        }
      });
      player.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("hidden");
        }
      });
      player.addEventListener("loadedmetadata", function () {
        if (cover && !player.paused) {
          cover.classList.add("hidden");
        }
      });
    }
  });
})();
