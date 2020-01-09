<template>
  <div :style="{'width':width }">
    <div :class="progressClass">
      <div>
        <div class="progress-outer">
          <div class="progress-inner">
            <div class="progress-bg" :style="{'width': percentStr,height: '8px', borderRadius: '100px'}"></div>
          </div>
        </div>
        <span v-show="showTitle" :title="percentStr" class="progress-text">{{ percentStr }}</span></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ProcessBar',
    props: {
      width: {
        type: String,
        default: () => {
          return []
        }
      },
      percent: {
        type: Number,
        default: 0
      },
      showTitle:{
        type: Boolean,
        default: true
      }
    },
    computed: {
      percentStr () {
        return this.percent + '%'
      },
      progressClass () {
        return { 'progress progress-line': true,
          'progress-show-info': true,
          'progress-status-active': this.percent < 100 && this.percent > 0 }
      }
    },
    data () {
      return {
      }
    },
    methods: {
    }
  }
</script>

<style>
  .progress-line {
    position: relative;
    width: 100%;
    font-size: 14px;
  }
  .progress {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
    font-variant: tabular-nums;
    line-height: 1.5;
    list-style: none;
    font-feature-settings: 'tnum';
    display: inline-block;
  }
  .progress-show-info .progress-outer {
    margin-right: calc(-2em - 8px);
    padding-right: calc(2em + 8px);
  }
  .progress-outer {
    display: inline-block;
    width: 100%;
    margin-right: 0;
    padding-right: 0;
    box-sizing: border-box;
  }
  .progress-inner {
    position: relative;
    display: inline-block;
    width: 100%;
    vertical-align: middle;
    background-color: #e1e1e1;
    border-radius: 100px;
    overflow: hidden;
  }
  .progress-success-bg, .progress-bg {
    position: relative;
    background-color: #1890ff;
    transition: all 0.4s cubic-bezier(0.08, 0.82, 0.17, 1) 0s;
  }

  @keyframes progress-active{
    from {width:0px;}
    to {width:100%;}
  }
  @-webkit-keyframes progress-active{
    from {width:0px;}
    to {width:100%;}
  }

  .progress-status-active .progress-bg::before {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: #fff;
    border-radius: 10px;
    opacity: 0.2;
    -webkit-animation: progress-active 2.4s cubic-bezier(0.23, 1, 0.32, 1) infinite;
    animation: progress-active 2.4s cubic-bezier(0.23, 1, 0.32, 1) infinite;
    content: '';
  }
</style>
