<template>
  <div class="container-box">
    <a-form layout="inline" :model="formState">
      <a-form-item label="菜单名称">
        <a-input v-model:value="formState.menuname" />
      </a-form-item>
      <a-form-item label="状态">
        <a-select v-model:value="formState.state" style="width: 200px">
          <a-select-option :value="1">使用中</a-select-option>
          <a-select-option :value="0">禁用</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          style="margin-right: 20px"
          @click="search"
        >
          查询
        </a-button>
        <a-button type="primary" html-type="reset" @click="reset">
          重置
        </a-button>
      </a-form-item>
    </a-form>
    <a-table :columns="menuColumns" :data-source="menuData" />
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, h, nextTick } from "vue";
import api from "../../api/index";
import { filterEmptyValues } from "../../utils/tools";
import { stat } from "fs";

const menuData = ref<any[]>([]);
const formState = ref({
  menuname: "",
  state: undefined,
});
onMounted(() => {
  search();
});

const rowSelection = ref({});
const search = async () => {
  let data = await api.permission.getAllPermission();
  menuData.value = data.data;
};
const reset = () => {
  formState.value = {
    menuname: "",
    state: undefined,
  };
  search();
};
const menuColumns = ref([
  {
    title: "菜单名称",
    dataIndex: "title",
    key: "title",
    align: "center",
  },
  {
    title: "图标",
    dataIndex: "icon",
    key: "icon",
    ellipsis: true,
    align: "center",
  },
  {
    title: "菜单路径",
    dataIndex: "component",
    key: "component",
    ellipsis: true,
    align: "center",
  },
  {
    title: "权限标识",
    dataIndex: "index",
    key: "index",
    ellipsis: true,
    align: "center",
  },
  {
    title: "排序",
    dataIndex: "sort",
    key: "sort",
    ellipsis: true,
    align: "center",
  },
  {
    title: "创建时间",
    dataIndex: "created_time",
    key: "created_time",
    ellipsis: true,
    align: "center",
  },
  {
    title: "操作",
    dataIndex: "operation",
    key: "operation",
    ellipsis: true,
    align: "center",
    width: 140,
  },
]);
</script>

<style scoped lang="less">
.btn-groups {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .ant-btn {
    padding: 0;
  }
}
</style>
