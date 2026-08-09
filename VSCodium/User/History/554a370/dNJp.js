/**
 * The one place to edit when deploying this frontend somewhere else, or when
 * pointing it at a different backend (e.g. a staging server).
 *
 * Two environments:
 *  - Dev static-server ports (5500/…): the API is on localhost:8000, chatbot :8100.
 *  - Everywhere else (Cloudflare Pages here): the API and chatbot are separate
 *    origins behind the Cloudflare Tunnel, so their absolute hostnames are used.
 *    They CANNOT be relative/same-origin — Pages is static hosting with no backend.
 */
const CONFIG = (() => {
  const DEV_PORTS = ['5500', '5501', '3000', '5173'];
  const isDev = DEV_PORTS.includes(window.location.port);

  // --- Production hosts (Cloudflare Tunnel public hostnames) -----------------
  const PROD_API = 'https://dental-api.dijivoo.com';
  const PROD_CHATBOT = 'https://dental-bot.dijivoo.com';

  const apiBase = isDev ? `http://${window.location.hostname}:8000` : PROD_API;
  // Set CHATBOT to '' to disable the widget entirely — chatbot.js then never renders.
  const chatbotBase = isDev ? `http://${window.location.hostname}:8100` : PROD_CHATBOT;

  return {
    API_BASE_URL: `${apiBase}/api/v1`,
    UPLOADS_BASE_URL: apiBase,
    CHATBOT_URL: chatbotBase,
    DEFAULT_LANGUAGE: 'tr',
    SUPPORTED_LANGUAGES: ['tr', 'ar'],
  };
})();
