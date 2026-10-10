#!/usr/bin/env python3
"""
批量处理UI素材：去黑底、切分、转透明PNG
"""
import os
from PIL import Image

SRC_DIR = r"C:\Users\28772\.kimi\prompt-cache\images"
DST_DIR = r"D:\py\项目\回魂夜\vue-frontend\img\ui"

os.makedirs(DST_DIR, exist_ok=True)

def remove_black_bg(img, threshold=40, preserve_alpha=True):
    """将黑色背景转为透明"""
    img = img.convert("RGBA")
    data = img.getdata()
    new_data = []
    for r, g, b, a in data:
        if r < threshold and g < threshold and b < threshold:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append((r, g, b, a))
    img.putdata(new_data)
    return img

def split_image(img, rows, cols, names, remove_bg=True, threshold=40):
    """将图片切分为多个子图"""
    w, h = img.size
    cell_w = w // cols
    cell_h = h // rows
    results = {}
    idx = 0
    for row in range(rows):
        for col in range(cols):
            if idx >= len(names):
                break
            left = col * cell_w
            upper = row * cell_h
            right = left + cell_w
            lower = upper + cell_h
            crop = img.crop((left, upper, right, lower))
            if remove_bg:
                crop = remove_black_bg(crop, threshold)
            # 自动裁剪透明边距
            bbox = crop.getbbox()
            if bbox:
                crop = crop.crop(bbox)
            results[names[idx]] = crop
            idx += 1
    return results

def save(img, name):
    path = os.path.join(DST_DIR, name)
    img.save(path, "PNG")
    print(f"  [OK] {name} ({img.size[0]}x{img.size[1]})")

# ==================== 1. 血滴边框 ====================
print("[1/8] Processing blood border...")
img = Image.open(os.path.join(SRC_DIR, "koszichl.png"))
img = remove_black_bg(img, threshold=45)
save(img, "border_blood.png")

# ==================== 2. 符咒按钮（单个） ====================
print("[2/8] Processing talisman button...")
img = Image.open(os.path.join(SRC_DIR, "xdewrune.png"))
img = remove_black_bg(img, threshold=45)
# 裁剪透明边距
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)
save(img, "btn_talisman.png")

# ==================== 3. 纸钱纹理背景 ====================
print("[3/8] Processing paper texture...")
img = Image.open(os.path.join(SRC_DIR, "fivfmprw.png"))
# 纸钱不需要去黑底，但需要边缘渐隐使其能叠加
img = img.convert("RGBA")
save(img, "bg_paper.png")

# ==================== 4. 按钮三态 ====================
print("[4/8] Processing button states (split 3)...")
img = Image.open(os.path.join(SRC_DIR, "jdphvzfc.png"))
# 图片是三列布局：正常 | 悬停 | 点击
w, h = img.size
cell_w = w // 3
states = [
    ("btn_normal.png", 0),
    ("btn_hover.png", 1),
    ("btn_active.png", 2),
]
for name, col in states:
    crop = img.crop((col * cell_w, 0, (col + 1) * cell_w, h))
    crop = remove_black_bg(crop, threshold=45)
    bbox = crop.getbbox()
    if bbox:
        crop = crop.crop(bbox)
    save(crop, name)

# ==================== 5. 道具图标（2行5列=10个） ====================
print("[5/8] Processing item icons (split 10)...")
img = Image.open(os.path.join(SRC_DIR, "upbubtrp.png"))
names = [
    "icon_key.png", "icon_rope.png", "icon_blood_jade.png", "icon_paper_doll.png", "icon_talisman.png",
    "icon_incense.png", "icon_bell.png", "icon_photo.png", "icon_puppet.png", "icon_broken_mirror.png"
]
results = split_image(img, 2, 5, names, remove_bg=True, threshold=35)
for name, crop in results.items():
    save(crop, name)

# ==================== 6. 状态条 ====================
print("[6/8] Processing status bars (split icons+bars)...")
img = Image.open(os.path.join(SRC_DIR, "rgqopjcd.png"))
w, h = img.size
# 3行，每行包含：图标(左侧约120px) + 条框(右侧)
icon_w = int(w * 0.15)
bar_start = int(w * 0.18)
bar_end = int(w * 0.95)

for i, (icon_name, bar_name) in enumerate([
    ("icon_hp.png", "bar_hp.png"),
    ("icon_sanity.png", "bar_sanity.png"),
    ("icon_fear.png", "bar_fear.png"),
]):
    row_y1 = i * (h // 3)
    row_y2 = (i + 1) * (h // 3)
    # 切图标
    icon_crop = img.crop((0, row_y1, icon_w, row_y2))
    icon_crop = remove_black_bg(icon_crop, threshold=40)
    bbox = icon_crop.getbbox()
    if bbox:
        icon_crop = icon_crop.crop(bbox)
    save(icon_crop, icon_name)
    # 切条框
    bar_crop = img.crop((bar_start, row_y1, bar_end, row_y2))
    bar_crop = remove_black_bg(bar_crop, threshold=40)
    bbox = bar_crop.getbbox()
    if bbox:
        bar_crop = bar_crop.crop(bbox)
    save(bar_crop, bar_name)

# ==================== 7. 场景切换（无需切分，整体保留） ====================
print("[7/8] Processing scene navigation panel...")
img = Image.open(os.path.join(SRC_DIR, "wqienrga.png"))
save(img, "panel_scene_nav.png")

# ==================== 8. 其他面板（直接复制） ====================
print("[8/8] Processing other panels...")
panels = [
    ("fuecuevz.png", "popup_confirm.png"),   # 提示弹窗
    ("plnasqoe.png", "panel_dialog.png"),     # 对话文字框
    ("vxpbjqcg.png", "panel_menu.png"),       # 菜单
    ("vyenwrhd.png", "panel_save_slots.png"), # 存档栏
]
for src, dst in panels:
    img = Image.open(os.path.join(SRC_DIR, src))
    save(img, dst)

# ==================== 9. 小图标（1行15个） ====================
print("[9/8] Processing small icons (split 15)...")
img = Image.open(os.path.join(SRC_DIR, "enhwukpm.png"))
icon_names = [
    "ic_back.png", "ic_book.png", "ic_map.png", "ic_bag.png", "ic_doll.png",
    "ic_doc.png", "ic_settings.png", "ic_question.png", "ic_alert.png", "ic_eye.png",
    "ic_search.png", "ic_plus.png", "ic_lock.png", "ic_unlock.png", "ic_trash.png", "ic_close.png"
]
# 先确定每个图标的宽度
w, h = img.size
num_icons = len(icon_names)
cell_w = w // num_icons
for i, name in enumerate(icon_names):
    left = i * cell_w
    right = min((i + 1) * cell_w, w)
    crop = img.crop((left, 0, right, h))
    crop = remove_black_bg(crop, threshold=40)
    bbox = crop.getbbox()
    if bbox:
        crop = crop.crop(bbox)
    save(crop, name)

print("\n[Done] All UI assets processed!")
