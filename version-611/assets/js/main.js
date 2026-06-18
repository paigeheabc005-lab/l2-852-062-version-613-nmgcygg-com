(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function getQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var links = document.querySelector("[data-nav-links]");
        if (!button || !links) {
            return;
        }
        button.addEventListener("click", function () {
            links.classList.toggle("open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var thumbs = Array.prototype.slice.call(root.querySelectorAll("[data-hero-thumb]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle("active", thumbIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        thumbs.forEach(function (thumb, index) {
            thumb.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupQuickSearch() {
        var form = document.querySelector("[data-quick-search]");
        if (!form) {
            return;
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[name='keyword']");
            var keyword = input ? input.value.trim() : "";
            var url = "./movies.html";
            if (keyword) {
                url += "?keyword=" + encodeURIComponent(keyword) + "#search";
            } else {
                url += "#search";
            }
            window.location.href = url;
        });
    }

    function setupListingSearch() {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var input = document.querySelector(".movie-search-input");
        var region = document.querySelector(".movie-region-filter");
        var year = document.querySelector(".movie-year-filter");
        var type = document.querySelector(".movie-type-filter");
        var clear = document.querySelector("[data-clear-filters]");
        var count = document.querySelector("[data-result-count]");
        if (!cards.length || !input) {
            return;
        }

        var queryKeyword = getQueryParam("keyword");
        if (queryKeyword) {
            input.value = queryKeyword;
        }

        function apply() {
            var keyword = normalize(input.value);
            var regionValue = normalize(region && region.value);
            var yearValue = normalize(year && year.value);
            var typeValue = normalize(type && type.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.genre,
                    card.textContent
                ].join(" "));
                var ok = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (regionValue && normalize(card.dataset.region) !== regionValue) {
                    ok = false;
                }
                if (yearValue && normalize(card.dataset.year) !== yearValue) {
                    ok = false;
                }
                if (typeValue && normalize(card.dataset.type) !== typeValue) {
                    ok = false;
                }
                card.classList.toggle("is-hidden", !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = "当前显示 " + visible + " 部";
            }
        }

        [input, region, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        if (clear) {
            clear.addEventListener("click", function () {
                input.value = "";
                if (region) {
                    region.value = "";
                }
                if (year) {
                    year.value = "";
                }
                if (type) {
                    type.value = "";
                }
                apply();
            });
        }

        apply();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupQuickSearch();
        setupListingSearch();
    });
})();

function setupVideoPlayer(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !source) {
        return;
    }
    var shell = video.closest(".player-shell");
    var hls = null;
    var loaded = false;

    function attachSource() {
        if (loaded) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
        loaded = true;
    }

    function play() {
        attachSource();
        video.controls = true;
        if (shell) {
            shell.classList.add("is-playing");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (shell) {
                    shell.classList.remove("is-playing");
                }
            });
        }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (!loaded || video.paused) {
            play();
        }
    });
    video.addEventListener("play", function () {
        if (shell) {
            shell.classList.add("is-playing");
        }
    });
    video.addEventListener("pause", function () {
        if (shell && video.currentTime === 0) {
            shell.classList.remove("is-playing");
        }
    });
}
