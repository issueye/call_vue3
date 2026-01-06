package main

import (
	"context"
	"fmt"
)

// App 结构体 - 用于绑定到前端
type App struct {
	ctx context.Context
}

// NewApp 创建新的应用实例
func NewApp() *App {
	return &App{}
}

// startup 在应用启动时调用
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	fmt.Println("应用启动")
}

// shutdown 在应用关闭时调用
func (a *App) shutdown(ctx context.Context) {
	fmt.Println("应用关闭")
}

// beforeClose 在窗口关闭前调用，返回 true 可阻止窗口关闭
func (a *App) beforeClose(ctx context.Context) bool {
	// 可在此处添加确认对话框逻辑
	return false
}

// Greeting 返回问候信息 - 示例方法
func (a *App) Greeting(name string) string {
	return fmt.Sprintf("你好, %s!", name)
}

// GetVersion 返回应用版本
func (a *App) GetVersion() string {
	return "1.0.0"
}
