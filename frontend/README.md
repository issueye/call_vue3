# 呼叫客户端 Vue3 版本

## 技术栈

- Vue 3 + JavaScript
- Vite 构建工具
- Pinia 状态管理
- Vue Router 路由
- Axios HTTP 请求
- CSS + CSS 变量

## 项目结构

```
src/
├── assets/
│   └── css/
│       └── main.css          # 全局样式 + CSS 变量
├── components/
│   ├── common/               # 通用组件
│   │   ├── BaseButton.vue
│   │   ├── BaseBadge.vue
│   │   └── SvgIcon.vue
│   ├── layout/               # 布局组件
│   │   ├── Header.vue
│   │   ├── DesktopLayout.vue
│   │   ├── MobileLayout.vue
│   │   └── WorkbenchLayout.vue
│   └── business/             # 业务组件
│       ├── PatientItem.vue
│       ├── PatientList.vue
│       ├── PatientDetailCard.vue
│       └── CallButtons.vue
├── composables/              # 组合式函数
│   ├── useResponsive.js
│   ├── useMQTT.js
│   └── useRipple.js
├── stores/                   # Pinia 状态
│   ├── user.js
│   └── patient.js
├── router/                   # Vue Router
├── utils/                    # 工具函数
│   ├── request.js
│   └── responsive.js
└── views/
    ├── Login.vue
    ├── Workbench.vue
    └── Layout.vue
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 功能特性

- 患者列表管理
- 患者详情展示
- 呼叫/重呼/过号操作
- 响应式布局
- MQTT 实时通信
