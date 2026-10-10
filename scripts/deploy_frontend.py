#!/usr/bin/env python3
"""前端上传脚本。

凭据不再硬编码: 从环境变量或项目根的 .env 读取。
  DEPLOY_HOST          服务器地址 (默认 47.95.124.216)
  DEPLOY_USER          登录用户   (默认 root)
  DEPLOY_PASSWORD      登录密码   (与 DEPLOY_KEY_PATH 二选一)
  DEPLOY_KEY_PATH      SSH 私钥路径 (优先于密码)
  DEPLOY_REMOTE_DIRS   远端目录, 逗号分隔 (默认 /opt/weikongbu/frontend)

用法: 复制 .env.example 为 .env 填好后  ->  python scripts/deploy_frontend.py
"""
import os
import sys
from pathlib import Path

import paramiko

ROOT_DIR = Path(__file__).resolve().parents[1]
LOCAL_DIR = str(ROOT_DIR / "vue-frontend")


def load_dotenv(path):
    """极简 .env 加载, 不引入第三方依赖。"""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        os.environ.setdefault(key.strip(), val.strip())


load_dotenv(ROOT_DIR / ".env")

HOST = os.environ.get("DEPLOY_HOST", "47.95.124.216")
USER = os.environ.get("DEPLOY_USER", "root")
PASSWORD = os.environ.get("DEPLOY_PASSWORD") or None
KEY_PATH = os.environ.get("DEPLOY_KEY_PATH") or None
REMOTE_DIRS = [
    d.strip()
    for d in os.environ.get("DEPLOY_REMOTE_DIRS", "/opt/weikongbu/frontend").split(",")
    if d.strip()
]

if not PASSWORD and not KEY_PATH:
    sys.exit(
        "缺少凭据: 请在 .env 或环境变量中设置 DEPLOY_PASSWORD 或 DEPLOY_KEY_PATH。\n"
        "(参考 .env.example; 切勿把密码写回脚本)"
    )


# 文本/代码资产: 体积小且是改动核心, 永远覆盖以保证线上最新。
# 其它(图片/音频等大体积二进制): 远端已存在且字节数一致则跳过, 避免每次重传上百 MB。
TEXT_EXTS = {".js", ".mjs", ".css", ".html", ".htm", ".json", ".webmanifest", ".svg", ".txt", ".map"}


def upload_directory(sftp, local_dir, remote_dir, stats):
    for root, dirs, files in os.walk(local_dir):
        # 不上传本地备份/暂存/开发目录: 原图备份、暂存、剔除的旧素材、测试截图、构建工具、界面样稿、node 依赖
        SKIP_DIRS = ("_orig_backup", "_incoming", "_offstyle", "_qa", "tools", "scripts",
                     "_ui_preview", "node_modules", ".git")
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith("_")]
        rel_path = os.path.relpath(root, local_dir).replace("\\", "/")
        remote_path = f"{remote_dir}/{rel_path}" if rel_path != "." else remote_dir
        try:
            sftp.mkdir(remote_path)
        except IOError:
            pass

        for file in files:
            local_file = os.path.join(root, file)
            remote_file = f"{remote_path}/{file}"
            local_size = os.path.getsize(local_file)
            ext = os.path.splitext(file)[1].lower()
            if ext not in TEXT_EXTS:
                try:
                    if sftp.stat(remote_file).st_size == local_size:
                        stats["skipped"] += 1
                        continue
                except IOError:
                    pass  # 远端不存在 -> 需要上传
            print(f"[UPLOAD] {remote_file}  ({local_size} B)")
            sftp.put(local_file, remote_file)
            stats["uploaded"] += 1
            stats["bytes"] += local_size


ssh = paramiko.SSHClient()
# 注: AutoAddPolicy 会信任任何主机密钥, 个人部署够用;
# 若担心中间人, 改用 ssh.load_system_host_keys() + RejectPolicy 并预置 known_hosts。
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

connect_kwargs = {"hostname": HOST, "username": USER, "timeout": 30}
if KEY_PATH:
    connect_kwargs["key_filename"] = KEY_PATH
else:
    connect_kwargs["password"] = PASSWORD
ssh.connect(**connect_kwargs)
print(f"[1/2] connected to {USER}@{HOST}")

sftp = ssh.open_sftp()
stats = {"uploaded": 0, "skipped": 0, "bytes": 0}
for remote_dir in REMOTE_DIRS:
    print(f"[UPLOAD DIR] {remote_dir}")
    upload_directory(sftp, LOCAL_DIR, remote_dir, stats)
sftp.close()
print(
    f"[2/2] upload complete — 上传 {stats['uploaded']} 个文件 "
    f"({round(stats['bytes'] / 1048576, 1)}MB), 跳过 {stats['skipped']} 个未变化大文件"
)

check_cmd = " && ".join(
    " && ".join([
        f"ls -la {remote_dir}/index.html",
        f"ls -la {remote_dir}/js/app.js",
        f"ls -la {remote_dir}/css/style.css",
        f"ls -la {remote_dir}/css/rpg-ui.css",
        f"ls -la {remote_dir}/css/rpg-redesign.css",
    ])
    for remote_dir in REMOTE_DIRS
)
stdin, stdout, stderr = ssh.exec_command(check_cmd)
print(stdout.read().decode())
err = stderr.read().decode()
if err:
    print(err)

ssh.close()
print("Done!")
