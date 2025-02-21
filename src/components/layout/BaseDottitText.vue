<template>
  <div class="dottit-text">
    <span class="dottit" :style="{ backgroundColor: props.color }"></span>
    <span style="color: #1c1e20">{{ props.text }}</span>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  color: {
    type: String,
    default: "#237EFF",
  },
  text: {
    type: String,
    default: "默认",
  },
});
</script>

<style lang="less" scoped>
.dottit-text {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .dottit {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 7px;
  }
}
</style>
