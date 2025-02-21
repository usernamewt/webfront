<template>
  <a-result status="500" title="500" sub-title="服务器错误，请稍后再试">
    <template #extra>
      <a-button type="primary" @click="toList">返回首页</a-button>
    </template>
  </a-result>
</template>

<script lang="ts" setup>
const toList = () => {
  window.location.href = "/";
};
</script>

<style scoped></style>
