#!/usr/bin/env python3
"""生成游戏二维码(指向线上地址), 存到项目根 + 桌面。"""
import qrcode
from qrcode.constants import ERROR_CORRECT_M
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

URL = "http://47.95.124.216/weikongbu/"

qr = qrcode.QRCode(error_correction=ERROR_CORRECT_M, box_size=12, border=3)
qr.add_data(URL)
qr.make(fit=True)
img = qr.make_image(fill_color="#1a0606", back_color="white").convert("RGB")

w, h = img.size
cap_h = 46
canvas = Image.new("RGB", (w, h + cap_h), "white")
canvas.paste(img, (0, 0))
draw = ImageDraw.Draw(canvas)
font = None
for name in ("arial.ttf", "consola.ttf", "segoeui.ttf"):
    try:
        font = ImageFont.truetype(name, 22)
        break
    except Exception:
        continue
if font is None:
    font = ImageFont.load_default()
bb = draw.textbbox((0, 0), URL, font=font)
tw = bb[2] - bb[0]
draw.text(((w - tw) // 2, h + 10), URL, fill="#1a0606", font=font)

outs = [
    Path(r"D:\py\项目\回魂夜\游戏二维码.png"),
    Path(r"C:\Users\28772\Desktop\回魂夜_游戏二维码.png"),
]
for o in outs:
    try:
        canvas.save(o)
        print("saved:", o)
    except Exception as e:
        print("fail:", o, e)
