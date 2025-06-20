<script setup lang="ts">
import {onMounted, ref} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {addAd, deleteAd, getAllAds, updateAd} from "../../api/ad.ts";
import Header from "../../components/Header.vue";

// 广告信息类型
interface Advertisement {
  id: string;
  title: string;
  content: string;
  imgUrl: string;
  productId: string;
}

// 创建广告表单数据
interface CreateAdForm {
  title: string;
  content: string;
  imgUrl: string;
  productId: string;
}

const adList = ref<Advertisement[]>([]);
const displayCreateCard = ref(false);
const editDialogVisible = ref(false);
const newAd = ref<CreateAdForm>({
  title: "",
  content: "",
  imgUrl: "",
  productId: ""
});
const currentAd = ref<Advertisement>({
  id: "",
  title: "",
  content: "",
  imgUrl: "",
  productId: ""
});

const fetchAds = async () => {
  try {
    const response = await getAllAds();
    adList.value = response.data.data;
  } catch (error) {
    ElMessage.error("获取广告列表失败");
    console.error(error);
  }
};

const toggleCreateCard = () => {
  displayCreateCard.value = !displayCreateCard.value;
  if (!displayCreateCard.value) {
    resetNewAd();
  }
};

const resetNewAd = () => {
  newAd.value = {
    title: "",
    content: "",
    imgUrl: "",
    productId: ""
  };
};

const handleCreateAd = async () => {
  try {
    if (
        !newAd.value.title ||
        !newAd.value.content ||
        !newAd.value.imgUrl
    ) {
      ElMessage.warning("请填写完整广告信息");
      return;
    }

    await addAd(newAd.value);

    ElMessage({
      type: 'success',
      message: '添加广告成功',
      duration: 1000
    });

    fetchAds();
    displayCreateCard.value = false;
    resetNewAd();
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '添加广告失败',
      duration: 1000
    });
  }
};

const openEditDialog = (ad: Advertisement) => {
  currentAd.value = {...ad};
  editDialogVisible.value = true;
};

const handleUpdateAd = async () => {
  try {
    if (
        !currentAd.value.title ||
        !currentAd.value.content ||
        !currentAd.value.imgUrl
    ) {
      ElMessage.warning("请填写完整广告信息");
      return;
    }

    await updateAd(currentAd.value);

    ElMessage({
      type: 'success',
      message: '更新广告成功',
      duration: 1000
    });

    editDialogVisible.value = false;
    fetchAds();
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '更新广告失败',
      duration: 1000
    });
  }
};

const handleDeleteAd = async (adId: string) => {
  try {
    await ElMessageBox.confirm("确定要删除这个广告吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await deleteAd(adId);

    ElMessage({
      type: 'success',
      message: '删除广告成功',
      duration: 1000
    });

    fetchAds();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage({
        type: 'error',
        message: '删除广告失败',
        duration: 1000
      });
    }
  }
};

onMounted(() => {
  fetchAds();
});
</script>

<template>
  <Header/>

  <el-main class="main-container">
    <div class="management-header">
      <h1>广告管理</h1>
      <el-button type="primary" @click="toggleCreateCard">
        <span>添加广告</span>
      </el-button>
    </div>

    <el-card class="data-card">
      <el-table :data="adList" style="width: 100%" border>
        <el-table-column label="广告 ID" prop="id" width="80"/>
        <el-table-column label="标题" min-width="150" prop="title"/>
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <img :src="row.imgUrl" alt="ad picture" class="thumbnail"/>
          </template>
        </el-table-column>
        <el-table-column label="内容" min-width="200" prop="content" show-overflow-tooltip/>
        <el-table-column label="关联商品 ID" prop="productId" width="120"/>
        <el-table-column fixed="right" label="操作" width="160">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button plain size="small" type="primary" @click="openEditDialog(row)">编辑</el-button>
              <el-button plain size="small" type="danger" @click="handleDeleteAd(row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="displayCreateCard" class="custom-dialog" title="添加广告" width="60%">
      <el-form :model="newAd" class="form-with-shadow" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="newAd.title"/>
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input v-model="newAd.content" rows="4" type="textarea"/>
        </el-form-item>
        <el-form-item label="图片 URL" required>
          <el-input v-model="newAd.imgUrl"/>
        </el-form-item>
        <el-form-item label="商品 ID">
          <el-input v-model="newAd.productId"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="displayCreateCard = false">取消</el-button>
          <el-button type="primary" @click="handleCreateAd">添加</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" class="custom-dialog" title="编辑广告信息" width="60%">
      <el-form :model="currentAd" class="form-with-shadow" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="currentAd.title"/>
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input v-model="currentAd.content" rows="4" type="textarea"/>
        </el-form-item>
        <el-form-item label="图片 URL" required>
          <el-input v-model="currentAd.imgUrl"/>
        </el-form-item>
        <el-form-item label="商品 ID">
          <el-input v-model="currentAd.productId"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateAd">保存</el-button>
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
  margin-bottom: 20px;
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
  margin-bottom: 40px;
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

/* 缩略图样式 */
.thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 按钮样式 */
.el-button {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;
}

.el-button[type="primary"] {
  background-color: #409eff;
}

.el-button[type="primary"]:hover {
  background-color: #66b1ff;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
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
  padding: 20px;
  border-radius: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>