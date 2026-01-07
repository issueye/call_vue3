# 代码重构方案

## 一、现状分析

### 1.1 当前代码结构

```
call_vue3/
├── main.go           # Wails 入口，约90行
├── app.go            # 应用逻辑，约65行
├── wails.json        # Wails 配置
└── go.mod            # Go 1.23.0, wails v2.11.0
```

### 1.2 当前问题

| 问题 | 描述 | 影响 |
|------|------|------|
| **职责耦合** | app.go 同时承担生命周期管理、进程启动、业务方法 | 难以维护和测试 |
| **硬编码** | 端口号、路径等配置直接写死在代码中 | 部署时需修改源码 |
| **错误处理缺失** | 进程启动失败仅打印日志，无重试/回退机制 | 生产环境不稳定 |
| **无日志系统** | 仅使用 fmt.Println，无分级日志 | 排查问题困难 |
| **配置混乱** | wails.json、代码中都有配置 | 难以统一管理 |
| **测试困难** | 强依赖 exec.Command，无法单元测试 | 代码质量无法保障 |

### 1.3 代码指标

- **文件数**: 2个 Go 文件
- **代码行数**: 约 155 行有效代码
- **依赖数**: 1个直接依赖 (wails v2)
- **测试覆盖**: 0%

---

## 二、重构目标

### 2.1 核心原则

1. **保持功能不变**: 重构不改变现有行为
2. **单一职责**: 每个包/模块只做一件事
3. **依赖倒置**: 通过接口抽象实现解耦
4. **可测试性**: 核心逻辑可单元测试

### 2.2 预期改进

| 指标 | 重构前 | 重构后 |
|------|--------|--------|
| 包数量 | 1 (main) | 5+ (config, service, lifecycle, etc.) |
| 配置管理 | 硬编码 | 配置文件 + 环境变量 |
| 日志 | 无分级 | 结构化日志，支持多级别 |
| 错误处理 | 简单打印 | 统一错误处理 + 重试机制 |
| 可测试性 | 困难 | 依赖注入，易于 mock |
| 配置项数量 | 2 | 10+ 可配置项 |

---

## 三、详细方案

### 3.1 目标目录结构

```
call_vue3/
├── main.go                           # 应用入口
├── internal/
│   ├── config/                       # 配置管理
│   │   ├── config.go                 # 配置结构体和加载
│   │   └── loader.go                 # 多来源配置加载器
│   ├── lifecycle/                    # 生命周期管理
│   │   ├── app.go                    # 应用生命周期
│   │   ├── startup.go                # 启动逻辑
│   │   └── shutdown.go               # 关闭逻辑
│   ├── service/                      # 业务服务
│   │   ├── caller/                   # 呼叫进程服务
│   │   │   ├── service.go            # 进程服务接口
│   │   │   ├── windows.go            # Windows 实现
│   │   │   └── process.go            # 进程管理
│   │   └── index.go                  # 服务注册
│   ├── logger/                       # 日志系统
│   │   ├── logger.go                 # 日志接口
│   │   └── impl.go                   # 实现
│   └── errors/                       # 错误定义
│       └── errors.go                 # 自定义错误
├── configs/
│   └── app.yaml                      # 应用配置文件
├── app.go                            # 向导生成的 App 结构体（保留）
└── wails.json
```

### 3.2 模块设计

#### 3.2.1 配置模块 (config)

```go
// internal/config/config.go
type Config struct {
    App         AppConfig         `yaml:"app"`
    Process     ProcessConfig     `yaml:"process"`
    Logging     LoggingConfig     `yaml:"logging"`
}

type AppConfig struct {
    Title      string `yaml:"title"`
    Width      int    `yaml:"width"`
    Height     int    `yaml:"height"`
    // ... 更多配置
}

type ProcessConfig struct {
    ExePath    string `yaml:"exePath"`
    Port       int    `yaml:"port"`
    Args       string `yaml:"args"`
    StartRetry int    `yaml:"startRetry"`  // 启动重试次数
}

type LoggingConfig struct {
    Level      string `yaml:"level"`       // debug, info, warn, error
    Output     string `yaml:"output"`      // stdout, file
    FilePath   string `yaml:"filePath"`
}
```

**职责**:
- 从 `configs/app.yaml` 加载配置
- 支持环境变量覆盖
- 提供配置验证

#### 3.2.2 日志模块 (logger)

```go
// internal/logger/logger.go
type Logger interface {
    Debug(msg string, args ...interface{})
    Info(msg string, args ...interface{})
    Warn(msg string, args ...interface{})
    Error(msg string, args ...interface{})
    Fatal(msg string, args ...interface{})
}

// 默认实现使用 zerolog 或 zap
```

**职责**:
- 结构化日志输出
- 支持日志级别过滤
- 支持多输出（控制台/文件）

#### 3.2.3 进程服务模块 (service/caller)

```go
// internal/service/caller/service.go
type ProcessService interface {
    Start(ctx context.Context) error
    Stop(ctx context.Context) error
    IsRunning() bool
    HealthCheck(ctx context.Context) error
}

// internal/service/caller/process.go
type processService struct {
    cfg    ProcessConfig
    logger Logger
    cmd    *exec.Cmd
    mu     sync.RWMutex
}
```

**职责**:
- 进程的生命周期管理（启动/停止/重启）
- 端口健康检查
- 启动重试机制
- Windows 特定处理（后台运行）

#### 3.2.4 生命周期模块 (lifecycle)

```go
// internal/lifecycle/startup.go
type StartupFunc func(ctx context.Context, cfg *config.Config) error

func RunStartup(ctx context.Context, cfg *config.Config, fns []StartupFunc) error {
    for _, fn := range fns {
        if err := fn(ctx, cfg); err != nil {
            return err
        }
    }
    return nil
}
```

**职责**:
- 组织启动顺序
- 优雅关闭
- 错误传播

### 3.3 实施步骤

#### 第一阶段：基础设施搭建（预计代码量 +150行）

1. 创建 `internal/config` 包
   - 定义配置结构体
   - 实现 YAML 加载器
   - 环境变量覆盖支持

2. 创建 `internal/logger` 包
   - 定义日志接口
   - 实现基础日志器

#### 第二阶段：服务抽象（预计代码量 +200行）

3. 创建 `internal/errors` 包
   - 定义自定义错误类型
   - 错误包装函数

4. 创建 `internal/service/caller` 包
   - 定义 ProcessService 接口
   - 实现进程管理逻辑
   - 添加健康检查

#### 第三阶段：重构主程序（修改现有代码）

5. 重构 `app.go`
   - 注入依赖（配置、日志、服务）
   - 保持现有 API 兼容

6. 重构 `main.go`
   - 配置加载
   - 服务初始化
   - 生命周期编排

#### 第四阶段：配置与文档（新增）

7. 创建 `configs/app.yaml`
8. 更新 README.md
9. 更新 CLAUDE.md

---

## 四、配置示例

```yaml
# configs/app.yaml
app:
  title: "呼叫客户端"
  width: 430
  height: 800
  min_width: 430
  min_height: 600
  max_width: 750
  always_on_top: false

process:
  exe_path: "build/bin/root/process/suwei_caller_local.exe"
  port: 21999
  args: "--port=%d"
  start_retry: 3
  retry_delay_ms: 1000

logging:
  level: "debug"
  output: "stdout"
  # file_path: "logs/app.log"
```

---

## 五、向后兼容性

| 原有功能 | 重构后 | 兼容性说明 |
|----------|--------|------------|
| Greeting() | 保留 | App 结构体方法不变 |
| GetVersion() | 保留 | App 结构体方法不变 |
| startup() | 保留 | 参数和行为不变 |
| shutdown() | 保留 | 参数和行为不变 |
| beforeClose() | 保留 | 参数和行为不变 |
| suwei_caller_local.exe 启动 | 保留 | 功能不变，路径通过配置 |

---

## 六、风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| 回归问题 | 中 | 编写集成测试验证关键路径 |
| 配置错误 | 低 | 添加配置验证和默认值 |
| 学习成本 | 低 | 保持包结构简单，文档完善 |
| 构建失败 | 低 | 分阶段提交，每阶段可构建 |

---

## 七、验证清单

- [ ] `wails dev` 正常启动
- [ ] `wails build` 成功构建
- [ ] 呼叫进程正常启动（端口 21999）
- [ ] 应用关闭时进程正确终止
- [ ] 日志正常输出
- [ ] 配置文件加载正确

---

## 八、时间估算

| 阶段 | 工作量 | 说明 |
|------|--------|------|
| 第一阶段 | 1-2 小时 | 基础设施 |
| 第二阶段 | 2-3 小时 | 服务抽象 |
| 第三阶段 | 1-2 小时 | 主程序重构 |
| 第四阶段 | 0.5 小时 | 文档 |
| **总计** | **4.5-7.5 小时** | - |

---

## 审批

请确认是否同意以上方案，确认后开始实施。
