#!/usr/bin/env python3
"""把 SSH 部署密码安全写入本地 .env。

用 getpass 读取(输入时不回显、不进命令历史/终端输出), 只写入被 .gitignore
忽略的 .env 的 DEPLOY_PASSWORD 行。此脚本不读取也不打印密码, 直接运行即可。

用法:  python scripts/set_deploy_password.py
完成后运行 deploy_frontend.py 部署。
"""
import getpass
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENV = ROOT / ".env"


def main():
    try:
        pw = getpass.getpass("粘贴 SSH root 密码(输入时不显示), 回车确认: ").strip()
    except Exception as e:  # 某些终端无法关闭回显
        sys.exit(f"无法安全读取(终端不支持隐藏输入): {e}\n请改用记事本手动编辑 .env。")
    if not pw:
        sys.exit("未输入任何内容, 已取消(.env 未改动)。")

    lines = ENV.read_text(encoding="utf-8").splitlines() if ENV.exists() else []
    out, found = [], False
    for ln in lines:
        if ln.strip().startswith("DEPLOY_PASSWORD="):
            out.append(f"DEPLOY_PASSWORD={pw}")
            found = True
        else:
            out.append(ln)
    if not found:
        out.append(f"DEPLOY_PASSWORD={pw}")

    ENV.write_text("\n".join(out) + "\n", encoding="utf-8")
    print(f"✅ 已写入 .env (DEPLOY_PASSWORD 长度 {len(pw)})。")
    print("密码已写入 .env, 现在可以运行 deploy_frontend.py 部署。")


if __name__ == "__main__":
    main()
