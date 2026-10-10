#!/usr/bin/env python3
"""清理服务器上"本地已不存在"的孤儿前端文件(如美术瘦身后被取代的旧 .png)。
安全设计: 默认 dry-run 只列出不删除; 仅限远端前端目录; 删除时逐个明确文件(非通配 rm)。
读 .env 凭据(同 deploy_frontend.py), 不打印密码。

用法:
  python scripts/prune_remote_orphans.py            # dry-run: 列出孤儿 + 总大小
  python scripts/prune_remote_orphans.py --apply    # 实际删除(生产破坏性操作!)
"""
import os
import sys
import stat
import posixpath
from pathlib import Path

import paramiko

ROOT = Path(__file__).resolve().parents[1]
LOCAL_DIR = ROOT / "vue-frontend"
APPLY = "--apply" in sys.argv

for _ln in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
    _ln = _ln.strip()
    if _ln and not _ln.startswith("#") and "=" in _ln:
        _k, _, _v = _ln.partition("=")
        os.environ.setdefault(_k.strip(), _v.strip())

HOST = os.environ.get("DEPLOY_HOST", "47.95.124.216")
USER = os.environ.get("DEPLOY_USER", "root")
PW = os.environ.get("DEPLOY_PASSWORD") or None
KEY = os.environ.get("DEPLOY_KEY_PATH") or None
REMOTE_DIR = os.environ.get("DEPLOY_REMOTE_DIRS", "/opt/weikongbu/frontend").split(",")[0].strip()
if not PW and not KEY:
    sys.exit("缺少凭据(.env)")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
kw = {"hostname": HOST, "username": USER, "timeout": 30}
if KEY:
    kw["key_filename"] = KEY
else:
    kw["password"] = PW
ssh.connect(**kw)
sftp = ssh.open_sftp()


def walk(remote):
    for entry in sftp.listdir_attr(remote):
        rp = posixpath.join(remote, entry.filename)
        if stat.S_ISDIR(entry.st_mode):
            yield from walk(rp)
        else:
            yield rp, entry.st_size


orphans = []
total = 0
for rp, size in walk(REMOTE_DIR):
    rel = posixpath.relpath(rp, REMOTE_DIR)
    if not (LOCAL_DIR / rel).exists():
        orphans.append((rp, size))
        total += size

print(f"远端 {REMOTE_DIR} 中本地已无对应的孤儿文件: {len(orphans)} 个, 共 {total/1024/1024:.1f}MB")
for rp, size in sorted(orphans, key=lambda x: -x[1])[:40]:
    print(f"  {size/1024:7.0f}KB  {rp}")
if len(orphans) > 40:
    print(f"  ...另有 {len(orphans)-40} 个")

if not APPLY:
    print("\n(dry-run; 确认无误后加 --apply 删除)")
else:
    n = 0
    for rp, _ in orphans:
        # 安全: 只删前端目录内、且确属常见静态资源后缀
        if rp.startswith(REMOTE_DIR + "/") and rp.lower().rsplit(".", 1)[-1] in ("png", "jpg", "jpeg", "webp", "map"):
            sftp.remove(rp)
            n += 1
    print(f"\n已删除 {n} 个孤儿文件。")

sftp.close()
ssh.close()
