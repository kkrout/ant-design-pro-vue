<template>
  <div>
    <a-card title="我的导出列表">
      <div slot="extra">
        <a-radio-group v-model="status" @change="query">
          <a-radio-button :value="null">全部</a-radio-button>
          <a-radio-button :value="0">等待</a-radio-button>
          <a-radio-button :value="1">进行中</a-radio-button>
          <a-radio-button :value="2">成功</a-radio-button>
          <a-radio-button :value="3">失败</a-radio-button>
        </a-radio-group>
        <a-input-search @search="query" v-model="exportName" style="margin-left: 16px; width: 272px;" />
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
              <a slot="title">{{ item.exportName }}</a>
              <!--<span style="margin-left:50px;">{{ item.createTime }}</span>-->
              <!--</template>-->
              <template slot="avatar">
                <a-tag v-if="item.excelStatus === 0" >等待</a-tag>
                <a-tag v-else-if="item.excelStatus === 1" color="#108ee9" >处理中</a-tag>
                <a-tag v-else-if="item.excelStatus === 2" color="#87d068" >成功</a-tag>
                <a-tag v-else-if="item.excelStatus === 3 "color="#f50" >异常</a-tag>
                <a-tag v-else-if="item.excelStatus === 4" color="rgb(110, 114, 109)" >拒绝</a-tag>
                <a-tag v-else >其他</a-tag>
              </template>
              <a-tooltip slot="description" v-if="item.errorMsg" placement="top" style="width: 100vh;" >
                <div class="sql-error" >{{ item.errorMsg }}</div>
                <div slot="title" class="sql-error-tip">{{ item.errorMsg }}</div>
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
      data: [],
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
  },
  methods: {
    query () {
      this.$postJsonReq('/api/export/list/0/' + this.limit, {
        excelStatus: this.status,
        exportName: this.exportName
      }).then(res => {
        this.data = res.data
        this.busy = false
        this.$refs.result.scrollTop = 0
      })
    },
    nextData () {
      var start = this.data.length
      this.$postJsonReq('/api/export/list/' + start + '/' + this.limit, {
        excelStatus: this.status,
        exportName: this.exportName
      }).then(res => {
        if (!res.data.length) {
          this.busy = true
          return
        }

        this.data = this.data.concat(res.data)
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
