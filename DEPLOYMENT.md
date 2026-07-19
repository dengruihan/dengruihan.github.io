# RuiHan Deng — Personal Website Deployment Guide

> 当前生效部署：海外 VPS `45.154.215.0` + Cloudflare 橙云 + Flexible 模式
> 最后更新：2026-07-19

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

**用户访问路径**：浏览器 → CF 边缘（HTTPS）→ 回源走 HTTP 80 明文 → caddy → 静态文件

**关键决策**：
- 选用 **Cloudflare Flexible** 模式（非 Full / Auto），因为源站 443 被 loom 占用，caddy 只能走 80。Auto / Full 会触发 525。
- 静态站无敏感数据、无表单、无 cookie，CF→origin 明文段无安全风险。

---

## 2. 服务器与 SSH

| 项 | 值 |
|---|---|
| 公网 IPv4 | `45.154.215.0`（直接绑 eth0，无 NAT） |
| 公网 IPv6 | `2604:9cc0:1e::bf84:bd1b` |
| OS | Ubuntu 24.04.3 LTS (Noble) |
| Caddy 版本 | v2.11.4（官方 apt 仓库） |
| SSH 用户 | `root` |
| SSH 鉴权 | 公钥 `~/.ssh/id_ed25519_alicloud`（mac 本机）+ 密码双可用 |

### SSH 别名（mac `~/.ssh/config`）

```ssh-config
Host overseas-vps
    HostName 45.154.215.0
    User root
    IdentityFile ~/.ssh/id_ed25519_alicloud
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

> 注意：`id_ed25519_alicloud` 名字带 "alicloud"，**实际两台服务器都用它**。必须加 `IdentitiesOnly yes`，否则 ssh 会逐个尝试多把密钥导致连接失败。

---

## 3. 服务器上的文件位置

### 3.1 静态站点

```
/var/www/personal/
├── .gitignore
├── 404.html
├── index.html            # 含内联 boot loader 脚本（就绪清单见第 10 节）
├── assets/
│   ├── avatar.jpg
│   ├── favicon.svg
│   ├── icons.svg
│   ├── portrait.webp     # Hero 人物立绘（AI 抠图，透明背景）
│   ├── cursors/win95.svg
│   └── vendor/
│       └── three.module.js   # Three.js r169 minified，本地 vendor（无构建步骤）
├── css/
│   ├── animations.css    # hero 入场动画由 html.is-ready 门控
│   ├── friend-links.css
│   ├── main.css
│   ├── scene.css
│   └── tokens.css
├── data/                 # 内容数据（改 json 不改模板）
│   ├── about.json / blog.json / links.json / projects.json / skills.json
└── js/
    ├── main.js           # 数据渲染管线（2D 基线），完成后发 site:rendered
    └── scene/            # 3D 场景层（渐进增强，原生 ESM + import map）
        ├── main.js       # 入口：能力检测，发 scene:ready / scene:skipped
        ├── engine.js     # renderer、阻尼滚动驱动、章节度量、主循环
        ├── formations.js # 8 套方块阵型生成器
        ├── morph.js      # 单 InstancedMesh 阵型插值
        ├── story.js      # 分镜编排：相机关键帧、章节动画、覆盖卡锚点
        ├── server-model.js # Hero 细节服务器（程序化建模）
        ├── overlays.js   # 3D→屏幕投影，HTML 卡片同步
        └── palette.js    # 设计令牌颜色的 WebGL 镜像
```

**页面形态**：桌面端默认 3D 叙事层（hero = 人物立绘 + 摆正的服务器，Field Notes = 环绕运镜）；移动端精简模式；`prefers-reduced-motion` / WebGL 失败回退 2D。调试：`?scene-debug` 显示 t 与 FPS；`?scene-goto=1.25` 跳转章节浮点位置；`?loader-hold` 定格加载页；`window.__scene` 读内部状态。

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

要点：
- **`auto_https off`**：443 由 loom 占用，caddy 不得尝试绑定。
- **`admin off`**：关闭 admin API。副作用：`caddy reload` 不可用，改配置必须 `systemctl restart caddy`。
- **`@dotfiles` → 404**：站点根目录纳入 git 管理，必须拦截 `/.git*`，否则仓库可被整站拖下。
- **`http://:80`**：兜底，给健康检查/未带 Host 头的请求一个响应。

### 3.3 服务管理

```bash
systemctl status caddy      # 状态（已 enabled，开机自启）
systemctl restart caddy     # 改 Caddyfile 后生效（reload 不可用，见上）
journalctl -u caddy -f --no-pager   # 实时日志
```

Caddy `file_server` 实时读盘，改站点文件无需 restart。

---

## 4. Cloudflare 配置

```
DNS:      A 记录  raymond → 45.154.215.0  🟠 Proxied  TTL Auto
SSL/TLS:  Encryption mode = Flexible（必须保持，见下）
```

**源站端口不能让 CF 走 443**：443 被 loom 占用且用 `loom.agilear.org` 签证书。若 SSL 模式为 Full / Full (strict) / Auto，CF 会在 443 跟 loom 握手拿到错误 SNI → 525。必须保持 Flexible。

---

## 5. 本地项目结构

`/Users/raymond/Documents/New_personal_website/` — 纯静态，无 build step；内容改 `data/*.json`；git 分支 `main`。

---

## 6. 常用运维命令

### 6.1 推送本地修改到生产

```bash
rsync -avz --delete \
  --exclude='node_modules' --exclude='.git' --exclude='dist' \
  --exclude='.cursor' --exclude='.vite' --exclude='.agents' \
  --exclude='.github' --exclude='.DS_Store' --exclude='skills-lock.json' \
  --exclude='README.md' --exclude='*.local' \
  -e "ssh -i ~/.ssh/id_ed25519_alicloud -o IdentitiesOnly=yes -o StrictHostKeyChecking=no" \
  ./ root@45.154.215.0:/var/www/personal/
```

⚠️ **注意方向**：这条 rsync 是 mac → 服务器的**全量覆盖**。2026-07 起大量改动是直接在服务器仓库里开发提交的，本地 mac 已落后。跑这条命令前先在服务器上 `git status` 确认无未提交/未同步改动，否则会静默覆盖服务器端的新代码。

### 6.2 修改 Caddyfile 并生效

```bash
scp -i ~/.ssh/id_ed25519_alicloud -o IdentitiesOnly=yes \
    /path/to/Caddyfile root@45.154.215.0:/etc/caddy/Caddyfile

ssh -i ~/.ssh/id_ed25519_alicloud -o IdentitiesOnly=yes root@45.154.215.0 \
    'caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile && systemctl restart caddy'
```

### 6.3 端到端验证（从 mac 走 CF）

```bash
curl -sI https://raymond.agilear.org/ -o /dev/null \
  -w "HTTP=%{http_code} ip=%{remote_ip} time=%{time_total}s\n"

# 检查线上 JS 是否与服务器磁盘一致（排查"改了没生效"类问题）
diff <(curl -s https://raymond.agilear.org/js/scene/story.js) \
     <(ssh overseas-vps cat /var/www/personal/js/scene/story.js) \
  && echo IDENTICAL || echo STALE
```

### 6.4 绕过 CF、直连源站排障

```bash
curl -sI -H "Host: raymond.agilear.org" http://45.154.215.0/ -o /dev/null \
  -w "HTTP=%{http_code} server=%{remote_ip}\n"
```

---

## 7. GitHub 公开备份（dengruihan.github.io）

站点在 GitHub 有一份**公开镜像**：`github.com/dengruihan/dengruihan.github.io`（同时是 GitHub Pages 站点）。

**⚠️ 该仓库是 public，绝不可把本文件（DEPLOYMENT.md）推上去** —— 里面有 IP、端口、SSH 等全部基础设施细节。推送一律用「覆盖层」方式：

```bash
# 1. 克隆公开仓库（只读无需认证）
git clone git@github.com:dengruihan/dengruihan.github.io.git /tmp/ghcheck

# 2. 把服务器站点文件覆盖进去（排除敏感与本地文件）
rsync -a --exclude='.git' --exclude='DEPLOYMENT.md' --exclude='.zcode' --exclude='.gitignore' \
    /var/www/personal/ /tmp/ghcheck/

# 3. 提交并推送
cd /tmp/ghcheck && git add -A && git commit -m "..." && git push origin main
```

- **服务器本地仓库**与 GitHub 仓库是**两套独立历史**，已配置 `origin` 仅供 fetch 对比，**不要直接 push**。
- **推送认证**：专用 SSH 密钥 `~/.ssh/id_ed25519_github`（GitHub Title "Tud Server"），`~/.ssh/config` 已为 github.com 指定。

---

## 8. 紧急排障备忘

| 症状 | 可能原因 | 修复 |
|---|---|---|
| 525 SSL handshake failed | CF SSL 模式不是 Flexible | 切回 Flexible |
| 521 Web server is down | caddy 进程挂了 / 80 未监听 | `systemctl restart caddy` |
| 522 Connection timed out | 源站网络中断 / 防火墙挡 | `ssh` 进去看 `ss -tlnp` 确认 `:80` 在 caddy 下 |
| 523 Origin is unreachable | VPS 整机不可达 | 云厂商控制台看实例 |
| 301/308 重定向循环 | Flexible 模式下 origin 强制 HTTPS 跳转 | caddy 不要监听 443 / 不要强制 HTTPS 重定向 |
| 改了代码线上不生效 | 浏览器缓存旧 ES 模块 | 硬刷新 Cmd/Ctrl+Shift+R；再用 6.3 的 diff 命令核对线上文件 |

### 排障最快的两条命令

```bash
# 1. 直连源站看源站是否活着
curl -sI -H "Host: raymond.agilear.org" http://45.154.215.0/ -o /dev/null -w "%{http_code}\n"

# 2. 走 CF 看边缘是否健康
curl -sI https://raymond.agilear.org/ -o /dev/null -w "%{http_code} %{remote_ip}\n"
```

- 第 1 条返回 200 第 2 条 ≠ 200 → 问题在 CF 设置
- 第 1 条就失败 → 问题在源站

---

## 9. 关键文件清单（备份用）

| 文件 | 在哪里 | 重要度 |
|---|---|---|
| `/etc/caddy/Caddyfile` | 海外 VPS | ★★★ 备份到本地 git |
| `/var/www/personal/` 全部内容 | 海外 VPS | ★★★ 已与服务器 git 仓库同步 |
| Cloudflare DNS / SSL 配置 | CF Dashboard | ★★ 截图存档 |
| `~/.ssh/id_ed25519_alicloud` | 本机 | ★★★ 不可丢 |
| `~/.ssh/id_ed25519_github` | 本机 | ★★★ 公开镜像推送用 |

---

## 10. 维护日志

### 2026-07-19 — Hero 极简改造 + 加载页 + Field Notes 运镜三轮修复

**Hero 改造**（commit `31a4e4b`）：hero 改为三栏极简构图（左文案 / 人物立绘 / 右侧大名），3D 服务器相机从侧前方特写改为正面平视、去掉闲置摇摆，立绘立于服务器前；立绘由 rembg+u2netp 自动抠图（完整 u2net 模型在本机 937MB 内存上 OOM，须用轻量版）。

**Boot loader**（commit `8a93f52`）：内联脚本就绪清单 = fonts.ready + site:rendered + portrait load + scene 首帧（scene:ready/skipped），750ms 最短展示 + 6.5s 硬超时；hero/nav 入场动画改 `html.is-ready` 门控。调试参数 `?loader-hold`。

**Field Notes 环绕运镜 —— 五轮修复记录**：

需求：About 章节相机随滚动从左上到右下环绕服务器模型，hero 上滑服务器正常飞散。

1. **尝试 1（轨道首版）**：About 关键帧改为轨道起点（左上），`cameraAt()` 加轨道段 `t∈[1,1.5]`，方位角 -0.55→0.75 rad，半径 8.6（后为防 DOM 遮挡收紧到 7.2）。
   结果：用户看不到轨道——服务器在 Field Notes 居中时"卡住"，随后突然消散。
2. **尝试 2（诊断停靠 + 释放首版）**：根因是 hero 推近（HERO_NEAR）的权重 `z=easeInOut(scrub[0])`，而 hero 区高恰好 100vh → `scrub[0]` 滚动 0.55vh 即饱和为 1 → `t<1` 全程相机被钉在前面板特写（约 100vh 滚动），t=1 时又硬切到轨道起点。加释放项 `1-smooth((t-0.55)/0.4)`，轨道窗口前移 `t∈[0.8,1.4]`、摆幅加宽到 -0.7→0.85 rad，溶解放慢到 `t∈[1.1,1.85]`。
   结果：仍"停大半个视口"——释放起点 t=0.55 按章节度量折算 ≈ 滚动 60vh 才开始。
3. **尝试 3（释放提前）**：释放改为 `1-smooth((t-0.02)/0.43)`——推近一完成拉回立即接续，特写停留 <2vh；相机路径：正面→轻探→拉回抬升→环绕→溶解，全程无停靠。
   验证：playwright CDP（复用 `~/.cache/ms-playwright` 的 headless_shell，`executable_path` 指定）按 `?scene-goto=t` 逐点截图，t=0.04/0.29/0.59/0.99 四个位置机位各不相同。
4. **尝试 4（内容退场，当前线上版）**：症状是"镜头左移一小段就卡住，随后直接溶解"。探针定位：**相机从未卡住**——camX 从 -4.11（t=0.89）扫到 +5.37（t=1.42）完全正常；根因是轨道窗口 t∈[0.8,1.4] 对应 scrollY 862→1476，而 about 的 2D 内容从 scrollY=900 起占满视口（高 1256px），**环绕全程在文字墙后面执行**；journey/blog/links 都在 3D 模式折叠 DOM 换 overlay，唯独 about 保留完整 2D 排版。修复：about 内容随滚动两段退场——A 组（header+about-grid）t∈[0.78,1.02]、B 组（goals-grid）t∈[0.88,1.14] 渐隐上移（engine.js 每帧写 `--about-exit-a/b`，scene.css 映射 opacity/transform，`about-exited` 类关 pointer-events），回滚上滑可恢复，2D/reduced-motion 回退不受影响。
   验证：playwright 无缓存 profile 滚轮连滚 + 逐帧截图（t=1.0 左上视角、1.2 右前视角均清晰可见），opacity/class 断言三项全过。`window.__scene` 新增 `cam()` 探针（仅 `?scene-debug`）。

**排查教训（"镜头卡住"类问题分层）**：① diff 线上 vs 磁盘排除部署；② 全新 profile 排除浏览器缓存；③ 探针量相机位置排除相机层；④ 隐藏 DOM 对比排除遮挡层。本次根因在第 ④ 层——**运镜的主体是否可见，和运镜本身是否执行，是两件事**。

5. **尝试 5（滚动房间 + 时序重排，当前线上版）**：新反馈两点——完全进入 Field Notes 前镜头应更早开始右下移动；内容消失太早、卡片没看完就转场。分析：尝试 4 的渐隐退场与"延长阅读时间"存在根本张力（内容停在中央 = 扫掠被遮）。改为给 about 加滚动房间（`html.scene-3d .section-about { min-height: 200vh }`，与 journey/blog/links 同模式）：内容自然滚出、阅读节奏完全交给用户滚动，渐隐退场机制整体移除（engine.js 的 `--about-exit-*` 与对应 CSS 一并删除）。时序：轨道窗口 t∈[0.6,1.75]、权重淡入 [0.6,0.72] 淡出 [1.75,1.95]、缓动改后载 `e=p²`（进入前缓慢右下漂移 → 阅读期近乎静止 → 内容滚走后主扫掠在干净舞台上完成）；溶解推迟到 `reveal=smooth((t-1.45)/0.5)`、`serverOpacity=1-smooth((t-1.45)/0.55)`，阅读期 t∈[1,1.4] 全程无动画。
   验证：scene-goto 逐点帧条（actual_t 0.76→1.96），`cam()` 探针数值与理论 az 逐点吻合；t=1.04 卡片完整可读无渐隐，t=1.30 舞台干净正面，t=1.48 右前视角+方块涌现，t=1.78 溶解过半衔接 skills。
   注意：帧条脚本里 `scrollTo` 后 `actual_t` 与目标有偏差是 headless 低帧率 + 滚动阻尼（τ≈180ms，dt clamp 50ms）所致，等待阻尼收敛后读数即可，不是编排问题。

> ⚠️ 顺带发现：线上响应头 `cache-control: max-age=14400`（4h 浏览器硬缓存），与本文档 §3.2 Caddyfile 的 `no-cache` 不符——需核对 CF Browser Cache TTL 设置或服务器实际 Caddyfile。在此排查"改了没生效"时，注意 4 小时硬缓存窗口期内普通刷新拿不到新 ES 模块。

**教训（排查"改了没生效"的标准流程）**：先 `diff <(curl 线上文件) <(磁盘文件)` 排除 CF/部署问题，再怀疑浏览器缓存（硬刷新），最后才改逻辑。本次尝试 2 后线上文件其实已是新版，用户端旧行为来自浏览器缓存的旧 ES 模块。

### 历史遗留安全待办

- **Cloudflare Origin CA 证书待吊销**：阿里云时期签给 `raymond.agilear.org` 的 Origin 证书私钥曾在会话中泄露，需在 CF Dashboard → SSL/TLS → Origin Server 吊销该证书。（阿里云机器 47.98.161.252 已弃用，残留物清理与否不再影响本站。）
