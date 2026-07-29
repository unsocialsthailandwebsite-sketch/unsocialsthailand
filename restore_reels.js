const fs = require('fs');
const file = 'C:\\UNSOCIALS\\index.html';
let html = fs.readFileSync(file, 'utf8');

const target = '<div class="hero-ui">';
const replacement = `<!-- FLOATING REEL TILES -->
  <div class="reel-tiles">
    <!-- Reel 1: Left -->
    <div class="reel-tile" style="left:4%;top:18%;animation-duration:6s;animation-delay:0s;--tilt:-4deg">
      <a href="https://www.instagram.com/reel/DUU8F-BD1o5/" target="_blank" style="display:block;width:100%;height:100%;text-decoration:none;color:inherit;">
        <div class="reel-tile-inner">
          <video class="reel-bg" autoplay loop muted playsinline webkit-playsinline preload="metadata" src="assets/reels/r1.mp4"></video>
          <div class="reel-overlay"></div>
          <div class="reel-play-dot"></div>
          <div class="reel-info">
            <div class="reel-acc">@elysium.pattaya</div>
          </div>
          <div class="reel-bar"><div class="reel-prog" style="animation-duration:12s"></div></div>
        </div>
      </a>
    </div>
    <!-- Reel 2: Left lower -->
    <div class="reel-tile" style="left:9%;top:54%;animation-duration:7.5s;animation-delay:-2s;--tilt:3deg">
      <a href="https://www.instagram.com/reel/DTvZmKLjFyg/" target="_blank" style="display:block;width:100%;height:100%;text-decoration:none;color:inherit;">
        <div class="reel-tile-inner">
          <video class="reel-bg" autoplay loop muted playsinline webkit-playsinline preload="metadata" src="assets/reels/r2.mp4"></video>
          <div class="reel-overlay"></div>
          <div class="reel-play-dot" style="animation-delay:.5s"></div>
          <div class="reel-info">
            <div class="reel-acc">@alexa.beachclub</div>
          </div>
          <div class="reel-bar"><div class="reel-prog" style="animation-duration:8s"></div></div>
        </div>
      </a>
    </div>
    <!-- Reel 3: Right -->
    <div class="reel-tile" style="right:4%;top:15%;animation-duration:8s;animation-delay:-1s;--tilt:5deg">
      <a href="https://www.instagram.com/reel/DTxG5l2k7fJ/" target="_blank" style="display:block;width:100%;height:100%;text-decoration:none;color:inherit;">
        <div class="reel-tile-inner">
          <video class="reel-bg" autoplay loop muted playsinline webkit-playsinline preload="metadata" src="assets/reels/r3.mp4"></video>
          <div class="reel-overlay"></div>
          <div class="reel-play-dot" style="animation-delay:.2s"></div>
          <div class="reel-info">
            <div class="reel-acc">@nomads.asia</div>
          </div>
          <div class="reel-bar"><div class="reel-prog" style="animation-duration:15s;animation-delay:-4s"></div></div>
        </div>
      </a>
    </div>
    <!-- Reel 4: Right lower -->
    <div class="reel-tile" style="right:9%;top:50%;animation-duration:6.5s;animation-delay:-3s;--tilt:-3deg">
      <a href="https://www.instagram.com/reel/DV6Lqg_ky5x/" target="_blank" style="display:block;width:100%;height:100%;text-decoration:none;color:inherit;">
        <div class="reel-tile-inner">
          <video class="reel-bg" autoplay loop muted playsinline webkit-playsinline preload="metadata" src="assets/reels/r4.mp4"></video>
          <div class="reel-overlay"></div>
          <div class="reel-play-dot" style="animation-delay:.7s"></div>
          <div class="reel-info">
            <div class="reel-acc">@bamboo.krabi</div>
          </div>
          <div class="reel-bar"><div class="reel-prog" style="animation-duration:10s;animation-delay:-6s"></div></div>
        </div>
      </a>
    </div>
  </div>

  <div class="hero-ui">`;

if (html.includes('<div class="reel-tiles">')) {
  console.log("Already has reel-tiles");
} else {
  html = html.replace(target, replacement);
  fs.writeFileSync(file, html);
  console.log("Inserted reel-tiles back into index.html");
}
