# -*- coding: utf-8 -*-
"""
Разовая распаковка ассетов из исходного одностраничного приложения
C:\\Users\\rlgle\\Documents\\Помощник_лекарства.html в модульную структуру:
  - <style>            -> css/styles.css
  - const IMGS={...}    -> img/<id>.<ext>  (+ карта IMG_SRC в js/data.js)
  - иконка из <head>    -> icons/icon-180/192/512.png
  - блок I18N           -> js/i18n.js   (verbatim)
  - блок DEFAULT DATA   -> js/data.js   (verbatim + IMG_SRC + hash)
Запуск:  python tools/extract_assets.py
"""
import base64, json, os, re, sys

SRC = r"C:\Users\rlgle\Documents\Помощник_лекарства.html"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def w(path, text):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)
    print("  wrote", path, "(%d chars)" % len(text))

def wb(path, data):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "wb") as f:
        f.write(data)

def slice_between(src, start_anchor, end_anchor):
    i = src.index(start_anchor)
    j = src.index(end_anchor, i)
    return src[i:j].rstrip() + "\n"

def main():
    with open(SRC, "r", encoding="utf-8") as f:
        src = f.read()

    # ---------- CSS ----------
    css = re.search(r"<style>(.*?)</style>", src, re.S).group(1).strip()
    w("css/styles.css", css + "\n")

    # ---------- IMGS -> файлы ----------
    m = re.search(r"\bIMGS\s*=\s*(\{.*?\})\s*;", src, re.S)
    imgs = json.loads(m.group(1))
    img_src = {}
    EXT = {"image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif"}
    for mid, dataurl in imgs.items():
        mt = re.match(r"data:([^;]+);base64,(.*)$", dataurl, re.S)
        ext = EXT.get(mt.group(1), "png")
        wb("img/%s.%s" % (mid, ext), base64.b64decode(mt.group(2)))
        img_src[mid] = "img/%s.%s" % (mid, ext)
    print("  decoded %d medication images" % len(img_src))

    # ---------- иконка из <head> ----------
    icons = re.findall(r'href="data:image/png;base64,([^"]+)"', src)
    if icons:
        # самый большой по длине base64 = самая крупная иконка (apple-touch 180)
        big = max(icons, key=len)
        png = base64.b64decode(big)
        for name in ("icon-180.png", "icon-192.png", "icon-512.png"):
            wb("icons/%s" % name, png)
        try:
            from PIL import Image
            import io
            im = Image.open(io.BytesIO(png)).convert("RGBA")
            for name, sz in (("icon-180.png", 180), ("icon-192.png", 192), ("icon-512.png", 512)):
                im.resize((sz, sz), Image.LANCZOS).save(os.path.join(ROOT, "icons", name))
            print("  icons resized via PIL (180/192/512)")
        except Exception as e:
            print("  PIL unavailable (%s) — icons copied at source size" % e)

    # ---------- js/i18n.js ----------
    i18n_body = slice_between(src, "/* ============ I18N ============ */", "const RU_NAME=")
    i18n = ("/* MedI18n — переводы (4 языка) и форматирование. БЕЗ DOM.\n"
            "   Объявления верхнего уровня видны другим скриптам (общий global lexical scope). */\n"
            "'use strict';\n" + i18n_body)
    w("js/i18n.js", i18n)

    # ---------- js/data.js ----------
    data_body = slice_between(src, "const RU_NAME=", "/* ============ STORAGE ============ */")
    img_src_js = "var IMG_SRC = " + json.dumps(img_src, ensure_ascii=False, indent=1) + ";\n"
    tail = (
        "\n/* ---- добавлено при переходе на клиент-серверную структуру ---- */\n"
        + img_src_js +
        "function medImg(m){ if(!m||!m.img)return null;\n"
        "  if(typeof m.img==='string'&&m.img.indexOf('data:')===0)return m.img;\n"
        "  return IMG_SRC[m.img]||null; }\n"
        "/* FNV-1a 32-бит: пароль настроек и детектор изменений бэкапа */\n"
        "function hash(str){ var h=0x811c9dc5>>>0; str=String(str);\n"
        "  for(var i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,0x01000193)>>>0; }\n"
        "  return (h>>>0).toString(36); }\n"
    )
    data = ("/* MedData — типы лекарств, дефолтные данные, иконки, хелперы. БЕЗ DOM. */\n"
            "'use strict';\n" + data_body + tail)
    w("js/data.js", data)

    print("OK")

if __name__ == "__main__":
    main()
