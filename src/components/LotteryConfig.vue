<template>
  <el-dialog
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    width="500px"
    @close="$emit('update:visible', false)"
    class="c-LotteryConfig"
  >
    <div class="c-LotteryConfigtitle" slot="title">
      <span :style="{ fontSize: '16px', marginRight: '20px' }">
        抽奖配置
      </span>
      <el-button size="mini" @click="addLottery">增加奖项</el-button>
      <el-button size="mini" type="primary" @click="onSubmit"
        >保存配置</el-button
      >
      <el-button size="mini" @click="$emit('update:visible', false)"
        >取消</el-button
      >
    </div>
    <div class="container">
      <el-form ref="form" :model="form" size="mini">
        <el-form-item label="抽奖标题">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="抽奖总人数">
          <el-tooltip
            class="item"
            effect="dark"
            content="最小值为0"
            placement="top"
          >
            <el-input
              type="number"
              v-stopNumberMousewheel
              v-model="form.number"
              :min="1"
              :step="1"
            ></el-input>
          </el-tooltip>
        </el-form-item>
        <el-form-item
          :label="newitem.name"
          v-for="newitem in storeNewLottery"
          :key="newitem.key"
        >
          <el-tooltip
            class="item"
            effect="dark"
            content="最小值为0, '0' 禁用该奖项，不填默认值为'0'"
            placement="top"
          >
            <el-input
              type="number"
              :min="0"
              :step="1"
              v-model="form[newitem.key]"
              v-stopNumberMousewheel
              required
              @change="
                val => {
                  form[newitem.key] = Number(val);
                }
              "
            ></el-input>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </div>

    <el-dialog
      :visible.sync="showAddLottery"
      :append-to-body="true"
      :close-on-click-modal="false"
      width="270px"
      class="dialog-showAddLottery"
    >
      <div class="add-title" slot="title">增加奖项</div>
      <el-form ref="newLottery" :model="newLottery" size="mini">
        <el-form-item label="奖项名称">
          <el-input v-model="newLottery.name"></el-input>
        </el-form-item>
        <el-form-item label="团队名称">
          <el-select v-model="newLottery.team" placeholder="请选取团队名称">
            <el-option label="All(*)" value="*"></el-option>
            <el-option
              :label="item"
              :value="item"
              v-for="(item, index) in teams"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addHandler">增加奖项</el-button>
          <el-button @click="showAddLottery = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </el-dialog>
</template>
<script>
import { setData, configField } from '@/helper/index';
import { randomNum } from '@/helper/algorithm';
import Vue from 'vue';

// Prevent type="number" mouse scroll to change the value
Vue.directive('stopNumberMousewheel', {
  inserted: function(el) {
    const ele = el.tagName === 'INPUT' ? el : el.querySelector('input');
    ele.addEventListener('mousewheel', () => {
      ele.blur();
    });
  }
});
export default {
  name: 'LotteryConfig',
  props: {
    visible: Boolean
  },
  computed: {
    form: {
      get() {
        return this.$store.state.config;
      },
      set(val) {
        // this.$store.commit('setConfig', val);
        return val;
      }
    },
    storeNewLottery() {
      return this.$store.state.newLottery;
    },
    teams() {
      return Object.keys(this.$store.state.teamMap);
    }
  },
  data() {
    return {
      showAddLottery: false,
      newLottery: {
        name: '',
        team: ''
      }
    };
  },
  methods: {
    onSubmit() {
      setData(configField, this.form);
      this.$store.commit('setConfig', this.form);
      this.$emit('update:visible', false);

      this.$message({
        message: '保存成功',
        type: 'success'
      });

      this.$nextTick(() => {
        this.$emit('resetconfig');
      });
    },
    addLottery() {
      this.showAddLottery = true;
    },
    randomField() {
      const str = 'abcdefghijklmnopqrstuvwxyz';
      let fieldStr = '';
      for (let index = 0; index < 10; index++) {
        fieldStr += str.split('')[randomNum(1, 27) - 1];
      }
      return `${fieldStr}${Date.now()}`;
    },
    addHandler() {
      const field = this.randomField();
      if (
        this.newLottery.name == undefined ||
        this.newLottery.name.length == 0
      ) {
        this.$message.error('奖项名称未设置');
        return;
      }

      if (
        this.newLottery.team == undefined ||
        this.newLottery.team.length == 0
      ) {
        this.$message.error('请选择团队名称');
        return;
      }

      const data = {
        key: field,
        name: this.newLottery.name,
        team: this.newLottery.team
      };
      this.$store.commit('setNewLottery', data);

      this.showAddLottery = false;
    }
  }
};
</script>
<style lang="scss">
.c-LotteryConfig {
  .el-dialog__body {
    height: 400px;
    .container {
      height: 100%;
      overflow-y: auto;
      padding: 0 10px;
    }
  }
}
.dialog-showAddLottery {
  .el-dialog {
    height: 260px;
  }
  .el-select {
    // display: block;
    width: 100%;
  }
}
</style>
