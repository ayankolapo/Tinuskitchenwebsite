let reviewStarValue=0;
        function setReviewStar(n){reviewStarValue=n;document.querySelectorAll('#starRating span').forEach((s,i)=>{s.textContent=i<n?'★':'☆';s.style.color=i<n?'#D4A017':'#ccc';s.style.transform=i<n?'scale(1.15)':'scale(1)';})}
        function submitReview(){const name=document.getElementById('reviewName').value.trim();const dish=document.getElementById('reviewDish').value.trim();const review=document.getElementById('reviewText').value.trim();const stars='★'.repeat(reviewStarValue)+'☆'.repeat(5-reviewStarValue);if(!name){alert('Please enter your name 😊');return;}if(!reviewStarValue){alert('Please give a star rating ⭐');return;}if(!review){alert('Please write a short review 📝');return;}const msg='⭐ NEW CUSTOMER REVIEW\n\n👤 Name: '+name+'\n🍽️ Dish: '+(dish||'Not specified')+'\n'+stars+' ('+reviewStarValue+'/5 stars)\n\n💬 Review:\n"'+review+'"\n\n📍 Sent from Tinu\'s Kitchen Bistro website';window.open('https://wa.me/2348024115636?text='+encodeURIComponent(msg),'_blank');}

// ══════════════════════════════════════

// Navbar scroll
const nav=document.getElementById('navbar');
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>60));

// Mobile menu
function closeMobile(){} // mobile menu handled by new nav


// Scroll reveal
const io=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting)e.target.classList.add('visible');
}),{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el=>io.observe(el));

// Smooth scroll
/* smooth scroll removed — handled by showPage */

function switchTab(name) {
  document.querySelectorAll('.mpanel').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).style.display = 'block';
  document.querySelector('[data-tab="' + name + '"]').classList.add('active');
}


// ===== CART SYSTEM =====
let cart = {};  // {itemKey: {name, price, qty}}

function parsePrice(priceStr) {
  // Extract first number from price string like "₦1,500" or "₦6,000 – ₦8,000"
  if (!priceStr) return 0;
  const match = priceStr.replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

function addToCart(key, name, priceRaw) {
  const price = parsePrice(priceRaw);
  if (cart[key]) {
    cart[key].qty += 1;
  } else {
    cart[key] = { name, price, priceRaw, qty: 1 };
  }
  renderCart();
  showCartFab();
  // Flash the button
  const btn = document.querySelector(`[data-cart-key="${key}"]`);
  if (btn) {
    btn.textContent = '✓ Added';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = cart[key] ? `In Cart (${cart[key].qty})` : 'Add to Cart';
    }, 900);
  }
}

function removeFromCart(key) {
  delete cart[key];
  renderCart();
  updateAllCartBtns();
  if (Object.keys(cart).length === 0) hideCartFab();
}

function changeQty(key, delta) {
  if (!cart[key]) return;
  cart[key].qty += delta;
  if (cart[key].qty <= 0) {
    removeFromCart(key);
    return;
  }
  renderCart();
  updateAllCartBtns();
}

function clearCart() {
  cart = {};
  renderCart();
  updateAllCartBtns();
  hideCartFab();
}

function renderCart() {
  const list = document.getElementById('cartItemsList');
  const totalEl = document.getElementById('cartTotal');
  const badge = document.getElementById('cartBadge');
  const fabLabel = document.getElementById('cartFabLabel');
  const keys = Object.keys(cart);

  // Badge count
  const totalQty = keys.reduce((s,k) => s + cart[k].qty, 0);
  badge.textContent = totalQty;

  // Total price
  const totalPrice = keys.reduce((s,k) => s + cart[k].price * cart[k].qty, 0);
  totalEl.textContent = '₦' + totalPrice.toLocaleString();
  fabLabel.textContent = totalQty === 1 ? '1 item' : totalQty + ' items';

  if (keys.length === 0) {
    list.innerHTML = `<div class="cart-empty-state"><div class="empty-icon">🍽️</div><p>Your order is empty.<br/>Browse the menu and tap <strong style="color:var(--gold)">Add to Cart</strong> on any dish.</p></div>`;
    return;
  }

  list.innerHTML = keys.map(k => {
    const item = cart[k];
    const lineTotal = item.price * item.qty;
    return `
      <div class="cart-item">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₦${lineTotal.toLocaleString()}</div>
        </div>
        <div class="cart-qty">
          <button class="cart-qty-btn" onclick="changeQty('${k}',-1)">−</button>
          <span class="cart-qty-num">${item.qty}</span>
          <button class="cart-qty-btn" onclick="changeQty('${k}',1)">+</button>
        </div>
        <button class="cart-remove-btn" onclick="removeFromCart('${k}')" title="Remove">✕</button>
      </div>`;
  }).join('');
}

function updateAllCartBtns() {
  document.querySelectorAll('[data-cart-key]').forEach(btn => {
    const key = btn.dataset.cartKey;
    if (cart[key]) {
      btn.textContent = `In Cart (${cart[key].qty})`;
      btn.classList.add('added');
    } else {
      btn.textContent = 'Add to Cart';
      btn.classList.remove('added');
    }
  });
}

function showCartFab() {
  document.getElementById('cartFab').classList.add('has-items');
}
function hideCartFab() {
  document.getElementById('cartFab').classList.remove('has-items');
  closeCart();
}
function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function sendOrderOnWhatsApp() {
  const keys = Object.keys(cart);
  if (keys.length === 0) return;
  let msg = "Hi Tinu\'s Kitchen Bistro! 🍽️ I\'d like to place an order:\n\n";
  keys.forEach(k => {
    const item = cart[k];
    msg += `• ${item.qty}x ${item.name} — ₦${(item.price * item.qty).toLocaleString()}\n`;
  });
  const total = keys.reduce((s,k) => s + cart[k].price * cart[k].qty, 0);
  msg += `\n*Total: ₦${total.toLocaleString()}*\n\nPlease confirm availability and my delivery/pickup options. Thank you! 🙏`;
  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/2348162918036?text=${encoded}`, '_blank');
}


// ── CASCADE ANIMATION FOR MENU TABS ──
const _origSwitchTab = switchTab;
switchTab = function(name) {
  _origSwitchTab(name);
  const panel = document.getElementById('tab-' + name);
  if (!panel) return;
  const cards = panel.querySelectorAll('.mcard');
  cards.forEach((c, i) => {
    c.classList.remove('cascade');
    // force reflow
    void c.offsetWidth;
    c.classList.add('cascade');
    c.style.animationDelay = (i * 0.045) + 's';
  });
};
// Trigger cascade on initial visible tab
document.addEventListener('DOMContentLoaded', () => {
  const firstPanel = document.getElementById('tab-rice');
  if (firstPanel) {
    firstPanel.querySelectorAll('.mcard').forEach((c, i) => {
      c.classList.add('cascade');
      c.style.animationDelay = (i * 0.05) + 's';
    });
  }
});

// ── SCROLL PROGRESS BAR ──
const progressBar = document.getElementById('scrollProgress');
function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? scrollTop / docHeight : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${pct})`;
}

// ── PARALLAX HERO ──
const heroBg = document.querySelector('.hero-bg');
function updateParallax() {
  if (!heroBg) return;
  const scrollY = window.scrollY;
  const heroH = document.querySelector('.hero')?.offsetHeight || window.innerHeight;
  if (scrollY < heroH) {
    heroBg.style.transform = `scale(1.08) translateY(${scrollY * 0.28}px)`;
  }
}

// ── TICKER SYNC WITH NAV ──
const tickerWrap = document.getElementById('tickerWrap');
function updateTicker() {
  if (!tickerWrap) return;
  const navH = window.scrollY > 60 ? 62 : 72;
  tickerWrap.style.top = navH + 'px';
}

// ── COMBINED SCROLL HANDLER ──
window.addEventListener('scroll', () => {
  updateProgress();
  updateParallax();
  updateTicker();
}, { passive: true });

// Run once on load
updateProgress();
updateParallax();
updateTicker();


// ===== OPTION SELECTOR MODAL =====
let optState = {
  dishBase: '',
  selectedOption: null,
  qty: 1,
  options: []
};

// Registry of multi-option items
// key must match data-cart-key on the button
const MULTI_OPTION_ITEMS = {
  'chicken_laps': {
    name: 'Chicken Laps',
    options: [
      { label: 'Large', price: 4000 },
      { label: 'Small', price: 2500 }
    ]
  },
  'turkey': {
    name: 'Turkey',
    options: [
      { label: 'Big',    price: 6000 },
      { label: 'Medium', price: 4000 },
      { label: 'Small',  price: 3000 }
    ]
  },
  'beef': {
    name: 'Beef',
    options: [
      { label: 'Big',   price: 1000 },
      { label: 'Small', price: 500  }
    ]
  },
  'white_ponmo': {
    name: 'White Ponmo',
    options: [
      { label: 'Big',   price: 1000 },
      { label: 'Small', price: 500  }
    ]
  },
  'milkshake___please_specify_str': {
    name: 'Milkshake',
    options: [
      { label: '🍓 Strawberry', price: 6000 },
      { label: '🍦 Vanilla',    price: 6000 },
      { label: '🍪 Oreos',      price: 8000 }
    ]
  }
};

// Also register by partial key match — more robust
function findMultiItem(key) {
  return MULTI_OPTION_ITEMS[key] || null;
}

function openOptModal(key, name) {
  const item = findMultiItem(key);
  if (!item) return false; // not a multi-option item

  optState = { dishBase: item.name || name, selectedOption: null, qty: 1, options: item.options };

  document.getElementById('optDishName').textContent = item.name || name;
  document.getElementById('optQtyNum').textContent = '1';
  document.getElementById('optLineTotal').textContent = '₦0';
  document.getElementById('optAddBtn').disabled = true;
  document.getElementById('optAddBtn').textContent = '🛒 Choose an option above';

  // Render options
  const list = document.getElementById('optOptionsList');
  list.innerHTML = item.options.map((opt, i) => `
    <div class="opt-option" onclick="selectOpt(${i})" id="opt-choice-${i}">
      <div class="opt-option-name">${opt.label}</div>
      <div class="opt-option-price">₦${opt.price.toLocaleString()}</div>
    </div>
  `).join('');

  document.getElementById('optOverlay').classList.add('open');
  document.getElementById('optModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  return true;
}

function closeOptModal() {
  document.getElementById('optOverlay').classList.remove('open');
  document.getElementById('optModal').classList.remove('open');
  document.body.style.overflow = '';
}

function selectOpt(idx) {
  optState.selectedOption = idx;
  // Update UI
  document.querySelectorAll('.opt-option').forEach((el, i) => {
    el.classList.toggle('selected', i === idx);
  });
  updateOptTotal();
  const opt = optState.options[idx];
  const addBtn = document.getElementById('optAddBtn');
  addBtn.disabled = false;
  addBtn.textContent = `🛒 Add ${optState.qty}x ${optState.dishBase} (${opt.label}) to Order`;
}

function changeOptQty(delta) {
  optState.qty = Math.max(1, optState.qty + delta);
  document.getElementById('optQtyNum').textContent = optState.qty;
  document.getElementById('optQtyMinus').disabled = optState.qty <= 1;
  updateOptTotal();
  if (optState.selectedOption !== null) {
    const opt = optState.options[optState.selectedOption];
    const addBtn = document.getElementById('optAddBtn');
    addBtn.textContent = `🛒 Add ${optState.qty}x ${optState.dishBase} (${opt.label}) to Order`;
  }
}

function updateOptTotal() {
  if (optState.selectedOption === null) return;
  const opt = optState.options[optState.selectedOption];
  const total = opt.price * optState.qty;
  document.getElementById('optLineTotal').textContent = '₦' + total.toLocaleString();
}

function confirmOptAdd() {
  if (optState.selectedOption === null) return;
  const opt = optState.options[optState.selectedOption];
  const fullName = `${optState.dishBase} (${opt.label})`;
  const key = fullName.toLowerCase().replace(/[^a-z0-9]/g,'_').substring(0,32);

  // Add to cart with correct qty
  if (cart[key]) {
    cart[key].qty += optState.qty;
  } else {
    cart[key] = { name: fullName, price: opt.price, priceRaw: String(opt.price), qty: optState.qty };
  }
  renderCart();
  showCartFab();
  closeOptModal();

  // Flash the original trigger button
  document.querySelectorAll('[data-cart-key]').forEach(btn => {
    const bKey = btn.dataset.cartKey;
    if (findMultiItem(bKey) && bKey.substring(0,6) === key.substring(0,6)) {
      btn.textContent = '✓ Added!';
      btn.classList.add('added');
      setTimeout(() => {
        btn.textContent = 'Add to Cart';
        btn.classList.remove('added');
      }, 1200);
    }
  });
}

// ── Override addToCart to intercept multi-option items ──
const _origAddToCart = addToCart;
addToCart = function(key, name, price) {
  const opened = openOptModal(key, name);
  if (!opened) {
    _origAddToCart(key, name, price);
  }
};


// ========================================================
// FEATURE A — LIVE ORDER NOTIFICATIONS
// ========================================================


// ========================================================
// FEATURE B — WHAT ARE YOU CRAVING QUIZ
// ========================================================
const quizAnswers = {};
const QUIZ_RESULTS = [
  // [hunger, mood, taste] → result
  {match: (h,m,t) => t==='sweet', emoji:'🥤', dish:'Oreo Milkshake', desc:'Rich, creamy and absolutely indulgent — our Oreo milkshake is a treat your tastebuds deserve right now.', price:'₦8,000', wa:'Oreo%20Milkshake%20(Oreos)'},
  {match: (h,m,t) => m==='fresh' && t!=='sweet', emoji:'', dish:'Chicken Salad', desc:'Crisp greens, seasoned chicken, sweet corn and a light dressing — fresh, filling and absolutely guilt-free.', price:'₦6,000', wa:'Chicken%20Salad'},
  {match: (h,m,t) => m==='treat', emoji:'🍝', dish:'Chicken Alfredo Pasta', desc:'Creamy, rich and deeply satisfying — our premium Alfredo is the ultimate self-care meal. You deserve this.', price:'₦15,000', wa:'Chicken%20Alfredo%20Pasta'},
  {match: (h,m,t) => m==='bold' && h==='starving', emoji:'🐟', dish:'Croaker Fish + Jollof Rice', desc:'A whole perfectly seasoned Croaker on a bed of our smoky Jollof — bold, rich and deeply Lagos. Made for the truly hungry.', price:'₦3,500+', wa:'Croaker%20Fish%20%2B%20Jollof%20Rice%20Combo'},
  {match: (h,m,t) => m==='bold', emoji:'🌶️', dish:'Asun Rice', desc:'Our boldly spiced Asun rice brings the fire — smoky, peppery and deeply satisfying for those who like it hot.', price:'₦2,000', wa:'Asun%20Rice'},
  {match: (h,m,t) => h==='starving' && m==='comfort', emoji:'🍲', dish:'Egusi Soup + Poundo Yam', desc:'The ultimate Nigerian comfort combo — rich, nutty Egusi soup paired with smooth Poundo yam. Like a warm hug from home.', price:'₦800 + ₦600', wa:'Egusi%20Soup%20%2B%20Poundo%20Yam'},
  {match: (h,m,t) => h==='starving', emoji:'🍛', dish:'TKB Signature Rice Combo', desc:'Our house special — packed with flavour, massive in portion. When you need to eat BIG, this is the one.', price:'₦2,000', wa:'TKB%20Signature%20Rice'},
  {match: (h,m,t) => h==='light' && m==='comfort', emoji:'🌮', dish:'Yamarita', desc:'Light, crispy and comforting — Yamarita is the perfect snack-level meal when you want something warm without the heaviness.', price:'₦1,000', wa:'Yamarita'},
  {match: () => true, emoji:'🍛', dish:'Jollof Rice Combo', desc:'You can never go wrong with the Lagos classic — our smoky, well-seasoned Jollof with your choice of protein. Always satisfying.', price:'₦2,500', wa:'Jollof%20Rice%20Combo'},
];

function quizPick(step, key, val) {
  quizAnswers[key] = val;
  // Highlight chosen
  const stepEl = document.getElementById('qStep' + step);
  stepEl.querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('chosen'));
  event.currentTarget.classList.add('chosen');
  // Enable next btn
  const nxt = document.getElementById('qNext' + step);
  if (nxt) { nxt.classList.add('ready'); }
}

function quizNext(step) {
  document.getElementById('qStep' + step).classList.remove('active');
  document.getElementById('qStep' + (step+1)).classList.add('active');
  // Update progress
  document.getElementById('quizProgress').style.width = (step / 3 * 100) + '%';
}

function quizReveal() {
  document.getElementById('qStep3').classList.remove('active');
  document.getElementById('quizProgress').style.width = '100%';
  const h = quizAnswers.hunger || 'medium';
  const m = quizAnswers.mood || 'comfort';
  const t = quizAnswers.taste || 'savoury';
  const result = QUIZ_RESULTS.find(r => r.match(h, m, t));
  document.getElementById('qResEmoji').textContent = result.emoji;
  document.getElementById('qResDish').textContent = result.dish;
  document.getElementById('qResDesc').textContent = result.desc;
  document.getElementById('qResPrice').textContent = result.price;
  document.getElementById('qResBtn').href = `https://wa.me/2348162918036?text=Hi%20Tinu%27s%20Kitchen%20Bistro!%20%F0%9F%8D%BD%EF%B8%8F%20I%20took%20the%20food%20quiz%20and%20my%20perfect%20meal%20is%3A%20*${result.wa.replace(/%20/g,' ')}*%20(${result.price}).%20Is%20it%20available%20now%3F%20I%27d%20like%20to%20order%20please!`;
  document.getElementById('qResult').classList.add('active');
}

function quizReset() {
  Object.keys(quizAnswers).forEach(k => delete quizAnswers[k]);
  document.getElementById('qResult').classList.remove('active');
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('chosen'));
  document.querySelectorAll('.quiz-next-btn').forEach(b => b.classList.remove('ready'));
  document.getElementById('quizProgress').style.width = '0%';
  document.getElementById('qStep1').classList.add('active');
}

// ========================================================
// FEATURE C — CONFETTI ON ORDER SENT
// ========================================================
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = [];
  const colors = ['#C0182A','#D4A017','#F2C94C','#ffffff','#25D366','#ff6b6b'];
  for (let i = 0; i < 140; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 8 + 4,
      d: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngle: 0,
      tiltSpeed: Math.random() * 0.1 + 0.05,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    });
  }
  let frame = 0;
  const maxFrames = 200;
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.beginPath();
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.tiltAngle);
        ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r * 0.6);
        ctx.restore();
      } else {
        ctx.arc(p.x, p.y, p.r/2, 0, Math.PI*2);
        ctx.fill();
      }
      p.y += p.d + 1.2;
      p.tiltAngle += p.tiltSpeed;
      p.x += Math.sin(p.tiltAngle) * 1.5;
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
    });
    frame++;
    if (frame < maxFrames) requestAnimationFrame(drawConfetti);
    else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    }
  }
  drawConfetti();
  // Show success toast
  const toast = document.getElementById('orderSuccessToast');
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }
}

// Hook into sendOrderOnWhatsApp
const _origSendOrder = sendOrderOnWhatsApp;
sendOrderOnWhatsApp = function() {
  _origSendOrder();
  setTimeout(launchConfetti, 600);
};

// ========================================================
// FEATURE D — COUNTDOWN TIMER (resets to 9pm daily)
// ========================================================





// ── STICKY ORDER BAR ──
(function() {
  const bar = document.getElementById('stickyOrderBar');
  if (!bar) return;
  let shown = false;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300 && !shown) {
      bar.classList.add('visible');
      shown = true;
    } else if (window.scrollY <= 300 && shown) {
      bar.classList.remove('visible');
      shown = false;
    }
  }, { passive: true });
})();

// ── WHATSAPP CHAT BUBBLE ──
let waChatOpen = false;
function toggleWaChat() {
  waChatOpen = !waChatOpen;
  const popup = document.getElementById('waChatPopup');
  const dot = document.querySelector('.wa-notif-dot');
  if (waChatOpen) {
    popup.classList.add('show');
    if (dot) dot.style.display = 'none';
  } else {
    popup.classList.remove('show');
  }
}
function closeWaChat() {
  waChatOpen = false;
  const popup = document.getElementById('waChatPopup');
  if (popup) popup.classList.remove('show');
}
// Auto-open bubble after 8 seconds (once)
setTimeout(function() {
  const popup = document.getElementById('waChatPopup');
  const dot = document.querySelector('.wa-notif-dot');
  if (popup && !waChatOpen) {
    popup.classList.add('show');
    waChatOpen = true;
    if (dot) dot.style.display = 'none';
  }
}, 8000);
// Close when clicking outside
document.addEventListener('click', function(e) {
  const bubble = document.getElementById('waChatBubble');
  if (bubble && !bubble.contains(e.target) && waChatOpen) {
    closeWaChat();
  }
});

// ── FLOATING REVIEW ICON ──
let rfStarValue = 0;
let rfOpen = false;

function toggleReviewFloat() {
  rfOpen = !rfOpen;
  const popup = document.getElementById('reviewFloatPopup');
  if (!popup) return;
  if (rfOpen) {
    // close WA popup if open
    closeWaChat();
    popup.style.display = 'block';
    requestAnimationFrame(() => popup.classList.add('show'));
  } else {
    closeReviewFloat();
  }
}

function closeReviewFloat() {
  rfOpen = false;
  const popup = document.getElementById('reviewFloatPopup');
  if (!popup) return;
  popup.classList.remove('show');
  setTimeout(() => { popup.style.display = 'none'; }, 350);
}

function setRfStar(n) {
  rfStarValue = n;
  document.querySelectorAll('#rfStars span').forEach((s, i) => {
    s.textContent = i < n ? '★' : '☆';
    s.style.color = i < n ? '#D4A017' : '#ddd';
    s.style.transform = i < n ? 'scale(1.2)' : 'scale(1)';
  });
}

function submitFloatReview() {
  const name   = (document.getElementById('rfName').value || '').trim();
  const dish   = (document.getElementById('rfDish').value || '').trim();
  const review = (document.getElementById('rfText').value || '').trim();
  const stars  = '★'.repeat(rfStarValue) + '☆'.repeat(5 - rfStarValue);

  if (!name)        { alert('Please enter your name 😊'); return; }
  if (!rfStarValue) { alert('Please tap a star rating ⭐'); return; }
  if (!review)      { alert('Please write a short review 📝'); return; }

  const msg = '⭐ NEW CUSTOMER REVIEW\n\n'
    + '👤 Name: ' + name + '\n'
    + '🍽️ Dish: ' + (dish || 'Not specified') + '\n'
    + stars + ' (' + rfStarValue + '/5 stars)\n\n'
    + '💬 Review:\n"' + review + '"\n\n'
    + '📍 Sent from Tinu\'s Kitchen Bistro website';

  window.open('https://wa.me/2348024115636?text=' + encodeURIComponent(msg), '_blank');
  // Show success message
  const btn = document.querySelector('.res-submit-btn');
  if (btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = '✅ Request Sent! Check WhatsApp';
    btn.style.background = '#25D366';
    btn.style.color = '#fff';
    setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.style.color = ''; }, 4000);
  }
  closeReviewFloat();

  // Reset form
  document.getElementById('rfName').value = '';
  document.getElementById('rfDish').value = '';
  document.getElementById('rfText').value = '';
  rfStarValue = 0;
  document.querySelectorAll('#rfStars span').forEach(s => {
    s.textContent = '☆'; s.style.color = '#ddd'; s.style.transform = 'scale(1)';
  });
}

// ═══ RESERVATION ═══
let resOccasion = '';
let resGuests = 2;

function selectOccasion(el) {
  document.querySelectorAll('.res-occasion-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  resOccasion = el.dataset.occasion;
}

function adjustGuests(delta) {
  resGuests = Math.max(1, Math.min(20, resGuests + delta));
  const el = document.getElementById('resGuestCount');
  if (el) el.textContent = resGuests + (resGuests === 20 ? ' (max)' : '');
}

function toggleInclude(el) {
  el.classList.toggle('selected');
  const check = el.querySelector('.chip-check');
  if (check) check.textContent = el.classList.contains('selected') ? '✓' : '';
}

function submitReservation() {
  const name   = (document.getElementById('resName').value || '').trim();
  const phone  = (document.getElementById('resPhone').value || '').trim();
  const date   = (document.getElementById('resDate').value || '').trim();
  const time   = (document.getElementById('resTime').value || '').trim();
  const budget = (document.getElementById('resBudget').value || '').trim();
  const note   = (document.getElementById('resNote').value || '').trim();

  if (!name)     { alert('Please enter your full name 😊'); return; }
  if (!phone)    { alert('Please enter your phone number 📞'); return; }
  if (!resOccasion) { alert('Please select an occasion above 🎉'); return; }
  if (!date)     { alert('Please select your preferred date'); return; }
  if (!time)     { alert('Please select a time slot'); return; }

  const includes = [];
  document.querySelectorAll('.res-include-chip.selected').forEach(c => {
    includes.push(c.dataset.include);
  });

  const msg =
    '🍽️ PRIVATE DINING RESERVATION REQUEST\n'
    + '─────────────────────────────\n\n'
    + '👤 *Name:* ' + name + '\n'
    + '📞 *Phone:* ' + phone + '\n\n'
    + '🎉 *Occasion:* ' + resOccasion + '\n'
    + '📅 *Date:* ' + date + '\n'
    + '⏰ *Time:* ' + time + '\n'
    + '👥 *Guests:* ' + resGuests + '\n'
    + (budget ? '💰 *Budget:* ' + budget + '\n' : '')
    + '\n✅ *Includes:*\n' + includes.map(i => '  • ' + i).join('\n')
    + (note ? '\n\n📝 *Special Requests:*\n' + note : '')
    + '\n\n─────────────────────────────\n'
    + 'Sent from Tinu\'s Kitchen Bistro website';

  window.open('https://wa.me/2348024115636?text=' + encodeURIComponent(msg), '_blank');
}

// ══════════════════════════════════
// HAMBURGER NAVIGATION
// ══════════════════════════════════
function toggleNav() {
  var overlay = document.getElementById('navOverlay');
  var btn = document.getElementById('hamburgerBtn');
  if (!overlay || !btn) return;
  var isOpen = overlay.classList.contains('open');
  if (isOpen) {
    overlay.classList.remove('open');
    btn.classList.remove('open');
    document.body.classList.remove('nav-open');
  } else {
    overlay.classList.add('open');
    btn.classList.add('open');
    document.body.classList.add('nav-open');
  }
}

function closeNav() {
  var overlay = document.getElementById('navOverlay');
  var btn = document.getElementById('hamburgerBtn');
  if (overlay) overlay.classList.remove('open');
  if (btn) btn.classList.remove('open');
  document.body.classList.remove('nav-open');
}

function navTo(sectionId) {
  closeNav();
  setTimeout(function() {
    var el = document.getElementById(sectionId);
    if (el) {
      var top = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }, 320);
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeNav();
});

// ── HERO BACKGROUND SLIDESHOW ──
(function() {
  var slides = document.querySelectorAll('.hero-bg-slide');
  if (!slides.length) return;
  var current = 0;
  setInterval(function() {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 3000);
})();

document.getElementById('copyrightYear') && (document.getElementById('copyrightYear').textContent = new Date().getFullYear());
// Set reservation date minimum to today
(function() {
  var dateEl = document.getElementById('resDate');
  if (dateEl) {
    var today = new Date().toISOString().split('T')[0];
    dateEl.setAttribute('min', today);
  }
})();


// ── GALLERY LIGHTBOX ──
let LB_IMGS = [];
let lbIndex = 0;
document.addEventListener('DOMContentLoaded', function() {
  LB_IMGS = Array.from(document.querySelectorAll('.gallery-thumb img')).map(img => ({
    src: img.src,
    alt: img.closest('.gallery-thumb') && img.closest('.gallery-thumb').querySelector('.gallery-thumb-label')
      ? img.closest('.gallery-thumb').querySelector('.gallery-thumb-label').textContent
      : img.alt
  }));
});

function openLightbox(idx) {
  lbIndex = idx;
  lbShow();
  document.getElementById('galleryLightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('galleryLightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function lbShow() {
  const img = document.getElementById('lbImg');
  const caption = document.getElementById('lbCaption');
  const counter = document.getElementById('lbCounter');
  img.classList.add('fading');
  setTimeout(() => {
    img.src = LB_IMGS[lbIndex].src;
    img.alt = LB_IMGS[lbIndex].alt;
    if (caption) caption.textContent = LB_IMGS[lbIndex].alt;
    if (counter) counter.textContent = (lbIndex + 1) + ' / ' + LB_IMGS.length;
    img.classList.remove('fading');
  }, 200);
}

function lbNext() {
  lbIndex = (lbIndex + 1) % LB_IMGS.length;
  lbShow();
}

function lbPrev() {
  lbIndex = (lbIndex - 1 + LB_IMGS.length) % LB_IMGS.length;
  lbShow();
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  const lb = document.getElementById('galleryLightbox');
  if (!lb || !lb.classList.contains('open')) return;
  if (e.key === 'ArrowRight') lbNext();
  if (e.key === 'ArrowLeft') lbPrev();
  if (e.key === 'Escape') closeLightbox();
});

// Close on backdrop click
document.addEventListener('DOMContentLoaded', function() {
  var lb = document.getElementById('galleryLightbox');
  if (lb) lb.addEventListener('click', function(e) { if (e.target === this) closeLightbox(); });
});



// ── COOKIE CONSENT ──
function setCookie(name, value, days) {
  var expires = new Date(Date.now() + days*864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
}
function getCookie(name) {
  return document.cookie.split('; ').reduce(function(r, v) {
    var parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, null);
}
function acceptCookies() {
  setCookie('tkb_cookie_consent', 'accepted', 365);
  hideCookieBanner();
}
function declineCookies() {
  setCookie('tkb_cookie_consent', 'declined', 365);
  hideCookieBanner();
}
function hideCookieBanner() {
  var banner = document.getElementById('cookieBanner');
  if (banner) { banner.classList.remove('show'); }
}
window.tkbOpenCookiePrefs = function() {
  var banner = document.getElementById('cookieBanner');
  if (banner) { banner.classList.add('show'); }
};
// Show banner if no consent yet
document.addEventListener('DOMContentLoaded', function() {
  if (!getCookie('tkb_cookie_consent')) {
    setTimeout(function() {
      var banner = document.getElementById('cookieBanner');
      if (banner) banner.classList.add('show');
    }, 1500);
  }
});


// ════════════════════════════════════════════
// PREMIUM SCROLL ANIMATIONS
// IntersectionObserver triggers all effects
// ════════════════════════════════════════════
(function() {
  var threshold = 0.15;

  // ── Unified observer for all reveal classes ──
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: threshold, rootMargin: '0px 0px -40px 0px' });

  // ── Stagger observer — triggers parent, children get delays via CSS ──
  var staggerObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        // Find all stagger/pop children in the parent section
        var parent = entry.target.closest('section') || entry.target.parentElement;
        var siblings = parent ? parent.querySelectorAll('.stagger-child, .pop-child') : [entry.target];
        siblings.forEach(function(el, i) {
          setTimeout(function() {
            el.classList.add('in-view');
          }, i * 80);
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  // ── Hero blur words — fire immediately on load ──
  function initHeroBlur() {
    var words = document.querySelectorAll('.hero-title .blur-word');
    if (!words.length) return;
    // Small delay so hero renders first
    setTimeout(function() {
      words.forEach(function(w, i) {
        w.classList.add('in-view');
      });
    }, 200);
  }

  // ── Curtain observer ──
  var curtainObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        curtainObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  // ── Register all elements ──
  document.addEventListener('DOMContentLoaded', function() {
    // Reveal + fade (sections, cards, subs)
    document.querySelectorAll('.reveal, .reveal-r, .reveal-l').forEach(function(el) {
      revealObserver.observe(el);
    });

    // Text mask reveal
    document.querySelectorAll('.txt-reveal').forEach(function(el) {
      revealObserver.observe(el);
    });

    // Gold line draw
    document.querySelectorAll('.gold-line').forEach(function(el) {
      revealObserver.observe(el);
    });

    // Stagger + pop — observe only the first child to trigger the group
    var staggerGroups = {};
    document.querySelectorAll('.stagger-child, .pop-child').forEach(function(el) {
      var parent = el.closest('section') || el.parentElement;
      var key = parent ? (parent.id || parent.className.slice(0,20)) : 'root';
      if (!staggerGroups[key]) {
        staggerGroups[key] = true;
        staggerObserver.observe(el);
      }
    });

    // Curtain overlays
    document.querySelectorAll('.curtain-overlay').forEach(function(el) {
      curtainObserver.observe(el);
    });

    // Hero blur — fire on load
    initHeroBlur();
  });
})();


// ════════════════════════════════════════








// Initialise plate display
document.addEventListener('DOMContentLoaded', function() {
  updatePlate();
});

// ══════════════════════════════════════════════════════
// PAYSTACK PAYMENT INTEGRATION
// Public key is safe in frontend — secret key is in
// Netlify env vars only (netlify/functions/verify-payment.js)
// ══════════════════════════════════════════════════════
const PAYSTACK_PUBLIC_KEY = 'pk_live_REPLACE_WITH_YOUR_PUBLIC_KEY';

function initiatePayment(orderData) {
  // Collect customer info first
  const customerName  = prompt('Your full name:');
  const customerPhone = prompt('Your WhatsApp number (e.g. 08012345678):');
  const customerEmail = prompt('Your email (optional — press Enter to skip):') || '';
  const deliveryType  = confirm('Click OK for Delivery, Cancel for Pickup') ? 'delivery' : 'pickup';
  const deliveryAddress = deliveryType === 'delivery'
    ? prompt('Your delivery address:')
    : null;

  if (!customerName || !customerPhone) {
    alert('Please enter your name and phone number to continue.');
    return;
  }

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: customerEmail || `${customerPhone}@tinuskitchen.com`,
    amount: orderData.total * 100, // Paystack uses kobo
    currency: 'NGN',
    ref: 'TKB-' + Date.now(),
    metadata: {
      custom_fields: [
        { display_name: 'Customer Name',  variable_name: 'customer_name',  value: customerName },
        { display_name: 'Phone Number',   variable_name: 'customer_phone', value: customerPhone },
        { display_name: 'Delivery Type',  variable_name: 'delivery_type',  value: deliveryType },
      ]
    },
    callback: function(response) {
      // Payment successful on Paystack side
      // Now verify on our secure backend and save to Supabase
      verifyAndSaveOrder({
        reference: response.reference,
        customerName,
        customerPhone,
        customerEmail,
        items: orderData.items,
        deliveryType,
        deliveryAddress,
      });
    },
    onClose: function() {
      console.log('Payment popup closed');
    }
  });

  handler.openIframe();
}

async function verifyAndSaveOrder(payload) {
  // Show loading state
  const btn = document.querySelector('.cart-checkout-btn');
  if (btn) { btn.textContent = 'Verifying payment...'; btn.disabled = true; }

  try {
    const res = await fetch('/.netlify/functions/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: payload.reference,
        orderData: payload
      })
    });

    const data = await res.json();

    if (data.success) {
      // Clear cart
      cart = [];
      renderCart();

      // Show success with order tracking
      showOrderConfirmation(data.orderId, payload.reference);
    } else {
      alert('Payment verification failed. Please contact us on WhatsApp.');
    }
  } catch (err) {
    console.error('Order save error:', err);
    alert('Something went wrong. Please send us your payment reference on WhatsApp: ' + payload.reference);
  } finally {
    if (btn) { btn.textContent = 'Checkout'; btn.disabled = false; }
  }
}

function showOrderConfirmation(orderId, reference) {
  const toast = document.getElementById('orderSuccessToast');
  if (toast) {
    const toastTitle = toast.querySelector('.toast-title');
    const toastSub   = toast.querySelector('.toast-sub');
    if (toastTitle) toastTitle.textContent = 'Order Placed!';
    if (toastSub)   toastSub.innerHTML =
      `Your order is confirmed.<br/>Reference: <strong>${reference}</strong><br/>
       <a href="/order-status.html?ref=${reference}" style="color:var(--gold)">Track your order →</a>`;
    toast.classList.add('show');
    launchConfetti();
    setTimeout(() => toast.classList.remove('show'), 8000);
  }
}

async function checkOrderStatus(reference) {
  try {
    const res = await fetch(`/.netlify/functions/order-status?reference=${reference}`);
    const data = await res.json();
    return data.order;
  } catch (err) {
    console.error('Status check error:', err);
    return null;
  }
}
