<script setup lang="ts">
import {onMounted, ref} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {Delete} from "@element-plus/icons-vue";
import {
  createProduct,
  deleteProduct,
  getProductList,
  getStockpile,
  updateProduct,
  updateStockpile,
} from "../../api/product.ts";
import Header from "../../components/Header.vue";

interface Spec {
  id: string;
  item: string;
  value: string;
  productId: string;
}

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

const fetchProducts = async () => {
  try {
    const response = await getProductList();
    productList.value = response.data.data;

    // 遍历每个商品，获取库存数据
    await Promise.all(
        productList.value.map(async (product) => {
          try {
            const stockResponse = await getStockpile(product.id);
            product.stock = stockResponse.data.data.amount;
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
    if (Number(newProduct.value.price) <= 0) {
      ElMessage.warning("商品价格必须大于 0");
      return;
    }
    if (newProduct.value.rate < 0 || newProduct.value.rate > 5) {
      ElMessage.warning("评分必须在 0 到 5 之间");
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

    await fetchProducts();
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
    if (Number(currentProduct.value.price) <= 0) {
      ElMessage.warning("商品价格必须大于 0");
      return;
    }
    if (currentProduct.value.rate < 0 || currentProduct.value.rate > 5) {
      ElMessage.warning("评分必须在 0 到 5 之间");
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

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <Header/>

  <el-main class="main-container">
    <div class="management-header">
      <h1>商品管理</h1>
      <el-button type="primary" @click="toggleCreateCard">
        <span>添加商品</span>
      </el-button>
    </div>

    <el-card class="data-card">
      <el-table :data="productList" style="width: 100%" border>
        <el-table-column label="商品ID" prop="id" width="80"/>
        <el-table-column label="商品名称" min-width="150" prop="title" show-overflow-tooltip/>
        <el-table-column label="封面" width="100">
          <template #default="{ row }">
            <img :src="row.cover" class="product-image"/>
          </template>
        </el-table-column>
        <el-table-column label="价格" prop="price" width="80"/>
        <el-table-column label="评分" prop="rate" width="60"/>
        <el-table-column label="规格" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="spec-container">
              <el-tag v-for="spec in row.specifications" :key="spec.id" class="spec-tag" effect="light">
                {{ spec.item }}: {{ spec.value }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="库存" prop="stock" width="60">
          <template #default="{ row }">
            <span>{{ row.stock || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="180">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button plain size="small" type="primary" @click="openEditDialog(row)">编辑</el-button>
              <el-button plain size="small" type="danger" @click="handleDeleteProduct(row.id)">删除</el-button>
              <el-button plain size="small" type="warning" @click="openStockDialog(row)">库存</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="displayCreateCard" class="custom-dialog" title="添加商品" width="60%">
      <el-form :model="newProduct" class="form-with-shadow" label-width="100px">
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
        <div class="dialog-footer">
          <el-button @click="displayCreateCard = false">取消</el-button>
          <el-button type="primary" @click="handleCreateProduct">添加</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑商品对话框 -->
    <el-dialog v-model="editDialogVisible" class="custom-dialog" title="编辑商品信息" width="60%">
      <el-form :model="currentProduct" class="form-with-shadow" label-width="100px">
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
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateProduct">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 库存管理对话框 -->
    <el-dialog v-model="stockDialogVisible" class="custom-dialog" title="库存管理" width="30%">
      <el-form :model="stockForm" class="form-with-shadow" label-width="100px">
        <el-form-item label="当前库存">
          <span>{{ stockForm.currentStock }}</span>
        </el-form-item>
        <el-form-item label="调整数量" required>
          <el-input-number v-model="stockForm.amount" :min="0" :max="1000000"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="stockDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateStock">确认</el-button>
        </div>
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

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 24px;
}

.management-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 数据卡片 */
.data-card {
  width: 100%;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 30px;
}

/* 表格样式 */
.el-table {
  font-size: 14px;
  border-radius: 8px;
  overflow: hidden;
}

.el-table th {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #333;
}

.el-table th,
.el-table td {
  text-align: center;
  padding: 12px;
}

/* 商品图片 */
.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 规格容器 */
.spec-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  max-width: 120px;
}

/* 规格标签 */
.spec-tag {
  margin: 1px;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 8px;
  background-color: #f2f6fc;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 按钮组优化 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

/* 按钮组 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* 按钮样式 */
.el-button {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;
}

/* 对话框样式 */
.custom-dialog :deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.custom-dialog :deep(.el-dialog__body) {
  padding: 30px 20px;
}

.custom-dialog :deep(.el-dialog__footer) {
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;
}

.form-with-shadow {
  padding: 15px;
  border-radius: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
