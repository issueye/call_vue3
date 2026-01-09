package storage

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLevelDBStore(t *testing.T) {
	// 创建临时测试目录
	testDir := filepath.Join(os.TempDir(), "leveldb_test")
	defer os.RemoveAll(testDir)

	// 创建LevelDB存储实例
	store, err := NewLevelDBStore(testDir)
	assert.NoError(t, err)
	defer store.Close()

	// 测试数据
	testEntry := &DataEntry{
		ID:   "test123",
		Type: "test",
		Data: map[string]interface{}{
			"code":    200,
			"message": "测试数据",
		},
	}

	// 测试保存数据
	err = store.Save(testEntry)
	assert.NoError(t, err)

	// 测试加载数据
	loadedEntry, err := store.Load(testEntry.ID)
	assert.NoError(t, err)
	assert.Equal(t, testEntry.ID, loadedEntry.ID)
	assert.Equal(t, testEntry.Type, loadedEntry.Type)
	assert.NotZero(t, loadedEntry.CreatedAt)
	assert.NotZero(t, loadedEntry.UpdatedAt)

	// 测试列出所有数据
	entries, err := store.List()
	assert.NoError(t, err)
	assert.Len(t, entries, 1)

	// 测试删除数据
	err = store.Delete(testEntry.ID)
	assert.NoError(t, err)

	// 验证数据已被删除
	_, err = store.Load(testEntry.ID)
	assert.Error(t, err)

	// 再次列出所有数据
	entries, err = store.List()
	assert.NoError(t, err)
	assert.Len(t, entries, 0)
}
