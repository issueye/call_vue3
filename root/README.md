# Root 目录

此目录包含应用程序运行时所需的所有配置文件和资源。

## 目录结构

```
root/
├── configs/
│   └── app.toml          # 应用配置文件
├── icon.ico              # Windows 托盘图标
├── icon.png              # 应用图标（PNG 格式）
└── process/
    └── suwei_caller_local.exe  # 呼叫进程可执行文件
```

## 文件说明

### configs/app.toml
应用的主配置文件，包含：
- 应用窗口配置（标题、大小、背景色等）
- 呼叫进程配置（可执行文件路径、端口、启动参数等）
- 日志配置（日志级别、输出方式等）
- 系统托盘配置（图标路径、提示文字等）

### icon.ico
Windows 系统托盘图标（.ico 格式）

### icon.png
应用图标（PNG 格式），用于其他平台

### process/suwei_caller_local.exe
呼叫进程的可执行文件，负责处理实际的呼叫逻辑

## 路径说明

所有配置文件中的路径都是相对于可执行文件的路径：

- 配置文件：`./root/configs/app.toml`
- 进程可执行文件：`./root/process/suwei_caller_local.exe`
- 托盘图标：`./root/icon.ico`

## 打包说明

使用 Wails 打包时，root 目录会被自动包含在输出目录中，与应用可执行文件放在同一级别。

打包后的目录结构：
```
dist/
├── call-client.exe       # 主程序
└── root/                 # 运行时资源目录
    ├── configs/
    │   └── app.toml
    ├── icon.ico
    ├── icon.png
    └── process/
        └── suwei_caller_local.exe
```
