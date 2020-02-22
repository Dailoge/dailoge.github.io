import { log, createScript } from './index.js'
const song = document.querySelector('#playSong')

function playSong() {
  return new Promise((resolve, reject) => {
    if (song && song.paused) {
      song.play().then(res => {
        log('播放成功')
        resolve()
      }).catch(error => {
        console.warn('播放失败:' + error)
        reject()
      })
    } else {
      resolve()
    }
  })
}

function pauseSong() {
  if (song && !song.paused) {
    song.pause()
    log('暂停成功')
  }
}

function showTurnOnVolume() {
  const btn = document.querySelector('#jubao-btn')
  btn.textContent = '播放'
  btn.onclick = function () {
    if (song.paused) {
      playSong().then(()=>{
        btn.textContent = '暂停'
      })
    } else {
      btn.textContent = '播放'
      pauseSong()
    }
  }
}

window.handleMusicSearch = function (res) {
  const { data: { info = [] } } = res
  const result = info.find(item => item.hash)
  const musicInfoUrl = 'https://www.kugou.com/yy/index.php?r=play/getdata&format=jsonp&callback=handleMusicPlay&hash='
  createScript(musicInfoUrl + result.hash, true)
}

window.handleMusicPlay = function (res) {
  const { data: { play_url } } = res
  song.src = play_url
}

document.addEventListener('DOMContentLoaded', showTurnOnVolume)

const url = new URL(location.href)
const keyword = url.searchParams.get('music') || '刚好遇见你'

createScript(`http://mobilecdn.kugou.com/api/v3/search/song?format=jsonp&callback=handleMusicSearch&keyword=${keyword}&page=1&pagesize=20&showtype=1`, true)