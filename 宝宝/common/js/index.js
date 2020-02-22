export function log(text){
  console.log(`%c${text}`, 'background-color: #f63; color: #fff; border-radius: 3px; padding: 4px;')
}


export function createScript(src, needRemove) {
  const script = document.createElement('script')
  script.src = src
  document.body.appendChild(script)
  script.onload = function () {
    needRemove && document.body.removeChild(script)
  }
}