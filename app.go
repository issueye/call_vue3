package main

import (
	"context"
	"fmt"

	"sw_call/internal/config"
	"sw_call/internal/logger"
	"sw_call/internal/service/caller"
)

// App 结构体 - 用于绑定到前端
type App struct {
	ctx    context.Context
	cfg    *config.Config
	log    *logger.LoggerImpl
	caller caller.ProcessService
}

// NewApp 创建新的应用实例
func NewApp() *App {
	return &App{}
}

// Initialize 初始化应用（由 main.go 调用）
func (a *App) Initialize(cfg *config.Config, log *logger.LoggerImpl, callerService caller.ProcessService) {
	a.cfg = cfg
	a.log = log
	a.caller = callerService
}

// startup 在应用启动时调用
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.log.Info("应用启动")

	// 唤醒呼叫进程
	if err := a.caller.Start(ctx); err != nil {
		a.log.Error("启动呼叫进程失败: %v", err)
	} else {
		a.log.Info("呼叫进程启动成功，端口: %d", a.caller.GetPort())
	}
}

// shutdown 在应用关闭时调用
func (a *App) shutdown(ctx context.Context) {
	a.log.Info("应用关闭")

	// 停止呼叫进程 测试
	if err := a.caller.Stop(ctx); err != nil {
		a.log.Error("停止呼叫进程失败: %v", err)
	}

	// 刷新日志
	_ = a.log.Sync()
}

// beforeClose 在窗口关闭前调用，返回 true 可阻止窗口关闭
func (a *App) beforeClose(ctx context.Context) bool {
	a.log.Info("窗口即将关闭")
	return false
}

// Greeting 返回问候信息 - 示例方法
func (a *App) Greeting(name string) string {
	a.log.Debug("调用 Greeting 方法，参数: %s", name)
	return fmt.Sprintf("你好, %s!", name)
}

// GetVersion 返回应用版本
func (a *App) GetVersion() string {
	return "1.0.0"
}

// GetCallerPort 返回呼叫进程端口
func (a *App) GetCallerPort() int {
	return a.caller.GetPort()
}

// IsCallerRunning 检查呼叫进程是否运行中
func (a *App) IsCallerRunning() bool {
	return a.caller.IsRunning()
}
