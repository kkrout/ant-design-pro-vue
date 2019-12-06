<template>
  <div>
    <a-card class="mysql-advance">
      <div slot="title" style="padding: 5px 0px;">
        <a-button-group>
          <a-tooltip class="item" effect="dark" content="Ctrl+D" placement="bottom">
            <a-button size="small" type="primary" @click="executeSql" >执行查询</a-button>
          </a-tooltip>
          <a-tooltip class="item" effect="dark" content="Ctrl+D" placement="bottom">
            <a-button size="small" type="primary" @click="exportSql" >后台导出</a-button>
          </a-tooltip>
          <!--<el-button size="mini" type="primary" >保存</el-button>-->
          <a-tooltip class="item" effect="dark" content="Ctrl+M" placement="bottom">
            <a-button size="small" type="success" @click="formatSql" >美化</a-button>
          </a-tooltip>
          <a-tooltip class="item" effect="dark" content="Ctrl+B" placement="bottom">
            <a-button size="small" type="info" @click="showResult=!showResult">
              {{ showResult?"关闭":"打开" }}结果</a-button>
          </a-tooltip>
          <a-tooltip class="item" effect="dark" content="Alt+H" placement="bottom">
            <a-button size="small" type="info" @click="queryHistory">执行历史</a-button>
          </a-tooltip>
          <a-button size="small" type="warning" @click="tipsDialog=true" >帮助说明</a-button>
        </a-button-group>
        <span style="margin-left:10px;margin-top:5px;">
          <a-checkbox @change="autoLine" v-model="lineWrapping" >自动换行</a-checkbox>
        </span>
        <div style="float:right;">
          <a-button size="small" type="danger" @click="executeUpdateSql" >执行变更</a-button>
        </div>
      </div>
      <div>
        <textarea ref="sqlEditor" style="display: none;" ></textarea>
      </div>
    </a-card>

    <a-drawer
      title="执行结果"
      placement="bottom"
      :visible="showResult"
      :height="resultHeight"
      :mask="false"
      @close="showResult=false" >
      <div ref="result" class="mysql-advance-result">
        <Excel ref="excelResult" v-if="queryFieldList.length" ></Excel>
        <div v-else style="height:200px;background:white;text-align: center">
          <h2 v-if="!efficctCount">无结果</h2>
          <h2 else>
            受影响，{{ efficctCount }}行<br/>
            备份表：{{ backupTable }}
          </h2>
        </div>
        <div>查询耗时：{{ timeConsuming/1000 }}s</div>
      </div>
    </a-drawer>

    <a-modal title="前100执行记录(双击行追加到编辑器)" v-model="historyDialog" width="60%" >
      <s-table
        ref="table"
        size="default"
        rowKey="historyKey"
        :columns="historyColumns"
        :data="loadData"
        :alert="options.alert"
        :showPagination="false"
      >
        <span slot="index" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
      </s-table>
    </a-modal>

    <a-modal title="帮助说明" v-model="tipsDialog" width="60%" >
      <ul style="padding-left:20px;">
        <li>规则
          <ul style="padding-left:20px;">
            <li>查询和修改执行按钮分开，避免误操作带来的风险</li>
            <li>执行修改操作时，会进行风险提示，可根据自己的经验判断是否需要备份，备份则备份，不备份则不备份，点击关闭按钮，则不做任何操作</li>
            <li>查询不带limit，最多显示前500条记录，大数据量导出请用专业工具</li>
            <li>只能执行一条sql返回一条结果，不支持多条sql，需要执行的sql不要带分号</li>
          </ul>
        </li>
        <li>快捷键
          <ul style="padding-left:20px;">
            <li>Alt+Enter，自动联想表，字段，语法关键字</li>
            <li>Ctrl+D, 执行sql，可选择需要执行的语句进行执行</li>
            <li>Ctrl+M，美化sql</li>
            <li>Ctrl+B，打开和关闭结果面板</li>
            <li>Alt+H，查看历史执行sql</li>
          </ul>
        </li>
      </ul>
    </a-modal>
    <a-modal title="帮助说明" v-model="sourceModal" width="60%" :footer="null" >
      <div style="height:calc(100vh - 300px);overflow-y: auto;" >
        <a-list size="small" :showPagination="false">
          <a-list-item :key="index" v-for="(item, index) in databaseList">
            <a-list-item-meta>
              <a slot="title">{{ item.sourceCode }}</a>
            </a-list-item-meta>
            <div slot="actions">
              <template>
                <a-button type="primary" icon="check" title="选择" @click="chooseSource(item)" >选择</a-button>
              </template>
            </div>
          </a-list-item>
        </a-list>
      </div>
    </a-modal>
  </div>
</template>

<script>
import $ from 'jquery'
import * as CodeMirror from 'codemirror/lib/codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/sql/sql'
import 'codemirror/addon/hint/sql-hint'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/show-hint.css'
import sqlFormatter from 'sql-formatter'
import { Excel, STable } from '@/components'

export default {
  name: 'MysqlAdvance',
  components: {
    Excel, STable
  },
  data: function () {
    return {
      sqlEditor: null,
      datasource: '',
      queryResultList: [],
      queryFieldList: [],
      showResult: false,
      efficctCount: null,
      sqlHistory: [],
      historyDialog: false,
      tipsDialog: false,
      backupTable: '',
      timeConsuming: '',
      lineWrapping: false,
      resultHeight: 270,
      databaseList: [],
      sourceModal: false,
      options: {
        alert: { show: false, clear: () => { } }
      },
      historyColumns: [
        {
          title: 'index',
          dataIndex: 'index',
          scopedSlots: { customRender: 'index' }
        },
        {
          title: '执行类别',
          dataIndex: 'sqlType',
          width: '150px'
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
          dataIndex: 'createTime'
        }
      ]
    }
  },
  watch: {
    queryFieldList (v) {
      if (v.length) {
        this.resultHeight = 400
      } else {
        this.resultHeight = 270
      }
    },
    showResult (v) {
      if (v) {
        const height = $(document).height() - 440
        this.sqlEditor.setSize(null, height)
      } else {
        const height = $(document).height() - 100
        this.sqlEditor.setSize(null, height)
      }
    }
  },
  methods: {
    loadData (parameter) {
      var that = this
      return new Promise((resolve, reject) => {
        that.$getReq('/api/mysql-data/getMyLog', { datasource: this.datasource }).then(res => {
          resolve(res)
        })
      })
    },
    init (tableFields) {
      var that = this
      this.sqlEditor = CodeMirror.fromTextArea(this.$refs.sqlEditor, {
        mode: 'text/x-mysql',
        indentWithTabs: true,
        smartIndent: true,
        lineNumbers: true,
        matchBrackets: true,
        autofocus: true,
        lineWrapping: this.lineWrapping,
        extraKeys: {
          'Alt-Enter': 'autocomplete',
          'Ctrl-D': function () {
            that.executeSql()
          },
          'Ctrl-M': function () {
            that.formatSql()
          },
          'Ctrl-B': function () {
            that.showResult = !that.showResult
          },
          'Alt-H': function () {
            that.queryHistory()
          }
        },
        hintOptions: { tables: tableFields }
      })
      var height = $(document).height() - 100
      this.sqlEditor.setSize(null, height)
      // 获取本地历史
      this.sqlEditor.setValue(this.getLocalCache())

      this.sqlEditor.on('change', () => {
        this.saveLocalCache()
        this.showMyHint()
      })
    },
    getTableFields () {
      this.$getReq('/api/mysql-data/getTableFileds', { datasource: this.datasource }).then(res => {
        this.init(res.data)
      })
    },
    autoLine () {
      this.sqlEditor.setOption('lineWrapping', this.lineWrapping)
      window.localStorage.setItem('CONFIG_LINE_WRAPPING', this.lineWrapping)
    },
    showMyHint () {
      var cur = this.sqlEditor.getCursor()
      var curLine = this.sqlEditor.getLine(cur.line)
      var endGroup = curLine.match(/^(.*\S+\s+)(\S+)|(\S+)$/)
      var word = endGroup && (endGroup[3] || endGroup[2])
      return word
    },
    formatSql () {
      if (this.sqlEditor) {
        var content = this.sqlEditor.getValue()
        this.sqlEditor.setValue(sqlFormatter.format(content))
      }
    },
    executeSql () {
      var sql = this.sqlEditor.getSelection() || this.sqlEditor.getValue()
      if (!sql) {
        this.$message.error('没有什么可以执行的')
        return
      }
      this.$postJsonReq('/api/mysql-data/searchAdvance', { datasource: this.datasource, script: sql, useScript: true }).then(res => {
        this.queryFieldList = res.data.fields
        this.queryResultList = res.data.resultList
        this.efficctCount = res.data.efficctCount
        this.timeConsuming = res.data.time
        this.showResult = true

        this.$nextTick(() => {
          this.loadExcel(res.data)
        })
      })
    },
    calcTabWith (item) {
      var w = item.length * 14
      return w < 70 ? 70 : w
    },
    executeUpdateSql () {
      var sql = this.sqlEditor.getSelection() || this.sqlEditor.getValue()
      if (!sql) {
        this.$message.error('没有什么可以执行的')
        return
      }
      var that = this

      this.$confirm({
        title: '风险提示',
        content: '操作存在风险，是否在执行前进行数据备份，关闭则不做任何操作?',
        onOk: () => {
          // 备份执行
          that.$postJsonReq('/api/mysql-data/updateAdvance', { datasource: that.datasource,
            script: sql,
            useScript: true,
            backup: true }).then(res => {
            that.queryFieldList = []
            that.queryResultList = []
            that.efficctCount = res.data.efficctCount
            that.showResult = true
            that.backupTable = res.data.backupTable
          })
        },
        onCancel () {
          that.$postJsonReq('/api/mysql-data/updateAdvance', { datasource: that.datasource,
            script: sql,
            useScript: true }).then(res => {
            that.queryFieldList = []
            that.queryResultList = []
            that.efficctCount = res.data.efficctCount
            that.showResult = true
            that.backupTable = ''
          })
        }
      })
    },
    queryHistory () {
      this.historyDialog = true
    },
    appendSql (row) {
      var content = this.sqlEditor.getValue()

      content = content + '\n' + row.text

      this.sqlEditor.setValue(content)

      this.historyDialog = false
    },
    saveLocalCache () {
      var v = this.sqlEditor.getValue()
      window.localStorage.setItem('sql_cache_' + this.datasource, v)
    },
    getLocalCache () {
      return window.localStorage.getItem('sql_cache_' + this.datasource) || ''
    },
    clearLocalCache () {
      return window.localStorage.removeItem('sql_cache_' + this.datasource)
    },
    loadExcel (result) {
      var columns = []
      result.fields.forEach(item => {
        columns.push({
          type: 'text', title: item, width: '120px'
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
      var width = $(this.$refs.result).width()
      var option = {
        data: data,
        columns: columns,
        tableHeight: '220px',
        tableOverflow: true,
        tableWidth: width + 'px',
        search: true,
        csvFileName: '导出数据',
        pagination: 2000,
        paginationOptions: [2000, 5000, 10000]
      }
      this.$refs.excelResult.load(option)
    },
    openDatasourceList () {
      this.sourceModal = true
      this.$getReq('/api/datasource/list/mysql').then(res => {
        this.databaseList = res.data
      })
    },
    chooseSource (data) {
      window.location.href = '?sourceCode=' + data.sourceCode
    },
    exportSql () {
      var sql = this.sqlEditor.getSelection() || this.sqlEditor.getValue()
      if (!sql) {
        this.$message.error('没有什么可以执行的')
        return
      }
      this.$post('/api/export/exportSql', { sql: sql, datasource: this.datasource }).then(res => {
        // var that = this
        this.$confirm({
          title: '提示',
          content: '任务添加成功，是否跳转到我的导出列表进行查看进度？',
          onOk: () => {
            if (window.opener == null) {
              this.$router.push({ name: 'Export' })
            } else {
              window.open('', '_self').close()
            }
          },
          onCancel () {
          }
        })
      })
    }
  },
  /* 组件创建完成事件  */
  created: function () {
    var lineWrap = window.localStorage.getItem('CONFIG_LINE_WRAPPING')
    this.lineWrapping = lineWrap === 'true'
  },
  /* 模板编译挂载完成事件 类似小程序onload */
  mounted: function () {
    // 接收数据
    this.datasource = this.$route.query.sourceCode
    if (!this.datasource) {
      this.$message.warning('请选择数据源')
      this.openDatasourceList()
      return
    }
    document.title = this.datasource + '高级查询'
    this.$nextTick(() => {
      this.getTableFields()
    })
  },
  /* 组件更新完成事件 */
  updated: function () {
  },
  /*  组件被激活 类似小程序onshow */
  activated: function () {
    if (this.sqlEditor) {
      var lineWrap = window.localStorage.getItem('CONFIG_LINE_WRAPPING')
      this.lineWrapping = lineWrap === 'true'
      this.autoLine(this.lineWrapping)
    }
  },
  /*  组件未被激活 类似小程序ondestroy */
  deactivated: function () {
  },
  destroyed () {
    this.clearLocalCache()
  }
}
</script>

<style scoped>
  .mysql-advance .CodeMirror{
    font-size: 18px !important;
  }
  .mysql-result-table td, th{
    padding: 0px 0;
  }
  .CodeMirror-hints.default{
    font-size:16px!important;
  }
  .mysql-advance-result{
    position: absolute;
    bottom: 0px;
    width: calc(100% - 10px);
    left: 0px;
    z-index: 10;
    border-top: 1px solid rgb(204, 204, 204);
  }
  .ant-drawer-header{
    padding:6px 24px;
  }
</style>
