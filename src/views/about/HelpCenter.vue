<script lang="ts" setup>
import Header from "../../components/Header.vue";
import Footer from "../../components/Footer.vue";
import { onMounted, reactive, ref } from "vue";

// 当页面挂载时，滚动到顶部
onMounted(() => {
  window.scrollTo(0, 0);
});

// 搜索功能
const searchQuery = ref('');
const isSearching = ref(false);
const searchResults = ref<{ category: string; question: string; answer: string }[]>([]);

// 帮助分类
const helpCategories = reactive([
  {
    id: 'account',
    icon: '👤',
    title: '账号与安全',
    description: '账号注册、登录、找回密码等相关问题'
  },
  {
    id: 'orders',
    icon: '📦',
    title: '订单与支付',
    description: '订单状态、支付方式、发票等相关问题'
  },
  {
    id: 'reading',
    icon: '📚',
    title: '阅读体验',
    description: '电子书阅读、书籍推荐等相关问题'
  },
  {
    id: 'delivery',
    icon: '🚚',
    title: '配送与售后',
    description: '配送方式、退换货、售后服务等问题'
  },
  {
    id: 'promotions',
    icon: '🏷️',
    title: '优惠与活动',
    description: '折扣码、会员特权、促销活动等相关问题'
  },
  {
    id: 'app',
    icon: '📱',
    title: '应用与功能',
    description: '功能介绍、使用教程、应用常见问题'
  }
]);

// 热门问题
const hotQuestions = reactive([
  {
    id: 1,
    question: '如何修改我的收货地址？',
    category: 'account',
    viewCount: 5823
  },
  {
    id: 2,
    question: '购买电子书后在哪里阅读？',
    category: 'reading',
    viewCount: 4912
  },
  {
    id: 3,
    question: '如何申请退款？',
    category: 'orders',
    viewCount: 4756
  },
  {
    id: 4,
    question: '订单发货后多久能收到？',
    category: 'delivery',
    viewCount: 4231
  },
  {
    id: 5,
    question: '会员等级有什么特权？',
    category: 'promotions',
    viewCount: 3958
  }
]);

// FAQ数据
const faqData = reactive({
  account: [
    {
      question: '如何注册枕石书屋账号？',
      answer: '您可以通过点击网站右上角的"登录"按钮，然后选择"注册新账号"，填写必要的个人信息即可完成注册。我们支持手机号、邮箱及第三方账号（微信、QQ等）登录。'
    },
    {
      question: '忘记密码怎么办？',
      answer: '在登录页面点击"忘记密码"链接，您可以通过注册时使用的邮箱或手机号接收验证码，重新设置密码。如果您仍然无法找回密码，请联系我们的客服人员获取帮助。'
    },
    {
      question: '如何修改个人信息？',
      answer: '登录后，点击右上角的个人头像，进入"个人中心"，在"账户设置"中可以修改您的个人信息、密码、绑定手机或邮箱等信息。'
    },
    {
      question: '如何保护我的账号安全？',
      answer: '我们建议：1. 定期更换密码；2. 开启双因素认证；3. 不在公共设备上保存登录状态；4. 不要将账号密码告知他人；5. 发现异常登录情况立即修改密码并联系客服。'
    }
  ],
  orders: [
    {
      question: '如何查看我的订单状态？',
      answer: '登录账号后，点击"我的订单"即可查看所有订单及其状态。您可以根据订单状态（待付款、待发货、待收货等）进行筛选查看。'
    },
    {
      question: '支持哪些支付方式？',
      answer: '我们支持多种支付方式，包括支付宝、微信支付、银联卡、信用卡支付等。国际用户可使用Visa、Mastercard等国际信用卡或PayPal付款。'
    },
    {
      question: '如何申请发票？',
      answer: '在下单时，您可以选择"需要发票"选项并填写发票信息；如果下单时未选择，您也可以在订单完成后的3个月内，在"订单详情"页面申请开具发票。我们支持电子发票和纸质发票两种方式。'
    },
    {
      question: '订单已付款但显示待付款状态？',
      answer: '这可能是由于系统延迟导致的。请稍等片刻刷新页面，或检查您的支付账户是否已扣款。如果已扣款但订单状态长时间未更新，请联系客服处理。'
    }
  ],
  reading: [
    {
      question: '如何在枕石书屋阅读电子书？',
      answer: '购买电子书后，您可以通过以下方式阅读：1. 网页版：直接在个人中心的"我的书架"中阅读；2. APP：下载枕石书屋APP，登录后在"书架"中阅读；3. 电子阅读器：部分图书支持导出至特定品牌的电子阅读器。'
    },
    {
      question: '电子书支持离线阅读吗？',
      answer: '是的，您可以在枕石书屋APP中将购买的电子书下载到本地，然后在无网络环境下阅读。部分图书还支持音频离线下载功能。'
    },
    {
      question: '怎样调整阅读设置（字体、背景等）？',
      answer: '在阅读界面，点击屏幕中央调出菜单，选择"设置"图标，您可以调整字体大小、字体样式、行间距、背景颜色、亮度等阅读参数，使阅读体验更舒适。'
    },
    {
      question: '为什么某些电子书无法购买？',
      answer: '这可能是由于地区版权限制、出版商限制或该书暂时下架维护等原因。您可以点击"到货通知"，当书籍可购买时我们会通过邮件通知您。'
    }
  ],
  delivery: [
    {
      question: '配送范围和时间是怎样的？',
      answer: '我们覆盖全国大部分地区配送，一般城市地区1-3天送达，偏远地区3-7天送达。特殊天气或节假日可能会延长配送时间。海外配送需要7-15个工作日，具体以各地区政策为准。'
    },
    {
      question: '如何申请退换货？',
      answer: '在"我的订单"中找到相应订单，点击"申请售后"，选择退款或换货并填写原因。纸质书一般支持收到商品7天内无理由退换，电子书根据阅读进度有不同的退款政策，请参考具体商品说明。'
    },
    {
      question: '收到的图书有质量问题怎么办？',
      answer: '请保留商品及包装，拍照记录问题，然后通过"申请售后"选择"商品质量问题"并上传照片说明。确认属于质量问题后，我们将为您安排重新发货或全额退款。'
    },
    {
      question: '如何修改收货地址和联系方式？',
      answer: '订单支付前，您可以在提交订单页面修改；订单支付后但尚未发货，可联系客服修改；已发货订单无法修改地址，建议联系快递公司或重新下单。您可以在"个人中心"的"地址管理"中添加或修改常用地址。'
    }
  ],
  promotions: [
    {
      question: '如何使用优惠券或折扣码？',
      answer: '在结算页面，您会看到"使用优惠券"选项，点击后输入您的折扣码或选择可用的优惠券即可。请注意查看优惠券的使用条件和有效期。'
    },
    {
      question: '会员等级如何划分？有哪些特权？',
      answer: '会员分为普通会员、银牌会员、金牌会员和钻石会员，根据累计消费金额或年度消费次数晋升。不同等级会员享有不同折扣、生日礼、专属客服等特权，详情可在"会员中心"查看。'
    },
    {
      question: '积分如何获取和使用？',
      answer: '您可通过购书、评论、参与活动等方式获取积分。积分可在下单时抵扣部分金额(100积分=1元)，也可在"积分商城"兑换礼品或特权。积分有效期通常为获取后的12个月。'
    },
    {
      question: '新人福利有哪些？',
      answer: '新注册用户可享受：1. 首单满减优惠；2. 新人专属优惠券包；3. 免费领取精选电子书；4. 额外获得200积分。这些福利会在注册成功后自动发放到您的账户中。'
    }
  ],
  app: [
    {
      question: '枕石书屋APP如何下载安装？',
      answer: '您可以在各大应用商店（App Store、华为应用市场、小米商店、应用宝等）搜索"枕石书屋"下载安装，或者在我们官网首页扫描二维码直接下载。'
    },
    {
      question: '网页版和APP版有什么区别？',
      answer: 'APP版提供更完整的移动阅读体验，支持离线阅读、听书功能、护眼模式等特色功能；而网页版则更适合在电脑上浏览商品和管理账户。两个平台的账号、购买记录和阅读进度是互通的。'
    },
    {
      question: '如何同步我的阅读进度？',
      answer: '只要您使用相同账号登录，阅读进度会自动在云端同步。如果发现同步问题，请确保您的设备已联网，并在设置中检查"阅读同步"选项是否开启。手动同步可点击书籍页面的"同步"按钮。'
    },
    {
      question: 'APP闪退或无法打开怎么办？',
      answer: '请尝试以下方法：1. 检查是否是最新版本，如不是请更新；2. 清除APP缓存；3. 重启设备；4. 卸载后重新安装。如问题仍未解决，请联系客服并提供您的设备型号和系统版本。'
    }
  ]
});

// 活动标签
const activeCategory = ref('account');

// 切换分类
const setActiveCategory = (categoryId: string) => {
  activeCategory.value = categoryId;
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

// 获取分类标题
const getCategoryTitle = (categoryId: string) => {
  const category = helpCategories.find(cat => cat.id === categoryId);
  return category ? category.title : '';
};

// 清除搜索
const clearSearch = () => {
  searchQuery.value = '';
  isSearching.value = false;
  searchResults.value = [];
};

// 立即帮助聊天功能
const showChat = ref(false);
const chatMessages = ref([
  {
    sender: 'bot',
    text: '您好！我是枕石书屋智能客服小茄，有什么可以帮您解决的问题吗？',
    time: new Date()
  }
]);
const userMessage = ref('');

const toggleChat = () => {
  showChat.value = !showChat.value;
};

const sendMessage = () => {
  if (!userMessage.value.trim()) return;

  // 添加用户消息
  chatMessages.value.push({
    sender: 'user',
    text: userMessage.value,
    time: new Date()
  });

  // 模拟自动回复
  setTimeout(() => {
    chatMessages.value.push({
      sender: 'bot',
      text: '感谢您的咨询！我们的客服人员将会尽快回复您的问题。您也可以尝试在帮助中心搜索相关内容获取即时帮助。',
      time: new Date()
    });
  }, 1000);

  userMessage.value = '';
};

// 格式化时间
const formatTime = (date: string | number | Date) => {
  return new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
  <div class="help-center">
    <Header />

    <!-- 英雄区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1>帮助中心</h1>
        <p>有问题？我们来帮您解决</p>
      </div>
    </section>

    <!-- 主要内容 -->
    <div class="container"><p class="demo-notice">本页为课程项目的界面演示。公司、招聘、客服和商业服务文案为设计示例。</p>
      <!-- 搜索结果 -->
      <section v-if="isSearching" class="search-results-section">
        <div class="section-header">
          <h2>搜索结果 <span v-if="searchResults.length">({{ searchResults.length }})</span></h2>
          <el-button type="text" @click="clearSearch">返回全部分类</el-button>
        </div>

        <div v-if="searchResults.length" class="search-results-list">
          <div v-for="(result, index) in searchResults" :key="index" class="search-result-item">
            <div class="result-category-badge">{{ getCategoryTitle(result.category) }}</div>
            <h3>{{ result.question }}</h3>
            <p>{{ result.answer }}</p>
          </div>
        </div>

        <div v-else class="no-results">
          <div class="no-results-icon">🔍</div>
          <p>未找到与"{{ searchQuery }}"相关的结果</p>
          <p class="no-results-sub">请尝试其他关键词，或浏览下方的常见问题</p>
        </div>
      </section>

      <!-- 未搜索时显示常规帮助内容 -->
      <template v-else>
        <!-- 帮助分类 -->
        <section class="categories-section">
          <div class="section-header">
            <h2>选择帮助分类</h2>
          </div>
          <div class="categories-grid">
            <div v-for="category in helpCategories" :key="category.id"
              :class="{ active: activeCategory === category.id }" class="category-card"
              @click="setActiveCategory(category.id)">
              <div class="category-icon">{{ category.icon }}</div>
              <h3>{{ category.title }}</h3>
              <p>{{ category.description }}</p>
            </div>
          </div>
        </section>

        <!-- 热门问题 -->
        <section class="hot-questions-section">
          <div class="section-header">
            <h2>热门问题</h2>
            <el-button type="text" @click="setActiveCategory('account')">查看全部</el-button>
          </div>

          <div class="hot-questions-list">
            <div v-for="question in hotQuestions" :key="question.id" class="hot-question-item">
              <div class="question-info">
                <span class="question-category">{{ getCategoryTitle(question.category) }}</span>
                <span class="question-views">{{ question.viewCount }} 次浏览</span>
              </div>
              <h3>{{ question.question }}</h3>
              <el-button class="view-answer-btn" type="text" @click="setActiveCategory(question.category)">
                查看解答 <i class="arrow-icon">→</i>
              </el-button>
            </div>
          </div>
        </section>

        <!-- FAQ区域 -->
        <section class="faq-section">
          <div class="section-header">
            <h2>常见问题</h2>
          </div>

          <div class="tabs-container">
            <div class="tabs-header">
              <div v-for="category in helpCategories" :key="category.id"
                :class="{ active: activeCategory === category.id }" class="tab" @click="setActiveCategory(category.id)">
                {{ category.title }}
              </div>
            </div>

            <div class="tab-content">
              <div v-for="(questions, categoryId) in faqData" v-show="activeCategory === categoryId" :key="categoryId">
                <div v-if="questions.length" class="faq-container">
                  <div v-for="(faq, index) in questions" :key="index" :class="{ expanded: expandedFaq === index }"
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

                <div v-else class="no-faq">
                  <p>该分类下暂无常见问题</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>

      <!-- 联系我们 -->
      <section class="contact-section">
        <div class="section-header">
          <h2>没有找到解答？</h2>
          <p>我们的客服团队随时为您提供帮助</p>
        </div>

        <div class="contact-methods">
          <div class="contact-card">
            <div class="contact-icon">📞</div>
            <h3>电话支持</h3>
            <p>400-888-8888</p>
            <p class="contact-note">9:00 - 21:00 (周一至周日)</p>
          </div>

          <div class="contact-card">
            <div class="contact-icon">✉️</div>
            <h3>邮件支持</h3>
            <p>support@tomatobooks.com</p>
            <p class="contact-note">24小时内回复</p>
          </div>

          <div class="contact-card">
            <div class="contact-icon">💬</div>
            <h3>在线客服</h3>
            <button class="chat-now-btn" @click="toggleChat">立即咨询</button>
            <p class="contact-note">9:00 - 24:00 (周一至周日)</p>
          </div>
        </div>
      </section>

      <!-- 视频教程区域 -->
      <section class="tutorial-section">
        <div class="section-header">
          <h2>视频教程</h2>
          <el-button type="text">查看全部</el-button>
        </div>

        <div class="tutorial-grid">
          <div class="tutorial-card">
            <div class="tutorial-thumbnail">
              <div class="play-icon">▶</div>
              <img alt="新手入门指南"
                src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80">
            </div>
            <h3>新手入门指南</h3>
            <p>3:45</p>
          </div>

          <div class="tutorial-card">
            <div class="tutorial-thumbnail">
              <div class="play-icon">▶</div>
              <img alt="如何借阅电子书"
                src="https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Ym9va3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60">
            </div>
            <h3>如何阅读电子书</h3>
            <p>5:12</p>
          </div>

          <div class="tutorial-card">
            <div class="tutorial-thumbnail">
              <div class="play-icon">▶</div>
              <img alt="支付与退款教程"
                src="https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGF5bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60">
            </div>
            <h3>支付与退款教程</h3>
            <p>4:30</p>
          </div>

          <div class="tutorial-card">
            <div class="tutorial-thumbnail">
              <div class="play-icon">▶</div>
              <img alt="会员等级与福利"
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fHRlYW18ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60">
            </div>
            <h3>会员等级与福利</h3>
            <p>6:15</p>
          </div>
        </div>
      </section>
    </div>

    <!-- 在线客服聊天窗口 -->
    <div :class="{ 'chat-open': showChat }" class="chat-widget">
      <div class="chat-header" @click="toggleChat">
        <h3>在线客服</h3>
        <button class="close-chat">{{ showChat ? '×' : '+' }}</button>
      </div>

      <div v-if="showChat" class="chat-body">
        <div class="chat-messages">
          <div v-for="(message, index) in chatMessages" :key="index" :class="message.sender" class="chat-message">
            <div class="message-content">{{ message.text }}</div>
            <div class="message-time">{{ formatTime(message.time) }}</div>
          </div>
        </div>

        <div class="chat-input">
          <input v-model="userMessage" placeholder="输入您的问题..." type="text" @keyup.enter="sendMessage">
          <button @click="sendMessage">发送</button>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.help-center {
  font-family: "sf pro display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #1d1d1f;
  background-color: #fff;
}

/* 英雄区域 */
.hero {
  position: relative;
  height: 300px;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1466096115517-bceecbfb6fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80');
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
  width: 100%;
  max-width: 800px;
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
  margin: 0 0 30px;
}

/* 容器 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 通用部分样式 */
section {
  padding: 60px 0;
  border-bottom: 1px solid #f0f0f0;
}

section:last-child {
  border-bottom: none;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 10px;
}

.section-header p {
  font-size: 18px;
  color: #515154;
  margin: 0;
}

/* 帮助分类区域 */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.category-card {
  background-color: #f5f5f7;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.category-card.active {
  border-color: #06c;
  background-color: rgba(0, 102, 204, 0.05);
}

.category-icon {
  font-size: 36px;
  margin-bottom: 15px;
}

.category-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 10px;
}

.category-card p {
  font-size: 14px;
  color: #515154;
  margin: 0;
}

/* 热门问题区域 */
.hot-questions-section .section-header {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.hot-questions-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.hot-question-item {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 25px;
  transition: all 0.3s ease;
}

.hot-question-item:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  border-color: #d0d0d0;
}

.question-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.question-category {
  font-size: 14px;
  color: #06c;
  font-weight: 500;
}

.question-views {
  font-size: 14px;
  color: #86868b;
}

.hot-question-item h3 {
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
  margin: 0 0 15px;
}

.view-answer-btn {
  padding: 0;
  color: #06c;
  transition: all 0.3s ease;
}

.view-answer-btn:hover .arrow-icon {
  transform: translateX(3px);
}

.arrow-icon {
  display: inline-block;
  margin-left: 5px;
  transition: transform 0.3s ease;
}

/* FAQ区域 */
.tabs-container {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);
}

.tabs-header {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid #e6e6e6;
  background-color: #f9f9f9;
}

.tab {
  padding: 15px 25px;
  font-size: 16px;
  font-weight: 500;
  color: #515154;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
}

.tab.active {
  color: #06c;
  border-bottom-color: #06c;
  background-color: white;
}

.tab-content {
  padding: 40px;
}

.faq-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.faq-item {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item:hover {
  border-color: #d0d0d0;
}

.faq-item.expanded {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.faq-question {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background-color: #f9f9f9;
}

.faq-question h3 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  flex: 1;
}

.expand-icon {
  font-size: 20px;
  color: #06c;
  transition: transform 0.3s ease;
}

.faq-item.expanded .expand-icon {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 20px 20px;
  background-color: white;
}

.faq-answer p {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #515154;
}

.no-faq {
  text-align: center;
  padding: 30px;
  color: #86868b;
}

/* 联系方式区域 */
.contact-methods {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.contact-card {
  background-color: #f5f5f7;
  border-radius: 16px;
  padding: 40px 30px;
  text-align: center;
  flex: 1;
  min-width: 250px;
  transition: all 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
}

.contact-icon {
  font-size: 36px;
  margin-bottom: 20px;
}

.contact-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 10px;
}

.contact-card p {
  font-size: 18px;
  color: #06c;
  margin: 0 0 10px;
}

.contact-note {
  font-size: 14px;
  color: #86868b;
}

.chat-now-btn {
  background-color: #06c;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 10px;
}

.chat-now-btn:hover {
  background-color: #0055b3;
}

/* 视频教程区域 */
.tutorial-section .section-header {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.tutorial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.tutorial-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.tutorial-card:hover {
  transform: translateY(-5px);
}

.tutorial-thumbnail {
  position: relative;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.tutorial-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s ease;
}

.tutorial-card:hover .tutorial-thumbnail img {
  transform: scale(1.05);
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  transition: all 0.3s ease;
}

.tutorial-card:hover .play-icon {
  background-color: rgba(0, 102, 204, 0.8);
}

.tutorial-card h3 {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 5px;
}

.tutorial-card p {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

/* 聊天窗口 */
.chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  max-width: 100%;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow: hidden;
  transition: all 0.3s ease;
}

.chat-header {
  background: linear-gradient(135deg, #06c, #0091ff);
  color: white;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.chat-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.close-chat {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.chat-body {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chat-message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
}

.chat-message.bot {
  align-self: flex-start;
  background-color: #f0f0f0;
  border-bottom-left-radius: 4px;
}

.chat-message.user {
  align-self: flex-end;
  background-color: #0091ff;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-content {
  margin-bottom: 5px;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
  text-align: right;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
}

.chat-input input {
  flex: 1;
  padding: 10px 15px;
  border-radius: 20px;
  border: 1px solid #d0d0d0;
  outline: none;
  font-size: 14px;
}

.chat-input button {
  background-color: #06c;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.chat-input button:hover {
  background-color: #0055b3;
}

.chat-widget:not(.chat-open) {
  height: 60px;
  overflow: hidden;
}

/* 搜索结果区域 */
.search-results-section .section-header {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-result-item {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 25px;
  transition: all 0.3s ease;
}

.search-result-item:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.result-category-badge {
  display: inline-block;
  background-color: #f0f0f0;
  color: #515154;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 15px;
}

.search-result-item h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 10px;
}

.search-result-item p {
  font-size: 15px;
  line-height: 1.6;
  color: #515154;
  margin: 0;
}

.no-results {
  text-align: center;
  padding: 60px 0;
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.no-results p {
  font-size: 18px;
  color: #1d1d1f;
  margin: 0 0 10px;
}

.no-results-sub {
  font-size: 16px;
  color: #86868b;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .hero {
    height: 250px;
  }

  .hero h1 {
    font-size: 40px;
  }

  .hero p {
    font-size: 20px;
  }

  section {
    padding: 50px 0;
  }

  .section-header h2 {
    font-size: 28px;
  }

  .tabs-header {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 32px;
  }

  .hero p {
    font-size: 18px;
  }

  .section-header {
    margin-bottom: 30px;
  }

  .section-header h2 {
    font-size: 24px;
  }

  .contact-methods {
    flex-direction: column;
  }

  .contact-card {
    width: 100%;
  }

  .tab-content {
    padding: 20px;
  }

  .chat-widget {
    width: 300px;
    right: 10px;
    bottom: 10px;
  }
}

@media (max-width: 576px) {
  .hero {
    height: 220px;
  }

  .hero h1 {
    font-size: 28px;
  }

  .hero p {
    font-size: 16px;
  }

  .section-header h2 {
    font-size: 22px;
  }

  .hot-questions-list {
    grid-template-columns: 1fr;
  }

  .tabs-header {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .tab {
    padding: 12px 15px;
    font-size: 14px;
  }

  .tutorial-grid {
    grid-template-columns: 1fr;
  }

  .chat-widget {
    width: calc(100% - 20px);
  }

  .chat-body {
    height: 350px;
  }
}
</style>
