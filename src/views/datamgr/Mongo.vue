<template>
  <div>
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
                <a-menu-item v-for="sub in item.children" :key="sub.label">{{ sub.label }}</a-menu-item>
              </template>
            </a-sub-menu>
          </a-menu>
        </a-col>
        <a-col :span="19" ref="result">
          <div>
            <a-button size="small" style="margin-right: 10px;" type="primary" @click="executeMongo">执行操作</a-button>
            <!-- <el-button size="mini" type="danger" @click="executeUpdateMongo">执行更改</el-button> -->
            <a-button size="small" style="margin-right: 10px;" type="info" @click="queryHistory">执行历史</a-button>
            <a-button size="small" style="margin-right: 10px;" type="warning" @click="tipsDialog=true" >帮助说明</a-button>
            <a-row :gutter="{ xs: 8, sm: 16, md: 24}">
              <a-col :span="19" >
                <a-tabs v-model="active" >
                  <a-tab-pane tab="query" key="query">
                    <a-input style="font-size: 15px;" type="textarea" rows="15" v-model.trim="query_text" ></a-input>
                  </a-tab-pane>
                  <a-tab-pane tab="insertMany" key="insertMany" >
                    <a-input style="font-size: 15px;" type="textarea" rows="15" v-model.trim="query_text" ></a-input>
                  </a-tab-pane>
                  <a-tab-pane tab="updateMany" key="updateMany">
                    <a-input type="textarea" rows="7" v-model.trim="update_text1" style="margin-bottom: 5px;font-size: 15px;"></a-input>
                    <a-input style="font-size: 15px;"type="textarea" rows="7" v-model.trim="update_text2" ></a-input>
                  </a-tab-pane>
                  <a-tab-pane tab="deleteMany" key="deleteMany">
                    <a-input style="font-size: 15px;"type="textarea" rows="15" v-model.trim="delete_text" ></a-input>
                  </a-tab-pane>
                </a-tabs>
              </a-col>
            </a-row>
            <br/>
            <a-row :gutter="{ xs: 8, sm: 16, md: 24}" >
              <a-col>
                <a-col :span="4" >
                  <a-input prefix-icon="el-icon-tickets" size="default" v-model="limit" placeholder="limit"></a-input>
                </a-col>
                <a-col :span="4">
                  <a-input prefix-icon="el-icon-map-location" size="default" v-model="skip" placeholder="Skip"></a-input>
                </a-col>
              </a-col>
            </a-row>
          </div>
        </a-col>
      </a-row>
    </a-card>
    <a-drawer
      title="执行结果"
      placement="bottom"
      :visible="showResult"
      :height="400"
      :mask="false"
      @close="showResult=false"
      :bodyStyle="{padding:'0px 20px'}">
      <div v-if="!time&&!efficctCount" class="time-wrap">
        <i class="el-icon-time"></i>
        <span>时间:{{ time/1000 }}s</span>&nbsp;&nbsp;&nbsp;
        <i class="el-icon-s-data"></i>
        <span>影响:<span style="color: red">{{ efficctCount }}</span>行</span>
      </div>
      <div class="mongo-data-list" v-if="mongoDataList.length&&mongoDataList.length>0">
        <div class="list-header">
          <div class="list-header-key">Key</div>
          <div class="list-header-value">Value</div>
          <div class="list-header-view">View</div>
        </div>
        <div class="scroll-wrap">
          <div class="list-item" v-for="(item, index) in mongoDataList" :key="item">
            <div @click="mongoDataClick(index)" class="list-item-child">
              <i class="el-icon-arrow-right" v-if="monogoDataIndex!=index"></i>
              <i class="el-icon-arrow-down" v-else></i>
              <i class="el-icon-s-comment"></i>
              <div class="list-item-key">
                {{ item.key }}
              </div>
              <div class="list-item-value">
                { {{ item.value }} fields}
              </div>
              <div class="list-item-view" @click.stop="mongoJsonView(item)">
                <a-icon type="eye" />
              </div>
            </div>
            <div class="list-item-result" v-if="monogoDataIndex==index">
              <div v-for="(items, indexs) of item.resultList" class="result-wrap" :key="items" >
                <div class="list-item-result-key">
                  <i class="el-icon-chat-line-square"></i>
                  {{ indexs }}
                </div>
                <ellipsis :length="100" :title="items" tooltip >{{ items }}</ellipsis>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-drawer>
    <a-modal
      title="详情"
      v-model="outerVisible"
      okText="保存"
      @ok="mongoJsonSave"
      :width="800">
      <a-input style="font-size: 15px;" type="textarea" rows="20" v-model.trim="itemJson"></a-input>
    </a-modal>
    <a-modal title="前100执行记录(双击行追加到编辑器)" v-model="historyDialog" width="60%" >
      <a-table
        ref="table"
        size="small"
        rowKey="historyKey"
        :columns="historyColumns"
        :dataSource="sqlHistory"
        :scroll="{y:'350px'}"
        :pagination="false"
      >
        <span slot="index" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
      </a-table>
    </a-modal>
    <a-modal title="帮助说明" v-model="tipsDialog" width="60%" >
      <ul style="padding-left:20px;">
        <li>输入格式规则
          <ul style="padding-left:20px;">
            <li>查询不带limit，最多显示前200条记录，大数据量导出请用专业工具</li>
            <li>文本框输入key值条件,修改输入查询及修改语句key值即可</li>
            <li>Query:db.collection.find({"expireCoupon": {$gt:200}})</li>
            <li>updateMany：db.collection.updateMany({'title':'MongoDB 教程'},{$set:{'title':'MongoDB'}})</li>
            <li>insertMany：db.collection.insertMany([{"b": 3}, {'c': 4}])</li>
            <li>deleteMany：db.collection.deleteMany({'title':'MongoDB 教程'})</li>
          </ul>
        </li>
      </ul>
    </a-modal>
  </div>
</template>

<script>
import { Ellipsis } from '@/components'

export default {
  name: 'Mysql',
  components: { Ellipsis },
  data () {
    return {
      openKeys: [],
      selectKeys: [],
      databaseList: [],
      databaseTable: {},
      query_text: '{}',
      insert_text: '[{}]',
      update_text1: '{}',
      update_text2: '{$set:{}}',
      delete_text: '{}',
      limit: null,
      skip: null,
      mongoDataList: [],
      monogoDataIndex: null,
      time: null,
      showRight: false,
      restaurants: [],
      itemJson: '',
      itemJsonData: {},
      tipsDialog: false,
      sqlHistory: [],
      historyDialog: false,
      outerVisible: false,
      innerVisible: false,
      efficctCount: null,
      timeConsuming: '',
      backupTable: '',
      active: 'query',
      showResult: false,
      historyColumns: [
        {
          title: 'index',
          dataIndex: 'index',
          scopedSlots: { customRender: 'index' },
          width: '70px'
        },
        {
          title: '执行类别',
          dataIndex: 'sqlType',
          width: '100px'
        },
        {
          title: '执行内容',
          dataIndex: 'text'
        },
        {
          title: '受影响记录',
          dataIndex: 'updateCount',
          width: '120px'
        },
        {
          title: '执行时间',
          dataIndex: 'createTime',
          width: '150px'
        }
      ],
      options: {
        alert: { show: false, clear: () => { } }
      }
    }
  },
  mounted () {
    this.$getReq('/api/datasource/list/mongo').then(res => {
      var list = []
      res.data.forEach(item => {
        var row = {
          code: item.sourceCode,
          sourceCode: item.sourceCode,
          label: item.sourceCode
        }
        list.push(row)
        this.databaseTable[item.sourceCode] = row
      })
      this.databaseList = list
    })
  },
  deactivated () {
    this.showResult = false
  },
  computed: {
    datasource () {
      return this.openKeys[0]
    },
    tableName () {
      return this.selectKeys[0]
    }
  },
  methods: {
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

      this.$getReq('/api/mongo-data/getTableFileds', { datasource: sourceCode }).then(res => {
        var list = []
        var tables = res.data.sort()
        tables.forEach(item => {
          list.push({ code: item, label: item, database: sourceCode, leaf: true, value: item })
        })
        this.$set(database, 'children', list)
      })
    },
    selectTableMenu () {
    },
    mongoJsonView (item) {
      this.itemJsonData = item
      this.itemJson = JSON.stringify(JSON.parse(JSON.stringify(item.resultList)), null, '\t')
      this.outerVisible = true
    },
    mongoDataClick (val) {
      if (this.monogoDataIndex === val) {
        this.monogoDataIndex = null
        return
      }
      this.monogoDataIndex = val
    },
    mongoJsonSave () {
      if (!this.datasource) {
        this.$message.error('请选择数据库')
        return
      }
      if (!this.tableName) {
        this.$message.error('请选择表')
        return
      }
      const params = {
        datasource: this.datasource,
        tableName: this.tableName,
        script: "{'_id':'" + this.itemJsonData.key + "'}",
        updateScript: '{$set:' + this.itemJson + '}',
        type: 'updateMany',
        backup: false
      }
      this.$postJsonReq('/api/mongo-data/updateAdvance', params).callSuccess(res => {
        // console.log(res.data.mongoDataList)
        this.mongoDataList = res.data.mongoDataList
        this.efficctCount = res.data.efficctCount
        this.time = res.data.time
        this.outerVisible = false
      })
    },
    queryHistory () {
      this.$getReq('/api/mysql-data/getMyLog', { datasource: this.datasource }).then(res => {
        this.sqlHistory = res.data
        this.historyDialog = true
      })
    },
    executeMongo () {
      if (!this.datasource) {
        this.$message.error('请选择数据库')
        return
      }
      if (!this.tableName) {
        this.$message.error('请选择表')
        return
      }
      this.monogoDataIndex = null
      const params = {
        datasource: this.datasource,
        tableName: this.tableName,
        script: '',
        limit: this.limit ? this.limit : 200,
        skip: this.skip ? this.skip : 0,
        type: this.active
      }
      let url = ''
      switch (this.active) {
        case 'query':
          params.script = this.query_text
          url = '/api/mongo-data/queryAdvance'
          break
        case 'insertMany':
          params.script = this.insert_text
          url = '/api/mongo-data/insertAdvance'
          break
        case 'updateMany':
          url = '/api/mongo-data/updateAdvance'
          params.script = this.update_text1
          params.updateScript = this.update_text2
          break
        case 'deleteMany':
          params.script = this.delete_text
          url = '/api/mongo-data/updateAdvance'
          break
      }
      if (this.active === 'updateMany' || this.active === 'deleteMany') {
        var that = this
        this.$confirm({
          title: '风险提示',
          content: '操作存在风险，是否在执行前进行数据备份?',
          onOk: () => {
            params.backup = true
            that.$postJsonReq(url, params).then(res => {
              that.mongoDataList = res.data.mongoDataList
              that.efficctCount = res.data.efficctCount
              that.time = res.data.time
              that.showResult = true
            })
          },
          onCancel () {
            that.$postJsonReq(url, params).then(res => {
              that.mongoDataList = res.data.mongoDataList
              that.efficctCount = res.data.efficctCount
              that.time = res.data.time
              that.showResult = true
            })
          }
        })
      } else {
        this.$postJsonReq(url, params).then(res => {
          this.mongoDataList = res.data.mongoDataList
          this.efficctCount = res.data.efficctCount
          this.time = res.data.time
          this.showResult = true
        })
      }
    }
  }
}
</script>

<style scoped>
  .mongo-database-tree td, th{
    padding: 0px 0;
  }
  .mongo-data-list {
    font-size: 13px;
    cursor: pointer;
  }
  .scroll-wrap {
    height: 300px;
    overflow: auto;
  }
  .list-item {
    overflow: hidden;
  }
  .list-item-child {
    overflow: hidden;
    padding: 5px 0;
  }
  .list-item-child:hover {
    background: #f0f7ff;
  }
  .list-item-child i {
    float: left;
    margin-right: 5px;
  }
  .list-item-key {
    width: 400px;
    float: left;
  }
  .list-item-value {
    float: left;
  }
  .list-item-view {
    float: right;
      margin-right: 18%;
    padding: 0 20px;
  }
  .list-item-result-key {
    width: 400px;
    float: left;
    margin-left: 30px;
  }
  .list-item-result-value {
    float: left;
  }
  .result-wrap {
    overflow: hidden;
    color: #999;
    padding: 5px;
  }
  .list-header {
    overflow: hidden;
    font-size: 13px;
    padding: 7px 36px;
    color: #333;
  }
  .list-header-key {
    width: 400px;
    float: left;
  }
  .list-header-value {
    float: left;
  }
  .list-header-view {
    float: right;
    margin-right: 18%;
  }
  .time-wrap {
    overflow: hidden;
    padding: 0px 23px 0px;
    font-size: 11px;
  }
  .time-wrap div {
    float: left;
    width: 200px;
  }
  .el-autocomplete-suggestion li{
    font-size: 12px;
  }
  .line-hidden{
    display:block;overflow:hidden;white-space:nowrap;-o-text-overflow:ellipsis;text-overflow:ellipsis;width: 200px;
  }
</style>
