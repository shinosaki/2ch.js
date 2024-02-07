import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Plus, RefreshCcw } from 'lucide-react'
import { changeTabHandler, closeTabHandler } from './utils'
import ThreadViewer from './thread-viewer.tsx'
import Loading from './loading.tsx'

export default function Threads({ tabs, setTabs, activeTab, setActiveTab }) {
  const scrollElement = useRef(null)
  const [comments, setComments] = useState([])

  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const latestCommentId = comments.length + 1
    if (isLoading === true) {
      fetch(`/api/dat?url=${activeTab}`, { cache: 'reload' })
        .then(r => r.json())
        .then(r => setComments(r.comments))
        .finally(() => {
          setIsLoading(false)
          setTimeout(() => {
            document.getElementById(latestCommentId)?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
          }, 500)
        })
    }
  }, [isLoading])


  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab}
      onValueChange={(newTab) => {
        changeTabHandler({ newTab, scrollElement, activeTab, setActiveTab })
      }}
      className={cn('w-full h-screen flex flex-col items-center relative')}
    >
      <Loading show={isLoading}/>

      <nav className={cn('sticky top-0 w-full shadow flex justify-center')}>
        <ScrollArea className="w-fit max-w-full">
          <TabsList className={cn('flex')}>
            {tabs.map(({url, title}) => (
              <TabsTrigger
                key={url}
                id={url}
                value={url}
                onMouseDown={({ button }) =>
                  closeTabHandler({ button, tabs, setTabs, activeTab, setActiveTab, url })
                }
              >{title}</TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </nav>

      <ScrollArea
        asChild
        className={cn('flex-grow w-full')}
        viewportClassName={cn('!flex')}
        ref={scrollElement}
      >
        {tabs.map(tab => (
          <TabsContent key={tab.url} value={tab.url} className={cn('mt-0 w-full')}>
            <ThreadViewer
              url={tab.url}
              comments={comments}
              setComments={setComments}
            />
          </TabsContent>
        ))}
      </ScrollArea>

      <Menubar className={cn('w-full')}>
        <MenubarMenu>
          <MenubarTrigger>
            <Dialog>
              <DialogTrigger>
                <Plus />
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Open new thread</DialogTitle>
                  <form
                    className={cn("grid items-start gap-4")}
                    onSubmit={(e) => {
                      e.preventDefault()
                      const form = new FormData(e.target)
                      const url = form.get('board-url')
                      try { new URL(url) } catch { return null }

                      fetch(`/api/dat?url=${url}`, { cache: 'force-cache' })
                        .then(r => r.json())
                        .then(r => setTabs(tabs => [...tabs, { url, title: r.subject || url.split('/').pop() }]))
                    }}
                  >
                    <div className="grid gap-2">
                      <Label htmlFor="board-url">Board URL</Label>
                      <Input type="text" id="board-url" name="board-url" placeholder="https://greta.5ch.net/poverty" />
                    </div>
                    <DialogClose>
                      <Button type="submit">Add Board</Button>
                    </DialogClose>
                  </form>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </MenubarTrigger>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger
            onClick={() => setIsLoading(true)}
          >
            <RefreshCcw />
          </MenubarTrigger>
        </MenubarMenu>
      </Menubar>
    </Tabs>
  )
}