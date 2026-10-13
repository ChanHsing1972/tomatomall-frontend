<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ElMessage, type FormInstance } from 'element-plus';
import AdminLayout from '../../components/AdminLayout.vue';
import { type CouponVO, createCoupon, getAllCoupons, updateCoupon } from '../../api/coupon';
const coupons = ref<CouponVO[]>([]),
  loading = ref(false),
  saving = ref(false),
  error = ref(''),
  query = ref(''),
  state = ref(''),
  page = ref(1),
  size = ref(20),
  dialog = ref(false),
  editing = ref(false),
  formRef = ref<FormInstance>();
const blank = (): CouponVO => ({
  name: '',
  type: 'FIXED',
  value: 0,
  minimumSpend: 0,
  startDate: '',
  endDate: '',
  isActive: true,
  description: '',
  maxQuantity: undefined,
});
const form = ref<CouponVO>(blank());
const typeLabels: Record<string, string> = { FIXED: '满减', DISCOUNT: '折扣', DIRECT: '直减' };
function status(c: CouponVO) {
  if (!c.isActive) return '停用';
  const now = Date.now();
  if (new Date(c.endDate).getTime() < now) return '已过期';
  if (new Date(c.startDate).getTime() > now) return '未开始';
  return '生效中';
}
const filtered = computed(() =>
  coupons.value.filter(
    (c) =>
      (!state.value || status(c) === state.value) &&
      [c.name, c.description, c.id]
        .join(' ')
        .toLowerCase()
        .includes(query.value.trim().toLowerCase())
  )
);
const visible = computed(() =>
  filtered.value.slice((page.value - 1) * size.value, page.value * size.value)
);
watch([query, state, size], () => (page.value = 1));
const money = (n: number) => `RMB ${Number(n).toFixed(2)}`;
const benefit = (c: CouponVO) =>
  c.type === 'DISCOUNT' ? `${c.value / 10} 折（支付 ${c.value}%）` : money(c.value);
const date = (value: string) => value.replace('T', ' ').slice(0, 16);
const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
};
async function load() {
  loading.value = true;
  error.value = '';
  try {
    coupons.value = (await getAllCoupons()).data || [];
    if ((page.value - 1) * size.value >= filtered.value.length) page.value = 1;
  } catch (e) {
    error.value = e instanceof Error ? e.message : '优惠券无法加载';
  } finally {
    loading.value = false;
  }
}
function open(c?: CouponVO) {
  editing.value = !!c;
  form.value = c ? { ...c } : blank();
  dialog.value = true;
  formRef.value?.clearValidate();
}
async function save() {
  if (saving.value || !(await formRef.value?.validate().catch(() => false))) return;
  if (
    !Number.isFinite(form.value.value) ||
    form.value.value <= 0 ||
    (form.value.type === 'DISCOUNT' && form.value.value >= 100)
  )
    return void ElMessage.warning('优惠金额须大于 0；折扣支付比例须介于 0 与 100%。');
  if (!Number.isFinite(form.value.minimumSpend) || form.value.minimumSpend < 0)
    return void ElMessage.warning('使用门槛不能为负数。');
  if (
    !Number.isFinite(new Date(form.value.startDate).getTime()) ||
    !Number.isFinite(new Date(form.value.endDate).getTime()) ||
    new Date(form.value.endDate) <= new Date(form.value.startDate)
  )
    return void ElMessage.warning('结束时间须晚于开始时间。');
  if (
    form.value.maxQuantity != null &&
    (!Number.isSafeInteger(form.value.maxQuantity) || form.value.maxQuantity < 1)
  )
    return void ElMessage.warning('限量数量须为正整数；不限制时请清空。');
  saving.value = true;
  try {
    if (editing.value && form.value.id) await updateCoupon(form.value.id, form.value);
    else await createCoupon(form.value);
    dialog.value = false;
    ElMessage.success('优惠券已保存');
    await load();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '保存失败');
  } finally {
    saving.value = false;
  }
}
async function toggle(c: CouponVO) {
  if (saving.value) return;
  saving.value = true;
  try {
    await updateCoupon(c.id!, { ...c, isActive: !c.isActive });
    await load();
    ElMessage.success(c.isActive ? '优惠券已停用' : '优惠券已启用');
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '状态更新失败');
  } finally {
    saving.value = false;
  }
}
onMounted(load);
</script>
<template>
  <AdminLayout title="优惠券管理"
    ><template #actions
      ><el-button @click="load" :disabled="loading">刷新</el-button
      ><el-button type="primary" @click="open()">创建优惠券</el-button></template
    >
    <section class="admin-panel">
      <div class="admin-toolbar">
        <el-input v-model="query" clearable placeholder="搜索优惠券名称或 ID" /><el-select
          v-model="state"
          clearable
          placeholder="全部状态"
          ><el-option
            v-for="s in ['生效中', '未开始', '已过期', '停用']"
            :key="s"
            :value="s"
            :label="s" /></el-select
        ><span class="count">共 {{ filtered.length }} 张优惠券</span>
      </div>
      <div v-if="error" role="alert" class="admin-error">
        {{ error }} <el-button text @click="load">重试</el-button>
      </div>
      <el-table
        v-else
        :data="visible"
        v-loading="loading"
        border
        stripe
        row-key="id"
        height="calc(100dvh - 330px)"
        empty-text="没有匹配的优惠券"
        ><el-table-column prop="id" label="ID" width="64" /><el-table-column
          label="名称"
          min-width="180"
          ><template #default="{ row }"
            ><div class="admin-title">{{ row.name }}</div>
            <div class="admin-subtitle">{{ row.description }}</div></template
          ></el-table-column
        ><el-table-column label="优惠" width="158"
          ><template #default="{ row }"
            >{{ typeLabels[row.type] }} · {{ benefit(row as CouponVO) }}</template
          ></el-table-column
        ><el-table-column label="门槛" width="112"
          ><template #default="{ row }">{{ money(row.minimumSpend) }}</template></el-table-column
        ><el-table-column label="有效期" width="180"
          ><template #default="{ row }"
            ><div>{{ date(row.startDate) }}</div>
            <div>{{ date(row.endDate) }}</div></template
          ></el-table-column
        ><el-table-column label="发行数量" width="100"
          ><template #default="{ row }">{{ row.maxQuantity ?? '不限' }}</template></el-table-column
        ><el-table-column label="状态" width="90"
          ><template #default="{ row }"
            ><el-tag :type="status(row as CouponVO) === '生效中' ? 'success' : 'info'">{{
              status(row as CouponVO)
            }}</el-tag></template
          ></el-table-column
        ><el-table-column label="操作" fixed="right" width="140"
          ><template #default="{ row }"
            ><el-button link type="primary" @click="open(row as CouponVO)">编辑</el-button
            ><el-button link :disabled="saving" @click="toggle(row as CouponVO)">{{
              row.isActive ? '停用' : '启用'
            }}</el-button></template
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
    :title="editing ? '编辑优惠券' : '创建优惠券'"
    width="680px"
    class="admin-dialog"
    :close-on-click-modal="false"
    :show-close="!saving"
    ><el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="admin-form-grid"
      ><el-form-item label="名称" prop="name" class="wide"
        ><el-input v-model="form.name" maxlength="100" /></el-form-item
      ><el-form-item label="类型"
        ><el-select v-model="form.type" @change="form.value = 0"
          ><el-option
            v-for="(label, key) in typeLabels"
            :key="key"
            :label="label"
            :value="key" /></el-select></el-form-item
      ><el-form-item
        :label="form.type === 'DISCOUNT' ? '支付比例（%，85 表示 8.5 折）' : '优惠金额（RMB）'"
        ><el-input-number
          v-model="form.value"
          :min="0"
          :max="form.type === 'DISCOUNT' ? 99.99 : 999999"
          :precision="2" /></el-form-item
      ><el-form-item label="最低消费（RMB）"
        ><el-input-number v-model="form.minimumSpend" :min="0" :precision="2" /></el-form-item
      ><el-form-item label="最大发行数量（留空不限）"
        ><el-input-number
          v-model="form.maxQuantity"
          :min="1"
          :precision="0"
          :value-on-clear="undefined" /></el-form-item
      ><el-form-item label="开始时间" prop="startDate"
        ><el-date-picker
          v-model="form.startDate"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss" /></el-form-item
      ><el-form-item label="结束时间" prop="endDate"
        ><el-date-picker
          v-model="form.endDate"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss" /></el-form-item
      ><el-form-item label="状态"
        ><el-switch v-model="form.isActive" active-text="启用" inactive-text="停用" /></el-form-item
      ><el-form-item label="描述" class="wide"
        ><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item></el-form
    ><template #footer
      ><el-button :disabled="saving" @click="dialog = false">取消</el-button
      ><el-button type="primary" :loading="saving" @click="save">保存</el-button></template
    ></el-dialog
  >
</template>
