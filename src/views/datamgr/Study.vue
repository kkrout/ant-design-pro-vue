<template>
  <div>
    <a-button @click="loadData" >loadData</a-button>
    <table style="width:100%;">
      <thead>
        <tr>
          <th :key="item" v-for="item in heads" >{{ item }}</th>
        </tr>
      </thead>
      <tbody>
        <tr :key="key" v-for="(key,index) in codes" >
          <td>{{ key }}</td>
          <td>{{ baseData[key] }}</td>
          <td>{{ nums[index] }}</td>
          <td>{{ costs[index] }}</td>
          <td>{{ fixStr(lasts[key],4) }}</td>
          <td>{{ fixStr(ests[key],4) }}</td>
          <td>{{ fixStr(cost_ms[key],2) }}</td>
          <td>{{ fixStr(last_ms[key],2) }}</td>
          <td>{{ fixStr(est_ms[key],2) }}</td>
          <td>{{ fixStr(growths[key],4) }}</td>
          <td>{{ fixStr(sys[key],2) }}</td>
          <td>{{ fixStr(sy1s[key],2) }}</td>
          <td>{{ fixStr(sydiff1s[key],2) }}</td>
          <td>{{ fixStr(pecents[key],4) }}</td>
          <td>{{ fixStr(pecent1s[key],4) }}</td>
        </tr>
      </tbody>
    </table>
    <div>
      <div>capital:{{ capital }}</div>
      <div>last:{{ last }}</div>
      <div>est:{{ est }}</div>
      <div>diff:{{ diff }}</div>
      <div>diffPecent:{{ diffPecent }}</div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import { Excel, STable } from '@/components'
import { Ellipsis } from '@/components'

export default {
  name: 'MysqlAdvance',
  components: {
    Excel, STable, Ellipsis
  },
  /* 模板编译挂载完成事件 类似小程序onload */
  mounted: function () {
    this.heads.forEach(item => {
      this.historyColumns.push({
        title: item,
        dataIndex: item,
        width: '150px'
      })
    })
    window.jsonpgz = this.jsonpgz
  },
  data: function () {
    return {
      last: 0,
      est: 0,
      diff: 0,
      capital: 0,
      diffPecent: 0,
      baseData: {
        '006229': 'ZO_YL',
        '002697': 'ZO_XF',
        '001644': 'HF',
        '519674': 'YH',
        '001156': 'SL',
        '320007': 'NA',
        '003231': 'CX'
      },
      codes: ['006229', '002697', '001644', '519674', '001156', '320007', '003231'],
      nums: ['3755.39', '4103.91', '2325.87', '1134.12', '1494.9', '4279.23', '1972.43'],
      costs: ['2.1185', '2.6923', '1.9348', '6.2025', '1.6724', '1.8785', '2.7884'],
      lasts: {},
      ests: {},
      cost_ms: {},
      last_ms: {},
      est_ms: {},
      growths: {},
      sys: {},
      sy1s: {},
      sydiff1s: {},
      pecents: {},
      pecent1s: {},
      heads: ['CODE', 'NAME', 'NUM', 'COST', 'LAST', 'EST', 'COST1', 'LAST1', 'EST1', 'GROWTH', 'SY', 'SY1', 'SY_DIFF', 'SY_PECENT', 'SY_PECENT1'],
      dataList: [],
      options: {
        alert: { show: false, clear: () => { } }
      },
      historyColumns: [
        {
          title: 'index',
          dataIndex: 'index',
          scopedSlots: { customRender: 'index' }
        }
      ]
    }
  },
  methods: {
    jsonpgz (res) {
      var data = {
        netWorth: res.dwjz,
        expectWorth: res.gsz,
        expectGrowth: res.gszzl
      }
      this.calc(res.fundcode, data)
    },
    loadData () {
      this.loadCode(0)
    },
    loadCode (i) {
      const code = this.codes[i]
      if (!code) return
      $.getScript('http://fundgz.1234567.com.cn/js/' + code + '.js?rt=' + (new Date().getTime()), () => {
        this.loadCode(i + 1)
      })
    },
    calc (code, { netWorth, expectWorth, expectGrowth }) {
      const index = this.codes.indexOf(code)
      const cost = this.costs[index]
      const num = this.nums[index]

      this.$set(this.lasts, code, netWorth)
      this.$set(this.ests, code, expectWorth)
      this.$set(this.cost_ms, code, parseFloat(cost) * parseFloat(num))
      this.$set(this.last_ms, code, parseFloat(netWorth) * parseFloat(num))
      this.$set(this.est_ms, code, parseFloat(expectWorth) * parseFloat(num))
      this.$set(this.growths, code, expectGrowth)
      this.$set(this.sys, code, this.last_ms[code] - this.cost_ms[code])
      this.$set(this.sy1s, code, this.est_ms[code] - this.cost_ms[code])
      this.$set(this.sydiff1s, code, this.sy1s[code] - this.sys[code])
      this.$set(this.pecents, code, this.sys[code] / this.cost_ms[code] * 100)
      this.$set(this.pecent1s, code, this.sy1s[code] / this.cost_ms[code] * 100)

      this.sumTotal()
    },
    sumTotal () {
      this.last = this.reduceObj(this.sys)
      this.est = this.reduceObj(this.sy1s)
      this.diff = this.reduceObj(this.sydiff1s)
      this.capital = this.reduceObj(this.cost_ms)
      this.diffPecent = (this.diff / this.capital * 100).toFixed(4)
    },
    reduceObj (obj) {
      var total = 0
      Object.keys(obj).forEach(key => {
        total += obj[key]
      })
      return total.toFixed(2)
    },
    fixStr (n, l) {
      try {
        if (isNaN(n)) {
          return n
        }
        return parseFloat(n).toFixed(l)
      } catch (e) {
        console.log('异常', n)
      }
    }
  },
  /* 组件创建完成事件  */
  created: function () {
  },
  /* 组件更新完成事件 */
  updated: function () {
  },
  /*  组件被激活 类似小程序onshow */
  activated: function () {
  },
  /*  组件未被激活 类似小程序ondestroy */
  deactivated: function () {
  },
  destroyed () {
  }
}
</script>
