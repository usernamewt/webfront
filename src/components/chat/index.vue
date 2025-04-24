<template>
  <div v-if="to_id == -1" class="chat-list-container">
    <a-card
      v-for="user in userList"
      :key="user.id"
      @click.stop="toChat(user)"
      hoverable
      :class="`${user.shake ? 'shake' : ''}`"
    >
      <template #cover>
        <img
          v-lazypng="user.partner_bgavatar"
          width="300"
          height="200"
          style="object-fit: cover"
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
          <img
            style="border-radius: 50%"
            v-lazypng="user.partner_avatar"
            width="30"
            height="30"
          />
          <!-- <a-avatar :src="" /> -->
        </template>
      </a-card-meta>
    </a-card>
  </div>

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
    <div
      class="chat-messages"
      ref="messagesContainer"
      :style="{ backgroundImage: `url(${chatUser.partner_bgavatar})` }"
    >
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
                ? `${getStorage('routerInfo').user.avatar}`
                : `${chatUser.partner_avatar}`
            "
          />
        </div>
        <div class="message-bubble">
          <div class="message-content">
            {{ message.content }}
          </div>
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
const form_id = ref(1);
const to_id = ref(-1);
const chatUser = ref<any>(null);
const messagesContainer = ref<any>(null);
const host = ref("");
onMounted(() => {
  host.value = import.meta.env.BASE_URL;
  socket.initSocket();
  // 移除可能存在的旧监听器
  socket.socket.off("new_message");
  // 添加新的监听器
  socket.socket.on("new_message", (data: any) => {
    // 添加消息去重逻辑
    const messageId = data.id || `${data.from}_${data.timestamp}`;
    const isDuplicate = chat_messages.value.some(
      (msg) =>
        msg.id === messageId ||
        (msg.content === data.message && msg.timestamp === data.timestamp)
    );

    if (isDuplicate) return;

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
          id: messageId,
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
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const toChat = (user: any) => {
  console.log(user);
  user.active = true;
  chatUser.value = user;
  nextTick(() => {
    to_id.value = user.partner_id;
    chat_messages.value = [];
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

const handleKick = (user: any) => {
  user.shake = true;
  setTimeout(() => {
    user.shake = false;
  }, 500);
};

onUnmounted(() => {
  // 清理事件监听器
  socket.socket.off("new_message");
});
</script>

<style scoped lang="less">
// 聊天列表容器
.chat-list-container {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

// 桌面端适配
@media screen and (min-width: 768px) {
  .chat-list-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

// 平板端适配
@media screen and (min-width: 576px) and (max-width: 767px) {
  .chat-list-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

// 移动端适配
@media screen and (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }

  .toolbar {
    padding: 8px;
  }

  .input-area {
    padding: 10px;
  }

  .send-btn {
    width: 80px;
    right: 10px;
    bottom: 10px;
  }
}

// 用户列表样式
.user-item {
  transition: all 0.3s ease;
  &:hover {
    background-color: #237eff;
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(35, 126, 255, 0.2);
  }
  .message-time {
    color: #999;
  }
}

// 聊天容器样式
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 90px);
  background: linear-gradient(135deg, #f6f9fc 0%, #e9f2f9 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

// 聊天消息区域
.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.8);
}

// 消息气泡样式
.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease;

  // 对方的消息
  &:not(.user-message) {
    justify-content: flex-start;

    .message-bubble {
      background: #fff;
      color: #333;
      border-top-left-radius: 4px;

      .message-time {
        color: #999;
      }
    }
  }

  // 自己的消息
  &.user-message {
    justify-content: flex-end;

    .message-bubble {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: #fff;
      border-top-right-radius: 4px;

      .message-time {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .message-content {
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
  }

  .message-time {
    font-size: 12px;
    margin-top: 4px;
    text-align: right;
  }
}

.avatar-container {
  width: 40px;
  height: 40px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    position: relative;
    z-index: 2;
    transition: all 0.5s ease;
    border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: scale(1.1) rotateY(180deg);
      box-shadow: 0 0 20px rgba(79, 172, 254, 0.8);
    }
  }

  &::before {
    content: "";
    position: absolute;
    width: 120%;
    height: 120%;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: #4facfe;
    border-bottom-color: #00f2fe;
    z-index: 1;
    animation: rotateBorder 3s linear infinite;
  }
}

// 工具栏样式
.toolbar {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 12px;
  backdrop-filter: blur(10px);

  .ant-btn {
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
      background: rgba(79, 172, 254, 0.1);
    }
  }
}

// 输入区域样式
.input-area {
  position: relative;
  width: 100%;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);

  .ant-input {
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 12px;
    transition: all 0.3s ease;

    &:focus {
      border-color: #4facfe;
      box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
    }
  }
}

.send-btn {
  margin-top: 10px;
  width: 100px;
  position: absolute;
  right: 24px;
  bottom: 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
  }
}

// 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotateBorder {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 滚动条样式
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(79, 172, 254, 0.5);
  border-radius: 3px;

  &:hover {
    background: rgba(79, 172, 254, 0.8);
  }
}

// 聊天头部样式
.chat-header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 16px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;

  .header-content {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 20px;
    margin: 0 auto;
  }

  .back-btn {
    margin-right: 20px;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.2);
    border: none;

    &:hover {
      transform: translateX(-3px);
      background: rgba(255, 255, 255, 0.3);
    }
  }

  .chat-info {
    line-height: 1.4;
  }

  .chat-title {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 1px;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .participants {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);

    .me {
      color: #fff;
      font-weight: 500;
    }

    .target {
      color: #fff;
      font-weight: 500;
    }
  }
}

// 踢中动画
@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px) rotate(-5deg);
  }
  50% {
    transform: translateX(10px) rotate(5deg);
  }
  75% {
    transform: translateX(-10px) rotate(-5deg);
  }
  100% {
    transform: translateX(0);
  }
}

.shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
</style>
