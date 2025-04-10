<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Header from "../../components/Header.vue"
import {
  removeFromCart,
  updateCartItem,
  getCartList,
  checkoutCart,
  OrderInfo,
} from "../../api/cart.ts";
import { ElMessage, ElImage } from 'element-plus'

// 购物车数据
const cartItems = ref<any[]>([])
const loading = ref(false)

// 结算表单
const checkoutForm = ref({
  name: '',
  telephone: '',
  postalCode: '',
  address: '',
  paymentMethod: 'wechat'
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  telephone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  postalCode: [
    { required: true, message: '请输入邮政编码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '邮政编码为6位数字', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  paymentMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }]
}

// 对话框控制
const dialogVisible = ref(false)

// 获取购物车列表
const fetchCartList = async () => {
  try {
    //loading.value = true
    const res = await getCartList()
    console.log(res)
    cartItems.value = res.data
  } catch (error) {
    console.error('获取购物车列表失败:', error)
    ElMessage.error('获取购物车列表失败')
  } finally {
    loading.value = false
  }
}

// 删除购物车中的商品
const removeItem = async (cartItemId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await removeFromCart(cartItemId)
    ElMessage.success('删除成功')
    await fetchCartList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error)
      ElMessage.error('删除商品失败')
    }
  }
}

// 更新商品数量
const updateQuantity = async (cartItemId: string, quantity: number) => {
  try {
    if (quantity < 1) {
      await removeItem(cartItemId)
      return
    }
    await updateCartItem(cartItemId, quantity)
    ElMessage.success('数量更新成功')
  } catch (error) {
    console.error('更新数量失败:', error)
    ElMessage.error('更新数量失败')
    await fetchCartList() // 恢复原来的数量
  }
}

// 计算总价
const totalPrice = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

// 计算总商品数
const totalItems = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
)

// 结算
const checkout = () => {
  if (cartItems.value.length === 0) {
    ElMessage.warning('购物车为空，无法结算')
    return
  }
  dialogVisible.value = true
}

// 提交结算
const submitCheckout = async () => {
  try {
    const orderInfo: OrderInfo = {
      cartItemIds: cartItems.value.map(item => item.id),
      shippingAddress: {
        name: checkoutForm.value.name,
        telephone: checkoutForm.value.telephone,
        postalCode: checkoutForm.value.postalCode,
        address: checkoutForm.value.address
      },
      paymentMethod: checkoutForm.value.paymentMethod
    }

    await checkoutCart(orderInfo)
    dialogVisible.value = false
    ElMessage.success('结算成功！')
    checkoutForm.value = {
      name: '',
      telephone: '',
      postalCode: '',
      address: '',
      paymentMethod: 'wechat'
    }
    await fetchCartList()
  } catch (error) {
    console.error('结算失败:', error)
    ElMessage.error('结算失败，请重试')
  }
}

// 初始化加载购物车数据
onMounted(() => {
  fetchCartList()
})
</script>

<template>
  <Header />
  <el-main class="cart-container">

    <el-card class="cart-card" shadow="hover">
      <!-- 购物车统计信息 -->
      <h1>我的购物车</h1>
      <div class="cart-summary">
        <span>共 {{ totalItems }} 件商品</span>
        <span class="total-price">总计：￥{{ totalPrice }}</span>
      </div>

      <!-- 空购物车提示 -->
      <div v-if="cartItems.length === 0" class="empty-cart">
        <el-empty description="您的购物车还是空的，快去选购商品吧~">
          <el-button  @click="$router.push('/booklist')">去逛逛</el-button>
        </el-empty>
      </div>

      <!-- 购物车商品列表 -->
      <el-table
          v-else
          :data="cartItems"
          border
          v-loading="loading"
          class="cart-table"
      >
        <el-table-column label="商品信息" width="400">
          <template #default="{ row }">
            <div class="product-info">
              <el-image
                  :src="row.cover"
                  :alt="row.title"
                  class="product-image"
                  fit="contain"
                  lazy
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="product-details">
                <h3 class="product-title">{{ row.title }}</h3>
                <div class="product-attributes">
                  <span v-if="row.author">作者: {{ row.author }}</span>
                  <span v-if="row.publisher">出版社: {{ row.publisher }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="单价" width="120" align="center">
          <template #default="{ row }">
            <span class="price">￥{{ row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="数量" width="150" align="center">
          <template #default="{ row }">
            <el-input-number
                v-model="row.quantity"
                :min="1"
                :max="99"
                controls-position="right"
                @change="(val:number) => updateQuantity(row.id, val)"
                class="quantity-input"
            />
          </template>
        </el-table-column>

        <el-table-column label="小计" width="120" align="center">
          <template #default="{ row }">
            <span class="subtotal">￥{{ (row.price * row.quantity).toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button
                type="danger"
                @click="removeItem(row.id)"
                size="small"
                plain
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 结算区域 -->
      <div v-if="cartItems.length > 0" class="checkout-area">
        <div class="checkout-summary">
          <span>共 {{ totalItems }} 件商品</span>
          <span class="total-amount">应付总额: <span class="amount">￥{{ totalPrice.toFixed(2) }}</span></span>
        </div>
        <el-button
            type="primary"
            size="large"
            @click="checkout"
            class="checkout-btn"
        >
          去结算
        </el-button>
      </div>
    </el-card>

    <!-- 结算对话框 -->
    <el-dialog
        v-model="dialogVisible"
        title="填写订单信息"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form
          :model="checkoutForm"
          :rules="rules"
          label-width="100px"
          ref="checkoutFormRef"
      >
        <el-form-item label="收货人" prop="name">
          <el-input v-model="checkoutForm.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="telephone">
          <el-input v-model="checkoutForm.telephone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="邮政编码" prop="postalCode">
          <el-input v-model="checkoutForm.postalCode" placeholder="请输入邮政编码" />
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input
              v-model="checkoutForm.address"
              type="textarea"
              :rows="3"
              placeholder="请输入详细地址信息"
          />
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-radio-group v-model="checkoutForm.paymentMethod">
            <el-radio label="wechat">
              <el-icon><Apple /></el-icon> 微信支付
            </el-radio>
            <el-radio label="alipay">
              <el-icon><Alipay /></el-icon> 支付宝
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 订单预览 -->
        <el-divider />
        <div class="order-preview">
          <h4>订单预览</h4>
          <div class="preview-items">
            <div v-for="item in cartItems" :key="item.id" class="preview-item">
              <el-image :src="item.cover" class="preview-image" fit="cover" />
              <div class="preview-info">
                <div class="preview-title">{{ item.title }}</div>
                <div class="preview-price">￥{{ item.price.toFixed(2) }} × {{ item.quantity }}</div>
              </div>
            </div>
          </div>
          <div class="preview-total">
            合计: <span>￥{{ totalPrice.toFixed(2) }}</span>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false" size="large">取消</el-button>
        <el-button
            type="primary"
            @click="submitCheckout"
            size="large"
            :loading="loading"
        >
          提交订单
        </el-button>
      </template>
    </el-dialog>
  </el-main>
</template>

<style scoped>
.cart-container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0 40px;
}

.cart-card {
  padding: 20px;
  margin-top: 20px;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.empty-cart {
  padding: 50px 0;
  text-align: center;
  color:darkred;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 100px;
  margin-right: 15px;
  border-radius: 4px;
  background: #f5f5f5;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  color: #999;
}

.product-details {
  flex: 1;
}

.product-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: normal;
  line-height: 1.4;
}

.product-attributes {
  font-size: 12px;
  color: #999;
}

.product-attributes span {
  display: block;
  margin-bottom: 4px;
}

.price, .subtotal {
  font-weight: bold;
  color: #f56c6c;
}

.quantity-input {
  width: 120px;
}

.checkout-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.checkout-summary {
  display: flex;
  align-items: center;
}

.total-amount {
  margin-left: 20px;
  font-size: 16px;
}

.amount {
  font-size: 20px;
  color: #f56c6c;
  font-weight: bold;
}

.checkout-btn {
  width: 180px;
}

/* 订单预览样式 */
.order-preview {
  margin-top: 20px;
}

.order-preview h4 {
  margin: 0 0 15px;
  font-size: 16px;
  font-weight: normal;
  color: #666;
}

.preview-items {
  max-height: 200px;
  overflow-y: auto;
}

.preview-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.preview-image {
  width: 60px;
  height: 80px;
  margin-right: 15px;
  background: #f5f5f5;
}

.preview-info {
  flex: 1;
}

.preview-title {
  margin-bottom: 5px;
  font-size: 14px;
}

.preview-price {
  font-size: 13px;
  color: #f56c6c;
}

.preview-total {
  text-align: right;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  font-size: 16px;
}

.preview-total span {
  font-size: 20px;
  color: #f56c6c;
  font-weight: bold;
  margin-left: 10px;
}
</style>