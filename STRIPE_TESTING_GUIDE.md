# Stripe 订阅系统测试指南

## 🎯 问题说明

你遇到的问题是：**Stripe 沙盒中没有数据，权限检查失败**

**根本原因**：在本地开发时，Stripe 无法向你的 `localhost:8000` 发送 webhook，所以订阅记录永远不会被保存到数据库中。

## 🔄 正确的订阅流程

1. **用户点击订阅** → 调用 `/subscriptions/checkout`
2. **用户完成支付** → Stripe 自动发送 webhook 到 `/webhook/stripe`
3. **服务器处理 webhook** → 在数据库中创建订阅记录
4. **用户访问功能** → 权限检查通过

## 🛠️ 解决方案：使用 Stripe CLI

### 步骤 1：安装 Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# 或者下载二进制文件
# https://github.com/stripe/stripe-cli/releases
```

### 步骤 2：登录 Stripe

```bash
stripe login
```

### 步骤 3：转发 webhook 到本地

```bash
stripe listen --forward-to localhost:8000/api/v1/webhook/stripe
```

这个命令会：

- 监听你的 Stripe 账户中的所有事件
- 将事件转发到你的本地服务器
- 显示 webhook 签名密钥

### 步骤 4：更新环境变量

复制 Stripe CLI 显示的 webhook 签名密钥，更新你的 `.env` 文件：

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # 从 Stripe CLI 复制
```

### ⚠️ 步骤 5：清理 Dashboard 中的 webhook 端点

**重要**：删除 Stripe Dashboard 中的 webhook 端点，避免冲突：

1. 登录 Stripe Dashboard
2. 进入 **Developers → Webhooks**
3. 找到并删除任何指向 ngrok 或本地地址的端点
4. 在开发阶段只使用 Stripe CLI

## 🧪 完整测试流程

### 1. 启动服务

```bash
# 终端 1：启动你的应用
npm start

# 终端 2：启动 Stripe CLI webhook 转发
stripe listen --forward-to localhost:8000/api/v1/webhook/stripe
```

### 2. 使用 Postman 测试

1. **用户登录**：获取 JWT token
2. **创建订阅**：调用 `/subscriptions/checkout`
3. **完成支付**：
   - 复制返回的 `checkoutUrl`
   - 在浏览器中打开
   - 使用测试信用卡：`4242 4242 4242 4242`
   - 完成支付
4. **验证结果**：
   - 检查 Stripe CLI 终端，应该看到 webhook 事件
   - 调用 `/subscriptions/status` 检查订阅状态
   - 测试权限功能

## 🔍 验证检查点

### Stripe CLI 终端应该显示：

```
2024-01-15 10:30:15   --> checkout.session.completed [evt_xxx]
2024-01-15 10:30:15  <--  [200] POST http://localhost:8000/api/v1/webhook/stripe [evt_xxx]
```

### 你的应用日志应该显示：

```
处理 Stripe webhook 事件: checkout.session.completed
成功处理订阅创建: 用户 test@example.com, 计划 basic
```

### Stripe Dashboard 中应该看到：

- **Customers**：新创建的客户
- **Subscriptions**：活跃的订阅
- **Payments**：成功的支付记录
- **Events**：webhook 事件状态为成功（如果有配置的端点）

## 📋 环境变量配置

确保你的 `.env` 文件包含：

```env
# Stripe 配置
STRIPE_SECRET_KEY=sk_test_xxxxx  # 你的 Stripe 测试密钥
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # 从 Stripe CLI 获取
STRIPE_BASIC_PRICE_ID=price_xxxxx  # 从 Stripe Dashboard 复制
STRIPE_PREMIUM_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx

# 应用配置
APP_URL=http://localhost:3000
```

## 🚀 生产环境

在生产环境中，你需要：

1. **配置真实的 webhook 端点**：

   - URL：`https://yourdomain.com/api/v1/webhook/stripe`
   - 监听事件：`checkout.session.completed`, `customer.subscription.updated`, 等

2. **使用生产环境密钥**：
   - `STRIPE_SECRET_KEY=sk_live_xxxxx`
   - `STRIPE_WEBHOOK_SECRET=whsec_xxxxx` (从生产 webhook 端点获取)

## 🐛 常见问题

### 问题：Webhook 错误率 100%

**原因**：Stripe Dashboard 中配置了指向失效 ngrok 地址的 webhook 端点
**解决**：删除 Dashboard 中的 webhook 端点，只使用 Stripe CLI

### 问题：本地收不到 webhook

**原因**：Stripe CLI 没有正确启动或端口不匹配
**解决**：确保 Stripe CLI 指向正确的端口和路径

## 🎉 总结

**不需要任何调试路由！** 你的现有路由是完全正确的：

- ✅ `/subscriptions/checkout` - 创建支付会话
- ✅ `/subscriptions/status` - 检查订阅状态
- ✅ `/webhook/stripe` - 处理 Stripe webhook
- ✅ `/basic/features` - 权限检查

**开发环境只需要 Stripe CLI 来转发 webhook 到你的本地服务器。**

这样你就能看到完整的真实 Stripe 集成效果了！
