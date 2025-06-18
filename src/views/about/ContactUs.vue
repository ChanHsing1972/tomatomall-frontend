<script lang="ts" setup>
import Header from "../../components/Header.vue";
import Footer from "../../components/Footer.vue";
import {onMounted, reactive, ref} from "vue";
import {ElMessage} from "element-plus";

// 联系信息
const contactInfo = reactive({
  address: "上海市浦东新区张江高科技园区博云路2号5楼",
  phone: "400-888-8888",
  email: "contact@tomato-bookstore.com",
  workingHours: "周一至周五 09:00 - 18:00"
});

// 社交媒体
const socialMedia = reactive([
  {name: "微信", icon: "📱", link: "#"},
  {name: "微博", icon: "💬", link: "#"},
  {name: "知乎", icon: "📖", link: "#"},
  {name: "哔哩哔哩", icon: "📹", link: "#"}
]);

// 办公地点
const officeLocations = reactive([
  {
    city: "上海总部",
    address: "上海市浦东新区张江高科技园区博云路2号5楼",
    phone: "021-88888888",
    email: "shanghai@tomato-bookstore.com"
  },
  {
    city: "北京分部",
    address: "北京市海淀区中关村南大街5号",
    phone: "010-66666666",
    email: "beijing@tomato-bookstore.com"
  },
  {
    city: "广州分部",
    address: "广州市天河区珠江新城冼村路8号",
    phone: "020-55555555",
    email: "guangzhou@tomato-bookstore.com"
  }
]);

// FAQ数据
const faqs = reactive([
  {
    question: "如何查询订单状态？",
    answer: "您可以登录账号后，在\"我的订单\"页面查看订单状态。每个订单状态变更时，我们也会通过短信或邮件通知您。"
  },
  {
    question: "支持哪些支付方式？",
    answer: "我们支持支付宝、微信支付、银联卡支付、信用卡支付等多种支付方式，您可以根据个人偏好选择。"
  },
  {
    question: "如何申请退款？",
    answer: "在订单页面选择需要退款的商品，点击\"申请退款\"按钮，按照指引填写退款原因并提交，我们将在1-3个工作日内处理您的退款申请。"
  },
  {
    question: "配送时间是怎样的？",
    answer: "正常情况下，我们会在确认订单后24小时内安排发货，大部分地区可在3-5天内送达。特殊地区可能需要更长时间。"
  },
  {
    question: "如何成为番茄书城的签约作者？",
    answer: "请将您的作品简介和个人履历发送至author@tomato-bookstore.com，我们的编辑团队会在审阅后与您联系。"
  }
]);

// 联系表单
const contactForm = reactive({
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: ""
});

// 表单提交
const submitForm = () => {
  // 这里可以添加表单验证逻辑
  if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
    ElMessage.warning("请填写必要的字段");
    return;
  }

  ElMessage.success("您的消息已成功发送，我们将尽快与您联系！");

  // 重置表单
  contactForm.name = "";
  contactForm.email = "";
  contactForm.phone = "";
  contactForm.subject = "";
  contactForm.message = "";
};

// 当页面挂载时，滚动到顶部
onMounted(() => {
  window.scrollTo(0, 0);
});

// 活动标签
const activeTab = ref("feedback");

// 切换标签
const setActiveTab = (tabName: string) => {
  activeTab.value = tabName;
};

// 控制FAQ展开/折叠
const expandedFaq = ref(-1);

const toggleFaq = (index: number) => {
  if (expandedFaq.value === index) {
    expandedFaq.value = -1;
  } else {
    expandedFaq.value = index;
  }
};
</script>

<template>
  <div class="contact-us-page">
    <Header/>

    <!-- 英雄区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1>联系我们</h1>
        <p>我们期待与您沟通</p>
      </div>
    </section>

    <!-- 主要内容 -->
    <div class="container">
      <!-- 联系方式概览 -->
      <section class="contact-overview-section">
        <div class="contact-cards">
          <div class="contact-card">
            <div class="card-icon">📞</div>
            <h3>电话咨询</h3>
            <p>{{ contactInfo.phone }}</p>
            <span class="card-note">{{ contactInfo.workingHours }}</span>
          </div>
          <div class="contact-card">
            <div class="card-icon">✉️</div>
            <h3>电子邮件</h3>
            <p>{{ contactInfo.email }}</p>
            <span class="card-note">我们会在24小时内回复您</span>
          </div>
          <div class="contact-card">
            <div class="card-icon">📍</div>
            <h3>公司地址</h3>
            <p>{{ contactInfo.address }}</p>
            <span class="card-note">欢迎预约参观</span>
          </div>
        </div>
      </section>

      <!-- 沟通区域 -->
      <section class="communication-section">
        <div class="section-header">
          <span class="section-tag">联系番茄书城</span>
          <h2>让我们保持联系</h2>
        </div>

        <div class="tabs-container">
          <div class="tabs-header">
            <div :class="{ active: activeTab === 'feedback' }" class="tab" @click="setActiveTab('feedback')">意见反馈
            </div>
            <div :class="{ active: activeTab === 'business' }" class="tab" @click="setActiveTab('business')">商务合作
            </div>
            <div :class="{ active: activeTab === 'support' }" class="tab" @click="setActiveTab('support')">客户支持
            </div>
          </div>

          <div class="tab-content">
            <!-- 意见反馈内容 -->
            <div v-if="activeTab === 'feedback'" class="tab-pane">
              <div class="form-content">
                <p>我们非常重视您的意见和建议，这是我们不断改进和提升服务的重要依据。请填写以下表单，分享您的想法。</p>
                <form class="contact-form" @submit.prevent="submitForm">
                  <div class="form-row">
                    <div class="form-group">
                      <label for="name">您的姓名 <span class="required">*</span></label>
                      <input id="name" v-model="contactForm.name" required type="text">
                    </div>
                    <div class="form-group">
                      <label for="email">电子邮箱 <span class="required">*</span></label>
                      <input id="email" v-model="contactForm.email" required type="email">
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label for="phone">联系电话</label>
                      <input id="phone" v-model="contactForm.phone" type="tel">
                    </div>
                    <div class="form-group">
                      <label for="subject">主题 <span class="required">*</span></label>
                      <input id="subject" v-model="contactForm.subject" required type="text">
                    </div>
                  </div>
                  <div class="form-group full-width">
                    <label for="message">您的反馈 <span class="required">*</span></label>
                    <textarea id="message" v-model="contactForm.message" required rows="6"></textarea>
                  </div>
                  <div class="form-group submit-group">
                    <button class="submit-btn" type="submit">提交反馈</button>
                  </div>
                </form>
              </div>
            </div>

            <!-- 商务合作内容 -->
            <div v-if="activeTab === 'business'" class="tab-pane">
              <div class="cooperation-content">
                <div class="cooperation-text">
                  <h3>一起探索无限可能</h3>
                  <p>
                    番茄书城始终开放合作的大门，无论您是出版社、作家、内容创作者，还是想与我们进行品牌合作的企业，我们都期待与您建立长期友好的合作关系。</p>
                  <ul class="cooperation-list">
                    <li>
                      <strong>出版合作</strong>
                      <p>我们欢迎各出版机构与我们洽谈图书发行、宣传推广等合作机会。</p>
                    </li>
                    <li>
                      <strong>内容合作</strong>
                      <p>如果您是作家或内容创作者，可以通过我们的平台实现内容变现。</p>
                    </li>
                    <li>
                      <strong>品牌合作</strong>
                      <p>探索联合营销、品牌活动和战略合作的可能性。</p>
                    </li>
                    <li>
                      <strong>技术与创新</strong>
                      <p>我们欢迎有关数字阅读、内容制作等方面的技术创新合作提案。</p>
                    </li>
                  </ul>
                  <p class="contact-email">商务合作请联系: <a
                      href="mailto:business@tomato-bookstore.com">business@tomato-bookstore.com</a></p>
                </div>
              </div>
            </div>

            <!-- 客户支持内容 -->
            <div v-if="activeTab === 'support'" class="tab-pane">
              <div class="support-content">
                <div class="support-channels">
                  <div class="support-channel">
                    <div class="channel-icon">📞</div>
                    <h4>客服热线</h4>
                    <p>400-888-8888（周一至周日 8:00-22:00）</p>
                  </div>
                  <div class="support-channel">
                    <div class="channel-icon">💬</div>
                    <h4>在线客服</h4>
                    <p>登录账号后，点击右下角客服图标</p>
                  </div>
                  <div class="support-channel">
                    <div class="channel-icon">✉️</div>
                    <h4>邮件支持</h4>
                    <p>support@tomato-bookstore.com</p>
                  </div>
                </div>

                <div class="self-service">
                  <h3>自助服务</h3>
                  <div class="self-service-options">
                    <a class="self-service-option" href="#">
                      <span class="option-icon">📦</span>
                      <span>查询订单</span>
                    </a>
                    <a class="self-service-option" href="#">
                      <span class="option-icon">🔄</span>
                      <span>退换货</span>
                    </a>
                    <a class="self-service-option" href="#">
                      <span class="option-icon">💳</span>
                      <span>支付问题</span>
                    </a>
                    <a class="self-service-option" href="#">
                      <span class="option-icon">🚚</span>
                      <span>配送查询</span>
                    </a>
                    <a class="self-service-option" href="#">
                      <span class="option-icon">📝</span>
                      <span>售后政策</span>
                    </a>
                    <a class="self-service-option" href="#">
                      <span class="option-icon">❓</span>
                      <span>帮助中心</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 公司办公地点 -->
      <section class="office-locations-section">
        <div class="section-header">
          <span class="section-tag">我们的办公室</span>
          <h2>全国服务网络</h2>
        </div>

        <div class="locations-grid">
          <div v-for="(office, index) in officeLocations" :key="index" class="location-card">
            <div class="location-header">
              <h3>{{ office.city }}</h3>
            </div>
            <div class="location-body">
              <div class="location-info">
                <p><i class="info-icon">📍</i> {{ office.address }}</p>
                <p><i class="info-icon">📞</i> {{ office.phone }}</p>
                <p><i class="info-icon">✉️</i> {{ office.email }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 地图区域 -->
      <section class="map-section">
        <div class="map-container">
          <div class="map-placeholder">
            <!-- 这里放置地图，实际应用中可以使用高德地图、百度地图等API -->
            <img
                alt="公司地图"
                src="https://api.map.baidu.com/staticimage/v2?ak=您的密钥&mcode=您的安全码&center=116.404,39.915&width=780&height=400&zoom=15"/>
            <div class="map-overlay">
              <div class="map-info">
                <h3>番茄书城总部</h3>
                <p>{{ contactInfo.address }}</p>
                <a class="map-link" href="https://map.baidu.com/search/番茄书城总部" target="_blank">查看导航 →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ部分 -->
      <section class="faq-section">
        <div class="section-header">
          <span class="section-tag">常见问题</span>
          <h2>快速解答</h2>
        </div>

        <div class="faq-container">
          <div v-for="(faq, index) in faqs" :key="index" :class="{ 'expanded': expandedFaq === index }"
               class="faq-item">
            <div class="faq-question" @click="toggleFaq(index)">
              <h3>{{ faq.question }}</h3>
              <span class="expand-icon">{{ expandedFaq === index ? '−' : '+' }}</span>
            </div>
            <div v-show="expandedFaq === index" class="faq-answer">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 社交媒体区域 -->
      <section class="social-media-section">
        <div class="section-header">
          <span class="section-tag">关注我们</span>
          <h2>社交平台</h2>
        </div>

        <div class="social-media-container">
          <div class="social-media-description">
            <p>关注我们的社交媒体，获取最新图书资讯、读者活动和独家优惠。</p>
            <p>欢迎通过以下平台与我们互动：</p>
          </div>

          <div class="social-media-icons">
            <a v-for="(social, index) in socialMedia" :key="index" :href="social.link" class="social-icon-link"
               target="_blank">
              <div class="social-icon">{{ social.icon }}</div>
              <span class="social-name">{{ social.name }}</span>
            </a>
          </div>
        </div>
      </section>
    </div>

    <Footer/>
  </div>
</template>

<style scoped>
.contact-us-page {
  font-family: "sf pro display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #1d1d1f;
  background-color: #fff;
}

/* 英雄区域 */
.hero {
  position: relative;
  height: 300px;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1596524430615-b46475ddff6e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80');
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

.section-header h2::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  border-radius: 2px;
}

/* 联系方式概览区域 */
.contact-overview-section {
  margin-top: -60px;
  position: relative;
  z-index: 10;
}

.contact-cards {
  display: flex;
  gap: 30px;
  justify-content: center;
}

.contact-card {
  flex: 1;
  background-color: white;
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}

.card-icon {
  font-size: 40px;
  margin-bottom: 20px;
}

.contact-card h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 15px;
  color: #1d1d1f;
}

.contact-card p {
  font-size: 18px;
  color: #06c;
  margin: 0 0 10px;
  font-weight: 500;
}

.card-note {
  font-size: 14px;
  color: #86868b;
}

/* 沟通区域 */
.communication-section {
  padding-top: 60px;
}

.tabs-container {
  max-width: 900px;
  margin: 0 auto;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #e6e6e6;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #86868b;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab.active {
  color: #06c;
  border-bottom-color: #06c;
}

.tab:hover {
  color: #06c;
}

.tab-content {
  padding: 40px;
}

.form-content p {
  text-align: center;
  margin-bottom: 30px;
  color: #515154;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
}

.required {
  color: #ff3b30;
}

.form-group input,
.form-group textarea {
  padding: 12px 15px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #06c;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.15);
}

.full-width {
  width: 100%;
}

.submit-group {
  text-align: center;
  margin-top: 10px;
}

.submit-btn {
  background: linear-gradient(90deg, #06c, #0091ff);
  color: white;
  border: none;
  padding: 14px 30px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 102, 204, 0.2);
}

/* 商务合作区域 */
.cooperation-content {
  max-width: 700px;
  margin: 0 auto;
}

.cooperation-text h3 {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  color: #1d1d1f;
}

.cooperation-text p {
  margin-bottom: 30px;
  color: #515154;
  line-height: 1.6;
  text-align: center;
}

.cooperation-list {
  list-style: none;
  padding: 0;
  margin: 40px 0;
}

.cooperation-list li {
  margin-bottom: 25px;
  padding: 20px;
  background-color: #f5f5f7;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.cooperation-list li:hover {
  background-color: #e6e6e6;
  transform: translateY(-2px);
}

.cooperation-list li strong {
  display: block;
  margin-bottom: 10px;
  font-size: 18px;
  color: #1d1d1f;
}

.cooperation-list li p {
  margin: 0;
  font-size: 16px;
  color: #515154;
  text-align: left;
}

.contact-email {
  text-align: center;
  font-size: 18px;
  margin-top: 30px;
}

.contact-email a {
  color: #06c;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.contact-email a:hover {
  text-decoration: underline;
}

/* 客户支持区域 */
.support-channels {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 50px;
}

.support-channel {
  flex: 1;
  min-width: 200px;
  text-align: center;
  padding: 30px 20px;
  background-color: #f5f5f7;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.support-channel:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.channel-icon {
  font-size: 36px;
  margin-bottom: 15px;
}

.support-channel h4 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #1d1d1f;
}

.support-channel p {
  color: #515154;
  margin: 0;
}

.self-service {
  margin-top: 50px;
}

.self-service h3 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #1d1d1f;
}

.self-service-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.self-service-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  padding: 20px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.self-service-option:hover {
  border-color: #06c;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.option-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.self-service-option span:last-child {
  color: #1d1d1f;
  font-weight: 500;
}

/* 公司办公地点区域 */
.office-locations-section {
  background-color: white;
  padding: 80px 0;
}

.locations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.location-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.location-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.location-header {
  background: linear-gradient(135deg, #06c, #0091ff);
  padding: 20px;
  text-align: center;
}

.location-header h3 {
  color: white;
  margin: 0;
  font-size: 22px;
}

.location-body {
  padding: 30px;
}

.location-info p {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  color: #515154;
  line-height: 1.4;
}

.info-icon {
  margin-right: 10px;
  font-size: 18px;
  flex-shrink: 0;
}

/* 地图区域 */
.map-container {
  position: relative;
  height: 400px;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.map-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f5f5f7;
}

.map-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-overlay {
  position: absolute;
  bottom: 30px;
  left: 30px;
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  max-width: 300px;
}

.map-info h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #1d1d1f;
}

.map-info p {
  margin: 0 0 15px;
  font-size: 14px;
  color: #515154;
}

.map-link {
  color: #06c;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
}

.map-link:hover {
  text-decoration: underline;
}

/* FAQ区域 */
.faq-container {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item:hover {
  border-color: #06c;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.faq-question {
  background-color: #f5f5f7;
  padding: 20px;
  cursor: pointer;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-question h3 {
  margin: 0;
  font-size: 18px;
  color: #1d1d1f;
  font-weight: 600;
}

.expand-icon {
  font-size: 24px;
  color: #06c;
  transition: transform 0.3s ease;
}

.faq-item.expanded .expand-icon {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 20px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
}

.faq-answer p {
  margin: 0;
  color: #515154;
  line-height: 1.6;
}

/* 社交媒体区域 */
.social-media-section {
  text-align: center;
}

.social-media-container {
  max-width: 700px;
  margin: 0 auto;
}

.social-media-description {
  margin-bottom: 40px;
}

.social-media-description p {
  color: #515154;
  font-size: 18px;
  margin-bottom: 10px;
}

.social-media-icons {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.social-icon-link {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.social-icon-link:hover {
  transform: translateY(-5px);
}

.social-icon {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f7;
  border-radius: 50%;
  font-size: 30px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.social-icon-link:hover .social-icon {
  background-color: #06c;
  color: white;
}

.social-name {
  color: #1d1d1f;
  font-size: 16px;
  font-weight: 500;
}

/* 订阅区域 */
.subscribe-section {
  background-color: #f5f5f7;
  padding: 60px 0;
}

.subscribe-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.subscribe-content h2 {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 15px;
  color: #1d1d1f;
}

.subscribe-content p {
  font-size: 18px;
  color: #515154;
  margin-bottom: 30px;
}

.subscribe-form {
  display: flex;
  max-width: 500px;
  margin: 0 auto;
  gap: 10px;
}

.subscribe-form input {
  flex: 1;
  padding: 14px 20px;
  border: 1px solid #d2d2d7;
  border-radius: 30px;
  font-size: 16px;
}

.subscribe-form input:focus {
  outline: none;
  border-color: #06c;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.15);
}

.subscribe-form button {
  background: linear-gradient(90deg, #06c, #0091ff);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 0 30px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.subscribe-form button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 102, 204, 0.2);
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .contact-cards {
    flex-direction: column;
    max-width: 500px;
    margin: 0 auto;
  }

  .tab-content {
    padding: 30px 20px;
  }

  .form-row {
    flex-direction: column;
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 36px;
  }

  .hero p {
    font-size: 18px;
  }

  .section-header h2 {
    font-size: 30px;
  }

  .tabs-header {
    flex-direction: column;
  }

  .tab {
    border-bottom: 1px solid #e6e6e6;
    border-left: 3px solid transparent;
  }

  .tab.active {
    border-bottom-color: #e6e6e6;
    border-left-color: #06c;
    background-color: #f9f9f9;
  }

  .self-service-options {
    grid-template-columns: repeat(2, 1fr);
  }

  .social-media-icons {
    gap: 20px;
  }

  .subscribe-form {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .hero {
    height: 300px;
  }

  .contact-overview-section {
    margin-top: -40px;
  }

  .section {
    padding: 60px 0;
  }

  .self-service-options {
    grid-template-columns: 1fr;
  }

  .map-overlay {
    left: 20px;
    right: 20px;
    bottom: 20px;
  }
}
</style>
