<template>
  <div>
    <a-card title="我的导出列表">
      <div slot="extra">
        <a-radio-group v-model="param.sqlType" @change="query">
          <a-radio-button :value="null">全部</a-radio-button>
          <a-radio-button value="select">Mysql查询</a-radio-button>
          <a-radio-button value="update">Mysql更新</a-radio-button>
          <a-radio-button value="query">Mongo查询</a-radio-button>
          <a-radio-button value="updateMany">Mongo修改</a-radio-button>
          <a-radio-button value="deleteMany">Mongo删除</a-radio-button>
        </a-radio-group>
        <a-input-search @search="query" placeholder="执行人" v-model="param.createBy" style="margin: 0 16px; width: 272px;" />
        <a-select
          v-model="param.datasource"
          allowClear
          showSearch
          placeholder="选择数据源"
          @change="query"
          style="width:300px;">
          <a-select-option
            v-for="item in datasources"
            :value="item.sourceCode"
            :key="item.sourceCode" >{{ item.sourceCode }}</a-select-option>
        </a-select>
      </div>
      <a-list size="large" :showPagination="false">
        <a-empty v-if="!data.length" style="height: calc(100vh - 200px);line-height: calc(100vh - 200px);" ></a-empty>
        <div
          ref="result"
          style="height: calc(100vh - 200px);overflow-y: auto;"
          infinite-scroll-disabled="busy"
          infinite-scroll-distance="10"
          v-infinite-scroll="handleInfiniteOnLoad" >
          <a-list-item v-for="item in data" :key="item.id" >
            <a-list-item-meta >
              <!--<template slot="title" >-->
              <!--<span style="margin-left:50px;">{{ item.createTime }}</span>-->
              <!--</template>-->
              <a-button slot="avatar" type="link" block>{{ item.datasource }}</a-button>
              <a-tooltip slot="description" placement="top" style="width: 100vh;" >
                <div class="sql-error" >{{ item.text }}</div>
                <div slot="title" class="sql-error-tip">{{ item.text }}</div>
              </a-tooltip>
            </a-list-item-meta>
            <div slot="actions" style="width: 100px;">
              <a-button
                v-if="item.downloadPath"
                type="primary"
                icon="cloud-download"
                title="下载"
                @click="downloadPath(item)" />
            </div>
            <div class="list-content">
              <div class="list-content-item">
                <a-tag v-if="item.sqlType === 'select'" >Mysql查询</a-tag>
                <a-tag v-else-if="item.sqlType === 'update'" color="#108ee9" >Mysql更新</a-tag>
                <a-tag v-else-if="item.sqlType === 'query'" color="#87d068" >Mongo查询</a-tag>
                <a-tag v-else-if="item.sqlType === 'updateMany' "color="#f50" >Mongo修改</a-tag>
                <a-tag v-else-if="item.sqlType === 'deleteMany'" color="rgb(110, 114, 109)" >Mongo删除</a-tag>
                <a-tag v-else > 其他类型：{{ item.sqlType }}</a-tag>
              </div>
              <div class="list-content-item">
                <span>创建时间</span>
                <p>{{ item.createTime }}</p>
              </div>
            </div>
          </a-list-item>
        </div>
      </a-list>
    </a-card>
  </div>
</template>

<script>
import { STable, Ellipsis, ProcessBar } from '@/components'
import { Button, Icon } from 'ant-design-vue/es'

export default {
  name: 'Export',
  components: {
    STable,
    Ellipsis,
    Button,
    Icon,
    ProcessBar
  },
  data () {
    return {
      param: { sqlType: null },
      data: [],
      datasources: [],
      start: 1,
      selectedRowKeys: [],
      limit: 10,
      busy: true,
      status: null,
      exportName: '',
      options: {
        alert: { show: false, clear: () => { this.selectedRowKeys = [] } },
        rowSelection: {
          selectedRowKeys: this.selectedRowKeys,
          onChange: this.onSelectChange
        }
      }
    }
  },
  mounted () {
    this.query()
    this.$getReq('/api/datasource/list/mysql').then(res => {
      this.datasources = res.data
    })
  },
  methods: {
    query () {
      this.$postJsonReq('/api/mysql-data/logPage/' + this.limit + '/1', this.param).then(res => {
        this.data = res.data.list
        this.start = res.data.pageNum
        this.busy = false
        this.$refs.result.scrollTop = 0
      })
    },
    nextData () {
      var start = this.start + 1
      this.$postJsonReq('/api/mysql-data/logPage/' + this.limit + '/' + start, this.param).then(res => {
        if (!res.data.list.length) {
          this.busy = true
          return
        }
        console.log(res.data.pageNum)
        this.start = res.data.pageNum
        this.data = this.data.concat(res.data.list)
      })
    },
    downloadPath (item) {
      window.open(item.downloadPath)
    },
    handleInfiniteOnLoad () {
      this.nextData()
    }
  }
}
</script>

<style>
  .ant-tooltip-inner{
    display: inline-block;
  }
</style>
<style lang="less" scoped>
  .list-content-item {
    color: rgba(0, 0, 0, .45);
    display: inline-block;
    vertical-align: middle;
    font-size: 14px;
    margin-left: 40px;
    span {
      line-height: 20px;
    }
    p {
      margin-top: 4px;
      margin-bottom: 0;
      line-height: 22px;
    }
  }
  .sql-error{
    overflow:hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width:100vh;
  }
  .sql-error-tip{
    overflow-x:hidden;
    overflow-y: auto;
    width:100vh;
    max-height: 200px;
  }
</style>
