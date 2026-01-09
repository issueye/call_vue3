package main

import (
	"context"
	"log/slog"

	"sw_call/internal/config"
	"sw_call/internal/initialize"
	"sw_call/internal/service/local"
	"sw_call/pkg/storage"
)

// App 结构体 - 用于绑定到前端
type App struct {
	ctx          context.Context
	cfg          *config.Config
	localService *local.Service
	// caller caller.ProcessService
}

// NewApp 创建新的应用实例
func NewApp() *App {
	return &App{}
}

// Initialize 初始化应用（由 main.go 调用）
func (a *App) Initialize(cfg *config.Config) {
	a.cfg = cfg

	// 初始化应用（日志、存储等）
	initialize.InitApp("root")

	// 初始化本地数据服务
	a.localService = local.NewService(storage.GetInstance())
}

// startup 在应用启动时调用
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// 设置托盘上下文
	SetContext(ctx)

	// 初始化系统托盘
	InitTray(&a.cfg.Tray)

	// 唤醒呼叫进程
	// if err := a.caller.Start(ctx); err != nil {
	// 	slog.Error("启动呼叫进程失败", slog.String("错误信息", err.Error()))
	// } else {
	// 	slog.Info("呼叫进程启动成功", slog.Any("端口", a.caller.GetPort()))
	// }
}

// shutdown 在应用关闭时调用
func (a *App) shutdown(ctx context.Context) {
	slog.Info("应用关闭")

	// 停止呼叫进程 测试
	// if err := a.caller.Stop(ctx); err != nil {
	// 	slog.Error("停止呼叫进程失败", slog.Any("失败原因", err.Error()))
	// }
}

// beforeClose 在窗口关闭前调用，返回 true 可阻止窗口关闭
func (a *App) beforeClose(ctx context.Context) bool {
	slog.Info("窗口即将关闭")
	return false
}

// GetVersion 返回应用版本
func (a *App) GetVersion() string {
	return "1.0.0"
}

// ========== 本地数据相关方法 ==========

// LoadClientID 加载客户端ID
func (a *App) LoadClientID() *local.Response {
	return a.localService.LoadClientID()
}

// SaveForwardURL 保存服务器地址
func (a *App) SaveForwardURL(url string) *local.Response {
	return a.localService.SaveForwardURL(url)
}

// LoadForwardURL 加载服务器地址
func (a *App) LoadForwardURL() *local.Response {
	return a.localService.LoadForwardURL()
}

// LoadLocaldata 加载本地数据
func (a *App) LoadLocaldata(id string) *local.Response {
	return a.localService.LoadLocaldata(id)
}

// SaveLocaldata 保存本地数据
func (a *App) SaveLocaldata(id, dataType string, data any) *local.Response {
	return a.localService.SaveLocaldata(id, dataType, data)
}

// DeleteLocaldata 删除本地数据
func (a *App) DeleteLocaldata(id string) *local.Response {
	return a.localService.DeleteLocaldata(id)
}

// GetLocaldataList 获取本地数据列表
func (a *App) GetLocaldataList() *local.Response {
	return a.localService.GetLocaldataList()
}
