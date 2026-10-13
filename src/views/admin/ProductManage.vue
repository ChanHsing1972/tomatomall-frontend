<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import AdminLayout from '../../components/AdminLayout.vue';
import {
  createProduct,
  deleteProduct,
  getProductList,
  getStockpile,
  updateProduct,
  updateStockpile,
} from '../../api/product';
import { coverFallback } from '../../utils';
type Book = {
  id: string;
  title: string;
  price: string;
  rate: number;
  cover: string;
  description: string;
  detail: string;
  freeReading?: boolean;
  specifications: { id: string; item: string; value: string; productId: string }[];
};
const books = ref<Book[]>([]),
  loading = ref(false),
  saving = ref(false),
  error = ref(''),
  query = ref(''),
  category = ref(''),
  page = ref(1),
  size = ref(20);
const spec = (book: Book, name: string) =>
  book.specifications?.find((s) => s.item === name)?.value || '';
const categories = computed(() => [
  ...new Set(books.value.map((b) => spec(b, '类别')).filter(Boolean)),
]);
const filtered = computed(() =>
  books.value.filter(
    (b) =>
      (!category.value || spec(b, '类别') === category.value) &&
      [b.id, b.title, spec(b, '作者'), spec(b, 'ISBN')]
        .join(' ')
        .toLowerCase()
        .includes(query.value.trim().toLowerCase())
  )
);
const visible = computed(() =>
  filtered.value.slice((page.value - 1) * size.value, page.value * size.value)
);
watch([query, category, size], () => (page.value = 1));
const stocks = reactive<Record<string, { amount: number; frozen: number }>>({});
let epoch = 0;
async function loadStocks() {
  const version = ++epoch;
  const pending = visible.value.filter((b) => !stocks[b.id]);
  for (let offset = 0; offset < pending.length; offset += 4) {
    if (version !== epoch) return;
    await Promise.all(
      pending.slice(offset, offset + 4).map(async (b) => {
        try {
          const data = (await getStockpile(b.id)).data.data;
          if (version === epoch) stocks[b.id] = data;
        } catch {
          /* Unknown remains distinct from zero. */
        }
      })
    );
  }
}
watch(visible, loadStocks);
async function load() {
  loading.value = true;
  error.value = '';
  ++epoch;
  Object.keys(stocks).forEach((key) => delete stocks[key]);
  try {
    books.value = (await getProductList()).data.data || [];
    if ((page.value - 1) * size.value >= filtered.value.length) page.value = 1;
  } catch (e) {
    error.value = e instanceof Error ? e.message : '商品无法加载';
  } finally {
    loading.value = false;
  }
}
const formRef = ref<FormInstance>(),
  dialog = ref(false),
  editId = ref('');
const empty = (): Book => ({
  id: '',
  title: '',
  price: '',
  rate: 0,
  cover: '',
  description: '',
  detail: '',
  freeReading: false,
  specifications: [],
});
const form = ref<Book>(empty());
const rules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  cover: [{ required: true, message: '请输入封面地址', trigger: 'blur' }],
  description: [{ required: true, message: '请输入简介', trigger: 'blur' }],
};
function open(book?: Book) {
  editId.value = book?.id || '';
  form.value = book ? JSON.parse(JSON.stringify(book)) : empty();
  dialog.value = true;
  formRef.value?.clearValidate();
}
async function save() {
  if (saving.value || !(await formRef.value?.validate().catch(() => false))) return;
  const price = Number(form.value.price);
  if (
    !form.value.price.trim() ||
    !Number.isFinite(price) ||
    price < 0 ||
    (!form.value.freeReading && price === 0)
  )
    return void ElMessage.warning('请输入有效价格；免费阅读图书可设为 0。');
  if (!Number.isFinite(form.value.rate) || form.value.rate < 0 || form.value.rate > 5)
    return void ElMessage.warning('评分范围为 0 至 5。');
  if (form.value.specifications.some((s) => !s.item.trim() || !s.value.trim()))
    return void ElMessage.warning('请补全规格或移除空行。');
  if (
    new Set(form.value.specifications.map((s) => s.item.trim())).size !==
    form.value.specifications.length
  )
    return void ElMessage.warning('规格名称不能重复。');
  saving.value = true;
  try {
    const payload = { ...form.value, title: form.value.title.trim(), price: price.toFixed(2) };
    if (editId.value) await updateProduct(payload);
    else await createProduct(payload);
    dialog.value = false;
    ElMessage.success('商品已保存');
    await load();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '保存失败');
  } finally {
    saving.value = false;
  }
}
async function remove(book: Book) {
  try {
    await ElMessageBox.confirm(
      `确定删除《${book.title}》？有关联订单的商品可能无法删除。`,
      '删除商品',
      { type: 'warning' }
    );
    await deleteProduct(book.id);
    ElMessage.success('商品已删除');
    await load();
  } catch (e) {
    if (e !== 'cancel' && e !== 'close')
      ElMessage.error(e instanceof Error ? e.message : '删除失败');
  }
}
const stockDialog = ref(false),
  stockBook = ref<Book | null>(null),
  stockAmount = ref(0),
  stockMode = ref('set'),
  stockSaving = ref(false),
  stockLoading = ref(false);
async function openStock(book: Book) {
  stockBook.value = book;
  stockMode.value = 'set';
  stockDialog.value = true;
  stockLoading.value = true;
  try {
    stocks[book.id] = (await getStockpile(book.id)).data.data;
    stockAmount.value = stocks[book.id]!.amount;
  } catch (e) {
    stockDialog.value = false;
    ElMessage.error(e instanceof Error ? e.message : '库存无法加载');
  } finally {
    stockLoading.value = false;
  }
}
async function saveStock() {
  if (!stockBook.value || stockSaving.value || stockLoading.value) return;
  const stock = stocks[stockBook.value.id]!;
  const amount = stockMode.value === 'add' ? stock.amount + stockAmount.value : stockAmount.value;
  if (!Number.isSafeInteger(amount) || amount < stock.frozen)
    return void ElMessage.warning(`总库存不能低于已冻结的 ${stock.frozen} 本。`);
  stockSaving.value = true;
  try {
    await updateStockpile(stockBook.value.id, stockAmount.value, stockMode.value as 'set' | 'add');
    stocks[stockBook.value.id] = (await getStockpile(stockBook.value.id)).data.data;
    stockDialog.value = false;
    ElMessage.success('库存已更新');
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '库存更新失败');
  } finally {
    stockSaving.value = false;
  }
}
onMounted(load);
</script>
<template>
  <AdminLayout title="商品管理"
    ><template #actions
      ><el-button @click="load" :disabled="loading">刷新</el-button
      ><el-button type="primary" @click="open()">添加商品</el-button></template
    >
    <section class="admin-panel">
      <div class="admin-toolbar">
        <el-input
          v-model="query"
          clearable
          placeholder="搜索书名、作者、ISBN 或 ID"
          aria-label="搜索商品"
        /><el-select v-model="category" clearable placeholder="全部分类"
          ><el-option v-for="c in categories" :key="c" :label="c" :value="c" /></el-select
        ><span class="count">共 {{ filtered.length }} 件商品</span>
      </div>
      <div v-if="error" class="admin-error" role="alert">
        {{ error }} <el-button text @click="load">重试</el-button>
      </div>
      <el-table
        v-else
        :data="visible"
        v-loading="loading"
        border
        stripe
        height="calc(100dvh - 330px)"
        row-key="id"
        empty-text="没有匹配的商品"
        ><el-table-column prop="id" label="ID" width="64" /><el-table-column
          label="图书"
          min-width="280"
          ><template #default="{ row }"
            ><div style="display: flex; gap: 12px; align-items: center">
              <img
                class="admin-thumb"
                :src="row.cover"
                :alt="row.title"
                @error="coverFallback($event, row.title)"
              />
              <div style="min-width: 0">
                <div class="admin-title">{{ row.title }}</div>
                <div class="admin-subtitle">
                  {{ spec(row as Book, '作者') }} · {{ spec(row as Book, 'ISBN') || '无 ISBN' }}
                </div>
              </div>
            </div></template
          ></el-table-column
        ><el-table-column label="分类" width="120"
          ><template #default="{ row }">{{
            spec(row as Book, '类别') || '未分类'
          }}</template></el-table-column
        ><el-table-column label="价格" width="120"
          ><template #default="{ row }"
            >RMB {{ Number(row.price).toFixed(2) }}</template
          ></el-table-column
        ><el-table-column label="评分" prop="rate" width="70" /><el-table-column
          label="总库存 / 冻结"
          width="126"
          ><template #default="{ row }">{{
            stocks[row.id] ? `${stocks[row.id]!.amount} / ${stocks[row.id]!.frozen}` : '—'
          }}</template></el-table-column
        ><el-table-column label="操作" fixed="right" width="182"
          ><template #default="{ row }"
            ><el-button link type="primary" @click="open(row as Book)">编辑</el-button
            ><el-button link type="primary" @click="openStock(row as Book)">库存</el-button
            ><el-button link type="danger" @click="remove(row as Book)">删除</el-button></template
          ></el-table-column
        ></el-table
      >
      <div class="admin-pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :total="filtered.length"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
        />
      </div></section
  ></AdminLayout>
  <el-dialog
    v-model="dialog"
    :title="editId ? '编辑商品' : '添加商品'"
    width="760px"
    class="admin-dialog"
    :close-on-click-modal="false"
    :show-close="!saving"
    ><el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="admin-form-grid"
      ><el-form-item label="书名" prop="title" class="wide"
        ><el-input v-model="form.title" maxlength="120" /></el-form-item
      ><el-form-item label="价格（RMB）"
        ><el-input v-model="form.price" inputmode="decimal" /></el-form-item
      ><el-form-item label="评分（0 至 5）"
        ><el-input-number
          v-model="form.rate"
          :min="0"
          :max="5"
          :precision="1"
          :step="0.1" /></el-form-item
      ><el-form-item label="封面地址" prop="cover" class="wide"
        ><el-input v-model="form.cover" /></el-form-item
      ><el-form-item label="简介" prop="description" class="wide"
        ><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item
      ><el-form-item label="详细介绍" class="wide"
        ><el-input v-model="form.detail" type="textarea" :rows="5" /></el-form-item
      ><el-form-item label="阅读权限" class="wide"
        ><el-switch v-model="form.freeReading" active-text="免费阅读" inactive-text="购买后阅读"
      /></el-form-item>
      <div class="wide">
        <h3>书目规格</h3>
        <div v-for="(entry, i) in form.specifications" :key="i" class="admin-spec-row">
          <el-input v-model="entry.item" placeholder="名称，如作者" /><el-input
            v-model="entry.value"
            placeholder="规格内容"
          /><el-button text type="danger" @click="form.specifications.splice(i, 1)">移除</el-button>
        </div>
        <el-button
          @click="form.specifications.push({ id: '', item: '', value: '', productId: editId })"
          >添加规格</el-button
        >
      </div></el-form
    ><template #footer
      ><el-button :disabled="saving" @click="dialog = false">取消</el-button
      ><el-button type="primary" :loading="saving" @click="save">保存</el-button></template
    ></el-dialog
  >
  <el-dialog
    v-model="stockDialog"
    title="调整库存"
    width="440px"
    class="admin-dialog"
    :close-on-click-modal="false"
    ><div v-loading="stockLoading">
      <p>{{ stockBook?.title }}</p>
      <p v-if="stockBook && stocks[stockBook.id]">
        总库存 {{ stocks[stockBook.id]!.amount }}，已冻结 {{ stocks[stockBook.id]!.frozen }}
      </p>
      <el-radio-group
        v-model="stockMode"
        @change="stockAmount = stockMode === 'add' ? 0 : stocks[stockBook!.id]!.amount"
        ><el-radio value="set">设置总库存</el-radio
        ><el-radio value="add">增加库存</el-radio></el-radio-group
      ><el-input-number v-model="stockAmount" :min="0" :precision="0" style="margin-top: 20px" />
    </div>
    <template #footer
      ><el-button :disabled="stockSaving" @click="stockDialog = false">取消</el-button
      ><el-button type="primary" :loading="stockSaving" :disabled="stockLoading" @click="saveStock"
        >保存</el-button
      ></template
    ></el-dialog
  >
</template>
