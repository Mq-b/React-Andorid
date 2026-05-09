# 生产管理系统

基于 React Native + Expo 的 Android 移动端应用。

## 技术栈

- React Native 0.83
- Expo SDK 55
- TypeScript 5.9
- Expo Go（调试运行）

## 环境要求

- Node.js >= 18
- 手机安装 Expo Go（应用商店搜索）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npx expo start
```

启动后用 Expo Go 扫描终端二维码，手机需与电脑在同一 WiFi。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npx expo start` | 启动开发服务器 |
| `npx expo start --clear` | 清除缓存启动 |
| `npx expo install <pkg>` | 安装 Expo 兼容依赖 |

## 项目结构

```txt
├── App.tsx          # 应用入口
├── app.json         # Expo 配置
├── tsconfig.json    # TypeScript 配置
└── assets/          # 静态资源
```

## 构建发布

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 构建 APK
eas build --platform android --profile preview
```
