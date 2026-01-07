package errors

import (
	"errors"
	"fmt"
	"time"
)

// CallerError 呼叫进程相关错误
type CallerError struct {
	Code    ErrorCode
	Message string
	Err     error
	Time    time.Time
}

func (e *CallerError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("[%s] %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

func (e *CallerError) Unwrap() error {
	return e.Err
}

// ErrorCode 错误代码
type ErrorCode string

const (
	// ErrCodeProcessNotFound 进程未找到
	ErrCodeProcessNotFound ErrorCode = "PROCESS_NOT_FOUND"
	// ErrCodeProcessStartFailed 进程启动失败
	ErrCodeProcessStartFailed ErrorCode = "PROCESS_START_FAILED"
	// ErrCodeProcessStopped 进程已停止
	ErrCodeProcessStopped ErrorCode = "PROCESS_STOPPED"
	// ErrCodePortInUse 端口被占用
	ErrCodePortInUse ErrorCode = "PORT_IN_USE"
	// ErrCodeHealthCheckFailed 健康检查失败
	ErrCodeHealthCheckFailed ErrorCode = "HEALTH_CHECK_FAILED"
	// ErrCodeConfigError 配置错误
	ErrCodeConfigError ErrorCode = "CONFIG_ERROR"
)

// NewCallerError 创建新的呼叫错误
func NewCallerError(code ErrorCode, message string, err error) *CallerError {
	return &CallerError{
		Code:    code,
		Message: message,
		Err:     err,
		Time:    time.Now(),
	}
}

// Is 判断错误类型
func Is(err error, target error) bool {
	return errors.Is(err, target)
}

// Wrap 包装错误
func Wrap(err error, message string) error {
	if err == nil {
		return nil
	}
	return fmt.Errorf("%s: %w", message, err)
}

// TimeoutError 超时错误
type TimeoutError struct {
	Operation string
	Duration  time.Duration
}

func (e *TimeoutError) Error() string {
	return fmt.Sprintf("operation %s timed out after %v", e.Operation, e.Duration)
}

func (e *TimeoutError) Unwrap() error {
	return nil
}

// NewTimeoutError 创建超时错误
func NewTimeoutError(operation string, duration time.Duration) *TimeoutError {
	return &TimeoutError{
		Operation: operation,
		Duration:  duration,
	}
}
