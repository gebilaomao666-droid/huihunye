#!/usr/bin/env python3
"""在部署服务器上执行命令 / 上传文件(读 .env 凭据, 不打印密码)。

用法:
  python scripts/remote.py run "uname -a && systemctl status horror-java"
  python scripts/remote.py put  <本地路径> <远端路径>

凭据来源同 deploy_frontend.py: 项目根 .env 的 DEPLOY_HOST/USER/PASSWORD/KEY_PATH。
"""
import os
import sys
from pathlib import Path

import paramiko

ROOT = Path(__file__).resolve().parents[1]

for _ln in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
    _ln = _ln.strip()
    if _ln and not _ln.startswith("#") and "=" in _ln:
        _k, _, _v = _ln.partition("=")
        os.environ.setdefault(_k.strip(), _v.strip())

HOST = os.environ.get("DEPLOY_HOST", "47.95.124.216")
USER = os.environ.get("DEPLOY_USER", "root")
PW = os.environ.get("DEPLOY_PASSWORD") or None
KEY = os.environ.get("DEPLOY_KEY_PATH") or None
if not PW and not KEY:
    sys.exit("缺少凭据: 请在 .env 设置 DEPLOY_PASSWORD 或 DEPLOY_KEY_PATH。")


def connect():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    kw = {"hostname": HOST, "username": USER, "timeout": 30}
    if KEY:
        kw["key_filename"] = KEY
    else:
        kw["password"] = PW
    ssh.connect(**kw)
    return ssh


def main():
    if len(sys.argv) < 2:
        sys.exit("用法: remote.py run <cmd> | put <local> <remote>")
    mode = sys.argv[1]
    ssh = connect()
    try:
        if mode == "run":
            cmd = sys.argv[2]
            stdin, stdout, stderr = ssh.exec_command(cmd, timeout=180)
            out = stdout.read().decode("utf-8", "replace")
            err = stderr.read().decode("utf-8", "replace")
            rc = stdout.channel.recv_exit_status()
            sys.stdout.write(out)
            if err.strip():
                sys.stdout.write("\n--- stderr ---\n" + err)
            print(f"\n--- exit {rc} ---")
        elif mode == "put":
            local, remote = sys.argv[2], sys.argv[3]
            sftp = ssh.open_sftp()
            sftp.put(local, remote)
            sftp.close()
            size = os.path.getsize(local)
            print(f"[PUT] {local} -> {remote}  ({size} B) OK")
        else:
            sys.exit(f"未知模式: {mode}")
    finally:
        ssh.close()


if __name__ == "__main__":
    main()
