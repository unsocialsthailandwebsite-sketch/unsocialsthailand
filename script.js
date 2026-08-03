// ─── CURSOR ───
var cur=document.getElementById('cur'),cur2=document.getElementById('cur2'),mx=-100,my=-100,cx=-100,cy=-100,facingRight=false;
document.addEventListener('mousemove',function(e){
  if(e.clientX > mx + 2) facingRight = true;
  else if(e.clientX < mx - 2) facingRight = false;
  mx=e.clientX; my=e.clientY;
  if(cur) { cur.style.left=mx+'px'; cur.style.top=my+'px'; }
});
function animCur(){
  cx+=(mx-cx)*.12; cy+=(my-cy)*.12;
  if(cur2) {
    cur2.style.left=cx+'px'; cur2.style.top=cy+'px';
    cur2.style.transform = 'translate(-50%, -50%) scaleX(' + (facingRight ? '-1' : '1') + ')';
  }
  requestAnimationFrame(animCur);
}
animCur();
document.querySelectorAll('a,button,.cc,.si,.sb,.lang-btn').forEach(function(el){
  el.addEventListener('mouseenter',function(){document.body.classList.add('hov')});
  el.addEventListener('mouseleave',function(){document.body.classList.remove('hov')});
});

// ─── LANGUAGE SWITCHER ───
function initLang(){
  var savedLang = localStorage.getItem('unsocials_lang') || 'en';
  setLang(savedLang);

  document.querySelectorAll('.lang-btn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      var lang = this.getAttribute('data-lang');
      setLang(lang);
    });
  });
}

function setLang(lang){
  localStorage.setItem('unsocials_lang', lang);
  document.documentElement.setAttribute('lang', lang);
  
  // Update UI buttons
  document.querySelectorAll('.lang-btn').forEach(function(btn){
    if(btn.getAttribute('data-lang') === lang){
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Swap text content
  document.querySelectorAll('[data-th]').forEach(function(el){
    if(!el.dataset.en) {
      el.dataset.en = el.innerHTML; // Store original English HTML
    }
    el.innerHTML = (lang === 'th') ? el.dataset.th : el.dataset.en;
  });
  
  // Refresh ScrollTrigger if loaded, since heights might change
  if(typeof ScrollTrigger !== 'undefined'){
    setTimeout(function(){ ScrollTrigger.refresh(); }, 100);
  }
}
document.addEventListener('DOMContentLoaded', initLang);

// ─── PRELOADER ───
var pf=document.getElementById('pf'),pt=document.getElementById('pt'),pfi=document.getElementById('pfi'),pct=0;
var enEl=document.getElementById('pre-en'),thEl=document.getElementById('pre-th');
var isEn=true,flipDur=320; // ms per half-flip

var labels=['INITIALISING','กำลังโหลด','LOADING','เริ่มต้น','BUILDING','กำลังสร้าง','ALMOST','เกือบแล้ว'];
var labelIdx=0;

if (pf && pt && enEl && thEl) {
  // flip between EN and TH on a fixed interval
  function doFlip(){
    var outEl=isEn?enEl:thEl;
    var inEl=isEn?thEl:enEl;
    // outgoing: slide up away
    outEl.style.animation='none'; outEl.offsetHeight; // reflow
    outEl.style.animation='flipOut '+flipDur+'ms cubic-bezier(.4,0,.2,1) forwards';
    // incoming: slide up in
    inEl.style.animation='none'; inEl.offsetHeight;
    inEl.style.animation='flipIn '+flipDur+'ms cubic-bezier(.4,0,.2,1) forwards';
    isEn=!isEn;
    // cycle label
    labelIdx=(labelIdx+1)%labels.length;
    pt.textContent=labels[labelIdx];
  }

  var flipTimer=setInterval(doFlip,700);

  var pi=setInterval(function(){
    pct+=Math.random()*16+4;
    if(pct>=100){
      pct=100;
      clearInterval(pi);
      clearInterval(flipTimer);
      // final snap to EN
      if(!isEn) doFlip();
      pt.textContent='LET\'S GO';
      setTimeout(function(){document.getElementById('pre').classList.add('out')},450);
    }
    pf.style.width=pct+'%';
    if(pfi) pfi.style.height=pct+'%';
  },65);
}

// ─── NAV SCROLL ───
window.addEventListener('scroll',function(){
  document.getElementById('nav').classList.toggle('compact',window.scrollY>80);
});

// ─── GSAP PHYSICS ENGINE ───
if(typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  // 1. Text Highlights
  document.querySelectorAll('.hl-text').forEach(function(el){
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => el.classList.add('on'),
    });
  });

  // 2. Staggered 3D Reveals
  gsap.set('.rv', { y: 60, opacity: 0, rotateX: 15, transformPerspective: 800 });
  gsap.set('.rv-l', { x: -60, opacity: 0 });

  ScrollTrigger.batch('.rv', {
    onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, rotateX: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out' }),
    start: 'top 85%'
  });
  ScrollTrigger.batch('.rv-l', {
    onEnter: batch => gsap.to(batch, { opacity: 1, x: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out' }),
    start: 'top 85%'
  });

  // 3. Magnetic Hover Buttons
  document.querySelectorAll('.nbook, .cta-btn, .cta-p, .cta-s, .cc').forEach(function(btn){
    if(btn.classList.contains('cc')) return;
    btn.classList.add('magnetic');
    btn.addEventListener('mousemove', function(e){
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width/2;
      var y = e.clientY - rect.top - rect.height/2;
      gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', function(){
      gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
    });
  });

  // 4. 3D Tilt for Case Study Cards
  document.querySelectorAll('.cc').forEach(function(card){
    card.addEventListener('mousemove', function(e){
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var xPct = (x / rect.width - 0.5) * 2;
      var yPct = (y / rect.height - 0.5) * 2;
      
      gsap.to(card, {
        rotateY: xPct * 8,
        rotateX: -yPct * 8,
        transformPerspective: 1200,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
    card.addEventListener('mouseleave', function(){
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'power2.out' });
    });
  });
}

// ─── NEXUS STARFIELD ───
(function(){
  var c = document.getElementById('nexus-canvas');
  if(!c) return;
  var ctx = c.getContext('2d');
  var W = 520, H = 520;
  c.width = W; c.height = H;

  var stars = Array.from({length:120}, function(){
    return {
      x: Math.random()*W,
      y: Math.random()*H,
      r: Math.random()*1.4 + 0.3,
      a: Math.random(),
      speed: Math.random()*0.005 + 0.002,
      phase: Math.random()*Math.PI*2
    };
  });

  var isNexusVis = false;
  var nxSect = document.getElementById('nexus-section');
  if(nxSect){
    new IntersectionObserver(function(es){ isNexusVis=es[0].isIntersecting; }).observe(nxSect);
  }

  function drawStars(t){
    requestAnimationFrame(drawStars);
    if(!isNexusVis) return;
    ctx.clearRect(0,0,W,H);
    stars.forEach(function(s){
      var alpha = 0.2 + 0.5 * Math.abs(Math.sin(t*s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,220,150,'+alpha+')';
      ctx.fill();
    });
  }
  drawStars(0);
})();

// ─── NEXUS ORBIT ANIMATION ───
(function(){
  var cards = document.querySelectorAll('.nx-card');
  var nodes = document.querySelectorAll('.nx-node');
  if(!cards.length) return;

  var baseRadii  = [280, 320, 260, 300, 290];
  var angles = [0, 72, 144, 216, 288];
  var speeds = [0.18, -0.12, 0.22, -0.16, 0.14];
  var nodeAngles = [36, 108, 180, 252, 324];
  var baseNodeRadii  = [180, 160, 200, 175, 185];

  function toRad(d){ return d * Math.PI / 180; }

  var isNexusCardVis = false;
  var nxSect2 = document.getElementById('nexus-section');
  if(nxSect2){
    new IntersectionObserver(function(es){ isNexusCardVis = es[0].isIntersecting; }).observe(nxSect2);
  }

  function tick(){
    requestAnimationFrame(tick);
    if(!isNexusCardVis) return;
    var w = window.innerWidth;
    var scale = w <= 480 ? 0.38 : (w <= 768 ? 0.48 : (w <= 1024 ? 0.7 : 1));
    cards.forEach(function(card, i){
      angles[i] += speeds[i];
      var rad = toRad(angles[i]);
      var cx = baseRadii[i] * scale * Math.cos(rad);
      var cy = baseRadii[i] * scale * Math.sin(rad);
      card.style.transform = 'translate(calc(-50% + '+cx+'px), calc(-50% + '+cy+'px))';
    });
    nodes.forEach(function(node, i){
      nodeAngles[i] += 0.08;
      var rad = toRad(nodeAngles[i]);
      var cx = baseNodeRadii[i] * scale * Math.cos(rad);
      var cy = baseNodeRadii[i] * scale * Math.sin(rad);
      node.style.transform = 'translate(calc(-50% + '+cx+'px), calc(-50% + '+cy+'px))';
    });
  }
  tick();
})();

// ─── HERO WEBGL SHADER ───
(function(){
  var canvas=document.getElementById('hero-canvas');
  if(!canvas) return;
  var gl=canvas.getContext('webgl', { powerPreference: "high-performance", alpha: true, premultipliedAlpha: false });
  if(!gl) return;
  gl.clearColor(0,0,0,0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  function resize(){canvas.width=window.innerWidth/2;canvas.height=window.innerHeight/2;gl.viewport(0,0,canvas.width,canvas.height)}
  resize();window.addEventListener('resize',resize);

  var vs=`attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`;
  var fs=`
    precision mediump float;
    uniform float t;
    uniform vec2 res;
    uniform vec2 mouse;
    
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){
      vec2 i=floor(p),f=fract(p);
      f=f*f*(3.0-2.0*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
    }
    float fbm(vec2 p){
      float v=0.0,a=0.5;
      for(int i=0;i<5;i++){v+=a*noise(p);p*=2.02;a*=0.48;}
      return v;
    }
    
    void main(){
      vec2 uv=(gl_FragCoord.xy-.5*res)/res.y;
      uv.x*=(res.x/res.y);
      vec2 m=(mouse-.5*res)/res.y;
      m.x*=(res.x/res.y);
      float d=length(uv-m*0.3);
      vec2 q=vec2(fbm(uv+t*0.06),fbm(uv+vec2(1.3,0.8)+t*0.05));
      vec2 r=vec2(fbm(uv+2.5*q+vec2(1.7,9.2)+t*0.035),fbm(uv+2.5*q+vec2(8.3,2.8)+t*0.025));
      float f=fbm(uv+2.7*r);
      vec3 col=mix(vec3(0.04,0.04,0.04),vec3(0.12,0.06,0.18),clamp(f*f*2.5,0.0,1.0));
      col=mix(col,vec3(0.55,0.72,0.04),clamp(f*3.0-2.1,0.0,1.0));
      col=mix(col,vec3(0.91,1.0,0.0),clamp(length(q)*0.4,0.0,1.0));
      col*=1.0-0.6*d;
      col+=0.06*vec3(0.91,1.0,0.0)*max(0.0,0.5-d);
      float brightness = dot(col, vec3(0.299, 0.587, 0.114));
      float a = smoothstep(0.0, 0.25, brightness) * 0.85;
      gl_FragColor=vec4(col*0.75, a);
    }
  `;

  function shader(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s}
  var prog=gl.createProgram();
  gl.attachShader(prog,shader(gl.VERTEX_SHADER,vs));
  gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,fs));
  gl.linkProgram(prog);gl.useProgram(prog);

  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var pLoc=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(pLoc);gl.vertexAttribPointer(pLoc,2,gl.FLOAT,false,0,0);

  var tLoc=gl.getUniformLocation(prog,'t');
  var rLoc=gl.getUniformLocation(prog,'res');
  var mLoc=gl.getUniformLocation(prog,'mouse');
  var mx2=canvas.width/2,my2=canvas.height/2;
  document.addEventListener('mousemove',function(e){mx2=e.clientX;my2=window.innerHeight-e.clientY});

  var start=performance.now();
  var hero=document.getElementById('hero');
  var isHeroVis=true;
  if(hero) new IntersectionObserver(function(e){isHeroVis=e[0].isIntersecting}).observe(hero);

  function draw(){
    requestAnimationFrame(draw);
    if(!isHeroVis) return;
    gl.clear(gl.COLOR_BUFFER_BIT);
    var t=(performance.now()-start)/1000;
    gl.uniform1f(tLoc,t);
    gl.uniform2f(rLoc,canvas.width,canvas.height);
    gl.uniform2f(mLoc,mx2,my2);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }
  draw();
})();

// ─── AVA & ALEX CHARACTER ANIMATIONS ───
(function(){
  if(typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // 1. Fragment & Node reveals
  gsap.set('.rep-fragment, .rep-node-w, .rep-img-w-premium', { y: 40, opacity: 0, scale: 0.95 });
  
  ScrollTrigger.batch('.rep-fragment, .rep-node-w, .rep-img-w-premium', {
    onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }),
    start: 'top 85%'
  });

  // 2. Fragment Parallax (Internal Image)
  document.querySelectorAll('.rep-fragment').forEach(function(frag){
    const img = frag.querySelector('img');
    gsap.to(img, {
      y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: frag,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });

  // 3. Floating Node (Breathe effect)
  gsap.to('.rep-node', {
    y: -15,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });

  // 4. Hero Ava Mouse Interaction (Dynamic Depth)
  const heroNode = document.querySelector('.rep-node-w');
  if(heroNode) {
    document.addEventListener('mousemove', function(e){
      const x = (e.clientX / window.innerWidth - 0.5) * 50;
      const y = (e.clientY / window.innerHeight - 0.5) * 50;
      gsap.to(heroNode, { x: x, y: y, duration: 1.2, ease: 'power2.out' });
      const nodeImg = heroNode.querySelector('img');
      if(nodeImg) gsap.to(nodeImg, { x: -x*0.3, y: -y*0.3, duration: 1.5, ease: 'power2.out' });
    });
  }

  // 5. Placard Typewriter Integration
  const placText = document.querySelector('.placard-text');
  if(placText) {
    const originalText = placText.textContent;
    placText.textContent = '';
    ScrollTrigger.create({
      trigger: '.ai-reps-sec',
      start: 'top 60%',
      onEnter: () => {
        let i = 0;
        placText.textContent = '';
        const timer = setInterval(() => {
          if (i < originalText.length) {
            placText.textContent += originalText[i];
            i++;
          } else {
            clearInterval(timer);
          }
        }, 100);
      }
    });
  }

  // 6. Refined Mockup Reveal (Results)
  const psRefined = document.querySelector('.ps-refined');
  if(psRefined) {
    gsap.from(psRefined.querySelectorAll('.ps-stat-val, .ps-stat-lbl, .ps-chart-w'), {
      y: 30, opacity: 0, stagger: 0.15, duration: 1.2, ease: 'power4.out',
      scrollTrigger: {
        trigger: psRefined,
        start: 'top 80%'
      }
    });
  }

  // 7. Global Video Optimization & Mobile Auto-Play Management
  var setupVideo = function(v) {
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    if (!v.getAttribute('preload') || v.getAttribute('preload') === 'none') {
      v.setAttribute('preload', 'metadata');
    }
  };

  var playVideoSafe = function(v) {
    setupVideo(v);
    if (v.readyState === 0) {
      try { v.load(); } catch (err) {}
    }
    var promise = v.play();
    if (promise && promise.catch) {
      promise.catch(function() {
        var retryPlay = function() {
          setupVideo(v);
          v.play().catch(function(){});
        };
        window.addEventListener('touchstart', retryPlay, { once: true, passive: true });
        window.addEventListener('click', retryPlay, { once: true, passive: true });
        window.addEventListener('scroll', retryPlay, { once: true, passive: true });
      });
    }
  };

  document.querySelectorAll('video').forEach(setupVideo);

  if ('IntersectionObserver' in window) {
    var vidObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        var v = e.target;
        if (e.isIntersecting) {
          playVideoSafe(v);
        } else {
          if (!v.paused) {
            v.pause();
          }
        }
      });
    }, { rootMargin: '150px 0px' });

    var observeAllVideos = function() {
      document.querySelectorAll('video').forEach(function(v) {
        setupVideo(v);
        vidObs.observe(v);
      });
    };

    observeAllVideos();

    if ('MutationObserver' in window) {
      var mutObs = new MutationObserver(function() {
        observeAllVideos();
      });
      mutObs.observe(document.body, { childList: true, subtree: true });
    }
  } else {
    document.querySelectorAll('video').forEach(playVideoSafe);
  }

})();

// ─── CASE STUDY OVERLAY LOGIC ───
const caseData = {
  elysium: {
    eye: '5-Star Hotel · Pattaya Prathumnak Hill · End-to-End Brand Transformation',
    title: 'Elysium Pattaya',
    tags: ['Performance Marketing', 'Social Media Management', 'Content Production', 'AI Creative Automation', 'Brand Strategy'],
    media: ["assets/cases/elysium/img1.png","assets/cases/elysium/img2.jpg","assets/cases/elysium/img3.jpg","assets/cases/elysium/img4.jpg","assets/cases/elysium/img5.jpg","assets/cases/elysium/img6.jpg","assets/cases/elysium/img7.jpg","assets/cases/elysium/vid1.mp4","assets/cases/elysium/vid2.mp4","assets/cases/elysium/vid3.mp4"],
    problemHtml: `<div class="cs-sec-title">A 5-star hotel that looked like a 2-star on social.</div>
<p class="cs-p">Elysium Pattaya had everything a luxury hotel needs to succeed — a stunning rooftop infinity pool, breathtaking Gulf of Thailand views, a prime location on Prathumnak Hill, and a product that genuinely deserved to be Pattaya's most talked-about boutique property.</p>
<p class="cs-p">What they didn't have was visibility. No direct booking system. No social presence worth speaking of. Zero website revenue. Every guest that found them came through OTAs — Agoda, Booking.com, Expedia — each taking a commission slice that was bleeding the business dry.</p>
<p class="cs-p">They were invisible online in a city that runs on digital discovery. The brief was simple: fix it.</p>`,
    strategyHtml: `<div class="cs-sec-title">Brand foundation, worldwide hotel search, and AI-powered performance scaling.</div>
<p class="cs-p"><strong>Phase 01 — Brand & Content Foundation:</strong> We conducted a full content shoot at Elysium — golden hour pool sessions, rooftop sunset sequences, room interiors, and panoramic views. We rebuilt the Instagram feed from the ground up to establish a cinematic, luxury brand aesthetic.</p>
<p class="cs-p"><strong>Phase 02 — Direct Booking Infrastructure:</strong> We built and launched a Google Hotel Ads campaign — putting Elysium in front of high-intent travellers actively searching for Pattaya hotels at the exact moment of decision, driving them directly to the hotel's own booking page.</p>
<p class="cs-p"><strong>Phase 03 — Meta Performance Campaigns:</strong> Targeted Meta campaigns reached high-value travelers globally. Awareness campaigns built the brand, while Lookalike audiences and dynamic retargeting captured outstanding intent.</p>
<p class="cs-p"><strong>Phase 04 — AI Creative at Scale:</strong> We generated a vast library of luxury campaign graphics, story templates, and ad creatives, enabling us to test dozens of variations simultaneously without additional shoot days.</p>
<p class="cs-p"><strong>Phase 05 — WhatsApp Lead Capture:</strong> We implemented a WhatsApp click-to-chat layer to campaigns, giving potential guests an instant, direct path to secure bookings in real time.</p>`,
    sidebar: [
      { title: 'The Brand', text: "Elysium Pattaya — 5-star boutique hotel on Prathumnak Hill, one of Pattaya's most prestigious luxury addresses." },
      { title: 'The Challenge', text: "Zero direct revenue, 100% OTA dependency with 15–25% commission fees, and no unified digital strategy or paid infrastructure." },
      { title: 'Services Delivered', text: "Full luxury content shoot · Instagram feed rebuild · Google Hotel Ads setup & management · Meta awareness & conversion campaigns · Retargeting & lookalike audience strategy · AI creative library · WhatsApp click-to-chat lead generation" },
      { title: 'Key Quote', text: "\"From zero website revenue to one million baht in two months. I've worked with agencies before. None of them showed me a number like that. Unsocials didn't just run ads — they built us a system.\" — Management, Elysium Pattaya" }
    ],
    results: [
      { num: '฿1,000,000', lbl: 'Direct booking revenue generated within 60 days of campaign launch' },
      { num: '0%', lbl: 'OTA commission dependency for new bookings from Unsocials campaigns' },
      { num: '฿0 → ฿1M', lbl: 'Website revenue growth from absolute zero to 7-figure direct monthly revenue' },
      { num: '3×', lbl: "Instagram reach and engagement growth, building an owned luxury audience" }
    ]
  },
  alexa: {
    eye: 'Beach Club · Pattaya, Thailand · Social Media + Performance Marketing',
    title: 'Alexa Beach Club',
    tags: ['Performance Marketing', 'Social Media Management', 'Content Production', 'Brand Strategy'],
    media: ["assets/cases/alexa/vid1.mp4","assets/cases/alexa/vid2.mp4","assets/cases/alexa/vid3.mp4","assets/cases/alexa/vid4.mp4","assets/cases/alexa/vid5.mp4"],
    problemHtml: `<div class="cs-sec-title">The best beach club in Pattaya that looked like everyone else online.</div>
<p class="cs-p">Pattaya has no shortage of beach clubs. Pools, sun loungers, cocktails, music — the formula is the same everywhere. When Alexa Beach Club came to us, they had a beautiful venue, a great product, and a team that genuinely cared about the experience. But online, they looked like everyone else.</p>
<p class="cs-p">Their Instagram was inconsistent, paid ads were non-existent, and reservations came through walk-ins and word of mouth — leaving the venue half-empty on days it should have been packed. In a city where beach club scene discovery runs on social media, invisibility is a death sentence.</p>`,
    strategyHtml: `<div class="cs-sec-title">Lifestyle narrative, high-reach Meta campaigns, and frictionless WhatsApp bookings.</div>
<p class="cs-p"><strong>Phase 01 — Brand Positioning:</strong> We defined Alexa as Pattaya's premium yet accessible Ibiza-style beach club. A visual and textual language was built around that positioning: bold, sun-drenched, aspirational, and energetic.</p>
<p class="cs-p"><strong>Phase 02 — Lifestyle Content with Models:</strong> We shot premium lifestyle content featuring models, pool scenes, and signature cocktails. This created an aspirational, highly shareable visual library that stopped the scroll.</p>
<p class="cs-p"><strong>Phase 03 — Meta Awareness Campaigns:</strong> We launched targeted Meta campaigns targeting tourists, expats in Pattaya, and Bangkok residents searching for weekend escapes, utilizing retargeting to capture high-intent audiences.</p>
<p class="cs-p"><strong>Phase 04 — WhatsApp Reservation Campaigns:</strong> We built a direct WhatsApp reservation system powered by click-to-chat Meta campaigns, sending potential guests straight into a booking conversation with the Alexa team.</p>
<p class="cs-p"><strong>Phase 05 — Event Night Coverage:</strong> Every event night at Alexa became content. Real-time live Stories and recap reels broadcast the energy, creating a highly effective FOMO loop that drove continuous traffic.</p>`,
    sidebar: [
      { title: 'The Brand', text: "Alexa Beach Club — Pattaya's premier Ibiza-style beach club featuring an infinity pool, private beach, international DJs, and foam parties." },
      { title: 'The Challenge', text: "No dominant brand identity, zero paid acquisition, and unpredictable reservations relying heavily on walk-ins." },
      { title: 'Services Delivered', text: "Lifestyle content shoot with models · Instagram feed strategy & visual curation · Meta awareness campaigns · WhatsApp reservation click-to-chat campaigns · Influencer coordination · Event night live coverage" },
      { title: 'Key Quote', text: "\"Alexa went from just another beach club to THE beach club in Pattaya. 2.6 million reach. Our tables fill weeks in advance now. I stopped worrying about marketing the day I signed with Unsocials.\" — Owner, Alexa Beach Club" }
    ],
    results: [
      { num: '2.6M', lbl: 'Total Instagram reach generated across the campaign period' },
      { num: '#1', lbl: 'Ranked as the most talked-about and most-booked beach club in Pattaya' },
      { num: '280+', lbl: 'Direct reservations driven through WhatsApp campaigns with zero OTA fees' },
      { num: '10×', lbl: "Increase in organic engagement rate from pre-campaign baseline" }
    ]
  },
  skyview: {
    eye: 'Hotel · Bangkok · WhatsApp Lead Generation',
    title: 'Hotel Skyview BKK',
    tags: ['WhatsApp Marketing', 'Meta Ads', 'Direct Bookings', 'Cost Per Lead'],
    problemHtml: `<div class="cs-sec-title">Good bookings. Bad economics. Every sale cost too much.</div>
<p class="cs-p">Hotel Skyview Bangkok was already running direct booking ads — but the numbers didn't add up. The cost per website purchase was high. Converting leads through a multi-click website funnel meant paying a premium for every booking. Margins were under pressure, and the team needed a smarter, more direct path to revenue.</p>
<p class="cs-p">They had a great product. What they needed was a more efficient way to get guests from interest to booking — without the cost and drop-off of a website journey.</p>`,
    strategyHtml: `<div class="cs-sec-title">Cut the middleman. Put the conversation first.</div>
<p class="cs-p">We introduced a WhatsApp Click-to-Chat ad strategy — Meta campaigns that sent interested travellers directly into a WhatsApp conversation with the hotel team, rather than pushing them through a booking engine.</p>
<p class="cs-p">The logic was simple: a guest who messages directly is already warm. The hotel team could respond instantly, personalise the offer, confirm availability in real time, and close the booking in a single conversation. No abandoned carts. No lost momentum. Just a direct conversation that turned intent into revenue.</p>
<p class="cs-p">At just 50–100 THB cost per click, the economics transformed completely. The hotel was acquiring qualified leads at a fraction of the previous cost — and converting them at a higher rate because every interaction was personal and immediate.</p>`,
    sidebar: [
      { title: 'The Brand', text: "Hotel Skyview Bangkok — boutique hotel in the heart of Bangkok, offering premium stays with a strong direct booking ambition." },
      { title: 'The Challenge', text: "High cost per website purchase making direct campaigns uneconomical. Needed a lower-cost, higher-converting lead generation system." },
      { title: 'Services Delivered', text: "WhatsApp Click-to-Chat ad campaigns · Meta Ads management · Lead qualification strategy · Direct booking funnel design · Ongoing optimisation" },
      { title: 'The Advantage', text: "Direct guest contact means the hotel team can respond in real time, offer exclusive deals, and build genuine rapport — converting bookings a website alone could never close." }
    ],
    results: [
      { num: '50–100 THB', lbl: 'Cost per WhatsApp lead — a fraction of the previous website cost per booking' },
      { num: 'Direct', lbl: 'Guest contact from first message — dates, room type, budget captured instantly' },
      { num: '↑ Revenue', lbl: 'Increased direct room revenue as conversion rates improved through personal booking conversations' },
      { num: '0% OTA', lbl: 'Every WhatsApp booking is commission-free — full margin stays with the hotel' }
    ]
  },
  nomads: {
    eye: 'Hostel · Thailand · 3 Properties · UGC Strategy + Direct Booking Funnel',
    title: 'Nomads Hostel Asia',
    tags: ['Social Media Management', 'UGC Content Strategy', 'Content Production', 'Direct Booking Funnel'],
    media: ["assets/cases/nomads/vid1.mp4","assets/cases/nomads/vid2.mp4","assets/cases/nomads/vid3.mp4","assets/cases/nomads/vid4.mp4","assets/cases/nomads/vid5.mp4"],
    problemHtml: `<div class="cs-sec-title">An exceptional guest experience with zero content and high OTA dependency.</div>
<p class="cs-p">Nomads Hostel Asia had three properties across Thailand and a genuinely exceptional product — legendary pub crawls, pool parties, and island adventures. The experiences were happening every night, but the content wasn't. Because of this, bookings were heavily OTA-dependent (Hostelworld, Booking.com), eating into their margins with high commission fees.</p>
<p class="cs-p">The target audience of backpackers and solo travellers lives on Instagram, making booking decisions based on social proof. Nomads was invisible at the exact moment those decisions were being made.</p>`,
    strategyHtml: `<div class="cs-sec-title">Authentic UGC systems, unscripted guest reviews, and commission-free direct booking funnels.</div>
<p class="cs-p"><strong>Phase 01 — UGC Content System:</strong> We established a systematic UGC capture process. We briefed guest content creators at each property to capture real pool parties, adventures, and pub crawls, producing authentic, high-energy content that no professional shoot could replicate.</p>
<p class="cs-p"><strong>Phase 02 — Direct Booking Funnel:</strong> We engineered the entire social strategy to get potential guests off Instagram and onto the Nomads website. Bio links, swipe-up Stories, and caption CTAs pointed directly to their own booking system, bypassing OTAs entirely.</p>
<p class="cs-p"><strong>Phase 03 — Unified Brand Identity:</strong> We unified the social presence of all three properties under a single Nomads Asia brand voice, building institutional brand authority and a consistent aesthetic.</p>
<p class="cs-p"><strong>Phase 04 — Event Night Live Coverage:</strong> Real-time event coverage on Stories and rapid 24-hour recap reels created a continuous FOMO loop that drove next-day direct bookings.</p>
<p class="cs-p"><strong>Phase 05 — Guest Review Reel Programme:</strong> We introduced a guest review reel program featuring unscripted, direct-to-camera reviews. Real backpackers reviewing their stay became the highest-converting content format.</p>`,
    sidebar: [
      { title: 'The Brand', text: "Nomads Hostel Asia — premier hostel brand operating 3 high-energy properties across Thailand, serving solo travellers and backpackers." },
      { title: 'The Challenge', text: "Great experiences with zero systematic content capture, high dependency on commission-heavy OTA platforms, and fragmented social channels." },
      { title: 'Services Delivered', text: "UGC content strategy · Instagram feed management & curation · Guest review reel program · Pub crawl live coverage · Direct booking funnel · Hostelworld profile optimization" },
      { title: 'Key Quote', text: "\"We had the best hostel experience in Asia happening every night — we just weren't showing the world. Unsocials built the content system that captured it all and sent every guest directly to our website.\" — Management, Nomads Hostel Asia" }
    ],
    results: [
      { num: '#1 Asia', lbl: 'Best Hostel in Asia — awarded by Hostelworld during our partnership' },
      { num: '3', lbl: 'Properties managed under one unified social media strategy and brand voice' },
      { num: '0%', lbl: 'OTA commission on bookings generated through the direct social strategy' },
      { num: 'Direct', lbl: "All social traffic successfully routed to Nomads' commission-free website funnel" }
    ]
  },
  bamboo: {
    eye: 'Beach Club · Krabi, Thailand · Daily Social Engine + Multi-Format Visibility',
    title: 'Bamboo Beach Club',
    tags: ['Social Media Management', 'Content Production', 'AI Creative Automation', 'Brand Strategy'],
    media: ["assets/cases/bamboo/img1.png","assets/cases/bamboo/img2.png","assets/cases/bamboo/vid1.mp4","assets/cases/bamboo/vid2.mp4","assets/cases/bamboo/vid3.mp4","assets/cases/bamboo/vid4.mp4","assets/cases/bamboo/vid5.mp4","assets/cases/bamboo/vid6.mp4"],
    problemHtml: `<div class="cs-sec-title">An incredible beach club venue operating in a digital vacuum.</div>
<p class="cs-p">Bamboo Beach Club in Krabi is one of the island's most vibrant venues. While word of mouth was working locally, their social media presence was a complete afterthought. Great event nights were happening with live fire shows and foam parties, but the right people — tourists planning Krabi trips or actively looking for nightly entertainment — weren't seeing them.</p>
<p class="cs-p">With an inconsistent posting schedule and lack of format diversity, Bamboo sat invisible behind competitors who posted daily to capture the high-value tourist market.</p>`,
    strategyHtml: `<div class="cs-sec-title">A six-format content engine, daily consistency, and real-time FOMO loops.</div>
<p class="cs-p"><strong>Phase 01 — Daily Posting Rhythm:</strong> We committed to a relentless, daily posting schedule to align with the Instagram algorithm and ensure constant feed presence for active travellers.</p>
<p class="cs-p"><strong>Phase 02 — Multi-Format Content Engine:</strong> We built a six-format engine running simultaneously: High-energy reels for reach, AI reels for brand elevation, Hook-led content to stop the scroll, Stories for live FOMO, Trial reels for algorithm testing, and Creator reposts for authentic social proof.</p>
<p class="cs-p"><strong>Phase 03 — Hook-First Strategy:</strong> Every single piece of content opened with a powerful visual or textual hook to stop scrollers in under two seconds (e.g. 'Your Krabi trip isn't complete without this').</p>
<p class="cs-p"><strong>Phase 04 — Live Event Night Stories:</strong> Stories went live in real time during peak party hours, creating a highly effective FOMO loop that drove direct bookings for the next night.</p>
<p class="cs-p"><strong>Phase 05 — Trial Reels:</strong> We tested edit styles, hooks, and audios regularly to let algorithmic data shape our content iteration systematically.</p>
<p class="cs-p"><strong>Phase 06 — Creator Curation:</strong> We actively curated and reposted high-quality user-generated content from guests to establish absolute social proof.</p>`,
    sidebar: [
      { title: 'The Brand', text: "Bamboo Beach Club Krabi — one of Krabi's most energetic beach venues, famous for themed events, fire shows, and pool parties." },
      { title: 'The Challenge', text: "Low visibility despite excellent real-world events, lack of a daily posting rhythm, and no format diversity to capture modern social algorithms." },
      { title: 'Services Delivered', text: "Social media strategy & positioning · Daily content calendar · High-energy reel creation · AI-generated creative & graphics · Live event night Stories · Trial reel testing" },
      { title: 'Key Quote', text: "\"Unsocials turned every event night into content that worked for days. We went from a beach club in Krabi to THE beach club in Krabi. Total visibility. That's what they built.\" — Management, Bamboo Beach Club Krabi" }
    ],
    results: [
      { num: 'Krabi #1', lbl: "Bamboo positioned as Krabi's undisputed must-visit beach club destination" },
      { num: 'Daily', lbl: 'Consistent daily content output maintained with zero gaps or quiet weeks' },
      { num: '100%', lbl: 'Event nights covered live in real time during peak party hours to drive FOMO' },
      { num: '6 Formats', lbl: "Simultaneous multi-format content engine optimized for reach, trust, and conversion" }
    ]
  },
  gps: {
    eye: 'Luxury Gems · Thailand · AI Content + Organic Growth + Education Strategy',
    title: 'GPS Gems',
    tags: ['Brand Strategy', 'AI Creative Automation', 'Social Media Management', 'Content Production'],
    media: ["assets/cases/gps/img1.jpg","assets/cases/gps/vid1.mp4","assets/cases/gps/vid2.mp4","assets/cases/gps/vid3.mp4","assets/cases/gps/vid4.mp4"],
    problemHtml: `<div class="cs-sec-title">Exceptional rare gemstones with absolute zero digital footprint.</div>
<p class="cs-p">GPS Gems Thailand came to us with no brand, no social media presence, and no content library. In the high-ticket luxury goods industry, trust is the entire product. Buyers spend significant money on gemstones they cannot physically inspect beforehand. Without a digital presence that demonstrated authority, GPS Gems was invisible and uncompetitive.</p>
<p class="cs-p">Furthermore, luxury gemstone marketing traditionally demands expensive macro photography, studio setups, and ongoing production budgets that present serious bottlenecks for a startup brand.</p>`,
    strategyHtml: `<div class="cs-sec-title">Education-first content pillars, custom AI macro photography, and pre-educated organic lead generation.</div>
<p class="cs-p"><strong>Phase 01 — Brand Identity from Zero:</strong> We built their visual identity, colour palette, typography, and tone of voice, positioning GPS Gems as the premier, transparent gem authority online.</p>
<p class="cs-p"><strong>Phase 02 — AI-Powered Content Library:</strong> We generated high-end, studio-quality macro gem photography and editorial lifestyle visuals entirely using AI creative tools, bypassing traditional photography production costs and bottlenecks.</p>
<p class="cs-p"><strong>Phase 03 — Education-First Strategy:</strong> We structured their social presence around education-first pillars — explaining gem origins, grading, and value factors to build a trust deficit competitors couldn't match.</p>
<p class="cs-p"><strong>Phase 04 — Behind-the-Scenes Provenance:</strong> We documented their sourcing, grading, and cutting processes. This radical transparency eliminated buyer friction by showing absolute authenticity.</p>
<p class="cs-p"><strong>Phase 05 — Organic Growth Engine:</strong> Genuinely educational, high-value content drove viral saves and shares, attracting highly targeted gemstone collectors organically without spent advertising.</p>`,
    sidebar: [
      { title: 'The Brand', text: "GPS Gems Thailand — luxury gemstone brand dealing in rare collector-grade stones and custom bespoke jewellery." },
      { title: 'The Challenge', text: "Absolute zero brand identity, an industry built on deep trust, and extremely high production costs for luxury macro photography." },
      { title: 'Services Delivered', text: "Brand identity from zero · AI-generated luxury content library · Education-first content pillars · Sourcing & craftsmanship storytelling · Organic lead generation strategy" },
      { title: 'Key Quote', text: "\"Our customers understand our gems before they even contact us. The organic strategy they created is still paying dividends — and we haven't spent a single baht on ads.\" — Founder, GPS Gems Thailand" }
    ],
    results: [
      { num: '฿0', lbl: 'Paid ad spend needed — 100% organic, commission-free buyer acquisition' },
      { num: 'AI-Built', lbl: 'Full luxury macro content library generated using AI with zero photography overhead' },
      { num: '100%', lbl: 'Organic growth driven entirely by high-value educational content pillars' },
      { num: 'Pre-Educated', lbl: "Inbound leads arrived highly informed and trust-established, accelerating sales cycles" }
    ]
  }
};

function openCase(id) {
  const data = caseData[id];
  if (!data) return;

  // Dynamic branding configurations
  const brandAccents = {
    elysium: { rgb: '232, 255, 0', hex: '#E8FF00', label: 'Hospitality Case Study' },
    alexa: { rgb: '255, 45, 45', hex: '#FF2D2D', label: 'Nightlife Case Study' },
    skyview: { rgb: '0, 168, 255', hex: '#00a8ff', label: 'Hospitality Lead Gen' },
    nomads: { rgb: '0, 255, 200', hex: '#00ffc8', label: 'Hospitality UGC Campaign' },
    bamboo: { rgb: '46, 204, 113', hex: '#2ecc71', label: 'Nightlife Social Campaign' },
    gps: { rgb: '168, 85, 247', hex: '#a855f7', label: 'Luxury E-commerce Case' }
  };
  const accent = brandAccents[id] || brandAccents.elysium;
  document.documentElement.style.setProperty('--case-accent-color', accent.hex);
  document.documentElement.style.setProperty('--case-accent-rgb', accent.rgb);

  const coverMap = {
    elysium: 'assets/elysium-cover.png',
    alexa: 'assets/alexa-cover.png',
    skyview: 'assets/skyview-cover.png',
    nomads: 'assets/nomads-cover.png',
    bamboo: 'assets/bamboo-cover.png',
    gps: 'assets/gps-cover.jpg'
  };
  const coverImg = coverMap[id] || 'assets/elysium-cover.png';
  
  let tagsHtml = data.tags.map(t => `<span class="cs-tag">${t}</span>`).join('');
  
  // High-Impact Stats Strip
  let statsHtml = data.results.map(r => `
    <div class="cs-stat-item">
      <div class="cs-stat-num">${r.num}</div>
      <div class="cs-stat-lbl">${r.lbl}</div>
    </div>
  `).join('');

  // Extract quotes or advantages for pull-quote styling
  let keyQuote = '';
  let filteredSidebar = [];
  data.sidebar.forEach(s => {
    if (s.title.toLowerCase().includes('quote') || s.title.toLowerCase().includes('advantage')) {
      keyQuote = s.text;
    } else {
      filteredSidebar.push(s);
    }
  });

  let sidebarItemsHtml = filteredSidebar.map(s => `
    <div class="cs-brief-item">
      <div class="cs-brief-title">${s.title}</div>
      <div class="cs-brief-text">${s.text}</div>
    </div>
  `).join('');

  let quoteHtml = '';
  if (keyQuote) {
    quoteHtml = `
      <div class="cs-brief-quote">
        <div class="cs-brief-quote-text">${keyQuote}</div>
      </div>
    `;
  }

  let mediaHtml = '';
  if (data.media && data.media.length > 0) {
    mediaHtml = `
    <div class="cs-showcase-title">Visual Showcase</div>
    <div class="cs-media-container">
      <button class="cs-media-btn prev" onclick="scrollMedia(-1, event)">←</button>
      <div class="cs-media-grid">`;
    data.media.forEach(m => {
      if (m.endsWith('.mp4') || m.endsWith('.webm') || m.endsWith('.mov')) {
        mediaHtml += `<video src="${m}" autoplay loop muted playsinline class="cs-media-item" style="pointer-events:none;"></video>`;
      } else {
        mediaHtml += `<img src="${m}" alt="Case Study Highlight" class="cs-media-item">`;
      }
    });
    mediaHtml += `</div>
      <button class="cs-media-btn next" onclick="scrollMedia(1, event)">→</button>
    </div>`;
  }

  const html = `
    <div class="cs-container">
      <div class="cs-hero-wire"></div>
      
      <!-- Top Header Actions -->
      <div class="cs-header-actions">
        <button class="cs-back" onclick="closeCase()">← Back to Cases</button>
      </div>

      <!-- Split Hero Section -->
      <div class="cs-hero-grid">
        <div class="cs-hero-left">
          <div class="cs-eye">${accent.label}</div>
          <h1 class="cs-title">${data.title}</h1>
          <div class="cs-tags">${tagsHtml}</div>
        </div>
        <div class="cs-hero-right">
          <div class="cs-hero-img-wrap">
            <img class="cs-hero-img" src="${coverImg}" alt="${data.title}">
          </div>
        </div>
      </div>

      <!-- Stats Strip -->
      <div class="cs-stats-strip">
        ${statsHtml}
      </div>

      <!-- Content Columns -->
      <div class="cs-narrative-grid">
        <!-- Left Column: Narrative -->
        <div class="cs-narrative-left">
          <div class="cs-sec-label">The Problem</div>
          ${data.problemHtml}
          
          <div class="cs-sec-label">The Strategy</div>
          ${data.strategyHtml}

          ${mediaHtml}
        </div>

        <!-- Right Column: Brief summary card -->
        <div class="cs-narrative-right">
          <div class="cs-brief-card">
            ${sidebarItemsHtml}
            ${quoteHtml}
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('case-content').innerHTML = html;
  document.getElementById('case-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCase() {
  document.getElementById('case-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function scrollMedia(dir, event) {
  const container = event.target.closest('.cs-media-container');
  const grid = container.querySelector('.cs-media-grid');
  // Scroll by approx one image width plus gap
  grid.scrollBy({ left: dir * 300, behavior: 'smooth' });
}

// Enable horizontal mousewheel scrolling and click-and-drag scrolling for premium horizontal scroll UX
(function() {
  let isDown = false;
  let startX;
  let scrollLeftVal;

  document.addEventListener('mousedown', function(e) {
    const grid = e.target.closest('.cs-media-grid');
    if (!grid) return;
    isDown = true;
    grid.classList.add('active');
    startX = e.pageX - grid.offsetLeft;
    scrollLeftVal = grid.scrollLeft;
    grid.style.scrollBehavior = 'auto'; // Disable smooth scroll while dragging
  });

  document.addEventListener('mouseleave', function() {
    isDown = false;
    const grids = document.querySelectorAll('.cs-media-grid');
    grids.forEach(grid => {
      grid.classList.remove('active');
      grid.style.scrollBehavior = 'smooth';
    });
  });

  document.addEventListener('mouseup', function() {
    isDown = false;
    const grids = document.querySelectorAll('.cs-media-grid');
    grids.forEach(grid => {
      grid.classList.remove('active');
      grid.style.scrollBehavior = 'smooth';
    });
  });

  document.addEventListener('mousemove', function(e) {
    if (!isDown) return;
    const grid = e.target.closest('.cs-media-grid');
    if (!grid) return;
    e.preventDefault();
    const x = e.pageX - grid.offsetLeft;
    const walk = (x - startX) * 1.5; // multiplier for speed
    grid.scrollLeft = scrollLeftVal - walk;
  });

  // Prevent default native browser image dragging inside the media grid
  document.addEventListener('dragstart', function(e) {
    if (e.target.closest('.cs-media-grid')) {
      e.preventDefault();
    }
  });

  // Enable mouse wheel horizontal scrolling when hovering over cs-media-grid
  document.addEventListener('wheel', function(e) {
    const grid = e.target.closest('.cs-media-grid');
    if (!grid) return;
    
    // Check if the element actually has horizontal overflow
    if (grid.scrollWidth > grid.clientWidth) {
      e.preventDefault();
      grid.scrollLeft += e.deltaY;
    }
  }, { passive: false });
})();

// ─── SERVICE OVERLAY LOGIC ───
const serviceData = {
  performance: {
    eye: '01 · Digital Real Estate',
    title: 'Performance<br>Marketing',
    desc: 'We don\'t just chase clicks. We build systems that hunt for revenue. Using hyper-targeted campaigns across Google, Meta, and TikTok, we turn digital real estate into your most profitable asset.',
    bg: 'linear-gradient(180deg,#121200 0%,#202000 60%,#080808 100%)',
    metrics: [
      { val: '3×', lbl: 'Average ROAS across all our active campaigns' },
      { val: '1M+', lbl: 'THB generated for single campaigns in under 2 months' },
      { val: '0%', lbl: 'Wasted spend. Every baht is tracked and optimized.' },
      { val: 'Scale', lbl: 'Infinite. When the math works, we push the pedal down.' }
    ],
    features: [
      { title: 'Google Search & Hotel Ads', desc: 'Capture high-intent traffic the second they search. We dominate the top of Google for your most valuable keywords.' },
      { title: 'Meta & TikTok Conversion', desc: 'Scroll-stopping creative paired with ruthless machine-learning targeting to acquire customers at the lowest possible cost.' },
      { title: 'Direct Booking Funnels', desc: 'Bypass OTAs and middlemen. We build funnels that train your customers to buy directly from you.' }
    ],
    pitchHtml: '<p class="svc-text">The internet is an auction, and most brands are bidding blindly. We operate differently. We use data to understand exactly what a customer is worth, and we build <strong>performance marketing engines</strong> designed to acquire them for less.</p><p class="svc-text">No vanity metrics. No excuses. Just a transparent, aggressive pursuit of ROI.</p>',
    works: [
      { media: 'assets/elysium-cover.png', tag: 'Performance Funnel', title: 'Elysium Pattaya — Direct Bookings' },
      { media: 'assets/showcase/ai-marketing.mp4', tag: 'Paid Acquisition', title: 'AI Lead Gen Engine' },
      { media: 'assets/skyview-cover.png', tag: 'Paid Social', title: 'Skyview Bangkok — Premium Scaling' }
    ]
  },
  social: {
    eye: '02 · Digital Identity',
    title: 'Social Media<br>Management',
    desc: 'Your feed is your storefront. We take complete ownership of your social presence, transforming it from an afterthought into a brand-defining, revenue-generating machine.',
    bg: 'linear-gradient(180deg,#001020 0%,#002040 60%,#080808 100%)',
    metrics: [
      { val: 'Daily', lbl: 'Consistent rhythm of high-end, brand-aligned posts' },
      { val: '2×', lbl: 'Average increase in organic engagement and profile visits within 90 days across active clients' },
      { val: '24/7', lbl: 'Community management, response, and lead nurturing' },
      { val: 'Owned', lbl: 'We build an audience you own, rather than renting one from ads' }
    ],
    features: [
      { title: 'Grid Strategy & Curation', desc: 'A visually flawless, cohesive feed that instantly establishes trust and luxury positioning the moment a user lands.' },
      { title: 'Daily Execution', desc: 'We handle everything. Copywriting, hashtag strategy, posting schedules, and algorithm optimization.' },
      { title: 'Community Growth', desc: 'Active outbound engagement to steal market share and build a fiercely loyal community around your brand.' }
    ],
    pitchHtml: '<p class="svc-text">In a world where attention is the only currency that matters, a mediocre social presence is brand suicide. We treat your social channels as <strong>premium editorial publications</strong>.</p><p class="svc-text">We don\'t just post; we curate. We dictate the narrative, engage with intent, and ensure that every pixel represents the highest echelon of your market.</p>',
    works: [
      { media: 'assets/bamboo-cover.png', tag: 'Content & Curation', title: 'Bamboo Beach Club — Daily Social' },
      { media: 'assets/alexa-cover.png', tag: 'Community Curation', title: 'Alexa Beach Club — 2.6M Reach' },
      { media: 'assets/showcase/ai-social.mp4', tag: 'Content Automation', title: 'AI-Generated Social Feed' }
    ]
  },
  content: {
    eye: '03 · Visual Domination',
    title: 'Content<br>Production',
    desc: 'Content that stops the scroll and forces the click. From cinematic reels to editorial photography, we produce the visual ammunition your brand needs to dominate feeds.',
    bg: 'linear-gradient(180deg,#200000 0%,#400000 60%,#080808 100%)',
    metrics: [
      { val: '4K', lbl: 'Cinema-grade production quality for all major assets' },
      { val: 'Reach', lbl: 'Format-engineered specifically for algorithmic success' },
      { val: 'Speed', lbl: 'Rapid turnaround times to keep your brand culturally relevant' },
      { val: 'Scale', lbl: 'Vast content libraries built from single shoot days' }
    ],
    features: [
      { title: 'Short-Form Video (Reels/TikTok)', desc: 'Fast-paced, highly-engaging video formats designed specifically to exploit modern social algorithms.' },
      { title: 'Lifestyle & Editorial Photography', desc: 'High-end imagery that elevates your product or service into an aspirational lifestyle choice.' },
      { title: 'UGC & Authentic Experiences', desc: 'Raw, native-feeling content that builds trust by showing real people experiencing your brand.' }
    ],
    pitchHtml: '<p class="svc-text">You can have the best product in the world, but if your content looks cheap, you are cheap. We operate a <strong>high-velocity production studio</strong> that bridges the gap between premium aesthetics and raw social performance.</p><p class="svc-text">We shoot to convert. Every frame, every transition, and every hook is reverse-engineered to hold attention and drive action.</p>',
    works: [
      { media: 'assets/reels/r1.mp4', tag: 'Short-form Video', title: 'Bamboo Krabi — Event Reels' },
      { media: 'assets/reels/r2.mp4', tag: 'Cinematic Promo', title: 'Alexa Beach Club — Lifestyle Reel' },
      { media: 'assets/reels/r3.mp4', tag: 'Social Shorts', title: 'Nomads Hostel — UGC Experience' }
    ]
  },
  ai: {
    eye: '04 · The Future is Here',
    title: 'AI Creative<br>Automation',
    desc: 'Bypass the bottlenecks of traditional production. We use advanced AI models to generate infinite, hyper-realistic, luxury visual assets without ever needing a camera, a set, or a model.',
    bg: 'linear-gradient(180deg,#100020 0%,#200040 60%,#080808 100%)',
    metrics: [
      { val: 'Zero', lbl: 'Need for traditional photography crews, sets, or talent' },
      { val: '100%', lbl: 'Ownership and control over every microscopic detail' },
      { val: 'Days', lbl: 'Not weeks. Campaigns conceptualized and delivered instantly.' },
      { val: 'Infinite', lbl: 'Variations, angles, and concepts generated on demand' }
    ],
    features: [
      { title: 'Virtual Brand Representatives', desc: 'Custom-built, photorealistic AI talent that represents your brand flawlessly, 24/7, without aging or complaining.' },
      { title: 'Generative Product Photography', desc: 'Place your products in impossible, ultra-luxury environments that would cost hundreds of thousands to build physically.' },
      { title: 'Automated Content Scaling', desc: 'Generate a month\'s worth of high-end social content in a single afternoon.' }
    ],
    pitchHtml: '<p class="svc-text">This is the unfair advantage. While your competitors are waiting weeks for a weather-delayed photoshoot, we are <strong>generating studio-quality visuals in days, not weeks. No crew, no location, no delays.</strong></p><p class="svc-text">Our AI creative pipeline allows us to visualize concepts that are physically impossible or prohibitively expensive, giving your brand an aesthetic that punches far above its weight class.</p>',
    works: [
      { media: 'assets/showcase/2.mp4', tag: 'AI Fashion Model', title: 'Virtual Brand Ambassador' },
      { media: 'assets/showcase/ai-fashion.mp4', tag: 'Generative Video', title: 'AI Luxury Runway Campaign' },
      { media: 'assets/gps-cover.jpg', tag: 'Generative Photography', title: 'GPS Gems — AI Macro Content' }
    ]
  },
  strategy: {
    eye: '05 · The Blueprint',
    title: 'Brand<br>Strategy',
    desc: 'Tactics without strategy is just noise. We build the foundational DNA of your brand—positioning, narrative, and identity—ensuring you don\'t just compete, but completely redefine the category.',
    bg: 'linear-gradient(180deg,#0a0a0a 0%,#1a1a1a 60%,#080808 100%)',
    metrics: [
      { val: 'One', lbl: 'Unified, coherent voice across every single touchpoint' },
      { val: 'Moat', lbl: 'Building psychological barriers that competitors cannot cross' },
      { val: 'Price', lbl: 'Positioning that allows you to dictate premium pricing' },
      { val: 'Clarity', lbl: 'Absolute alignment on who you are and who you are for' }
    ],
    features: [
      { title: 'Category Design & Positioning', desc: 'We don\'t fight in crowded markets. We create new categories where you are the only logical choice.' },
      { title: 'Narrative & Copywriting', desc: 'Developing a brand voice that is sharp, authoritative, and impossible to ignore.' },
      { title: 'Visual Identity Systems', desc: 'A cohesive design language that ensures absolute consistency from your website to your WhatsApp profile picture.' }
    ],
    pitchHtml: '<p class="svc-text">A strong brand is the ultimate cheat code for customer acquisition. When they know who you are and what you stand for, the ads become cheaper and the conversions become easier.</p><p class="svc-text">We strip your business down to its studs and rebuild it as a <strong>category king</strong>. We find your unique angle and we amplify it until the rest of the market sounds like an echo.</p>',
    works: [
      { media: 'assets/nomads-cover.png', tag: 'Brand Positioning', title: 'Nomads Hostel Asia — Category Design' },
      { media: 'assets/reels/r4.mp4', tag: 'Brand Storytelling', title: 'Unsocials Global — Global Identity' },
      { media: 'assets/gps-cover.jpg', tag: 'Content Blueprint', title: 'GPS Gems — Educational Pillar' }
    ]
  }
};

function openService(id, fromPopState = false) {
  const data = serviceData[id];
  if (!data) return;

  if (!fromPopState) {
    history.pushState({ overlay: 'service', id: id }, '', '#service=' + id);
  }

  let metricsHtml = data.metrics.map(m => `
    <div class="bento-metric">
      <div class="bento-m-val">${m.val}</div>
      <div class="bento-m-lbl">${m.lbl}</div>
    </div>
  `).join('');

  let featuresHtml = data.features.map(f => `
    <div class="bento-feature">
      <div class="bento-f-title">${f.title}</div>
      <div class="bento-f-desc">${f.desc}</div>
    </div>
  `).join('');

  let mediaHtml = '';
  if (id === 'performance') {
    mediaHtml = `<img src="assets/elysium-cover.png" alt="Elysium Pattaya">`;
  } else if (id === 'social') {
    mediaHtml = `<img src="assets/bamboo-cover.png" alt="Bamboo Beach Club">`;
  } else if (id === 'content') {
    mediaHtml = `<video src="assets/reels/r2.mp4" autoplay loop muted playsinline></video>`;
  } else if (id === 'ai') {
    mediaHtml = `<video src="assets/showcase/2.mp4" autoplay loop muted playsinline></video>`;
  } else if (id === 'strategy') {
    mediaHtml = `<img src="assets/nomads-cover.png" alt="Nomads Hostel Asia">`;
  }

  // Ensure pitchHtml uses bento-text instead of svc-text
  let pitchHtml = data.pitchHtml.replace(/svc-text/g, 'bento-text');

  const html = `
    <div class="svc-hero" style="background:${data.bg};">
      <div class="cs-header-actions" style="margin-bottom: auto; width: 100%;">
        <button class="cs-back" onclick="closeService()">← Back to Services</button>
      </div>
      <div class="svc-eye">${data.eye}</div>
      <div class="svc-title">${data.title}</div>
      <div class="svc-desc">${data.desc}</div>
    </div>
    <div class="svc-bento-body">
      <div class="svc-bento-grid">
        
        <!-- PITCH CARD -->
        <div class="svc-bento-card pitch-card">
          <div class="bento-label">The Approach</div>
          ${pitchHtml}
        </div>

        <!-- MEDIA CARD -->
        <div class="svc-bento-card media-card">
          <div class="bento-media-w">
            ${mediaHtml}
          </div>
        </div>

        <!-- METRICS CARD -->
        <div class="svc-bento-card metrics-card">
          ${metricsHtml}
        </div>

        <!-- FEATURES CARD -->
        <div class="svc-bento-card features-card">
          <div class="bento-label">Core Capabilities</div>
          <div class="bento-features-grid">
            ${featuresHtml}
          </div>
        </div>

      </div>
    </div>
  `;

  document.getElementById('service-content').innerHTML = html;
  document.getElementById('service-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeService() {
  document.getElementById('service-overlay').classList.remove('open');
  document.body.style.overflow = '';
  if (window.location.hash.startsWith('#service=')) {
    history.pushState('', document.title, window.location.pathname + window.location.search);
  }
}

window.addEventListener('popstate', function(e) {
  if (window.location.hash.startsWith('#service=')) {
    const id = window.location.hash.split('=')[1];
    if (id) openService(id, true);
  } else {
    document.getElementById('service-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ─── ODOMETER STAT ANIMATION ───
(function(){
  var statEls = document.querySelectorAll('.u-sn');
  if(!statEls.length) return;

  function buildOdometer(el) {
    // Guard: already animated
    if(el.getAttribute('data-animated')) return;
    el.setAttribute('data-animated','1');

    var text = el.textContent.trim();
    el.innerHTML = '';
    el.style.display = 'inline-flex';
    el.style.alignItems = 'center';
    el.style.lineHeight = '1';

    var reels = [];

    text.split('').forEach(function(ch, idx) {
      if(/[0-9]/.test(ch)) {
        var target = parseInt(ch, 10);

        // Clip window — hides everything except one row
        var clip = document.createElement('span');
        clip.style.cssText = [
          'display:inline-block',
          'overflow:hidden',
          'height:1.05em',
          'vertical-align:bottom'
        ].join(';');

        // Reel: digits 0–9 stacked
        var reel = document.createElement('span');
        reel.style.cssText = 'display:flex;flex-direction:column;will-change:transform;';

        for(var d = 0; d <= 9; d++){
          var dEl = document.createElement('span');
          dEl.textContent = d;
          dEl.style.cssText = 'display:block;height:1.05em;line-height:1.05;';
          reel.appendChild(dEl);
        }

        clip.appendChild(reel);
        el.appendChild(clip);
        reels.push({ reel: reel, target: target, colIdx: idx });
      } else {
        // Non-numeric character (suffix: +, M, space, Y, r, s…)
        var sfx = document.createElement('span');
        sfx.textContent = ch;
        sfx.style.display = 'inline-block';
        // Slight fade-in for suffix
        sfx.style.opacity = '0';
        sfx.style.transition = 'opacity 0.4s ease 0.8s';
        el.appendChild(sfx);
        // Trigger suffix fade
        requestAnimationFrame(function(s){ return function(){ setTimeout(function(){ s.style.opacity='1'; }, 50); }; }(sfx));
      }
    });

    // Roll each digit reel into place
    reels.forEach(function(item){
      var yPct = -(item.target / 10) * 100; // percentage of total reel height
      var delay = 0.1 + item.colIdx * 0.07;

      if(typeof gsap !== 'undefined'){
        gsap.fromTo(item.reel,
          { y: '0%' },
          {
            y: yPct + '%',
            duration: 1.1,
            delay: delay,
            ease: 'power3.out'
          }
        );
      } else {
        setTimeout(function(r, y){
          r.style.transition = 'transform 1.1s cubic-bezier(0.16,1,0.3,1)';
          r.style.transform = 'translateY(' + y + '%)';
        }, delay * 1000, item.reel, yPct);
      }
    });
  }

  // Observe and trigger once on scroll into view
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        buildOdometer(entry.target);
      }
    });
  }, { threshold: 0.4 });

  statEls.forEach(function(el){ observer.observe(el); });
})();

// ─── MOBILE MENU TOGGLE ───
(function() {
  function initMobileMenu() {
    var ham = document.querySelector('.nham');
    var menu = document.querySelector('.mmenu');
    if (!ham || !menu) return;

    if (ham.getAttribute('data-menu-inited') === 'true') return;
    ham.setAttribute('data-menu-inited', 'true');

    ham.addEventListener('click', function(e) {
      e.preventDefault();
      var isOpen = menu.classList.contains('active');
      if (isOpen) {
        menu.classList.remove('active');
        ham.classList.remove('active');
        document.body.style.overflow = '';
      } else {
        menu.classList.add('active');
        ham.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });

    // Close menu if a link is clicked
    menu.querySelectorAll('.mmenu-link, .mmenu-book').forEach(function(link) {
      link.addEventListener('click', function() {
        menu.classList.remove('active');
        ham.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  } else {
    initMobileMenu();
  }
})();

// ─── OUTCOME FILTER LOGIC (GSAP POWERED) ───
(function() {
  function initOutcomeFilters() {
    const filterBtns = document.querySelectorAll('.wr-filter-btn');
    const grid = document.querySelector('.wr-grid');
    const cards = document.querySelectorAll('.wr-card');
    if (!filterBtns.length || !cards.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        if (this.classList.contains('active')) return;

        // Toggle active button class
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filterValue = this.getAttribute('data-filter');

        // Separate cards into targets to hide and show
        const cardsToHide = [];
        const cardsToShow = [];

        cards.forEach(card => {
          const outcomes = card.getAttribute('data-outcome') || '';
          const outcomeArray = outcomes.split(' ');
          
          if (filterValue === 'all' || outcomeArray.includes(filterValue)) {
            cardsToShow.push(card);
          } else {
            cardsToHide.push(card);
          }
        });

        // GSAP Timeline for ultra-smooth transition
        const tl = gsap.timeline({
          onComplete: () => {
            // Refresh ScrollTrigger to recalculate layout shifts
            if (typeof ScrollTrigger !== 'undefined') {
              ScrollTrigger.refresh();
            }
          }
        });

        // 1. Fade out unwanted cards
        if (cardsToHide.length > 0) {
          tl.to(cardsToHide, {
            opacity: 0,
            scale: 0.9,
            y: 15,
            duration: 0.35,
            stagger: 0.05,
            ease: 'power2.in',
            onComplete: () => {
              cardsToHide.forEach(c => c.style.display = 'none');
            }
          });
        }

        // 2. Prepare and fade/stagger in matching cards
        tl.add(() => {
          cardsToShow.forEach(c => {
            c.style.display = 'flex';
            // Reset starting state for entrance animation
            gsap.set(c, { opacity: 0, scale: 0.92, y: 20 });
          });
        });

        if (cardsToShow.length > 0) {
          tl.to(cardsToShow, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power3.out',
            clearProps: 'transform,opacity' // Keep hover state interactions intact
          });
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOutcomeFilters);
  } else {
    initOutcomeFilters();
  }
})();

// URL Hash Case Study Auto-Open
(function() {
  function checkUrlHash() {
    const hash = window.location.hash.substring(1);
    if (hash && typeof openCase === 'function' && caseData[hash]) {
      setTimeout(function() {
        openCase(hash);
      }, 400);
    }
  }
  window.addEventListener('hashchange', checkUrlHash);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkUrlHash);
  } else {
    checkUrlHash();
  }
})();

// Contact Form Submission & Validation (contact.html)
function submitContactForm(event) {
  if (event) event.preventDefault();
  
  var nameEl = document.getElementById('c-name');
  var brandEl = document.getElementById('c-brand');
  var emailEl = document.getElementById('c-email');
  var serviceEl = document.getElementById('c-service');
  var budgetEl = document.getElementById('c-budget');
  var detailsEl = document.getElementById('c-details');
  var formFeedback = document.getElementById('form-feedback');
  
  if (!nameEl || !brandEl || !emailEl || !serviceEl || !budgetEl || !detailsEl) return;
  
  var hasError = false;
  
  // Reset input border colors
  [nameEl, brandEl, emailEl, serviceEl, budgetEl].forEach(function(el) {
    el.style.borderColor = '';
  });
  if (formFeedback) {
    formFeedback.style.display = 'none';
    formFeedback.textContent = '';
    formFeedback.style.color = '';
  }
  
  if (!nameEl.value.trim()) {
    nameEl.style.borderColor = '#ff4d4d';
    hasError = true;
  }
  if (!brandEl.value.trim()) {
    brandEl.style.borderColor = '#ff4d4d';
    hasError = true;
  }
  if (!emailEl.value.trim() || !emailEl.value.includes('@')) {
    emailEl.style.borderColor = '#ff4d4d';
    hasError = true;
  }
  if (!serviceEl.value) {
    serviceEl.style.borderColor = '#ff4d4d';
    hasError = true;
  }
  if (!budgetEl.value) {
    budgetEl.style.borderColor = '#ff4d4d';
    hasError = true;
  }
  
  if (hasError) {
    if (formFeedback) {
      formFeedback.style.display = 'block';
      formFeedback.style.color = '#ff4d4d';
      var currentLang = localStorage.getItem('unsocials_lang') || 'en';
      if (currentLang === 'th') {
        formFeedback.textContent = 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนและถูกต้อง';
      } else {
        formFeedback.textContent = 'Please fill in all required fields correctly.';
      }
    }
    return;
  }
  
  var message = 'Hi Unsocials, I would like to get in touch!\n\n' +
                '• Name: ' + nameEl.value.trim() + '\n' +
                '• Brand: ' + brandEl.value.trim() + '\n' +
                '• Email: ' + emailEl.value.trim() + '\n' +
                '• Service: ' + serviceEl.value + '\n' +
                '• Estimated Budget: ' + budgetEl.value + '\n' +
                '• Details: ' + (detailsEl.value.trim() || 'None');
                
  var encodedText = encodeURIComponent(message);
  var waUrl = 'https://wa.me/66613195339?text=' + encodedText;
  
  window.open(waUrl, '_blank');
  
  if (formFeedback) {
    formFeedback.style.display = 'block';
    formFeedback.style.color = 'var(--ac, #E8FF00)';
    var currentLang = localStorage.getItem('unsocials_lang') || 'en';
    if (currentLang === 'th') {
      formFeedback.textContent = 'สำเร็จ! กำลังเปิด WhatsApp เพื่อส่งข้อความของคุณ...';
    } else {
      formFeedback.textContent = 'Success! Opening WhatsApp to send your inquiry...';
    }
  }
  
  // Reset form
  document.querySelector('.contact-form').reset();
}

// Homepage Contact Form Submission & Validation
function submitHomepageForm(event) {
  if (event) event.preventDefault();
  
  var nameEl = document.getElementById('h-name');
  var brandEl = document.getElementById('h-brand');
  var serviceEl = document.getElementById('h-service');
  var budgetEl = document.getElementById('h-budget');
  var formFeedback = document.getElementById('h-form-feedback');
  
  if (!nameEl || !brandEl || !serviceEl || !budgetEl) return;
  
  var hasError = false;
  
  [nameEl, brandEl, serviceEl, budgetEl].forEach(function(el) {
    el.style.borderColor = '';
  });
  if (formFeedback) {
    formFeedback.style.display = 'none';
    formFeedback.textContent = '';
  }
  
  if (!nameEl.value.trim()) { nameEl.style.borderColor = '#ff4d4d'; hasError = true; }
  if (!brandEl.value.trim()) { brandEl.style.borderColor = '#ff4d4d'; hasError = true; }
  if (!serviceEl.value) { serviceEl.style.borderColor = '#ff4d4d'; hasError = true; }
  if (!budgetEl.value) { budgetEl.style.borderColor = '#ff4d4d'; hasError = true; }
  
  if (hasError) {
    if (formFeedback) {
      formFeedback.style.display = 'block';
      formFeedback.style.color = '#ff4d4d';
      var currentLang = localStorage.getItem('unsocials_lang') || 'en';
      formFeedback.textContent = currentLang === 'th' ? 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' : 'Please fill in all required fields.';
    }
    return;
  }
  
  var message = 'Hi Unsocials, I would like to get in touch!\n\n' +
                '• Name: ' + nameEl.value.trim() + '\n' +
                '• Brand: ' + brandEl.value.trim() + '\n' +
                '• Service: ' + serviceEl.value + '\n' +
                '• Estimated Budget: ' + budgetEl.value;
                
  var encodedText = encodeURIComponent(message);
  var waUrl = 'https://wa.me/66613195339?text=' + encodedText;
  
  window.open(waUrl, '_blank');
  
  if (formFeedback) {
    formFeedback.style.display = 'block';
    formFeedback.style.color = 'var(--ac, #E8FF00)';
    var currentLang = localStorage.getItem('unsocials_lang') || 'en';
    formFeedback.textContent = currentLang === 'th' ? 'สำเร็จ! กำลังเปิด WhatsApp เพื่อส่งข้อความของคุณ...' : 'Success! Opening WhatsApp to send your inquiry...';
  }
  
  document.querySelector('#cta-sec .contact-form').reset();
}

// ─── LIGHTBOX GALLERY ───
(function(){
  const initLightbox = function() {
    const galleryItems = document.querySelectorAll('.cs-grid img, .cs-grid video');
    if(galleryItems.length === 0) return;

    let currentIndex = 0;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'lb-overlay';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'lb-close';
    closeBtn.innerHTML = '✕';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'lb-prev';
    prevBtn.innerHTML = '←';
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'lb-next';
    nextBtn.innerHTML = '→';
    
    const content = document.createElement('div');
    content.className = 'lb-content';
    
    const mediaElements = [];
    
    galleryItems.forEach((item, index) => {
      let clone = item.cloneNode(true);
      clone.classList.remove('active');
      if(clone.tagName.toLowerCase() === 'video'){
        clone.controls = true;
      }
      content.appendChild(clone);
      mediaElements.push(clone);
      
      item.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(index);
      });
    });
    
    overlay.appendChild(closeBtn);
    overlay.appendChild(prevBtn);
    overlay.appendChild(nextBtn);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    function openLightbox(index) {
      currentIndex = index;
      updateLightbox();
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    
    function closeLightbox() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      mediaElements.forEach(el => {
        if(el.tagName.toLowerCase() === 'video') el.pause();
      });
    }
    
    function updateLightbox() {
      mediaElements.forEach((el, i) => {
        if(i === currentIndex) {
          el.classList.add('active');
          if(el.tagName.toLowerCase() === 'video') el.play();
        } else {
          el.classList.remove('active');
          if(el.tagName.toLowerCase() === 'video') el.pause();
        }
      });
    }
    
    closeBtn.addEventListener('click', closeLightbox);
    
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex > 0) ? currentIndex - 1 : mediaElements.length - 1;
      updateLightbox();
    });
    
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex < mediaElements.length - 1) ? currentIndex + 1 : 0;
      updateLightbox();
    });
    
    overlay.addEventListener('click', (e) => {
      if(e.target === overlay || e.target === content) {
        closeLightbox();
      }
    });
  };

  // Run immediately since script is at the bottom of the body
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
  } else {
    initLightbox();
  }
})();

// ─── LAZY LOAD BACKGROUND VIDEOS ───
(function() {
  function initLazyVideos() {
    var lazyElements = Array.prototype.slice.call(document.querySelectorAll('.lazy-vid, video[data-src], source[data-src]'));
    if (!lazyElements.length) return;

    if ('IntersectionObserver' in window) {
      var videoObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var target = entry.target;
            var videoElement = target.tagName === 'VIDEO' ? target : target.parentElement;
            
            if (target.dataset.src) {
              target.src = target.dataset.src;
              delete target.dataset.src;
            }
            
            var sources = videoElement.querySelectorAll('source[data-src]');
            sources.forEach(function(srcEl) {
              srcEl.src = srcEl.dataset.src;
              delete srcEl.dataset.src;
            });
            
            videoElement.load();
            var playPromise = videoElement.play();
            if (playPromise !== undefined) {
              playPromise.catch(function() {});
            }
            videoObserver.unobserve(target);
          }
        });
      }, { rootMargin: '250px 0px' });

      lazyElements.forEach(function(el) {
        videoObserver.observe(el);
      });
    } else {
      lazyElements.forEach(function(target) {
        var videoElement = target.tagName === 'VIDEO' ? target : target.parentElement;
        if (target.dataset.src) target.src = target.dataset.src;
        videoElement.load();
        videoElement.play().catch(function() {});
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyVideos);
  } else {
    initLazyVideos();
  }
})();
