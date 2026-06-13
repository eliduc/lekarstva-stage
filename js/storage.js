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

  function get(k) {
    try { return localStorage.getItem(k); }
    catch (e) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; }
  }
  function set(k, v) {
    try { localStorage.setItem(k, v); }
    catch (e) { mem[k] = v; }
  }
  function remove(k) {
    try { localStorage.removeItem(k); }
    catch (e) { delete mem[k]; }
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
    getMeta: getMeta, setMeta: setMeta
  };
})();
