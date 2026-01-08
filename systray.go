package main

import (
	"context"
	"os"
	"time"

	"sw_call/internal/config"

	"github.com/getlantern/systray"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// 全局上下文，用于托盘菜单操作
var appCtx context.Context

// SetContext 设置应用上下文
func SetContext(ctx context.Context) {
	appCtx = ctx
}

// loadTrayIcon 加载托盘图标
func loadTrayIcon(iconPath string) []byte {
	if iconPath == "" {
		return nil
	}

	// 尝试读取 PNG
	if data, err := os.ReadFile(iconPath); err == nil && len(data) > 0 {
		return data
	}

	return nil
}

// InitTray 初始化托盘
func InitTray(trayConfig *config.TrayConfig) {
	go systray.Run(onReady(trayConfig), onExit)
}

func onReady(trayConfig *config.TrayConfig) func() {
	return func() {
		systray.SetTitle(trayConfig.Title)
		systray.SetTooltip(trayConfig.Tooltip)
		time.Sleep(time.Second)
		// 图标设置
		iconData := loadTrayIcon(trayConfig.Icon)
		systray.SetIcon(iconData)

		// 显示窗口菜单项
		showItem := systray.AddMenuItem("显示窗口", "显示主窗口")
		// 隐藏窗口菜单项
		hideItem := systray.AddMenuItem("隐藏窗口", "隐藏主窗口")

		systray.AddSeparator()

		// 退出菜单项
		quitItem := systray.AddMenuItem("退出", "退出应用程序")

		for {
			select {
			case <-showItem.ClickedCh:
				if appCtx != nil {
					runtime.WindowShow(appCtx)
				}
			case <-hideItem.ClickedCh:
				if appCtx != nil {
					runtime.WindowHide(appCtx)
				}
			case <-quitItem.ClickedCh:
				systray.Quit()
				if appCtx != nil {
					runtime.Quit(appCtx)
				}
			}
		}
	}
}

func onExit() {}
