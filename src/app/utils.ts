export const closeTabHandler = ({
  button,
  tabs,
  setTabs,
  activeTab,
  setActiveTab,
  url,
}) => {
  if (button === 1) {
    const activeTabIndex = tabs.indexOf(tabs.find(v => v.url === url))
    setTabs(tabs => tabs.filter(tab => tab.url !== url))
    if (activeTab === url) {
      setActiveTab(() => tabs[activeTabIndex && activeTabIndex - 1].url)
    }
  }
}

export const changeTabHandler = ({
  newTab,
  scrollElement,
  activeTab,
  setActiveTab
}) => {
  const scrollElementHeight = ('current' in scrollElement)
    ? scrollElement.current.scrollHeight
    : scrollElement.scrollHeight

  const children = ('current' in scrollElement)
    ? [...scrollElement.current.children]
    : [...scrollElement.children]

  const viewport = children.find(e => e.hasAttribute('data-radix-scroll-area-viewport'))

  sessionStorage.setItem(activeTab, viewport.scrollTop)

  const interval = setInterval(() => {
    // <BoardList> 内の項目が多い場合など
    // レンダリング中に scrollTo() が実行されることを防ぐために
    // scrollHeight が 350 以上になるまで待機
    if (viewport.scrollHeight > scrollElementHeight) {
      viewport.scrollTo({
        top: sessionStorage.getItem(newTab) ?? 0,
        behavior: 'smooth'
      })
      clearInterval(interval)
    }
  })
  // interval のタイムアウト
  setTimeout(() => clearInterval(interval), 2000)

  setActiveTab(newTab)
}