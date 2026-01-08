package config

import (
	"os"
	"strconv"
	"strings"

	"github.com/pelletier/go-toml/v2"
)

// Config 应用配置
type Config struct {
	App     AppConfig     `toml:"app"`
	Process ProcessConfig `toml:"process"`
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

// ProcessConfig 进程配置
type ProcessConfig struct {
	ExePath    string `toml:"exe_path"`
	Port       int    `toml:"port"`
	Args       string `toml:"args"`
	StartRetry int    `toml:"start_retry"`
	RetryDelay int    `toml:"retry_delay_ms"`
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
		Process: ProcessConfig{
			ExePath:    "build/bin/root/process/suwei_caller_local.exe",
			Port:       21999,
			Args:       "--port=%d",
			StartRetry: 3,
			RetryDelay: 1000,
		},
		Logging: LoggingConfig{
			Level:  "debug",
			Output: "stdout",
		},
		Tray: TrayConfig{
			Icon:    "build/windows/icon.ico",
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

	// 应用环境变量覆盖
	cfg.applyEnvOverrides()

	// 验证配置
	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

// applyEnvOverrides 应用环境变量覆盖
func (c *Config) applyEnvOverrides() {
	// 进程端口覆盖
	if v := os.Getenv("CALLER_PORT"); v != "" {
		if port, err := strconv.Atoi(v); err == nil {
			c.Process.Port = port
		}
	}

	// 进程路径覆盖
	if v := os.Getenv("CALLER_EXE_PATH"); v != "" {
		c.Process.ExePath = v
	}

	// 日志级别覆盖
	if v := os.Getenv("LOG_LEVEL"); v != "" {
		c.Logging.Level = strings.ToLower(v)
	}
}

// Validate 验证配置有效性
func (c *Config) Validate() error {
	if c.Process.Port <= 0 || c.Process.Port > 65535 {
		return ErrInvalidPort
	}
	if c.Process.ExePath == "" {
		return ErrEmptyExePath
	}
	if c.Logging.Level != "" && !isValidLogLevel(c.Logging.Level) {
		return ErrInvalidLogLevel
	}
	return nil
}

func isValidLogLevel(level string) bool {
	switch strings.ToLower(level) {
	case "debug", "info", "warn", "error", "fatal":
		return true
	default:
		return false
	}
}
