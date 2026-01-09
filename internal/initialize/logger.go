package initialize

import (
	"path/filepath"
	"sw_call/pkg/logger"
)

func InitLogger(path string) {
	cfg := new(logger.Config)
	cfg.Level = -1
	cfg.Path = filepath.Join(path, "logs/log.log")
	cfg.MaxSize = 50 // MB
	cfg.MaxBackups = 5
	cfg.MaxAge = 10 // days
	cfg.Compress = true
	cfg.Mode = "debug"

	logger.NewLoggerWrapper(*cfg)
}
