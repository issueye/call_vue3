package initialize

import (
	"fmt"
	"log/slog"
	"path/filepath"
	"sw_call/pkg/storage"
)

func InitApp(path string) error {
	InitLogger(path)
	err := InitStore(path)
	if err != nil {
		return err
	}

	return nil
}

func InitStore(path string) error {
	// storage 目录
	dataPath := filepath.Join(path, "storage")

	// 初始化数据存储
	ds, err := storage.InitDataStore(dataPath)
	if err != nil {
		return fmt.Errorf("初始化数据存储失败: %v", err)
	}

	var entry *storage.DataEntry
	entry, err = ds.Load("client_id")
	if err != nil {
		entry = CreateClientID()
		ds.Save(entry)
	}

	if entry.Data == nil {
		entry = CreateClientID()
		ds.Save(entry)
	}
	slog.Info("客户端ID", slog.Any("client_id", entry.Data))

	return nil
}
