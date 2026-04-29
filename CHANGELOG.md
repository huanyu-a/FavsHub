# 更新日志

## [v2.0.3] - 2026-04-29

### 🎨 界面优化

#### PromptPro 侧边栏与主页统一
- **侧边栏宽度统一**：PromptPro 侧边栏宽度从 `260px` 调整为 `18rem`，与主页一致
- **文件夹样式统一**：字体大小 `0.875rem`、字重 `600`、选中背景色统一使用 `bg-emerald-500`
- **图标统一**：文件夹及"全部"图标从 Remix Icons 改为 Material Icons
- **标签按钮位置调整**：新建标签按钮从侧边栏头部移至标签标题行，标签标题栏改为 `flex + space-between` 布局
- **SVG 图标**："全部"应用图标从 `<span class="material-icons">apps</span>` 改为内联 SVG

#### 文件夹折叠展开
- **"全部"项支持折叠/展开**：点击"全部"行的箭头图标可折叠或展开所有文件夹
- 箭头图标随状态切换（`expand_less` / `chevron_right`）
- 折叠状态下文件夹通过 `.folder-collapsed` 隐藏

#### 徽章与按钮对齐优化
- **数量徽章**：添加背景药丸样式（`rgba(0,0,0,0.04)` 圆角背景），选中态使用白色半透明背景
- **元素排序**：文件夹名称 `flex:1`（溢出省略）、数量徽章 `order:10`、删除按钮 `order:11`、展开箭头 `order:12`
- **右对齐**：删除按钮和数量徽章统一右对齐

#### 主页精简
- **移除 `sidebar-panel-header`**：侧边栏顶部多余的头部区域已删除
- **移除面包屑**：`#folder-name` 面包屑元素已删除
- **DOM 层级合并**：`<div class="bookmarks-container">` 与 `<div id="bookmarks-list">` 合并为单层 `<div class="bookmarks-container" id="bookmarks-list">`

### 🐛 问题修复

- **标签点击与拖拽冲突**：修复导航页点击标签时误触发拖拽的问题
  - 根因：所有 Sortable.js 实例中设置的 `forceFallback: true` 导致 mousedown/pointerdown 事件被拦截，无法正确区分点击与拖拽
  - 修复：移除全部 4 个 Sortable 实例的 `forceFallback` 和 `fallbackOnBody` 配置，改用原生 HTML5 拖拽 API（内置约 5px 的点击/拖拽判定阈值）
  - 搜索引擎标签页改用自定义 pointer 事件处理，实现精确的拖拽阈值判定（5px）
  - 优化 `_dragJustEnded` 标志位：仅在位置实际发生改变时（`oldIndex !== newIndex || from !== to`）才设置，避免阻止后续点击事件
- **主页滚动失效**：修复合并 DOM 层级后主体区域无法垂直滚动的问题
  - 根因：`main-bundle.css` 中 `#bookmarks-list` 的 CSS 块在 `max-width: 1200px` 后过早闭合（多余的 `}`），导致嵌套的滚动条样式和媒体查询规则被孤立在块外，成为无效 CSS
  - 修复：移除过早的闭合花括号，恢复正确的 CSS 嵌套结构
  - `#bookmarks-list` 使用 `overflow: visible`，由 `main` 元素的 `overflow-auto` 处理滚动

### 📝 技术改进

- PromptPro 暗色模式适配：更新 `.item-count`、`.folder-item.bg-emerald-500 .item-count` 的暗色样式
- `index-sidebar-fix.css`：移除 `.active` 状态样式（PromptPro 统一使用 `bg-emerald-500`）
- `script.js`：为 `folderNameElement` 添加空值检查，防止已移除元素导致 `observer.observe()` 报错
- `icons.js`：新增 `apps` SVG 图标常量

---

## [v2.0.2] - 2026-04-27

### ✨ 新增功能

#### 书签编辑分类修改
- **编辑对话框支持修改分类**：书签编辑弹窗中新增分类下拉选择器，可更改书签所属目录
  - 自定义下拉组件支持层级缩进显示，与侧边栏文件夹树结构一致
  - 切换分类后自动调用 `chrome.bookmarks.move()` 移至目标目录
  - 浅色 / 深色模式完整适配

#### 拖拽排序增强
- **跨分组书签拖拽排序**：书签卡片支持在同一分组内拖拽重排
- **侧边栏文件夹拖拽排序**：导航目录中的文件夹支持拖拽调整层级和顺序
  - 拖拽时自动隐藏子列表，松手后恢复
  - 拖拽过程中禁止卡片 hover 动画和点击事件，防止误触
  - 自定义拖拽时的幽灵元素样式（浅色蓝色 / 深色绿色半透明）

### 🎨 界面重构

#### 侧边栏全新布局
- **页面整体布局变更**：顶部导航栏替换为左侧固定侧边栏
  - 品牌标识区（Logo + FavsHub Workspace）
  - Hub 导航（主页 / 提示词管理）
  - 导航目录文件夹面板
  - 底部工具栏（主题切换 + Chrome 内部页面快捷入口）
- 侧边栏采用毛玻璃效果：`backdrop-filter: blur(22px)` + 渐变半透明背景
- 浅色 / 深色模式完整适配

#### 底部工具栏
- **工具栏链接功能完善**：历史记录、下载管理、密码管理、扩展管理、设置按钮已连接对应 Chrome 内部页面（`chrome://history`、`chrome://downloads` 等）
- **工具栏图标样式统一**：全部 6 个按钮使用一致的渐变背景
  - 浅色：`linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.06))`
  - 深色：`linear-gradient(135deg, rgba(16,185,129,0.18), rgba(59,130,246,0.14))`
- **主题切换按钮 SVG 化**：改用内联 SVG 图标（月亮/太阳），统一图标渲染模式

### 🐛 问题修复

- **设置面板交互无响应**：修复 `SettingsManager.initEventListeners()` 中因旧版 `.settings-icon a` 元素不存在导致空引用崩溃，所有设置面板内部交互（标签切换、背景选择、ESC 关闭等）现已恢复正常
- **设置侧边栏打开时背景可滚动**：`openSettingsSidebar()` 增加 `body overflow hidden`
- **设置关闭时遮罩残留**：确保 `closeSettingsSidebar()` 恢复页面滚动
- **主题切换图标状态同步**：修复 `updateThemeIcon()` 因 `#theme-toggle-btn` 不存在提前 return 导致侧边栏主题按钮不更新图标的问题
- **设置提示气泡默认隐藏**：修复 `settings-update-tip` 在侧边栏底部常驻显示的问题

### 🌐 国际化

- 新增 `categoryLabel`（分类标签）：覆盖 de / en / es / fr / ja / ko / zh_CN / zh_HK / zh_TW 共 9 种语言
- 扩展名称更新：中文名改为「FavsHub·标签导航」

---

## [v2.0.1] - 2026-04-20

### 🐛 问题修复

#### PromptPro 提示词管理
- **修复按钮失效问题**：修正了提示词卡片上复制、编辑、收藏按钮的CSS类名不匹配问题（从 `.prompt-btn-copy` 改为 `.copy-btn` 等）
- **修复提示弹窗显示异常**：解决了Toast提示框在暗色模式下不显示的问题
  - 根因：`main-bundle.css` 中的 `.toast { display: none; }` 覆盖了 `promptpro-bundle.css` 中的样式
  - 修复：更新CSS选择器优先级，使用 `.toast-container .toast` 并添加 `!important`
  - 同时移除了CSS动画，改用JavaScript控制的过渡动画确保兼容性

### 🎨 界面优化

#### 暗色模式配色
- **提示词详情页**：优化模态框背景色、标题、内容区域的暗色配色
- **编辑页面**：优化表单输入框、下拉选择器、标签输入框的暗色配色
- **版本差异对比**：全面优化对比界面的暗色配色
  - 统计信息栏：`+X行新增`/`-X行删除`/`X行未变更` 的背景色和文字颜色
  - 差异内容区域：代码对比背景色、行号颜色、分隔线颜色
  - 版本信息：版本号、标签、时间戳的暗色适配
- **Toast提示框**：优化浅色和暗色模式下的文字颜色对比度
  - 浅色模式：深灰色文字 `#1f2937`
  - 暗色模式：浅灰色文字 `#e5e7eb`

### 📝 技术改进

- 使用更稳定的方式绑定卡片按钮事件，避免重复事件监听
- 优化CSS选择器优先级，确保暗色主题正确覆盖 `main-bundle.css` 的样式
- 改进Toast动画实现，使用 `requestAnimationFrame` 确保浏览器兼容性

---

## [v2.0.0] - 2024-04-09

### ✨ 新功能

- 🎉 **首次发布 FavsHub v2.0.0**
- 🔖 智能书签导航系统
- 🔍 多引擎搜索聚合
- 📝 PromptPro 提示词管理
  - 版本历史与差异对比
  - 多维分类（文件夹/标签）
  - 收藏功能
