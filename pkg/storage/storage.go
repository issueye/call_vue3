package storage

import (
	"time"
)

// DataEntry 定义数据条目结构
type DataEntry struct {
	ID        string    `json:"id"`
	Type      string    `json:"type"`
	Data      any       `json:"data"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// DataStore 定义数据存储结构
type DataStore struct {
	store Storage
}

// 单例模式
var instance *DataStore

// GetInstance 获取单例实例
func GetInstance() *DataStore {
	if instance == nil {
		instance = &DataStore{}
	}
	return instance
}

func SetInstance(store Storage) {
	instance = &DataStore{store: store}
}

// NewDataStore 创建新的数据存储实例
func InitDataStore(dataPath string) (*DataStore, error) {
	store, err := NewLevelDBStore(dataPath)
	if err != nil {
		return nil, err
	}

	SetInstance(store)
	return GetInstance(), nil
}

// Save 保存数据
func (ds *DataStore) Save(entry *DataEntry) error {
	return ds.store.Save(entry)
}

// Load 加载数据
func (ds *DataStore) Load(id string) (*DataEntry, error) {
	return ds.store.Load(id)
}

// Delete 删除数据
func (ds *DataStore) Delete(id string) error {
	return ds.store.Delete(id)
}

// List 列出所有数据
func (ds *DataStore) List() ([]*DataEntry, error) {
	return ds.store.List()
}

// Close 关闭存储连接
func (ds *DataStore) Close() error {
	return ds.store.Close()
}
