<template>
  <div>
    <a-card>
      <a-list size="large" :showPagination="false">
        <a-list-item :key="index" v-for="(item, index) in data">
          <a-list-item-meta >
            <a slot="title">{{ item.exportName }}</a>
            <template slot="description">
              <a-tag v-if="item.excelStatus === 0" >等待</a-tag>
              <a-tag v-else-if="item.excelStatus === 1" color="#108ee9" >处理中</a-tag>
              <a-tag v-else-if="item.excelStatus === 2" color="#87d068" >成功</a-tag>
              <a-tag v-else-if="item.excelStatus === 3 "color="#f50" >异常</a-tag>
              <a-tag v-else-if="item.excelStatus === 4" color="rgb(110, 114, 109)" >拒绝</a-tag>
              <a-tag v-else >其他</a-tag>
              <ellipsis v-if="item.errorMsg" :length="200" :title="item.errorMsg" >{{item.errorMsg}}</ellipsis>
            </template>
          </a-list-item-meta>
          <div slot="actions" v-if="item.downloadPath">
            <template>
              <a-button type="primary" icon="cloud-download" title="下载" @click="downloadPath(item)" />
            </template>
          </div>
        </a-list-item>
      </a-list>
    </a-card>
  </div>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import { Button, Icon } from 'ant-design-vue/es'

export default {
  name: 'Export',
  components: {
    STable,
    Ellipsis,
    Button,
    Icon
  },
  data () {
    return {
      data: [],
      selectedRowKeys: [],
      start: 0,
      limit: 10,
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
      this.$getReq('/api/export/list/' + this.start + '/' + this.limit).then(res => {
        this.data = res.data
      })
    },
    downloadPath (item) {
      window.open(item.downloadPath)
    }
  }
}
</script>

<style scoped>

</style>
