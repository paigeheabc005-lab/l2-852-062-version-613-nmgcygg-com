(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === active);
            });

            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === active);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(active - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
        var form = scope.querySelector('[data-filter-form]');
        var input = scope.querySelector('[data-filter-query]');
        var region = scope.querySelector('[data-filter-region]');
        var year = scope.querySelector('[data-filter-year]');
        var reset = scope.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var empty = scope.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var queryValue = normalize(input && input.value);
            var regionValue = normalize(region && region.value);
            var yearValue = normalize(year && year.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var matched = true;

                if (queryValue && haystack.indexOf(queryValue) === -1) {
                    matched = false;
                }

                if (regionValue && cardRegion !== regionValue) {
                    matched = false;
                }

                if (yearValue && cardYear !== yearValue) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                applyFilter();
            });
        }

        [input, region, year].forEach(function (field) {
            if (field) {
                field.addEventListener('input', applyFilter);
                field.addEventListener('change', applyFilter);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                window.setTimeout(applyFilter, 0);
            });
        }

        applyFilter();
    });

    var hlsPromise = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsPromise) {
            return hlsPromise;
        }

        hlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });

        return hlsPromise;
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var video = player.querySelector('video');
        var stream = player.getAttribute('data-stream');
        var playButtons = Array.prototype.slice.call(player.querySelectorAll('[data-player-play]'));
        var muteButton = player.querySelector('[data-player-mute]');
        var fullButton = player.querySelector('[data-player-full]');
        var message = player.querySelector('[data-player-message]');
        var attached = false;
        var hls = null;

        if (!video || !stream) {
            return;
        }

        function setMessage(text) {
            if (!message) {
                return;
            }

            message.textContent = text || '';
            message.classList.toggle('is-visible', Boolean(text));
        }

        function attachStream() {
            if (attached) {
                return Promise.resolve();
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return Promise.resolve();
            }

            return loadHls().then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    return;
                }

                video.src = stream;
            }).catch(function () {
                video.src = stream;
            });
        }

        function playOrPause() {
            attachStream().then(function () {
                if (video.paused) {
                    return video.play();
                }

                video.pause();
            }).catch(function () {
                setMessage('播放暂时不可用');
            });
        }

        playButtons.forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                playOrPause();
            });
        });

        video.addEventListener('click', playOrPause);

        video.addEventListener('play', function () {
            player.classList.add('is-playing');
            playButtons.forEach(function (button) {
                if (button.textContent.trim()) {
                    button.textContent = '暂停';
                }
            });
            setMessage('');
        });

        video.addEventListener('pause', function () {
            player.classList.remove('is-playing');
            playButtons.forEach(function (button) {
                if (button.textContent.trim()) {
                    button.textContent = '播放';
                }
            });
        });

        video.addEventListener('error', function () {
            setMessage('播放暂时不可用');
        });

        if (muteButton) {
            muteButton.addEventListener('click', function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? '开声' : '静音';
            });
        }

        if (fullButton) {
            fullButton.addEventListener('click', function () {
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                } else if (player.requestFullscreen) {
                    player.requestFullscreen();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
