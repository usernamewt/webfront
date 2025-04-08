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
        :columns="classifyColumns"
        :data-source="roleList"
        size="small"
        class="ant-table-striped"
        :scroll="{ y: baseScroll }"
        :row-class-name="
          (_record, index) => (index % 2 === 1 ? 'table-striped' : null)
        "
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'state'">
            <a-switch
              v-model:checked="record.state"
              size="small"
              @click="onChangeVal(record)"
            />
          </template>

          <template v-if="column.dataIndex === 'cate_img'">
            <img
              :src="record.cate_img"
              alt=""
              style="width: 50px; height: 50px"
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
      :title="clasForm.id ? '编辑' : '新增'"
      centered
      @ok="handleOk"
      @cancel="handleCancel"
      :okText="'确定'"
      :cancelText="'取消'"
    >
      <a-form
        :model="clasForm"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        ref="userFormRef"
        style="max-height: 40vh; height: 40vh; overflow-y: scroll"
      >
        <a-form-item
          label="分类名称"
          name="cate_name"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input
            v-model:value="clasForm.cate_name"
            :rules="[{ required: true }]"
          />
        </a-form-item>

        <a-form-item label="分类图片">
          <uploadSingle
            ref="aUpload"
            :box-width="'100%'"
            :def-avater="clasForm?.cate_img"
            @upload="handelImgAvatar"
          />
        </a-form-item>

        <a-form-item label="分类排序" name="sort" :rules="[{ required: true }]">
          <a-input v-model:value="clasForm.sort" />
        </a-form-item>
        <a-form-item
          label="分类状态"
          name="state"
          :rules="[{ required: true }]"
        >
          <a-switch v-model:checked="clasForm.state" size="small" />
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
type clas = {
  id?: number;
  cate_name: string;
  cate_img: string;
  sort: number;
  created_time?: string;
  updated_time?: string;
  state: boolean;
};
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
const clasForm = ref<clas>({
  id: 0,
  cate_name: "",
  cate_img: "",
  sort: 0,
  created_time: "",
  updated_time: "",
  state: true,
});
const userFormRef = ref();
const openModal = ref(false);
const roleList = ref<any[]>([]);
const checkedKeys = ref<string[]>([]);
const expandedKeys = ref<string[]>([]);
const handelImgAvatar = (val: any) => {
  clasForm.value.cate_img = val;
};
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
  let data = await api.classification.getClassifitionList();
  roleList.value = data.data.rows.map((el: any) => {
    return {
      ...el,
      state: el.state === 1 ? true : false,
    };
  });
};
const handleCancel = () => {
  clasForm.value = {
    cate_name: "",
    cate_img: "",
    sort: 0,
    state: true,
  };
  openModal.value = false;
};
const handleOk = () => {
  userFormRef.value.validate().then(() => {
    let params: any = { ...clasForm.value };
    console.log(params);
    if (!clasForm.value.id) {
      // 新增
      const reqparam = filterEmptyValues(params);
      api.classification.addClassifition(reqparam).then((res) => {
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
      params["id"] = clasForm.value.id;
      const reqparam = filterEmptyValues(params);
      api.classification.updateClassifition(reqparam).then((res) => {
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
    clasForm.value = {
      ...record,
    };
    // selectedKeys.value = record.permission_ids.split(",").map(Number);
  } else {
    clasForm.value = {
      cate_name: "",
      cate_img: "",
      sort: 0,
      state: true,
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

const classifyColumns = ref([
  {
    title: "分类名称",
    dataIndex: "cate_name",
    key: "cate_name",
    align: "center",
  },
  {
    title: "分类图片",
    dataIndex: "cate_img",
    key: "cate_img",
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
    title: "更新时间",
    dataIndex: "updated_time",
    key: "updated_time",
    ellipsis: true,
    align: "center",
  },
  {
    title: "状态",
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
