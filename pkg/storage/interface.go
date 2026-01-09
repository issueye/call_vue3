package storage

// Storage 定义存储接口
type Storage interface {
	// Save 保存数据
	Save(entry *DataEntry) error

	// Load 加载数据
	Load(id string) (*DataEntry, error)

	// Delete 删除数据
	Delete(id string) error

	// List 列出所有数据
	List() ([]*DataEntry, error)

	// Close 关闭存储连接
	Close() error
}
