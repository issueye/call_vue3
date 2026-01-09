package system

import (
	"fmt"
	"net"
	"os"
	"runtime"
	"strings"

	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/disk"
	"github.com/shirou/gopsutil/v4/host"
	"github.com/shirou/gopsutil/v4/mem"
)

// SystemInfo 系统信息结构
type SystemInfo struct {
	Hostname     string   `json:"hostname"`     // 主机名
	OS           string   `json:"os"`           // 操作系统
	Architecture string   `json:"architecture"` // 系统架构
	CPUInfo      string   `json:"cpu_info"`     // CPU信息
	MemoryTotal  uint64   `json:"memory_total"` // 总内存
	MemoryFree   uint64   `json:"memory_free"`  // 可用内存
	DiskInfo     []string `json:"disk_info"`    // 磁盘信息
	IPAddresses  []string `json:"ip_addresses"` // IP地址列表
}

// GetSystemInfo 获取系统信息
func GetSystemInfo() (*SystemInfo, error) {
	info := &SystemInfo{}

	// 获取主机名
	hostname, err := os.Hostname()
	if err != nil {
		return nil, err
	}
	info.Hostname = hostname

	// 获取操作系统和架构信息
	info.OS = runtime.GOOS
	info.Architecture = runtime.GOARCH

	// 获取CPU信息
	cpuInfo, err := cpu.Info()
	if err == nil && len(cpuInfo) > 0 {
		info.CPUInfo = fmt.Sprintf("%s (%d cores)", cpuInfo[0].ModelName, cpuInfo[0].Cores)
	}

	// 获取内存信息
	memInfo, err := mem.VirtualMemory()
	if err == nil {
		info.MemoryTotal = memInfo.Total
		info.MemoryFree = memInfo.Free
	}

	// 获取磁盘信息
	partitions, err := disk.Partitions(false)
	if err == nil {
		for _, partition := range partitions {
			usage, err := disk.Usage(partition.Mountpoint)
			if err == nil {
				diskInfo := fmt.Sprintf("%s Total: %d GB, Free: %d GB",
					partition.Mountpoint,
					usage.Total/(1024*1024*1024),
					usage.Free/(1024*1024*1024),
				)
				info.DiskInfo = append(info.DiskInfo, diskInfo)
			}
		}
	}

	// 获取IP地址
	addrs, err := net.InterfaceAddrs()
	if err == nil {
		for _, addr := range addrs {
			if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
				if ipnet.IP.To4() != nil {
					info.IPAddresses = append(info.IPAddresses, ipnet.IP.String())
				}
			}
		}
	}

	return info, nil
}

// GetHostInfo 获取主机基本信息
func GetHostInfo() (map[string]any, error) {
	info, err := host.Info()
	if err != nil {
		return nil, err
	}

	hostInfo := map[string]any{
		"hostname":     info.Hostname,
		"os":           info.OS,
		"platform":     info.Platform,
		"version":      info.PlatformVersion,
		"kernel":       info.KernelVersion,
		"architecture": info.KernelArch,
		"uptime":       info.Uptime,
	}

	return hostInfo, nil
}

// GetNetworkInterfaces 获取网络接口信息
func GetNetworkInterfaces() ([]map[string]any, error) {
	interfaces, err := net.Interfaces()
	if err != nil {
		return nil, err
	}

	var result []map[string]any
	for _, iface := range interfaces {
		// 跳过回环接口
		if strings.Contains(iface.Flags.String(), "loopback") {
			continue
		}

		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}

		var ipAddresses []string
		for _, addr := range addrs {
			if ipnet, ok := addr.(*net.IPNet); ok {
				ipAddresses = append(ipAddresses, ipnet.IP.String())
			}
		}

		ifaceInfo := map[string]any{
			"name":    iface.Name,
			"mac":     iface.HardwareAddr.String(),
			"flags":   iface.Flags.String(),
			"mtu":     iface.MTU,
			"ip_list": ipAddresses,
		}

		result = append(result, ifaceInfo)
	}

	return result, nil
}
