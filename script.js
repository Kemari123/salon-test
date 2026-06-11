'use strict';

function id(s){return document.getElementById(s)}
function qsa(s){return document.querySelectorAll(s)}

// Safe page load handler to prevent load events missing in deferred modules
function onPageLoad(fn) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    fn();
  } else {
    window.addEventListener('load', fn);
  }
}

/* ══ NAVBAR + MOBILE DRAWER (DASHBOARD) SCROLL ══ */
var navToggle = id('navToggle');
var navLinks  = id('navLinks');
var navOverlay = id('navOverlay');

function closeMenu(){
  if(navLinks)  navLinks.classList.remove('open');
  if(navToggle) navToggle.classList.remove('open');
  if(navOverlay) navOverlay.classList.remove('open');
  document.body.style.overflow='';
}

if(navToggle){
  navToggle.addEventListener('click',function(){
    var open=navLinks.classList.toggle('open');
    navToggle.classList.toggle('open',open);
    if(navOverlay) navOverlay.classList.toggle('open',open);
    // Setting overflow: hidden on the body keeps the view premium but the menu container itself is 100% scrollable on phone!
    document.body.style.overflow=open?'hidden':'';
  });
}

if(navOverlay) {
  navOverlay.addEventListener('click', closeMenu);
}

/* active link on scroll + back-to-top */
window.addEventListener('scroll',function(){
  var bt=id('backTop');
  if(bt) bt.classList.toggle('visible',window.scrollY>400);
  var sy=window.pageYOffset+100;
  var cur='';
  qsa('section[id]').forEach(function(s){if(s.offsetTop<=sy)cur=s.id});
  var map={home:'#home',about:'#about',services:'#services',gallery:'#gallery',contact:'#contact',location:'#location',hours:'#hours'};
  qsa('.nl').forEach(function(a){
    a.classList.remove('active');
    if(map[cur]&&a.getAttribute('href')===map[cur]) a.classList.add('active');
  });
},{passive:true});

var bt=id('backTop');
if(bt) bt.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});

/* ══ SMOOTH SCROLL all #anchors ══ */
document.addEventListener('click',function(e){
  var a=e.target.closest('a[href^="#"]');
  if(!a) return;
  // If clicking on quick links in footer or inside navigation drawer, close menu
  var tgt=document.querySelector(a.getAttribute('href'));
  if(!tgt) return;
  e.preventDefault();
  closeMenu();
  var top=tgt.getBoundingClientRect().top+window.pageYOffset-65;
  window.scrollTo({top:top,behavior:'smooth'});
});

document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){closeMenu();closeLb()}
});

/* ══ SERVICES TOGGLE ══ */
var moreSvc   = id('moreServices');
var svcBtn    = id('svcToggleBtn');
var svcLabel  = id('svcToggleLabel');
var svcIcon   = id('svcToggleIcon');
var svcOpen   = false;

if(moreSvc) moreSvc.style.display='none';

if(svcBtn&&moreSvc){
  svcBtn.addEventListener('click',function(){
    svcOpen=!svcOpen;
    moreSvc.style.display     = svcOpen?'block':'none';
    svcLabel.textContent      = svcOpen?'Show Less':'View All Services';
    svcIcon.style.transform   = svcOpen?'rotate(180deg)':'rotate(0deg)';
    if(!svcOpen){
      var s=id('services');
      if(s){var top=s.getBoundingClientRect().top+window.pageYOffset-70;window.scrollTo({top:top,behavior:'smooth'})}
    }
  });
}

/* ══ GALLERY ══ */
var GAL_MAX=20, GAL_BATCH=6;
var galLoaded=[], galShown=0;
var galGrid=id('galGrid');

onPageLoad(function(){
  if(!galGrid) return;
  var done=0, found=[];
  for(var i=1;i<=GAL_MAX;i++){
    (function(idx){
      var img=new Image(), src='images/work'+idx+'.jpeg';
      img.onload=function(){found.push({idx:idx,src:src});tick()};
      img.onerror=tick;
      img.src=src;
    })(i);
  }
  function tick(){
    done++;
    if(done<GAL_MAX) return;
    found.sort(function(a,b){return a.idx-b.idx});
    galLoaded=found.map(function(f){return f.src});
    if(galLoaded.length===0){
      var e=id('galEmpty');if(e)e.style.display='block';return;
    }
    showBatch();
    var w=id('galMoreWrap');if(w)w.style.display='flex';
    updBtn();
  }
});

function showBatch(){
  var end=Math.min(galShown+GAL_BATCH,galLoaded.length);
  for(var i=galShown;i<end;i++) galGrid.appendChild(makeItem(galLoaded[i],i));
  galShown=end;
  updBtn();
}

function makeItem(src,idx){
  var div=document.createElement('div');
  div.className='gal-item';
  var img=document.createElement('img');
  img.src=src;img.alt='Kisii Dreadlocks Work';img.loading='lazy';
  var zm=document.createElement('div');
  zm.className='gal-zoom';zm.innerHTML='<i class="fas fa-expand-alt"></i>';
  div.appendChild(img);div.appendChild(zm);
  div.addEventListener('click',function(){openLb(idx)});
  return div;
}

function collapseGallery() {
  if (!galGrid) return;
  galGrid.innerHTML = '';
  galShown = 0;
  showBatch(); // Re-shows the initial BATCH of 6
  updBtn();
  
  // Smoothly scroll back to top of gallery section
  var s = id('gallery');
  if (s) {
    var top = s.getBoundingClientRect().top + window.pageYOffset - 70;
    window.scrollTo({top: top, behavior: 'smooth'});
  }
}

function updBtn(){
  var btn=id('galMoreBtn'),lbl=id('galMoreLabel');
  if(!btn) return;
  
  // Toggle icon and label depending on if we have expanded everything
  var icon = btn.querySelector('i');
  
  if(galShown >= galLoaded.length && galLoaded.length > GAL_BATCH){
    btn.disabled=false;
    if(lbl) lbl.textContent='View Less';
    if(icon) icon.className='fas fa-chevron-up';
  } else if(galShown >= galLoaded.length) {
    btn.disabled=true;
    if(lbl) lbl.textContent='All Images Shown';
    if(icon) icon.className='fas fa-images';
  } else {
    btn.disabled=false;
    if(lbl) lbl.textContent='View All Images';
    if(icon) icon.className='fas fa-images';
  }
}

var galBtn=id('galMoreBtn');
if(galBtn) {
  galBtn.addEventListener('click',function(){
    if(!galBtn.disabled) {
      if(galShown >= galLoaded.length) {
        collapseGallery();
      } else {
        showBatch();
      }
    }
  });
}

/* ══ LIGHTBOX ══ */
var lbIdx=0;

function openLb(idx){
  lbIdx=idx;
  var lb=id('lightbox'),wrap=id('lbImgWrap');
  if(!lb||!wrap||!galLoaded[lbIdx]) return;
  wrap.innerHTML='<img src="'+galLoaded[lbIdx]+'" alt="Kisii Dreadlocks Work">';
  lb.classList.add('open');
  document.body.style.overflow='hidden';
  arrs();
}
function closeLb(){
  var lb=id('lightbox');
  if(lb) lb.classList.remove('open');
  document.body.style.overflow='';
}
function arrs(){
  var p=id('lbPrev'),n=id('lbNext');
  if(p) p.style.opacity=lbIdx>0?'1':'0.25';
  if(n) n.style.opacity=lbIdx<galLoaded.length-1?'1':'0.25';
}

var lb=id('lightbox');
if(lb){
  var lbc = id('lbClose'), lbp = id('lbPrev'), lbn = id('lbNext');
  if(lbc) lbc.addEventListener('click',closeLb);
  lb.addEventListener('click',function(e){if(e.target===lb)closeLb()});
  if(lbp) lbp.addEventListener('click',function(e){e.stopPropagation();if(lbIdx>0)openLb(lbIdx-1)});
  if(lbn) lbn.addEventListener('click',function(e){e.stopPropagation();if(lbIdx<galLoaded.length-1)openLb(lbIdx+1)});
  var tx=0;
  lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){
    var dx=e.changedTouches[0].clientX-tx;
    if(Math.abs(dx)>50){if(dx<0&&lbIdx<galLoaded.length-1)openLb(lbIdx+1);else if(dx>0&&lbIdx>0)openLb(lbIdx-1)}
  },{passive:true});
}

document.addEventListener('keydown',function(e){
  var lb=id('lightbox');
  if(!lb||!lb.classList.contains('open')) return;
  if(e.key==='ArrowLeft'&&lbIdx>0)         openLb(lbIdx-1);
  if(e.key==='ArrowRight'&&lbIdx<galLoaded.length-1) openLb(lbIdx+1);
});


/* ══ THEME TOGGLE (LIGHT & DARK ACCENTS) ══ */
var themeToggle = id('themeToggle');
if(themeToggle) {
  var savedTheme = localStorage.getItem('theme');
  if(savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }
  
  themeToggle.addEventListener('click', function() {
    var isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

/* ══ FOOTER YEAR ══ */
var yr=id('yr');
if(yr) yr.textContent=new Date().getFullYear();

/* ══ SCROLL REVEAL ══ */
var els=qsa('.svc-card,.ccard,.hours-card,.about-photo,.about-body,.loc-card');
els.forEach(function(el,i){
  el.style.opacity='0';el.style.transform='translateY(18px)';
  el.style.transition='opacity .5s ease '+(i%4*.07)+'s,transform .5s ease '+(i%4*.07)+'s';
});
var obs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='translateY(0)';obs.unobserve(e.target)}
  });
},{threshold:.1});
els.forEach(function(el){obs.observe(el)});

/* ══ REGISTER SERVICE WORKER FOR PWA INSTALLABILITY ══ */
if ('serviceWorker' in navigator) {
  onPageLoad(function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(reg) {
        console.log('ServiceWorker registered successfully with scope: ', reg.scope);
      })
      .catch(function(err) {
        console.error('ServiceWorker registration failed: ', err);
      });
  });
}

/* ══ PWA INSTALL PROMPT PROMOTION ══ */
var deferredPrompt = null;
var pwaBanner = id('pwaBanner');
var pwaInstallBtn = id('pwaInstallBtn');
var pwaCloseBtn = id('pwaCloseBtn');
var menuInstallLi = id('menuInstallLi');
var menuInstallBtn = id('menuInstallBtn');

window.addEventListener('beforeinstallprompt', function(e) {
  // Prevent default install bar from showing up so we use our elegant dashboard promo
  e.preventDefault();
  deferredPrompt = e;
  
  // Bring up navigation menu install item
  if (menuInstallLi) menuInstallLi.style.display = 'block';
  
  // Show premium float banner for first-time session visitors
  if (pwaBanner && !sessionStorage.getItem('pwaDismissed')) {
    pwaBanner.style.display = 'flex';
  }
});

function triggerPwaInstall() {
  if (!deferredPrompt) {
    // If not installable directly, trigger instructions
    alert("To install our App:\n- On Safari (iPhone): Tap 'Share' icon and choose 'Add to Home Screen'.\n- On Chrome (Android/PC): Tap Chrome's settings (3-dots) and choose 'Add to Home Screen' or 'Install App'.");
    return;
  }
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(function(result) {
    console.log('PWA installation choice:', result.outcome);
    deferredPrompt = null;
    hidePwaPromos();
  });
}

function hidePwaPromos() {
  if (pwaBanner) pwaBanner.style.display = 'none';
  if (menuInstallLi) menuInstallLi.style.display = 'none';
}

if (pwaInstallBtn) pwaInstallBtn.addEventListener('click', triggerPwaInstall);
if (menuInstallBtn) {
  menuInstallBtn.addEventListener('click', function(e) {
    e.preventDefault();
    closeMenu();
    triggerPwaInstall();
  });
}

if (pwaCloseBtn) {
  pwaCloseBtn.addEventListener('click', function() {
    sessionStorage.setItem('pwaDismissed', 'true');
    if (pwaBanner) pwaBanner.style.display = 'none';
  });
}

window.addEventListener('appinstalled', function() {
  console.log('Kisii Dreadlocks Parlor App successfully installed!');
  hidePwaPromos();
});




