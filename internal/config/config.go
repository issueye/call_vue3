package config

import (
	"os"

	"github.com/pelletier/go-toml/v2"
)

// Config 应用配置
type Config struct {
	App     AppConfig     `toml:"app"`
	Logging LoggingConfig `toml:"logging"`
	Tray    TrayConfig    `toml:"tray"`
}

// AppConfig 应用窗口配置
type AppConfig struct {
	Title           string `toml:"title"`
	Width           int    `toml:"width"`
	Height          int    `toml:"height"`
	MinWidth        int    `toml:"min_width"`
	MinHeight       int    `toml:"min_height"`
	MaxWidth        int    `toml:"max_width"`
	MaxHeight       int    `toml:"max_height"`
	DisableResize   bool   `toml:"disable_resize"`
	Fullscreen      bool   `toml:"fullscreen"`
	Frameless       bool   `toml:"frameless"`
	AlwaysOnTop     bool   `toml:"always_on_top"`
	BackgroundColor string `toml:"background_color"`
}

// LoggingConfig 日志配置
type LoggingConfig struct {
	Level    string `toml:"level"`
	Output   string `toml:"output"`
	FilePath string `toml:"file_path"`
}

// TrayConfig 系统托盘配置
type TrayConfig struct {
	Icon    string `toml:"icon"`
	Tooltip string `toml:"tooltip"`
	Title   string `toml:"title"`
}

// Default 返回默认配置
func Default() *Config {
	return &Config{
		App: AppConfig{
			Title:           "呼叫客户端",
			Width:           430,
			Height:          800,
			MinWidth:        430,
			MinHeight:       550,
			MaxWidth:        750,
			MaxHeight:       700,
			DisableResize:   false,
			Fullscreen:      false,
			Frameless:       false,
			AlwaysOnTop:     false,
			BackgroundColor: "#FFFFFF",
		},
		Logging: LoggingConfig{
			Level:  "debug",
			Output: "stdout",
		},
		Tray: TrayConfig{
			Icon:    "./root/icon.ico",
			Tooltip: "呼叫客户端",
			Title:   "呼叫客户端",
		},
	}
}

// Load 从文件加载配置
func Load(path string) (*Config, error) {
	cfg := Default()

	data, err := os.ReadFile(path)
	if err != nil {
		// 配置文件不存在，使用默认配置
		return cfg, nil
	}

	if err := toml.Unmarshal(data, cfg); err != nil {
		return nil, err
	}

	return cfg, nil
}
