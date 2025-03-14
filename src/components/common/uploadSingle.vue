<template>
  <a-upload-dragger
    style="width: 302px"
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
      <inbox-outlined v-if="furl == ''"></inbox-outlined>
      <img v-else :src="furl" alt="" :width="props.width" />
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
  </a-upload-dragger>
</template>
<script setup lang="ts">
import { InboxOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import type { UploadChangeParam } from "ant-design-vue";
import { onUnmounted, ref, watch } from "vue";
const furl = ref("");

const props = defineProps({
  width: {
    type: Number,
    default: 200,
  },
  defAvater: {
    type: String,
    default: "",
  },
});
watch(
  () => props.defAvater,
  (val?: string) => {
    console.log("监听到img");

    if (val) {
      if (val.indexOf("http") === -1) {
        furl.value = "http://47.120.49.37:8082/" + val;
      } else {
        furl.value = val;
      }
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
    furl.value = info.fileList[0].response.url;

    emits("upload", furl.value);
  } else if (status === "error") {
    message.error(`${info.file.name}  上传失败`);
  }
};
function handleDrop(e: DragEvent) {
  console.log(e);
}
onUnmounted(() => {
  furl.value = "";
  fileList.value = [];
});
const reset = () => {
  furl.value = "";
  fileList.value = [];
};

defineExpose({
  reset,
});
</script>
<style lang="less" scoped></style>
