// Constants & Configuration
const TKB_WHATSAPP_PHONE = '2348162918036';

// Custom Bistro UI Modal System (Zero Native Alerts)
function ensureTkbAlertOverlay() {
  let overlay = document.getElementById('tkbAlertOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'tkb-alert-overlay';
    overlay.id = 'tkbAlertOverlay';
    overlay.onclick = closeTkbAlert;
    overlay.innerHTML = `
      <div class="tkb-alert-card" onclick="event.stopPropagation()">
        <div class="tkb-alert-badge" id="tkbAlertIcon">🍲</div>
        <h3 class="tkb-alert-title" id="tkbAlertTitle">Tinu's Kitchen Bistro</h3>
        <p class="tkb-alert-msg" id="tkbAlertMsg"></p>
        <div class="tkb-alert-actions" id="tkbAlertActions">
          <button type="button" class="btn-tkb-alert-ok" id="tkbAlertOkBtn" onclick="closeTkbAlert()">Understood</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  return overlay;
}

function showTkbAlert(message, title, icon, onConfirm) {
  const overlay = ensureTkbAlertOverlay();
  const msgEl = document.getElementById('tkbAlertMsg');
  const titleEl = document.getElementById('tkbAlertTitle');
  const iconEl = document.getElementById('tkbAlertIcon');
  const actionsEl = document.getElementById('tkbAlertActions');

  if (msgEl) msgEl.innerHTML = message || '';
  if (titleEl) titleEl.textContent = title || "Tinu's Kitchen Bistro";
  if (iconEl) iconEl.textContent = icon || '🍲';

  if (actionsEl) {
    actionsEl.innerHTML = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-tkb-alert-ok';
    btn.textContent = 'Understood';
    btn.onclick = function() {
      closeTkbAlert();
      if (typeof onConfirm === 'function') onConfirm();
    };
    actionsEl.appendChild(btn);
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showTkbConfirm(message, title, onConfirm, onCancel, icon) {
  const overlay = ensureTkbAlertOverlay();
  const msgEl = document.getElementById('tkbAlertMsg');
  const titleEl = document.getElementById('tkbAlertTitle');
  const iconEl = document.getElementById('tkbAlertIcon');
  const actionsEl = document.getElementById('tkbAlertActions');

  if (msgEl) msgEl.innerHTML = message || '';
  if (titleEl) titleEl.textContent = title || "Tinu's Kitchen Bistro";
  if (iconEl) iconEl.textContent = icon || '🍲';

  if (actionsEl) {
    actionsEl.innerHTML = '';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn-tkb-alert-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = function() {
      closeTkbAlert();
      if (typeof onCancel === 'function') onCancel();
    };

    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'btn-tkb-alert-ok';
    confirmBtn.textContent = 'Confirm';
    confirmBtn.onclick = function() {
      closeTkbAlert();
      if (typeof onConfirm === 'function') onConfirm();
    };

    actionsEl.appendChild(cancelBtn);
    actionsEl.appendChild(confirmBtn);
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeTkbAlert() {
  const overlay = document.getElementById('tkbAlertOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Global hijack for browser alerts
window.alert = function(msg) {
  showTkbAlert(msg);
};

let reviewStarValue = 0;
const ratingDescriptors = {
  1: '1/5 — Needs Improvement 😕',
  2: '2/5 — Fair, could be better 🙂',
  3: '3/5 — Good & Satisfying 😋',
  4: '4/5 — Really Delicious! 👍',
  5: '5/5 — Exceptional / World-Class! 🌟'
};

function setReviewStar(n) {
  reviewStarValue = n;
  updateStarIcons(n);
  const descEl = document.getElementById('starRatingText');
  if (descEl && ratingDescriptors[n]) {
    descEl.textContent = ratingDescriptors[n];
    descEl.style.color = '#D49B28';
    descEl.style.fontWeight = '700';
  }
}

function previewReviewStar(n) {
  updateStarIcons(n);
  const descEl = document.getElementById('starRatingText');
  if (descEl && ratingDescriptors[n]) {
    descEl.textContent = ratingDescriptors[n];
  }
}

function resetPreviewStar() {
  updateStarIcons(reviewStarValue);
  const descEl = document.getElementById('starRatingText');
  if (descEl) {
    if (reviewStarValue && ratingDescriptors[reviewStarValue]) {
      descEl.textContent = ratingDescriptors[reviewStarValue];
      descEl.style.color = '#D49B28';
    } else {
      descEl.textContent = 'Tap a star to rate';
      descEl.style.color = 'var(--muted)';
      descEl.style.fontWeight = '500';
    }
  }
}

function updateStarIcons(n) {
  document.querySelectorAll('#starRating span').forEach((s, i) => {
    const isFilled = i < n;
    s.textContent = '★';
    s.style.color = isFilled ? '#D49B28' : '#D1C9BE';
    s.style.transform = isFilled ? 'scale(1.18)' : 'scale(1)';
    s.style.filter = isFilled ? 'drop-shadow(0 2px 6px rgba(212,155,40,0.35))' : 'none';
  });
}

function selectReviewDish(dishName) {
  const dishInput = document.getElementById('reviewDish');
  if (dishInput) {
    dishInput.value = dishName;
    dishInput.focus();
    // highlight selected chip
    document.querySelectorAll('.rf-chip').forEach(c => {
      c.classList.toggle('active', c.textContent.includes(dishName.split(' ')[0]));
    });
  }
}

function submitReview() {
  const name = document.getElementById('reviewName').value.trim();
  const dish = document.getElementById('reviewDish').value.trim();
  const review = document.getElementById('reviewText').value.trim();
  const stars = '★'.repeat(reviewStarValue) + '☆'.repeat(5 - reviewStarValue);

  if (!name) {
    showTkbAlert('Please enter your name 😊', 'Review Submission', '✍️');
    document.getElementById('reviewName').focus();
    return;
  }
  if (!reviewStarValue) {
    showTkbAlert('Please select a star rating ⭐', 'Review Submission', '⭐');
    return;
  }
  if (!review) {
    showTkbAlert('Please write a short review 📝', 'Review Submission', '📝');
    document.getElementById('reviewText').focus();
    return;
  }

  const msg = '⭐ NEW CUSTOMER REVIEW\n\n👤 Name: ' + name + '\n🍽️ Dish: ' + (dish || 'Not specified') + '\n' + stars + ' (' + reviewStarValue + '/5 stars)\n\n💬 Review:\n"' + review + '"\n\n📍 Sent from Tinu\'s Kitchen Bistro website';
  window.open(`https://wa.me/${TKB_WHATSAPP_PHONE}?text=` + encodeURIComponent(msg), '_blank');
}


// Navbar scroll
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60));

// Mobile menu
function closeMobile() { } // mobile menu handled by new nav


// Scroll reveal
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) e.target.classList.add('visible');
}), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el => io.observe(el));

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

function getDishImage(key, name) {
  // 1. Try finding image from triggering card in DOM
  const btn = document.querySelector(`[data-cart-key="${key}"]`);
  if (btn) {
    const card = btn.closest('.mcard, .meal-card, .menu-item');
    if (card) {
      const img = card.querySelector('img');
      if (img && img.getAttribute('src')) {
        return img.getAttribute('src');
      }
    }
  }

  // 2. Lookup table by key/name
  const k = (key || '').toLowerCase();
  const n = (name || '').toLowerCase();

  if (k.includes('turkey') || n.includes('turkey')) return 'images/jollof-rice-with-turkey.jpeg';
  if (k.includes('alfredo') || n.includes('alfredo')) return 'images/chicken-alfredo-pasta.jpeg';
  if (k.includes('beefy') || n.includes('beefy')) return 'images/beefy-jollof-pasta.jpeg';
  if (k.includes('pasta') || n.includes('pasta') || k.includes('spaghetti') || n.includes('spaghetti')) return 'images/stir-fried-pasta-with-sausage-and-vegeta.jpeg';
  if (k.includes('signature') || n.includes('signature')) return 'images/tkb-signature-rice.jpeg';
  if (k.includes('croaker') || n.includes('croaker') || k.includes('fish') || n.includes('fish')) return 'images/croaker-fish.jpeg';
  if (k.includes('salad') || n.includes('salad')) return 'images/chicken-salad.jpeg';
  if (k.includes('sandwich') || n.includes('sandwich') || k.includes('wrap') || n.includes('wrap')) return 'images/classic-chicken-sandwich-and-milkshake-c.jpeg';
  if (k.includes('milkshake') || n.includes('shake') || k.includes('oreo')) return 'images/oreo-milkshake.jpeg';
  if (k.includes('soup') || n.includes('soup')) return 'images/pepper-soup-with-rice.jpeg';
  if (k.includes('chops') || n.includes('chops') || k.includes('plantain') || n.includes('yam')) return 'images/small-chops-platter-puff-puff--spring-ro.jpeg';
  if (k.includes('jollof') || n.includes('jollof') || k.includes('rice') || n.includes('rice')) return 'images/jollof-rice.jpeg';

  return 'images/jollof-rice.jpeg';
}

function addToCart(key, name, priceRaw) {
  const price = parsePrice(priceRaw);
  const img = getDishImage(key, name);
  if (cart[key]) {
    cart[key].qty += 1;
    if (!cart[key].img) cart[key].img = img;
  } else {
    cart[key] = { name, price, priceRaw, qty: 1, img };
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
  const navBadge = document.getElementById('navCartBadge');
  const fabLabel = document.getElementById('cartFabLabel');
  const keys = Object.keys(cart);

  // Badge count
  const totalQty = keys.reduce((s, k) => s + cart[k].qty, 0);
  if (badge) badge.textContent = totalQty;
  if (navBadge) navBadge.textContent = totalQty;

  // Total price
  const totalPrice = keys.reduce((s, k) => s + cart[k].price * cart[k].qty, 0);
  totalEl.textContent = '₦' + totalPrice.toLocaleString();
  fabLabel.textContent = totalQty === 1 ? '1 item' : totalQty + ' items';

  if (keys.length === 0) {
    list.innerHTML = `<div class="cart-empty-state"><div class="empty-icon">🍽️</div><h4>Your order is empty</h4><p>Browse the menu and tap <strong style="color:var(--red);font-weight:600;">Add to Cart</strong> on any dish.</p></div>`;
    return;
  }

  list.innerHTML = keys.map(k => {
    const item = cart[k];
    const lineTotal = item.price * item.qty;
    const itemImg = item.img || getDishImage(k, item.name);
    return `
      <div class="cart-item">
        <div class="cart-item-thumb">
          <img src="${itemImg}" alt="${item.name}" loading="lazy" />
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name" title="${item.name}">${item.name}</div>
          <div class="cart-item-price">₦${lineTotal.toLocaleString()}</div>
        </div>
        <div class="cart-qty">
          <button class="cart-qty-btn" onclick="changeQty('${k}',-1)" aria-label="Decrease quantity">−</button>
          <span class="cart-qty-num">${item.qty}</span>
          <button class="cart-qty-btn" onclick="changeQty('${k}',1)" aria-label="Increase quantity">+</button>
        </div>
        <button class="cart-remove-btn" onclick="removeFromCart('${k}')" title="Remove item" aria-label="Remove item">✕</button>
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
  const total = keys.reduce((s, k) => s + cart[k].price * cart[k].qty, 0);
  msg += `\n*Total: ₦${total.toLocaleString()}*\n\nPlease confirm availability and my delivery/pickup options. Thank you! 🙏`;
  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/2348162918036?text=${encoded}`, '_blank');
}


// ── CASCADE ANIMATION FOR MENU TABS ──
const _origSwitchTab = switchTab;
switchTab = function (name) {
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
      { label: 'Big', price: 6000 },
      { label: 'Medium', price: 4000 },
      { label: 'Small', price: 3000 }
    ]
  },
  'beef': {
    name: 'Beef',
    options: [
      { label: 'Big', price: 1000 },
      { label: 'Small', price: 500 }
    ]
  },
  'white_ponmo': {
    name: 'White Ponmo',
    options: [
      { label: 'Big', price: 1000 },
      { label: 'Small', price: 500 }
    ]
  },
  'milkshake___please_specify_str': {
    name: 'Milkshake',
    options: [
      { label: '🍓 Strawberry', price: 6000 },
      { label: '🍦 Vanilla', price: 6000 },
      { label: '🍪 Oreos', price: 8000 }
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
  const key = fullName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 32);

  // Add to cart with correct qty
  const optImg = getDishImage(key, optState.dishBase);
  if (cart[key]) {
    cart[key].qty += optState.qty;
    if (!cart[key].img) cart[key].img = optImg;
  } else {
    cart[key] = { name: fullName, price: opt.price, priceRaw: String(opt.price), qty: optState.qty, img: optImg };
  }
  renderCart();
  showCartFab();
  closeOptModal();

  // Flash the original trigger button
  document.querySelectorAll('[data-cart-key]').forEach(btn => {
    const bKey = btn.dataset.cartKey;
    if (findMultiItem(bKey) && bKey.substring(0, 6) === key.substring(0, 6)) {
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
addToCart = function (key, name, price) {
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
  { match: (h, m, t) => t === 'sweet', emoji: '🥤', dish: 'Oreo Milkshake', desc: 'Rich, creamy and absolutely indulgent — our Oreo milkshake is a treat your tastebuds deserve right now.', price: '₦8,000', wa: 'Oreo%20Milkshake%20(Oreos)' },
  { match: (h, m, t) => m === 'fresh' && t !== 'sweet', emoji: '', dish: 'Chicken Salad', desc: 'Crisp greens, seasoned chicken, sweet corn and a light dressing — fresh, filling and absolutely guilt-free.', price: '₦6,000', wa: 'Chicken%20Salad' },
  { match: (h, m, t) => m === 'treat', emoji: '🍝', dish: 'Chicken Alfredo Pasta', desc: 'Creamy, rich and deeply satisfying — our premium Alfredo is the ultimate self-care meal. You deserve this.', price: '₦15,000', wa: 'Chicken%20Alfredo%20Pasta' },
  { match: (h, m, t) => m === 'bold' && h === 'starving', emoji: '🐟', dish: 'Croaker Fish + Jollof Rice', desc: 'A whole perfectly seasoned Croaker on a bed of our smoky Jollof — bold, rich and deeply Lagos. Made for the truly hungry.', price: '₦3,500+', wa: 'Croaker%20Fish%20%2B%20Jollof%20Rice%20Combo' },
  { match: (h, m, t) => m === 'bold', emoji: '🌶️', dish: 'Asun Rice', desc: 'Our boldly spiced Asun rice brings the fire — smoky, peppery and deeply satisfying for those who like it hot.', price: '₦2,000', wa: 'Asun%20Rice' },
  { match: (h, m, t) => h === 'starving' && m === 'comfort', emoji: '🍲', dish: 'Egusi Soup + Poundo Yam', desc: 'The ultimate Nigerian comfort combo — rich, nutty Egusi soup paired with smooth Poundo yam. Like a warm hug from home.', price: '₦800 + ₦600', wa: 'Egusi%20Soup%20%2B%20Poundo%20Yam' },
  { match: (h, m, t) => h === 'starving', emoji: '🍛', dish: 'TKB Signature Rice Combo', desc: 'Our house special — packed with flavour, massive in portion. When you need to eat BIG, this is the one.', price: '₦2,000', wa: 'TKB%20Signature%20Rice' },
  { match: (h, m, t) => h === 'light' && m === 'comfort', emoji: '🌮', dish: 'Yamarita', desc: 'Light, crispy and comforting — Yamarita is the perfect snack-level meal when you want something warm without the heaviness.', price: '₦1,000', wa: 'Yamarita' },
  { match: () => true, emoji: '🍛', dish: 'Jollof Rice Combo', desc: 'You can never go wrong with the Lagos classic — our smoky, well-seasoned Jollof with your choice of protein. Always satisfying.', price: '₦2,500', wa: 'Jollof%20Rice%20Combo' },
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
  document.getElementById('qStep' + (step + 1)).classList.add('active');
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
  document.getElementById('qResBtn').href = `https://wa.me/2348162918036?text=Hi%20Tinu%27s%20Kitchen%20Bistro!%20%F0%9F%8D%BD%EF%B8%8F%20I%20took%20the%20food%20quiz%20and%20my%20perfect%20meal%20is%3A%20*${result.wa.replace(/%20/g, ' ')}*%20(${result.price}).%20Is%20it%20available%20now%3F%20I%27d%20like%20to%20order%20please!`;
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
  canvas.style.zIndex = '100005';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const pieces = [];
  const colors = ['#C21B17', '#D49B28', '#10B981', '#FFFFFF', '#F59E0B', '#3B82F6', '#EC4899'];

  // 160 energetic particles bursting upwards and spreading across screen
  const cx = canvas.width / 2;
  const cy = canvas.height * 0.4;
  for (let i = 0; i < 160; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 4;
    pieces.push({
      x: cx + (Math.random() * 60 - 30),
      y: cy + (Math.random() * 60 - 30),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (Math.random() * 6 + 4),
      gravity: 0.32,
      r: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      tiltAngle: Math.random() * Math.PI,
      tiltSpeed: Math.random() * 0.12 + 0.04,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
      opacity: 1,
      decay: Math.random() * 0.004 + 0.003
    });
  }

  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let aliveCount = 0;

    pieces.forEach(p => {
      if (p.opacity <= 0.01) return;
      aliveCount++;

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.tiltAngle);

      if (p.shape === 'rect') {
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.65);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.985;
      p.tiltAngle += p.tiltSpeed;
      p.opacity -= p.decay;
    });

    if (aliveCount > 0) {
      requestAnimationFrame(drawConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    }
  }

  drawConfetti();
}

// Hook into sendOrderOnWhatsApp
const _origSendOrder = sendOrderOnWhatsApp;
sendOrderOnWhatsApp = function () {
  _origSendOrder();
  setTimeout(launchConfetti, 600);
};

// ========================================================
// FEATURE D — COUNTDOWN TIMER (resets to 9pm daily)
// ========================================================





// ── STICKY ORDER BAR ──
(function () {
  const bar = document.getElementById('stickyOrderBar');
  if (!bar) return;
  let shown = false;
  window.addEventListener('scroll', function () {
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
// Gentle attention indicator after 6 seconds (unobtrusive UX)
setTimeout(function () {
  const dot = document.querySelector('.wa-notif-dot');
  const toggleBtn = document.getElementById('waChatToggle');
  if (dot && !waChatOpen) dot.style.display = 'flex';
  if (toggleBtn && !waChatOpen) {
    toggleBtn.style.animation = 'waPulse 1.8s ease-in-out 2';
    setTimeout(() => { if (toggleBtn) toggleBtn.style.animation = ''; }, 3600);
  }
}, 6000);
// Close when clicking outside
document.addEventListener('click', function (e) {
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
  const name = (document.getElementById('rfName').value || '').trim();
  const dish = (document.getElementById('rfDish').value || '').trim();
  const review = (document.getElementById('rfText').value || '').trim();
  const stars = '★'.repeat(rfStarValue) + '☆'.repeat(5 - rfStarValue);

  if (!name) { showTkbAlert('Please enter your name 😊', 'Review', '✍️'); return; }
  if (!rfStarValue) { showTkbAlert('Please tap a star rating ⭐', 'Review', '⭐'); return; }
  if (!review) { showTkbAlert('Please write a short review 📝', 'Review', '📝'); return; }

  const msg = '⭐ NEW CUSTOMER REVIEW\n\n'
    + '👤 Name: ' + name + '\n'
    + '🍽️ Dish: ' + (dish || 'Not specified') + '\n'
    + stars + ' (' + rfStarValue + '/5 stars)\n\n'
    + '💬 Review:\n"' + review + '"\n\n'
    + '📍 Sent from Tinu\'s Kitchen Bistro website';

  window.open(`https://wa.me/${TKB_WHATSAPP_PHONE}?text=` + encodeURIComponent(msg), '_blank');
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

// Private Dining & Event Reservations
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
  const name = (document.getElementById('resName').value || '').trim();
  const phone = (document.getElementById('resPhone').value || '').trim();
  const date = (document.getElementById('resDate').value || '').trim();
  const time = (document.getElementById('resTime').value || '').trim();
  const budget = (document.getElementById('resBudget').value || '').trim();
  const note = (document.getElementById('resNote').value || '').trim();

  if (!name) { showTkbAlert('Please enter your full name 😊', 'Reservation', '👤'); return; }
  if (!phone) { showTkbAlert('Please enter your phone number 📞', 'Reservation', '📞'); return; }
  if (!resOccasion) { showTkbAlert('Please select an occasion above 🎉', 'Reservation', '🎉'); return; }
  if (!date) { showTkbAlert('Please select your preferred date', 'Reservation', '📅'); return; }
  if (!time) { showTkbAlert('Please select a time slot', 'Reservation', '⏰'); return; }

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

  window.open(`https://wa.me/${TKB_WHATSAPP_PHONE}?text=` + encodeURIComponent(msg), '_blank');
}

// Navigation Menu Toggle
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
  setTimeout(function () {
    var el = document.getElementById(sectionId);
    if (el) {
      var top = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }, 320);
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeNav();
});

// Hero Background Slideshow & Interactive Controls
let heroSlideIndex = 0;
let heroSlideInterval = null;

function updateHeroSlide(index) {
  const slides = document.querySelectorAll('.hero-bg-slide');
  const counterEl = document.getElementById('heroSlideNum');
  if (!slides.length) return;

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });

  heroSlideIndex = index;
  if (counterEl) {
    counterEl.textContent = String(index + 1).padStart(2, '0');
  }
}

function nextHeroSlide() {
  const slides = document.querySelectorAll('.hero-bg-slide');
  if (!slides.length) return;
  const nextIdx = (heroSlideIndex + 1) % slides.length;
  updateHeroSlide(nextIdx);
  resetHeroTimer();
}

function prevHeroSlide() {
  const slides = document.querySelectorAll('.hero-bg-slide');
  if (!slides.length) return;
  const prevIdx = (heroSlideIndex - 1 + slides.length) % slides.length;
  updateHeroSlide(prevIdx);
  resetHeroTimer();
}

function resetHeroTimer() {
  if (heroSlideInterval) clearInterval(heroSlideInterval);
  heroSlideInterval = setInterval(function () {
    const slides = document.querySelectorAll('.hero-bg-slide');
    if (!slides.length) return;
    const nextIdx = (heroSlideIndex + 1) % slides.length;
    updateHeroSlide(nextIdx);
  }, 4500);
}

// Dynamic Sharp Modern Scroll Blur & Parallax for Hero
function initHeroScrollBlur() {
  const hero = document.getElementById('hero');
  const mediaWrap = document.getElementById('heroMediaWrapper');
  const navWrapper = document.getElementById('navWrapper');
  const nav = document.getElementById('navbar');
  if (!hero || !mediaWrap) return;

  let ticking = false;
  function onScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Floating navbar scrolled state
    if (navWrapper) navWrapper.classList.toggle('scrolled', scrollY > 30);
    if (nav) nav.classList.toggle('scrolled', scrollY > 30);

    // Hero progressive lens blur & depth
    const heroH = hero.offsetHeight || window.innerHeight;
    if (scrollY <= heroH * 1.25) {
      const progress = Math.min(Math.max(scrollY / (heroH * 0.75), 0), 1);
      // Sharp modern lens blur: 0px -> 14px progressive blur
      const blurPx = (progress * 14).toFixed(1);
      // Cinematic scale and translate
      const scaleVal = (1 + progress * 0.08).toFixed(3);
      const darkenVal = (progress * 0.32).toFixed(2);

      mediaWrap.style.setProperty('--scroll-blur', blurPx + 'px');
      mediaWrap.style.setProperty('--scroll-scale', scaleVal);
      mediaWrap.style.setProperty('--scroll-darken', darkenVal);
      mediaWrap.style.setProperty('--scroll-y', scrollY + 'px');
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();
}

// Initialize slideshow and scroll effects
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    resetHeroTimer();
    initHeroScrollBlur();
  });
} else {
  resetHeroTimer();
  initHeroScrollBlur();
}

document.getElementById('copyrightYear') && (document.getElementById('copyrightYear').textContent = new Date().getFullYear());
// Set reservation date minimum to today
(function () {
  var dateEl = document.getElementById('resDate');
  if (dateEl) {
    var today = new Date().toISOString().split('T')[0];
    dateEl.setAttribute('min', today);
  }
})();


// ── GALLERY LIGHTBOX ──
let LB_IMGS = [];
let lbIndex = 0;
document.addEventListener('DOMContentLoaded', function () {
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
document.addEventListener('keydown', function (e) {
  const lb = document.getElementById('galleryLightbox');
  if (!lb || !lb.classList.contains('open')) return;
  if (e.key === 'ArrowRight') lbNext();
  if (e.key === 'ArrowLeft') lbPrev();
  if (e.key === 'Escape') closeLightbox();
});

// Close on backdrop click
document.addEventListener('DOMContentLoaded', function () {
  var lb = document.getElementById('galleryLightbox');
  if (lb) lb.addEventListener('click', function (e) { if (e.target === this) closeLightbox(); });
});



// ── COOKIE CONSENT ──
function setCookie(name, value, days) {
  var expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
}
function getCookie(name) {
  return document.cookie.split('; ').reduce(function (r, v) {
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
window.tkbOpenCookiePrefs = function () {
  var banner = document.getElementById('cookieBanner');
  if (banner) { banner.classList.add('show'); }
};
// Show banner if no consent yet
document.addEventListener('DOMContentLoaded', function () {
  if (!getCookie('tkb_cookie_consent')) {
    setTimeout(function () {
      var banner = document.getElementById('cookieBanner');
      if (banner) banner.classList.add('show');
    }, 1500);
  }
});


// Scroll Animations (IntersectionObserver)
(function () {
  var threshold = 0.15;

  // ── Unified observer for all reveal classes ──
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: threshold, rootMargin: '0px 0px -40px 0px' });

  // ── Stagger observer — triggers parent, children get delays via CSS ──
  var staggerObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        // Find all stagger/pop children in the parent section
        var parent = entry.target.closest('section') || entry.target.parentElement;
        var siblings = parent ? parent.querySelectorAll('.stagger-child, .pop-child') : [entry.target];
        siblings.forEach(function (el, i) {
          setTimeout(function () {
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
    setTimeout(function () {
      words.forEach(function (w, i) {
        w.classList.add('in-view');
      });
    }, 200);
  }

  // ── Curtain observer ──
  var curtainObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        curtainObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  // ── Register all elements ──
  document.addEventListener('DOMContentLoaded', function () {
    // Reveal + fade (sections, cards, subs)
    document.querySelectorAll('.reveal, .reveal-r, .reveal-l').forEach(function (el) {
      revealObserver.observe(el);
    });

    // Text mask reveal
    document.querySelectorAll('.txt-reveal').forEach(function (el) {
      revealObserver.observe(el);
    });

    // Gold line draw
    document.querySelectorAll('.gold-line').forEach(function (el) {
      revealObserver.observe(el);
    });

    // Stagger + pop — observe only the first child to trigger the group
    var staggerGroups = {};
    document.querySelectorAll('.stagger-child, .pop-child').forEach(function (el) {
      var parent = el.closest('section') || el.parentElement;
      var key = parent ? (parent.id || parent.className.slice(0, 20)) : 'root';
      if (!staggerGroups[key]) {
        staggerGroups[key] = true;
        staggerObserver.observe(el);
      }
    });

    // Curtain overlays
    document.querySelectorAll('.curtain-overlay').forEach(function (el) {
      curtainObserver.observe(el);
    });

    // Hero blur — fire on load
    initHeroBlur();
  });
})();

// Safe initialisation check
document.addEventListener('DOMContentLoaded', function () {
  if (typeof updatePlate === 'function') {
    updatePlate();
  }
});

// Paystack Checkout & Delivery Zones
const PAYSTACK_PUBLIC_KEY = 'pk_test_0060b4496bc8532d9fcb9b26ff1c67a406dc700f';

// Default starting delivery zones & prices
const DEFAULT_DELIVERY_ZONES = [
  { id: 'zone_1', name: 'Nnobi & outside IPaye', fee: 1000 },
  { id: 'zone_2', name: 'Inside ipaye', fee: 1500 },
  { id: 'zone_3', name: 'Iba housing', fee: 1500 },
  { id: 'zone_4', name: 'Shonibare / peace Estate', fee: 1500 },
  { id: 'zone_5', name: 'Iyana school', fee: 2000 },
  { id: 'zone_6', name: 'Agboroko', fee: 2000 },
  { id: 'zone_7', name: 'Iba Junction', fee: 2000 },
  { id: 'zone_8', name: 'Aratumi', fee: 2000 },
  { id: 'zone_9', name: 'pakunola/mosadolohun/taleloju', fee: 2000 },
  { id: 'zone_10', name: 'Igbo elerin', fee: 2500 },
  { id: 'zone_11', name: 'PPL', fee: 2500 },
  { id: 'zone_12', name: 'Post Serice', fee: 2500 },
  { id: 'zone_13', name: 'Iyana Isashi', fee: 3000 },
  { id: 'zone_14', name: 'Obadore', fee: 3000 },
  { id: 'zone_15', name: 'Akesan Axis', fee: 3000 }
];

let currentDeliveryType = 'delivery';
let currentSelectedZone = null;
let currentDeliveryFee = 0;

function getStoreDeliveryZones() {
  try {
    const cached = localStorage.getItem('tkb_delivery_zones');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length >= 10) {
        return parsed.filter(z => z.active !== false);
      }
    }
  } catch (e) { }
  return DEFAULT_DELIVERY_ZONES;
}

function populateDeliveryZones() {
  const select = document.getElementById('chkDeliveryZone');
  if (!select) return;

  const zones = getStoreDeliveryZones();
  const currentVal = select.value;
  select.innerHTML = '<option value="" disabled selected>Choose your delivery area...</option>' +
    zones.map(z => `<option value="${z.name}" data-fee="${z.fee}">📍 ${z.name} — ₦${Number(z.fee).toLocaleString()}</option>`).join('');

  if (currentVal) select.value = currentVal;
}

function handleDeliveryZoneSelect(zoneName) {
  const select = document.getElementById('chkDeliveryZone');
  const selectedOpt = select ? select.options[select.selectedIndex] : null;

  if (selectedOpt && selectedOpt.dataset.fee) {
    currentSelectedZone = {
      name: zoneName,
      fee: Number(selectedOpt.dataset.fee) || 0
    };
    currentDeliveryFee = currentSelectedZone.fee;
  } else {
    currentSelectedZone = null;
    currentDeliveryFee = 0;
  }

  updateCheckoutTotals();
}

function updateCheckoutTotals() {
  const keys = Object.keys(cart);
  const itemsSubtotal = keys.reduce((s, k) => s + cart[k].price * cart[k].qty, 0);
  const deliveryFee = currentDeliveryType === 'delivery' ? currentDeliveryFee : 0;
  const grandTotal = itemsSubtotal + deliveryFee;

  const subtotalEl = document.getElementById('chkSummarySubtotal');
  const feeRow = document.getElementById('chkDeliveryFeeRow');
  const feeNameEl = document.getElementById('chkSelectedZoneName');
  const feeValEl = document.getElementById('chkSummaryDeliveryFee');
  const totalEl = document.getElementById('chkSummaryTotal');
  const btnAmt = document.getElementById('chkBtnAmount');

  if (subtotalEl) subtotalEl.textContent = '₦' + itemsSubtotal.toLocaleString();

  if (feeRow) {
    if (currentDeliveryType === 'delivery' && currentSelectedZone) {
      feeRow.style.display = 'flex';
      if (feeNameEl) feeNameEl.textContent = currentSelectedZone.name;
      if (feeValEl) feeValEl.textContent = '+₦' + deliveryFee.toLocaleString();
    } else {
      feeRow.style.display = 'none';
    }
  }

  const formattedGrand = '₦' + grandTotal.toLocaleString();
  if (totalEl) totalEl.textContent = formattedGrand;
  if (btnAmt) btnAmt.textContent = formattedGrand;
}

function setDeliveryType(type) {
  currentDeliveryType = type;
  const btnDelivery = document.getElementById('chkTypeDelivery');
  const btnPickup = document.getElementById('chkTypePickup');
  const zoneWrap = document.getElementById('chkZoneWrap');
  const addrWrap = document.getElementById('chkAddressWrap');
  const zoneSelect = document.getElementById('chkDeliveryZone');
  const addrInput = document.getElementById('chkDeliveryAddress');

  if (type === 'delivery') {
    if (btnDelivery) btnDelivery.classList.add('active');
    if (btnPickup) btnPickup.classList.remove('active');
    if (zoneWrap) zoneWrap.style.display = 'block';
    if (addrWrap) addrWrap.style.display = 'block';
    if (zoneSelect) zoneSelect.required = true;
    if (addrInput) addrInput.required = true;
  } else {
    if (btnDelivery) btnDelivery.classList.remove('active');
    if (btnPickup) btnPickup.classList.add('active');
    if (zoneWrap) zoneWrap.style.display = 'none';
    if (addrWrap) addrWrap.style.display = 'none';
    if (zoneSelect) zoneSelect.required = false;
    if (addrInput) addrInput.required = false;
    currentDeliveryFee = 0;
  }

  updateCheckoutTotals();
}

function openCheckoutModal() {
  const keys = Object.keys(cart);
  if (keys.length === 0) {
    showTkbAlert('Your cart is empty! Please add some delicious dishes first. 🍽️', 'Empty Cart', '🛒');
    return;
  }

  populateDeliveryZones();
  updateCheckoutTotals();

  // Restore saved contact info if available
  try {
    const savedName = localStorage.getItem('tkb_customer_name');
    const savedPhone = localStorage.getItem('tkb_customer_phone');
    const savedEmail = localStorage.getItem('tkb_customer_email');
    const savedAddr = localStorage.getItem('tkb_customer_address');
    if (savedName) document.getElementById('chkCustomerName').value = savedName;
    if (savedPhone) document.getElementById('chkCustomerPhone').value = savedPhone;
    if (savedEmail) document.getElementById('chkCustomerEmail').value = savedEmail;
    if (savedAddr) document.getElementById('chkDeliveryAddress').value = savedAddr;
  } catch (e) { }

  // Close cart drawer & open checkout modal
  closeCart();
  const overlay = document.getElementById('chkOverlay');
  const modal = document.getElementById('chkModal');
  if (overlay) overlay.classList.add('open');
  if (modal) modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  const overlay = document.getElementById('chkOverlay');
  const modal = document.getElementById('chkModal');
  if (overlay) overlay.classList.remove('open');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function submitPaystackOrder() {
  const keys = Object.keys(cart);
  if (keys.length === 0) {
    showTkbAlert('Your cart is empty.', 'Empty Cart', '🛒');
    closeCheckoutModal();
    return;
  }

  const nameInput = document.getElementById('chkCustomerName');
  const phoneInput = document.getElementById('chkCustomerPhone');
  const emailInput = document.getElementById('chkCustomerEmail');
  const zoneSelect = document.getElementById('chkDeliveryZone');
  const addrInput = document.getElementById('chkDeliveryAddress');
  const notesInput = document.getElementById('chkOrderNotes');
  const submitBtn = document.getElementById('chkSubmitBtn');

  const customerName = nameInput ? nameInput.value.trim() : '';
  const customerPhone = phoneInput ? phoneInput.value.trim() : '';
  const customerEmail = emailInput ? emailInput.value.trim() : '';
  const deliveryAddress = (currentDeliveryType === 'delivery' && addrInput) ? addrInput.value.trim() : null;
  const notes = notesInput ? notesInput.value.trim() : '';

  if (!customerName) {
    showTkbAlert('Please enter your full name.', 'Checkout Details', '👤');
    if (nameInput) nameInput.focus();
    return;
  }
  if (!customerPhone) {
    showTkbAlert('Please enter your WhatsApp phone number.', 'Checkout Details', '📞');
    if (phoneInput) phoneInput.focus();
    return;
  }
  if (currentDeliveryType === 'delivery') {
    if (!currentSelectedZone && zoneSelect && !zoneSelect.value) {
      showTkbAlert('Please choose your delivery neighborhood in the dropdown.', 'Delivery Area', '📍');
      if (zoneSelect) zoneSelect.focus();
      return;
    }
    if (!deliveryAddress) {
      showTkbAlert('Please enter your specific street address and landmark.', 'Delivery Address', '🏠');
      if (addrInput) addrInput.focus();
      return;
    }
  }

  // Save for future visits
  try {
    localStorage.setItem('tkb_customer_name', customerName);
    localStorage.setItem('tkb_customer_phone', customerPhone);
    if (customerEmail) localStorage.setItem('tkb_customer_email', customerEmail);
    if (deliveryAddress) localStorage.setItem('tkb_customer_address', deliveryAddress);
  } catch (e) { }

  const itemsSubtotal = keys.reduce((s, k) => s + cart[k].price * cart[k].qty, 0);
  const deliveryFee = currentDeliveryType === 'delivery' ? currentDeliveryFee : 0;
  const grandTotal = itemsSubtotal + deliveryFee;

  const items = keys.map(k => ({
    key: k,
    name: cart[k].name,
    qty: cart[k].qty,
    price: cart[k].price
  }));

  if (typeof PaystackPop === 'undefined') {
    showTkbAlert('Paystack is temporarily unavailable. You can easily place your order on WhatsApp!', 'Payment Gateway', '⚠️');
    sendOrderOnWhatsApp();
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳ Preparing Paystack...</span>';
  }

  const sanitizedEmail = customerEmail || (customerPhone.replace(/[^0-9]/g, '') + '@tinuskitchen.com');
  const reference = 'TKB-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

  const locationZoneName = currentDeliveryType === 'delivery' ? (currentSelectedZone?.name || 'Local Delivery') : 'Counter Pickup';

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: sanitizedEmail,
    amount: grandTotal * 100, // Paystack uses kobo
    currency: 'NGN',
    ref: reference,
    metadata: {
      custom_fields: [
        { display_name: 'Customer Name', variable_name: 'customer_name', value: customerName },
        { display_name: 'Phone Number', variable_name: 'customer_phone', value: customerPhone },
        { display_name: 'Delivery Type', variable_name: 'delivery_type', value: currentDeliveryType },
        { display_name: 'Delivery Zone', variable_name: 'location_zone', value: locationZoneName },
        { display_name: 'Delivery Fee', variable_name: 'delivery_fee', value: deliveryFee },
        { display_name: 'Delivery Address', variable_name: 'delivery_address', value: deliveryAddress || 'Pickup' },
        { display_name: 'Order Notes', variable_name: 'notes', value: notes || 'None' }
      ]
    },
    callback: function (response) {
      if (submitBtn) {
        submitBtn.innerHTML = '<span>✓ Payment Authorized! Verifying...</span>';
      }
      verifyAndSaveOrder({
        reference: response.reference || reference,
        customerName,
        customerPhone,
        customerEmail,
        deliveryType: currentDeliveryType,
        locationZone: locationZoneName,
        deliveryFee: deliveryFee,
        deliveryAddress,
        notes,
        items,
        total: grandTotal
      });
    },
    onClose: function () {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>🔒 Pay ₦${grandTotal.toLocaleString()} with Paystack</span>`;
      }
    }
  });

  handler.openIframe();
}

async function verifyAndSaveOrder(payload) {
  const submitBtn = document.getElementById('chkSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>🔒 Confirming your order...</span>';
  }

  // 1. Paystack has authorized the payment.
  // Immediately persist order to localStorage so user & kitchen tracker can access it.
  try {
    const existing = JSON.parse(localStorage.getItem('tkb_orders') || '[]');
    const orderRecord = {
      id: 'ord_' + Date.now(),
      reference: payload.reference,
      customer_name: payload.customerName,
      phone: payload.customerPhone,
      email: payload.customerEmail,
      delivery_type: payload.deliveryType,
      location_zone: payload.locationZone || (payload.deliveryType === 'pickup' ? 'Counter Pickup' : 'Local Delivery'),
      delivery_fee: Number(payload.deliveryFee) || 0,
      delivery_address: payload.deliveryAddress || (payload.deliveryType === 'pickup' ? 'Counter Pickup' : 'Lagos Delivery'),
      notes: payload.notes,
      items: payload.items,
      amount: payload.total,
      payment_status: 'paid',
      status: 'received',
      created_at: new Date().toISOString()
    };
    const existingIdx = existing.findIndex(o => o.reference === payload.reference);
    if (existingIdx === -1) {
      existing.unshift(orderRecord);
    } else {
      existing[existingIdx] = orderRecord;
    }
    localStorage.setItem('tkb_orders', JSON.stringify(existing));
    localStorage.setItem('tkb_last_order', JSON.stringify(orderRecord));
  } catch (e) {
    console.warn('localStorage save warning:', e);
  }

  // 2. Clear cart and close checkout modal
  clearCart();
  closeCheckoutModal();

  // 3. Sync to Netlify backend in background (silent in local dev test)
  try {
    const res = await fetch('/.netlify/functions/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: payload.reference,
        orderData: payload
      })
    });
    if (res.ok) {
      const data = await res.json();
      console.log('Netlify verification response:', data);
    }
  } catch (err) {
    console.log('Backend sync offline or running in local dev mode. Local order saved.');
  }

  // 4. Show celebratory confirmation — ZERO NATIVE ERROR ALERT
  showOrderConfirmation(payload.reference, payload.reference);

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>🔒 Pay with Paystack</span>';
  }
}

function getOrderStatusUrl(ref) {
  const path = window.location.pathname;
  const dir = path.substring(0, path.lastIndexOf('/') + 1);
  return `${dir}order-status.html?ref=${encodeURIComponent(ref)}`;
}

function copyOrderRefCode(ref, btn) {
  const cleanRef = (ref || '').replace(/^#/, '');
  const executeFeedback = () => {
    if (btn) {
      const originalHTML = btn.innerHTML;
      btn.style.background = '#10B981';
      btn.style.borderColor = '#10B981';
      btn.style.color = '#FFFFFF';
      btn.innerHTML = '<span>✓ Copied!</span>';
      setTimeout(() => {
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
        btn.innerHTML = originalHTML;
      }, 2500);
    }
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(cleanRef).then(executeFeedback).catch(() => {
      fallbackCopy(cleanRef, executeFeedback);
    });
  } else {
    fallbackCopy(cleanRef, executeFeedback);
  }
}

function fallbackCopy(text, cb) {
  try {
    const temp = document.createElement('input');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    if (cb) cb();
  } catch(e) {
    if (cb) cb();
  }
}

function showOrderConfirmation(orderId, reference) {
  if (typeof launchConfetti === 'function') launchConfetti();
  
  // Directly open the live tracker modal with celebratory banner so user can easily view & copy their code!
  openTrackOrderModal(reference, true);
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

// Live Order Tracker Modal

function openTrackOrderModal(prefillRef, isNewOrder) {
  const overlay = document.getElementById('trackOrderModalOverlay');
  if (!overlay) return;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  const input = document.getElementById('trackModalRefInput');
  const chipsContainer = document.getElementById('trackRecentChips');

  let recentOrders = [];
  try {
    const stored = localStorage.getItem('tkb_orders');
    if (stored) {
      recentOrders = JSON.parse(stored);
    }
  } catch (e) {}

  if (recentOrders.length === 0) {
    try {
      const last = localStorage.getItem('tkb_last_order');
      if (last) recentOrders.push(JSON.parse(last));
    } catch (e) {}
  }

  if (chipsContainer) {
    if (recentOrders.length > 0) {
      chipsContainer.innerHTML = '<span style="font-size:0.75rem;font-weight:700;color:var(--muted,#64748B);align-self:center;">Recent:</span> ' +
        recentOrders.slice(0, 3).map(o => {
          const cleanRef = o.reference || o.id;
          return `<button type="button" class="track-chip-btn" onclick="executeTrackModalSearch('${cleanRef}')">#${cleanRef}</button>`;
        }).join('');
    } else {
      chipsContainer.innerHTML = `
        <span style="font-size:0.75rem;font-weight:700;color:var(--muted,#64748B);align-self:center;">Try Demo:</span>
        <button type="button" class="track-chip-btn" onclick="executeTrackModalSearch('TKB-7942')">#TKB-7942</button>
      `;
    }
  }

  const targetRef = prefillRef || (input && input.value.trim()) || (recentOrders.length > 0 ? recentOrders[0].reference : '');

  if (targetRef) {
    if (input) input.value = targetRef;
    executeTrackModalSearch(targetRef, isNewOrder);
  } else {
    if (input) {
      setTimeout(() => input.focus(), 150);
    }
  }
}

function closeTrackOrderModal() {
  const overlay = document.getElementById('trackOrderModalOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

async function executeTrackModalSearch(code, isNewOrder) {
  const input = document.getElementById('trackModalRefInput');
  const mount = document.getElementById('trackModalBody');
  if (!mount) return;

  let ref = (code || (input ? input.value : '')).trim();
  ref = ref.replace(/^#/, '').replace(/[–—]/g, '-').trim();

  if (!ref) {
    showTkbAlert('Please enter an order reference code (e.g. TKB-7942) to track your meal.', 'Order Code Required', '🛵');
    if (input) input.focus();
    return;
  }

  if (input) input.value = ref;

  mount.innerHTML = `
    <div style="text-align:center;padding:28px 16px;">
      <div style="font-size:2rem;margin-bottom:8px;">🍳</div>
      <strong style="font-size:0.95rem;color:var(--charcoal);">Checking kitchen board...</strong>
      <p style="font-size:0.8rem;color:var(--muted);margin-top:4px;">Retrieving live status for #${ref}</p>
    </div>
  `;

  let orderData = null;

  // 1. Fetch from live database first via Netlify Function
  try {
    const res = await fetch(`/.netlify/functions/order-status?reference=${encodeURIComponent(ref)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.order) {
        orderData = data.order;
        // Keep local storage updated
        try {
          const localOrders = JSON.parse(localStorage.getItem('tkb_orders') || '[]');
          const idx = localOrders.findIndex(o => o.reference === ref || o.id === data.order.id);
          if (idx !== -1) {
            localOrders[idx] = { ...localOrders[idx], ...data.order };
            localStorage.setItem('tkb_orders', JSON.stringify(localOrders));
          }
        } catch (e) { }
      }
    }
  } catch (err) {
    console.warn('Live tracking fetch notice:', err);
  }

  // 2. Fallback to local storage (e.g. if offline or freshly placed locally)
  if (!orderData) {
    try {
      const localOrders = JSON.parse(localStorage.getItem('tkb_orders') || '[]');
      orderData = localOrders.find(o => o.reference === ref || (o.id && o.id.includes(ref)));
      if (!orderData) {
        const last = JSON.parse(localStorage.getItem('tkb_last_order') || 'null');
        if (last && (last.reference === ref || (last.id && last.id.includes(ref)))) {
          orderData = last;
        }
      }
    } catch (e) { }
  }

  // 3. Fallback demo order only for explicit demo codes
  if (!orderData) {
    if (ref.toUpperCase() === 'TKB-7942' || ref.toUpperCase() === 'DEMO') {
      orderData = {
        reference: ref,
        status: 'preparing',
        customer_name: 'Valued Customer',
        phone: '08162918036',
        delivery_address: 'Iba / LASU Road, Lagos',
        amount: 5500,
        notes: 'Prepared fresh with chef garnish',
        items: [
          { name: 'Signature Jollof Rice Combo', quantity: 1, price: 3500 },
          { name: 'Peppered Turkey', quantity: 1, price: 2000 }
        ]
      };
    } else {
      mount.innerHTML = `
        <div style="text-align:center;padding:26px 16px;">
          <div style="font-size:2rem;margin-bottom:8px;">🔍</div>
          <strong style="font-size:0.95rem;color:var(--charcoal);display:block;margin-bottom:4px;">Order #${ref} Not Found</strong>
          <p style="font-size:0.82rem;color:var(--muted);margin:0 auto 16px;max-width:320px;line-height:1.45;">Please double check your code from your receipt or WhatsApp message.</p>
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
            <button type="button" class="btn-topbar" style="font-size:0.8rem;padding:7px 14px;" onclick="document.getElementById('trackModalRefInput').select()">Try Again</button>
            <a href="https://wa.me/2348162918036?text=Hi%20Tinu!%20I'm%20trying%20to%20track%20order%20${encodeURIComponent(ref)}" target="_blank" class="btn-primary-action" style="text-decoration:none;font-size:0.8rem;padding:7px 14px;">Ask on WhatsApp</a>
          </div>
        </div>
      `;
      return;
    }
  }

  renderTrackModalResults(orderData, isNewOrder);
}

function renderTrackModalResults(order, isNewOrder) {
  const mount = document.getElementById('trackModalBody');
  if (!mount) return;

  const STATUS_MAP = {
    pending: {
      step: 0,
      badge: '📝 Confirmed',
      tagline: "Order Confirmed",
      desc: "Ticket sent to kitchen's queue.",
      eta: "20–30m"
    },
    received: {
      step: 0,
      badge: '📝 Confirmed',
      tagline: "Order Confirmed",
      desc: "Ticket sent to kitchen's queue.",
      eta: "20–30m"
    },
    confirmed: {
      step: 0,
      badge: '✨ Verified',
      tagline: "Order Confirmed",
      desc: "Payment verified. Ticket queued to cook.",
      eta: "20–30m"
    },
    preparing: {
      step: 1,
      badge: '🍳 Cooking',
      tagline: "Cooking Fresh 🍳🔥",
      desc: "We are crafting your meal in the kitchen.",
      eta: "~15m left"
    },
    ready: {
      step: 2,
      badge: '🛵 On the way',
      tagline: "Out for Delivery 🛵💨",
      desc: "Packed warm in our thermal bag with your rider.",
      eta: "En route"
    },
    dispatched: {
      step: 2,
      badge: '🛵 On the way',
      tagline: "Out for Delivery 🛵💨",
      desc: "Packed warm in our thermal bag with your rider.",
      eta: "En route"
    },
    delivered: {
      step: 3,
      badge: '🍽️ Delivered',
      tagline: "Delivered! Enjoy 🍽️😋",
      desc: "Meal delivered hot. Unpack and enjoy your feast!",
      eta: "Fulfilled"
    },
    cancelled: {
      step: -1,
      badge: 'Cancelled',
      tagline: "Order Cancelled",
      desc: "This order was cancelled. Reach us on WhatsApp.",
      eta: "Cancelled"
    }
  };

  const rawStatus = (order.status || 'preparing').toLowerCase();
  const meta = STATUS_MAP[rawStatus] || STATUS_MAP['preparing'];
  const currentStep = meta.step;

  let items = [];
  if (Array.isArray(order.items)) {
    items = order.items;
  } else if (typeof order.items === 'string') {
    try { items = JSON.parse(order.items); } catch(e) { items = []; }
  }
  if (items.length === 0) {
    items = [{ name: 'Chef Special Order', quantity: 1, price: Number(order.amount || order.total_amount || 4000) }];
  }

  const stepsList = [
    { label: 'Confirmed', icon: '📝' },
    { label: 'Cooking', icon: '🍳' },
    { label: 'On Way', icon: '🛵' },
    { label: 'Delivered', icon: '🍽️' }
  ];

  const subtotal = items.reduce((s, it) => s + (Number(it.price || 0) * (it.quantity || it.qty || 1)), 0);
  const totalPaid = Number(order.amount || order.total_amount || subtotal);
  const deliveryFee = Number(order.delivery_fee) || (totalPaid > subtotal ? (totalPaid - subtotal) : 0);
  const destination = order.delivery_address || (order.delivery_type === 'pickup' ? 'Counter Pickup at Bistro' : '');
  const locationZone = order.location_zone || '';

  mount.innerHTML = `
    ${isNewOrder ? `
      <!-- Delightful Celebration Header -->
      <div style="text-align:center;padding:0 0 10px;">
        <div style="font-size:1.6rem;line-height:1;margin-bottom:4px;">🎉</div>
        <h3 style="font-family:var(--font-serif,'Playfair Display',serif);font-size:1.1rem;font-weight:700;color:#1E293B;margin:0 0 2px;">Payment Received!</h3>
        <p style="font-size:0.75rem;color:#64748B;margin:0;">Order queued on the kitchen board.</p>
      </div>
    ` : ''}

    <!-- Friendly Status Card (Modern Chowdeck Style) -->
    <div class="cd-status-hero">
      <div class="cd-status-top-row">
        <span class="cd-status-pill-badge">${meta.badge}</span>
        <div class="cd-eta-badge">
          <span class="cd-pulse-dot"></span>
          <span>${meta.eta}</span>
        </div>
      </div>
      <h4 class="cd-status-tagline">${meta.tagline}</h4>
      <p class="cd-status-desc">${meta.desc}</p>
    </div>

    <!-- Segmented Stepper Bar -->
    <div class="cd-progress-container">
      <div class="cd-progress-segments">
        ${stepsList.map((s, idx) => {
          let segCls = 'future';
          if (currentStep > idx) segCls = 'completed';
          else if (currentStep === idx) segCls = 'active';
          return `<div class="cd-progress-segment ${segCls}"></div>`;
        }).join('')}
      </div>

      <div class="cd-stepper-stations">
        ${stepsList.map((s, idx) => {
          let stCls = 'future';
          let iconContent = s.icon;
          if (currentStep > idx) {
            stCls = 'completed';
            iconContent = '✓';
          } else if (currentStep === idx) {
            stCls = 'active';
          }
          return `
            <div class="cd-station ${stCls}">
              <div class="cd-station-icon">${iconContent}</div>
              <span class="cd-station-name">${s.label}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Order Reference Banner with Copy -->
    <div class="cd-ref-banner">
      <div class="cd-ref-info">
        <span class="cd-ref-sub">Order Code</span>
        <span class="cd-ref-val">#${order.reference}</span>
      </div>
      <button type="button" class="cd-copy-btn" onclick="copyOrderRefCode('${order.reference}', this)" title="Copy tracking code">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
      </button>
    </div>

    <!-- Clean Chowdeck-Style Order Summary Card -->
    <div class="cd-summary-card">
      <div class="cd-summary-header">
        <span class="cd-summary-title">Order Details</span>
        <span class="cd-summary-count">${items.length} ${items.length === 1 ? 'item' : 'items'}</span>
      </div>

      <div class="cd-items-list">
        ${items.map(it => {
          const qty = it.quantity || it.qty || 1;
          const pr = Number(it.price || 0);
          return `
            <div class="cd-item-row">
              <div class="cd-item-left">
                <span class="cd-qty-pill">${qty}×</span>
                <span class="cd-item-name">${it.name}</span>
              </div>
              <span class="cd-item-price">${pr > 0 ? '₦' + (pr * qty).toLocaleString() : ''}</span>
            </div>
          `;
        }).join('')}
      </div>

      <div class="cd-summary-calc">
        <div class="cd-calc-row">
          <span>Subtotal</span>
          <span>₦${subtotal.toLocaleString()}</span>
        </div>
        ${deliveryFee > 0 ? `
          <div class="cd-calc-row">
            <span>Delivery ${locationZone ? `(${locationZone})` : ''}</span>
            <span>₦${deliveryFee.toLocaleString()}</span>
          </div>
        ` : ''}
        <div class="cd-calc-row cd-total-row">
          <span>Total Paid</span>
          <span class="cd-total-num">₦${totalPaid.toLocaleString()}</span>
        </div>
      </div>

      ${destination ? `
        <div class="cd-delivery-dest">
          <div class="cd-dest-pin">📍</div>
          <div class="cd-dest-details">
            <span class="cd-dest-title">${order.delivery_type === 'pickup' ? 'Pickup' : 'Delivering To'}</span>
            <span class="cd-dest-text">${destination}${locationZone && !destination.includes(locationZone) ? ' · ' + locationZone : ''}</span>
          </div>
        </div>
      ` : ''}
    </div>

    <!-- Actions Row -->
    <div class="cd-actions-row">
      <a href="https://wa.me/2348162918036?text=${encodeURIComponent(`Hello Tinu's Kitchen! Checking on my order #${order.reference}.`)}" target="_blank" class="cd-btn-wa">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.072-1.802-.411-1.396-.578-2.309-1.996-2.38-2.089-.071-.093-.578-.77-.578-1.468 0-.698.366-1.042.497-1.185.131-.143.286-.179.382-.179.096 0 .191.002.274.006.088.005.204-.034.32.245.12.289.41 1.002.446 1.075.036.073.06.157.012.253-.048.096-.072.156-.144.24-.072.084-.152.188-.217.253-.072.072-.147.151-.063.295.084.144.373.616.8 1 .55.495 1.013.649 1.157.721.144.072.228.06.312-.036.084-.096.36-.419.456-.563.096-.144.192-.12.324-.072.132.048.841.397.985.469.144.072.24.108.276.169.036.06.036.349-.108.754z"/>
        </svg>
        <span>WhatsApp</span>
      </a>
      <a href="${getOrderStatusUrl(order.reference)}" class="cd-btn-tracker">
        <span>Full Page</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
    </div>
  `;
}


