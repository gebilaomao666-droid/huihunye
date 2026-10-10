#!/usr/bin/env python3
"""美术资源瘦身(TASK-002)。
- 不透明的摄影类图(bg/death/ending/char/closeup/item 中无透明通道者): resize 到 1280 长边 + 转 JPEG q85,
  改名 .png→.jpg 并同步重写 js/css/html 里的引用。
- ui/ 目录、以及任何含真实透明通道的图: 保留 PNG,仅 resize+optimize(不改引用)。
原图全部备份到 img/_orig_backup/(已 gitignore)。
用法:  python scripts/optimize_images.py            # dry-run 预估
       python scripts/optimize_images.py --apply    # 实际执行
"""
import sys
import io
import shutil
from pathlib import Path
from PIL import Image

try:
    sys.stdout.reconfigure(encoding="utf-8")  # 避免 GBK 控制台打印 ✅/❌ 崩溃
except Exception:
    pass

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "vue-frontend" / "img"
BACKUP = IMG / "_orig_backup"
SKIP_DIRS = {"_orig_backup", "_incoming"}
JPEG_CAP = 1280
PNG_CAP = 1280
JPEG_Q = 85
APPLY = "--apply" in sys.argv

# 重写引用的文本文件范围
TEXT_GLOBS = ["vue-frontend/js/**/*.js", "vue-frontend/js/**/*.mjs",
              "vue-frontend/css/*.css", "vue-frontend/*.html", "vue-frontend/*.js"]


def all_images():
    for p in IMG.rglob("*"):
        if p.is_file() and p.suffix.lower() in (".png", ".jpg", ".jpeg"):
            if any(part in SKIP_DIRS for part in p.relative_to(IMG).parts):
                continue
            yield p


def has_alpha(im):
    if im.mode in ("RGBA", "LA"):
        a = im.getchannel("A")
        lo, _ = a.getextrema()
        return lo < 250
    if im.mode == "P" and "transparency" in im.info:
        return True
    return False


def resized(im, cap):
    w, h = im.size
    s = cap / max(w, h)
    return im.resize((round(w * s), round(h * s)), Image.LANCZOS) if s < 1 else im


def encode_jpg(im):
    buf = io.BytesIO()
    resized(im, JPEG_CAP).convert("RGB").save(buf, "JPEG", quality=JPEG_Q, optimize=True, progressive=True)
    return buf.getvalue()


def encode_png(im):
    buf = io.BytesIO()
    resized(im, PNG_CAP).save(buf, "PNG", optimize=True)
    return buf.getvalue()


def main():
    rename = {}   # 'foo.png' -> 'foo.jpg'
    plan = []     # (path, kind, oldsize, newsize, newbytes, newpath)
    for p in all_images():
        rel = p.relative_to(IMG).as_posix()
        in_ui = rel.split("/")[0] == "ui"
        try:
            im = Image.open(p); im.load()
        except Exception as e:
            print(f"  跳过(打不开) {rel}: {e}"); continue
        old = p.stat().st_size
        if (not in_ui) and (not has_alpha(im)) and p.suffix.lower() == ".png":
            data = encode_jpg(im); newpath = p.with_suffix(".jpg")
            plan.append((p, "PNG→JPG", old, len(data), data, newpath))
            # 用完整相对路径作映射键, 避免文件名子串碰撞(如 bride.png 误伤 paper_bride.png)
            rename["img/" + p.relative_to(IMG).as_posix()] = "img/" + newpath.relative_to(IMG).as_posix()
        else:
            data = encode_png(im) if p.suffix.lower() == ".png" else None
            if data is not None and len(data) < old:
                plan.append((p, "PNG优化", old, len(data), data, p))
            # 体积没降的 PNG 不动
    old_total = sum(pp.stat().st_size for pp in all_images())
    new_total = old_total
    for (p, kind, old, new, data, newpath) in plan:
        new_total += (new - old)
    print(f"=== {'APPLY' if APPLY else 'DRY-RUN'} ===")
    print(f"图片总数(参与) {len(list(all_images()))}; 计划改动 {len(plan)} 张; 改名(png→jpg) {len(rename)} 张")
    print(f"预估总体积 {old_total/1024/1024:.1f}MB → {new_total/1024/1024:.1f}MB")
    # 展示降幅最大的几张
    for (p, kind, old, new, data, newpath) in sorted(plan, key=lambda x: x[2]-x[3], reverse=True)[:8]:
        print(f"  {kind} {p.relative_to(IMG).as_posix():42} {old/1024:6.0f}KB→{new/1024:5.0f}KB")

    if not APPLY:
        print("\n(dry-run;加 --apply 执行)")
        return

    BACKUP.mkdir(exist_ok=True)
    for (p, kind, old, new, data, newpath) in plan:
        bdst = BACKUP / p.relative_to(IMG)
        bdst.parent.mkdir(parents=True, exist_ok=True)
        if not bdst.exists():
            shutil.copy2(p, bdst)
        newpath.write_bytes(data)
        if newpath != p:
            p.unlink()  # 删旧 .png
    print(f"已写入 {len(plan)} 张; 备份在 {BACKUP.relative_to(ROOT)}")

    # 重写引用
    if rename:
        changed_files = 0
        for g in TEXT_GLOBS:
            for f in ROOT.glob(g):
                if not f.is_file():
                    continue
                t = f.read_text(encoding="utf-8")
                t2 = t
                for old_name, new_name in rename.items():
                    t2 = t2.replace(old_name, new_name)
                if t2 != t:
                    f.write_text(t2, encoding="utf-8")
                    changed_files += 1
        print(f"重写引用涉及 {changed_files} 个文本文件")

    # 校验: 所有被引用的 img/... 文件都存在
    missing = set()
    import re
    pat = re.compile(r"img/[\w/\-.]+\.(?:png|jpg|jpeg|webp)", re.I)
    for g in TEXT_GLOBS:
        for f in ROOT.glob(g):
            if not f.is_file():
                continue
            for m in pat.findall(f.read_text(encoding="utf-8")):
                if not (ROOT / "vue-frontend" / m).exists():
                    missing.add(m)
    print(f"引用校验: {'✅ 全部存在' if not missing else '❌ 缺失: ' + ', '.join(sorted(missing))}")
    after = sum(pp.stat().st_size for pp in all_images())
    print(f"实际总体积 → {after/1024/1024:.1f}MB")
    if missing:
        sys.exit(1)


if __name__ == "__main__":
    main()
