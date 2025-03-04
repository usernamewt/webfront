<template>
  <a-row :gutter="16" v-if="!chatUser">
    <a-col
      :xs="24"
      :sm="12"
      :md="8"
      :lg="8"
      :xl="6"
      v-for="user in userList"
      :key="user.id"
    >
      <a-card
        @click.stop="toChat(user)"
        hoverable
        style="margin-bottom: 20px"
        :class="`${user.shake ? 'shake' : ''}`"
      >
        <template #cover>
          <img
            alt="example"
            src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
          />
        </template>
        <template #actions>
          <MessageOutlined />
          <HeartOutlined />
          <svgIcon
            style="font-size: 1.3rem"
            name="kick"
            @click.stop.prevent="handleKick(user)"
          />
        </template>
        <a-card-meta
          :title="user.partner_nickname"
          :description="`${
            user.last_message ? user.last_message : '暂无最新消息'
          }`"
        >
          <template #avatar>
            <a-avatar :src="`http://localhost:3000/${user.partner_avatar}`" />
          </template>
        </a-card-meta>
      </a-card>
    </a-col>
  </a-row>
  <div v-else class="chat-container">
    <div class="chat-header">
      <div class="header-content">
        <a-button circle class="back-btn" @click="goBack">
          <svg-icon name="back" />
        </a-button>
        <div class="chat-info">
          <div class="chat-title">Hi！</div>
          <div class="participants">
            <svg-icon :name="`bb${(Math.random() * 8 + 1).toFixed(0)}`" />
            <span class="me">{{ "正在和" }}</span>
            <span class="target">{{ "user" }}</span>
            <span class="me">{{ "聊天" }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 聊天消息区域 -->
    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-item"
        :class="{ 'user-message': message.isUser }"
      >
        <div class="message-bubble">
          <div class="message-content">{{ message.content }}</div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <a-button type="primary" circle ghost @click="showPicker('video')">
        <CameraOutlined />
      </a-button>
      <a-button type="primary" circle ghost @click="showPicker('image')">
        <VideoCameraOutlined />
      </a-button>
      <a-button type="primary" circle ghost @click="showPicker('emoji')">
        <SmileOutlined />
      </a-button>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <a-textarea
        v-model:value="inputText"
        placeholder="输入内容"
        :auto-size="{ minRows: 5, maxRows: 8 }"
      />
      <a-button type="primary" class="send-btn" @click="sendMessage">
        发送
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import svgIcon from "../layout/svg-icon.vue";

import {
  MessageOutlined,
  HeartOutlined,
  CameraOutlined,
  VideoCameraOutlined,
  SmileOutlined,
} from "@ant-design/icons-vue";
import { getUserChatList, getUserChat } from "../../api/user";
import { message } from "ant-design-vue";
import { getStorage } from "../../utils/storage";
import { useTestStore } from "../../store";
let socket = useTestStore();
const userList = ref<any[]>([]);
const messages = ref<any[]>([]);
const inputText = ref("");
const loading = ref(false);
const noMore = ref(false);
const form_id = ref(1);
const to_id = ref(-1);
const chatUser = ref(null);

onMounted(() => {
  socket.initSocket();
  socket.socket.on("new_message", (data: any) => {
    message.success(data.message);
  });
  initUser();
});

// watch(
//   () => socket.socketMsg,
//   () => {
//     message.success(socket.socketMsg);
//   },
//   { deep: true }
// );

const handleKick = (user: any) => {
  user.shake = true;
  setTimeout(() => {
    user.shake = false;
  }, 500);
};
const toChat = (user: any) => {
  user.active = true;
  to_id.value = user.partner_id;
  chatUser.value = user;
};

const initUser = async () => {
  getUserChatList().then((res) => {
    if (res.code === 0) {
      userList.value = res.data.map((el: any) => {
        return {
          ...el,
          shake: false,
          active: false,
        };
      });
    }
  });
};

const goBack = () => {
  chatUser.value = null;
};

const getDays = (date: string) => {
  return date ? date.split("-")[1] + "-" + date.split("-")[2] : "";
};

const diasbledTextArea = computed(() => {
  return to_id.value === -1;
});

const handleClick = (item: any) => {
  userList.value.forEach((el: any) => {
    el.active = false;
  });
  item.active = true;
  to_id.value = item.partner_id;
  messages.value = [];
  socket.value.emit("authenticate", {
    userId: form_id.value,
    nickname: getStorage("routerInfo").user.nickname,
  });
  // TODO: 获取聊天记录
  getUserChat(item.partner_id).then((res: any) => {
    console.log(res);
  });
};

const sendMessage = () => {
  if (inputText.value.trim()) {
    const message_val = {
      toUserId: to_id.value,
      message: inputText.value,
    };
    socket.sendSocketMessage({ type: "private_message", val: message_val });
    inputText.value = "";
  }
};

const handleScroll = (e: any) => {
  if (e.target.scrollTop === 0 && !loading.value && !noMore.value) {
    loadMoreMessages();
  }
};

const loadMoreMessages = () => {
  loading.value = true;
  setTimeout(() => {
    const newMessages = Array.from({ length: 10 }, (_) => ({
      from_id: form_id.value,
      to_id: to_id.value,
      content: messages.value,
      created_time: new Date().toLocaleTimeString(),
      updated_time: new Date().toLocaleTimeString(),
    }));
    messages.value = [...newMessages, ...messages.value];
    loading.value = false;
    if (messages.value.length >= 30) {
      noMore.value = true;
    }
  }, 1000);
};
onUnmounted(() => {
  socket.value.disconnect();
});
</script>

<style scoped lang="less">
.user-item {
  &:hover {
    background-color: #237eff;
    color: #fff;
  }
  .message-time {
    color: #999;
  }
}
// 创建一个动画，点击后会让外层的a-card按照左上角为圆心晃动，模拟card右下角被往左的作用力“踢了一脚”
.shake {
  animation: shake 0.5s;
}
// 细化下面的动画
@keyframes shake {
  0% {
    transform: translateX(-20px);
    transform-origin: right;
  }
  25% {
    transform-origin: right;
    transform: translateX(10px);
  }
  50% {
    transform-origin: right;
    transform: translateX(-8px);
  }
  75% {
    transform-origin: right;
    transform: translateX(8);
  }
  100% {
    transform-origin: right;
    transform: translateX(0);
  }
}

.active {
  background-color: #237eff;
  color: #fff;
  .message-time {
    color: #fff;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message {
  margin-bottom: 12px;
}

.message-content {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #f0f0f0;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.chat-toolbar {
  margin: 8px 0;
}

.no-more {
  text-align: center;
  color: #999;
  padding: 8px;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 130px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
}

.message-item {
  display: flex;
  margin-bottom: 15px;
}

.message-item.user-message {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: relative;
}

.user-message .message-bubble {
  background: #409eff;
  color: white;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}

.user-message .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.toolbar {
  padding: 10px 20px;
  background: white;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.input-area {
  position: relative;
  width: 100%;
  padding: 20px;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.send-btn {
  margin-top: 10px;
  width: 100px;
  position: absolute;
  right: 24px;
  bottom: 24px;
}

/* 美化滚动条 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.chat-header {
  // background: linear-gradient(135deg, #434343 0%, #000000 100%);
  color: white;
  padding: 15px 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 20px;
  margin: 0 auto;
}

.back-btn {
  margin-right: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

.back-btn:hover {
  transform: translateX(-3px);
  background: rgba(255, 255, 255, 0.1);
}

.chat-info {
  line-height: 1.4;
}

.chat-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #333;
}

.participants {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.participants .me {
  color: #409eff;
  font-weight: 500;
}

.participants .target {
  color: #67c23a;
  font-weight: 500;
}

.participants .el-icon {
  margin: 0 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  transition: transform 0.3s ease;
}

.participants:hover .el-icon {
  transform: rotate(180deg) scale(1.2);
}

/* 微调消息区域高度 */
.chat-messages {
  height: calc(100vh - 240px); /* 根据实际高度调整 */
}

.chat-header {
  position: relative;
  overflow: hidden;
}

.chat-header::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 25%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 75%
  );
  animation: shine 3s infinite linear;
}

@keyframes shine {
  to {
    transform: translate(50%, 50%);
  }
}

// 添加消息加载动画：
.loading-dots::after {
  content: "";
  animation: typing 1.5s infinite;
}

@keyframes typing {
  0% {
    content: "";
  }
  33% {
    content: ".";
  }
  66% {
    content: "..";
  }
  100% {
    content: "...";
  }
}

// 添加发送中状态动画：
.sending {
  position: relative;
  opacity: 0.7;
}

.sending::after {
  content: "";
  position: absolute;
  right: -20px;
  top: 50%;
  width: 12px;
  height: 12px;
  border: 2px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 添加消息点击涟漪效果：
.message-bubble {
  position: relative;
  overflow: hidden;
}

.message-bubble:active::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  border-radius: inherit;
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(2);
  }
}
</style>
