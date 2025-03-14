<template>
  <div class="container-box">
    <a-form
      layout="inline"
      :model="formState"
      @finish="handleFinish"
      @finishFailed="handleFinishFailed"
    >
      <a-form-item label="昵称">
        <a-input v-model:value="formState.nickname" />
      </a-form-item>
      <a-form-item label="手机号">
        <a-input v-model:value="formState.mobile" />
      </a-form-item>
      <a-form-item label="状态">
        <a-select
          v-model:value="formState.state"
          @change="onChange"
          style="width: 200px"
        >
          <a-select-option :value="1">使用中</a-select-option>
          <a-select-option :value="0">禁用</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="创建时间">
        <a-date-picker
          placeholder=""
          style="width: 200px"
          v-model:value="formState.created_time"
          value-format="YYYY-MM-DD"
        />
      </a-form-item>
      <a-form-item>
        <a-button
          type="primary"
          html-type="addUser"
          @click="showEditModal(null)"
          style="margin-right: 20px"
        >
          新增
        </a-button>
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

    <a-table
      :columns="userColumns"
      :data-source="userTable"
      size="small"
      class="ant-table-striped"
      :row-class-name="
        (_record, index) => (index % 2 === 1 ? 'table-striped' : null)
      "
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name'">
          <a>{{ text }}</a>
        </template>
        <template v-if="column.dataIndex === 'state'">
          <!-- {{ record }} -->

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
              >修改</a-button
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
            <a-button
              size="small"
              style="padding: 0"
              type="link"
              @click="handelReset(record)"
              :disabled="
                record.id == 1 && getStorage('routerInfo').user.id != 1
              "
              >重置密码</a-button
            >
          </div>
        </template>
      </template>
    </a-table>
    <a-modal
      v-model:open="openModal"
      :title="userForm.id ? '编辑' : '新增'"
      centered
      @ok="handleOk"
      @cancel="handleCancel"
      :okText="'确定'"
      :cancelText="'取消'"
    >
      <a-form
        :model="userForm"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        ref="userFormRef"
      >
        <a-form-item
          label="用户名"
          v-if="!userForm.id"
          name="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input
            v-model:value="userForm.username"
            :rules="[{ required: true }]"
          />
        </a-form-item>
        <a-form-item
          label="密码"
          v-if="!userForm.id"
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password v-model:value="userForm.password" />
        </a-form-item>
        <a-form-item
          label="确认密码"
          v-if="!userForm.id"
          name="cpassword"
          :rules="[{ validator: validatePass }, { required: true }]"
        >
          <a-input-password v-model:value="userForm.cpassword" />
        </a-form-item>
        <a-form-item
          label="昵称"
          name="nickname"
          :rules="[{ required: true, message: '请输入昵称' }]"
        >
          <a-input
            v-model:value="userForm.nickname"
            :rules="[{ required: true }]"
          />
        </a-form-item>
        <a-form-item
          label="手机号"
          name="mobile"
          :rules="[{ required: true, message: '请输入手机号' }]"
        >
          <a-input v-model:value="userForm.mobile" />
        </a-form-item>
        <a-form-item
          label="角色"
          name="role"
          :rules="[{ required: true, message: '请选择角色' }]"
        >
          <a-select
            v-model:value="userForm.role"
            @change="onChange"
            style="width: 200px"
          >
            <a-select-option
              v-for="item in roleList"
              :key="item.id"
              :value="item.id"
              >{{ item.role_name }}</a-select-option
            >
          </a-select>
        </a-form-item>
        <a-form-item label="头像" v-if="!userForm.id">
          <uploadSingle ref="aUpload" @upload="handelImgAvatar" />
        </a-form-item>
        <a-form-item label="背景图">
          <uploadSingle
            :def-avater="userForm?.bgavatar"
            ref="bUpload"
            @upload="handelImg"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 重置密码 -->
    <a-modal
      v-model:open="resetPwd"
      centered
      :title="`请输入${currentRow?.username}的新密码`"
      @ok="handelResetPwd"
      @cancel="cancelResetPwd"
      :okText="'确定'"
      :cancelText="'取消'"
    >
      <a-form
        :model="userForm"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        size="small"
      >
        <a-form-item label="请输入密码" name="password">
          <a-input
            v-model:value="currentpwd"
            :rules="[{ required: true, message: '请输入密码' }]"
            @keypress.enter="handelResetPwd"
          />
        </a-form-item>
        <a-form-item label="请输入密码" name="cpassword">
          <a-input
            v-model:value="currentpwd"
            name="cpassword"
            :rules="[{ validator: validatePass }, { required: true }]"
            @keypress.enter="handelResetPwd"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref, h, nextTick } from "vue";
import type { UnwrapRef } from "vue";
import { FormProps, Button, notification, message } from "ant-design-vue";
import {
  getAllUser,
  getAllRole,
  updatePassword,
  updateUser,
  deleteUser,
  addUser,
} from "../../api/user";
import uploadSingle from "../common/uploadSingle.vue";
import { filterEmptyValues } from "../../utils/tools";
import { getStorage } from "../../utils/storage";
const labelCol = { style: { width: "80px" } };
const currentRow = ref<User>();
const bgImg = ref("");
const wrapperCol = { span: 14 };
onMounted(() => {
  search();
  getRoles();
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
  password?: string;
  username: string;
  mobile: string;
  state: number;
  role: string;
  id?: number;
  bgavatar?: string;
  cpassword?: string;
}
const userForm = ref<User>({
  nickname: "",
  password: "",
  username: "",
  mobile: "",
  state: 1,
  role: "",
  cpassword: "",
});
const formState: UnwrapRef<FormState> = reactive({
  nickname: "",
  state: "",
  mobile: "",
  created_time: "",
  role: "",
});
const userFormRef = ref();
const bUpload = ref();
const aUpload = ref();
const currentpwd = ref("");
const openModal = ref(false);
const resetPwd = ref(false);
const roleList = ref<any[]>([]);
const aImg = ref("");
const validatePass = (rule: any, value: any) => {
  if (value === "") {
    return Promise.reject("请输入确认密码");
  } else {
    if (userForm.value.cpassword !== userForm.value.password) {
      return Promise.reject("两次密码不一致");
    }
    return Promise.resolve();
  }
};
const handelImg = (res: any) => {
  bgImg.value = res;
};
const handelImgAvatar = (res: any) => {
  aImg.value = res;
};
const reset = () => {
  formState.nickname = "";
  formState.state = "";
  formState.mobile = "";
  formState.created_time = "";
  formState.role = "";
  search();
};
const getRoles = () => {
  getAllRole().then((res: any) => {
    roleList.value = res.data.rows;
    console.log(res.data);
  });
};
const search = async () => {
  let params = {
    nickname: formState.nickname,
    mobile: formState.mobile,
    state: formState.state,
    created_time: formState.created_time,
    pageSize: 10,
    currentPage: 1,
  };
  let reqParam = filterEmptyValues(params);
  let data = await getAllUser(reqParam);
  userTable.value = data.data.rows.map((el: any, index: number) => {
    return {
      id: el.id,
      key: el.id,
      username: el.username,
      nickname: el.nickname,
      mobile: el.mobile,
      state: el.state === 1 ? true : false,
      role: el.role_id,
      index: index + 1,
      bgavatar: el.bgavatar,
    };
  });
};
const handleCancel = () => {
  bUpload.value.reset();
  aUpload.value.reset();
  userForm.value = {
    nickname: "",
    password: "",
    cpassword: "",
    username: "",
    mobile: "",
    state: 1,
    role: "",
  };
  openModal.value = false;
};
const handleOk = () => {
  userFormRef.value.validate().then(() => {
    let params: any = {
      bgavatar: bgImg.value,
      nickname: userForm.value.nickname,
      mobile: userForm.value.mobile,
      state: userForm.value.state ? 1 : 0,
      role_id: userForm.value.role,
    };
    if (!userForm.value.id) {
      // 新增
      params["password"] = userForm.value.password;
      params["username"] = userForm.value.username;
      params["avatar"] = aImg.value;
      console.log(params);

      const reqparam = filterEmptyValues(params);
      addUser(reqparam).then((res) => {
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
      params["id"] = userForm.value.id;
      const reqparam = filterEmptyValues(params);
      updateUser(reqparam).then((res) => {
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
const handelReset = (record: any) => {
  currentRow.value = record;
  nextTick(() => {
    resetPwd.value = true;
  });
};
const handelResetPwd = () => {
  updatePassword({ id: currentRow.value?.id, password: currentpwd.value }).then(
    (res) => {
      if (res.code === 0) {
        message.success(res.msg);
        resetPwd.value = false;
      } else {
        message.error(res.msg);
      }
    }
  );
};

const cancelResetPwd = () => {
  userForm.value.password = "";
  userForm.value.cpassword = "";
};

const showEditModal = (record: any) => {
  console.log(record);
  if (record) {
    console.log("ddddd");

    userForm.value = {
      ...record,
    };
  } else {
    userForm.value = {
      nickname: "",
      mobile: "",
      state: 1,
      role: "",
      username: "",
      bgavatar: "",
      password: "",
      cpassword: "",
    };
    console.log(userForm.value);
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
    title: "序号",
    dataIndex: "index",
    key: "index",
    align: "center",
  },
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
