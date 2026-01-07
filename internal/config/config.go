package config

import (
	"os"
	"strconv"
	"strings"

	"gopkg.in/yaml.v3"
)

// Config 应用配置
type Config struct {
	App     AppConfig     `yaml:"app"`
	Process ProcessConfig `yaml:"process"`
	Logging LoggingConfig `yaml:"logging"`
}

// AppConfig 应用窗口配置
type AppConfig struct {
	Title           string `yaml:"title"`
	Width           int    `yaml:"width"`
	Height          int    `yaml:"height"`
	MinWidth        int    `yaml:"min_width"`
	MinHeight       int    `yaml:"min_height"`
	MaxWidth        int    `yaml:"max_width"`
	MaxHeight       int    `yaml:"max_height"`
	DisableResize   bool   `yaml:"disable_resize"`
	Fullscreen      bool   `yaml:"fullscreen"`
	Frameless       bool   `yaml:"frameless"`
	AlwaysOnTop     bool   `yaml:"always_on_top"`
	BackgroundColor string `yaml:"background_color"`
}

// ProcessConfig 进程配置
type ProcessConfig struct {
	ExePath    string `yaml:"exe_path"`
	Port       int    `yaml:"port"`
	Args       string `yaml:"args"`
	StartRetry int    `yaml:"start_retry"`
	RetryDelay int    `yaml:"retry_delay_ms"`
}

// LoggingConfig 日志配置
type LoggingConfig struct {
	Level    string `yaml:"level"`
	Output   string `yaml:"output"`
	FilePath string `yaml:"file_path"`
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

	if err := yaml.Unmarshal(data, cfg); err != nil {
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
