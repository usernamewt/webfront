<template>
  <div class="container-box">
    <div class="table-box" ref="navTbBox">
      <div class="add-btn">
        <a-button type="primary" @click="showEditModal(null)"> 新增 </a-button>
      </div>
      <a-table
        :columns="navColumns"
        :data-source="navTable"
        :scroll="{ y: baseScroll }"
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
          <template v-if="column.dataIndex === 'img_url'">
            <uploadSingle
              :boxWidth="'200px'"
              :def-avater="record.img_url"
              @upload="handelImgAvatar($event, record)"
            />
          </template>
          <template v-if="column.dataIndex === 'type'">
            <a-tag :color="dColor(text)">{{ dNavType(text) }}</a-tag>
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
          <template v-if="column.dataIndex === 'action'">
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
      :title="goodsForm.id ? '编辑轮播图' : '新增轮播图'"
      centered
      @ok="handleOk"
      @cancel="handleCancel"
      :okText="'确定'"
      :cancelText="'取消'"
      style="width: 45vw"
    >
      <a-form
        :model="goodsForm"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        ref="goodsFormRef"
      >
        <a-form-item
          label="轮播图名称"
          name="title"
          :rules="[{ required: true, message: '请输入商品名称' }]"
        >
          <a-input
            v-model:value="goodsForm.title"
            :rules="[{ required: true }]"
          />
        </a-form-item>
        <a-form-item label="轮播图">
          <uploadSingle
            ref="aUpload"
            :box-width="'100%'"
            :def-avater="goodsForm?.img_url"
            @upload="handelImgAvatar"
          />
        </a-form-item>
        <a-form-item label="轮播图类型" name="description">
          <a-select v-model:value="goodsForm.type">
            <a-select-option :value="0">无跳转</a-select-option>
            <a-select-option :value="1">商品详情</a-select-option>
            <a-select-option :value="2">活动页</a-select-option>
            <a-select-option :value="3">外链</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="轮播图跳转地址" name="category_id">
          <a-input v-model:value="goodsForm.jump_address"></a-input>
        </a-form-item>
        <a-form-item
          label="排序"
          name="sort"
          :rules="[{ required: true, message: '请输入商品库存' }]"
        >
          <a-input-number
            style="width: 100%"
            v-model:value="goodsForm.sort"
            :min="0"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, nextTick } from "vue";
import { message } from "ant-design-vue";
import api from "../../api/index";
import uploadSingle from "../common/uploadSingle.vue";
import { getStorage } from "../../utils/storage";

onMounted(() => {
  search();
  getClassifitions();
  baseScroll.value = navTbBox.value.offsetHeight - 180;
});
interface FormState {
  id?: number;
  title: string;
  type: number;
  jump_address: string;
  sort: number;
  img_url: string;
}

const goodsForm = ref<FormState>({
  title: "",
  img_url: "",
  sort: 0,
  jump_address: "",
  type: 0,
});
const labelCol = { style: { width: "120px" } };
const wrapperCol = { span: 14 };
const categoryList = ref([]);
const navTbBox = ref();
const baseScroll = ref(0);
const goodsFormRef = ref();
const aUpload = ref();
const openModal = ref(false);
const navTable = ref<any[]>([]);
const handelImgAvatar = (e: any) => {
  goodsForm.value.img_url = e;
};
const dNavType = (type: number) => {
  switch (type) {
    case 0:
      return "无跳转";
    case 1:
      return "商品详情";
    case 2:
      return "活动页";
    case 3:
      return "外链";
  }
};
const dColor = (type: number) => {
  switch (type) {
    case 0:
      return "orange";
    case 1:
      return "green";
    case 2:
      return "blue";
    case 3:
      return "cyan";
  }
};
const getClassifitions = async () => {
  let data = await api.classification.getClassifitionList();
  categoryList.value = data.data.rows.map((el: any) => {
    return {
      key: el.id,
      value: el.id,
      label: el.cate_name,
      title: el.cate_name,
    };
  });
};
const search = async () => {
  let data = await api.navconfig.getNav();
  navTable.value = data.data;
};
const handleCancel = () => {
  handelReset();
  aUpload.value?.reset();
  openModal.value = false;
};
const handleOk = async () => {
  goodsFormRef.value.validate().then(() => {
    let params: any = {
      ...goodsForm.value,
    };
    if (!goodsForm.value.id) {
      // 新增
      api.navconfig.addNav(params).then((res) => {
        if (res.code === 0) {
          message.success(res.msg);
          handleCancel();
          search();
        } else {
          message.error(res.msg);
        }
      });
    } else {
      // 编辑
      api.navconfig.editNav(params).then((res) => {
        if (res.code === 0) {
          message.success(res.msg);
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
  api.navconfig.delNav({ id: record.id }).then((res) => {
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
    goodsForm.value = {
      ...record,
    };
  } else {
    handelReset();
  }

  nextTick(() => {
    openModal.value = true;
  });
};

const handelReset = () => {
  goodsForm.value = {
    title: "",
    img_url: "",
    sort: 0,
    jump_address: "",
    type: 0,
  };
};

const navColumns = ref([
  {
    title: "轮播图名称",
    dataIndex: "title",
    key: "title",
    align: "center",
  },
  {
    title: "轮播图图片",
    dataIndex: "img_url",
    key: "img_url",
    ellipsis: true,
    align: "center",
    width: 220,
  },
  {
    title: "轮播图类型",
    dataIndex: "type",
    key: "type",
    align: "center",
  },
  {
    title: "轮播图跳转地址",
    dataIndex: "jump_address",
    key: "jump_address",
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
    title: "操作",
    dataIndex: "action",
    key: "action",
    align: "center",
    width: 100,
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
  height: calc(100vh - 150px);
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
