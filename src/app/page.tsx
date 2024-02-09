import { useState, useEffect } from 'react'
import { LS } from '@/lib/utils'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import Threads from './threads.tsx'
import Boards from './boards.tsx'

export default function App() {
  const [threadTabs, setThreadTabs] = useState(LS.get('threadTabs') ?? [{ title: '2ちゃんねるリーダー 2ch.js について', url: '/welcome.dat' }])
  useEffect(() => LS.set('threadTabs', threadTabs), [threadTabs])

  const [activeThreadTab, setActiveThreadTab] = useState(LS.get('activeThreadTab') ?? threadTabs[0]?.url)
  useEffect(() => LS.set('activeThreadTab', activeThreadTab), [activeThreadTab])

  return (
    <ResizablePanelGroup
      direction="horizontal"
    >
      <ResizablePanel
        defaultSize={25}
      >
        <Boards
          setThreadTabs={setThreadTabs}
          activeThreadTab={activeThreadTab}
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