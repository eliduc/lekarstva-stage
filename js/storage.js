/* MedStore — слой хранения поверх localStorage.
 *
 * get/set СИНХРОННЫЕ. Старый код приложения вызывает их как `await store.get(...)`
 * — await над не-промисом просто возвращает значение, поэтому всё работает.
 * Синхронность важна для sync.js: он собирает payload бэкапа/статуса без промисов,
 * ровно как metapel читает localStorage напрямую.
 *
 * Ключи данных (как в исходном приложении):
 *   medapp:state:v2          — конфигурация (лекарства/расписание/времена/настройки)
 *   medapp:done:<iso>        — массив отмеченных приёмов за день
 *   medapp:givenat:<iso>     — { time: "HH:MM" } когда отмечено
 *   medapp:slotmeta:<iso>    — { time: {ts,by} } метаданные для слияния статуса (НОВОЕ)
 *   medapp:box               — состояние таблетницы { "<day>|<time>": {iso,ts,by} }
 *   medapp:lang / medapp:sound
 *   medapp:meta              — служебные мета-поля (generation, lastSyncError, ...)
 */
'use strict';
window.MedStore = (function () {
  var mem = {}; // запасное хранилище, если localStorage недоступен (приватный режим)

  // STAGING: у всех project-pages eliduc.github.io ОДИН origin → localStorage общий.
  // Поэтому stage-версия использует свой префикс ключей, чтобы НЕ пересекаться с prod
  // (отдельный токен/данные/настройки/Telegram). Среда определяется по URL.
  var STAGE = (function () {
    try { return /lekarstva-stage/.test(location.pathname) || /[?&]env=stage/.test(location.search); }
    catch (e) { return false; }
  })();
  var PREFIX = STAGE ? 'stage:' : '';

  function get(k) {
    try { return localStorage.getItem(PREFIX + k); }
    catch (e) { return Object.prototype.hasOwnProperty.call(mem, PREFIX + k) ? mem[PREFIX + k] : null; }
  }
  function set(k, v) {
    try { localStorage.setItem(PREFIX + k, v); }
    catch (e) { mem[PREFIX + k] = v; }
  }
  function remove(k) {
    try { localStorage.removeItem(PREFIX + k); }
    catch (e) { delete mem[PREFIX + k]; }
  }

  // ---------- служебные мета-поля (единый JSON medapp:meta) ----------
  function metaAll() {
    try { return JSON.parse(get('medapp:meta')) || {}; }
    catch (e) { return {}; }
  }
  function getMeta(k) { return metaAll()[k]; }
  function setMeta(k, v) {
    var m = metaAll();
    if (v === null || v === undefined) delete m[k]; else m[k] = v;
    set('medapp:meta', JSON.stringify(m));
  }

  return {
    get: get, set: set, remove: remove,
    getMeta: getMeta, setMeta: setMeta,
    isStage: STAGE
  };
})();
