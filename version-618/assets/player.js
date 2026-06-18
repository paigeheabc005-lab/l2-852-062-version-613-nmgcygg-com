(function () {
  function initPlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-overlay');
    var stream = box.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    function attach() {
      if (ready || !video || !stream) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        ready = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        ready = true;
      }
    }

    function play() {
      attach();
      if (!video) {
        return;
      }
      var attempt = video.play();
      if (attempt && typeof attempt.then === 'function') {
        attempt.then(function () {
          if (button) {
            button.classList.add('is-hidden');
          }
        }).catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      } else if (button) {
        button.classList.add('is-hidden');
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(initPlayer);
  });
})();
