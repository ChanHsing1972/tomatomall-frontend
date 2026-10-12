<script lang="ts" setup>
import Header from "../../components/Header.vue";
import Footer from "../../components/Footer.vue";
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";

// 岗位数据
const jobPositions = ref([
  {
    id: 1,
    title: "前端开发工程师",
    department: "技术部",
    location: "上海",
    type: "全职",
    experience: "3-5年",
    description: "负责枕石书屋Web及移动端前端开发，优化用户界面和交互体验，使用Vue.js、TypeScript等技术栈。",
    requirements: [
      "计算机或相关专业本科及以上学历",
      "3年以上前端开发经验，熟练掌握HTML、CSS、JavaScript",
      "熟悉Vue.js生态系统，有TypeScript项目经验",
      "具备良好的代码风格、测试习惯和文档能力",
      "对技术有热情，有良好的团队协作和沟通能力"
    ]
  },
  {
    id: 2,
    title: "资深产品经理",
    department: "产品部",
    location: "北京",
    type: "全职",
    experience: "5-8年",
    description: "负责枕石书屋产品规划和迭代，把控产品方向，提升用户体验，推动产品商业目标达成。",
    requirements: [
      "本科及以上学历，5年以上互联网产品经理经验",
      "有图书、阅读或内容产品经验者优先",
      "优秀的产品思维和用户体验意识",
      "强大的数据分析能力和项目管理能力",
      "出色的沟通协调能力和团队合作精神"
    ]
  },
  {
    id: 3,
    title: "内容运营专员",
    department: "运营部",
    location: "广州",
    type: "全职",
    experience: "1-3年",
    description: "负责枕石书屋内容规划和运营，策划活动，进行内容推荐，提升用户参与度。",
    requirements: [
      "本科及以上学历，中文、新闻、编辑等相关专业优先",
      "热爱阅读，有良好的文字功底和审美能力",
      "了解用户心理，善于内容策划和活动设计",
      "有图书相关运营经验者优先",
      "具备团队协作精神和执行力"
    ]
  },
  {
    id: 4,
    title: "后端开发工程师",
    department: "技术部",
    location: "深圳",
    type: "全职",
    experience: "3-5年",
    description: "负责枕石书屋后端服务开发和优化，确保系统高可用性、安全性和性能。",
    requirements: [
      "计算机相关专业本科及以上学历",
      "熟练掌握Java/Go/Python等后端语言，了解分布式系统架构",
      "熟悉MySQL、Redis等数据库和缓存技术",
      "具有良好的编码风格和问题解决能力",
      "有电商或内容平台开发经验者优先"
    ]
  }
]);

// 公司福利
const benefits = ref([
  {
    icon: "📚",
    title: "阅读福利",
    description: "无限畅读全平台内容，每月实体书购书补贴"
  },
  {
    icon: "💰",
    title: "有竞争力的薪资",
    description: "行业领先的薪资水平，季度和年度绩效奖金"
  },
  {
    icon: "🏥",
    title: "完善的保险",
    description: "五险一金全覆盖，额外商业保险和体检福利"
  },
  {
    icon: "🎓",
    title: "学习成长",
    description: "导师制度，定期培训，外部课程报销"
  },
  {
    icon: "⏰",
    title: "弹性工作",
    description: "弹性工作时间，远程办公机会"
  },
  {
    icon: "🏝️",
    title: "假期福利",
    description: "带薪年假，额外休假日，生日假和团建活动"
  }
]);

// 招聘流程
const hiringSteps = ref([
  {
    step: "01",
    title: "简历筛选",
    description: "我们的招聘团队将仔细审阅您的简历和求职信，通常会在一周内给您反馈。"
  },
  {
    step: "02",
    title: "电话初筛",
    description: "通过简历筛选后，我们会安排15-30分钟的电话面试，初步了解您的背景和期望。"
  },
  {
    step: "03",
    title: "技术评估",
    description: "根据岗位需要，您可能需要完成在线测试或提交作品集，展示您的专业技能。"
  },
  {
    step: "04",
    title: "团队面试",
    description: "与您未来的团队和跨部门同事进行面对面或视频面试，深入交流。"
  },
  {
    step: "05",
    title: "终轮面试",
    description: "与部门负责人或公司高管面谈，确保您与枕石书屋的文化和价值观契合。"
  },
  {
    step: "06",
    title: "录用通知",
    description: "如果一切顺利，我们会向您发出录用通知，欢迎您加入枕石书屋大家庭！"
  }
]);

// 申请表单
const applicationForm = ref({
  name: "",
  email: "",
  phone: "",
  position: "",
  experience: "",
  message: "",
  resume: null as File | null
});

// 选择简历文件
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    applicationForm.value.resume = target.files[0];
  }
};

// 提交申请
const submitApplication = () => {
  // 在实际应用中，这里会调用API提交表单数据
  ElMessage({
    message: '这是界面演示，申请尚未提交。项目当前不提供招聘服务。',
    type: 'success'
  });

  // 清空表单
  applicationForm.value = {
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    message: "",
    resume: null
  };

  // 清空文件输入
  const fileInput = document.getElementById('resume') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

// 显示职位详情对话框
interface JobPosition {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  requirements: string[];
}

const showPositionDetails = ref(false);
const currentPosition = ref<JobPosition | null>(null);

const viewPositionDetails = (position: JobPosition) => {
  currentPosition.value = position;
  showPositionDetails.value = true;
};

// 当页面挂载时，滚动到顶部
onMounted(() => {
  window.scrollTo(0, 0);
});
</script>

<template>
  <div class="join-us-page">
    <Header />

    <!-- 英雄区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1>加入枕石书屋</h1>
        <p>成为改变阅读体验的一份子</p>
      </div>
    </section>

    <!-- 主要内容 -->
    <div class="container"><p class="demo-notice">本页为课程项目的界面演示。公司、招聘、客服和商业服务文案为设计示例。</p>
      <!-- 公司文化 -->
      <section class="culture-section">
        <div class="section-header">
          <span class="section-tag">我们的文化</span>
          <h2>以人为本，创新驱动</h2>
        </div>

        <div class="culture-content">
          <p>
            在枕石书屋，我们深信阅读能改变人生，而我们的使命就是让这种改变触手可及。我们打造的不仅是一个购书平台，更是一个知识分享的社区，一个思想碰撞的空间。</p>

          <div class="culture-pillars">
            <div class="pillar">
              <h3>热爱阅读</h3>
              <p>我们是一群爱书人，相信阅读的力量，致力于传递这种力量。</p>
            </div>
            <div class="pillar">
              <h3>追求卓越</h3>
              <p>我们不满足于现状，始终追求产品和服务的更高标准。</p>
            </div>
            <div class="pillar">
              <h3>拥抱变化</h3>
              <p>在快速变化的时代，我们保持开放心态，勇于创新。</p>
            </div>
            <div class="pillar">
              <h3>协作共赢</h3>
              <p>我们相信团队的力量，尊重每个人的贡献和才能。</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 职位列表 -->
      <section class="jobs-section">
        <div class="section-header">
          <span class="section-tag">职位空缺</span>
          <h2>当前招聘岗位</h2>
        </div>

        <div class="job-cards">
          <div v-for="job in jobPositions" :key="job.id" class="job-card" @click="viewPositionDetails(job)">
            <div class="job-header">
              <h3 class="job-title">{{ job.title }}</h3>
              <span class="job-department">{{ job.department }}</span>
            </div>
            <div class="job-details">
              <div class="job-location">
                <i class="location-icon">📍</i> {{ job.location }}
              </div>
              <div class="job-type">
                <i class="type-icon">🕒</i> {{ job.type }}
              </div>
              <div class="job-experience">
                <i class="experience-icon">📆</i> {{ job.experience }}
              </div>
            </div>
            <p class="job-description">{{ job.description }}</p>
            <div class="job-action">
              <button class="view-details-btn">查看详情</button>
            </div>
          </div>
        </div>
      </section>

      <!-- 公司福利 -->
      <section class="benefits-section">
        <div class="section-header">
          <span class="section-tag">员工福利</span>
          <h2>为什么选择枕石书屋</h2>
        </div>

        <div class="benefits-grid">
          <div v-for="(benefit, index) in benefits" :key="index" class="benefit-card">
            <div class="benefit-icon">{{ benefit.icon }}</div>
            <h3>{{ benefit.title }}</h3>
            <p>{{ benefit.description }}</p>
          </div>
        </div>
      </section>

      <!-- 招聘流程 -->
      <section class="process-section">
        <div class="section-header">
          <span class="section-tag">应聘流程</span>
          <h2>我们的招聘步骤</h2>
        </div>

        <div class="process-steps">
          <div v-for="(step, index) in hiringSteps" :key="index" class="process-step">
            <div class="step-number">{{ step.step }}</div>
            <div class="step-content">
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 工作环境展示 -->
      <section class="workplace-section">
        <div class="section-header">
          <span class="section-tag">工作环境</span>
          <h2>我们的办公空间</h2>
        </div>

        <div class="workplace-gallery">
          <div class="gallery-item">
            <img alt="办公空间"
              src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8b2ZmaWNlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60">
          </div>
          <div class="gallery-item">
            <img alt="会议室"
              src="https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fG9mZmljZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60">
          </div>
          <div class="gallery-item">
            <img alt="团队协作"
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHRlYW18ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60">
          </div>
          <div class="gallery-item">
            <img alt="休息区"
              src="https://images.unsplash.com/photo-1520881363902-a0ff4e722963?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8Y2FmZXRlcmlhfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60">
          </div>
        </div>
      </section>

      <!-- 申请表单 -->
      <section class="apply-section">
        <div class="section-header">
          <span class="section-tag">加入我们</span>
          <h2>提交您的申请</h2>
        </div>

        <div class="apply-form-container">
          <form class="apply-form" @submit.prevent="submitApplication">
            <div class="form-group">
              <label for="name">姓名 <span class="required">*</span></label>
              <input id="name" v-model="applicationForm.name" required type="text">
            </div>

            <div class="form-group">
              <label for="email">邮箱 <span class="required">*</span></label>
              <input id="email" v-model="applicationForm.email" required type="email">
            </div>

            <div class="form-group">
              <label for="phone">电话 <span class="required">*</span></label>
              <input id="phone" v-model="applicationForm.phone" required type="tel">
            </div>

            <div class="form-group">
              <label for="position">申请职位 <span class="required">*</span></label>
              <select id="position" v-model="applicationForm.position" required>
                <option value="">请选择职位</option>
                <option v-for="job in jobPositions" :key="job.id" :value="job.title">{{ job.title }}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="experience">工作经验 <span class="required">*</span></label>
              <select id="experience" v-model="applicationForm.experience" required>
                <option value="">请选择工作经验</option>
                <option value="应届毕业生">应届毕业生</option>
                <option value="1-3年">1-3年</option>
                <option value="3-5年">3-5年</option>
                <option value="5-10年">5-10年</option>
                <option value="10年以上">10年以上</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="message">自我介绍</label>
              <textarea id="message" v-model="applicationForm.message" rows="5"></textarea>
            </div>

            <div class="form-group full-width">
              <label for="resume">上传简历 <span class="required">*</span></label>
              <input id="resume" accept=".pdf,.doc,.docx" required type="file" @change="handleFileChange">
              <p class="file-hint">支持PDF、Word格式，文件大小不超过5MB</p>
            </div>

            <div class="form-submit">
              <button class="submit-btn" type="submit">提交申请</button>
            </div>
          </form>
        </div>
      </section>
    </div>

    <!-- 职位详情对话框 -->
    <el-dialog v-model="showPositionDetails" :title="currentPosition ? currentPosition.title : ''" destroy-on-close
      width="50%">
      <div v-if="currentPosition" class="position-details">
        <div class="position-header">
          <div class="position-meta">
            <span class="meta-item"><i class="meta-icon">🏢</i> {{ currentPosition.department }}</span>
            <span class="meta-item"><i class="meta-icon">📍</i> {{ currentPosition.location }}</span>
            <span class="meta-item"><i class="meta-icon">🕒</i> {{ currentPosition.type }}</span>
            <span class="meta-item"><i class="meta-icon">📆</i> {{ currentPosition.experience }}</span>
          </div>
        </div>

        <div class="position-description">
          <h3>职位描述</h3>
          <p>{{ currentPosition.description }}</p>
        </div>

        <div class="position-requirements">
          <h3>任职要求</h3>
          <ul>
            <li v-for="(req, index) in currentPosition.requirements" :key="index">
              {{ req }}
            </li>
          </ul>
        </div>

        <div class="position-apply">
          <button class="apply-btn" @click="showPositionDetails = false">申请此职位</button>
        </div>
      </div>
    </el-dialog>

    <Footer />
  </div>
</template>

<style scoped>
.join-us-page {
  font-family: "sf pro display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #1d1d1f;
  background-color: #fff;
}

/* 英雄区域 */
.hero {
  position: relative;
  height: 300px;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1568992687947-868a62a9f521?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8b2ZmaWNlJTIwcGVvcGxlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=2000&q=80');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 60px;
}

.hero-content {
  color: white;
  z-index: 1;
  padding: 0 20px;
}

.hero h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -0.5px;
}

.hero p {
  font-size: 24px;
  font-weight: 400;
  margin: 0;
  max-width: 600px;
}

/* 容器 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 通用部分样式 */
section {
  padding: 80px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-tag {
  display: inline-block;
  background-color: #f5f5f7;
  color: #06c;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 38px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
  position: relative;
}


/* 公司文化部分 */
.culture-content {
  font-size: 18px;
  line-height: 1.6;
  color: #515154;
  margin-bottom: 40px;
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.culture-pillars {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.pillar {
  background-color: #f5f5f7;
  border-radius: 16px;
  padding: 30px;
  border-top: 4px solid #06c;
  text-align: center;
}

.pillar h3 {
  font-size: 22px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 15px;
}

.pillar p {
  color: #515154;
  margin: 0;
  font-size: 16px;
}

/* 职位列表部分 */
.job-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin: 0 auto;
}

.job-card {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 30px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.job-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
  border-color: #06c;
}

.job-header {
  margin-bottom: 15px;
  text-align: left;
}

.job-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 5px;
}

.job-department {
  font-size: 14px;
  color: #06c;
  font-weight: 500;
}

.job-details {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  text-align: left;
}

.job-location,
.job-type,
.job-experience {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #515154;
}

.location-icon,
.type-icon,
.experience-icon {
  margin-right: 5px;
  font-size: 16px;
}

.job-description {
  font-size: 15px;
  line-height: 1.5;
  color: #515154;
  margin-bottom: 25px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: left;
}

.job-action {
  text-align: right;
}

.view-details-btn {
  background-color: transparent;
  color: #06c;
  border: 1px solid #06c;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-details-btn:hover {
  background-color: #06c;
  color: white;
}

/* 公司福利部分 */
.benefits-section {
  background-color: white;
  padding: 80px 0;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.benefit-card {
  background-color: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: all 0.3s ease;
}

.benefit-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.benefit-icon {
  padding-top: 40px;
  font-size: 36px;
  margin-bottom: 20px;
}

.benefit-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 10px;
}

.benefit-card p {
  font-size: 16px;
  color: #515154;
  margin: 0;
  padding-bottom: 40px;
}

/* 招聘流程部分 */
.process-steps {
  display: flex;
  flex-direction: column;
  gap: 30px;
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.process-step {
  display: flex;
  gap: 20px;
  align-items: center;
}

.step-number {
  flex: 0 0 70px;
  height: 70px;
  background: linear-gradient(135deg, #06c, #0091ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 700;
}

.step-content {
  flex: 1;
  background-color: #f5f5f7;
  padding: 25px;
  border-radius: 16px;
}

.step-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 10px;
}

.step-content p {
  font-size: 16px;
  color: #515154;
  margin: 0;
}

/* 工作环境部分 */
.workplace-gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  height: 200px;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s ease;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

/* 申请表单部分 */
.apply-form-container {
  background-color: #f5f5f7;
  border-radius: 20px;
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.apply-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: span 2;
}

label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #1d1d1f;
  font-size: 16px;
}

.required {
  color: #ff3b30;
}

input,
select,
textarea {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #d2d2d7;
  font-size: 16px;
  transition: all 0.2s ease;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #06c;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
}

textarea {
  resize: vertical;
}

input[type="file"] {
  padding: 10px 0;
}

.file-hint {
  font-size: 14px;
  color: #86868b;
  margin-top: 5px;
}

.form-submit {
  grid-column: span 2;
  text-align: center;
  margin-top: 10px;
}

.submit-btn {
  background: linear-gradient(135deg, #06c, #0091ff);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 14px 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 102, 204, 0.2);
}

/* 职位详情对话框 */
.position-details {
  padding: 10px;
}

.position-header {
  margin-bottom: 30px;
}

.position-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #515154;
  font-size: 16px;
}

.meta-icon {
  margin-right: 8px;
}

.position-description,
.position-requirements {
  margin-bottom: 30px;
}

.position-description h3,
.position-requirements h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 15px;
}

.position-description p {
  font-size: 16px;
  line-height: 1.6;
  color: #515154;
}

.position-requirements ul {
  padding-left: 20px;
}

.position-requirements li {
  margin-bottom: 8px;
  font-size: 16px;
  color: #515154;
}

.position-apply {
  text-align: center;
  margin-top: 40px;
}

.apply-btn {
  background: linear-gradient(135deg, #06c, #0091ff);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 14px 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 102, 204, 0.2);
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .hero h1 {
    font-size: 40px;
  }

  .section-header h2 {
    font-size: 32px;
  }

  .gallery-item {
    height: 160px;
  }

  .workplace-gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero {
    height: 320px;
  }

  .hero h1 {
    font-size: 36px;
  }

  .hero p {
    font-size: 18px;
  }

  .apply-form {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: span 1;
  }

  .job-cards {
    grid-template-columns: 1fr;
  }

  .process-step {
    flex-direction: column;
    text-align: center;
  }

  .step-number {
    margin: 0 auto;
  }
}

@media (max-width: 576px) {
  .hero h1 {
    font-size: 32px;
  }

  .section-header h2 {
    font-size: 28px;
  }

  .workplace-gallery {
    grid-template-columns: 1fr;
  }

  .position-meta {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .culture-pillars {
    grid-template-columns: 1fr;
  }
}
</style>
