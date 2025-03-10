<template>
  <div class="container-box">
    <a-form
      layout="inline"
      :model="formState"
      @finish="handleFinish"
      @finishFailed="handleFinishFailed"
    >
      <a-form-item>
        <a-input v-model:value="formState.nickname" placeholder="昵称" />
      </a-form-item>
      <a-form-item>
        <a-select
          v-model:value="formState.state"
          @change="onChange"
          placeholder="状态"
        >
          <a-select-option :value="1">使用中</a-select-option>
          <a-select-option :value="0">禁用</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-select
          v-model:value="formState.role"
          @change="onChange"
          placeholder="角色"
        >
          <a-select-option :value="1">使用中</a-select-option>
          <a-select-option :value="0">禁用</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-input v-model:value="formState.mobile" placeholder="手机号" />
      </a-form-item>
      <a-form-item>
        <a-date-picker
          v-model:value="formState.created_time"
          value-format="YYYY-MM-DD"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="margin-right: 20px">
          查询
        </a-button>
        <a-button type="primary" html-type="reset"> 重置 </a-button>
      </a-form-item>
    </a-form>

    <a-table :columns="userColumns" :data-source="userTable">
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name'">
          <a>{{ text }}</a>
        </template>
        <template v-if="column.dataIndex === 'state'">
          <!-- {{ record }} -->

          <a-switch
            v-model:checked="record.state"
            @click="onChangeVal(record)"
          />
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <a @click="showEditModal(record)">修改</a>
            <a-popconfirm
              title="确定删除？"
              ok-text="是"
              cancel-text="否"
              @confirm="confirmDel"
              @cancel="cancelDel"
            >
              <a href="#">删除</a>
            </a-popconfirm>
            <a-dropdown>
              <a class="ant-dropdown-link" @click.prevent>
                更多<DownOutlined />
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <a href="javascript:;">重置密码</a>
                  </a-menu-item>
                  <a-menu-item>
                    <a href="javascript:;">分配角色</a>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </template>
      </template>
    </a-table>
    <a-modal v-model:open="openModal" :title="'编辑'" @ok="handleOk"> </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref, h, nextTick } from "vue";
import type { UnwrapRef } from "vue";
import { FormProps, Button, notification, message } from "ant-design-vue";
import { DownOutlined } from "@ant-design/icons-vue";
import { getAllUser } from "../../api/user";
onMounted(() => {
  search();
});
interface FormState {
  nickname: string;
  state: string;
  mobile: string;
  created_time: string;
  role: string;
}
interface User {
  nickname: string;
  password: string;
  username: string;
  mobile: string;
  state: number;
  role: string;
  id?: number;
}
const userForm = ref<User>({
  nickname: "",
  password: "",
  username: "",
  mobile: "",
  state: 1,
  role: "",
});
const formState: UnwrapRef<FormState> = reactive({
  nickname: "",
  state: "",
  mobile: "",
  created_time: "",
  role: "",
});

const openModal = ref(false);
const search = async () => {
  let data = await getAllUser({
    nickname: formState.nickname,
    pageSize: 10,
    currentPage: 1,
  });

  userTable.value = data.data.rows.map((el) => {
    return {
      key: el.id,
      username: el.username,
      nickname: el.nickname,
      mobile: el.mobile,
      state: el.state === 1 ? true : false,
      role: el.role,
    };
  });
  console.log(userTable.value);
};

const handleOk = () => {};

const confirmDel = () => {};
const cancelDel = () => {
  message.info("取消删除");
};

const showEditModal = (record: any) => {
  userForm.value = {
    ...record,
  };
  nextTick(() => {
    openModal.value = true;
  });
};
const handleFinish: FormProps["onFinish"] = (values) => {
  console.log(values, formState);
};
const handleFinishFailed: FormProps["onFinishFailed"] = (errors) => {
  console.log(errors);
};

const onChange = (value: string) => {
  console.log(`selected ${value}`);
};

const onChangeVal = (record: any) => {
  if (record.state) {
    return;
  }
  record.state = true;
  const key = `open${Date.now()}`;
  notification.warning({
    message: "修改状态",
    description:
      "确定要修改用户状态吗？修改后，该用户将无法登录系统，请谨慎操作！",
    btn: () =>
      h(
        Button,
        {
          type: "primary",
          size: "small",
          onClick: () => {
            record.state = false;
            notification.close(key);
          },
        },
        { default: () => "确定" }
      ),
    key,
    onClose: () => {
      record.state = true;
    },
  });
};

const userColumns = ref([
  {
    title: "用户名",
    dataIndex: "username",
    key: "username",
    align: "center",
  },
  {
    title: "昵称",
    dataIndex: "nickname",
    key: "nickname",
    ellipsis: true,
    align: "center",
  },
  {
    title: "手机号",
    dataIndex: "mobile",
    key: "mobile",
    ellipsis: true,
    align: "center",
  },
  {
    title: "状态",
    dataIndex: "state",
    key: "state",
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
const userTable = ref<any[]>([]);
</script>

<style scoped lang="less"></style>
