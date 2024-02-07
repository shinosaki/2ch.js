import { useState } from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import Threads from './threads.tsx'
import Boards from './boards.tsx'

export default function App() {
  const [threadTabs, setThreadTabs] = useState([
    {
      title: '2ちゃんねるリーダー 2ch.js について',
      url: '/welcome.dat',
    }
  ])
  const [activeThreadTab, setActiveThreadTab] = useState(threadTabs[0]?.url)

  return (
    <ResizablePanelGroup
      direction="horizontal"
    >
      <ResizablePanel
        defaultSize={25}
      >
        <Boards
          setThreadTabs={setThreadTabs}
          setActiveThreadTab={setActiveThreadTab}
        />
      </ResizablePanel>
      <ResizableHandle />

      <ResizablePanel>
        <Threads
          tabs={threadTabs}
          setTabs={setThreadTabs}
          activeTab={activeThreadTab}
          setActiveTab={setActiveThreadTab}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}