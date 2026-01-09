package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"

	"sw_call/internal/config"
)

//go:embed all:dist
var assets embed.FS

func main() {
	// 加载配置
	cfg, err := config.Load("root/configs/app.toml")
	if err != nil {
		panic(err)
	}

	// 创建应用实例
	app := NewApp()

	// 将服务注入应用
	app.Initialize(cfg)

	err = wails.Run(&options.App{
		Title:             cfg.App.Title,
		Width:             cfg.App.Width,
		Height:            cfg.App.Height,
		MinWidth:          cfg.App.MinWidth,
		MinHeight:         cfg.App.MinHeight,
		MaxWidth:          cfg.App.MaxWidth,
		MaxHeight:         cfg.App.MaxHeight,
		DisableResize:     cfg.App.DisableResize,
		Fullscreen:        cfg.App.Fullscreen,
		Frameless:         cfg.App.Frameless,
		StartHidden:       false,
		HideWindowOnClose: false,
		BackgroundColour:  &options.RGBA{R: 255, G: 255, B: 255, A: 1},
		AlwaysOnTop:       cfg.App.AlwaysOnTop,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		Menu:               nil,
		Logger:             nil,
		LogLevel:           logger.DEBUG,
		LogLevelProduction: logger.ERROR,
		OnStartup:          app.startup,
		OnShutdown:         app.shutdown,
		OnBeforeClose:      app.beforeClose,
		Bind: []any{
			app,
		},
		// Windows 特定配置
		Windows: &windows.Options{
			WebviewIsTransparent:              false,
			WindowIsTranslucent:               false,
			ContentProtection:                 false,
			BackdropType:                      windows.Mica,
			DisablePinchZoom:                  false,
			DisableWindowIcon:                 false,
			DisableFramelessWindowDecorations: false,
			WebviewUserDataPath:               "",
			WebviewBrowserPath:                "",
			Theme:                             windows.SystemDefault,
		},
		// macOS 特定配置
		Mac: &mac.Options{
			TitleBar: &mac.TitleBar{
				TitlebarAppearsTransparent: false,
				HideTitle:                  false,
				HideTitleBar:               false,
				FullSizeContent:            false,
				UseToolbar:                 false,
				HideToolbarSeparator:       true,
			},
			Appearance:           mac.NSAppearanceNameDarkAqua,
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			ContentProtection:    false,
			About: &mac.AboutInfo{
				Title:   "呼叫客户端",
				Message: "© 2024 call-client",
				Icon:    nil,
			},
		},
		// Linux 特定配置
		Linux: &linux.Options{
			Icon:                nil,
			WindowIsTranslucent: false,
		},
	})

	if err != nil {
		log.Fatal("应用运行失败: %v", err)
	}
}
