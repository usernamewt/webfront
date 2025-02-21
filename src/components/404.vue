<template>
  <a-result status="404" title="404" sub-title="页面404">
    <template #extra>
      <a-button type="primary" @click="toList">返回首页</a-button>
    </template>
  </a-result>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";

const router = useRouter();
const toList = () => {
  router.push("/");
};
</script>

<style scoped></style>
