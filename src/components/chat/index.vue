<template>
  <a-row :gutter="16" v-if="to_id == -1">
    <a-col
      :xs="24"
      :sm="12"
      :md="8"
      :lg="6"
      :xl="4"
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
            :src="`${host}/${user.partner_avatar.split('|')[1]}`"
          />
        </template>
        <template #actions>
          <a-badge :dot="user.unread_count">
            <MessageOutlined />
          </a-badge>
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
            <a-avatar :src="`${host}${user.partner_avatar.split('|')[0]}`" />
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
            <span class="target">{{ chatUser.partner_nickname }}</span>
            <span class="me">{{ "聊天" }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 聊天消息区域 -->
    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="message in chat_messages"
        :key="message.id"
        class="message-item"
        :class="{ 'user-message': message.isUser }"
      >
        <div class="avatar-container">
          <img
            :src="
              message.isUser
                ? `${host}${getStorage('routerInfo').user.avatar.split('|')[0]}`
                : `${host}${chatUser.partner_avatar.split('|')[0]}`
            "
          />
        </div>
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
        @keydown.enter="sendMessage"
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
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
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
import { useTestStore } from "../../store";
import { getStorage } from "../../utils/storage";
let socket = useTestStore();
const userList = ref<any[]>([]);
const chat_messages = ref<any[]>([]);
const inputText = ref("");
const loading = ref(false);
const noMore = ref(false);
const form_id = ref(1);
const to_id = ref(-1);
const chatUser = ref<any>(null);
const messagesContainer = ref<any>(null);
const host = ref("");
onMounted(() => {
  host.value = "http://47.120.49.37:8082/";

  socket.initSocket();
  socket.socket.on("new_message", (data: any) => {
    // message.success(data.message);
    if (to_id.value == -1) {
      userList.value = userList.value.map((el) => {
        if (el.partner_id === data.from) {
          el.last_message = data.message;
          el.unread_count = el.unread_count + 1;
        }
        return el;
      });
    } else {
      if (to_id.value == chatUser.value.partner_id) {
        chat_messages.value.push({
          content: data.message,
          isUser: data.from_id === form_id.value,
          timestamp: new Date().getTime(),
        });
        nextTick(() => {
          messagesContainer.value.scrollTop =
            messagesContainer.value.scrollHeight;
        });
      } else {
        message.info("有新消息啦");
      }
    }
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
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const handleKick = (user: any) => {
  user.shake = true;
  setTimeout(() => {
    user.shake = false;
  }, 500);
};
const toChat = (user: any) => {
  console.log(user);
  user.active = true;
  chatUser.value = user;
  nextTick(() => {
    to_id.value = user.partner_id;
    chat_messages.value = [];
    // TODO: 获取聊天记录
    getUserChat(user.partner_id).then((res: any) => {
      chat_messages.value = res.data.map((el) => {
        return {
          ...el,
          isUser: el.from_id === form_id.value,
          timestamp: new Date(el.created_time).getTime(),
        };
      });
      toBottom();
    });
  });
};

const toBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      console.dir(messagesContainer.value);
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const initUser = async () => {
  getUserChatList().then((res) => {
    if (res.code === 0) {
      userList.value = res.data.map((el: any) => {
        return {
          ...el,
          shake: false,
          active: false,
          unread_count: 0,
        };
      });
    }
  });
};

const goBack = () => {
  chatUser.value = null;
  to_id.value = -1;
};

const getDays = (date: string) => {
  return date ? date.split("-")[1] + "-" + date.split("-")[2] : "";
};

const diasbledTextArea = computed(() => {
  return to_id.value === -1;
});

const sendMessage = () => {
  if (inputText.value.trim()) {
    const message_val = {
      toUserId: to_id.value,
      message: inputText.value,
    };
    socket.sendSocketMessage({ type: "private_message", val: message_val });
    nextTick(() => {
      chat_messages.value.push({
        content: inputText.value,
        isUser: true,
        timestamp: new Date().getTime(),
      });
      inputText.value = "";
      toBottom();
    });
  }
};

// const handleScroll = (e: any) => {
//   if (e.target.scrollTop === 0 && !loading.value && !noMore.value) {
//     loadMoreMessages();
//   }
// };

// const loadMoreMessages = () => {
//   loading.value = true;
//   setTimeout(() => {
//     const newMessages = Array.from({ length: 10 }, (_) => ({
//       from_id: form_id.value,
//       to_id: to_id.value,
//       content: messages.value,
//       created_time: new Date().toLocaleTimeString(),
//       updated_time: new Date().toLocaleTimeString(),
//     }));
//     messages.value = [...newMessages, ...messages.value];
//     loading.value = false;
//     if (messages.value.length >= 30) {
//       noMore.value = true;
//     }
//   }, 1000);
// };
onUnmounted(() => {
  // socket.value.disconnect();
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
  gap: 20px;
  margin-bottom: 15px;
}

.message-item.user-message {
  justify-content: flex-start;
  flex-direction: row-reverse;
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
  color: #000;
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

.avatar-container {
  width: 40px;
  height: 40px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px; /* 3D 透视效果 */
}

/* 头像图片样式 */
.avatar-container img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 2;
  transition: transform 0.5s ease, box-shadow 0.5s ease;
}

/* 鼠标悬停时触发动画 */
.avatar-container:hover img {
  cursor: pointer;
  transform: scale(1.1) rotateY(180deg); /* 3D 旋转 + 放大 */
  box-shadow: 0 0 20px rgba(255, 105, 180, 0.8),
    0 0 40px rgba(255, 105, 180, 0.6), 0 0 60px rgba(255, 105, 180, 0.4);
}

/* 边框动画 */
.avatar-container::before {
  content: "";
  position: absolute;
  width: 120%;
  height: 120%;
  border-radius: 50%;
  border: 4px solid transparent;
  border-top-color: #ff69b4;
  border-bottom-color: #00ffff;
  z-index: 1;
  animation: rotateBorder 3s linear infinite;
}

/* 粒子特效 */
.avatar-container::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 105, 180, 0.4),
    rgba(0, 255, 255, 0.4),
    transparent 70%
  );
  z-index: 0;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.avatar-container:hover::after {
  opacity: 1;
}

/* 边框旋转动画 */
@keyframes rotateBorder {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
