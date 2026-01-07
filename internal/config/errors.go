package config

import "errors"

var (
	// ErrInvalidPort 端口无效
	ErrInvalidPort = errors.New("invalid port: must be between 1 and 65535")

	// ErrEmptyExePath 可执行文件路径为空
	ErrEmptyExePath = errors.New("executable path cannot be empty")

	// ErrInvalidLogLevel 日志级别无效
	ErrInvalidLogLevel = errors.New("invalid log level: must be debug, info, warn, error, or fatal")

	// ErrConfigNotFound 配置文件未找到
	ErrConfigNotFound = errors.New("configuration file not found")

	// ErrConfigParseFailed 配置文件解析失败
	ErrConfigParseFailed = errors.New("failed to parse configuration file")
)
