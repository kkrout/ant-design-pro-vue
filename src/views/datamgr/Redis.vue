<template>
  <div>
    <!--<a-tooltip placement="left" style="position: fixed;right: 20px;top:330px;z-index: 10;">-->
    <!--<template slot="title">-->
    <!--<span>修改TTL</span>-->
    <!--</template>-->
    <!--<a-button type="primary" style="margin-right:5px;" icon="edit" ></a-button>-->
    <!--</a-tooltip>-->
    <!--<a-tooltip placement="left" style="position: fixed;right: 20px;top:370px;z-index: 10;" >-->
    <!--<template slot="title">-->
    <!--<span>删除</span>-->
    <!--</template>-->
    <!--<a-button type="danger" style="margin-right:5px;" icon="delete" ></a-button>-->
    <!--</a-tooltip>-->
    <a-card :bordered="false">
      <a-row :gutter="{ xs: 8, sm: 16, md: 24}">
        <a-col :span="5">
          <a-menu
            ref="menu"
            style="width: 100%;height:calc(100vh - 110px);overflow-y: auto;overflow-x: hidden;"
            :openKeys.sync="openKeys"
            v-model="selectKeys"
            mode="inline"
            @openChange="onOpenChange"
            @select="selectTableMenu"
          >
            <a-sub-menu v-for="item in databaseList" :key="item.sourceCode" >
              <span slot="title" :style="{color:openKeys.includes(item.sourceCode) ? 'red' : '' }"><a-icon type="database" /><span>{{ item.sourceCode }}</span></span>
              <template v-if="item.children">
                <a-menu-item v-for="(sub,index) in item.children" :key="index">{{ 'db'+index+"("+sub+")" }}</a-menu-item>
              </template>
            </a-sub-menu>
          </a-menu>
        </a-col>
        <a-col :span="19" ref="result">
          <div style="padding: 8px 0px;">
            <a-input
              v-model="parttenKeys"
              placeholder="前半模糊搜索，输入回车从服务器过滤"
              @keyup.enter.native="querykeys(dbIndex)"
              size="mini"
              suffix-icon="el-icon-search"
              style="width: 100%" ></a-input>
          </div>
          <Excel ref="excelResult" ></Excel>
        </a-col>
      </a-row>
    </a-card>
    <a-drawer
      title="详情"
      :width="700"
      :visible="detailModel"
      @close="detailModel=false">
      <div style="padding: 8px 0px;">
        <a-input
          v-model="subParttenKeys"
          placeholder="前半模糊搜索，redis对list类型没有提供API"
          @keyup.enter.native="querySubkeys()"
          size="mini"
          suffix-icon="el-icon-search"
          style="width: 100%" ></a-input>
      </div>
      <template v-if="currentData.type == 'string' " >
        <pre >{{ currentData.value }}</pre>
      </template>
      <template v-else-if="currentData.type == 'list' " >
        <Excel ref="subExcelResult" ></Excel>
      </template>
      <template v-else-if="currentData.type == 'hash' " >
        <Excel ref="subExcelResult" ></Excel>
      </template>
      <template v-else-if="currentData.type == 'set' " >
        <Excel ref="subExcelResult" ></Excel>
      </template>
      <template v-else-if="currentData.type == 'zset' " >
        <Excel ref="subExcelResult" ></Excel>
      </template>
    </a-drawer>
  </div>
</template>

<script>
import $ from 'jquery'
import { Ellipsis, Excel } from '@/components'

export default {
  name: 'Mysql',
  components: {
    Ellipsis,
    Excel
  },
  data () {
    return {
      openKeys: [],
      selectKeys: [],
      databaseList: [],
      databaseTable: {},
      parttenKeys: '',
      showValue: 0,
      keyList: [],
      subParttenKeys: '',
      detailModel: false,
      currentData: {}
    }
  },
  mounted () {
    this.initExcel()
    this.queryDatabase()
  },
  computed: {
    datasourceCode () {
      return this.openKeys[0]
    },
    dbIndex () {
      return this.selectKeys[0]
    }
  },
  methods: {
    queryDatabase () {
      this.$getReq('/api/datasource/list/redis').then(res => {
        res.data.forEach(item => {
          this.databaseTable[item.sourceCode] = item
        })
        this.databaseList = res.data
      })
    },
    querySubkeys () {
      this.$getReq('/api/redis-data/getValue', {
        datasource: this.datasourceCode,
        db: this.dbIndex,
        parttenKeys: this.currentData.key,
        type: this.currentData.type,
        subParttenKeys: this.subParttenKeys
      }).then(res => {
        const list = []; const cols = []
        this.detailModel = true
        switch (this.currentData.type) {
          case 'string':
            this.currentData.value = res.data
            return
          case 'hash':
            cols.push('key', 'value')
            res.data.forEach(item => {
              list.push([item.key, item.value])
            })
            break
          case 'list':
          case 'set':
            cols.push('value')
            res.data.forEach(item => {
              list.push(item.value)
            })
            break
          case 'zset':
            cols.push('score', 'value')
            res.data.forEach(item => {
              list.push([item.key, item.value])
            })
            break
        }
        this.$nextTick(() => {
          this.loadExcel(cols, list)
        })
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
      this.$getReq('/api/redis-data/dblist', { datasource: sourceCode }).then(res => {
        this.$set(database, 'children', res.data)
      })
    },
    loadExcel (cols, list) {
      var height = $(document).height()
      var columns = []; var colWidths = []
      cols.forEach(item => {
        columns.push({ type: 'text', title: item })
        colWidths.push(600 / cols.length)
      })

      var option2 = {
        data: list,
        columns: columns,
        tableHeight: (height - 300) + 'px',
        tableOverflow: true,
        search: true,
        csvFileName: '导出数据',
        tableWidth: 700 + 'px',
        colWidths: colWidths,
        colAlignments: ['left', 'left', 'center'],
        allowComments: false,
        pagination: 2000,
        paginationOptions: [2000, 5000, 10000],
        rowResize: true
      }
      this.$refs.subExcelResult.load(option2)
    },
    selectTableMenu ({ key }) {
      if (!this.datasourceCode) {
        this.$message.error('请选择数据库')
        return
      }
      this.querykeys(key)
    },
    querykeys (index) {
      this.$getReq('/api/redis-data/queryKeys/',
        {
          datasource: this.datasourceCode,
          db: index,
          parttenKeys: this.parttenKeys,
          showValue: this.showValue
        }).then(res => {
        this.detailModel = false
        this.keyList = res.data

        if (!this.keyList.length) {
          this.$refs.excelResult.spreadsheet.setData([])
          return
        };
        var datas = []
        this.keyList.forEach(item => {
          datas.push([item.key, item.value, item.type])
        })
        this.$refs.excelResult.spreadsheet.page(0)
        this.$refs.excelResult.spreadsheet.setData(datas)
      })
    },
    initExcel () {
      // 初始化表格
      this.$nextTick(() => {
        var width = $(this.$refs.result.$el).width()
        var height = $(document).height()
        var vw = width - 80
        var that = this
        this.$nextTick(() => {
          var option = {
            data: [],
            columns: [
              { type: 'text', title: 'key' },
              { type: 'text', title: 'value' },
              { type: 'text', title: 'type' }
            ],
            tableHeight: (height - 300) + 'px',
            tableOverflow: true,
            search: true,
            csvFileName: '导出数据',
            tableWidth: width + 'px',
            colWidths: [vw * 0.5, vw * 0.3, vw * 0.2],
            colAlignments: ['left', 'left', 'center'],
            allowComments: true,
            pagination: 2000,
            paginationOptions: [2000, 5000, 10000],
            rowResize: true,
            ondbclick: function (data) {
              console.log(that.currentData)
              if (that.currentData.key === data[0]) { return }
              that.currentData = { key: data[0], value: data[1], type: data[2] }
              that.querySubkeys()
            }
          }
          this.$refs.excelResult.load(option)
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
