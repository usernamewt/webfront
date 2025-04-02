<template>
  <div class="container-box">
    <div class="table-box" ref="tbBox">
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
              :def-avater="record.img_url"
              @upload="handelImgAvatar($event, record)"
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
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, h, nextTick } from "vue";
import { Button, notification, message } from "ant-design-vue";
import api from "../../api/index";
import uploadSingle from "../common/uploadSingle.vue";
import { filterEmptyValues } from "../../utils/tools";
import { getStorage } from "../../utils/storage";

onMounted(() => {
  search();
  getClassifitions();
  baseScroll.value = tbBox.value.offsetHeight - 180;
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
const categoryList = ref([]);
const tbBox = ref();
const baseScroll = ref(0);
const goodsFormRef = ref();
const bUpload = ref();
const aUpload = ref();
const openModal = ref(false);
const navTable = ref<any[]>([]);
const handelImgAvatar = (e: any, msg: any) => {
  console.log(e);
  console.log(msg);
  msg.img_url = e;
  const params = {
    ...msg,
    img_url: e,
  };
  api.navconfig.editNav(params).then((res) => {
    if (res.code === 0) {
      message.success(res.msg);
      search();
    } else {
      message.error(res.msg);
    }
  });
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
  let data = await api.navconfig.getNav();
  navTable.value = data.data;
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
