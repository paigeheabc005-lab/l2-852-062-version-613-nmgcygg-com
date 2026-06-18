(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('.mobile-toggle');
    var nav = qs('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('.hero-slide', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function initCarousel() {
    qsa('[data-carousel]').forEach(function (carousel) {
      var track = qs('.carousel-track', carousel);
      var prev = qs('[data-carousel-prev]', carousel);
      var next = qs('[data-carousel-next]', carousel);
      var position = 0;
      if (!track || !prev || !next) {
        return;
      }
      function update() {
        track.style.transform = 'translateX(' + (-position * 33.333) + '%)';
      }
      prev.addEventListener('click', function () {
        position = Math.max(0, position - 1);
        update();
      });
      next.addEventListener('click', function () {
        var max = Math.max(0, track.children.length - 3);
        position = position >= max ? 0 : position + 1;
        update();
      });
    });
  }

  function initFilter() {
    var list = qs('[data-filter-list]');
    var input = qs('[data-filter-input]');
    var select = qs('[data-filter-select]');
    if (!list || !input) {
      return;
    }
    var cards = qsa('.movie-card', list);
    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var type = select ? select.value : '';
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedType = !type || text.indexOf(type.toLowerCase()) !== -1;
        card.style.display = matchedKeyword && matchedType ? '' : 'none';
      });
    }
    input.addEventListener('input', apply);
    if (select) {
      select.addEventListener('change', apply);
    }
  }

  function cardHtml(movie) {
    return [
      '<a class="movie-card" href="' + movie.url + '">',
      '  <span class="poster-wrap">',
      '    <img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="play-badge">▶</span>',
      '    <span class="year-badge">' + movie.year + '</span>',
      '  </span>',
      '  <span class="card-body">',
      '    <strong>' + movie.title + '</strong>',
      '    <em>' + movie.oneLine + '</em>',
      '    <span class="card-meta">' + movie.region + ' · ' + movie.genre + '</span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function initSearchPage() {
    var results = qs('#search-results');
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim().toLowerCase();
    var inputs = qsa('input[name="q"]');
    inputs.forEach(function (input) {
      input.value = params.get('q') || '';
    });
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      if (!query) {
        return true;
      }
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
        .join(' ')
        .toLowerCase()
        .indexOf(query) !== -1;
    }).slice(0, 96);
    if (!matched.length) {
      results.innerHTML = '<div class="empty-state">未找到匹配影片</div>';
      return;
    }
    results.innerHTML = matched.map(cardHtml).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initCarousel();
    initFilter();
    initSearchPage();
  });
})();
