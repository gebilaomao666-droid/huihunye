#!/bin/bash
# 回魂夜·纸人招魂 — 服务端一键部署脚本
# 部署形态: Spring Boot jar (8080) + Nginx 反代 /api -> 8080 + 静态前端 /weikongbu/
# 适用: Alibaba Cloud Linux 3 / CentOS 8 / Rocky 8+ / Ubuntu 20.04+

set -euo pipefail

echo "========================================"
echo "  回魂夜 服务端部署 (Spring Boot)"
echo "========================================"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
JAVA_APP_DIR="/opt/horror-java"           # Maven 工程根 (pom.xml 在此, 构建出 target/*.jar)
FRONTEND_DIR="/opt/weikongbu/frontend"    # 静态前端 (与 nginx.conf 的 alias 一致)
SERVICE_NAME="horror-java"                # 与 README 部署说明一致
NGINX_CONF="/etc/nginx/conf.d/weikongbu.conf"

# 1. 安装依赖 (按发行版选择包管理器, 不再装 Python venv)
echo "[1/6] 安装系统依赖 (JDK 17 / Maven / Nginx / git)..."
if command -v dnf >/dev/null 2>&1; then
    dnf install -y java-17-openjdk maven nginx git
elif command -v yum >/dev/null 2>&1; then
    yum install -y java-17-openjdk maven nginx git
elif command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y openjdk-17-jdk maven nginx git
else
    echo "未识别的包管理器, 请手动安装 JDK17 / Maven / Nginx / git" >&2
    exit 1
fi

# 2. 创建目录
echo "[2/6] 创建应用目录..."
mkdir -p "$JAVA_APP_DIR" "$FRONTEND_DIR"

# 3. 校验代码与凭据是否就位
echo "[3/6] 校验代码就位..."
echo "      后端源码 (java-backend/*) 应已上传到: $JAVA_APP_DIR/   (需存在 pom.xml)"
echo "      前端 (vue-frontend/*) 应已上传到:     $FRONTEND_DIR/"
echo "      DB 凭据: 复制 application.properties.example 为"
echo "               $JAVA_APP_DIR/src/main/resources/application.properties 并填真实值,"
echo "               或写入 /etc/horror/horror.env (DB_USERNAME=/DB_PASSWORD=) 由 systemd 注入。"
if [ ! -f "$JAVA_APP_DIR/pom.xml" ]; then
    echo "✗ 未找到 $JAVA_APP_DIR/pom.xml, 请先上传后端源码后重跑本脚本。" >&2
    exit 1
fi

# 4. 构建 jar
echo "[4/6] 构建后端 jar..."
( cd "$JAVA_APP_DIR" && mvn -q clean package -DskipTests )

# 5. 配置 Nginx
echo "[5/6] 配置 Nginx..."
cp "$SCRIPT_DIR/nginx.conf" "$NGINX_CONF"
nginx -t
systemctl restart nginx
systemctl enable nginx

# 6. 配置 systemd 服务
echo "[6/6] 配置 systemd 服务 ($SERVICE_NAME)..."
cp "$SCRIPT_DIR/horror.service" "/etc/systemd/system/${SERVICE_NAME}.service"
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"

# 防火墙 (失败不致命; 阿里云安全组仍需控制台放行 80)
firewall-cmd --permanent --add-service=http 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true

echo ""
echo "========================================"
echo "  部署完成!"
echo "========================================"
echo "  前端: http://<服务器IP>/weikongbu/"
echo "  API : http://<服务器IP>/api/"
echo ""
echo "  常用命令:"
echo "    状态: systemctl status $SERVICE_NAME"
echo "    日志: journalctl -u $SERVICE_NAME -f"
echo "    重启: systemctl restart $SERVICE_NAME"
echo ""
echo "  数据库: 阿里云 MySQL RDS (凭据经外部配置/环境变量注入, 不入仓库)"
