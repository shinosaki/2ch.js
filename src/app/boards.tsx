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
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
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
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Plus,
  RefreshCcw,
} from 'lucide-react'
import { changeTabHandler, closeTabHandler } from './utils'
import BoardList from './board-list.tsx'
import Loading from './loading.tsx'

export default function Boards({ setThreadTabs, activeThreadTab, setActiveThreadTab }) {
  const [tabs, setTabs] = useState(LS.get('boardTabs') ?? [
    { title: 'ニュー速(嫌儲)', url: 'https://greta.5ch.net/poverty' },
    { title: 'なんでも実況(ガリレオ)', url: 'https://nova.5ch.net/livegalileo' },
  ])
  useEffect(() => LS.set('boardTabs', tabs), [tabs])

  const [activeTab, setActiveTab] = useState(LS.get('activeBoardTab') ?? tabs[0].url)
  useEffect(() => LS.set('activeBoardTab', activeTab), [activeTab])

  const scrollElement = useRef(null)

  const sortTypes = [
    { value: 'ikioi', title: 'Ikioi' },
    { value: 'date', title: 'Date' },
  ]
  const [sortType, setSortType] = useState(LS.get('sortType') ?? sortTypes[0].value)
  useEffect(() => LS.set('sortType', sortType), [sortType])

  const [sortDesc, setSortDesc] = useState(LS.get('sortDesc') ?? true)
  useEffect(() => LS.set('sortDesc', sortDesc), [sortDesc])

  const [subjects, setSubjects] = useState([])
  const [addBoardDialog, setAddBoardDialog] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    if (isLoading === true) {
      fetch(`/api/subject?url=${activeTab}/subject.txt`, { cache: 'reload' })
        .then(r => r.json())
        .then(r => setSubjects(r))
        .finally(() => {
          setIsLoading(false)
          const viewport = [...scrollElement.current.children]
            .find(e => e.hasAttribute('data-radix-scroll-area-viewport'))
          viewport.scrollTo(64)
        })
    }
  }, [isLoading])

  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={(newTab) => {
        changeTabHandler({ newTab, scrollElement, activeTab, setActiveTab })
      }}
      className={cn('w-full h-screen flex flex-col items-center relative')}
    >
      <Loading show={isLoading}/>

      <nav className={cn('sticky top-0 w-full shadow flex justify-center')}>
        <ScrollArea className="w-fit max-w-full">
          <TabsList className={cn('flex')}>
            {tabs.map(({ url, title }) => (
              <TabsTrigger
                key={url}
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
            <BoardList
              url={tab.url}
              sortDesc={sortDesc}
              sortType={sortType}
              subjects={subjects}
              setSubjects={setSubjects}
              setThreadTabs={setThreadTabs}
              activeThreadTab={activeThreadTab}
              setActiveThreadTab={setActiveThreadTab}
            />
          </TabsContent>
        ))}
      </ScrollArea>

      <Menubar className={cn('w-full')}>
        <MenubarMenu>
          <MenubarTrigger>
            {sortDesc ? <ArrowDownWideNarrow /> : <ArrowUpNarrowWide />}
          </MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup
              value={sortType}
              onValueChange={v => setSortType(v)}
            >
              {sortTypes.map(sort => (
                <MenubarRadioItem
                  key={sort.value}
                  value={sort.value}
                  onSelect={e => e.preventDefault()}
                >{sort.title}</MenubarRadioItem>
              ))}
            </MenubarRadioGroup>
            <MenubarSeparator />

            <MenubarItem
              onSelect={e => e.preventDefault()}
              className={cn('flex gap-2 items-center')}
            >
              <Switch
                id="desc-sort"
                defaultChecked={sortDesc}
                onCheckedChange={(v) => setSortDesc(v)}
              />
              <Label htmlFor="desc-sort" className={cn('w-full')}>
                Descending sort
              </Label>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger onClick={() => setAddBoardDialog(true)}>
            <Plus />
          </MenubarTrigger>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger onClick={() => setIsLoading(true)}>
            <RefreshCcw />
          </MenubarTrigger>
        </MenubarMenu>
      </Menubar>

      <Dialog open={addBoardDialog} onOpenChange={setAddBoardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Board</DialogTitle>
          </DialogHeader>
          <form
            className={cn("grid items-start gap-4")}
            onSubmit={(e) => {
              e.preventDefault()
              const form = new FormData(e.target)
              const url = form.get('board-url')
              try { new URL(url) } catch { return null }

              fetch(`/api/setting?url=${url}/SETTING.TXT`, { cache: 'force-cache' })
                .then(r => setTabs(tabs => [...tabs, { url, title: r.BBS_TITLE_ORIG || url.split('/').pop() }]))
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
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}