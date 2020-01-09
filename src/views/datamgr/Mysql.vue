<template>
  <div>
    <a-tooltip placement="left" style="position: fixed;right: 20px;top:80px;z-index: 10;">
      <template slot="title">
        <span>数据库信息</span>
      </template>
      <a-button type="primary" style="margin-right:5px;" @click="tableOption" icon="info-circle" ></a-button>
    </a-tooltip>
    <a-tooltip placement="left" style="position: fixed;right: 20px;top:120px;z-index: 10;" >
      <template slot="title">
        <span>表信息</span>
      </template>
      <a-button type="primary" style="margin-right:5px;" @click="columnsOption" icon="table" ></a-button>
    </a-tooltip>
    <a-card :bordered="false">
      <a-row :gutter="{ xs: 8, sm: 16, md: 24}">
        <a-col :span="5">
          <div>
            <a-button size="small" type="link" @click="toAdvance" style="margin-right: 5px;" >高级SQL查询</a-button>
            <a-button size="small" type="link" @click="clearBackup" >清空备份表</a-button>
          </div>
          <a-menu
            ref="menu"
            style="width: 100%;height:calc(100vh - 130px);overflow-y: auto;overflow-x: hidden;"
            :openKeys.sync="openKeys"
            v-model="selectKeys"
            mode="inline"
            @openChange="onOpenChange"
            @select="selectTableMenu"
          >
            <a-sub-menu v-for="item in databaseList" :key="item.sourceCode" >
              <span slot="title" :style="{color:openKeys.includes(item.sourceCode) ? 'red' : '' }"><a-icon type="database" /><span>{{ item.sourceCode }}</span></span>
              <template v-if="item.children">
                <a-menu-item v-for="sub in item.children" :key="sub">{{ sub }}</a-menu-item>
              </template>
            </a-sub-menu>
          </a-menu>
        </a-col>
        <a-col :span="19">
          <br/>
          <a-form ref="form" size="small" layout="inline" @keyup.enter.native="searchOption" inline>
            <a-form-item label="过滤条件" label-width="80px">
              <div style="margin-bottom:5px;" v-for="(filOpt,index) in optionList" :key="filOpt.field" >
                <a-select
                  size="small"
                  v-model="filOpt.field"
                  allowClear
                  showSearch
                  :dropdownMatchSelectWidth="false"
                  style="width:200px;margin-right:5px;" >
                  <a-select-option v-for="item in queryFieldList" :value="item" :key="item" >{{ item.toLowerCase() }}</a-select-option>
                </a-select>
                <a-select size="small" v-model="filOpt.option" allowClear showSearch style="width:100px;margin-right:5px;" >
                  <a-select-option value="like">包含</a-select-option>
                  <a-select-option value="=">等于</a-select-option>
                  <a-select-option value=">">大于</a-select-option>
                  <a-select-option value="<">小于</a-select-option>
                </a-select>
                <a-input size="small" v-model="filOpt.query" style="width:300px;margin-right:5px;"></a-input>
                <a-button
                  size="small"
                  style="margin-right:5px;"
                  v-if="optionList.length > 1"
                  type="danger"
                  icon="delete"
                  @click="delOption(index)" ></a-button>
                <a-button
                  size="small"
                  style="margin-right:5px;"
                  v-if="index == 0"
                  type="primary"
                  icon="plus"
                  @click="addOption" ></a-button>
                <a-button
                  size="small"
                  style="margin-right:5px;"
                  v-if="index == 0"
                  type="primary"
                  icon="search"
                  @click="searchOption" ></a-button>
              </div>
            </a-form-item>
          </a-form>
          <Excel ref="excelResult" ></Excel>
        </a-col>
      </a-row>
    </a-card>
    <a-drawer
      title="表基本信息"
      :width="700"
      :visible="detailModel"
      @close="detailModel=false">
      <detail-list :col="1" >
        <detail-list-item term="名">{{ tableBasicInfo.TABLE_NAME }}</detail-list-item>
        <detail-list-item term="数据库">{{ tableBasicInfo.TABLE_SCHEMA }}</detail-list-item>
        <!--<detail-list-item term="组名"></detail-list-item>-->
        <detail-list-item term="行">{{ tableBasicInfo.TABLE_ROWS }}</detail-list-item>
        <detail-list-item term="表类型">{{ tableBasicInfo.ENGINE }}</detail-list-item>
        <detail-list-item term="自动递增值">{{ tableBasicInfo.AUTO_INCREMENT }}</detail-list-item>
        <detail-list-item term="行格式">{{ tableBasicInfo.ROW_FORMAT }}</detail-list-item>
        <detail-list-item term="修改日期">{{ tableBasicInfo.UPDATE_TIME }}</detail-list-item>
        <detail-list-item term="创建日期">{{ tableBasicInfo.CREATE_TIME }}</detail-list-item>
        <detail-list-item term="检查时间">{{ tableBasicInfo.CHECK_TIME|| "\t" }}</detail-list-item>
        <detail-list-item term="排序规则">{{ tableBasicInfo.TABLE_COLLATION }}</detail-list-item>
        <detail-list-item term="创建选项">{{ tableBasicInfo.CREATE_OPTIONS || '\t' }}</detail-list-item>
        <detail-list-item term="注释">{{ tableBasicInfo.TABLE_COMMENT }}</detail-list-item>
        <!--<detail-list-item term="索引长度"></detail-list-item>-->
        <!--<detail-list-item term="数据长度"></detail-list-item>-->
        <!--<detail-list-item term="最大数据长度"></detail-list-item>-->
        <!--<detail-list-item term="数据空闲"></detail-list-item>-->
        <!--<detail-list-item term=""></detail-list-item>-->
        <!--<detail-list-item term=""></detail-list-item>-->
        <!--<detail-list-item term=""></detail-list-item>-->
        <!--<detail-list-item term=""></detail-list-item>-->
      </detail-list>
    </a-drawer>
    <a-drawer title="表列信息" :width="700" :visible="tabledetailModel" @close="tabledetailModel=false">
      <a-tabs type="border-card" >
        <a-tab-pane tab="栏位" key="catalog" >
          <a-table
            :key="tableKey"
            size="small"
            ref="table"
            :dataSource="queryResultTableList"
            border
            :scroll="{y:'calc(100vh - 200px)'}"
            :columns="queryResultTableField"
            :pagination="false" >
          </a-table>
        </a-tab-pane>
        <a-tab-pane tab="索引" key="index" >
          <a-table
            :key="tableKey"
            size="small"
            ref="table"
            :dataSource="queryResultIndexList"
            border
            :scroll="{y:'calc(100vh - 200px)'}"
            :columns="queryResultIndexField"
            :pagination="false" >
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-drawer>
  </div>
</template>

<script>
import $ from 'jquery'
import { Menu } from 'ant-design-vue'
import { Excel } from '@/components'
import DetailList from '@/components/tools/DetailList'
const DetailListItem = DetailList.Item
const { Item, ItemGroup, SubMenu } = Menu

export default {
  name: 'Mysql',
  components: {
    Menu, Item, ItemGroup, SubMenu, Excel, DetailList, DetailListItem
  },
  data: function () {
    return {
      openKeys: [],
      orgTree: [],
      tableList: [],
      datasourceList: [],
      queryResultList: [],
      queryFieldList: [],
      queryResultTableList: [],
      queryResultTableField: [
        {
          title: '名',
          dataIndex: '名',
          key: 'name',
          width: '150px'
        }, {
          title: '类型',
          dataIndex: '类型',
          key: 'type',
          width: '120px'
        }, {
          title: '允许空值',
          dataIndex: '允许空值',
          key: 'nullable',
          width: '80px'
        }, {
          title: '备注',
          dataIndex: '备注',
          key: 'remark'
        }
      ],
      queryFieldTableList: [],
      queryResultIndexList: [],
      queryResultIndexField: [
        {
          title: '名',
          dataIndex: '名',
          key: 'name',
          width: '150px'
        }, {
          title: '栏位',
          dataIndex: '栏位',
          key: 'catalog',
          width: '150px'
        }, {
          title: '索引类型',
          dataIndex: '索引类型',
          key: 'type',
          width: '150px'
        }, {
          title: '索引方式',
          dataIndex: '索引方式',
          key: 'ways'
        }],
      optionList: [{
        field: '',
        query: '',
        option: ''
      }],
      selectKeys: [],
      databaseList: [],
      databaseTable: {},
      props: {
        title: 'label',
        key: 'code',
        children: 'children',
        isLeaf: 'leaf'
      },
      tableKey: '',
      tablesInformation: [],
      detailModel: false,
      tabledetailModel: false,
      tableColumns: {}
    }
  },
  computed: {
    datasourceCode () {
      return this.openKeys[0]
    },
    tableName () {
      return this.selectKeys[0]
    },
    tableBasicInfo () {
      return this.tablesInformation[0] || {}
    }
  },
  methods: {
    queryTable (datasource) {
      this.$getReq('/api/mysql-data/allTable', { datasource: datasource }).then(res => {
        this.tableList = res.data.resultList
      })
    },
    calcTabWith (item) {
      var w = item.length * 12
      return w < 70 ? 70 : w
    },
    addOption () {
      this.optionList.push({
        field: '',
        query: '',
        option: ''
      })
    },
    delOption (index) {
      this.$delete(this.optionList, index)
    },
    searchOption () {
      if (!this.datasourceCode || !this.tableName) {
        this.$message.error('请选择表')
        return
      }
      this.$postJsonReq('/api/mysql-data/searchTable',
        { datasource: this.datasourceCode,
          tableName: this.tableName,
          optionList: this.optionList }).then(res => {
        this.queryFieldList = res.data.fields
        this.loadExcel(res.data)
      })
    },
    toAdvance () {
      if (!this.datasourceCode) {
        this.$message.error('请选择数据库')
        return
      }
      window.open('/mysql/mysql-advance?sourceCode=' + this.datasourceCode)
      // App.openModule(this.datasourceCode + '高级查询', 'query/mysql-advance.html?' + this.datasourceCode, this.datasourceCode)
    },
    clearBackup () {
      if (!this.datasourceCode) {
        this.$message.error('请选择数据库')
        return
      }
      this.$confirm({
        title: '风险提示',
        content: '操作存在风险，确认清除备份表吗?',
        onOk: () => {
          this.$postJsonReq('/api/mysql-data/delteBackupTable', { datasource: this.datasourceCode }).then(res => {
            location.reload()
          })
        },
        onCancel () {
        }
      })
    },
    tableOption () {
      if (!this.datasourceCode || !this.tableName) {
        this.$message.error('请选择表')
        return
      }
      this.$postJsonReq('/api/mysql-data/getTablesInformation', { datasource: this.datasourceCode, tableName: this.tableName }).then(res => {
        this.tablesInformation = res.data
        this.detailModel = true
      })
    },
    columnsOption () {
      if (!this.datasourceCode) {
        this.$message.error('请选择数据库')
        return
      }
      this.$postJsonReq('/api/mysql-data/getColumnsInformation', { datasource: this.datasourceCode, tableName: this.tableName }).then(res => {
        this.queryResultTableList = res.data.resultList
        this.queryFieldTableList = res.data.fields
        this.tabledetailModel = true
      })
      this.$postJsonReq('/api/mysql-data/getIndexformation', { datasource: this.datasourceCode, tableName: this.tableName }).then(res => {
        this.queryResultIndexList = res.data.resultList
        this.queryFieldIndexList = res.data.fields
      })
    },
    onOpenChange (openKeys) {
      const latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1)
      this.$nextTick(() => {
        this.openKeys = latestOpenKey ? [latestOpenKey] : []
      })

      var sourceCode = openKeys[0]
      if (!sourceCode) return

      var database = this.databaseTable[sourceCode]
      if (database.children !== undefined) {
        return
      }
      this.$getReq('/api/mysql-data/getTableFileds', { datasource: sourceCode }).then(res => {
        var tables = Object.keys(res.data).sort()
        this.tableColumns = res.data
        this.$set(database, 'children', tables)
      })
    },
    loadDataSource () {
      this.$getReq('/api/datasource/list/mysql').then(res => {
        // var list = []
        res.data.forEach(item => {
          this.databaseTable[item.sourceCode] = item
        })
        this.databaseList = res.data
      })
    },
    loadExcel (result) {
      var columns = []
      var formEl = this.$refs.form.$el
      var width = formEl.offsetWidth
      var height = $(this.$refs.menu.$el).height() - 170

      var everyWidth = width / result.fields.length

      if (everyWidth < 120) {
        everyWidth = 120
      }

      result.fields.forEach(item => {
        columns.push({
          type: 'text', title: item, width: everyWidth + 'px'
        })
      })
      var data = []
      result.resultList.forEach(item => {
        var item_ = []
        result.fields.forEach(sub => {
          item_.push(item[sub])
        })
        data.push(item_)
      })

      var option = {
        data: data,
        columns: columns,
        tableHeight: height + 'px',
        tableOverflow: true,
        tableWidth: width + 'px',
        search: true,
        csvFileName: '导出数据',
        pagination: 2000,
        paginationOptions: [2000, 5000, 10000]
      }
      console.log(this.$refs.excelResult)
      this.$refs.excelResult.load(option)
    },
    selectTableMenu ({ key }) {
      this.queryFieldList = this.tableColumns[key]
    }
  },
  /* 组件创建完成事件  */
  created: function () {
  },
  /* 模板编译挂载完成事件 类似小程序onload */
  mounted: function () {
    console.log(Excel)
    this.loadDataSource()
  },
  /* 组件更新完成事件 */
  updated: function () {
  },
  /*  组件被激活 类似小程序onshow */
  activated: function () {
  },
  /*  组件未被激活 类似小程序ondestroy */
  deactivated: function () {
  }
}
</script>

<style scoped>

</style>
