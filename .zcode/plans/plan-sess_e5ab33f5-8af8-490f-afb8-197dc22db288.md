# 重写方案：滚动驱动的 3D 叙事个人站

## 核心架构

**渐进增强，而非推倒重来。** 保留现有全部 DOM 渲染管线（`js/main.js` + `data/*.json` 不变），在其上加一个 WebGL 场景层。3D 激活时给 `<html>` 加 `.scene-3d` class 切换各区块的 3D 样式；`prefers-reduced-motion` 用户不加载 WebGL，完整保留现有 2D 体验。

- **一个固定全屏 canvas**（z-index 0，`pointer-events: none`），由**原生滚动**驱动（现有 CSS scroll-driven animations 依赖真实滚动，禁止虚拟滚动）
- **单一 InstancedMesh（桌面 ~1000 / 移动 ~350 个小方块）贯穿全站**：每个区块定义一套"阵型"（Float32Array 位置/颜色/缩放），滚动时在相邻阵型间带 stagger 缓动插值 —— 服务器爆炸、组网、成浪、排队、上墙、连线全是同一批方块的形态切换
- **HTML 覆盖层卡片**：3D 场景只放薄板/光点/连线等纯视觉元素；真实文字卡片用 `Vector3.project(camera)` 每帧换算成 `translate3d` 贴到 3D 锚点上。文字可选中、可点击、对屏幕阅读器友好，现有博客弹层和 hash 路由原样复用
- **Three.js 本地 vendor**（`assets/vendor/three.module.js`，锁定版本）+ import map + 原生 ESM，零构建，部署流程不变

## 滚动分镜（对应现有 7 个 SURVEY 区块）

| 区块 | 3D 表现 |
|---|---|
| 00 Hero | 程序化服务器模型（机箱+硬盘笼+呼吸 LED+散热栅格，细节网格组建）缓慢旋转；滚动推近到面板微距。DOM 的 HUD 框/名字层原样浮在上方 |
| 01 About | 服务器拉远并开始松散解体，为爆炸蓄势（过渡段） |
| 02 Skills | 服务器彻底炸成方块云 → 组装成 3~4 层正方形阵列（神经网络层），层间发光连线脉冲流动；现有"信号表"式技能条 DOM 保留在版式流中 |
| 03 Journey | 镜头摆到**右后斜上方**；方块群化为正弦波浪面起伏；经历卡片（HTML 覆盖层）锚定在浪面上，随滚动**自右向左**飘过 |
| 04 Projects | 方块聚成 N 块**半透明薄板**沿 Z 轴由近及远排队（纵深卡组）；滚动 scrub：整叠向镜头推进，最前一张向上掀走淡出，下一张补位；项目图文用现有面板 markup 贴到当前卡的投影位置。区块高度仍由 JS 按卡片数计算（复用现有 `--projects-scroll-h` 思路） |
| 05 Blog | 雾加浓成"深邃空间"+ 稀疏星点；博客卡片从镜头背后飞掠而过、贴到远处一面墙阵上；到位后卡片可点，打开现有博客弹层 |
| 06 Links | 方块收拢成星座式关系图谱：节点=友链卡片（HTML 覆盖层），边=发光线（老师节点居中），整体微微浮动；卡片可点跳外链 |
| 07 Contact | 图谱散去，方块在远处重新聚成小小的服务器剪影作为首尾呼应；页脚 DOM 原样 |

配色沿用现有 tokens（ink/egg/reed/signal），雾做纵深，无阴影贴图（发光材质+几盏粉/金点光），胶片颗粒层（z 2000）保持在最上方统一画面。

## 文件改动

```
assets/vendor/three.module.js     新增（下载锁定版本）
index.html                        +import map、+canvas、+场景入口（feature-detect 后启动）
js/main.js                        基本不动；渲染完成后派发事件供场景层收集锚点
js/scene/main.js                  入口与能力检测（WebGL? reduced-motion? 移动?）
js/scene/engine.js                renderer/相机/阻尼滚动驱动/resize/visibilitychange 暂停/contextlost 恢复
js/scene/formations.js            7 套阵型生成器（服务器形/层阵/浪面/卡组/墙阵/图谱/远影）
js/scene/morph.js                 InstancedMesh 与阵型插值
js/scene/story.js                 分镜编排：区间进度计算 + 相机关键帧插值
js/scene/server-model.js          Hero 细节服务器组（爆炸时淡出，方块从服务器形状起飞）
js/scene/overlays.js              3D→屏幕投影，HTML 卡片同步与显隐
css/scene.css                     canvas 层、覆盖卡片定位、.scene-3d 下各区块重样式（隐藏旧横向轨道等）
css/main.css                      小改：.scene-3d 时 body 背景透明让出 canvas（html 保持 ink 底色保证首帧）
DEPLOYMENT.md                     补一节：vendor 文件与无构建说明
```

**移动端（scene-lite 模式）**：同一套分镜但方块减到 ~350、关抗锯齿、pixelRatio ≤1.5、相机运动简化为固定机位+缓漂，纵深卡组核心交互保留。

## 开发与安全发布

**这是正在线上服务的目录**，所以：在 `/var/www/scene-dev/` 搭建完整副本开发，`python3 -m http.server` 本地验证（含移动模拟、reduced-motion 模拟、Chrome/Firefox/Safari）；全部就绪后才同步进 `/var/www/personal/` 并 git 提交 —— 线上站在开发期间不受影响。

## 主要风险与对策

- **覆盖层与 3D 抖动** → 同一 rAF 帧内先算相机再写 transform
- **文字在 3D 背景上可读性** → 文本块后加深色渐变 scrim，保持现有对比度
- **性能** → 全 instancing、无阴影、雾代替远景几何、隐藏标签页暂停渲染
- **WebGL 上下文丢失** → 监听 contextlost 自动重建；重建失败则退回 2D 模式

## 执行顺序

1. 脚手架：vendor 下载、staging 副本、引擎空转 + 调试 HUD
2. 阵型引擎 + 服务器模型 + Hero 推近
3. 爆炸 → 神经层阵（Skills）
4. 波浪 + 漂浮经历卡（Journey）
5. 纵深卡组 + 项目覆盖卡（Projects）
6. 博客飞墙上阵（Blog）
7. 关系图谱（Links）+ Contact 收尾
8. 移动端 lite 调优、reduced-motion、contextlost、性能
9. 跨浏览器验证 → 同步上线 → git 提交 → 更新 DEPLOYMENT.md
