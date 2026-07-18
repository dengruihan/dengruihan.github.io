# RuiHan Deng — Personal Website Deployment Guide

> 当前生效部署：海外 VPS `45.154.215.0` + Cloudflare 橙云 + Flexible 模式
> 最后更新：2026-07-18

---

## 1. 架构总览

```
                        https://raymond.agilear.org
                                  │
                                  ▼
                    ┌──────────────────────────────┐
                    │  Cloudflare 边缘（橙云代理）  │
                    │  就近节点 / 自动 HTTPS 终止  │
                    │  全球 CDN 缓存静态资源        │
                    └──────────────────────────────┘
                                  │
                                  │  CF→origin: HTTP :80  (Flexible 模式)
                                  ▼
        ┌────────────────────────────────────────────────────┐
        │  海外 VPS — 45.154.215.0 (Ubuntu 24.04, 公网 v4)  │
        │                                                    │
        │  :80   caddy.service   →  /var/www/personal       │
        │  :443  loom.service     →  代理（与本站无关）     │
        │  :23000 loom (vmess)                              │
        │  :22   sshd                                        │
        └────────────────────────────────────────────────────┘
```

**用户访问路径**：浏览器 → CF 边缘（HTTPS，受 CF 边缘证书保护）→ 回源走 HTTP 80 明文 → caddy → 静态文件

**关键决策**：
- 选用 **Cloudflare Flexible** 模式（非 Full / Auto），因为源站 443 被 loom 占用，caddy 只能走 80。Auto / Full 会触发 525。
- 不使用 Cloudflare Origin 证书（曾用过但因阿里云 ICP 备案劫持 → 改换海外服务器 → 不再需要）。
- 静态站无敏感数据、无表单、无 cookie，CF→origin 明文段无安全风险。

---

## 2. 服务器清单

### 2.1 现役：海外 VPS（45.154.215.0）

| 项 | 值 |
|---|---|
| 公网 IPv4 | `45.154.215.0`（直接绑 eth0，无 NAT） |
| 公网 IPv6 | `2604:9cc0:1e::bf84:bd1b` |
| OS | Ubuntu 24.04.3 LTS (Noble) |
| Kernel | 6.8.0-79-generic |
| Disk | 20G vda1，15G 可用 |
| Caddy 版本 | v2.11.4（官方 apt 仓库） |
| SSH 用户 | `root` |
| SSH 鉴权 | 公钥 `~/.ssh/id_ed25519_alicloud`（mac 本机）+ 密码双可用 |

### 2.2 已废弃：阿里云杭州（47.98.161.252）

ICP 备案劫持导致入站 80/443 被「Beaver」WAF 拦截，最终弃用。残留物见第 7 节「待清理清单」。

### 2.3 SSH 别名（建议加入 mac `~/.ssh/config`）

```ssh-config
Host overseas-vps
    HostName 45.154.215.0
    User root
    IdentityFile ~/.ssh/id_ed25519_alicloud
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

> 注意：`id_ed25519_alicloud` 这把密钥虽然名字带 "alicloud"，**实际上两台服务器都使用它**。本机 `~/.ssh/config` 里若已声明该 Host 段，**必须加 `IdentitiesOnly yes`**，否则 ssh 会按文件尝试多把密钥，连 loom 这台会失败。

---

## 3. 服务器上的文件位置（45.154.215.0）

### 3.1 静态站点

```
/var/www/personal/
├── .gitignore
├── 404.html
├── index.html
├── assets/
│   ├── avatar.jpg
│   ├── favicon.svg
│   ├── icons.svg
│   └── cursors/win95.svg
├── css/
│   ├── animations.css
│   ├── friend-links.css
│   ├── main.css
│   └── tokens.css
├── data/
│   ├── about.json
│   ├── blog.json
│   ├── links.json
│   ├── projects.json
│   └── skills.json
└── js/
    └── main.js
```

属主：`caddy:caddy`，目录 755 / 文件 644。

### 3.2 Caddy 配置

文件：`/etc/caddy/Caddyfile`

```caddyfile
{
    auto_https off
    admin off
}

http://raymond.agilear.org {
    encode gzip zstd
    root * /var/www/personal

    # 不对外提供隐藏文件（.git、.gitignore 等），保留 .well-known 备用
    @dotfiles {
        path /.*
        not path /.well-known*
    }
    respond @dotfiles 404

    file_server
    try_files {path} /index.html
    header {
        Cache-Control "no-cache"
    }
}

http://:80 {
    respond "caddy ok"
}
```

要点解释：
- **`auto_https off`**：禁用 caddy 自动签证书 + 抢 443。本机 443 由 loom 占用，caddy 不得尝试绑定。
- **`admin off`**：关闭 admin API endpoint，避免占额外内存端口，也更安全。
- **`http://raymond.agilear.org`**：基于 Host 头路由，仅 80 端口。
- **`try_files {path} /index.html`**：SPA 式回退，未知路径返回 index.html 而非 404。
- **`@dotfiles` → 404**：站点根目录已纳入 git 管理，必须拦截 `/.git*` 等隐藏文件，否则仓库可被整站拖下。2026-07-18 实测拦截前 `/.git/config` 返回 200。
- **`http://:80`**：兜底 80，给健康检查/未带 Host 头的请求一个响应，避免 CF 探测时拿到 connection reset。

### 3.3 服务管理

```bash
# 状态 / 启动 / 停止 / 重启 / reload
systemctl status caddy
systemctl start caddy
systemctl stop caddy
systemctl restart caddy
systemctl reload caddy

# 实时日志
journalctl -u caddy -f --no-pager

# 最近日志
journalctl -u caddy -n 100 --no-pager
```

Caddy 已 `enabled`，开机自启。

---

## 4. Cloudflare 配置

### 4.1 DNS

```
Type: A
Name: raymond
IPv4: 45.154.215.0
Proxy status: 🟠 Proxied (橙云)
TTL: Auto
```

### 4.2 SSL/TLS → Overview → Encryption mode

```
○ Off
○ Flexible       ← 当前选中
○ Full
○ Full (strict)
```

### 4.3 重要：源站端口不能让 CF 走 443

源站 443 被 loom 占用且用 `loom.agilear.org` 签证书。若 SSL/TLS 模式为 Full / Full (strict) / Auto，CF 会在 443 跟 loom 握手，loom 用错的 SNI 响答 → 525 SSL handshake failed。所以**必须保持 Flexible**。

如未来想升级 Full，需走第 8 节扩展路径，让 caddy 在其它 HTTPS 端口起 LE 证书，并用 Cloudflare Origin Rules 把回源端口改过去（需 Pro 套餐）。

---

## 5. 本地项目结构

`/Users/raymond/Documents/New_personal_website/`

- 纯静态，无 build step
- 内容数据放 `data/*.json`，改 json 改内容不需要碰 template
- Git: 分支 `main`，远端 GitHub
- gitignore 排除 `node_modules` `dist` `.cursor` `.vite` `skills-lock.json` 等

---

## 6. 常用运维命令

### 6.1 推送本地修改到生产

本地仓库根目录执行：

```bash
rsync -avz --delete \
  --exclude='node_modules' --exclude='.git' --exclude='dist' \
  --exclude='.cursor' --exclude='.vite' --exclude='.agents' \
  --exclude='.github' --exclude='.DS_Store' --exclude='skills-lock.json' \
  --exclude='README.md' --exclude='*.local' \
  -e "ssh -i ~/.ssh/id_ed25519_alicloud -o IdentitiesOnly=yes -o StrictHostKeyChecking=no" \
  ./ root@45.154.215.0:/var/www/personal/
```

Caddy `file_server` 实时读盘，无需 reload / restart。

### 6.2 修改 Caddyfile 并生效

```bash
# 本地写好 Caddyfile 后
scp -i ~/.ssh/id_ed25519_alicloud -o IdentitiesOnly=yes \
    /path/to/Caddyfile root@45.154.215.0:/etc/caddy/Caddyfile

# 远程验证 + 生效
# 注意：因全局配置了 admin off，caddy reload（走 admin API）会失败，必须用 restart
ssh -i ~/.ssh/id_ed25519_alicloud -o IdentitiesOnly=yes root@45.154.215.0 \
    'caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile && systemctl restart caddy'
```

### 6.3 端到端验证（从 mac 走 CF）

```bash
# 主页
curl -sI https://raymond.agilear.org/ -o /dev/null \
  -w "HTTP=%{http_code} ip=%{remote_ip} time=%{time_total}s\n"
curl -s https://raymond.agilear.org/ | grep -oE "<title>[^<]+</title>"

# 关键资源
for p in css/main.css js/main.js data/about.json assets/avatar.jpg; do
  curl -sI https://raymond.agilear.org/$p -o /dev/null -w "  /$p → %{http_code}\n"
done

# CF 边缘节点（观察 cf-ray 末尾字母）
curl -sI https://raymond.agilear.org/ | grep -i "cf-ray"
```

### 6.4 不经过 CF、直连源站排障

```bash
# 用 Host header 模拟，但 IP 直接打源站
curl -sI -H "Host: raymond.agilear.org" http://45.154.215.0/ -o /dev/null \
  -w "HTTP=%{http_code} server=%{remote_ip}\n"
```

预期 `HTTP=200`、`server=45.154.215.0`。若失败，问题在源站或本机出口链路，不是 CF。

---

## 7. 待清理清单

阿里云那台 47.98.161.252 上的残留物（不再影响 raymond 访问，但占磁盘 + 含泄露过的私钥）：

```bash
# 清理命令（确认无误后执行）
ssh alicloud-server '
  rm -f /etc/caddy/certs/raymond.agilear.org.crt
  rm -f /etc/caddy/certs/raymond.agilear.org.key
  rmdir /etc/caddy/certs 2>/dev/null
  rm -rf /var/www/personal
  rm -f /etc/caddy/Caddyfile.bak-*
'
```

⚠ **外加必须由你在 Cloudflare 操作的作废步骤**：
CF Dashboard → SSL/TLS → Origin Server → Edge Certificates 列表 → 找到签给 `raymond.agilear.org` 的那张 Origin CA 证书 → Revoke。

原因：生成那张证书时的私钥曾整段粘贴到一次会话对话中，无论是否仍使用，私钥泄露后都应作废。

---

## 8. 未来扩展路径（不必现在做）

想做更严的安全 / 国外更稳的加速 / 国内合规，三选一：

### 8.1 升级到 Full (strict) + Cloudflare Origin Rules（需 Pro）

- caddy 改听 `127.0.0.1:8443`，自起 Let's Encrypt ACME 自动签证书
- CF Dashboard → Rules → Origin Rules：if hostname == `raymond.agilear.org` → destination port = `8443`
- SSL/TLS → Full (strict)

### 8.2 Cloudflare Tunnel（推荐，免公网入站端口）

- 服务器装 `cloudflared`
- 在 CF Zero Trust → Tunnels 创建一条 tunnel，token 给 cloudflared run
- caddy 监听 `127.0.0.1:8080`，cloudflared 路由 `raymond.agilear.org` → `http://127.0.0.1:8080`
- 优点：源站不需开任何公网入站端口，无 ICP 风险，loom 与 caddy 完全隔离
- 唯一注意：cloudflared 出口流量走 CF，需对 loom 的 vmess 流量做路由区分

### 8.3 申请 ICP 备案后改回国服

如果希望国内访问体验更好（直连不绕 CF 边缘），可走 ICP 备案路：

- 域名所有者证件与备案主体一致 (`agilear.org` 在 Cloudflare Registrar，备案可能被退回 1-2 次要求补材料)
- 备案成功后改 DNS 指向国内服务器，caddy 用 LE 自动签证书
- 备案周期：7-20 工作日

---

## 9. 紧急排障备忘

| 症状 | 可能原因 | 修复 |
|---|---|---|
| 525 SSL handshake failed | CF SSL 模式不是 Flexible / 源站 443 被 loom 干扰 | 切回 Flexible |
| 521 Web server is down | caddy 进程挂了 / 80 未监听 | `systemctl status caddy`、`systemctl restart caddy` |
| 522 Connection timed out | 源站网络中断 / 防火墙挡 | `ssh` 进去看 `ss -tlnp`，确认 `:80` 在 caddy 进程下 |
| 523 Origin is unreachable | VPS 整机不可达 | 进云厂商控制台看实例状态 |
| 524 A timeout occurred | caddy 卡死 | `journalctl -u caddy -n 200` 看是否有占用 |
| 301/308 重定向循环 | SSL 模式设了 Flexible 同时 origin 强制 HTTPS 重定向 | caddy 不要监听 443 / 不要强制 HTTPS 重定向 |
| 浏览器看到中文 ICP 备案页 | 走的是没备案的国内 IP | 检查 DNS 是否被改回阿里云 |

### 排障最快的两条命令

```bash
# 1. 直连源站看源站是否活着
curl -sI -H "Host: raymond.agilear.org" http://45.154.215.0/ -o /dev/null -w "%{http_code}\n"

# 2. 走 CF 看边缘是否健康
curl -sI https://raymond.agilear.org/ -o /dev/null -w "%{http_code} %{remote_ip}\n"
```
- 第 1 条返回 200 第 2 条 ≠ 200 → 问题在 CF 设置
- 第 1 条就失败 → 问题在源站，`ssh root@45.154.215.0` 上去查
- 第 1 条 timeout 但 SSH 仍可达 → 80 端口被防火墙挡了

---

## 10. 关键文件清单（备份用）

| 文件 | 在哪里 | 重要度 |
|---|---|---|
| `/etc/caddy/Caddyfile` | 海外 VPS | ★★★ 备份到本地 git |
| `/var/www/personal/` 全部内容 | 海外 VPS | ★★★ 已与本地仓库同步 |
| `/var/lib/caddy/` | caddy 持久化状态 | ★ 不需备份 |
| Cloudflare DNS / SSL 配置 | CF Dashboard | ★★ 截图存档 |
| `~/.ssh/id_ed25519_alicloud` | 本机 | ★★★ 不可丢 |

---

## 11. 当前状态快照（2026-07-18）

- ✅ https://raymond.agilear.org 经 CF 边缘返回 200
- ✅ 主页 10682B，`<title>RuiHan Deng — Field Survey</title>`
- ✅ CSS / JS / JSON / 图片 全 200
- ✅ 命中 CF 阿姆斯特丹边缘节点（`cf-ray` 末尾 AMS）
- ✅ caddy.service active，开机自启
- ✅ loom.service 未受影响，443 仍由其占用
- ⏳ 阿里云残留物待清理
- ⏳ Cloudflare Origin 证书待 Revoke（私钥曾泄露）