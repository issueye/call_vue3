# Root 目录重构文档

## 概述

为了便于打包和部署，将所有运行时需要的配置文件、图标和可执行文件统一整理到 `root/` 目录下。

## 新的目录结构

```
call_vue3/
├── root/                      # 运行时资源目录（新增）
│   ├── configs/
│   │   └── app.toml          # 应用配置文件
│   ├── icon.ico              # Windows 托盘图标
│   ├── icon.png              # 应用图标
│   ├── process/
│   │   └── suwei_caller_local.exe  # 呼叫进程可执行文件
│   ├── README.md             # 目录说明文档
│   └── .gitignore            # Git 忽略规则
├── main.go                    # 应用入口
├── app.go                     # 应用逻辑
├── configs/                   # 开发时配置（保留）
│   └── app.toml
├── build/                     # 构建资源（保留）
│   ├── bin/
│   │   └── root/             # 旧位置（待废弃）
│   └── windows/
└── ...
```

## 主要变更

### 1. 配置文件路径
- **旧路径**: `configs/app.toml`
- **新路径**: `root/configs/app.toml`

### 2. 进程可执行文件路径
- **旧路径**: `build/bin/root/process/suwei_caller_local.exe`
- **新路径**: `./root/process/suwei_caller_local.exe` (相对于可执行文件)

### 3. 托盘图标路径
- **旧路径**: `build/windows/icon.ico` 或绝对路径
- **新路径**: `./root/icon.ico` (相对于可执行文件)

## 代码变更

### main.go
```go
// 修改前
cfg, err := config.Load("configs/app.toml")

// 修改后
cfg, err := config.Load("root/configs/app.toml")
```

### internal/config/config.go
- 添加了 `resolvePaths()` 方法，自动将相对路径转换为绝对路径
- 更新了默认配置中的路径
- 所有路径现在都基于可执行文件所在目录进行解析

### root/configs/app.toml
```toml
[process]
exe_path = "./root/process/suwei_caller_local.exe"

[tray]
icon = "./root/icon.ico"
```

## 打包后的目录结构

```
dist/
├── call-client.exe              # 主程序
└── root/                        # 运行时资源
    ├── configs/
    │   └── app.toml
    ├── icon.ico
    ├── icon.png
    └── process/
        └── suwei_caller_local.exe
```

## 优势

1. **集中管理**: 所有运行时资源统一在一个目录下
2. **便于打包**: 打包时只需包含 root 目录即可
3. **路径清晰**: 使用相对路径，基于可执行文件位置
4. **自动解析**: 代码自动将相对路径转换为绝对路径
5. **便于维护**: 清晰的目录结构，易于理解和维护

## 开发与生产

### 开发环境
- 可以继续使用 `configs/app.toml` 进行本地开发
- root 目录中的配置用于生产环境

### 生产环境
- 使用 `root/configs/app.toml` 作为配置文件
- 所有资源从 root 目录加载

## 注意事项

1. **Git 忽略**: `root/process/*.exe` 已添加到 .gitignore，避免提交二进制文件
2. **路径解析**: 应用启动时会自动解析相对路径为绝对路径
3. **向后兼容**: 旧目录（`build/bin/root/`）暂时保留，后续可删除
4. **环境变量**: 仍可通过环境变量覆盖配置（CALLER_PORT、CALLER_EXE_PATH、LOG_LEVEL）

## 迁移检查清单

- [x] 创建 root 目录结构
- [x] 移动配置文件到 root/configs/
- [x] 移动图标文件到 root/
- [x] 移动可执行文件到 root/process/
- [x] 更新配置文件中的路径引用
- [x] 更新 main.go 中的配置加载路径
- [x] 添加路径解析逻辑到 config.go
- [x] 更新默认配置
- [x] 创建 README 文档
- [x] 添加 .gitignore 文件
