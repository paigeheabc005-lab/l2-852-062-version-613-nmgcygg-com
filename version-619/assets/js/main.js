(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav]');

    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    document.addEventListener('error', function (event) {
        var target = event.target;
        if (target && target.tagName === 'IMG') {
            var holder = target.closest('.poster, .rank-cover, .detail-poster, .hero-cover, .category-thumbs');
            if (holder) {
                holder.classList.add('no-image');
            }
        }
    }, true);

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        var show = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        var restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                restart();
            });
        });

        restart();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
        var input = panel.querySelector('[data-filter-input]');
        var type = panel.querySelector('[data-filter-type]');
        var region = panel.querySelector('[data-filter-region]');
        var year = panel.querySelector('[data-filter-year]');
        var list = document.querySelector('[data-filter-list]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]')) : [];

        var query = new URLSearchParams(window.location.search).get('q');
        if (query && input) {
            input.value = query;
        }

        var apply = function () {
            var words = input ? input.value.trim().toLowerCase().split(/\s+/).filter(Boolean) : [];
            var typeValue = type ? type.value : '';
            var regionValue = region ? region.value : '';
            var yearValue = year ? year.value : '';

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var okWords = words.every(function (word) {
                    return text.indexOf(word) !== -1;
                });
                var okType = !typeValue || card.getAttribute('data-type') === typeValue;
                var okRegion = !regionValue || card.getAttribute('data-region') === regionValue;
                var okYear = !yearValue || card.getAttribute('data-year') === yearValue;
                card.classList.toggle('is-hidden', !(okWords && okType && okRegion && okYear));
            });
        };

        [input, type, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    });
}());
