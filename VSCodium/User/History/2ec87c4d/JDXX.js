/**
 * =========================================================
 *  APP — public menu page logic.
 *  Reads data via Storage, renders it, and manages the
 *  in-memory cart. No frameworks, no build step.
 * =========================================================
 */
(function () {
  let categories = [];
  let items = [];
  let activeTagFilters = new Set();
  let searchTerm = "";
  let cart = []; // { lineId, itemId, name, sizeLabel, unitPrice, qty, image }

  const els = {}; // cached DOM refs, filled in cacheEls()

  async function init() {
    document.documentElement.setAttribute("data-theme", CONFIG.theme);

    cacheEls();

    try {
      await I18n.load(I18n.savedOrDefaultLang());
    } catch (e) {
      console.error(e);
      alert("Could not load language file. Serve this folder over http(s) — see README.md.");
      return;
    }

    await AppStorage.load();
    categories = AppStorage.getCategories().sort((a, b) => a.order - b.order);
    items = AppStorage.getItems();

    renderStaticText();
    renderLangSwitch();
    renderCategoryNav();
    renderFilterChips();
    renderSections();
    setupSearch();
    setupScrollSpy();
    setupModalEvents();
    setupCartEvents();
    renderCart();
  }

  function cacheEls() {
    [
      "brandLogo", "brandName", "brandTagline", "heroHeading", "searchInput",
      "langSwitch", "categoryNav", "filterRow", "menuSections", "emptyState",
      "footerText", "modalBackdrop", "modal", "cartBar", "cartBarToggle",
      "cartCount", "cartLabel", "cartTotal", "cartPanel", "cartLines",
      "cartClearBtn", "cartSendBtn"
    ].forEach((id) => (els[id] = document.getElementById(id)));
  }

  // -------------------------------------------------------
  // Static text / branding
  // -------------------------------------------------------
  function renderStaticText() {
    els.brandLogo.textContent = CONFIG.logo;
    els.brandName.textContent = I18n.field(CONFIG.restaurantName);
    els.brandTagline.textContent = I18n.field(CONFIG.tagline);
    els.heroHeading.textContent = I18n.field(CONFIG.tagline);
    els.searchInput.placeholder = I18n.t("common.search");
    els.cartLabel.textContent = I18n.t("cart.yourOrder");
    els.cartClearBtn.textContent = I18n.t("cart.clear");
    els.cartSendBtn.textContent = I18n.t("cart.sendWhatsapp");
    els.footerText.textContent = `© ${new Date().getFullYear()} ${I18n.field(CONFIG.restaurantName)}`;
    document.title = I18n.field(CONFIG.restaurantName);
    if (!CONFIG.enableOrdering) els.cartBar.style.display = "none";
  }

  function renderLangSwitch() {
    els.langSwitch.innerHTML = "";
    CONFIG.supportedLanguages.forEach((lang) => {
      const btn = document.createElement("button");
      btn.className = "lang-switch__btn" + (lang === I18n.getLang() ? " is-active" : "");
      btn.textContent = lang.toUpperCase();
      btn.setAttribute("aria-label", I18n.t(`lang.${lang}`));
      btn.addEventListener("click", async () => {
        await I18n.load(lang);
        renderStaticText();
        renderLangSwitch();
        renderCategoryNav();
        renderFilterChips();
        renderSections();
        renderCart();
      });
      els.langSwitch.appendChild(btn);
    });
  }

  // -------------------------------------------------------
  // Category nav + filter chips
  // -------------------------------------------------------
  function renderCategoryNav() {
    els.categoryNav.innerHTML = "";
    const allPill = document.createElement("button");
    allPill.className = "category-pill";
    allPill.textContent = I18n.t("common.all");
    allPill.dataset.target = "top";
    allPill.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    els.categoryNav.appendChild(allPill);

    categories.forEach((cat) => {
      const pill = document.createElement("button");
      pill.className = "category-pill";
      pill.dataset.target = cat.id;
      pill.innerHTML = `<span>${cat.icon}</span><span>${I18n.field(cat.name)}</span>`;
      pill.addEventListener("click", () => {
        document.getElementById(`section-${cat.id}`)?.scrollIntoView({ behavior: "smooth" });
      });
      els.categoryNav.appendChild(pill);
    });
  }

  function renderFilterChips() {
    const filters = [
      { key: "popular", tag: "popular" },
      { key: "vegetarian", tag: "veg" },
      { key: "spicy", tag: "spicy" }
    ];
    els.filterRow.innerHTML = "";
    filters.forEach((f) => {
      const chip = document.createElement("button");
      chip.className = "filter-chip" + (activeTagFilters.has(f.tag) ? " is-active" : "");
      chip.textContent = I18n.t(`filters.${f.key}`);
      chip.addEventListener("click", () => {
        activeTagFilters.has(f.tag) ? activeTagFilters.delete(f.tag) : activeTagFilters.add(f.tag);
        renderFilterChips();
        renderSections();
      });
      els.filterRow.appendChild(chip);
    });
  }

  // -------------------------------------------------------
  // Sections & cards
  // -------------------------------------------------------
  function itemMatchesFilters(item) {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      I18n.field(item.name).toLowerCase().includes(term) ||
      I18n.field(item.description).toLowerCase().includes(term);
    const matchesTags =
      activeTagFilters.size === 0 || (item.tags || []).some((t) => activeTagFilters.has(t));
    return matchesSearch && matchesTags;
  }

  function renderSections() {
    els.menuSections.innerHTML = "";
    let totalVisible = 0;

    categories.forEach((cat) => {
      const catItems = items.filter((it) => it.categoryId === cat.id && itemMatchesFilters(it));
      if (catItems.length === 0) return;
      totalVisible += catItems.length;

      const section = document.createElement("section");
      section.className = "menu-section";
      section.id = `section-${cat.id}`;
      section.style.scrollMarginTop = "150px";

      section.innerHTML = `
        <div class="menu-section__header">
          <span class="menu-section__icon">${cat.icon}</span>
          <h2 class="menu-section__title">${I18n.field(cat.name)}</h2>
        </div>
        <div class="item-grid"></div>
      `;
      const grid = section.querySelector(".item-grid");
      catItems.forEach((item, i) => grid.appendChild(renderItemCard(item, i)));
      els.menuSections.appendChild(section);
    });

    els.emptyState.style.display = totalVisible === 0 ? "block" : "none";
    if (totalVisible === 0) els.emptyState.textContent = I18n.t("common.noResults");

    setupScrollReveal();
  }

  function priceInfo(item) {
    if (item.sizes && item.sizes.length) {
      const cheapest = item.sizes.reduce((a, b) => ((b.discountPrice ?? b.price) < (a.discountPrice ?? a.price) ? b : a));
      return { from: true, price: cheapest.discountPrice ?? cheapest.price, hasDiscount: !!cheapest.discountPrice };
    }
    return { from: false, price: item.discountPrice ?? item.price, oldPrice: item.price, hasDiscount: !!item.discountPrice };
  }

  function formatPrice(value) {
    const num = Number(value).toFixed(2);
    return CONFIG.currencyPosition === "before" ? `${CONFIG.currency}${num}` : `${num}${CONFIG.currency}`;
  }

  function renderItemCard(item, index) {
    const card = document.createElement("article");
    card.className = "item-card" + (item.available ? "" : " is-unavailable");
    card.style.animationDelay = `${Math.min(index * 60, 300)}ms`;
    card.tabIndex = 0;
    card.setAttribute("role", "button");

    const info = priceInfo(item);
    const badges = [];
    if (!item.available) badges.push(`<span class="badge badge--unavailable">${I18n.t("item.unavailable")}</span>`);
    if (item.featured) badges.push(`<span class="badge badge--featured">${I18n.t("item.featured")}</span>`);
    if (info.hasDiscount) badges.push(`<span class="badge badge--sale">${I18n.t("item.sale")}</span>`);

    card.innerHTML = `
      <div class="item-card__media">
        <img src="${item.image}" alt="${I18n.field(item.name)}" loading="lazy">
        <div class="item-card__badges">${badges.join("")}</div>
      </div>
      <div class="item-card__body">
        <div class="item-card__name">${I18n.field(item.name)}</div>
        <div class="item-card__desc">${I18n.field(item.description)}</div>
        <div class="item-card__divider"></div>
        <div class="item-card__footer">
          <div class="price-tag">
            ${info.from ? `<span class="price-tag__from">${I18n.t("item.from")}</span>` : ""}
            ${!info.from && info.hasDiscount ? `<span class="price-tag__old">${formatPrice(info.oldPrice)}</span>` : ""}
            <span class="price-tag__new">${formatPrice(info.price)}</span>
          </div>
          ${CONFIG.enableOrdering && item.available ? `<button class="add-btn" aria-label="${I18n.t("item.addToOrder")}">+</button>` : ""}
        </div>
      </div>
    `;

    const open = () => item.available && openModal(item);
    card.addEventListener("click", (e) => {
      if (e.target.closest(".add-btn")) {
        e.stopPropagation();
        quickAdd(item);
        return;
      }
      open();
    });
    card.addEventListener("keydown", (e) => { if (e.key === "Enter") open(); });

    return card;
  }

  function quickAdd(item) {
    // Items without sizes can be added instantly with qty 1; sized items open the modal.
    if (item.sizes && item.sizes.length) return openModal(item);
    addToCart(item, null, 1);
    pulseAddButton();
  }

  function pulseAddButton() {
    els.cartCount.classList.remove("bump");
    void els.cartCount.offsetWidth;
    els.cartCount.classList.add("bump");
  }

  // -------------------------------------------------------
  // Search
  // -------------------------------------------------------
  function setupSearch() {
    els.searchInput.value = searchTerm;
    els.searchInput.addEventListener("input", (e) => {
      searchTerm = e.target.value;
      renderSections();
    });
  }

  // -------------------------------------------------------
  // Scroll reveal (sections fade in) + scrollspy (active pill)
  // -------------------------------------------------------
  function setupScrollReveal() {
    const sections = document.querySelectorAll(".menu-section");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in-view")),
      { threshold: 0.08 }
    );
    sections.forEach((s) => io.observe(s));
  }

  function setupScrollSpy() {
    window.addEventListener("scroll", () => {
      let current = null;
      document.querySelectorAll(".menu-section").forEach((section) => {
        if (section.getBoundingClientRect().top < 180) current = section.id.replace("section-", "");
      });
      document.querySelectorAll(".category-pill").forEach((pill) => {
        pill.classList.toggle("is-active", pill.dataset.target === current);
      });
    }, { passive: true });
  }

  // -------------------------------------------------------
  // Item modal
  // -------------------------------------------------------
  let modalState = { item: null, sizeIndex: 0, qty: 1 };

  function openModal(item) {
    modalState = { item, sizeIndex: 0, qty: 1 };
    renderModal();
    els.modalBackdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    els.modalBackdrop.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function renderModal() {
    const { item, sizeIndex, qty } = modalState;
    const hasSizes = item.sizes && item.sizes.length > 0;
    const current = hasSizes ? item.sizes[sizeIndex] : null;
    const unitPrice = hasSizes ? (current.discountPrice ?? current.price) : (item.discountPrice ?? item.price);
    const oldPrice = hasSizes ? (current.discountPrice ? current.price : null) : (item.discountPrice ? item.price : null);

    els.modal.innerHTML = `
      <div class="modal__media">
        <img src="${item.image}" alt="${I18n.field(item.name)}">
        <button class="modal__close" aria-label="${I18n.t("common.close")}">✕</button>
      </div>
      <div class="modal__body">
        <div class="modal__name">${I18n.field(item.name)}</div>
        <div class="modal__desc">${I18n.field(item.description)}</div>

        ${hasSizes ? `
          <div>
            <div style="font-weight:600; font-size:.85rem; margin-bottom:8px;">${I18n.t("item.chooseSize")}</div>
            <div class="size-options">
              ${item.sizes.map((s, i) => `
                <button class="size-option ${i === sizeIndex ? "is-active" : ""}" data-size="${i}">
                  ${I18n.field(s.label)} · ${formatPrice(s.discountPrice ?? s.price)}
                </button>
              `).join("")}
            </div>
          </div>` : ""}

        ${CONFIG.enableOrdering ? `
        <div class="modal__row">
          <span style="font-weight:600; font-size:.85rem;">${I18n.t("item.quantity")}</span>
          <div class="stepper">
            <button class="stepper__btn" data-step="-1">−</button>
            <span class="stepper__value">${qty}</span>
            <button class="stepper__btn" data-step="1">+</button>
          </div>
        </div>

        <div class="modal__row">
          <span>${oldPrice ? `<span class="price-tag__old">${formatPrice(oldPrice)}</span> ` : ""}</span>
          <span class="modal__price">${formatPrice(unitPrice * qty)}</span>
        </div>

        <button class="btn-primary" id="modalAddBtn" ${!item.available ? "disabled" : ""}>
          ${I18n.t("item.addToOrder")}
        </button>` : ""}
      </div>
    `;

    els.modal.querySelector(".modal__close").addEventListener("click", closeModal);
    els.modal.querySelectorAll(".size-option").forEach((btn) => {
      btn.addEventListener("click", () => { modalState.sizeIndex = Number(btn.dataset.size); renderModal(); });
    });
    els.modal.querySelectorAll("[data-step]").forEach((btn) => {
      btn.addEventListener("click", () => {
        modalState.qty = Math.max(1, modalState.qty + Number(btn.dataset.step));
        renderModal();
      });
    });
    const addBtn = els.modal.querySelector("#modalAddBtn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        addToCart(item, hasSizes ? item.sizes[modalState.sizeIndex] : null, modalState.qty);
        pulseAddButton();
        closeModal();
      });
    }
  }

  function setupModalEvents() {
    els.modalBackdrop.addEventListener("click", (e) => { if (e.target === els.modalBackdrop) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  }

  // -------------------------------------------------------
  // Cart
  // -------------------------------------------------------
  function addToCart(item, size, qty) {
    const unitPrice = size ? (size.discountPrice ?? size.price) : (item.discountPrice ?? item.price);
    const sizeLabel = size ? I18n.field(size.label) : null;
    const lineId = item.id + (size ? `-${I18n.field(size.label)}` : "");
    const existing = cart.find((l) => l.lineId === lineId);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ lineId, itemId: item.id, name: I18n.field(item.name), sizeLabel, unitPrice, qty, image: item.image });
    }
    renderCart();
  }

  function removeCartLine(lineId) {
    cart = cart.filter((l) => l.lineId !== lineId);
    renderCart();
  }

  function updateCartQty(lineId, delta) {
    const line = cart.find((l) => l.lineId === lineId);
    if (!line) return;
    line.qty = Math.max(1, line.qty + delta);
    renderCart();
  }

  function cartTotal() {
    return cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  }

  function cartCount() {
    return cart.reduce((sum, l) => sum + l.qty, 0);
  }

  function renderCart() {
    const count = cartCount();
    els.cartCount.textContent = count;
    els.cartTotal.textContent = formatPrice(cartTotal());
    els.cartBar.classList.toggle("is-visible", count > 0);

    if (cart.length === 0) {
      els.cartLines.innerHTML = `<div class="cart-line"><span class="cart-line__name">${I18n.t("cart.empty")}</span></div>`;
    } else {
      els.cartLines.innerHTML = cart.map((l) => `
        <div class="cart-line">
          <span class="cart-line__name">${l.name}${l.sizeLabel ? ` <span class="cart-line__meta">(${l.sizeLabel})</span>` : ""}</span>
          <div class="stepper">
            <button class="stepper__btn" data-qty-down="${l.lineId}">−</button>
            <span class="stepper__value">${l.qty}</span>
            <button class="stepper__btn" data-qty-up="${l.lineId}">+</button>
          </div>
          <span>${formatPrice(l.unitPrice * l.qty)}</span>
          <button class="cart-line__remove" data-remove="${l.lineId}" aria-label="${I18n.t("common.delete")}">✕</button>
        </div>
      `).join("");

      els.cartLines.querySelectorAll("[data-qty-down]").forEach((b) => b.addEventListener("click", () => updateCartQty(b.dataset.qtyDown, -1)));
      els.cartLines.querySelectorAll("[data-qty-up]").forEach((b) => b.addEventListener("click", () => updateCartQty(b.dataset.qtyUp, 1)));
      els.cartLines.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () => removeCartLine(b.dataset.remove)));
    }
  }

  function buildWhatsappMessage() {
    const name = I18n.field(CONFIG.restaurantName);
    const lines = cart.map((l) => `• ${l.qty}x ${l.name}${l.sizeLabel ? ` (${l.sizeLabel})` : ""} — ${formatPrice(l.unitPrice * l.qty)}`);
    return [`${name} — ${I18n.t("cart.yourOrder")}`, "", ...lines, "", `${I18n.t("cart.total")}: ${formatPrice(cartTotal())}`].join("\n");
  }

  function setupCartEvents() {
    els.cartBarToggle.addEventListener("click", () => els.cartPanel.classList.toggle("is-open"));
    els.cartClearBtn.addEventListener("click", () => { cart = []; renderCart(); });
    els.cartSendBtn.addEventListener("click", () => {
      if (cart.length === 0) return;
      const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(buildWhatsappMessage())}`;
      window.open(url, "_blank");
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
