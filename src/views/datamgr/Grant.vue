<template>
  <div>
    <a-tooltip placement="left" style="position: fixed;right: 20px;top:50%;z-index: 10;">
      <template slot="title">
        <span>添加权限</span>
      </template>
      <a-button
        size="large"
        shape="circle"
        type="primary"
        style="margin-right:5px;"
        @click="openAdd"
        icon="plus" ></a-button>
    </a-tooltip>
    <a-card title="权限人员列表">
      <div slot="extra">
        <a-input-search @change="onSearch" v-model="keyword" style="margin-left: 16px; width: 272px;" />
      </div>
      <a-list
        size="large"
        style="height: calc(100vh - 200px);overflow-y: auto;"
        :showPagination="false">
        <a-list-item :key="item.id" v-for="item in showData">
          <a-list-item-meta>
            <a slot="title">{{ item.loginName }}</a>
            <div slot="description">
              <a-tag color="blue" v-for="tag in splitList(item.databases)" :key="tag" >{{ tag }}</a-tag>
            </div>
          </a-list-item-meta>
          <div slot="actions">
            <template>
              <a-button size="large" type="primary" icon="edit" title="编辑" @click="toEdit(item)" />
              <a-divider type="vertical"/>
              <a-button size="large" type="danger" icon="delete" title="删除" @click="toDelete(item)" />
            </template>
          </div>
        </a-list-item>
      </a-list>
      <a-drawer
        title="添加用户权限"
        placement="right"
        :width="600"
        :maskClosable="true"
        :visible="addDrawer"
        @close="addDrawer=false"
      >
        <a-form ref="form" :model="form" label-width="60px" size="mini" >
          <a-form-item label="用户：" >
            <a-input v-model="form.loginNames" :disabled="form.id" placeholder="可分配多个用户，逗号分隔"></a-input>
          </a-form-item>
        </a-form>
        <a-table
          rowKey="sourceCode"
          size="small"
          ref="table"
          :dataSource="dataSourceData"
          border
          :scroll="{y:'calc(100vh - 350px)'}"
          :columns="dataSourceField"
          :rowSelection="{selectedRowKeys:selectList,onChange:onSelectChange}"
          :pagination="false" >
          <template slot="right" slot-scope="text, record, index" >
            <a-checkbox v-model="grantDatabase[record.sourceCode]" @change="grantBoxChange($event,record)" ></a-checkbox>
          </template>
        </a-table>
        <div style="position: absolute;bottom: 20px;text-align: center;width: calc(100% - 40px);">
          <a-button-group>
            <a-button type="primary" @click="save" >保存</a-button>
            <a-button type="danger" @click="addDrawer=false" >取消</a-button>
          </a-button-group>
        </div>
      </a-drawer>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'Grant',
  data: function () {
    return {
      keyword: '',
      tableData: [],
      showData: [],
      addDrawer: false,
      dataSourceData: [],
      dataSourceField: [
        {
          title: '数据源标识',
          dataIndex: 'sourceCode',
          key: 'sourceCode'
        },
        {
          title: '权限',
          dataIndex: 'right',
          scopedSlots: { customRender: 'right' },
          width: '100px'
        }
      ],
      form: {
        id: null,
        loginNames: '',
        databases: '',
        grants: ''
      },
      grantDatabase: {},
      selectList: [],
      selectRowList: []
    }
  },
  methods: {
    query () {
      this.$getReq('/api/right/list').then(res => {
        this.tableData = res.data
        this.showData = this.tableData
        this.keyword = ''
      })
    },
    onSelectChange (selectList, selectedRows) {
      this.selectList = selectList
      this.selectRowList = selectedRows
    },
    toEdit (row) {
      var databases = row.databases.split(',')
      var grantDatabases = row.grant.split(',')
      var grants = {}
      this.selectList = []
      this.dataSourceData.forEach(item => {
        if (databases.indexOf(item.sourceCode) != -1) {
          this.selectList.push(item.sourceCode)
        }
        if (grantDatabases.indexOf(item.sourceCode) != -1) {
          grants[item.sourceCode] = 1
        } else {
          grants[item.sourceCode] = 0
        }
      })
      this.grantDatabase = grants
      this.form.id = row.id
      this.form.loginNames = row.loginName

      this.addDrawer = true
    },
    grantBoxChange (v, row) {
      if (v) {
        this.selectList.push(row.sourceCode)
      }
    },
    openAdd () {
      this.addDrawer = true
      this.grantDatabase = {}
      this.form = {
        id: null,
        loginNames: '',
        databases: '',
        grants: ''
      }
      this.selectList = []
    },
    loadDatasource () {
      this.$getReq('/api/datasource/list/').then(res => {
        this.dataSourceData = res.data
      })
    },
    save () {
      var databases = []
      var grants = []
      this.selectList.forEach(item => {
        databases.push(item)
        if (this.grantDatabase[item] == 1) {
          grants.push(item)
        }
      })
      this.form.databases = databases.join(',')
      this.form.grants = grants.join(',')
      this.$post('/api/right/add', this.form).then(res => {
        this.query()
        this.addDrawer = false
      })
    },
    toDelete (row) {
      this.$confirm({
        title: '提示',
        content: '确认删除该用户权限？',
        onOk: () => {
          this.$post('/api/right/delete/' + row.id).then(res => {
            this.$message.success('删除成功')
            this.query()
          })
        },
        onCancel () {
        }
      })
    },
    splitList (str) {
      return str.split(',')
    },
    onSearch () {
      var list = this.tableData.filter(item => {
        var b = item.loginName.includes(this.keyword) ||
              item.databases.includes(this.keyword) ||
              item.grant.includes(this.keyword)
        return b
      })
      this.showData = list
    }
  },
  /* 组件创建完成事件  */
  created: function () {
  },
  /* 模板编译挂载完成事件 类似小程序onload */
  mounted: function () {
    this.loadDatasource()
    this.query()
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
