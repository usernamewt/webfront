<template>
  <div class="container-box">
    <a-form
      class="form-box"
      :model="formState"
      @finish="handleFinish"
      @finishFailed="handleFinishFailed"
    >
      <a-row :gutter="16" style="margin: 0">
        <a-col class="gutter-row" :span="20">
          <a-row :gutter="16">
            <a-col class="gutter-row" :span="6">
              <a-form-item label="角色名">
                <a-input v-model:value="formState.role_name" />
              </a-form-item>
            </a-col>
            <a-col class="gutter-row" :span="6">
              <a-form-item label="角色描述">
                <a-input v-model:value="formState.desc" />
              </a-form-item>
            </a-col>
            <a-col class="gutter-row" :span="6">
              <a-form-item label="角色状态">
                <a-select v-model:value="formState.state" @change="onChange">
                  <a-select-option :value="1">使用中</a-select-option>
                  <a-select-option :value="0">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col class="gutter-row" :span="6">
              <a-form-item label="创建时间">
                <a-date-picker
                  placeholder=""
                  v-model:value="formState.created_time"
                  value-format="YYYY-MM-DD"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-col>
        <a-col
          :span="4"
          style="
            display: flex;
            justify-content: flex-end;
            align-items: start;
            padding-bottom: 16px;
            padding: 0;
          "
        >
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
        </a-col>
      </a-row>
    </a-form>
    <div class="table-box" ref="tbBox">
      <div class="add-btn">
        <a-button
          type="primary"
          html-type="addUser"
          @click="showEditModal(null)"
        >
          新增
        </a-button>
      </div>
      <a-table
        :columns="roleColumns"
        :data-source="roleList"
        size="small"
        class="ant-table-striped"
        :scroll="{ y: baseScroll }"
        :row-class-name="
          (_record, index) => (index % 2 === 1 ? 'table-striped' : null)
        "
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'state'">
            <a-switch
              v-model:checked="record.state"
              size="small"
              @click="onChangeVal(record)"
            />
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <div class="btn-groups">
              <a-button
                size="small"
                @click="showEditModal(record)"
                type="link"
                :disabled="
                  record.id == 1 && getStorage('routerInfo').user.id != 1
                "
                >编辑</a-button
              >

              <a-popconfirm
                title="确定删除？"
                ok-text="是"
                cancel-text="否"
                @confirm="confirmDel(record)"
                @cancel="cancelDel"
              >
                <a-button size="small" type="link" :disabled="record.id == 1"
                  >删除</a-button
                >
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </div>
    <a-modal
      v-model:open="openModal"
      :title="roleForm.id ? '编辑' : '新增'"
      centered
      @ok="handleOk"
      @cancel="handleCancel"
      :okText="'确定'"
      :cancelText="'取消'"
    >
      <a-form
        :model="roleForm"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        ref="userFormRef"
        style="max-height: 40vh; height: 40vh; overflow-y: scroll"
      >
        <a-form-item
          label="角色名"
          name="role_name"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input
            v-model:value="roleForm.role_name"
            :rules="[{ required: true }]"
          />
        </a-form-item>
        <a-form-item label="角色描述" name="desc" :rules="[{ required: true }]">
          <a-input v-model:value="roleForm.desc" />
        </a-form-item>

        <a-form-item label="菜单">
          <a-tree
            v-model:expandedKeys="expandedKeys"
            v-model:selectedKeys="selectedKeys"
            v-model:checkedKeys="checkedKeys"
            checkable
            :tree-data="treeData"
          >
            <template #title="{ title, checked }">
              <span v-if="checked" style="color: #1890ff">{{ title }}</span>
              <template v-else>{{ title }}</template>
              <!-- <span style="color: #1890ff">{{ title }}</span> -->
            </template>
          </a-tree>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, h, nextTick } from "vue";
import { FormProps, Button, notification, message } from "ant-design-vue";
import api from "../../api/index";
import { filterEmptyValues } from "../../utils/tools";
import { getStorage } from "../../utils/storage";

const labelCol = { style: { width: "80px" } };
const treeData = ref<any[]>([]);
const wrapperCol = { span: 14 };
const baseScroll = ref(0);
const tbBox = ref();
onMounted(() => {
  search();
  getPermission();
  baseScroll.value = tbBox.value.offsetHeight - 180;
});
const formState = ref({
  role_name: "",
  state: "",
  desc: "",
  created_time: "",
});
const roleForm = ref({
  id: "",
  role_name: "",
  desc: "",
  state: "",
  created_time: "",
  permission_ids: "",
});
const userFormRef = ref();
const openModal = ref(false);
const roleList = ref<any[]>([]);
const selectedKeys = ref<string[]>([]);
const checkedKeys = ref<string[]>([]);
const expandedKeys = ref<string[]>([]);
const getPermission = async () => {
  let data = await api.permission.getAllPermission();
  if (data.code === 0) {
    treeData.value = data.data;
  }
};
const reset = () => {
  formState.value = {
    role_name: "",
    state: "",
    desc: "",
    created_time: "",
  };
  nextTick(() => {
    search();
  });
};
const search = async () => {
  let params = {
    role_name: formState.value.role_name,
    desc: formState.value.desc,
    state: formState.value.state,
    created_time: formState.value.created_time,
    pageSize: 10,
    currentPage: 1,
  };
  let reqParam = filterEmptyValues(params);
  let data = await api.role.getRoleByPage(reqParam);
  roleList.value = data.data.rows.map((el: any) => {
    return {
      ...el,
      state: el.state === 1 ? true : false,
    };
  });
};
const handleCancel = () => {
  roleForm.value = {
    id: "",
    state: "",
    role_name: "",
    desc: "",
    created_time: "",
  };
  openModal.value = false;
};
const handleOk = () => {
  userFormRef.value.validate().then(() => {
    let params: any = { ...roleForm.value };
    params.permission_ids = checkedKeys.value.join(",");
    console.log(params);
    if (!roleForm.value.id) {
      // 新增
      const reqparam = filterEmptyValues(params);
      api.role.addRole(reqparam).then((res) => {
        if (res.code === 0) {
          message.success(res.msg);
          openModal.value = false;
          handleCancel();
          search();
        } else {
          message.error(res.msg);
        }
      });
    } else {
      // 编辑
      params["id"] = roleForm.value.id;
      const reqparam = filterEmptyValues(params);
      api.role.editRole(reqparam).then((res) => {
        if (res.code === 0) {
          message.success(res.msg);
          openModal.value = false;
          handleCancel();
          search();
        } else {
          message.error(res.msg);
        }
      });
    }
  });
};

const confirmDel = (record: any) => {
  deleteUser({ id: record.id }).then((res) => {
    if (res.code === 0) {
      message.success(res.msg);
      search();
    } else {
      message.error(res.msg);
    }
  });
};
const cancelDel = () => {
  message.info("取消删除");
};

const showEditModal = (record: any) => {
  console.log(record);
  if (record) {
    roleForm.value = {
      ...record,
    };
    checkedKeys.value = record.permission_ids.split(",").map(Number);
    expandedKeys.value = [];
    // selectedKeys.value = record.permission_ids.split(",").map(Number);
  } else {
    roleForm.value = {
      id: "",
      state: "",
      role_name: "",
      desc: "",
      created_time: "",
      permission_ids: "",
    };
    checkedKeys.value = [];
    expandedKeys.value = [];
  }

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
    api.role.editRoleState({ id: record.id, state: 1 }).then((res) => {
      if (res.code === 0) {
        message.success(res.msg);
        record.state = true;
        notification.close(key);
      } else {
        message.error(res.msg);
      }
    });
  }
  record.state = true;
  const key = `open${Date.now()}`;
  notification.warning({
    message: "修改状态",
    description: "确定要修改角色状态吗？修改后，该角色将失效，请谨慎操作！",
    btn: () =>
      h(
        Button,
        {
          type: "primary",
          size: "small",
          onClick: () => {
            api.role.editRoleState({ id: record.id, state: 0 }).then((res) => {
              if (res.code === 0) {
                message.success(res.msg);
                record.state = false;
                notification.close(key);
              } else {
                message.error(res.msg);
              }
            });
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

const roleColumns = ref([
  {
    title: "角色名",
    dataIndex: "role_name",
    key: "role_name",
    align: "center",
  },
  {
    title: "角色描述",
    dataIndex: "desc",
    key: "desc",
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
    width: 90,
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
.table-box {
  height: calc(100vh - 200px);
  background-color: #fff;
  border-radius: 12px;
  padding: 12px;
  .add-btn {
    margin-bottom: 12px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
