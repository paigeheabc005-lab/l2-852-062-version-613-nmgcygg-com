(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setActive(items, index, activeClass) {
    items.forEach(function (item, itemIndex) {
      item.classList.toggle(activeClass, itemIndex === index);
    });
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      menu.hidden = !isOpen;
      button.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");

    if (slides.length < 2) {
      return;
    }

    var index = 0;
    var timer = null;

    function go(target) {
      index = (target + slides.length) % slides.length;
      setActive(slides, index, "active");
      setActive(dots, index, "active");
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        go(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        go(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        go(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        go(dotIndex);
        start();
      });
    });

    start();
  }

  function initFeatured() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-featured-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-featured-dot]"));
    var prev = document.querySelector("[data-featured-prev]");
    var next = document.querySelector("[data-featured-next]");

    if (slides.length < 2) {
      return;
    }

    var index = 0;

    function go(target) {
      index = (target + slides.length) % slides.length;
      setActive(slides, index, "active");
      setActive(dots, index, "active");
    }

    if (prev) {
      prev.addEventListener("click", function () {
        go(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        go(index + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        go(dotIndex);
      });
    });
  }

  function initLocalFilter() {
    var input = document.querySelector(".local-filter-input");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
    var empty = document.querySelector("[data-filter-empty]");

    if (!input || cards.length === 0) {
      return;
    }

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-filter") || card.textContent || "").toLowerCase();
        var matched = text.indexOf(query) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    });
  }

  function getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function movieCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "" +
      "<article class=\"movie-card\">" +
      "<a href=\"" + escapeAttr(movie.link) + "\" class=\"poster-wrap\" aria-label=\"" + escapeAttr(movie.title) + " 在线观看\">" +
      "<img src=\"" + escapeAttr(movie.cover) + "\" alt=\"" + escapeAttr(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"card-play\">▶</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<h3><a href=\"" + escapeAttr(movie.link) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"card-tags\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function initSearchPage() {
    var input = document.querySelector("[data-global-search-input]");
    var form = document.querySelector("[data-global-search-form]");
    var results = document.querySelector("[data-global-search-results]");
    var empty = document.querySelector("[data-global-search-empty]");

    if (!input || !form || !results || !Array.isArray(window.MOVIE_SEARCH_INDEX)) {
      return;
    }

    function render(query) {
      var words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        if (words.length === 0) {
          return true;
        }

        var haystack = movie.searchText.toLowerCase();
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 120);

      results.innerHTML = matched.map(movieCard).join("");
      if (empty) {
        empty.hidden = matched.length !== 0;
      }
    }

    var initial = getParam("q");
    input.value = initial;
    render(initial);

    input.addEventListener("input", function () {
      render(input.value);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render(input.value);
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set("q", input.value.trim());
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState(null, "", url.toString());
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFeatured();
    initLocalFilter();
    initSearchPage();
  });
}());
