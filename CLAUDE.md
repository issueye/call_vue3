# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Medical call client desktop application built with Wails v2 (Go + Vue 3).

## Commands

```bash
# Install Wails CLI
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# Install frontend dependencies
cd frontend && npm install

# Development mode (starts Vite at localhost:3000 + Wails app)
wails dev

# Build for Windows
wails build -platform windows

# Build for all platforms
wails build

# Download dependencies
go mod tidy
```

## Architecture

### Go Backend Structure

```
call_vue3/
├── main.go                           # Application entry point, config & logger init
├── app.go                            # App struct with Go-frontend bindings
├── internal/
│   ├── config/                       # Configuration management (YAML + env vars)
│   ├── logger/                       # Structured logging with levels
│   ├── errors/                       # Custom error types
│   └── service/caller/               # Process management service
└── configs/
    └── app.yaml                      # Application configuration file
```

### Key Components

- **main.go**: Loads config, initializes logger, creates services, runs Wails app
- **app.go**: App struct with lifecycle hooks and frontend bindings
- **internal/config**: Configuration from YAML with env var overrides (CALLER_PORT, CALLER_EXE_PATH, LOG_LEVEL)
- **internal/service/caller**: Manages suwei_caller_local.exe lifecycle (start/stop/health-check)
- **internal/logger**: Structured logging with debug/info/warn/error/fatal levels

### Configuration (configs/app.yaml)

All settings are externalized. Key configs:
- `app.*`: Window properties (title, size, always_on_top)
- `process.exe_path`: Backend exe path
- `process.port`: Backend port (default: 21999)
- `logging.level`: Log level (debug/info/warn/error/fatal)

## Go-Frontend Communication

Add methods to `App` struct in `app.go` to expose Go functions to frontend:

```go
func (a *App) MyMethod(param string) string {
    return fmt.Sprintf("结果: %s", param)
}
```

Frontend calls generated bindings in `frontend/src/wails/`:

```javascript
import { MyMethod } from './wailsjs/go/main/App';
const result = await MyMethod("参数");
```

## Key Integration

The app launches `suwei_caller_local.exe` (backend process) on startup via `internal/service/caller/`. Process configuration is loaded from `configs/app.yaml`. Environment variables can override config values:
- `CALLER_PORT`: Override the port
- `CALLER_EXE_PATH`: Override the executable path
- `LOG_LEVEL`: Override logging level
