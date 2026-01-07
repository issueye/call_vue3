# 项目摘要 - 医疗呼叫客户端 (call_vue3)

## 项目概述

医疗呼叫客户端桌面应用程序，基于 Wails v2 框架构建，支持 Windows/macOS/Linux 平台。该应用用于医院场景的叫号管理，支持患者排队、呼叫、优先处理等功能。

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Wails | v2 |
| 后端 | Go | 1.20+ |
| 前端框架 | Vue 3 | ^3.4.0 |
| 构建工具 | Vite | ^5.0.10 |
| 状态管理 | Pinia | ^2.1.7 |
| 路由 | Vue Router | ^4.2.5 |
| HTTP客户端 | Axios | ^1.6.2 |
| MQTT客户端 | mqtt.js | ^5.3.0 |
| 工具库 | VueUse | ^10.7.0 |

## 项目结构

```
call_vue3/
├── main.go                           # 应用入口，配置加载与日志初始化
├── app.go                            # App结构体，Go-前端绑定方法
├── wails.json                        # Wails构建配置
├── go.mod / go.sum                   # Go依赖管理
├── configs/
│   └── app.yaml                      # 应用配置文件
├── internal/
│   ├── config/                       # 配置管理模块
│   │   ├── config.go                 # YAML配置加载与环境变量覆盖
│   │   └── errors.go                 # 配置相关错误类型
│   ├── errors/                       # 通用错误类型定义
│   ├── logger/                       # 结构化日志模块
│   │   └── logger.go                 # 日志器实现（Debug/Info/Warn/Error/Fatal）
│   └── service/caller/               # 呼叫进程管理服务
│       ├── service.go                # 服务接口定义
│       └── process.go                # 进程生命周期管理（启动/停止/健康检查）
├── frontend/                         # Vue3前端项目
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── App.vue                   # 根组件
│   │   ├── views/
│   │   │   └── Layout.vue            # 主布局视图
│   │   ├── components/
│   │   │   ├── layout/               # 布局组件
│   │   │   │   ├── DesktopLayout.vue # 桌面端布局
│   │   │   │   ├── MobileLayout.vue  # 移动端布局
│   │   │   │   ├── WorkbenchLayout.vue # 工作台布局
│   │   │   │   └── Header.vue        # 头部组件
│   │   │   ├── business/             # 业务组件
│   │   │   │   ├── CallButtons.vue   # 呼叫按钮组
│   │   │   │   ├── PatientList.vue   # 患者列表
│   │   │   │   ├── PatientItem.vue   # 患者单项
│   │   │   │   └── PatientDetailCard.vue # 患者详情卡片
│   │   │   └── common/               # 基础组件
│   │   │       ├── BaseButton.vue    # 基础按钮
│   │   │       ├── BaseBadge.vue     # 基础徽章
│   │   │       └── SvgIcon.vue       # SVG图标
│   │   ├── composables/              # 组合式函数
│   │   │   ├── usePatient.js         # 患者相关工具函数
│   │   │   ├── useMQTT.js            # MQTT消息处理
│   │   │   ├── useResponsive.js      # 响应式布局
│   │   │   ├── useScreenSize.js      # 屏幕尺寸
│   │   │   └── useRipple.js          # 点击涟漪效果
│   │   ├── stores/                   # Pinia状态管理
│   │   ├── mqtt/                     # MQTT模块
│   │   │   ├── mqtt.js               # MQTT客户端封装
│   │   │   └── topics.js             # Topic定义
│   │   ├── utils/                    # 工具函数
│   │   └── constants.js              # 常量定义
│   └── dist/                         # 构建输出
├── build/                            # 构建相关
│   ├── icons/                        # 应用图标
│   ├── windows/                      # Windows特定配置
│   │   └── info.json                 # Windows安装信息
│   └── bin/                          # 构建产物输出目录
└── README.md
```

## 核心功能模块

### 1. 配置管理 (`internal/config`)
- 从 `configs/app.yaml` 加载配置
- 支持环境变量覆盖：
  - `CALLER_PORT` - 覆盖呼叫进程端口
  - `CALLER_EXE_PATH` - 覆盖可执行文件路径
  - `LOG_LEVEL` - 覆盖日志级别

### 2. 呼叫进程管理 (`internal/service/caller`)
- `Start(ctx)` - 启动 `suwei_caller_local.exe` 后端进程
- `Stop(ctx)` - 停止进程
- `IsRunning()` - 检查进程运行状态
- `GetPort()` - 获取进程监听端口
- 支持启动重试机制（默认3次重试，间隔1秒）

### 3. 日志系统 (`internal/logger`)
- 支持多级别：Debug、Info、Warn、Error、Fatal
- 支持输出到 stdout 或文件
- 结构化日志记录

### 4. 前端功能
- **患者管理**：患者列表展示、详情查看、状态筛选
- **呼叫功能**：接诊、优先、候诊、复诊、过号、结诊
- **消息通信**：MQTT实时消息推送
- **响应式布局**：自动适配桌面/移动端

## 配置项说明 (`configs/app.yaml`)

```yaml
app:
  title: "呼叫客户端"
  width: 430
  height: 800
  min_width: 430
  min_height: 600
  max_width: 750
  disable_resize: false
  always_on_top: false

process:
  exe_path: "build/bin/root/process/suwei_caller_local.exe"
  port: 21999
  args: "--port=%d"
  start_retry: 3
  retry_delay_ms: 1000

logging:
  level: "debug"  # debug/info/warn/error/fatal
  output: "stdout"  # stdout/file
```

## 患者状态定义

| 状态码 | 名称 | 颜色 | 说明 |
|--------|------|------|------|
| 0 | 接诊中 | 蓝色 | 正在接诊患者 |
| 1 | 优先 | 绿色 | 优先就诊 |
| 2 | 候诊中 | 青色 | 等待就诊 |
| 3 | 复诊 | 橙色 | 需要复诊 |
| 4 | 过号 | 红色 | 错过叫号 |
| 99 | 结诊 | 黄色 | 诊疗结束 |

## Go-前端通信

在 `app.go` 中定义方法暴露给前端：

```go
func (a *App) GetVersion() string
func (a *App) GetCallerPort() int
func (a *App) IsCallerRunning() bool
func (a *App) Greeting(name string) string
```

前端调用方式：

```javascript
import { GetVersion, GetCallerPort } from './wailsjs/go/main/App';

const version = await GetVersion();
const port = await GetCallerPort();
```

## 构建与部署

### 开发模式
```bash
wails dev
# 启动 Vite (localhost:3000) + Wails 桌面应用
```

### 构建命令
```bash
# Windows
wails build -platform windows

# macOS
wails build -platform darwin

# Linux
wails build -platform linux

# 所有平台
wails build
```

构建产物位于 `build/bin/` 目录。

## 当前分支状态

- **分支**: main
- **未提交更改**:
  - `.claude/settings.local.json`
  - `app.go`
  - `frontend/src/wails/wailsjs/go/main/App.d.ts`
  - `frontend/src/wails/wailsjs/go/main/App.js`
  - `go.mod`, `go.sum`
  - `main.go`
  - 新增: `.env`, `CLAUDE.md`, `REFACTORING_PLAN.md`, `configs/`
  - 新增: `frontend/src/components/business/CLAUDE.md`
  - 新增: `frontend/src/composables/CLAUDE.md`
  - 新增: `frontend/src/wails/CLAUDE.md`
  - 新增: `frontend/src/wails/wailsjs/go/models.ts`
  - 新增: `internal/`
  - 新增: `nul`

## 环境要求

- Go 1.20+
- Node.js 16+
- Wails CLI: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`
- WebView2 Runtime (Windows)
- WebView2 (macOS/Linux)

## 更新日志

- **v1.0.0** - 初始版本，支持基本的呼叫管理功能

---

生成时间: 2026-01-07
