#!/bin/bash

# Husky初始化脚本
# 用于设置Git Hook自动格式化功能

set -e

echo "======================================"
echo "  初始化Husky Git Hooks"
echo "======================================"
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在tomatomall-frontend目录下运行此脚本"
    exit 1
fi

# 1. 安装依赖
echo "📦 步骤1: 安装npm依赖..."
npm install

# 2. 初始化Husky
echo "🔧 步骤2: 初始化Husky..."
npm run prepare

# 3. 创建pre-commit hook
echo "📝 步骤3: 创建pre-commit hook..."
npx husky add .husky/pre-commit "npx lint-staged"

# 4. 确保hook可执行
echo "🔐 步骤4: 设置文件权限..."
chmod +x .husky/pre-commit

# 5. 验证配置
echo "✅ 步骤5: 验证配置..."
if [ -f ".husky/pre-commit" ]; then
    echo "   ✓ pre-commit hook 已创建"
else
    echo "   ✗ pre-commit hook 创建失败"
    exit 1
fi

echo ""
echo "======================================"
echo "  ✅ Husky初始化完成!"
echo "======================================"
echo ""
echo "现在可以测试自动格式化功能:"
echo ""
echo "1. 创建一个格式错误的文件:"
echo "   cat > src/test.ts << 'EOF'"
echo "   const   a=1"
echo "     const b  =   2"
echo "   EOF"
echo ""
echo "2. 提交代码:"
echo "   git add src/test.ts"
echo "   git commit -m 'test'"
echo ""
echo "3. 查看文件,应该已经被自动格式化"
echo ""
