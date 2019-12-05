<template>
  <div>
    <a-card :bordered="false">
      <a-steps :current="current">
        <a-step title="创建工单" description="修改数据就得先提工单，工单24小时内有效" ></a-step>
        <a-step title="审核工单" description="产品lead进行风险把控" />
        <a-step title="处理工单" description="处理人拿到审核工单后，直接在数据操作界面进行数据更改操作" />
        <a-step title="关闭工单" description="处理完手动关闭工单，或者超时自动关闭工单" />
      </a-steps>
      <div class="steps-content">
        <a-form ref="form" :model="form" label-width="100px" size="mini" >
          <a-form-item label="选择数据源" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" >
            <a-select
              v-model="form.sourceCode"
              allowClear
              showSearch
              placeholder="选择数据源"
              v-decorator="[
                'sourceCode',
                {rules: [{ required: true, message: '请选择数据源' }], validateTrigger: 'blur'}
              ]" >
              <a-select-option v-for="item in datasourceList" :value="item.sourceCode" :key="item.sourceCode" >{{ item.sourceCode }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="标题" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" >
            <a-input
              v-model="form.sourceName"
              v-decorator="[
                'password',
                {rules: [{ required: true, message: '请输入标题' }], validateTrigger: 'blur'}
              ]"
            ></a-input>
          </a-form-item>
          <a-form-item label="审核人" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" >
            <a-select
              v-model="form.handler"
              allowClear
              showSearch
              placeholder="指定产品审核人"
              v-decorator="[
                'password',
                {rules: [{ required: true, message: '指定产品审核人' }], validateTrigger: 'change'}
              ]" >
              <a-select-option value="fulei" >付磊</a-select-option>
              <a-select-option value="cnyang" >杨灿能</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="指定处理人" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" >
            <a-select
              v-model="form.handler"
              allowClear
              showSearch
              placeholder="你可以不填写，默认就是自己处理，或者你可以提交给有权限的人处理" >
              <a-select-option v-for="item in grantObject[form.sourceCode]" :value="item" :key="item" >{{ item }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" style="margin-right: 20px;">提交</a-button><a-button>取消</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>
  </div>
</template>

<script>
import { Ellipsis, Excel } from '@/components'

export default {
  name: 'Mysql',
  components: {
    Ellipsis,
    Excel
  },
  data () {
    return {
      form: {},
      datasourceList: [],
      grantObject: {},
      workId: null,
      workStatus: null,
      current:0
    }
  },
  mounted () {
    this.workId = this.$route.query.id

    this.$getReq('/api/datasource/list/').then(res => {
      this.datasourceList = res.data
    })
    this.$getReq('/api/right/list').then(res => {
      res.data.forEach(item => {
        if (item.grant) {
          var grantDbs = item.grant.split(',')
          grantDbs.forEach(db => {
            var users = this.grantObject[db]
            if (!users) {
              this.$set(this.grantObject, db, [item.loginName])
            } else {
              if (!users.includes(item.loginName)) {
                users.push(item.loginName)
              }
            }
          })
        }
      })
    })
  },
  computed: {
  },
  methods: {
  }
}
</script>

<style scoped>
  .steps-content {
    margin-top: 16px;
    border: 1px dashed #e9e9e9;
    border-radius: 6px;
    background-color: #fafafa;
    min-height: 200px;
    text-align: center;
    padding-top: 80px;
  }
  .steps-action {
    margin-top: 24px;
  }
</style>
