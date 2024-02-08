import { useState, useRef, useEffect } from 'react'
import { cn, LS } from '@/lib/utils'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
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
import {
  Ban,
  Plus,
  RefreshCcw,
  Trash,
} from 'lucide-react'
import { changeTabHandler, closeTabHandler } from './utils'
import ThreadViewer from './thread-viewer.tsx'
import Loading from './loading.tsx'

export default function Threads({ tabs, setTabs, activeTab, setActiveTab }) {
  const scrollElement = useRef(null)
  const [comments, setComments] = useState([])

  const [ngWordList, setNgWordList] = useState(LS.get('ngWordList') ?? [])
  useEffect(() => LS.set('ngWordList', ngWordList), [ngWordList])

  const [ngWordDialog, setNgWordDialog] = useState(false)
  const [addThreadDialog, setAddThreadDialog] = useState(false)

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
              ngWordList={ngWordList}
            />
          </TabsContent>
        ))}
      </ScrollArea>

      <Menubar className={cn('w-full')}>
        <MenubarMenu>
          <MenubarTrigger onClick={() => setAddThreadDialog(true)}>
            <Plus />
          </MenubarTrigger>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger
            onClick={() => setIsLoading(true)}
          >
            <RefreshCcw />
          </MenubarTrigger>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>
            <Ban />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger disabled={ngWordList.length === 0}>NG Word</MenubarSubTrigger>
              <MenubarSubContent className="max-h-48 overflow-y-auto">
                {ngWordList.map(word => (
                  <MenubarItem
                    key={word}
                    className="flex justify-between gap-2"
                    onSelect={e => e.preventDefault()}
                  >
                    <span>{word}</span>
                    <Button
                      variant="outline"
                      className="p-0.5 aspect-square h-fit"
                      onClick={() => {
                        setNgWordList(list => list.filter(v => v !== word))
                      }}
                    >
                      <Trash size="18" className="text-destructive" />
                    </Button>
                  </MenubarItem>
                ))}
              </MenubarSubContent>
              <MenubarSeparator />

              <MenubarItem onClick={() => {
                setNgWordDialog(true)
              }}>Add NG Word</MenubarItem>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <Dialog open={addThreadDialog} onOpenChange={setAddThreadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open new thread</DialogTitle>
          </DialogHeader>
          <form
            className={cn("grid items-start gap-4")}
            onSubmit={(e) => {
              e.preventDefault()
              const form = new FormData(e.target)
              const url = form.get('thread-url')
              try { new URL(url) } catch { return null }

              fetch(`/api/dat?url=${url}`, { cache: 'force-cache' })
                .then(r => r.json())
                .then(r => setTabs(tabs => [...tabs, { url, title: r.subject || url.split('/').pop() }]))
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="thread-url">Thread URL</Label>
              <Input type="text" id="thread-url" name="thread-url" placeholder="https://greta.5ch.net/poverty/dat/1707122951.dat" />
            </div>
            <DialogClose>
              <Button type="submit">Open Thread</Button>
            </DialogClose>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={ngWordDialog} onOpenChange={setNgWordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add NG word</DialogTitle>
          </DialogHeader>
          <form
            className={cn("grid items-start gap-4")}
            onSubmit={(e) => {
              e.preventDefault()
              const form = new FormData(e.target)
              const word = form.get('ng-word')
              setNgWordList(v => [...v, word])
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="ng-word">NG word</Label>
              <Input type="text" id="ng-word" name="ng-word" placeholder="ng word" />
            </div>
            <DialogClose>
              <Button type="submit">Add</Button>
            </DialogClose>
          </form>
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}