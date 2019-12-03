<template>
  <div class="page-header-index-wide">
    <a-row :gutter="24">
      <a-col :sm="24" :md="12" :xl="8" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loading" title="浏览量" :total="accessCount.total | NumberFormat">
          <a-tooltip title="指标说明：用户浏览系统页面的数量" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <mini-area :data="accessData" :scale="scale" :tooltip="tooltip" />
          </div>
          <template slot="footer">日均查询量<span> {{ accessCount.avg_num | NumberFormat }}</span></template>
        </chart-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="8" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loading" title="业务量" :total="totalBusiness | NumberFormat">
          <a-tooltip title="指标说明：查询，操作数据的汇总" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <mini-bar
              :data="businessData"
              :scale="businessScale" />
          </div>
          <template slot="footer">转化率 <span>60%</span></template>
        </chart-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="8" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loading" title="访问量" :total="userData.userCount | NumberFormat">
          <a-tooltip title="指标说明：用户每天访问系统算一次的数量" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <template slot="footer">活跃用户<span> {{ userData.actUsers | NumberFormat }}</span></template>
        </chart-card>
      </a-col>
    </a-row>

    <a-card :loading="loading" :bordered="false" >
      <div style="padding:20px;">
        <a-row>
          <a-col :xl="16" :lg="12" :md="12" :sm="24" :xs="24">
            <bar :data="rankData.rankDatasbaseList" title="数据库操作排行榜" />
          </a-col>
          <a-col :xl="8" :lg="12" :md="12" :sm="24" :xs="24">
            <rank-list title="单用户操作排行榜" :list="rankData.rankUserList"/>
          </a-col>
        </a-row>
      </div>
    </a-card>

  </div>
</template>

<script>
import { ChartCard, MiniArea, MiniBar, MiniProgress, RankList, Bar, Trend, NumberInfo, MiniSmoothArea } from '@/components'
import { mixinDevice } from '@/utils/mixin'

export default {
  name: 'Analysis',
  mixins: [mixinDevice],
  components: {
    ChartCard,
    MiniArea,
    MiniBar,
    MiniProgress,
    RankList,
    Bar,
    Trend,
    NumberInfo,
    MiniSmoothArea
  },
  data () {
    return {
      loading: true,
      pieStyle: {
        stroke: '#fff',
        lineWidth: 1
      },
      accessData: null,
      accessCount: { total: 0, avg_num: 0 },
      businessData: [],
      totalBusiness: 0,
      businessScale: [{
        dataKey: 'x'
      }, {
        dataKey: 'y',
        alias: '次数'
      }],
      scale: [{
        dataKey: 'x'
      }, {
        dataKey: 'y',
        alias: '次数',
        min: 0
      }],
      userData: { userCount: 0, actUsers: 0 },
      rankData: []
    }
  },
  computed: {
  },
  created () {
    setTimeout(() => {
      this.loading = !this.loading
    }, 1000)
  },
  mounted () {
    this.$getReq('/api/report/count').then(res => {
      this.accessData = res.data.week
      this.accessCount = res.data.count
      this.businessData = res.data.bussiness
      var totalBusiness = 0
      this.businessData.forEach(item => {
        totalBusiness += parseInt(totalBusiness)
      })
      this.totalBusiness = totalBusiness
    })
    this.$getReq('/api/report/userCount').then(res => {
      this.userData = res.data
    })
    this.$getReq('/api/report/rank').then(res => {
      this.rankData = res.data
    })
  }
}
</script>

<style lang="less" scoped>
  .extra-wrapper {
    line-height: 55px;
    padding-right: 24px;

    .extra-item {
      display: inline-block;
      margin-right: 24px;

      a {
        margin-left: 24px;
      }
    }
  }

  .antd-pro-pages-dashboard-analysis-twoColLayout {
    position: relative;
    display: flex;
    display: block;
    flex-flow: row wrap;
  }

  .antd-pro-pages-dashboard-analysis-salesCard {
    height: calc(100% - 24px);
    /deep/ .ant-card-head {
      position: relative;
    }
  }

  .dashboard-analysis-iconGroup {
    i {
      margin-left: 16px;
      color: rgba(0,0,0,.45);
      cursor: pointer;
      transition: color .32s;
      color: black;
    }
  }
  .analysis-salesTypeRadio {
    position: absolute;
    right: 54px;
    bottom: 12px;
  }
</style>
