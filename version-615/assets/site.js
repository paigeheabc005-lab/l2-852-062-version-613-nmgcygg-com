(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var slideIndex = 0;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }

    slideIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, index) {
      slide.classList.toggle('active', index === slideIndex);
    });

    dots.forEach(function (dot, index) {
      dot.classList.toggle('active', index === slideIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var next = parseInt(dot.getAttribute('data-slide') || '0', 10);
      showSlide(next);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5200);
  }

  Array.prototype.slice.call(document.querySelectorAll('.search-form')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';

      if (!value) {
        return;
      }

      event.preventDefault();
      window.location.href = './ranking.html?q=' + encodeURIComponent(value);
    });
  });

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  var filterScope = document.querySelector('[data-filterable="true"]');

  if (filterScope) {
    var cards = Array.prototype.slice.call(filterScope.querySelectorAll('.movie-card'));
    var searchInput = document.querySelector('.movie-search');
    var yearFilter = document.querySelector('.year-filter');
    var regionFilter = document.querySelector('.region-filter');
    var emptyTip = document.querySelector('.empty-tip');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var year = normalize(yearFilter ? yearFilter.value : '');
      var region = normalize(regionFilter ? regionFilter.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var match = true;

        if (query && text.indexOf(query) === -1) {
          match = false;
        }

        if (year && cardYear !== year) {
          match = false;
        }

        if (region && cardRegion !== region) {
          match = false;
        }

        card.hidden = !match;

        if (match) {
          visible += 1;
        }
      });

      if (emptyTip) {
        emptyTip.hidden = visible !== 0;
      }
    }

    [searchInput, yearFilter, regionFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  function loadHlsLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      var existing = document.querySelector('script[data-hls-lib="true"]');

      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existing.addEventListener('error', reject);
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
      script.async = true;
      script.setAttribute('data-hls-lib', 'true');
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function attachStream(video, streamUrl) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return Promise.resolve();
    }

    return loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video._hls = hls;
        return;
      }

      video.src = streamUrl;
    });
  }

  var playerBox = document.querySelector('.player-box');

  if (playerBox) {
    var video = playerBox.querySelector('.movie-video');
    var cover = playerBox.querySelector('.player-cover');
    var started = false;

    function startPlayback() {
      if (!video) {
        return;
      }

      var streamUrl = video.getAttribute('data-video');

      if (!streamUrl) {
        return;
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      var ready = started ? Promise.resolve() : attachStream(video, streamUrl);
      started = true;

      ready.then(function () {
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }).catch(function () {
        video.src = streamUrl;
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      });
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    playerBox.addEventListener('click', function (event) {
      if (event.target === video && !started) {
        startPlayback();
      }
    });
  }
})();
