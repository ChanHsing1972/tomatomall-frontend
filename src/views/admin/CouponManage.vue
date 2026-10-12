<script lang="ts" setup>
import {onMounted, reactive, ref} from 'vue';
import {ElMessage, FormInstance} from 'element-plus';
import {type CouponVO, createCoupon, getAllCoupons, updateCoupon} from '../../api/coupon';
import {Edit, Plus} from '@element-plus/icons-vue';

// 优惠券列表
const coupons = ref<CouponVO[]>([]);
// 加载状态
const loading = ref(false);
// 对话框可见性状态
const dialogVisible = ref(false);
// 表单对象引用
const formRef = ref<FormInstance>();
// 当前编辑的优惠券
const currentCoupon = ref<CouponVO>({
  name: '',
  type: 'FIXED', // 默认是满减类型
  value: 0,
  minimumSpend: 0,
  startDate: '',
  endDate: '',
  isActive: true,
  description: ''
});
// 是否是编辑模式
const isEdit = ref(false);

// 表单规则
const rules = reactive({
  name: [
    {required: true, message: '请输入优惠券名称', trigger: 'blur'},
    {min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur'}
  ],
  type: [
    {required: true, message: '请选择优惠券类型', trigger: 'change'}
  ],
  amount: [
    {required: true, message: '请输入金额', trigger: 'blur'}
  ],
  threshold: [
    {required: true, message: '请输入使用门槛', trigger: 'blur'}
  ],
  count: [
    {required: true, message: '请输入发行数量', trigger: 'blur'}
  ],
  description: [
    {required: false, message: '请输入描述信息', trigger: 'blur'}
  ]
});

// 优惠券类型选项
const couponTypeOptions = [
  {value: 'FIXED', label: '满减优惠券'},
  {value: 'DISCOUNT', label: '折扣优惠券'},
  {value: 'DIRECT', label: '直减优惠券'}
];

// 获取所有优惠券
const fetchCoupons = async () => {
  loading.value = true;
  try {
    const response = await getAllCoupons();
    if (response && response.code === '200') {
      coupons.value = response.data || [];
    } else {
      ElMessage.error(response?.message || '获取优惠券列表失败');
    }
  } catch (error) {
    console.error('获取优惠券列表失败:', error);
    ElMessage.error('获取优惠券列表失败');
  } finally {
    loading.value = false;
  }
};

// 打开创建优惠券对话框
const openCreateDialog = () => {
  isEdit.value = false;
  currentCoupon.value = {
    name: '',
    type: 'FIXED',
    value: 0,
    minimumSpend: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    description: ''
  };
  dialogVisible.value = true;
};

// 打开编辑优惠券对话框
const openEditDialog = (coupon: CouponVO) => {
  isEdit.value = true;
  currentCoupon.value = {...coupon};
  dialogVisible.value = true;
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value && currentCoupon.value.id) {
          // 更新优惠券
          const response = await updateCoupon(currentCoupon.value.id, currentCoupon.value);
          if (response && response.code === '200') {
            ElMessage.success('优惠券更新成功');
            dialogVisible.value = false;
            await fetchCoupons(); // 刷新列表
          } else {
            ElMessage.error(response?.message || '更新优惠券失败');
          }
        } else {
          // 创建优惠券
          const response = await createCoupon(currentCoupon.value);
          if (response && response.code === '200') {
            ElMessage.success('优惠券创建成功');
            dialogVisible.value = false;
            await fetchCoupons(); // 刷新列表
          } else {
            ElMessage.error(response?.message || '创建优惠券失败');
          }
        }
      } catch (error) {
        console.error('提交表单失败:', error);
        ElMessage.error('操作失败，请重试');
      }
    } else {
      return;
    }
  });
};

// 格式化优惠券类型
const formatCouponType = (type: string) => {
  const typeMap: Record<string, string> = {
    'FIXED': '满减优惠券',
    'DISCOUNT': '折扣优惠券',
    'DIRECT': '直减优惠券'
  };
  return typeMap[type] || type;
};

// 格式化优惠券值
const formatCouponValue = (value: number, type: string) => {
  if (type === 'DISCOUNT') {
    return `${value}%`;
  } else {
    return `RMB ${value.toFixed(2)}`;
  }
};

// 组件挂载时获取优惠券列表
onMounted(() => {
  fetchCoupons();
});
</script>

<template>
  <div class="coupon-management-container">
    <div class="management-header">
      <h1>优惠券管理</h1>
      <el-button :icon="Plus" type="primary" @click="openCreateDialog">创建优惠券</el-button>
    </div>

    <el-table v-loading="loading" :data="coupons" border style="width: 100%; margin-top: 20px">
      <el-table-column label="ID" prop="id" width="60"/>
      <el-table-column label="名称" min-width="150" prop="name"/>
      <el-table-column label="类型" width="120">
        <template #default="scope">
          {{ formatCouponType(scope.row.type) }}
        </template>
      </el-table-column>
      <el-table-column label="值" width="100">
        <template #default="scope">
          {{ formatCouponValue(scope.row.value, scope.row.type) }}
        </template>
      </el-table-column>
      <el-table-column label="最低消费" prop="minimumSpend" width="100">
        <template #default="scope">
          RMB {{ scope.row.minimumSpend.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="描述" min-width="180" prop="description"/>
      <el-table-column label="有效期" width="240">
        <template #default="scope">
          {{ scope.row.startDate }} 至 {{ scope.row.endDate }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.isActive ? 'success' : 'info'">
            {{ scope.row.isActive ? '生效中' : '已停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="120">
        <template #default="scope">
          <el-button :icon="Edit" circle type="primary" @click="openEditDialog(scope.row as CouponVO)"/>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑优惠券对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑优惠券' : '创建优惠券'" append-to-body width="680px">
      <el-form ref="formRef" :model="currentCoupon" :rules="rules" label-position="top" label-width="120px">
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="currentCoupon.name" placeholder="请输入优惠券名称"/>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优惠券类型" prop="type">
              <el-select v-model="currentCoupon.type" style="width: 100%">
                <el-option v-for="option in couponTypeOptions" :key="option.value" :label="option.label"
                           :value="option.value"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优惠券值" prop="value">
              <el-input-number v-model="currentCoupon.value" :min="0"
                               :precision="currentCoupon.type === 'DISCOUNT' ? 0 : 2" style="width: 100%">
                <template #suffix>
                  {{ currentCoupon.type === 'DISCOUNT' ? '%' : '元' }}
                </template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="最低消费金额" prop="minimumSpend">
          <el-input-number v-model="currentCoupon.minimumSpend" :min="0" :precision="2" style="width: 100%">
            <template #suffix>元</template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="有效期" required>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item prop="startDate">
                <el-date-picker v-model="currentCoupon.startDate" placeholder="开始日期" style="width: 100%"
                                type="datetime"
                                value-format="YYYY-MM-DDTHH:mm:ss"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="endDate">
                <el-date-picker v-model="currentCoupon.endDate" placeholder="结束日期" style="width: 100%"
                                type="datetime"
                                value-format="YYYY-MM-DDTHH:mm:ss"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="currentCoupon.isActive" active-text="生效" inactive-text="停用"/>
        </el-form-item>

        <el-form-item label="最大数量">
          <el-input-number v-model="currentCoupon.maxQuantity" :min="0" :precision="0" placeholder="不填则不限制数量"
                           style="width: 100%"/>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="currentCoupon.description" :rows="3" placeholder="请输入优惠券描述" type="textarea"/>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.coupon-management-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.management-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}
</style>
