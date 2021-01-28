import Vue from 'vue';
import Vuex from 'vuex';
import {
  setData,
  resultField,
  newLotteryField,
  listField,
  teamMapField,
  configField
} from '@/helper/index';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    config: {
      name: 'Lucky Draw',
      number: 70
    },
    result: {},
    newLottery: [],
    list: [],
    teamMap: {},
    photos: []
  },
  mutations: {
    setClearConfig(state) {
      state.config = {
        name: 'Lucky Draw',
        number: 70
      };
      state.newLottery = [];
    },
    setClearList(state) {
      state.list = [];
    },
    setClearTeamMap(state) {
      state.teamMap = {};
    },
    setClearPhotos(state) {
      state.photos = [];
    },
    setClearResult(state) {
      state.result = {};
    },
    setClearStore(state) {
      state.config = {
        name: 'Lucky Draw',
        number: 70
      };
      state.result = {};
      state.newLottery = [];
      state.list = [];
      state.photos = [];
    },
    setConfig(state, config) {
      state.config = config;

      setData(configField, state.config);
    },
    setResult(state, result = {}) {
      state.result = result;

      setData(resultField, state.result);
    },
    setNewLottery(state, newLottery) {
      if (state.newLottery.find(item => item.name === newLottery.name)) {
        return;
      }
      state.newLottery.push(newLottery);
      setData(newLotteryField, state.newLottery);
    },
    setList(state, list) {
      const arr = state.list;
      list.forEach(item => {
        const arrIndex = arr.findIndex(data => data.key === item.key);
        if (arrIndex > -1) {
          arr[arrIndex].name = item.name;
        } else {
          arr.push(item);
        }
      });
      state.list = arr;

      setData(listField, arr);
    },
    setTeamMap(state, teamMap) {
      state.teamMap = teamMap;
      setData(teamMapField, teamMap);
    },
    setPhotos(state, photos) {
      state.photos = photos;
    }
  },
  actions: {},
  modules: {}
});
