<template>
  <div>
    <a-tooltip placement="left" style="position: fixed;right: 20px;top:50%;z-index: 10;">
      <template slot="title">
        <span>添加数据源</span>
      </template>
      <a-button
        size="large"
        shape="circle"
        type="primary"
        style="margin-right:5px;"
        @click="openAdd"
        icon="plus" ></a-button>
    </a-tooltip>
    <a-card>
      <a-list size="large" :showPagination="false">
        <a-list-item :key="index" v-for="(item, index) in data">
          <a-list-item-meta :description="item.connect">
            <template slot="title">
              <a style="margin-right:10px;">{{ item.sourceName }}</a>
              <a-tag color="#2196F3" v-if="item.type == 'mysql'" >{{ item.type }}</a-tag>
              <a-tag color="#009688" v-else-if="item.type == 'redis'" >{{ item.type }}</a-tag>
              <a-tag color="#E91E63" v-else="" >{{ item.type }}</a-tag>
            </template>
          </a-list-item-meta>
          <div slot="actions">
            <template>
              <a-button type="primary" icon="edit" title="编辑" @click="openEdit(item)" />
              <a-divider type="vertical"/>
              <a-button type="default" icon="swap" title="连接" @click="testConnect(item)" />
              <a-divider type="vertical"/>
              <a-button type="danger" icon="delete" title="删除" />
            </template>
          </div>
        </a-list-item>
      </a-list>
    </a-card>
    <a-drawer
      title="添加数据源"
      placement="right"
      :width="600"
      :maskClosable="true"
      :visible="editDrawer"
      @close="editDrawer=false"
    >
      <a-form ref="form" :model="form" label-width="100px" size="mini" >
        <a-form-item label="数据源标识" >
          <a-input v-model="form.sourceCode" :disabled="form.id" placeholder="标识唯一不能中文，只能数字中下划线和英文字母"></a-input>
        </a-form-item>
        <a-form-item label="数据源名称" >
          <a-input v-model="form.sourceName" ></a-input>
        </a-form-item>
        <a-form-item label="数据源类型" >
          <a-select v-model="form.type" style="width:100%;" >
            <a-select-option value="mysql" >mysql</a-select-option>
            <a-select-option value="mongo" >mongo</a-select-option>
            <a-select-option value="redis" >redis</a-select-option>
          </a-select>
        </a-form-item>
        <template v-if="form.type == 'mysql' ">
          <a-form-item key="mysql_address" prop="config.address" label="主机端口" :rules="[{ required: true, message: '主机端口为空'}]" >
            <a-input v-model.trim="form.config.address" placeholder="必填，xx.xx.xx.xx:3306" @change="toMysqlConnect" ></a-input>
          </a-form-item>
          <a-form-item key="mysql_username" prop="config.username" label="用户名" :rules="[{ required: true, message: '用户名为空'}]">
            <a-input v-model.trim="form.config.username" placeholder="必填，root" ></a-input>
          </a-form-item>
          <a-form-item key="mysql_pwd" prop="config.password" label="密码" :rules="[{ required: true, message: '密码为空'}]">
            <a-input-password v-model.trim="form.config.password" placeholder="必填，123456" ></a-input-password>
          </a-form-item>
          <a-form-item key="mysql_db" prop="config.database" label="数据库" :rules="[{ required: true, message: '数据库'}]">
            <a-input v-model.trim="form.config.database" placeholder="必填，xxxDb" @change="toMysqlConnect" ></a-input>
          </a-form-item>
        </template>
        <template v-if="form.type == 'mongo' ">
          <a-form-item label="主机端口" :rules="[{ required: true, message: '主机端口为空'}]" >
            <a-input v-model.trim="form.config.address" placeholder="必填，xx.xx.xx.xx:3306"></a-input>
          </a-form-item>
          <a-form-item label="用户名" :rules="[{ required: true, message: '用户名为空'}]">
            <a-input v-model.trim="form.config.username" placeholder="必填，root" ></a-input>
          </a-form-item>
          <a-form-item label="密码" :rules="[{ required: true, message: '密码为空'}]">
            <a-input-password v-model.trim="form.config.password" placeholder="必填，123456" ></a-input-password>
          </a-form-item>
          <a-form-item label="数据库" :rules="[{ required: true, message: '数据库'}]">
            <a-input v-model.trim="form.config.database" placeholder="必填，xxxDb" ></a-input>
          </a-form-item>
        </template>
        <template v-if="form.type == 'redis' ">
          <a-form-item key="redis_address" label="主机端口" :rules="[{ required: true, message: '主机端口为空'}]" >
            <a-input v-model.trim="form.config.address" placeholder="必填，xx.xx.xx.xx:6379" @change="toRedisConnect"></a-input>
          </a-form-item>
          <a-form-item key="redis_password" label="密码" :rules="[{ required: true, message: '密码为空'}]">
            <a-input-password v-model.trim="form.config.password" placeholder="必填，123456" ></a-input-password>
          </a-form-item>
        </template>
        <a-form-item prop="connect" label="连接串" :rules="[{ required: true, message: '连接串'}]" >
          <a-input v-model.trim="form.connect" placeholder="自动生成，可自定义修改，可反解析" @change="parseConnet" ></a-input>
        </a-form-item>
      </a-form>
      <br><br>
      <div style="position: absolute;bottom: 20px;text-align: center;width: calc(100% - 40px);">
        <a-button-group>
          <a-button type="primary" @click="save" >保存</a-button>
          <a-button type="default" @click="testConnect(form)" >连接测试</a-button>
          <a-button type="danger" @click="addDrawer=false" >取消</a-button>
        </a-button-group>
      </div>
    </a-drawer>
  </div>
</template>

<script>
export default {
  name: 'Datasource',
  data () {
    return {
      data: [],
      selectedRowKeys: [],
      options: {
        alert: { show: false, clear: () => { this.selectedRowKeys = [] } },
        rowSelection: {
          selectedRowKeys: this.selectedRowKeys,
          onChange: this.onSelectChange
        }
      },
      editDrawer: false,
      form: {
        sourceCode: '',
        sourceName: '',
        type: '',
        connect: '',
        config: {},
        id: null
      }
    }
  },
  mounted () {
    this.query()
  },
  methods: {
    query () {
      this.$getReq('/api/datasource/list/').then(res => {
        this.data = res.data
      })
    },
    openAdd () {
      this.form = {
        sourceCode: '',
        sourceName: '',
        type: '',
        connect: '',
        config: {},
        id: null
      }
      this.editDrawer = true
    },
    openEdit (row) {
      this.form = {
        sourceCode: row.sourceCode,
        sourceName: row.sourceName,
        type: row.type,
        connect: row.connect,
        config: JSON.parse(row.config),
        id: row.id
      }
      this.editDrawer = true
    },
    toMysqlConnect () {
      var connect = this.form.connect
      if (!this.form.config) return

      var address = this.form.config.address
      var db = this.form.config.database

      var startStr = 'jdbc:mysql://'
      // 存在不是mysql的连接串或者为空，全部覆盖
      if (!connect || (connect && connect.indexOf(startStr) === -1)) {
        this.form.connect = startStr + address + '/' + db + '?characterEncoding=utf-8&useUnicode=true'
      } else {
        // 替换参数前面的部分
        var param = connect.substring(connect.indexOf('?'))
        this.form.connect = startStr + address + '/' + db + param
      }
    },
    toRedisConnect () {
      if (!this.form.config) return
      var address = this.form.config.address
      this.form.connect = 'redis://' + address
    },
    parseConnet () {
      var v = this.form.connect
      var startStr = 'jdbc:mysql://'
      if (v.indexOf(startStr) === 0) {
        this.form.type = 'mysql'
        this.parseMysql(v)
      }
    },
    parseMysql (v) {
      var startStr = 'jdbc:mysql://'
      var startStr2 = 'redis://'
      if (v.indexOf(startStr) === 0) {
        var urlEnd = v.indexOf('/', startStr.length)
        var dbEnd = v.indexOf('?', urlEnd)
        var url = v.substring(startStr.length, urlEnd)
        var db = v.substring(urlEnd + 1, dbEnd)
        this.$set(this.form.config, 'address', url)
        this.$set(this.form.config, 'database', db)
      } else if (v.indexOf(startStr2) === 0) {
        const url = v.substring(startStr2.length)
        this.$set(this.form.config, 'address', url)
      }
    },
    typeFilterHandler (value, row, column) {
      var property = column['property']
      return row[property] === value
    },
    testConnect (row) {
      this.$postJsonReq('/api/datasource/testConnect', row).then(res => {
        this.$message.success('连接成功')
      })
    },
    save () {
      if (!this.form.sourceCode) {
        this.$message.error('数据源标识不能为空')
        return
      }
      if (!this.form.sourceName) {
        this.$message.error('数据源名称不能为空')
        return
      }

      var data = Object.assign({}, this.form)
      data.config = JSON.stringify(this.form.config)
      this.$postJsonReq('/api/datasource/add', data).then(res => {
        this.editDrawer = false
        this.query()
      })
    }
  }
}
</script>

<style scoped>

</style>
