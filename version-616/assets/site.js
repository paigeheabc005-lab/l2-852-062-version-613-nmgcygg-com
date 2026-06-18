(function () {
  var navButton = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('.hero-slider');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = 0;
    var timer = null;
    var showSlide = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    var play = function () {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(i);
        play();
      });
    });
    if (slides.length > 1) {
      showSlide(0);
      play();
    }
  }

  var quickSearch = document.querySelector('[data-quick-search]');
  if (quickSearch) {
    quickSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = quickSearch.querySelector('input');
      var query = input ? input.value.trim() : '';
      var target = './search.html';
      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var scope = panel.closest('main') || document;
    var input = panel.querySelector('[data-filter-text]');
    var region = panel.querySelector('[data-filter-region]');
    var year = panel.querySelector('[data-filter-year]');
    var genre = panel.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('.empty-state');

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    var apply = function () {
      var text = input ? input.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var yearValue = year ? year.value : '';
      var genreValue = genre ? genre.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.year || '',
          card.dataset.genre || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var matched = true;
        if (text && haystack.indexOf(text) === -1) matched = false;
        if (regionValue && (card.dataset.region || '') !== regionValue) matched = false;
        if (yearValue && (card.dataset.year || '') !== yearValue) matched = false;
        if (genreValue && (card.dataset.genre || '').indexOf(genreValue) === -1) matched = false;
        card.classList.toggle('hide-card', !matched);
        if (matched) visible += 1;
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    };

    [input, region, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  });

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.play-overlay');
    var stream = shell.getAttribute('data-stream') || '';
    var attached = false;
    var hlsInstance = null;

    var attach = function () {
      if (attached || !video || !stream) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      attached = true;
    };

    var start = function () {
      attach();
      if (overlay) overlay.hidden = true;
      if (video) {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            if (overlay) overlay.hidden = false;
          });
        }
      }
    };

    if (overlay) {
      overlay.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) start();
      });
      video.addEventListener('ended', function () {
        if (overlay) overlay.hidden = false;
      });
    }
    window.addEventListener('pagehide', function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  });
})();
