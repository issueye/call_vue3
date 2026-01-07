package logger

import (
	"fmt"
	"log"
	"os"
	"strings"
	"sync"
	"time"
)

// Level 日志级别
type Level int8

const (
	// LevelDebug 调试级别
	LevelDebug Level = iota
	// LevelInfo 信息级别
	LevelInfo
	// LevelWarn 警告级别
	LevelWarn
	// LevelError 错误级别
	LevelError
	// LevelFatal 致命级别
	LevelFatal
)

var levelStrings = []string{"DEBUG", "INFO", "WARN", "ERROR", "FATAL"}

// String 返回日志级别的字符串表示
func (l Level) String() string {
	if l >= 0 && l < Level(len(levelStrings)) {
		return levelStrings[l]
	}
	return "UNKNOWN"
}

// ParseLevel 解析日志级别字符串
func ParseLevel(s string) Level {
	switch strings.ToLower(s) {
	case "debug":
		return LevelDebug
	case "info":
		return LevelInfo
	case "warn", "warning":
		return LevelWarn
	case "error":
		return LevelError
	case "fatal":
		return LevelFatal
	default:
		return LevelInfo
	}
}

// Logger 日志接口
type Logger interface {
	Debug(msg string, args ...interface{})
	Info(msg string, args ...interface{})
	Warn(msg string, args ...interface{})
	Error(msg string, args ...interface{})
	Fatal(msg string, args ...interface{})
	With(key string, value interface{}) Logger
}

// LoggerConfig 日志配置
type LoggerConfig struct {
	Level    string `yaml:"level"`
	Output   string `yaml:"output"`
	FilePath string `yaml:"file_path"`
}

// LoggerImpl 日志实现
type LoggerImpl struct {
	mu      sync.RWMutex
	level   Level
	logger  *log.Logger
	file    *os.File
	fields  map[string]interface{}
}

// New 创建日志实例
func New(cfg *LoggerConfig) (*LoggerImpl, error) {
	lvl := ParseLevel(cfg.Level)

	var output *os.File
	if cfg.Output == "file" && cfg.FilePath != "" {
		var err error
		output, err = os.OpenFile(cfg.FilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
		if err != nil {
			return nil, fmt.Errorf("failed to open log file: %w", err)
		}
	} else {
		output = os.Stdout
	}

	return &LoggerImpl{
		level:  lvl,
		logger: log.New(output, "", 0),
		fields: make(map[string]interface{}),
	}, nil
}

// log 内部日志方法
func (l *LoggerImpl) log(level Level, msg string, args ...interface{}) {
	if level < l.level {
		return
	}

	l.mu.RLock()
	defer l.mu.RUnlock()

	// 格式化消息
	formattedMsg := msg
	if len(args) > 0 {
		formattedMsg = fmt.Sprintf(msg, args...)
	}

	// 构建日志行
	timestamp := time.Now().Format("2006-01-02 15:04:05.000")
	logLine := fmt.Sprintf("[%s] [%s] %s", timestamp, level.String(), formattedMsg)

	// 添加字段
	if len(l.fields) > 0 {
		var fieldsStr []string
		for k, v := range l.fields {
			fieldsStr = append(fieldsStr, fmt.Sprintf("%s=%v", k, v))
		}
		logLine += " " + strings.Join(fieldsStr, " ")
	}

	l.logger.Println(logLine)

	if level == LevelFatal {
		l.logger.Println("FATAL: exiting due to fatal error")
		os.Exit(1)
	}
}

// Debug 调试级别日志
func (l *LoggerImpl) Debug(msg string, args ...interface{}) {
	l.log(LevelDebug, msg, args...)
}

// Info 信息级别日志
func (l *LoggerImpl) Info(msg string, args ...interface{}) {
	l.log(LevelInfo, msg, args...)
}

// Warn 警告级别日志
func (l *LoggerImpl) Warn(msg string, args ...interface{}) {
	l.log(LevelWarn, msg, args...)
}

// Error 错误级别日志
func (l *LoggerImpl) Error(msg string, args ...interface{}) {
	l.log(LevelError, msg, args...)
}

// Fatal 致命级别日志
func (l *LoggerImpl) Fatal(msg string, args ...interface{}) {
	l.log(LevelFatal, msg, args...)
}

// With 添加日志字段
func (l *LoggerImpl) With(key string, value interface{}) Logger {
	l.mu.Lock()
	defer l.mu.Unlock()

	newFields := make(map[string]interface{}, len(l.fields)+1)
	for k, v := range l.fields {
		newFields[k] = v
	}
	newFields[key] = value

	newLogger := &LoggerImpl{
		level:  l.level,
		logger: l.logger,
		fields: newFields,
	}
	return newLogger
}

// Sync 刷新日志缓冲区
func (l *LoggerImpl) Sync() error {
	l.mu.Lock()
	defer l.mu.Unlock()

	if l.file != nil {
		return l.file.Sync()
	}
	return nil
}

// Close 关闭日志器
func (l *LoggerImpl) Close() error {
	l.mu.Lock()
	defer l.mu.Unlock()

	if l.file != nil && l.file != os.Stdout {
		return l.file.Close()
	}
	return nil
}
