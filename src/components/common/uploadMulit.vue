<template>
  <a-upload-dragger
    :style="{ width: props.boxWidth }"
    :before-upload="beforeUpload"
    :max-count="1"
    v-model:fileList="fileList"
    name="file"
    :multiple="true"
    action="http://47.120.49.37:8082/api/upload"
    crossOrigin="anonymous"
    @change="handleChange"
    @drop="handleDrop"
    :headers="{ 'X-Requested-With': null }"
  >
    <p
      class="ant-upload-drag-icon"
      style="display: flex; justify-content: center"
    >
      <inbox-outlined v-if="furl.length==0"></inbox-outlined>
      <div v-else :style="{width:props.boxWidth}" class="img-box-container">
        <div class="img-box" v-for="item in furl" :key="item" :style="{ backgroundImage: `url(${item})`,height:'90px',width:'150px' }">
            <div class="img-operation">
                <EyeOutlined style="margin-right: 10px;" class="img-operation-item" @click.stop="previewItem(item)"/>
                <DeleteOutlined class="img-operation-item" @click.stop="deleteItem(item)"/>
            </div>
        </div>
      </div>
    </p>
    <p
    
      class="ant-upload-text"
      style="
        color: #999;
        font-size: 12px;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 10px;
        margin: auto;
      "
    >
      拖拽或点击上传
    </p>
    <a-modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </a-upload-dragger>
</template>
<script setup lang="ts">
import { InboxOutlined,EyeOutlined,DeleteOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import type { UploadChangeParam } from "ant-design-vue";
import { onUnmounted, ref, watch } from "vue";
const furl = ref([]);
const previewVisible = ref(false);
const previewImage = ref("");
const previewTitle = ref("图片预览");
const handleCancel = () => {
  previewVisible.value = false;
};
const props = defineProps({
  boxWidth: {
    type: String,
    default: "302px",
  },
  width: {
    type: Number,
    default: 200,
  },
  defAvater: {
    type: Array,
    default: [],
  },
});
watch(
  () => props.defAvater,
  (val?: any[]) => {
    console.log("监听到img");

    if (val) {
        furl.value = val;
    }
  },
  { deep: true, immediate: true }
);
const fileList = ref<any[]>([]);
const emits = defineEmits(["upload"]);
const beforeUpload = (file: any) => {
  const isJpgOrPng =
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/jpg";
  if (!isJpgOrPng) {
    message.error("只能上传jpeg/png/jpg!");
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("图片大小必须小于2MB!");
    return false;
  }
};
const handleChange = async (info: UploadChangeParam) => {
  const status = info.file.status;
  if (status !== "uploading") {
  }
  if (status === "done") {
    message.success(`${info.file.name}  上传成功`);
    furl.value.push(info.fileList[0].response.url);
    emits("upload", furl.value);
  } else if (status === "error") {
    message.error(`${info.file.name}  上传失败`);
  }
};
const previewItem = (url: string) => {
  previewImage.value = url;
  previewVisible.value = true;
};
const deleteItem = (url: string) => {
  furl.value = furl.value.filter((item) => item !== url);
  emits("upload", furl.value);
}
function handleDrop(e: DragEvent) {
  console.log(e);
}
onUnmounted(() => {
  furl.value = [];
  fileList.value = [];
});
const reset = () => {
  furl.value = [];
  fileList.value = [];
};

defineExpose({
  reset,
});
</script>
<style lang="less" scoped>
.img-box-container {
    padding: 10px;display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 10px;
    .img-box {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    .img-operation {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        font-size: 10px;
        align-items: center;
        justify-content: center;
        width: 100%;justify-content: center;
        height: 100%;
        .img-operation-item {
            cursor: pointer;
            font-size: 16px !important;
            color: #fff !important;
            &:hover {
                color: #1890ff !important;
            }
        }
    }
    &:hover {
        .img-operation {
            display: flex;
        }
    }
}
}

</style>
