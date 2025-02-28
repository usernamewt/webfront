<template>
  <a-layout style="border-radius: 10px; overflow: hidden; height: 100%">
    <a-layout-sider width="300" style="background: #fff; border-radius: 10px">
      <a-list :dataSource="userList">
        <template #renderItem="{ item }">
          <a-list-item
            @click="handleClick(item)"
            style="cursor: pointer"
            class="user-item"
            :class="{ active: item.active ? 'active' : '' }"
          >
            <a-skeleton avatar :title="false" :loading="!!item.loading" active>
              <a-list-item-meta :description="item.last_message">
                <template #title>
                  <span class="message-nickname">{{
                    item.partner_nickname
                  }}</span>
                </template>
                <template #avatar>
                  <a-avatar
                    style="background-color: #fff"
                    :src="'http://localhost:3000/' + item.partner_avatar"
                  />
                </template>
              </a-list-item-meta>
              <div style="font-size: 12px" class="message-time">
                {{ getDays(item.last_message_time) }}
              </div>
            </a-skeleton>
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
            <!-- <a-button @click="handleEmoji">😀</a-button>
            <a-button @click="handleImage">图片</a-button>
            <a-button @click="handleVideo">视频</a-button> -->
          </div>

          <a-textarea
            :disabled="diasbledTextArea"
            v-model:value="inputText"
            placeholder="输入消息..."
            :autoSize="{ minRows: 8, maxRows: 10 }"
            @pressEnter="sendMessage"
          />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import io from "socket.io-client";
import { getToken } from "../../utils/auth";
import { getUserChatList, getUserChat } from "../../api/user";
import { message } from "ant-design-vue";
import { getStorage } from "../../utils/storage";
let socket = ref<any>(null);
const userList = ref<any[]>([]);
const messages = ref<any[]>([]);
const inputText = ref("");
const loading = ref(false);
const noMore = ref(false);
const messagesRef = ref(null);
const form_id = ref(1);
const to_id = ref(-1);

onMounted(() => {
  socket.value = io(`ws://localhost:3000?atoy=${getToken()}`);
  let token = getToken();
  socket.value.emit("authentication", { token });
  form_id.value = getStorage("routerInfo").user.id;
  socket.value.on("message", (messages: any) => {
    if (messages.code === 0) {
      messages.value.push(message);
    } else {
      message.error(messages.msg);
    }
  });

  socket.value.on("user_message", (message: any) => {
    console.log("收到用户消息", message);
    messages.value.push(message);
  });
  socket.value.on("connection", () => {
    console.log("连接成功");
  });
  socket.value.on("disconnect", () => {
    console.log("断开连接");
  });

  initUser();
});

const initUser = async () => {
  getUserChatList().then((res) => {
    if (res.code === 0) {
      userList.value = res.data.map((el: any) => {
        return {
          ...el,
          active: false,
        };
      });
    }
  });
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
  });
  // TODO: 获取聊天记录
  getUserChat(item.partner_id).then((res: any) => {
    console.log(res);
  });
};

const sendMessage = () => {
  if (inputText.value.trim()) {
    const message = {
      from_id: form_id.value,
      to_id: to_id.value,
      content: inputText.value,
      created_time: new Date().toLocaleTimeString(),
      updated_time: new Date().toLocaleTimeString(),
    };
    socket.value.emit("user_message", message);
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

.active {
  background-color: #237eff;
  color: #fff;
  .message-time {
    color: #fff;
  }
}

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
