# 飞刀游戏 - H5 版本

这是从 Android 项目转换而来的 HTML5 体感飞刀游戏！

## 📁 项目结构

```
feidao/
├── index.html              # 主页面
├── styles.css              # 样式文件
├── README.md               # 说明文档
├── assets/
│   ├── images/             # 图片资源
│   │   ├── level1_background.jpg
│   │   ├── level1_target.png
│   │   ├── level1_hand.png
│   │   ├── level1_fog.png
│   │   ├── level1_knife.png
│   │   ├── level2_background.jpg
│   │   ├── level2_target.png
│   │   ├── level3_background.jpg
│   │   └── level3_target.png
│   └── audio/              # 音频资源
│       ├── dao1.wav
│       ├── dao2.wav
│       ├── dao3.wav
│       ├── dao4.wav
│       └── ding1.wav
└── js/
    ├── config.js           # 关卡和武器配置
    ├── sensor.js           # 传感器管理
    ├── audio.js            # 音频管理
    ├── game.js             # 核心游戏逻辑
    └── main.js             # 主入口
```

## 🎮 游戏功能

### 1. 体感控制
- 使用手机陀螺仪传感器控制旋转
- 摇晃手机积累"气"值
- 推送手机发射飞刀

### 2. 鼠标控制（兼容桌面）
- 移动鼠标控制旋转
- 点击屏幕积累"气"值并发射

### 3. 游戏特色
- 3个不同关卡
- 4种武器选择（匕首、飞刀、短剑、飞镖）
- 移动靶（第3关）
- 计分系统
- 音效反馈

## 🚀 如何运行

### 方法 1：本地服务器（推荐）
使用任何 HTTP 服务器运行项目，例如：

使用 Python：
```bash
python -m http.server 8000
```

使用 Node.js (http-server)：
```bash
npm install -g http-server
http-server
```

使用 VS Code Live Server 插件

### 方法 2：直接打开
直接在浏览器中打开 `index.html` 也可以运行，但某些浏览器可能会限制本地资源加载。

## 📱 浏览器兼容性

- ✅ Chrome / Edge (推荐)
- ✅ Firefox
- ✅ Safari (iOS)
- ✅ 移动端浏览器

**注意**：体感功能需要 HTTPS 或 localhost 环境才能正常工作。

## 🎯 游戏玩法

1. 点击"开始游戏"按钮
2. （可选）点击"启用体感"使用传感器控制
3. 选择关卡和武器
4. 移动/旋转设备瞄准靶子
5. 积累足够的"气"值后发射飞刀
6. 命中靶子得分！

## 🔧 技术栈

- **HTML5 Canvas** - 游戏渲染
- **Vanilla JavaScript** - 游戏逻辑
- **Web Sensors API** - 体感控制
- **CSS3** - UI 样式

## 📝 转换说明

这个游戏是从 Android Kotlin + Jetpack Compose 项目转换而来：
- 保留了原版的所有游戏逻辑
- 使用 Web 传感器 API 替代 Android 传感器
- 使用 HTML5 Canvas 替代 Compose Canvas
- 保留了所有资源文件（图片、音频）
- 增加了鼠标控制作为备用方案
