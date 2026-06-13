# -*- coding: utf-8 -*-
"""Извлекает прикладную часть (контроллер) из исходного HTML в js/app.js, дословно.
Дальнейшие правки (sync-обвязка, пароль, ИИ-ключ) делаются точечными edit'ами."""
import os
SRC = r"C:\Users\rlgle\Documents\Помощник_лекарства.html"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(SRC, "r", encoding="utf-8") as f:
    src = f.read()
i = src.index("/* ============ STORAGE ============ */")
j = src.index("</script>", i)
body = src[i:j].rstrip() + "\n"
banner = ("/* MedApp — контроллер: рендер экранов, мастер выдачи, напоминания,\n"
          "   настройки, Telegram, ИИ-скан, синхронизация. Глобальный скрипт\n"
          "   (НЕ IIFE): встроенные onclick в шаблонах требуют глобальных функций.\n"
          "   Зависимости (общий global lexical scope / window): i18n.js, data.js,\n"
          "   MedStore (storage.js), MedSync (sync.js). */\n")
out = os.path.join(ROOT, "js", "app.js")
with open(out, "w", encoding="utf-8", newline="\n") as f:
    f.write(banner + body)
print("wrote js/app.js (%d chars)" % len(banner + body))
