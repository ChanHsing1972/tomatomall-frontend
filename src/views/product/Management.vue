<script setup lang="ts">
import {ref, onMounted} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {Delete} from "@element-plus/icons-vue";
import {
  createProduct,
  getProductList,
  updateProduct,
  deleteProduct,
  updateStockpile,
  getStockpile,
} from "../../api/product.ts";

// 完整匹配API中的specification类型
interface Spec {
  id: string;
  item: string;
  value: string;
  productId: string;
}

// 用于表单输入的规格类型（创建时）
interface FormSpec {
  id: string;
  item: string;
  value: string;
  productId?: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  rate: number;
  cover: string;
  detail: string;
  stock?: number;
  specifications: Spec[];
}

// 用于创建商品的表单数据
interface CreateProductForm {
  id: string;
  title: string;
  description: string;
  price: string;
  rate: number;
  cover: string;
  detail: string;
  specifications: FormSpec[];
}

const productList = ref<Product[]>([]);

const newProduct = ref<CreateProductForm>({
  id: "",
  title: "",
  description: "",
  price: "",
  rate: 0,
  cover: "",
  detail: "",
  specifications: [],
});
const currentProduct = ref<Product>({
  id: "",
  title: "",
  description: "",
  price: "",
  rate: 0,
  cover: "",
  detail: "",
  stock: 0,
  specifications: [],
});

const stockForm = ref({
  productId: "",
  currentStock: 0,
  amount: 0,
  operation: "add" as "add" | "set",
});

const displayCreateCard = ref(false);
const editDialogVisible = ref(false);
const stockDialogVisible = ref(false);

onMounted(() => {
  fetchProducts();
});

const fetchProducts = async () => {
  try {
    const response = await getProductList();
    productList.value = response.data.result;

    // 遍历每个商品，获取库存数据
    await Promise.all(
        productList.value.map(async (product) => {
          try {
            const stockResponse = await getStockpile(product.id);
            product.stock = stockResponse.data.result.amount;
          } catch (error) {
            console.error(`获取商品 ${product.id} 库存失败`, error);
            product.stock = 0;
          }
        })
    );
  } catch (error) {
    ElMessage.error("获取商品列表失败");
    console.error(error);
  }
};

const toggleCreateCard = () => {
  displayCreateCard.value = !displayCreateCard.value;
  if (!displayCreateCard.value) {
    resetNewProduct();
  }
};

const resetNewProduct = () => {
  newProduct.value = {
    id: "",
    title: "",
    description: "",
    price: "",
    rate: 0,
    cover: "",
    detail: "",
    specifications: [],
  };
};

const addSpec = () => {
  newProduct.value.specifications.push({
    id: "",
    item: "",
    value: "",
  });
};

const removeSpec = (index: number) => {
  newProduct.value.specifications.splice(index, 1);
};

const addEditSpec = () => {
  currentProduct.value.specifications.push({
    id: "", // 临时空值
    item: "",
    value: "",
    productId: currentProduct.value.id, // 关联当前商品ID
  });
};

const removeEditSpec = (index: number) => {
  currentProduct.value.specifications.splice(index, 1);
};

const handleCreateProduct = async () => {
  try {
    if (
        !newProduct.value.title ||
        !newProduct.value.description ||
        !newProduct.value.price ||
        !newProduct.value.cover
    ) {
      ElMessage.warning("请填写完整商品信息");
      return;
    }

    // 转换表单规格为API需要的完整格式
    const apiSpecifications: Spec[] = newProduct.value.specifications
        .filter((spec: FormSpec) => spec.item && spec.value)
        .map((spec: FormSpec) => ({
          id: spec.id, // 后端会生成
          item: spec.item,
          value: spec.value,
          productId: spec.productId ?? "", // 创建后关联
        }));

    console.log("创建商品数据:", {
      ...newProduct.value,
      specifications: apiSpecifications,
    });
    // 类型断言，因为我们知道createProduct会处理缺失的id和productId
    await createProduct(({
      ...newProduct.value,
      specifications: apiSpecifications,
    } as unknown) as Parameters<typeof createProduct>[0]);

    ElMessage({
      type: 'success',
      message: '添加商品成功',
      duration: 1000
    })

    fetchProducts();
    displayCreateCard.value = false;
    resetNewProduct();
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '添加商品失败',
      duration: 1000
    })
  }
};

const openEditDialog = (product: Product) => {
  currentProduct.value = {
    ...product,
    specifications: product.specifications ? [...product.specifications] : [],
  };
  editDialogVisible.value = true;
};

const handleUpdateProduct = async () => {
  try {
    if (
        !currentProduct.value.title ||
        !currentProduct.value.description ||
        !currentProduct.value.price ||
        !currentProduct.value.cover
    ) {
      ElMessage.warning("请填写完整商品信息");
      return;
    }

    // 确保规格参数完整
    const specsToUpdate: Spec[] = currentProduct.value.specifications
        .filter((spec: Spec) => spec.item && spec.value)
        .map((spec: Spec) => ({
          id: spec.id || "", // 保留已有ID或设为空
          item: spec.item,
          value: spec.value,
          productId: currentProduct.value.id, // 关联当前商品ID
        }));

    await updateProduct({
      ...currentProduct.value,
      specifications: specsToUpdate,
    });

    ElMessage({
      type: 'success',
      message: '更新商品成功',
      duration: 1000
    })
    editDialogVisible.value = false;
    fetchProducts();
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '更新商品失败',
      duration: 1000
    })
  }
};

const handleDeleteProduct = async (productId: string) => {
  try {
    await ElMessageBox.confirm("确定要删除这个商品吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await deleteProduct(productId);
    ElMessage({
      type: 'success',
      message: '删除商品成功',
      duration: 1000
    })
    fetchProducts();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage({
        type: 'error',
        message: '删除商品失败',
        duration: 1000
      })
    }
  }
};

const openStockDialog = (product: Product) => {
  stockForm.value.productId = product.id;
  stockForm.value.currentStock = product.stock || 0;
  stockForm.value.amount = 0;
  stockForm.value.operation = "add";
  stockDialogVisible.value = true;
};

const handleUpdateStock = async () => {
  try {
    let amount = stockForm.value.amount;
    await updateStockpile(stockForm.value.productId, amount);
    ElMessage({
      type: 'success',
      message: '库存更新成功',
      duration: 1000
    })
    stockDialogVisible.value = false;
    fetchProducts();
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '库存更新失败',
      duration: 1000
    })
  }
};
</script>

<template>
  <Header/>

  <el-main class="main-container">
    <el-card class="aside-card">
      <el-button type="primary" @click="toggleCreateCard">
        <span>添加商品</span>
      </el-button>

      <el-table :data="productList" style="width: 100%" border>
        <el-table-column prop="id" label="商品ID" width="100"/>
        <el-table-column prop="title" label="商品名称" width="180"/>
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <img :src="row.cover" style="width: 100px; height: auto"/>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100"/>
        <el-table-column prop="rate" label="评分" width="80"/>
        <el-table-column label="规格" width="150">
          <template #default="{ row }">
            <el-tag v-for="spec in row.specifications" :key="spec.id" style="margin: 2px">
              {{ spec.item }}: {{ spec.value }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80">
          <template #default="{ row }">
            <span>{{ row.stock || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteProduct(row.id)">删除</el-button>
            <el-button size="small" type="warning" @click="openStockDialog(row)">库存</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="displayCreateCard" title="添加商品" width="60%">
      <el-form :model="newProduct" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="newProduct.title"/>
        </el-form-item>
        <el-form-item label="描述" required>
          <el-input type="textarea" v-model="newProduct.description"/>
        </el-form-item>
        <el-form-item label="价格" required>
          <el-input v-model="newProduct.price" type="number" min="0" step="0.01"/>
        </el-form-item>
        <el-form-item label="评分">
          <el-input v-model="newProduct.rate" type="number" min="0" max="5" step="0.1"/>
        </el-form-item>
        <el-form-item label="封面 URL" required>
          <el-input v-model="newProduct.cover"/>
        </el-form-item>
        <el-form-item label="详情">
          <el-input type="textarea" v-model="newProduct.detail"/>
        </el-form-item>
        <el-form-item label="规格参数">
          <div v-for="(spec, index) in newProduct.specifications" :key="index" class="spec-item">
            <el-input v-model="spec.id" placeholder="id" style="width: 150px; margin-right: 10px"/>
            <el-input v-model="spec.item" placeholder="参数名" style="width: 150px; margin-right: 10px"/>
            <el-input v-model="spec.value" placeholder="参数值" style="width: 150px; margin-right: 10px"/>
            <el-input v-model="spec.productId" placeholder="商品ID" style="width: 150px; margin-right: 10px"/>
            <el-button type="danger" size="small" @click="removeSpec(index)" circle>
              <el-icon>
                <Delete/>
              </el-icon>
            </el-button>
          </div>
          <el-button type="primary" size="small" @click="addSpec">添加规格</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="displayCreateCard = false">取消</el-button>
        <el-button type="primary" @click="handleCreateProduct">添加</el-button>
      </template>
    </el-dialog>

    <!-- 编辑商品对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑商品信息" width="60%">
      <el-form :model="currentProduct" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="currentProduct.title"/>
        </el-form-item>
        <el-form-item label="描述" required>
          <el-input type="textarea" v-model="currentProduct.description"/>
        </el-form-item>
        <el-form-item label="价格" required>
          <el-input v-model="currentProduct.price" type="number" min="0" step="0.01"/>
        </el-form-item>
        <el-form-item label="评分">
          <el-input v-model="currentProduct.rate" type="number" min="0" max="5" step="0.1"/>
        </el-form-item>
        <el-form-item label="封面URL" required>
          <el-input v-model="currentProduct.cover"/>
        </el-form-item>
        <el-form-item label="详情">
          <el-input type="textarea" v-model="currentProduct.detail"/>
        </el-form-item>

        <el-form-item label="规格参数">
          <div v-for="(spec, index) in currentProduct.specifications" :key="spec.id || index" class="spec-item">
            <el-input v-model="spec.item" placeholder="参数名" style="width: 150px; margin-right: 10px"/>
            <el-input v-model="spec.value" placeholder="参数值" style="width: 150px; margin-right: 10px"/>
            <el-button type="danger" size="small" @click="removeEditSpec(index)" circle>
              <el-icon>
                <Delete/>
              </el-icon>
            </el-button>
          </div>
          <el-button type="primary" size="small" @click="addEditSpec">添加规格</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateProduct">保存</el-button>
      </template>
    </el-dialog>

    <!-- 库存管理对话框 -->
    <el-dialog v-model="stockDialogVisible" title="库存管理" width="30%">
      <el-form :model="stockForm" label-width="80px">
        <el-form-item label="当前库存">
          <span>{{ stockForm.currentStock }}</span>
        </el-form-item>
        <el-form-item label="调整数量" required>
          <el-input-number v-model="stockForm.amount" :min="-10000" :max="10000"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateStock">确认</el-button>
      </template>
    </el-dialog>
  </el-main>
</template>

<style scoped>
/* 全局背景与布局 */
.main-container {
  font-family: "Segoe UI", "Helvetica Neue", "PingFang SC", sans-serif;
  padding: 100px 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 商品列表卡片 */
.aside-card {
  width: 100%;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 40px;
  margin-bottom: 40px;
}

/* 页面标题 */
h2 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

/* 按钮样式 */
.el-button {
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: background-color 0.3s ease;
}

.el-button[type="primary"] {
  background-color: #0071e3;
  border-color: #0071e3;
  color: #fff;
}

.el-button:hover {
  filter: brightness(0.95);
}

/* 表格样式 */
.el-table {
  font-size: 16px;
}

.el-table th,
.el-table td {
  text-align: center;
  padding: 16px 12px;
  border-bottom: none;
}

.el-table th {
  background-color: #f9f9f9;
  font-weight: 600;
}

/* 图片与标签 */
.el-table img {
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.el-tag {
  background-color: #f0f0f5;
  color: #555;
  border-radius: 8px;
  font-size: 14px;
  padding: 4px 8px;
}

/* 添加/编辑弹出卡片 */
.change-card,
.el-dialog {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 表单样式 */
.el-form {
  font-size: 16px;
}

.el-form-item {
  margin-bottom: 24px;
}
</style>
