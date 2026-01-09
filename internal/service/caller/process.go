package caller

// processService 进程服务实现
// type processService struct {
// 	cfg     *Config
// 	cmd     *exec.Cmd
// 	mu      sync.RWMutex
// 	running bool
// }

// // NewService 创建进程服务
// func NewService(cfg *config.ProcessConfig) ProcessService {
// 	return &processService{
// 		cfg: &Config{
// 			ExePath:    cfg.ExePath,
// 			Port:       cfg.Port,
// 			Args:       cfg.Args,
// 			StartRetry: cfg.StartRetry,
// 			RetryDelay: cfg.RetryDelay,
// 		},
// 	}
// }

// // Start 启动进程
// func (s *processService) Start(ctx context.Context) error {
// 	s.mu.Lock()
// 	defer s.mu.Unlock()

// 	if s.running {
// 		slog.Info("进程已在运行")
// 		return nil
// 	}

// 	var lastErr error
// 	for attempt := 1; attempt <= s.cfg.StartRetry; attempt++ {
// 		slog.Info("启动呼叫进程", slog.Any("次数", attempt), slog.Any("重试次数", s.cfg.StartRetry))

// 		// 构建参数
// 		args := fmt.Sprintf(s.cfg.Args, s.cfg.Port)
// 		slog.Debug("启动参数", slog.Any("args", args))

// 		// 创建命令
// 		s.cmd = exec.CommandContext(ctx, s.cfg.ExePath, args)
// 		// 不显示控制台
// 		s.cmd.SysProcAttr = &syscall.SysProcAttr{
// 			HideWindow:    true,
// 			CreationFlags: 0x08000000,
// 		}

// 		// 启动进程
// 		if err := s.cmd.Start(); err != nil {
// 			lastErr = err
// 			slog.Warn("进程启动失败", slog.Any("错误信息", err.Error()))
// 			if attempt < s.cfg.StartRetry {
// 				sleepDuration := time.Duration(s.cfg.RetryDelay) * time.Millisecond
// 				time.Sleep(sleepDuration)
// 			}
// 			continue
// 		}

// 		// 等待进程启动完成
// 		time.Sleep(500 * time.Millisecond)

// 		// 检查进程是否真正运行
// 		if s.cmd.Process != nil {
// 			s.running = true
// 			slog.Info("呼叫进程启动成功", slog.Any("端口", s.cfg.Port))
// 			return nil
// 		}
// 	}

// 	slog.Error("多次尝试后仍无法启动进程")
// 	return errors.NewCallerError(
// 		errors.ErrCodeProcessStartFailed,
// 		"failed to start caller process",
// 		lastErr,
// 	)
// }

// // Stop 停止进程
// func (s *processService) Stop(ctx context.Context) error {
// 	s.mu.Lock()
// 	defer s.mu.Unlock()

// 	if !s.running {
// 		slog.Info("进程未运行，无需停止")
// 		return nil
// 	}

// 	if s.cmd == nil || s.cmd.Process == nil {
// 		s.running = false
// 		return nil
// 	}

// 	slog.Info("停止呼叫进程")

// 	// 尝试优雅停止
// 	done := make(chan struct{})
// 	go func() {
// 		if err := s.cmd.Wait(); err != nil {
// 			slog.Warn("进程退出时出错: %v", err)
// 		}
// 		close(done)
// 	}()

// 	// 发送中断信号
// 	if err := s.cmd.Process.Signal(os.Kill); err != nil {
// 		slog.Warn("发送终止信号失败", slog.Any("失败原因", err.Error()))
// 	}

// 	// 等待进程退出
// 	select {
// 	case <-ctx.Done():
// 		slog.Warn("等待进程退出超时")
// 	case <-done:
// 		slog.Info("进程已停止")
// 	}

// 	s.running = false
// 	s.cmd = nil
// 	return nil
// }

// // IsRunning 检查进程是否运行
// func (s *processService) IsRunning() bool {
// 	s.mu.RLock()
// 	defer s.mu.RUnlock()

// 	if !s.running {
// 		return false
// 	}

// 	// 检查进程是否仍然存在
// 	if s.cmd != nil && s.cmd.Process != nil {
// 		return s.cmd.Process.Pid > 0
// 	}

// 	s.running = false
// 	return false
// }

// // HealthCheck 健康检查
// func (s *processService) HealthCheck(ctx context.Context) error {
// 	s.mu.RLock()
// 	running := s.running
// 	cmd := s.cmd
// 	s.mu.RUnlock()

// 	if !running {
// 		return errors.NewCallerError(
// 			errors.ErrCodeProcessStopped,
// 			"caller process is not running",
// 			nil,
// 		)
// 	}

// 	// 检查进程是否存在
// 	if cmd != nil && cmd.Process != nil {
// 		if err := cmd.Process.Signal(os.Signal(nil)); err != nil {
// 			s.mu.Lock()
// 			s.running = false
// 			s.mu.Unlock()
// 			return errors.NewCallerError(
// 				errors.ErrCodeProcessStopped,
// 				"caller process has stopped",
// 				err,
// 			)
// 		}
// 	}

// 	return nil
// }

// // GetPort 获取端口
// func (s *processService) GetPort() int {
// 	return s.cfg.Port
// }
