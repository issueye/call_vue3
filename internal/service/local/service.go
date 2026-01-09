package local

import (
	"crypto/rand"
	"encoding/hex"
	"log/slog"
	"sw_call/pkg/storage"
)

// Service 本地数据服务
type Service struct {
	store *storage.DataStore
}

// NewService 创建新的本地数据服务实例
func NewService(store *storage.DataStore) *Service {
	return &Service{
		store: store,
	}
}

// LoadClientID 加载客户端ID
func (s *Service) LoadClientID() *Response {
	entry, err := s.store.Load("client_id")
	if err != nil {
		// 如果不存在，创建新的客户端ID
		newID := generateClientID()
		newEntry := &storage.DataEntry{
			ID:   "client_id",
			Type: "config",
			Data: newID,
		}
		if saveErr := s.store.Save(newEntry); saveErr != nil {
			slog.Error("保存客户端ID失败", "error", saveErr)
			return NewErrorResponse("生成客户端ID失败")
		}
		return NewSuccessResponse(newID)
	}
	if entry.Data == nil {
		// 数据为空，重新生成
		newID := generateClientID()
		entry.Data = newID
		if saveErr := s.store.Save(entry); saveErr != nil {
			slog.Error("保存客户端ID失败", "error", saveErr)
			return NewErrorResponse("生成客户端ID失败")
		}
		return NewSuccessResponse(newID)
	}
	return NewSuccessResponse(entry.Data)
}

// SaveForwardURL 保存服务器地址
func (s *Service) SaveForwardURL(url string) *Response {
	if url == "" {
		return NewErrorResponse("服务器地址不能为空")
	}

	entry := &storage.DataEntry{
		ID:   "forward_url",
		Type: "config",
		Data: url,
	}

	if err := s.store.Save(entry); err != nil {
		slog.Error("保存服务器地址失败", "error", err)
		return NewErrorResponse("保存服务器地址失败")
	}

	slog.Info("保存服务器地址成功", "url", url)
	return NewSuccessResponse(nil)
}

// LoadForwardURL 加载服务器地址
func (s *Service) LoadForwardURL() *Response {
	entry, err := s.store.Load("forward_url")
	if err != nil {
		// 不存在时返回空字符串
		return NewSuccessResponse("")
	}
	if entry.Data == nil {
		return NewSuccessResponse("")
	}
	return NewSuccessResponse(entry.Data)
}

// LoadLocaldata 加载本地数据
func (s *Service) LoadLocaldata(id string) *Response {
	if id == "" {
		return NewErrorResponse("数据ID不能为空")
	}

	entry, err := s.store.Load(id)
	if err != nil {
		// 数据不存在时返回 null
		return NewSuccessResponse(nil)
	}

	return NewSuccessResponse(entry.Data)
}

// SaveLocaldata 保存本地数据
func (s *Service) SaveLocaldata(id, dataType string, data interface{}) *Response {
	if id == "" {
		return NewErrorResponse("数据ID不能为空")
	}
	if dataType == "" {
		dataType = "default"
	}

	entry := &storage.DataEntry{
		ID:   id,
		Type: dataType,
		Data: data,
	}

	if err := s.store.Save(entry); err != nil {
		slog.Error("保存本地数据失败", "id", id, "error", err)
		return NewErrorResponse("保存本地数据失败")
	}

	slog.Info("保存本地数据成功", "id", id, "type", dataType)
	return NewSuccessResponse(nil)
}

// DeleteLocaldata 删除本地数据
func (s *Service) DeleteLocaldata(id string) *Response {
	if id == "" {
		return NewErrorResponse("数据ID不能为空")
	}

	if err := s.store.Delete(id); err != nil {
		slog.Error("删除本地数据失败", "id", id, "error", err)
		return NewErrorResponse("删除本地数据失败")
	}

	slog.Info("删除本地数据成功", "id", id)
	return NewSuccessResponse(nil)
}

// GetLocaldataList 获取本地数据列表
func (s *Service) GetLocaldataList() *Response {
	entries, err := s.store.List()
	if err != nil {
		slog.Error("获取本地数据列表失败", "error", err)
		return NewErrorResponse("获取本地数据列表失败")
	}

	return NewSuccessResponse(entries)
}

// generateClientID 生成客户端ID
func generateClientID() string {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		slog.Error("生成随机ID失败", "error", err)
		// 降级方案：使用时间戳
		return "client_" + string(rune(123456789))
	}
	return hex.EncodeToString(bytes)
}
