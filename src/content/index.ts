function docReady(fn: () => void) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(fn, 1)
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

function decodeBase64(str: string) {
  return atob(str)
}

function encodeBase64(str: string) {
  return btoa(str)
}

const innerBase64StartWith = ['https', 'http'].map(encodeBase64).map((str) => str.replace(/=/g, ''))

function isBase64(text: string) {
  const innerOK = innerBase64StartWith.some((str) => text.startsWith(str))
  const execResult = /[\w\/]+=+/.exec(text)
  const regexOK = execResult ? true : false
  return innerOK || regexOK
}

function replaceBase64(str: string) {
  return str.replace(/([\w\/]+=+)/g, (...args) => {
    return decodeBase64(args[1])
  })
}

function createBase64TextNode(text: string, originText: string) {
  const div = document.createElement('div')
  div.style.display = 'inline-flex'
  div.style.alignItems = 'center'

  const originTextEl = document.createElement('span')
  originTextEl.style.display = 'none'
  originTextEl.innerHTML = originText

  const isUrl = text.startsWith('http')

  const aTextEl = isUrl ? document.createElement('a') : document.createElement('span')
  aTextEl.className = 'base64-text'
  aTextEl.style.display = 'inline'
  aTextEl.innerHTML = text
  if (isUrl) {
    ;(aTextEl as any as HTMLAreaElement).href = text
  }
  div.append(originTextEl, aTextEl)

  // 切换按钮
  {
    const button = document.createElement('div')
    button.style.display = 'inline-block'
    button.style.width = '14px'
    button.style.minWidth = '14px'
    button.style.height = '14px'
    button.style.marginLeft = '4px'
    button.style.background = '#7BCFC9'
    button.style.borderRadius = '50%'
    button.title = 'click to show origin text'
    div.appendChild(button)

    button.addEventListener('click', () => {
      if (aTextEl.style.display === 'none') {
        aTextEl.style.display = 'inline'
        originTextEl.style.display = 'none'

        button.style.background = '#7BCFC9'
        button.title = 'click to show origin text'
      } else {
        aTextEl.style.display = 'none'
        originTextEl.style.display = 'inline'

        button.style.background = '#F7B500'
        button.title = 'click to show decode text'
      }
    })
  }

  return div
}

function walk(el: Element) {
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent
      if (!text) {
        return
      }
      // 是否可能是 base64 编码文本
      if (isBase64(text)) {
        const newText = replaceBase64(text)
        if (newText !== text) {
          // 替换节点为新节点
          const newNode = createBase64TextNode(newText, text)
          node.parentNode!.replaceChild(newNode, node)
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      walk(node as Element)
    }
  })
}

function main() {
  const isV2ex = window.location.hostname.endsWith('v2ex.com')
  if (!isV2ex) {
    return
  }

  // 主题
  const contentEls = document.getElementsByClassName('topic_content')
  if (contentEls) {
    Array.prototype.forEach.call(contentEls, (el: (typeof contentEls)[0]) => {
      walk(el)
    })
  }

  // 回复
  const replyEls = document.getElementsByClassName('reply_content')
  if (replyEls) {
    Array.prototype.forEach.call(replyEls, (el: (typeof replyEls)[0]) => {
      walk(el)
    })
  }
}

docReady(main)

export {}
