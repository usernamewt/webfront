<template>
  <a-layout style="border-radius: 10px; overflow: hidden">
    <a-layout-sider width="300" style="background: #fff; border-radius: 10px">
      <a-list :dataSource="chatList">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta
              :title="item.name"
              :description="item.lastMessage"
            />
            <div>{{ item.time }}</div>
          </a-list-item>
        </template>
      </a-list>
    </a-layout-sider>

    <a-layout>
      <a-layout-content style="padding: 24px">
        <div class="chat-container">
          <div class="chat-messages" ref="messagesRef" @scroll="handleScroll">
            <a-spin v-if="loading" />
            <div v-if="noMore" class="no-more">已经到顶啦</div>
            <div v-for="message in messages" :key="message.id" class="message">
              <div class="message-content">
                <div class="message-text">{{ message.text }}</div>
                <div class="message-time">{{ message.time }}</div>
              </div>
            </div>
          </div>

          <div class="chat-toolbar">
            <a-button @click="handleEmoji">😀</a-button>
            <a-button @click="handleImage">图片</a-button>
            <a-button @click="handleVideo">视频</a-button>
          </div>

          <a-textarea
            v-model:value="inputText"
            placeholder="输入消息..."
            :autoSize="{ minRows: 2, maxRows: 6 }"
            @pressEnter="sendMessage"
          />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import io from "socket.io-client";
import { getToken } from "../../utils/auth";
import { getUserMenu } from "../../api/user";
let socket = ref<any>(null);
const chatList = ref([
  {
    id: 1,
    name: "用户1",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    lastMessage: "你好！",
    time: "2023-10-01",
  },
  // ... 更多聊天列表数据
]);

const messages = ref<any[]>([]);
const inputText = ref("");
const loading = ref(false);
const noMore = ref(false);
const messagesRef = ref(null);

onMounted(() => {
  socket.value = io(`ws://localhost:3000?atoy=${getToken()}`);
  let token = getToken();
  socket.value.emit("authentication", { token });
  //   messages.value = mockMessages.reverse();
  socket.value.on("message", (message: string) => {
    console.log("=============");
    console.log("收到消息", message);
    messages.value.push(message);
  });
  socket.value.on("connection", () => {
    console.log("连接成功");
  });
  socket.value.on("disconnect", () => {
    console.log("断开连接");
  });

  initRouter();
});

const initRouter = async () => {};

const sendMessage = () => {
  if (inputText.value.trim()) {
    const message = {
      id: Date.now(),
      text: inputText.value,
      time: new Date().toLocaleTimeString(),
    };
    socket.value.emit("message", message);
    inputText.value = "";
  }
};

const handleScroll = (e) => {
  if (e.target.scrollTop === 0 && !loading.value && !noMore.value) {
    loadMoreMessages();
  }
};

const loadMoreMessages = () => {
  loading.value = true;
  setTimeout(() => {
    const newMessages = Array.from({ length: 10 }, (_, i) => ({
      id: messages.value.length + i + 1,
      text: `历史消息 ${messages.value.length + i + 1}`,
      time: new Date().toLocaleTimeString(),
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

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 80vh;
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
</style>
