<template>
  <div class="antv-chart-mini">
    <div class="chart-wrapper" :style="{ height: 46 }">
      <v-chart :force-fit="true" :height="height" :data="data" :scale="scale" :padding="[36, 0, 18, 0]">
        <v-tooltip />
        <v-smooth-area position="x*y" />
      </v-chart>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'MiniArea',
  props: {
    data: {
      type: Array,
      default: function () {
        const data = []
        const beginDay = new Date().getTime()

        for (let i = 0; i < 10; i++) {
          data.push({
            x: moment(new Date(beginDay + 1000 * 60 * 60 * 24 * i)).format('YYYY-MM-DD'),
            y: Math.round(Math.random() * 10)
          })
        }
        return data
      }
    },
    scale: {
      type: [Array, Object],
      default: function () {
        return [{
          dataKey: 'x',
          min: 2
        }, {
          dataKey: 'y',
          alias: '时间',
          min: 1,
          max: 22
        }]
      }
    },
    tooltip: {
      type: [String, Function],
      default: function () {
        return [
          'x*y',
          (x, y) => ({
            name: x,
            value: y
          })
        ]
      }
    }
  },
  data () {
    return {
      height: 100
    }
  }
}
</script>

<style lang="less" scoped>
  @import "chart";
</style>
