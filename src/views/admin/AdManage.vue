<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import AdminLayout from '../../components/AdminLayout.vue';
import { getAllAds, addAd, updateAd, deleteAd } from '../../api/ad';
import { getProductList } from '../../api/product';
type Ad = { id: string; title: string; content: string; imgUrl: string; productId: string };
const ads = ref<Ad[]>([]),
  books = ref<{ id: string; title: string }[]>([]),
  loading = ref(false),
  saving = ref(false),
  error = ref(''),
  query = ref(''),
  page = ref(1),
  size = ref(20),
  dialog = ref(false),
  editing = ref(false),
  formRef = ref<FormInstance>();
const blank = (): Ad => ({ id: '', title: '', content: '', imgUrl: '', productId: '' });
const form = ref<Ad>(blank());
const filtered = computed(() =>
  ads.value.filter((ad) =>
    [ad.id, ad.title, ad.content].join(' ').toLowerCase().includes(query.value.trim().toLowerCase())
  )
);
const visible = computed(() =>
  filtered.value.slice((page.value - 1) * size.value, page.value * size.value)
);
watch([query, size], () => (page.value = 1));
const titleFor = (id: string) =>
  books.value.find((b) => b.id === String(id))?.title || `商品 ${id}`;
const rules = {
  title: [{ required: true, message: '请输入广告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入广告内容', trigger: 'blur' }],
  imgUrl: [{ required: true, message: '请输入图片地址', trigger: 'blur' }],
  productId: [{ required: true, message: '请选择关联商品', trigger: 'change' }],
};
async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [a, b] = await Promise.all([getAllAds(), getProductList()]);
    ads.value = a.data.data || [];
    books.value = b.data.data || [];
    if ((page.value - 1) * size.value >= filtered.value.length) page.value = 1;
  } catch (e) {
    error.value = e instanceof Error ? e.message : '广告无法加载';
  } finally {
    loading.value = false;
  }
}
function open(ad?: Ad) {
  editing.value = !!ad;
  form.value = ad ? { ...ad, productId: String(ad.productId) } : blank();
  dialog.value = true;
  formRef.value?.clearValidate();
}
async function save() {
  if (saving.value || !(await formRef.value?.validate().catch(() => false))) return;
  saving.value = true;
  try {
    if (editing.value) await updateAd(form.value);
    else await addAd(form.value);
    dialog.value = false;
    ElMessage.success('广告已保存');
    await load();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '保存失败');
  } finally {
    saving.value = false;
  }
}
async function remove(ad: Ad) {
  try {
    await ElMessageBox.confirm(`确定删除广告“${ad.title}”？`, '删除广告', { type: 'warning' });
    await deleteAd(ad.id);
    await load();
    ElMessage.success('广告已删除');
  } catch (e) {
    if (e !== 'cancel' && e !== 'close')
      ElMessage.error(e instanceof Error ? e.message : '删除失败');
  }
}
onMounted(load);
</script>
<template>
  <AdminLayout title="广告管理"
    ><template #actions
      ><el-button @click="load" :disabled="loading">刷新</el-button
      ><el-button type="primary" @click="open()">添加广告</el-button></template
    >
    <section class="admin-panel">
      <div class="admin-toolbar">
        <el-input v-model="query" clearable placeholder="搜索广告标题、内容或 ID" /><span
          class="count"
          >共 {{ filtered.length }} 条广告</span
        >
      </div>
      <div v-if="error" role="alert" class="admin-error">
        {{ error }} <el-button text @click="load">重试</el-button>
      </div>
      <el-table
        v-else
        :data="visible"
        v-loading="loading"
        stripe
        border
        row-key="id"
        height="calc(100dvh - 330px)"
        empty-text="没有匹配的广告"
        ><el-table-column prop="id" label="ID" width="64" /><el-table-column label="图片" width="92"
          ><template #default="{ row }"
            ><el-image :src="row.imgUrl" fit="contain" style="width: 60px; height: 45px"
              ><template #error><span>无图片</span></template></el-image
            ></template
          ></el-table-column
        ><el-table-column
          prop="title"
          label="标题"
          min-width="180"
          show-overflow-tooltip
        /><el-table-column
          prop="content"
          label="内容"
          min-width="260"
          show-overflow-tooltip
        /><el-table-column label="关联商品" min-width="160"
          ><template #default="{ row }">{{ titleFor(row.productId) }}</template></el-table-column
        ><el-table-column label="操作" fixed="right" width="124"
          ><template #default="{ row }"
            ><el-button link type="primary" @click="open(row as Ad)">编辑</el-button
            ><el-button link type="danger" @click="remove(row as Ad)">删除</el-button></template
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
      </div></section></AdminLayout
  ><el-dialog
    v-model="dialog"
    :title="editing ? '编辑广告' : '添加广告'"
    width="640px"
    class="admin-dialog"
    :close-on-click-modal="false"
    :show-close="!saving"
    ><el-form ref="formRef" :model="form" :rules="rules" label-position="top"
      ><el-form-item label="广告标题" prop="title"
        ><el-input v-model="form.title" maxlength="100" /></el-form-item
      ><el-form-item label="关联商品" prop="productId"
        ><el-select v-model="form.productId" filterable placeholder="搜索并选择商品"
          ><el-option
            v-for="b in books"
            :key="b.id"
            :value="String(b.id)"
            :label="`${b.title}（${b.id}）`" /></el-select></el-form-item
      ><el-form-item label="图片地址" prop="imgUrl"><el-input v-model="form.imgUrl" /></el-form-item
      ><el-form-item label="广告内容" prop="content"
        ><el-input v-model="form.content" type="textarea" :rows="4" /></el-form-item></el-form
    ><template #footer
      ><el-button :disabled="saving" @click="dialog = false">取消</el-button
      ><el-button type="primary" :loading="saving" @click="save">保存</el-button></template
    ></el-dialog
  >
</template>
