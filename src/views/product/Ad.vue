<script setup lang="ts">
import {onMounted, ref} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {addAd, deleteAd, getAllAds, updateAd} from "../../api/ad.ts";

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

const displayCreateCard = ref(false);
const editDialogVisible = ref(false);

onMounted(() => {
  fetchAds();
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
</script>

<template>
  <el-main class="main-container">
    <el-card class="aside-card">
      <el-button type="primary" @click="toggleCreateCard">
        <span>添加广告</span>
      </el-button>

      <el-table :data="adList" style="width: 100%" border>
        <el-table-column prop="id" label="广告ID" width="100"/>
        <el-table-column prop="title" label="标题" width="180"/>
        <el-table-column label="图片" width="120">
          <template #default="{ row }">
            <img :src="row.imgUrl" alt="ad picture" style="width: 100px; height: auto"/>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" width="200"/>
        <el-table-column prop="productId" label="关联商品ID" width="120"/>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteAd(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="displayCreateCard" title="添加广告" width="60%">
      <el-form :model="newAd" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="newAd.title"/>
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input type="textarea" v-model="newAd.content"/>
        </el-form-item>
        <el-form-item label="图片URL" required>
          <el-input v-model="newAd.imgUrl"/>
        </el-form-item>
        <el-form-item label="商品ID">
          <el-input v-model="newAd.productId"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="displayCreateCard = false">取消</el-button>
        <el-button type="primary" @click="handleCreateAd">添加</el-button>
      </template>
    </el-dialog>

    <!-- 编辑广告对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑广告信息" width="60%">
      <el-form :model="currentAd" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="currentAd.title"/>
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input type="textarea" v-model="currentAd.content"/>
        </el-form-item>
        <el-form-item label="图片URL" required>
          <el-input v-model="currentAd.imgUrl"/>
        </el-form-item>
        <el-form-item label="商品ID">
          <el-input v-model="currentAd.productId"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateAd">保存</el-button>
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
</style>