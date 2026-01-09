package initialize

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"math/rand"
	"sw_call/pkg/storage"
	"time"

	"github.com/google/uuid"
)

func CreateClientID() *storage.DataEntry {
	clientId := GenerateClientID()
	return &storage.DataEntry{
		ID:   "client_id",
		Type: "config",
		Data: clientId,
	}
}

func GenerateClientID() string {
	// 当前时间戳 + uuid + 随机数 然后 hash
	nowTime := time.Now().Unix()
	uuid := uuid.New().String()
	random := rand.Intn(1000000)

	// 拼接字符串
	str := fmt.Sprintf("%d%s%d", nowTime, uuid, random)

	// 计算哈希值
	hash := md5.Sum([]byte(str))

	// 返回哈希值的字符串表示
	return hex.EncodeToString(hash[:])
}
