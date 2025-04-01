<template>
  <Header />

  <el-main class="main-container">
    <el-card class="aside-card">
      <div class="avatar-area">
        <el-avatar :icon="UserFilled" :size="80"></el-avatar>
        <span class="avatar-text">欢迎您，管理员</span>
      </div>

      <el-divider></el-divider>

      <h2>商品管理</h2>

      <el-button type="primary" @click="toggleCreateCard">
        <span v-if="displayCreateCard">取消添加商品</span>
        <span v-else>添加商品</span>
      </el-button>

      <el-table :data="products" style="width: 100%" border>
        <el-table-column prop="title" label="商品名称" width="180" />
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <img :src="row.cover" style="width: 100px; height: auto;" />
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100" />
        <el-table-column prop="rate" label="评分" width="80" />
        <el-table-column label="规格" width="150">
          <template #default="{ row }">
            <el-tag v-for="spec in row.specifications" :key="spec.id" style="margin: 2px">
              {{ spec.item }}: {{ spec.value }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteProduct(row.id)">删除</el-button>
            <el-button size="small" type="warning" @click="openStockDialog(row)">库存</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加商品卡片 -->
    <el-card v-if="displayCreateCard" class="change-card">
      <template #header>
        <div class="card-header">
          <span>添加商品</span>
          <el-button type="primary" @click="handleCreateProduct">添加</el-button>
        </div>
      </template>

      <el-form :model="newProduct" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="newProduct.title" />
        </el-form-item>
        <el-form-item label="描述" required>
          <el-input type="textarea" v-model="newProduct.description" />
        </el-form-item>
        <el-form-item label="价格" required>
          <el-input v-model="newProduct.price" type="number" min="0" step="0.01" />
        </el-form-item>
        <el-form-item label="评分">
          <el-input v-model="newProduct.rate" type="number" min="0" max="5" step="0.1" />
        </el-form-item>
        <el-form-item label="封面URL" required>
          <el-input v-model="newProduct.cover" />
        </el-form-item>
        <el-form-item label="详情">
          <el-input type="textarea" v-model="newProduct.detail" />
        </el-form-item>

        <el-form-item label="规格参数">
          <div v-for="(spec, index) in newProduct.specifications" :key="index" class="spec-item">
            <el-input v-model="spec.item" placeholder="参数名" style="width: 150px; margin-right: 10px;" />
            <el-input v-model="spec.value" placeholder="参数值" style="width: 150px; margin-right: 10px;" />
            <el-button type="danger" size="small" @click="removeSpec(index)" circle>
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <el-button type="primary" size="small" @click="addSpec">添加规格</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 编辑商品对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑商品信息" width="60%">
      <el-form :model="currentProduct" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="currentProduct.title" />
        </el-form-item>
        <el-form-item label="描述" required>
          <el-input type="textarea" v-model="currentProduct.description" />
        </el-form-item>
        <el-form-item label="价格" required>
          <el-input v-model="currentProduct.price" type="number" min="0" step="0.01" />
        </el-form-item>
        <el-form-item label="评分">
          <el-input v-model="currentProduct.rate" type="number" min="0" max="5" step="0.1" />
        </el-form-item>
        <el-form-item label="封面URL" required>
          <el-input v-model="currentProduct.cover" />
        </el-form-item>
        <el-form-item label="详情">
          <el-input type="textarea" v-model="currentProduct.detail" />
        </el-form-item>

        <el-form-item label="规格参数">
          <div v-for="(spec, index) in currentProduct.specifications" :key="spec.id || index" class="spec-item">
            <el-input v-model="spec.item" placeholder="参数名" style="width: 150px; margin-right: 10px;" />
            <el-input v-model="spec.value" placeholder="参数值" style="width: 150px; margin-right: 10px;" />
            <el-button type="danger" size="small" @click="removeEditSpec(index)" circle>
              <el-icon><Delete /></el-icon>
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
          <el-input-number v-model="stockForm.amount" :min="-10000" :max="10000" />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-radio-group v-model="stockForm.operation">
            <el-radio label="add">增加</el-radio>
            <el-radio label="set">设置</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateStock">确认</el-button>
      </template>
    </el-dialog>
  </el-main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UserFilled, Delete } from "@element-plus/icons-vue";
import {
  createProduct,
  getProductList,
  updateProduct,
  deleteProduct,
  updateStockpile,
  getStockpile
} from '../../api/product.ts';

// 完整匹配API中的specification类型
interface Specification {
  id: string;
  item: string;
  value: string;
  productId: string;
}

// 用于表单输入的规格类型（创建时）
interface FormSpecification {
  item: string;
  value: string;
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
  specifications: Specification[];
}

// 用于创建商品的表单数据
interface CreateProductForm {
  title: string;
  description: string;
  price: string;
  rate: number;
  cover: string;
  detail: string;
  specifications: FormSpecification[];
}

const products = ref<Product[]>([]);
const newProduct = ref<CreateProductForm>({
  title: '',
  description: '',
  price: '',
  rate: 0,
  cover: '',
  detail: '',
  specifications: []
});
const currentProduct = ref<Product>({
  id: '',
  title: '',
  description: '',
  price: '',
  rate: 0,
  cover: '',
  detail: '',
  stock: 0,
  specifications: []
});
const stockForm = ref({
  productId: '',
  currentStock: 0,
  amount: 0,
  operation: 'add' as 'add' | 'set'
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
    // 确保specifications总是数组
    products.value = response.data.map((product: Product) => ({
      ...product,
      specifications: product.specifications || []
    }));

    // 获取每个商品的库存信息
    for (const product of products.value) {
      const stockResponse = await getStockpile(product.id);
      product.stock = stockResponse.data.amount || 0;
    }
  } catch (error) {
    ElMessage.error('获取商品列表失败');
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
    title: '',
    description: '',
    price: '',
    rate: 0,
    cover: '',
    detail: '',
    specifications: []
  };
};

const addSpec = () => {
  newProduct.value.specifications.push({
    item: '',
    value: ''
  });
};

const removeSpec = (index: number) => {
  newProduct.value.specifications.splice(index, 1);
};

const addEditSpec = () => {
  currentProduct.value.specifications.push({
    id: '', // 临时空值
    item: '',
    value: '',
    productId: currentProduct.value.id // 关联当前商品ID
  });
};

const removeEditSpec = (index: number) => {
  currentProduct.value.specifications.splice(index, 1);
};

const handleCreateProduct = async () => {
  try {
    if (!newProduct.value.title || !newProduct.value.description ||
        !newProduct.value.price || !newProduct.value.cover) {
      ElMessage.warning('请填写完整商品信息');
      return;
    }

    // 转换表单规格为API需要的完整格式
    const apiSpecifications: Specification[] = newProduct.value.specifications
        .filter((spec: FormSpecification) => spec.item && spec.value)
        .map((spec: FormSpecification) => ({
          id: '', // 后端会生成
          item: spec.item,
          value: spec.value,
          productId: '' // 创建后关联
        }));

    // 类型断言，因为我们知道createProduct会处理缺失的id和productId
    await createProduct({
      ...newProduct.value,
      specifications: apiSpecifications
    } as unknown as Parameters<typeof createProduct>[0]);

    ElMessage.success('商品添加成功');
    fetchProducts();
    displayCreateCard.value = false;
    resetNewProduct();
  } catch (error) {
    ElMessage.error('添加商品失败');
    console.error(error);
  }
};

const openEditDialog = (product: Product) => {
  currentProduct.value = {
    ...product,
    specifications: product.specifications ? [...product.specifications] : []
  };
  editDialogVisible.value = true;
};

const handleUpdateProduct = async () => {
  try {
    if (!currentProduct.value.title || !currentProduct.value.description ||
        !currentProduct.value.price || !currentProduct.value.cover) {
      ElMessage.warning('请填写完整商品信息');
      return;
    }

    // 确保规格参数完整
    const specsToUpdate: Specification[] = currentProduct.value.specifications
        .filter((spec: Specification) => spec.item && spec.value)
        .map((spec: Specification) => ({
          id: spec.id || '', // 保留已有ID或设为空
          item: spec.item,
          value: spec.value,
          productId: currentProduct.value.id // 关联当前商品ID
        }));

    await updateProduct({
      ...currentProduct.value,
      specifications: specsToUpdate
    });

    ElMessage.success('商品更新成功');
    editDialogVisible.value = false;
    fetchProducts();
  } catch (error) {
    ElMessage.error('更新商品失败');
    console.error(error);
  }
};

const handleDeleteProduct = async (productId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await deleteProduct(productId);
    ElMessage.success('商品删除成功');
    fetchProducts();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除商品失败');
      console.error(error);
    }
  }
};

const openStockDialog = (product: Product) => {
  stockForm.value.productId = product.id;
  stockForm.value.currentStock = product.stock || 0;
  stockForm.value.amount = 0;
  stockForm.value.operation = 'add';
  stockDialogVisible.value = true;
};

const handleUpdateStock = async () => {
  try {
    let amount = stockForm.value.amount;
    if (stockForm.value.operation === 'add') {
      amount = stockForm.value.currentStock + stockForm.value.amount;
    }

    await updateStockpile(stockForm.value.productId, amount);
    ElMessage.success('库存更新成功');
    stockDialogVisible.value = false;
    fetchProducts();
  } catch (error) {
    ElMessage.error('更新库存失败');
    console.error(error);
  }
};
</script>