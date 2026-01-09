package storage

import (
	"encoding/json"
	"time"

	"github.com/syndtr/goleveldb/leveldb"
)

// LevelDBStore 定义基于leveldb的数据存储结构
type LevelDBStore struct {
	db *leveldb.DB
}

// NewLevelDBStore 创建新的leveldb数据存储实例
func NewLevelDBStore(dbPath string) (*LevelDBStore, error) {
	db, err := leveldb.OpenFile(dbPath, nil)
	if err != nil {
		return nil, err
	}

	return &LevelDBStore{db: db}, nil
}

// Save 保存数据
func (ls *LevelDBStore) Save(entry *DataEntry) error {
	// 更新时间戳
	if entry.CreatedAt.IsZero() {
		entry.CreatedAt = time.Now()
	}
	entry.UpdatedAt = time.Now()

	// 序列化数据
	data, err := json.Marshal(entry)
	if err != nil {
		return err
	}

	// 存储数据
	return ls.db.Put([]byte(entry.ID), data, nil)
}

// Load 加载数据
func (ls *LevelDBStore) Load(id string) (*DataEntry, error) {
	// 获取数据
	data, err := ls.db.Get([]byte(id), nil)
	if err != nil {
		return nil, err
	}

	// 反序列化数据
	var entry DataEntry
	if err := json.Unmarshal(data, &entry); err != nil {
		return nil, err
	}

	return &entry, nil
}

// Delete 删除数据
func (ls *LevelDBStore) Delete(id string) error {
	return ls.db.Delete([]byte(id), nil)
}

// List 列出所有数据
func (ls *LevelDBStore) List() ([]*DataEntry, error) {
	var entries []*DataEntry
	iter := ls.db.NewIterator(nil, nil)
	defer iter.Release()

	for iter.Next() {
		var entry DataEntry
		if err := json.Unmarshal(iter.Value(), &entry); err != nil {
			continue
		}
		entries = append(entries, &entry)
	}

	return entries, iter.Error()
}

// Close 关闭数据库连接
func (ls *LevelDBStore) Close() error {
	return ls.db.Close()
}
