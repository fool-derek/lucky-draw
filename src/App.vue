<template>
  <div id="root">
    <header>
      <Publicity v-show="!running" />
      <el-button class="res" type="text" @click="showResult = true">
        抽奖结果
      </el-button>
      <el-button class="con" type="text" @click="showConfig = true">
        抽奖配置
      </el-button>
    </header>
    <div id="main" :class="{ mask: showRes }"></div>
    <div id="tags">
      <ul v-for="item in categoryList" :key="item.key">
        <li>
          <a
            href="javascript:void(0);"
            :style="{
              color: '#fff'
            }"
          >
            {{ item.name ? item.name : item.key }}
            <img v-if="item.photo" :src="item.photo" :width="50" :height="50" />
          </a>
        </li>
      </ul>
    </div>
    <transition name="bounce">
      <div id="resbox" v-show="showRes">
        <p @click="showRes = false">{{ categoryName }}抽奖结果：</p>
        <div class="container">
          <span
            v-for="item in resArr"
            :key="item"
            class="itemres"
            :style="resCardStyle"
            :data-id="item"
            :data-team="list.find(d => d.key === item).team"
            @click="showRes = false"
            :class="{
              numberOver:
                !!photos.find(d => d.id === item) ||
                !!list.find(d => d.key === item)
            }"
          >
            <span class="cont" v-if="!photos.find(d => d.id === item)">
              <span
                v-if="!!list.find(d => d.key === item)"
                :style="{
                  fontSize: '28px'
                }"
              >
                {{ list.find(d => d.key === item).name }}
              </span>
              <span v-else>
                {{ item }}
              </span>
            </span>
            <img
              v-if="photos.find(d => d.id === item)"
              :src="photos.find(d => d.id === item).value"
              alt="photo"
              :width="160"
              :height="160"
            />
          </span>
        </div>
      </div>
    </transition>

    <el-button
      class="audio"
      type="text"
      @click="
        () => {
          playAudio(!audioPlaying);
        }
      "
    >
      <i
        class="iconfont"
        :class="[audioPlaying ? 'iconstop' : 'iconplay1']"
      ></i>
    </el-button>

    <LotteryConfig :visible.sync="showConfig" @resetconfig="reloadTagCanvas" />
    <Tool
      @toggle="toggle"
      @resetConfig="reloadTagCanvas"
      @getPhoto="getPhoto"
      :running="running"
      :closeRes="closeRes"
    />
    <Result :visible.sync="showResult"></Result>

    <audio
      id="audiobg"
      preload="auto"
      controls
      loop
      @play="playHandler"
      @pause="pauseHandler"
    >
      <source :src="audioSrc" />
      你的浏览器不支持audio标奖
    </audio>
  </div>
</template>
<script>
import LotteryConfig from '@/components/LotteryConfig';
import Publicity from '@/components/Publicity';
import Tool from '@/components/Tool';
import bgaudio from '@/assets/bg.mp3';
import beginaudio from '@/assets/begin.mp3';
import {
  getData,
  configField,
  resultField,
  newLotteryField,
  conversionCategoryName,
  conversionCategoryTeam,
  listField,
  teamMapField
} from '@/helper/index';
import { luckydrawHandler, luckydrawHandlerTeam } from '@/helper/algorithm';
import Result from '@/components/Result';
import { database, DB_STORE_NAME } from '@/helper/db';
export default {
  name: 'App',

  components: { LotteryConfig, Publicity, Tool, Result },

  computed: {
    resCardStyle() {
      const style = { fontSize: '30px' };
      const { number } = this.config;
      if (number < 100) {
        style.fontSize = '100px';
      } else if (number < 1000) {
        style.fontSize = '80px';
      } else if (number < 10000) {
        style.fontSize = '60px';
      }
      return style;
    },
    config: {
      get() {
        return this.$store.state.config;
      }
    },
    result: {
      get() {
        return this.$store.state.result;
      },
      set(val) {
        this.$store.commit('setResult', val);
      }
    },
    list() {
      return this.$store.state.list;
    },
    teamMap() {
      return this.$store.state.teamMap;
    },
    allresult() {
      let allresult = [];
      for (const key in this.result) {
        if (this.result.hasOwnProperty(key)) {
          const element = this.result[key];
          allresult = allresult.concat(element);
        }
      }
      return allresult;
    },
    categoryName() {
      return conversionCategoryName(this.form.category);
    },
    photos() {
      return this.$store.state.photos;
    }
  },
  created() {
    const data = getData(configField);
    if (data) {
      this.$store.commit('setConfig', Object.assign({}, data));
    }
    const result = getData(resultField);
    if (result) {
      this.$store.commit('setResult', result);
    }

    const newLottery = getData(newLotteryField);
    if (newLottery) {
      const config = this.config;
      newLottery.forEach(item => {
        this.$store.commit('setNewLottery', item);
        if (!config[item.key]) {
          this.$set(config, item.key, 0);
        }
      });
      this.$store.commit('setConfig', config);
    }

    const list = getData(listField);
    if (list) {
      this.$store.commit('setList', list);
    }

    const teamMap = getData(teamMapField);
    if (teamMap) {
      this.$store.commit('setTeamMap', teamMap);
    }

    this.datas();
  },

  data() {
    return {
      running: false,
      showRes: false,
      showConfig: false,
      showResult: false,
      resArr: [],
      form: {},
      categoryList: [],
      audioPlaying: false,
      audioSrc: bgaudio
    };
  },
  watch: {
    photos: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.reloadTagCanvas();
        });
      }
    }
  },
  mounted() {
    this.startTagCanvas();
    setTimeout(() => {
      this.getPhoto();
    }, 1000);
    window.addEventListener('resize', this.reportWindowSize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.reportWindowSize);
  },
  methods: {
    reportWindowSize() {
      const AppCanvas = this.$el.querySelector('#rootcanvas');
      if (AppCanvas.parentElement) {
        AppCanvas.parentElement.removeChild(AppCanvas);
      }
      this.startTagCanvas();
    },
    playHandler() {
      this.audioPlaying = true;
    },
    pauseHandler() {
      this.audioPlaying = false;
    },
    playAudio(type) {
      if (type) {
        this.$el.querySelector('#audiobg').play();
      } else {
        this.$el.querySelector('#audiobg').pause();
      }
    },
    loadAudio() {
      this.$el.querySelector('#audiobg').load();
      this.$nextTick(() => {
        this.$el.querySelector('#audiobg').play();
      });
    },
    getPhoto() {
      database.getAll(DB_STORE_NAME).then(res => {
        if (res && res.length > 0) {
          this.$store.commit('setPhotos', res);
        }
      });
    },
    speed() {
      return [0.1 * Math.random() + 0.01, -(0.1 * Math.random() + 0.01)];
    },
    createCanvas() {
      const canvas = document.createElement('canvas');
      canvas.width = document.body.offsetWidth;
      canvas.height = document.body.offsetHeight - 20;
      canvas.id = 'rootcanvas';
      this.$el.querySelector('#main').appendChild(canvas);
    },
    startTagCanvas() {
      this.createCanvas();
      const { speed } = this;
      window.TagCanvas.Start('rootcanvas', 'tags', {
        textColour: null,
        initial: speed(),
        dragControl: 1,
        textHeight: 20,
        noSelect: true,
        lock: 'xy'
      });
    },
    reloadTagCanvas() {
      window.TagCanvas.Reload('rootcanvas');
    },
    closeRes() {
      this.showRes = false;
    },
    datas() {
      const { number } = this.config;
      const nums = number >= 1500 ? 500 : this.config.number;
      const configNum = number > 1500 ? Math.floor(number / 3) : number;
      const randomShowNums = luckydrawHandler(configNum, [], nums);
      const randomShowDatas = randomShowNums.map(item => {
        const listData = this.list.find(d => d.key === item);
        const photo = this.photos.find(d => d.id === item);
        return {
          key: item * (number > 1500 ? 3 : 1),
          name: listData ? listData.name : '',
          photo: photo ? photo.value : ''
        };
      });
      this.categoryList = randomShowDatas;
    },
    toggle(form) {
      const { speed } = this;
      if (this.running) {
        this.audioSrc = bgaudio;
        this.loadAudio();

        const { category, mode, qty, remain, allin } = this.form;
        let num = 1;
        if (mode === 1 || mode === 5) {
          num = mode;
        } else if (mode === 0) {
          num = remain;
        } else if (mode === 99) {
          num = qty;
        }

        let categoryKeyList = [];

        this.categoryList.forEach(item => {
          categoryKeyList.push(item.key);
        });

        const resArr = luckydrawHandlerTeam(
          categoryKeyList,
          allin ? [] : this.allresult,
          num
        );

        if (resArr && resArr.length > 0) {
          this.resArr = resArr;

          if (!this.result[category]) {
            this.$set(this.result, category, []);
          }
          const oldRes = this.result[category] || [];
          const data = Object.assign({}, this.result, {
            [category]: oldRes.concat(resArr)
          });
          this.result = data;
        } else {
          this.resArr = null;
        }

        window.TagCanvas.SetSpeed('rootcanvas', speed());
        this.showRes = true;
        this.running = !this.running;

        if (!allin) {
          this.categoryList = this.categoryList.filter(
            item => !resArr.includes(item.key)
          );
        }

        this.$nextTick(() => {
          this.reloadTagCanvas();
        });
      } else {
        this.showRes = false;
        if (!form) {
          return;
        }

        this.form = form;

        this.audioSrc = beginaudio;
        this.loadAudio();

        let categoryTeam = conversionCategoryTeam(this.form.category);

        if (categoryTeam === '*') {
          this.categoryList = this.list;
        } else {
          this.categoryList = this.teamMap[categoryTeam];
        }

        if (!this.form.allin) {
          this.categoryList = this.categoryList.filter(
            item => !this.allresult.includes(item.key)
          );
        }
        let num = 1;
        if (this.form.mode === 1 || this.form.mode === 5) {
          num = this.form.mode;
        } else if (this.form.mode === 0) {
          num = this.form.remain;
        } else if (this.form.mode === 99) {
          num = this.form.qty;
        }

        if (this.categoryList.length < num) {
          return this.$message.error('剩余人数小于抽取人数,请检查奖项人数设置');
        }

        this.$nextTick(() => {
          this.reloadTagCanvas();
        });
        window.TagCanvas.SetSpeed('rootcanvas', [5, 1]);
        this.running = !this.running;
      }
    }
  }
};
</script>
<style lang="scss">
#root {
  height: 100%;
  position: relative;
  background-image: url('./assets/bg.jpg');
  background-size: 100% 100%;
  background-position: center center;
  background-repeat: no-repeat;
  background-color: #121936;
  .mask {
    -webkit-filter: blur(5px);
    filter: blur(5px);
  }
  header {
    height: 50px;
    line-height: 50px;
    position: relative;
    .el-button {
      position: absolute;
      top: 17px;
      padding: 0;
      z-index: 9999;
      &.con {
        right: 20px;
      }
      &.res {
        right: 100px;
      }
    }
  }
  .audio {
    position: absolute;
    top: 80px;
    right: 30px;
    width: 40px;
    height: 40px;
    line-height: 40px;
    border: 1px solid #fff;
    border-radius: 50%;
    padding: 0;
    text-align: center;
    .iconfont {
      position: relative;
      left: 1px;
    }
  }
  .copy-right {
    position: absolute;
    right: 0;
    bottom: 0;
    color: #ccc;
    font-size: 12px;
  }
  .bounce-enter-active {
    animation: bounce-in 1.5s;
  }
  .bounce-leave-active {
    animation: bounce-in 0s reverse;
  }
}
#main {
  height: 100%;
}

#resbox {
  position: absolute;
  top: 55%;
  left: 50%;
  width: 1280px;
  transform: translateX(-50%) translateY(-50%);
  text-align: center;
  p {
    color: #fff;
    font-size: 45px;
    line-height: 120px;
  }
  .warn {
    color: red;
    font-size: 12px;
    line-height: 120px;
  }
  .container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }
  .itemres {
    background: #fff;
    width: 280px;
    height: 155px;
    border-radius: 4px;
    border: 1px solid #ccc;
    line-height: 90px;
    font-weight: bold;
    margin-right: 20px;
    margin-bottom: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    .cont {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    &.numberOver::before {
      content: ' (' attr(data-id) ') ' attr(data-team);
      width: 215px;
      height: 22px;
      line-height: 22px;
      background-color: #fff;
      position: absolute;
      bottom: 0;
      left: 0;
      font-size: 14px;
      text-align: left;
      border-radius: 50%;
      padding-left: 5px;
      z-index: 1;
    }
  }
}
</style>
