/**
 * =========================================================
 *  ADMIN — login gate + CRUD for categories & items.
 *  Data is persisted through Storage, which saves to the
 *  shared /api/menu endpoint (Cloudflare Pages Function +
 *  KV) so changes here appear for every visitor. The login
 *  password is verified server-side via /api/auth against
 *  the ADMIN_PASSWORD environment variable — see README.md.
 * =========================================================
 */
(function () {
  let categories = [];
  let items = [];
  let editingCategoryId = null;
  let editingItemId = null;
  let sizeRowCounter = 0;
  const els = {};

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

    renderStaticText();
    setupLogin();
    setupTabs();
    setupCategoryModal();
    setupItemModal();
    setupSettings();

    if (sessionStorage.getItem("admin_logged_in") === "1") await showShell();
  }

  function cacheEls() {
    [
      "loginScreen", "loginLogo", "loginTitle", "passwordInput", "loginError", "loginBtn",
      "adminShell", "topbarTitle", "viewMenuLink", "logoutBtn",
      "tabCategoriesBtn", "tabItemsBtn", "tabSettingsBtn",
      "panelCategories", "panelItems", "panelSettings",
      "categoriesHeading", "addCategoryBtn", "categoryList",
      "itemsHeading", "addItemBtn", "itemCategoryFilter", "itemList",
      "settingsHeading", "labelTheme", "valueTheme", "labelLang", "valueLang",
      "labelCurrency", "valueCurrency", "settingsHint",
      "exportBtn", "importBtn", "importFile", "resetBtn",
      "categoryModalBackdrop", "categoryModalTitle", "lblCatIcon", "catIcon",
      "lblCatNameEn", "catNameEn", "lblCatNameAr", "catNameAr", "lblCatNameTr", "catNameTr",
      "catCancelBtn", "catSaveBtn",
      "itemModalBackdrop", "itemModalTitle", "lblItemCategory", "itemCategorySelect",
      "lblNameEn", "itemNameEn", "lblNameAr", "itemNameAr", "lblNameTr", "itemNameTr",
      "lblDescEn", "itemDescEn", "lblDescAr", "itemDescAr", "lblDescTr", "itemDescTr",
      "lblImage", "itemImage", "lblPrice", "itemPrice", "lblDiscount", "itemDiscount",
      "lblTags", "itemTags", "itemAvailable", "lblAvailable", "itemFeatured", "lblFeatured",
      "lblSizes", "sizeRows", "noSizesHint", "addSizeBtn",
      "itemCancelBtn", "itemSaveBtn", "toast"
    ].forEach((id) => (els[id] = document.getElementById(id)));
  }

  // -------------------------------------------------------
  // Static text
  // -------------------------------------------------------
  function renderStaticText() {
    els.loginLogo.textContent = CONFIG.logo;
    els.loginTitle.textContent = I18n.t("admin.loginTitle");
    els.passwordInput.placeholder = I18n.t("admin.passwordPlaceholder");
    els.loginBtn.textContent = I18n.t("admin.login");

    els.topbarTitle.textContent = `${I18n.field(CONFIG.restaurantName)} · ${I18n.t("admin.title")}`;
    els.viewMenuLink.textContent = I18n.t("admin.backToMenu");
    els.logoutBtn.textContent = I18n.t("admin.logout");

    els.tabCategoriesBtn.textContent = I18n.t("admin.tabCategories");
    els.tabItemsBtn.textContent = I18n.t("admin.tabItems");
    els.tabSettingsBtn.textContent = I18n.t("admin.tabSettings");

    els.categoriesHeading.textContent = I18n.t("admin.tabCategories");
    els.addCategoryBtn.textContent = "+ " + I18n.t("admin.addCategory");

    els.itemsHeading.textContent = I18n.t("admin.tabItems");
    els.addItemBtn.textContent = "+ " + I18n.t("admin.addItem");

    els.settingsHeading.textContent = I18n.t("admin.tabSettings");
    els.labelTheme.textContent = I18n.t("admin.currentTheme");
    els.valueTheme.textContent = CONFIG.theme;
    els.labelLang.textContent = I18n.t("admin.currentLanguageDefault");
    els.valueLang.textContent = CONFIG.defaultLanguage.toUpperCase();
    els.labelCurrency.textContent = I18n.t("admin.currentCurrency");
    els.valueCurrency.textContent = CONFIG.currency;
    els.settingsHint.textContent = I18n.t("admin.settingsHint");
    els.exportBtn.textContent = I18n.t("admin.exportData");
    els.importBtn.textContent = I18n.t("admin.importData");
    els.resetBtn.textContent = I18n.t("admin.resetDemo");

    els.categoryModalTitle.textContent = I18n.t("admin.addCategory");
    els.lblCatIcon.textContent = I18n.t("admin.icon");
    els.lblCatNameEn.textContent = I18n.t("admin.nameEn");
    els.lblCatNameAr.textContent = I18n.t("admin.nameAr");
    els.lblCatNameTr.textContent = I18n.t("admin.nameTr");
    els.catCancelBtn.textContent = I18n.t("common.cancel");
    els.catSaveBtn.textContent = I18n.t("common.save");

    els.itemModalTitle.textContent = I18n.t("admin.addItem");
    els.lblItemCategory.textContent = I18n.t("admin.category");
    els.lblNameEn.textContent = I18n.t("admin.nameEn");
    els.lblNameAr.textContent = I18n.t("admin.nameAr");
    els.lblNameTr.textContent = I18n.t("admin.nameTr");
    els.lblDescEn.textContent = I18n.t("admin.descEn");
    els.lblDescAr.textContent = I18n.t("admin.descAr");
    els.lblDescTr.textContent = I18n.t("admin.descTr");
    els.lblImage.textContent = I18n.t("admin.image");
    els.lblPrice.textContent = I18n.t("admin.price");
    els.lblDiscount.textContent = I18n.t("admin.discountPrice");
    els.lblTags.textContent = I18n.t("admin.tags");
    els.lblAvailable.textContent = I18n.t("admin.available");
    els.lblFeatured.textContent = I18n.t("admin.featured");
    els.lblSizes.textContent = I18n.t("admin.sizes");
    els.noSizesHint.textContent = I18n.t("admin.noSizesHint");
    els.addSizeBtn.textContent = "+ " + I18n.t("admin.addSize");
    els.itemCancelBtn.textContent = I18n.t("common.cancel");
    els.itemSaveBtn.textContent = I18n.t("common.save");
  }

  // -------------------------------------------------------
  // Login
  // -------------------------------------------------------
  function setupLogin() {
    const attempt = async () => {
      els.loginBtn.disabled = true;
      els.loginError.textContent = "";
      try {
        const result = await AppStorage.login(els.passwordInput.value);
        if (result.ok) {
          sessionStorage.setItem("admin_logged_in", "1");
          await showShell();
        } else {
          els.loginError.textContent = result.error || I18n.t("admin.wrongPassword");
        }
      } catch (e) {
        els.loginError.textContent = e.message;
      } finally {
        els.loginBtn.disabled = false;
      }
    };
    els.loginBtn.addEventListener("click", attempt);
    els.passwordInput.addEventListener("keydown", (e) => { if (e.key === "Enter") attempt(); });
    els.logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("admin_logged_in");
      AppStorage.clearAdminPassword();
      location.reload();
    });
  }

  async function showShell() {
    els.loginScreen.style.display = "none";
    els.adminShell.classList.add("is-visible");
    await loadData();
    renderCategories();
    renderItemCategoryFilter();
    renderItems();
  }

  async function loadData() {
    await AppStorage.load();
    categories = AppStorage.getCategories().sort((a, b) => a.order - b.order);
    items = AppStorage.getItems();
  }

  // -------------------------------------------------------
  // Tabs
  // -------------------------------------------------------
  function setupTabs() {
    const tabs = { categories: els.panelCategories, items: els.panelItems, settings: els.panelSettings };
    const btns = { categories: els.tabCategoriesBtn, items: els.tabItemsBtn, settings: els.tabSettingsBtn };
    Object.keys(btns).forEach((key) => {
      btns[key].addEventListener("click", () => {
        Object.keys(tabs).forEach((k) => {
          tabs[k].style.display = k === key ? "block" : "none";
          btns[k].classList.toggle("is-active", k === key);
        });
      });
    });
  }

  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("is-visible");
    setTimeout(() => els.toast.classList.remove("is-visible"), 1800);
  }

  // -------------------------------------------------------
  // Categories
  // -------------------------------------------------------
  function renderCategories() {
    els.categoryList.innerHTML = "";
    if (categories.length === 0) {
      els.categoryList.innerHTML = `<div class="empty-hint">—</div>`;
      return;
    }
    categories.forEach((cat) => {
      const count = items.filter((it) => it.categoryId === cat.id).length;
      const row = document.createElement("div");
      row.className = "admin-row";
      row.innerHTML = `
        <div class="admin-row__icon">${cat.icon}</div>
        <div class="admin-row__info">
          <div class="admin-row__title">${I18n.field(cat.name)}</div>
          <div class="admin-row__meta">${I18n.t("admin.itemsInCategory", { count })}</div>
        </div>
        <div class="admin-row__actions">
          <button class="btn btn-outline btn-sm" data-edit>${I18n.t("common.edit")}</button>
          <button class="btn btn-danger btn-sm" data-del>${I18n.t("common.delete")}</button>
        </div>
      `;
      row.querySelector("[data-edit]").addEventListener("click", () => openCategoryModal(cat));
      row.querySelector("[data-del]").addEventListener("click", async () => {
        if (!confirm(I18n.t("common.confirmDelete"))) return;
        try {
          await AppStorage.deleteCategory(cat.id);
          await loadData();
          renderCategories();
          renderItemCategoryFilter();
          renderItems();
          toast(I18n.t("admin.deletedMessage"));
        } catch (e) {
          alert(e.message);
        }
      });
      els.categoryList.appendChild(row);
    });
  }

  function setupCategoryModal() {
    els.addCategoryBtn.addEventListener("click", () => openCategoryModal(null));
    els.catCancelBtn.addEventListener("click", closeCategoryModal);
    els.categoryModalBackdrop.addEventListener("click", (e) => { if (e.target === els.categoryModalBackdrop) closeCategoryModal(); });
    els.catSaveBtn.addEventListener("click", saveCategory);
  }

  function openCategoryModal(cat) {
    editingCategoryId = cat ? cat.id : null;
    els.categoryModalTitle.textContent = I18n.t(cat ? "admin.editCategory" : "admin.addCategory");
    els.catIcon.value = cat ? cat.icon : "🍽️";
    els.catNameEn.value = cat ? cat.name.en : "";
    els.catNameAr.value = cat ? cat.name.ar : "";
    els.catNameTr.value = cat ? cat.name.tr : "";
    els.categoryModalBackdrop.classList.add("is-open");
  }

  function closeCategoryModal() {
    els.categoryModalBackdrop.classList.remove("is-open");
  }

  async function saveCategory() {
    if (!els.catNameEn.value.trim()) { els.catNameEn.focus(); return; }
    const cat = {
      id: editingCategoryId || AppStorage.newId("cat"),
      icon: els.catIcon.value.trim() || "🍽️",
      order: editingCategoryId ? categories.find((c) => c.id === editingCategoryId).order : categories.length + 1,
      name: { en: els.catNameEn.value.trim(), ar: els.catNameAr.value.trim(), tr: els.catNameTr.value.trim() }
    };
    els.catSaveBtn.disabled = true;
    try {
      await AppStorage.upsertCategory(cat);
      await loadData();
      renderCategories();
      renderItemCategoryFilter();
      closeCategoryModal();
      toast(I18n.t("admin.savedMessage"));
    } catch (e) {
      alert(e.message);
    } finally {
      els.catSaveBtn.disabled = false;
    }
  }

  // -------------------------------------------------------
  // Items
  // -------------------------------------------------------
  function renderItemCategoryFilter() {
    const current = els.itemCategoryFilter.value;
    els.itemCategoryFilter.innerHTML =
      `<option value="all">${I18n.t("common.all")}</option>` +
      categories.map((c) => `<option value="${c.id}">${c.icon} ${I18n.field(c.name)}</option>`).join("");
    if ([...els.itemCategoryFilter.options].some((o) => o.value === current)) els.itemCategoryFilter.value = current;
    els.itemCategoryFilter.onchange = renderItems;
  }

  function categoryName(id) {
    const cat = categories.find((c) => c.id === id);
    return cat ? I18n.field(cat.name) : "—";
  }

  function formatPrice(value) {
    const num = Number(value).toFixed(2);
    return CONFIG.currencyPosition === "before" ? `${CONFIG.currency}${num}` : `${num}${CONFIG.currency}`;
  }

  function renderItems() {
    const filter = els.itemCategoryFilter.value || "all";
    const list = items.filter((it) => filter === "all" || it.categoryId === filter);
    els.itemList.innerHTML = "";
    if (list.length === 0) {
      els.itemList.innerHTML = `<div class="empty-hint">—</div>`;
      return;
    }
    list.forEach((item) => {
      const priceLabel = item.sizes && item.sizes.length
        ? `${I18n.t("item.from")} ${formatPrice(Math.min(...item.sizes.map((s) => s.discountPrice ?? s.price)))}`
        : formatPrice(item.discountPrice ?? item.price);

      const row = document.createElement("div");
      row.className = "admin-row";
      row.innerHTML = `
        <img class="admin-row__thumb" src="${item.image}" alt="">
        <div class="admin-row__info">
          <div class="admin-row__title">${I18n.field(item.name)}</div>
          <div class="admin-row__meta">
            ${categoryName(item.categoryId)} · ${priceLabel}
            <span class="chip ${item.available ? "chip--on" : "chip--off"}">${item.available ? I18n.t("admin.available") : I18n.t("item.unavailable")}</span>
            ${item.featured ? `<span class="chip chip--featured">${I18n.t("admin.featured")}</span>` : ""}
          </div>
        </div>
        <div class="admin-row__actions">
          <button class="btn btn-outline btn-sm" data-edit>${I18n.t("common.edit")}</button>
          <button class="btn btn-danger btn-sm" data-del>${I18n.t("common.delete")}</button>
        </div>
      `;
      row.querySelector("[data-edit]").addEventListener("click", () => openItemModal(item));
      row.querySelector("[data-del]").addEventListener("click", async () => {
        if (!confirm(I18n.t("common.confirmDelete"))) return;
        try {
          await AppStorage.deleteItem(item.id);
          await loadData();
          renderItems();
          renderCategories();
          toast(I18n.t("admin.deletedMessage"));
        } catch (e) {
          alert(e.message);
        }
      });
      els.itemList.appendChild(row);
    });
  }

  function setupItemModal() {
    els.addItemBtn.addEventListener("click", () => openItemModal(null));
    els.itemCancelBtn.addEventListener("click", closeItemModal);
    els.itemModalBackdrop.addEventListener("click", (e) => { if (e.target === els.itemModalBackdrop) closeItemModal(); });
    els.itemSaveBtn.addEventListener("click", saveItem);
    els.addSizeBtn.addEventListener("click", () => addSizeRow(null));
  }

  function openItemModal(item) {
    editingItemId = item ? item.id : null;
    els.itemModalTitle.textContent = I18n.t(item ? "admin.editItem" : "admin.addItem");

    els.itemCategorySelect.innerHTML = categories.map((c) => `<option value="${c.id}">${c.icon} ${I18n.field(c.name)}</option>`).join("");
    els.itemCategorySelect.value = item ? item.categoryId : (categories[0] ? categories[0].id : "");

    els.itemNameEn.value = item ? item.name.en : "";
    els.itemNameAr.value = item ? item.name.ar : "";
    els.itemNameTr.value = item ? item.name.tr : "";
    els.itemDescEn.value = item ? item.description.en : "";
    els.itemDescAr.value = item ? item.description.ar : "";
    els.itemDescTr.value = item ? item.description.tr : "";
    els.itemImage.value = item ? item.image : "";
    els.itemPrice.value = item && item.price != null ? item.price : "";
    els.itemDiscount.value = item && item.discountPrice != null ? item.discountPrice : "";
    els.itemTags.value = item && item.tags ? item.tags.join(", ") : "";
    els.itemAvailable.checked = item ? !!item.available : true;
    els.itemFeatured.checked = item ? !!item.featured : false;

    els.sizeRows.innerHTML = "";
    if (item && item.sizes && item.sizes.length) {
      item.sizes.forEach((s) => addSizeRow(s));
    }

    els.itemModalBackdrop.classList.add("is-open");
  }

  function closeItemModal() {
    els.itemModalBackdrop.classList.remove("is-open");
  }

  function addSizeRow(size) {
    sizeRowCounter += 1;
    const id = `size-${sizeRowCounter}`;
    const row = document.createElement("div");
    row.className = "size-row";
    row.dataset.sizeId = id;
    row.innerHTML = `
      <input type="text" class="size-label" placeholder="${I18n.t("admin.sizeLabel")}" value="${size ? I18n.field(size.label) : ""}">
      <input type="number" step="0.01" class="size-price" placeholder="${I18n.t("admin.price")}" value="${size ? size.price : ""}">
      <input type="number" step="0.01" class="size-discount" placeholder="${I18n.t("admin.discountPrice")}" value="${size && size.discountPrice != null ? size.discountPrice : ""}">
      <button class="btn btn-outline btn-sm" data-remove-size>${I18n.t("admin.removeSize")}</button>
    `;
    row.querySelector("[data-remove-size]").addEventListener("click", () => row.remove());
    els.sizeRows.appendChild(row);
  }

  function saveItem() {
    if (!els.itemNameEn.value.trim()) { els.itemNameEn.focus(); return; }
    if (!els.itemCategorySelect.value) { alert(I18n.t("admin.category")); return; }

    const sizeRows = [...els.sizeRows.querySelectorAll(".size-row")]
      .map((row) => ({
        label: row.querySelector(".size-label").value.trim(),
        price: parseFloat(row.querySelector(".size-price").value),
        discount: row.querySelector(".size-discount").value
      }))
      .filter((s) => s.label && !isNaN(s.price));

    const sizes = sizeRows.map((s) => ({
      label: { en: s.label, ar: s.label, tr: s.label },
      price: s.price,
      discountPrice: s.discount !== "" ? parseFloat(s.discount) : null
    }));

    const item = {
      id: editingItemId || AppStorage.newId("item"),
      categoryId: els.itemCategorySelect.value,
      image: els.itemImage.value.trim() || "https://loremflickr.com/600/450/food",
      tags: els.itemTags.value.split(",").map((t) => t.trim()).filter(Boolean),
      available: els.itemAvailable.checked,
      featured: els.itemFeatured.checked,
      name: { en: els.itemNameEn.value.trim(), ar: els.itemNameAr.value.trim(), tr: els.itemNameTr.value.trim() },
      description: { en: els.itemDescEn.value.trim(), ar: els.itemDescAr.value.trim(), tr: els.itemDescTr.value.trim() },
      price: sizes.length ? null : (els.itemPrice.value !== "" ? parseFloat(els.itemPrice.value) : 0),
      discountPrice: sizes.length ? null : (els.itemDiscount.value !== "" ? parseFloat(els.itemDiscount.value) : null),
      sizes
    };

    els.itemSaveBtn.disabled = true;
    AppStorage.upsertItem(item)
      .then(async () => {
        await loadData();
        renderItems();
        renderCategories();
        closeItemModal();
        toast(I18n.t("admin.savedMessage"));
      })
      .catch((e) => alert(e.message))
      .finally(() => { els.itemSaveBtn.disabled = false; });
  }

  // -------------------------------------------------------
  // Settings: export / import / reset
  // -------------------------------------------------------
  function setupSettings() {
    els.exportBtn.addEventListener("click", () => {
      const blob = new Blob([AppStorage.exportAll()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "menu-data.json";
      a.click();
    });

    els.importBtn.addEventListener("click", () => els.importFile.click());
    els.importFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await AppStorage.importAll(reader.result);
          await loadData();
          renderCategories();
          renderItemCategoryFilter();
          renderItems();
          toast(I18n.t("admin.savedMessage"));
        } catch (err) {
          alert(err.message);
        }
      };
      reader.readAsText(file);
      els.importFile.value = "";
    });

    els.resetBtn.addEventListener("click", async () => {
      if (!confirm(I18n.t("admin.resetConfirm"))) return;
      try {
        await AppStorage.resetToDemo();
        await loadData();
        renderCategories();
        renderItemCategoryFilter();
        renderItems();
        toast(I18n.t("admin.savedMessage"));
      } catch (err) {
        alert(err.message);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
