<template>
  <div>
    <a-card :bordered="false" >
      <a-input-search slot="title" placeholder="建设中。。。" style="margin-left: 16px; width: 200px;" />
      <div slot="extra">
        <a-button type="primary" style="margin-left: 16px;" icon="plus" @click="toAdd" >创建</a-button>
      </div>
      <a-row :gutter="{ xs: 8, sm: 16, md: 24}">
        <a-col :span="5">
          <a-menu
            ref="menu"
            class="left-menu"
            mode="inline"
            :openKeys.sync="openKeys"
            v-model="selectKeys"
            @openChange="onOpenChange"
            @select="selectReport"
          >
            <a-sub-menu v-for="item in groupList" :key="item" >
              <span slot="title" :style="{color:openKeys.includes(item) ? 'red' : '' }" >
                <a-icon type="pie-chart" /><span>{{ item }}</span></span>
              <template v-if="reportMap[item]">
                <a-menu-item v-for="sub in reportMap[item]" :key="sub.id">{{ sub.name }}</a-menu-item>
              </template>
            </a-sub-menu>
          </a-menu>
        </a-col>
        <a-col :span="19">
          <a-tabs v-if="config" v-model="tabKey" @change="changeTab" >
            <a-tab-pane tab="导出" key="1" >
              <div class="tab-body" >
                <detail-list :col="2" >
                  <detail-list-item v-for="item in config.coonditionJson" :term="item.showName" :key="item.key">
                    <a-date-picker v-model="paramData[item.key]" v-if="item.paramType === 'date' " style="width:80%;" />
                    <a-date-picker v-model="paramData[item.key]" v-else-if="item.paramType === 'datetime' " showTime style="width:80%;" />
                    <a-select v-model="paramData[item.key]" v-else-if="item.paramType === 'select' " style="width:80%;">
                      <a-select-option v-for="sub in item.kvList" :key="sub.key">{{ sub.value }}</a-select-option>
                    </a-select>
                    <a-select v-model="paramData[item.key]" mode="multiple" v-else-if="item.paramType === 'multiple' " style="width:80%;">
                      <a-select-option v-for="sub in item.kvList" :key="sub.key">{{ sub.value }}</a-select-option>
                    </a-select>
                    <a-input v-model="paramData[item.key]" v-else style="width:80%;"/>
                  </detail-list-item>
                </detail-list>
              </div>
              <div style="text-align: center;">
                <a-button type="primary" @click="exportData" style="margin-right: 20px;">导出</a-button>
              </div>
            </a-tab-pane>
            <a-tab-pane tab="配置" key="2" >
              <a-steps :current="current">
                <a-step title="SQL配置" @click="current=0" ></a-step>
                <a-step title="配置条件" @click="current=1" ></a-step>
                <a-step title="配置字段" @click="current=2" ></a-step>
              </a-steps>
              <div v-show="current == 0" class="tab-body" >
                <a-form >
                  <a-row >
                    <a-col :span="8" >
                      <a-form-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label="报表名称">
                        <a-input v-model="config.name" />
                      </a-form-item>
                    </a-col>
                    <a-col :span="8" >
                      <a-form-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label="数据源">
                        <a-select
                          v-model="config.sourceCode"
                          allowClear
                          showSearch
                          placeholder="选择数据源"
                          style="width:300px;">
                          <a-select-option
                            v-for="item in datasources"
                            :value="item.sourceCode"
                            :key="item.sourceCode" >{{ item.sourceCode }}</a-select-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                  </a-row>
                </a-form>
                <textarea ref="sqlEditor" style="display: none;height: 100%;" ></textarea>
              </div>
              <div v-show="current == 1" class="tab-body" >
                <detail-list :col="4" >
                  <template v-for="(item) in config.coonditionJson">
                    <detail-list-item term="参数字段" :key="item.key+'1'" >
                      <a-input v-model="item.field" placeholder="参数字段" style="width: 80%;" />
                    </detail-list-item>
                    <detail-list-item term="显示名称" :key="item.key+'4'" >
                      <a-input v-model="item.showName" placeholder="显示名称" style="width: 80%;" />
                    </detail-list-item>
                    <detail-list-item term="条件运算符" :key="item.key+'2'" >
                      <a-select v-model="item.operator" style="width: 80%;" placeholder="条件运算符" >
                        <a-select-option value="<" >小于</a-select-option>
                        <a-select-option value=">" >大于</a-select-option>
                        <a-select-option value="=" >等于</a-select-option>
                        <a-select-option value="like" >包含</a-select-option>
                        <a-select-option value="in" >in</a-select-option>
                        <a-select-option value="between" >between</a-select-option>
                      </a-select>
                    </detail-list-item>
                    <detail-list-item term="参数类型" :key="item.key+'3'" >
                      <a-select v-model="item.paramType" style="width: 80%;" placeholder="参数类型" >
                        <a-select-option value="text" >文本</a-select-option>
                        <a-select-option value="date" >日期</a-select-option>
                        <a-select-option value="datetime" >时间</a-select-option>
                        <a-select-option value="select" >单选下拉</a-select-option>
                        <a-select-option value="multiple" >多选下拉</a-select-option>
                      </a-select>
                    </detail-list-item>
                  </template>
                  <a-empty v-if="!config.coonditionJson || !config.coonditionJson.length " description="暂无条件" />
                </detail-list>
              </div>
              <div v-show="current == 2" class="tab-body">
                <detail-list :col="2" >
                  <detail-list-item v-for="item in config.fieldJson" :term="item.name" :key="item.name" >
                    <a-input v-model="item.display" placeholder="显示名称" style="width: 80%;" />
                  </detail-list-item>
                </detail-list>
              </div>
              <div style="text-align: center;">
                <a-button v-show="current == 0" type="primary" @click="parseParam" style="margin-right: 20px;">条件设置</a-button>
                <a-button v-show="current == 0" type="primary" @click="formatSql" style="margin-right: 20px;">美化</a-button>
                <a-button v-show="current == 1" type="primary" @click="produceSql" style="margin-right: 20px;">校验</a-button>
                <a-button v-show="current == 2" type="primary" @click="finsh" style="margin-right: 20px;">完成</a-button>
                <a-button>取消</a-button>
              </div>
            </a-tab-pane>
          </a-tabs>
        </a-col>
      </a-row>
    </a-card>
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

import DetailList from '@/components/tools/DetailList'
const crypto = require('crypto')
const DetailListItem = DetailList.Item

export default {
  name: 'BusinessReport',
  components: { DetailList, DetailListItem },
  data: function () {
    return {
      openKeys: [],
      selectKeys: [],
      groupList: ['MPS', 'MDM', 'MPC', 'ORDER'],
      current: 0,
      sqlEditor: null,
      coondition: [],
      config: null,
      tabKey: '1',
      reportMap: {},
      paramData: {},
      datasources: []
    }
  },
  mounted () {
    this.$getReq('/api/datasource/list/mysql').then(res => {
      this.datasources = res.data
    })
  },
  methods: {
    toAdd () {
      var group = this.openKeys[0]
      if (!group) {
        this.$message.error('请选择分组')
        return
      }
      this.config = {
        coonditionJson: [],
        fieldJson: []
      }
      this.config.group = group
      this.tabKey = '2'
      this.$nextTick(() => {
        !this.sqlEditor && this.initEditor()
      })
    },
    initEditor () {
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
          'Ctrl-M': function () {
            that.formatSql()
          }
        }
        // hintOptions: { tables: tableFields }
      })
      var height = $(document).height() - 430
      this.sqlEditor.setSize(null, height)
      console.log(this.sqlEditor)
    },
    parseParam () {
      var sql = this.sqlEditor.getValue()
      var params = sql.match(/(\/\*@\S+\*\/)/g) || []
      var coondi = []
      var fields = []

      params.forEach((item, index) => {
        var param = item.replace(/^\/\*@(\S+)\*\/$/gi, '$1')
        if (fields.includes(item)) {
          return
        }
        var paramKvs = param.split('=')
        fields.push(item)
        coondi.push({
          key: this.getMd5Code(item),
          name: item,
          showName: paramKvs[1] || '',
          field: paramKvs[0],
          operator: '=',
          paramType: 'text',
          kvList: []
        })
      })
      this.config.coonditionJson = coondi

      this.current = 1
    },
    produceSql () {
      var sql = this.sqlEditor.getValue()
      this.config.script = sql
      var fields = []
      this.$postJsonReq('/api/business-report/valid-sql', this.config).then(res => {
        res.data.fields.forEach(item => {
          fields.push({
            name: item,
            display: item
          })
        })
        this.current = 2
        this.config.fieldJson = fields
      })
    },
    finsh () {
      this.config.group = this.openKeys[0]
      if (!this.config.group) {
        this.$message.error('请选择分组')
        return
      }
      if (!this.config.name) {
        this.$message.error('请输入报表名称')
        return
      }
      this.$postJsonReq('/api/business-report/save', this.config)
        .then(res => {
          // 重新更新组
          this.loadGroup(this.config.group)
          this.selectKeys = []
          this.config = null
          this.tabKey = '1'
        })
    },
    formatSql () {
      if (this.sqlEditor) {
        var content = this.sqlEditor.getValue()
        this.sqlEditor.setValue(sqlFormatter.format(content))
      }
    },
    getMd5Code (v) {
      const hash = crypto.createHash('md5')
      return hash.update(v).digest('hex')
    },
    onOpenChange (openKeys) {
      const latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1)
      this.$nextTick(() => {
        this.openKeys = latestOpenKey ? [latestOpenKey] : []
      })

      var group = openKeys[0]
      if (!group) return

      var list = this.reportMap[group]
      if (list !== undefined) {
        return
      }
      this.loadGroup(group)
    },
    loadGroup (group) {
      this.$getReq('/api/business-report/group-list', { group: group }).then(res => {
        this.$set(this.reportMap, group, res.data)
      })
    },
    selectReport ({ key }) {
      this.$getReq('/api/business-report/get/' + key).then(res => {
        this.config = res.data
        this.paramData = {}
        this.setSql(this.config.script)
      })
    },
    changeTab (key) {
      if (key === '2') {
        this.$nextTick(() => {
          !this.sqlEditor && this.initEditor()
          this.setSql(this.config.script)
        })
      }
    },
    setSql (sql) {
      sql && this.sqlEditor && this.sqlEditor.setValue(sql)
    },
    exportData () {
      this.$postJsonReq('/api/business-report/export/' + this.config.id, this.paramData).then(res => {
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
  }
}
</script>

<style scoped>
  .tab-body{
    height:calc(100vh - 340px);
    padding-top:20px;
    overflow: auto;
  }
  .left-menu{
    width: 100%;
    height:calc(100vh - 250px);
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
