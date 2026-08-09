/**
 * =========================================================
 *  STORAGE — talks to the shared menu API (/api/menu, backed
 *  by Cloudflare KV) so every visitor sees the same data.
 *
 *  A copy is cached in localStorage purely so the page has
 *  something to show instantly / while offline / before the
 *  API + KV binding are set up — it is NOT the source of
 *  truth. The API is. See README.md for the Cloudflare setup.
 * =========================================================
 */
const AppStorage = (() => {
  const API_URL = "/api/menu";
  const AUTH_URL = "/api/auth";
  const CACHE_KEY = "menu_data_cache";

  let _categories = [];
  let _items = [];
  let _adminPassword = sessionStorage.getItem("admin_password") || "";

  // ---- admin session -------------------------------------------------
  function setAdminPassword(pwd) {
    _adminPassword = pwd;
    sessionStorage.setItem("admin_password", pwd);
  }

  function clearAdminPassword() {
    _adminPassword = "";
    sessionStorage.removeItem("admin_password");
  }

  async function login(password) {
    const res = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await res.json().catch(() => ({ ok: false }));
    if (data.ok) setAdminPassword(password);
    return data; // { ok: true|false, error? }
  }

  // ---- reading -------------------------------------------------
  async function load() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`API responded ${res.status}`);
      const data = await res.json();
      _categories = data.categories || [];
      _items = data.items || [];
      localStorage.setItem(CACHE_KEY, JSON.stringify({ categories: _categories, items: _items }));
    } catch (e) {
      console.warn("Menu API unreachable — falling back to cached/demo data.", e);
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        _categories = data.categories;
        _items = data.items;
      } else {
        _categories = DEFAULT_CATEGORIES;
        _items = DEFAULT_ITEMS;
      }
    }
  }

  function getCategories() { return _categories; }
  function getItems() { return _items; }

  // ---- writing (all writes go through the API) -------------------------------------------------
  async function saveRemote(categories, items) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-password": _adminPassword },
      body: JSON.stringify({ categories, items })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Save failed (${res.status})`);
    }
    _categories = categories;
    _items = items;
    localStorage.setItem(CACHE_KEY, JSON.stringify({ categories, items }));
  }

  async function upsertCategory(category) {
    const list = [..._categories];
    const i = list.findIndex((c) => c.id === category.id);
    if (i >= 0) list[i] = category; else list.push(category);
    await saveRemote(list, _items);
  }

  async function deleteCategory(id) {
    const categories = _categories.filter((c) => c.id !== id);
    const items = _items.filter((it) => it.categoryId !== id); // cascade delete
    await saveRemote(categories, items);
  }

  async function upsertItem(item) {
    const list = [..._items];
    const i = list.findIndex((it) => it.id === item.id);
    if (i >= 0) list[i] = item; else list.push(item);
    await saveRemote(_categories, list);
  }

  async function deleteItem(id) {
    await saveRemote(_categories, _items.filter((it) => it.id !== id));
  }

  function exportAll() {
    return JSON.stringify({ categories: _categories, items: _items }, null, 2);
  }

  async function importAll(jsonText) {
    const data = JSON.parse(jsonText);
    if (!Array.isArray(data.categories) || !Array.isArray(data.items)) {
      throw new Error("Invalid file: expected { categories: [], items: [] }");
    }
    await saveRemote(data.categories, data.items);
  }

  async function resetToDemo() {
    await saveRemote(DEFAULT_CATEGORIES, DEFAULT_ITEMS);
  }

  function newId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  return {
    load, getCategories, getItems, login, setAdminPassword, clearAdminPassword,
    upsertCategory, deleteCategory, upsertItem, deleteItem,
    exportAll, importAll, resetToDemo, newId
  };
})();
