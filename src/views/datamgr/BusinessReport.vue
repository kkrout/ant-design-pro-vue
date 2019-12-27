<template>
  <div>
    <a-card :bordered="false" title="报表组">
      <div slot="extra">
        <a-input-search placeholder="报表名称" style="margin-left: 16px; width: 272px;" />
        <a-button type="primary" style="margin-left: 16px;" icon="plus" >创建</a-button>
      </div>
      <a-row :gutter="{ xs: 8, sm: 16, md: 24}">
        <a-col :span="5">
          <a-menu
            ref="menu"
            style="width: 100%;height:calc(100vh - 180px);overflow-y: auto;overflow-x: hidden;"
            mode="inline"
          >
            <a-sub-menu v-for="item in groupList" :key="item" >
              <span slot="title" >
                <a-icon type="pie-chart" /><span>{{ item }}</span></span>
              <template v-if="reportMap[item]">
                <a-menu-item v-for="sub in reportMap[item]" :key="sub.name">{{ sub.name }}</a-menu-item>
              </template>
            </a-sub-menu>
          </a-menu>
        </a-col>
        <a-col :span="19">
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'BusinessReport',
  components: {},
  data: function () {
    return {
      openKeys: [],
      selectKeys: [],
      groupList: ['MPS', 'MDM', 'MPC', 'ORDER'],
      reportMap: {
        'MPS': [
          {
            name: '门店有效活动列表'
          },
          {
            name: '调价数据'
          }
        ],
        'MDM': [
          {
            name: '父商品数据'
          },
          {
            name: '商品数据'
          },
          {
            name: '门店列表'
          },
          {
            name: '地址列表'
          },
          {
            name: '管理列表'
          }
        ]
      }
    }
  }
}
</script>
