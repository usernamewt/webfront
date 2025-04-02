<template>
  <div class="container-box">
    <a-form :model="searchFrom" class="form-box">
      <a-row :gutter="16" style="margin: 0">
        <a-col class="gutter-row" :span="20">
          <a-row :gutter="16">
            <a-col class="gutter-row" :span="6">
              <a-form-item label="商品名称">
                <a-input v-model:value="searchFrom.product_name" />
              </a-form-item>
            </a-col>
            <a-col class="gutter-row" :span="6">
              <a-form-item label="商品描述">
                <a-input v-model:value="searchFrom.description" />
              </a-form-item>
            </a-col>
            <a-col class="gutter-row" :span="6">
              <a-form-item label="状态">
                <a-select v-model:value="searchFrom.status" @change="onChange">
                  <a-select-option :value="1">上架</a-select-option>
                  <a-select-option :value="0">下架</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col class="gutter-row" :span="6">
              <a-form-item label="商品分类">
                <a-select
                  v-model:value="searchFrom.cate_id"
                  :options="categoryList"
                >
                </a-select>
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
        :columns="userColumns"
        :data-source="userTable"
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
          <template v-if="column.dataIndex === 'head_img'">
            <img :src="record.head_img" style="width: 50px; height: 50px" />
          </template>
          <template v-if="column.dataIndex === 'status'">
            <a-switch
              :checkedValue="1"
              :unCheckedValue="0"
              v-model:checked="record.status"
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
      :title="goodsForm.id ? '编辑商品' : '新增商品'"
      centered
      @ok="handleOk"
      @cancel="handleCancel"
      :okText="'确定'"
      :cancelText="'取消'"
      style="width: 65vw"
    >
      <a-form
        :model="goodsForm"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        ref="goodsFormRef"
      >
        <a-row :gutter="16" style="margin: 0">
          <a-col :span="8">
            <a-form-item
              label="商品名称"
              name="product_name"
              :rules="[{ required: true, message: '请输入商品名称' }]"
            >
              <a-input
                v-model:value="goodsForm.product_name"
                :rules="[{ required: true }]"
              />
            </a-form-item>
            <a-form-item label="商品描述" name="description">
              <a-input v-model:value="goodsForm.description" />
            </a-form-item>

            <a-form-item label="商品分类" name="category_id">
              <a-select
                v-model:value="goodsForm.cate_id"
                :options="categoryList"
              >
              </a-select>
            </a-form-item>
            <a-form-item
              label="商品库存"
              name="stock"
              :rules="[{ required: true, message: '请输入商品库存' }]"
            >
              <a-input-number
                style="width: 100%"
                v-model:value="goodsForm.stock"
                :min="0"
              />
            </a-form-item>

            <a-form-item
              label="商品原价"
              name="original_price"
              :rules="[{ required: true, message: '请输入商品原价' }]"
            >
              <a-input-number
                v-model:value="goodsForm.original_price"
                style="width: 100%"
                :min="0.1"
                :step="0.1"
              />
            </a-form-item>
            <a-form-item
              label="商品售价"
              name="sale_price"
              :rules="[{ required: true, message: '请输入商品售价' }]"
            >
              <a-input-number
                style="width: 100%"
                v-model:value="goodsForm.sale_price"
                :min="0.1"
                :step="0.1"
              />
            </a-form-item>
            <a-form-item
              label="是否热门"
              name="is_hot"
              :rules="[{ required: true, message: '请选择是否热门' }]"
            >
              <a-switch
                :checkedValue="1"
                :unCheckedValue="0"
                v-model:checked="goodsForm.is_hot"
              />
            </a-form-item>
            <a-form-item
              label="是否上架"
              name="status"
              :rules="[{ required: true, message: '请选择是否上架' }]"
            >
              <a-switch
                :checkedValue="1"
                :unCheckedValue="0"
                v-model:checked="goodsForm.status"
              />
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <a-form-item label="商品详情" name="detail">
              <formEditorVue
                :texts="goodsForm.detail"
                @updata_text="handelEditerText"
              />
            </a-form-item>
            <a-form-item label="主图">
              <uploadSingle
                ref="aUpload"
                :box-width="'36vw'"
                :def-avater="goodsForm?.head_img"
                @upload="handelImgAvatar"
              />
            </a-form-item>
            <a-form-item label="轮播图">
              <uploadMuli
                :box-width="'36vw'"
                :def-avater="goodsForm?.carousel_img"
                ref="bUpload"
                @upload="handelImg"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, h, nextTick } from "vue";
import { Button, notification, message } from "ant-design-vue";
import api from "../../api/index";
import uploadSingle from "../common/uploadSingle.vue";
import uploadMuli from "../common/uploadMulit.vue";
import { filterEmptyValues } from "../../utils/tools";
import { getStorage } from "../../utils/storage";
import formEditorVue from "../common/formEditor.vue";

onMounted(() => {
  search();
  getClassifitions();
  baseScroll.value = tbBox.value.offsetHeight - 180;
});
interface FormState {
  id?: number;
  product_name: string;
  description: string;
  detail: string;
  is_hot: number;
  sale_price: number;
  original_price: number;
  head_img: string;
  carousel_img: string[];
  cate_id?: number;
  status?: number;
  stock: number;
  version: string;
  created_time?: string;
  updated_time?: string;
}

const goodsForm = ref<FormState>({
  product_name: "",
  description: "",
  detail: "",
  is_hot: 0,
  sale_price: 0.1,
  original_price: 0.1,
  head_img: "",
  carousel_img: [],
  cate_id: undefined,
  status: undefined,
  stock: 0,
  version: "",
});
const searchFrom = ref({
  product_name: "",
  description: "",
  is_hot: "",
  status: undefined,
  cate_id: undefined,
  stock: "",
  created_time: "",
});
const labelCol = { style: { width: "80px" } };
const wrapperCol = { span: 14 };
const categoryList = ref([]);
const tbBox = ref();
const baseScroll = ref(0);
const goodsFormRef = ref();
const bUpload = ref();
const aUpload = ref();
const openModal = ref(false);
const handelImgAvatar = (res: any) => {
  goodsForm.value.head_img = res;
};
const handelImg = (res: any) => {
  goodsForm.value.carousel_img = res;
};
const reset = () => {
  search();
};
const handelEditerText = (res: any) => {
  goodsForm.value.detail = res;
};
const getClassifitions = async () => {
  let data = await api.classification.getClassifitionList({
    currentPage: 1,
    pageSize: 1000,
  });
  categoryList.value = data.data.rows.map((el) => {
    return {
      key: el.id,
      value: el.id,
      label: el.cate_name,
      title: el.cate_name,
    };
  });
};
const search = async () => {
  let params = {
    nickname: goodsForm.value.product_name,
    pageSize: 10,
    currentPage: 1,
  };
  let reqParam = filterEmptyValues(params);
  let data = await api.goods.getGoodsList(reqParam);
  userTable.value = data.data.rows;
};
const handleCancel = () => {
  handelReset();
  bUpload.value.reset();
  aUpload.value?.reset();
  openModal.value = false;
};
const handleOk = async () => {
  console.log(JSON.parse(JSON.stringify(goodsForm.value)));
  goodsFormRef.value.validate().then(() => {
    let params: any = {
      ...goodsForm.value,
      carousel_img: goodsForm.value.carousel_img.join(","),
    };
    if (!goodsForm.value.id) {
      // 新增
      const reqparam = filterEmptyValues(params);
      api.goods.addGoods(reqparam).then((res) => {
        if (res.code === 0) {
          search();
          message.success(res.msg);
          openModal.value = false;
          handleCancel();
        } else {
          message.error(res.msg);
        }
      });
    } else {
      // 编辑
      const reqparam = filterEmptyValues(params);
      api.goods.editGoods(reqparam).then((res) => {
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
  api.goods.deleteGoods({ id: record.id }).then((res) => {
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
  if (record) {
    goodsForm.value = {
      ...record,
      carousel_img: record.carousel_img.split(","),
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
    product_name: "",
    description: "",
    detail: "",
    is_hot: 0,
    sale_price: 0.1,
    original_price: 0.1,
    head_img: "",
    carousel_img: [],
    cate_id: undefined,
    status: undefined,
    stock: 0,
    version: "",
  };
};
const onChange = (value: string) => {
  console.log(`selected ${value}`);
};
const onChangeVal = (record: any) => {
  if (record.status) {
    api.goods.changeGoodsStatus({ id: record.id, status: 1 }).then((res) => {
      if (res.code === 0) {
        message.success(res.msg);
        record.status = true;
        notification.close(key);
      } else {
        message.error(res.msg);
      }
    });
    return;
  }
  record.status = true;
  const key = `open${Date.now()}`;
  notification.warning({
    message: "修改状态",
    description: "确定要修改商品的上/下架状态？",
    btn: () =>
      h(
        Button,
        {
          type: "primary",
          size: "small",
          onClick: () => {
            api.goods
              .changeGoodsStatus({ id: record.id, status: 0 })
              .then((res) => {
                if (res.code === 0) {
                  message.success(res.msg);
                  record.status = false;
                  notification.close(key);
                } else {
                  message.error(res.msg);
                }
              });
            notification.close(key);
          },
        },
        { default: () => "确定" }
      ),
    key,
    onClose: () => {
      record.status = true;
    },
  });
};

const userColumns = ref([
  {
    title: "商品名称",
    dataIndex: "product_name",
    key: "product_name",
    align: "center",
  },
  {
    title: "商品描述",
    dataIndex: "description",
    key: "description",
    ellipsis: true,
    align: "center",
  },
  {
    title: "商品图片",
    dataIndex: "head_img",
    key: "head_img",
    align: "center",
  },
  {
    title: "商品原价",
    dataIndex: "original_price",
    key: "original_price",
    ellipsis: true,
    align: "center",
  },
  {
    title: "商品售价",
    dataIndex: "sale_price",
    key: "sale_price",
    ellipsis: true,
    align: "center",
  },
  {
    title: "库存",
    dataIndex: "stock",
    key: "stock",
    ellipsis: true,
    align: "center",
    width: 140,
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    align: "center",
    width: 140,
  },
  {
    title: "操作",
    dataIndex: "operation",
    key: "operation",
    align: "center",
    width: 80,
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
