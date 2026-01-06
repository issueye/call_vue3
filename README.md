# 呼叫客户端 (Wails 桌面版)

基于 [Wails v2](https://wails.io/) 构建的医疗呼叫客户端桌面应用。

## 技术栈

- **后端**: Go + Wails v2
- **前端**: Vue 3 + Vite + Pinia + Vue Router
- **平台**: Windows / macOS / Linux

## 快速开始

### 环境要求

- Go 1.20+
- Node.js 16+
- Wails CLI
- WebView2 (Windows)

### 安装 Wails CLI

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 返回根目录
cd ..
```

### 开发模式

```bash
# 启动开发模式
wails dev
```

这将：
1. 启动 Vite 开发服务器 (http://localhost:3000)
2. 启动 Wails 桌面应用
3. 前端代码修改后自动热更新

### 构建发布版本

```bash
# Windows
wails build -platform windows

# macOS
wails build -platform darwin

# Linux
wails build -platform linux
```

或构建所有平台：

```bash
wails build
```

构建产物位于 `build/bin/` 目录。

## 项目结构

```
call_vue3/
├── main.go           # Wails 入口文件
├── app.go            # 应用逻辑（Go-前端绑定）
├── wails.json        # Wails 配置
├── build/            # 构建相关
│   ├── icons/        # 应用图标
│   └── windows/      # Windows 特定配置
├── frontend/         # Vue3 前端项目
│   ├── src/          # 前端源码
│   ├── public/       # 静态资源
│   └── dist/         # 构建输出（自动生成）
└── README.md
```

## 配置说明

### wails.json

主要配置项：
- `name` - 应用名称
- `frontend:dir` - 前端目录
- `frontend:dev:serverUrl` - Vite 开发服务器地址
- `outputfilename` - 输出文件名
- `info` - 应用信息（版本、版权等）

### API 代理配置

前端代理配置位于 `frontend/vite.config.js`，开发时会将 API 请求代理到后端服务。

## 添加 Go-前端绑定

在 `app.go` 中添加方法：

```go
func (a *App) MyMethod(param string) string {
    return fmt.Sprintf("结果: %s", param)
}
```

前端调用（自动生成）：

```javascript
import { MyMethod } from './wailsjs/go/main/App';

// 调用
const result = await MyMethod("参数");
```

## 图标要求

| 平台 | 格式 | 尺寸 |
|------|------|------|
| Windows | ICO | 16x16, 48x48, 256x256 |
| macOS | ICNS | 1024x1024 |
| Linux | PNG | 256x256 |

将图标放入 `build/icons/` 对应目录。

## 常见问题

### Windows 上 WebView2 未安装

下载安装 [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

### 构建失败

确保所有依赖已安装：
```bash
wails doctor
```

## 许可证

MIT License
