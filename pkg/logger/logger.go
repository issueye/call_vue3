package logger

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sw_call/pkg/logger/devslog"

	lumberjack "gopkg.in/natefinch/lumberjack.v2"
)

// 保存一个日志队列，使用 channel 实现
var logQueue = make(chan slog.Record, 1000)

type Config struct {
	Path       string
	MaxSize    int    //文件大小限制,单位MB
	MaxAge     int    //日志文件保留天数
	MaxBackups int    //最大保留日志文件数量
	Compress   bool   //是否压缩处理
	Level      int    // 等级
	Mode       string // 日志输出模式 debug release
}

var LogLevel = map[int]slog.Level{
	-1: slog.LevelDebug,
	0:  slog.LevelInfo,
	1:  slog.LevelWarn,
	2:  slog.LevelError,
}

func NewLoggerWrapper(cfg Config) {
	NewMultiLevelHandler(cfg)
}

type LimeWriter struct {
	mode       string
	lumberjack *lumberjack.Logger
}

func (l *LimeWriter) Write(p []byte) (n int, err error) {
	if l.mode == "debug" {
		os.Stdout.Write(p)
	}

	return l.lumberjack.Write(p)
}

// MultiLevelHandler 自定义 Handler 处理多个日志级别输出
type MultiLevelHandler struct {
	debugHandler        *slog.JSONHandler
	infoHandler         *slog.JSONHandler
	errorHandler        *slog.JSONHandler
	consoleHandler      *slog.TextHandler
	consoleColorHandler *devslog.DevelopHandler
	handlerOptions      *slog.HandlerOptions
	level               slog.Level
}

func (h *MultiLevelHandler) Enabled(ctx context.Context, level slog.Level) bool {
	return level >= h.level
}

// NewMultiLevelHandler 初始化日志处理器
func NewMultiLevelHandler(cfg Config) {
	infoPath := filepath.Join(cfg.Path, "info.log")
	debugPath := filepath.Join(cfg.Path, "debug.log")
	errorPath := filepath.Join(cfg.Path, "error.log")

	// 打开日志文件
	//debugFile, _ := os.OpenFile(debugPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	//infoFile, _ := os.OpenFile(infoPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	//errorFile, _ := os.OpenFile(errorPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)

	levelVar := &slog.LevelVar{}
	levelVar.Set(LogLevel[cfg.Level])
	fmt.Println("当前日志等级:", LogLevel[cfg.Level])

	infoWriter := &lumberjack.Logger{
		Filename:   infoPath,       // 日志文件路径
		MaxSize:    cfg.MaxSize,    // 单个文件最大大小（MB）
		MaxBackups: cfg.MaxBackups, // 保留旧文件的最大数量
		MaxAge:     cfg.MaxAge,     // 保留旧文件的最大天数
		Compress:   cfg.Compress,   // 是否压缩/归档旧文件
	}
	debugWriter := &lumberjack.Logger{
		Filename:   debugPath,      // 日志文件路径
		MaxSize:    cfg.MaxSize,    // 单个文件最大大小（MB）
		MaxBackups: cfg.MaxBackups, // 保留旧文件的最大数量
		MaxAge:     cfg.MaxAge,     // 保留旧文件的最大天数
		Compress:   cfg.Compress,   // 是否压缩/归档旧文件
	}
	errorWriter := &lumberjack.Logger{
		Filename:   errorPath,      // 日志文件路径
		MaxSize:    cfg.MaxSize,    // 单个文件最大大小（MB）
		MaxBackups: cfg.MaxBackups, // 保留旧文件的最大数量
		MaxAge:     cfg.MaxAge,     // 保留旧文件的最大天数
		Compress:   cfg.Compress,   // 是否压缩/归档旧文件
	}

	handlerOptions := func(levelVar slog.Level) *slog.HandlerOptions {
		return &slog.HandlerOptions{
			Level:     levelVar,
			AddSource: true,
			ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
				if a.Key == slog.SourceKey {
					source := a.Value.Any().(*slog.Source)
					// 只要最后两个路径
					paths := strings.Split(source.File, "/")
					if len(paths) > 2 {
						source.File = strings.Join(paths[len(paths)-2:], "/")
					}
					a.Value = slog.AnyValue(source)
					return a
				}
				// 新增时间格式化处理
				if a.Key == slog.TimeKey {
					// 将时间格式简化为 "15:04:05"（只有时分秒）
					// return slog.String(a.Key, a.Value.Time().Format("2006-01-02 15:04:05.999"))
					return slog.String(a.Key, a.Value.String())
				}

				return a
			},
		}
	}

	fmt.Println("debug日志初始化成功 path:", debugPath)
	fmt.Println("info日志初始化成功 path:", infoPath)
	fmt.Println("error日志初始化成功 path:", errorPath)

	var consoleColorHandler *devslog.DevelopHandler
	if LogLevel[cfg.Level] == slog.LevelDebug {
		// new logger with options
		opts := &devslog.Options{
			MaxSlicePrintSize: 4,
			SortKeys:          true,
			TimeFormat:        "[15:04:05]",
			NewLineAfterLog:   true,
			//DebugColor:        devslog.Magenta,
			StringerFormatter: true,
			HandlerOptions:    handlerOptions(levelVar.Level()),
		}
		consoleColorHandler = devslog.NewHandler(os.Stdout, opts)
	}

	handler := &MultiLevelHandler{
		debugHandler:        slog.NewJSONHandler(debugWriter, handlerOptions(slog.LevelDebug)),
		infoHandler:         slog.NewJSONHandler(infoWriter, handlerOptions(slog.LevelInfo)),
		errorHandler:        slog.NewJSONHandler(errorWriter, handlerOptions(slog.LevelError)),
		consoleColorHandler: consoleColorHandler,
		level:               levelVar.Level(),
	}

	slog.SetDefault(slog.New(handler))
}

// Handle 实现 slog.Handler 接口，根据日志级别写入不同的文件
func (h *MultiLevelHandler) Handle(ctx context.Context, r slog.Record) error {
	// debug模式就显示控制台日志，否则不输出日志
	if h.level == slog.LevelDebug {
		if err := h.consoleColorHandler.Handle(ctx, r); err != nil {
			return err
		}
	}
	// 所有日志都写入 debug.log
	if err := h.debugHandler.Handle(ctx, r); err != nil {
		return err
	}
	// info 级别及以上日志写入 info.log
	if r.Level >= slog.LevelInfo {
		if err := h.infoHandler.Handle(ctx, r); err != nil {
			return err
		}
	}
	// error 级别及以上日志写入 error.log
	if r.Level >= slog.LevelError {
		if err := h.errorHandler.Handle(ctx, r); err != nil {
			return err
		}
	}

	return nil
}

// WithAttrs 实现 slog.Handler 接口
func (h *MultiLevelHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	return &MultiLevelHandler{
		debugHandler: h.debugHandler.WithAttrs(attrs).(*slog.JSONHandler),
		infoHandler:  h.infoHandler.WithAttrs(attrs).(*slog.JSONHandler),
		errorHandler: h.errorHandler.WithAttrs(attrs).(*slog.JSONHandler),
	}
}

// WithGroup 实现 slog.Handler 接口
func (h *MultiLevelHandler) WithGroup(name string) slog.Handler {
	return &MultiLevelHandler{
		debugHandler: h.debugHandler.WithGroup(name).(*slog.JSONHandler),
		infoHandler:  h.infoHandler.WithGroup(name).(*slog.JSONHandler),
		errorHandler: h.errorHandler.WithGroup(name).(*slog.JSONHandler),
	}
}

func (h *MultiLevelHandler) GetSource(r slog.Record) *slog.Source {
	fs := runtime.CallersFrames([]uintptr{r.PC})
	f, _ := fs.Next()
	return &slog.Source{
		Function: f.Function,
		File:     f.File,
		Line:     f.Line,
	}
}
