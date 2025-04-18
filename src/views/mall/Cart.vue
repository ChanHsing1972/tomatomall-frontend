<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import Header from '../../components/Header.vue'
import {
  removeFromCart,
  updateCartItem,
  getCartList,
  checkoutCart,
  OrderInfo,
} from '../../api/cart.ts'
import {getProductDetail} from '../../api/product.ts'
import {ElMessage, ElImage} from 'element-plus'
import {ArrowDownBold} from "@element-plus/icons-vue";
import {router} from "../../router";

const cartItems = ref<any[]>([])
const loading = ref(false)
const currentProduct = ref<any>({})
const detailDialogVisible = ref(false)

const fetchCartList = async () => {
  try {
    const res = await getCartList()
    cartItems.value = res.data.result.items
  } catch (error) {
    console.error('获取购物车列表失败:', error)
    ElMessage.error('获取购物车列表失败')
  } finally {
    loading.value = false
  }
}

const removeItem = async (cartItemId: string) => {
  try {
    await removeFromCart(cartItemId)
    ElMessage({message: '删除成功', type: 'success', duration: 1000})
    await fetchCartList()
  } catch (error) {
    console.error('删除商品失败:', error)
    ElMessage.error('删除商品失败')
  }
}

const updateQuantity = async (cartItemId: string, quantity: number) => {
  try {
    if (quantity < 1) {
      await removeItem(cartItemId)
      return
    }
    const res=await updateCartItem(cartItemId, quantity)
    if (res.data.code === "200") {
      ElMessage({
        message: '数量更新成功',
        type: 'success',
        duration: 1000,
        grouping: true
      })
    }
    else{
      ElMessage.error('更新数量失败:'+res.data.msg)
      await fetchCartList()
    }
  } catch (error) {
    console.error('更新数量失败:', error)
    ElMessage.error('更新数量失败')
    await fetchCartList()
  }
}

const openDetailDialog = async (item: any) => {
  try {
    const res = await getProductDetail(item.productId)
    currentProduct.value = res.data.result
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

const totalPrice = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const totalItems = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
)

const checkout = () => {
  if (cartItems.value.length === 0) {
    ElMessage.warning('购物车为空，无法结算')
    return
  }
  submitCheckout()
}

const submitCheckout = async () => {
  try {
    const orderInfo: OrderInfo = {
      cartItemIds: cartItems.value.map(item => item.cartItemId),
      shippingAddress: {
        name: sessionStorage.getItem("name") ?? "",
        telephone: sessionStorage.getItem("telephone") ?? "",
        postalCode: "100000",
        address: sessionStorage.getItem("location") ?? "",
      },
      paymentMethod: "ALIPAY"
    }
    console.log(orderInfo)
    await checkoutCart(orderInfo)
    ElMessage.success('结算成功！')
    await fetchCartList()
    await router.push({path: '/orders'})
  } catch (error) {
    console.error('结算失败:', error)
    ElMessage.error('结算失败，请重试')
  }
}

onMounted(() => {
  fetchCartList()
})
</script>

<template>
  <Header/>
  <el-main class="cart-container">
    <!-- 顶部区域 -->
    <div class="cart-header" v-if="cartItems.length > 0">
      <h1>您的购物袋总计 RMB {{
          totalPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
        }}</h1>
      <p>所有订单均可享受免费送货和退货服务。</p>
      <el-button
          type="primary"
          class="full-width-btn"
          @click="checkout"
      >结账
      </el-button>
    </div>
    <div class="cart-header" v-else>
      <h1>您的购物袋是空的。</h1>
      <p>所有订单均可享受免费送货和退货服务。</p>
    </div>

    <!-- 商品列表区域 -->
    <div v-if="cartItems.length > 0" class="product-list">
      <div
          v-for="(item) in cartItems"
          :key="item.id"
          class="product-section"
      >
        <div class="product-image">
          <el-image
              :src="item.cover"
              fit="cover"
              class="rounded-image"
          />
        </div>
        <div class="product-details">
          <div class="info-left">
            <h3 class="product-title" @click.stop="openDetailDialog(item)">{{ item.title }}
              <el-icon style="font-size: 12px">
                <ArrowDownBold/>
              </el-icon>
            </h3>
            <span class="product-price">
              单价&nbsp;&nbsp;RMB {{
                item.price.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              }}
            </span>
            <el-input
                v-model="item.quantity"
                @change="updateQuantity(item.cartItemId, parseInt($event))"
                class="quantity-select"
                placeholder="请选择数量"
                size="default"
            ></el-input>
          </div>
          <div class="action-right">
            <p class="product-subtotal">
              RMB {{
                (item.price * item.quantity).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              }}
            </p>
            <el-button
                plain
                type="text"
                size="default"
                style="color: rgb(0, 113, 227)"
                @click="removeItem(item.cartItemId)"
            >
              移除
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <div v-else style="margin-top: -50px">
      <el-empty description=" ">
        <el-button style="border-radius: 8px" @click="$router.push('/booklist')">浏览书库</el-button>
      </el-empty>
    </div>

    <!-- 底部结算区域 -->
    <div
        class="cart-footer"
        v-if="cartItems.length > 0"
    >
      <div class="summary">
        <span>共 {{ totalItems.toLocaleString('en-US') }} 件商品</span>
        <span class="total-amount">
          总计 &nbsp;&nbsp;RMB {{
            totalPrice.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          }}
        </span>
        <el-button
            type="primary"
            class="bottom-check-btn"
            @click="checkout"
        >
          结账
        </el-button>
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        width="60%"
        top="10vh"
        class="detail-dialog"
    >
      <div class="dialog-content">
        <div class="dialog-image">
          <el-image
              :src="currentProduct.cover"
              fit="cover"
              class="detail-cover"
          />
        </div>
        <div class="dialog-info">
          <div class="info-section">
            <div class="info-row">
              <div class="info-label">名称</div>
              <div class="info-value">{{ currentProduct.title }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">价格</div>
              <div class="info-value">RMB {{ currentProduct.price }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">评分</div>
              <div class="info-value">{{ currentProduct.rate }} 分</div>
            </div>
            <div class="info-row">
              <div class="info-label">描述</div>
              <div class="info-value">{{ currentProduct.description }}</div>
            </div>
            <div
                class="info-row"
                v-for="spec in currentProduct.specifications"
                :key="spec.id"
            >
              <div class="info-label">{{ spec.item }}</div>
              <div class="info-value">{{ spec.value }}</div>
            </div>
          </div>
          <div
              class="product-detail"
              v-html="currentProduct.detail"
          ></div>
        </div>
      </div>
    </el-dialog>
  </el-main>
</template>


<style>
.cart-container {
  font-family: "sf pro display medium", sans-serif;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 120px 0 40px;

  .cart-header {
    text-align: center;
    margin: 0 auto 80px;
    width: 80%;
    overflow-wrap: break-word; /* 长单词或 URL 换行 */
    word-break: break-word;
  }

  .cart-header h1 {
    font-size: 36px;
    margin-bottom: 10px;
    color: #333;
  }

  .cart-header p {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
  }

  .full-width-btn {
    width: 27%;
    margin-top: 15px;
    border-radius: 8px;
    font-size: 13px;
    padding: 18px 0;
    border: none;
    color: #fff;
    background: rgb(0, 113, 227);
    transition: background 0.3s;
  }

  .full-width-btn:hover {
    background: rgb(64, 158, 255);
  }

  .product-list {
    border-top: 1px solid #d8d8d8;
    margin-bottom: 40px;
  }

  .product-section {
    display: flex;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid #d8d8d8;
  }

  .product-image {
    flex: 0 0 150px;
    margin-right: 30px;
  }

  .rounded-image {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 12px;
  }

  .product-details {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: -10px;
  }

  .info-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 15px;
  }

  .product-title {
    font-size: 20px;
    color: #333;
    margin-bottom: -5px;
    cursor: pointer;
    transition: color 0.3s ease;
    width: 400px;
    flex-grow: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .product-title:hover {
    font-size: 20px;
    color: rgb(0, 113, 227);
    margin-bottom: -5px;
    cursor: pointer;
    transition: color 0.3s ease;
    width: 400px;
    flex-grow: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* 新增下拉框样式 */

  .quantity-select {
    width: 120px;
    margin-top: 10px;
  }

  .product-price {
    font-size: 14px;
    color: #666;
    flex-grow: 0;
    overflow: hidden;
    width: 200px;
    /* 不让第一项继续扩展 */
    white-space: nowrap;
    /* 隐藏超出部分 */
    text-overflow: ellipsis;
    /* 显示省略号 */
  }

  .action-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .product-subtotal {
    margin-left: 100px;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 0;
    overflow: hidden;
    width: 200px;
    /* 不让第一项继续扩展 */
    white-space: nowrap;
    /* 隐藏超出部分 */
    text-overflow: ellipsis;
    /* 显示省略号 */
  }

  .cart-footer .summary {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-bottom: 20px;
    font-size: 16px;
    color: #333;
    gap: 5px;
  }

  .bottom-check-btn {
    width: 30%;
    margin-top: 15px;
    border-radius: 12px;
    font-size: 16px;
    padding: 28px 0;
    border: none;
    color: #fff;
    background: rgb(0, 113, 227);
    transition: background 0.3s;
  }

  .bottom-check-btn:hover {
    background: rgb(64, 158, 255);
  }

  .total-amount {
    font-weight: bold;
    font-size: 20px;
    overflow-wrap: break-word; /* 长单词或 URL 换行 */
    word-break: break-word;
  }

  .detail-dialog {
    padding: 20px 30px;
    border-radius: 30px;
  }

  .detail-dialog .el-dialog__header {
    background-color: #fff;
    border-bottom: none;
    color: #333;
  }

  .detail-dialog .el-dialog__body {
    padding: 30px;
    margin-bottom: 30px;
  }

  .dialog-content {
    display: flex;
    gap: 50px;
  }

  .dialog-image {
    flex: 0 0 35%;
    display: flex;
    justify-content: center;
  }

  .detail-cover {
    width: 100%;
    height: 450px;
    object-fit: cover;
    border-radius: 15px;
  }

  .dialog-info {
    flex: 1 1 45%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .info-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-row {
    display: flex;
    align-items: center;
  }

  .info-label {
    font-size: 12px;
    color: #999;
    width: 70px;
    text-align: left;
  }

  .info-value {
    flex-grow: 0;
    font-size: 15px;
    color: #333;
    font-weight: 400;
    width:350px;
    height: 21px;
    overflow-y: auto;
    overflow-wrap: break-word;
    white-space: normal;
    word-break: break-word;
    text-align: left;
  }

  .product-detail {
    font-size: 15px;
    line-height: 1.6;
    color: #444;
    padding: 20px;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    background-color: #fff;
    overflow-wrap: break-word;
    white-space: normal;
    word-break: break-word;
  }

  @media (max-width: 768px) {
    .dialog-content {
      flex-direction: column;
    }

    .dialog-image,
    .dialog-info {
      flex: 1 1 100%;
    }
  }
}
</style>