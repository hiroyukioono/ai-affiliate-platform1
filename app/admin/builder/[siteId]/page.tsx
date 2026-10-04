'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type DeviceMode = 'desktop' | 'tablet' | 'mobile'
type ComponentType = 'hero' | 'text' | 'cta' | 'comparison' | 'image' | 'affiliate' | 'card' | 'form'

interface Component {
  id: string
  type: ComponentType
  content: Record<string, any>
  desktopConfig: Record<string, any>
  tabletConfig: Record<string, any>
  mobileConfig: Record<string, any>
}

interface Page {
  id: string
  title: string
  slug: string
  content: string
  status: string
}

interface Site {
  id: string
  name: string
  theme: { primaryColor: string; secondaryColor: string } | null
}

// Sortable Component Item
function SortableItem({
  component,
  selected,
  onClick,
  device,
}: {
  component: Component
  selected: boolean
  onClick: () => void
  device: DeviceMode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: component.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isHidden = device === 'mobile'
    ? component.mobileConfig.display === 'none'
    : device === 'tablet'
    ? component.tabletConfig.display === 'none'
    : false

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`builder-component rounded-lg mb-2 ${selected ? 'selected' : ''} ${isHidden ? 'opacity-30' : ''}`}
    >
      <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-t-lg border-b text-xs text-gray-400">
        <span {...attributes} {...listeners} className="cursor-grab hover:text-gray-600 px-1">⠿</span>
        <span className="uppercase font-medium text-blue-500">{component.type}</span>
        {isHidden && <span className="ml-auto text-orange-400">非表示</span>}
      </div>
      <ComponentPreview component={component} device={device} />
    </div>
  )
}

function ComponentPreview({ component, device }: { component: Component; device: DeviceMode }) {
  const cfg = device === 'mobile' ? component.mobileConfig : device === 'tablet' ? component.tabletConfig : component.desktopConfig

  switch (component.type) {
    case 'hero':
      return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-b-lg">
          <h1 className="text-xl font-bold mb-2">{component.content.title || 'ヒーロータイトル'}</h1>
          <p className="text-blue-100 text-sm">{component.content.subtitle || 'サブタイトル'}</p>
        </div>
      )
    case 'text':
      return (
        <div className="p-4 rounded-b-lg bg-white">
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{component.content.body || 'テキストコンテンツ'}</p>
        </div>
      )
    case 'cta':
      return (
        <div className="p-4 bg-white rounded-b-lg flex justify-center">
          <a
            href={component.content.url || '#'}
            style={{
              backgroundColor: component.content.color || '#3B82F6',
              width: cfg.width || 'auto',
              display: 'inline-block',
              padding: '10px 24px',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'center',
              textDecoration: 'none',
            }}
            onClick={(e) => e.preventDefault()}
          >
            {component.content.text || 'CTAボタン'}
          </a>
        </div>
      )
    case 'comparison':
      return (
        <div className="p-3 bg-white rounded-b-lg">
          <p className="text-xs font-medium text-gray-600 mb-2">{component.content.title || '比較表'}</p>
          <div style={{ overflowX: cfg.tableStyle === 'scroll' ? 'auto' : 'hidden' }}>
            <table className="text-xs w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {(component.content.headers || ['項目1', '項目2']).map((h: string, i: number) => (
                    <th key={i} className="px-2 py-1 text-left border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(component.content.rows || []).slice(0, 2).map((row: string[], ri: number) => (
                  <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-2 py-1 border text-gray-600">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    case 'image':
      return (
        <div className="p-3 bg-white rounded-b-lg">
          {component.content.url ? (
            <img
              src={component.content.url}
              alt={component.content.alt || ''}
              className="w-full rounded object-cover"
              style={{ maxHeight: '150px' }}
            />
          ) : (
            <div className="bg-gray-200 rounded h-20 flex items-center justify-center text-gray-400 text-sm">
              🖼️ 画像
            </div>
          )}
        </div>
      )
    case 'affiliate':
      return (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-b-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">広告</span>
            <p className="text-xs text-gray-600">{component.content.name || 'アフィリエイト広告'}</p>
          </div>
        </div>
      )
    case 'card':
      return (
        <div className="p-3 bg-white rounded-b-lg">
          <div className="border rounded-lg p-3 text-xs text-gray-600">
            <p className="font-medium">{component.content.title || 'カード'}</p>
            <p className="text-gray-400 mt-1">{component.content.body || '説明テキスト'}</p>
          </div>
        </div>
      )
    case 'form':
      return (
        <div className="p-3 bg-white rounded-b-lg">
          <div className="space-y-2">
            <div className="h-8 bg-gray-100 rounded border text-xs flex items-center px-2 text-gray-400">お名前</div>
            <div className="h-8 bg-gray-100 rounded border text-xs flex items-center px-2 text-gray-400">メールアドレス</div>
            <div className="h-8 bg-blue-600 rounded text-white text-xs flex items-center justify-center">送信する</div>
          </div>
        </div>
      )
    default:
      return <div className="p-3 bg-white rounded-b-lg text-sm text-gray-400">コンポーネント</div>
  }
}

const COMPONENT_TYPES: { type: ComponentType; label: string; icon: string }[] = [
  { type: 'hero', label: 'ヒーロー', icon: '🦸' },
  { type: 'text', label: 'テキスト', icon: '📝' },
  { type: 'cta', label: 'CTA', icon: '🎯' },
  { type: 'comparison', label: '比較表', icon: '📊' },
  { type: 'image', label: '画像', icon: '🖼️' },
  { type: 'affiliate', label: '広告', icon: '📢' },
  { type: 'card', label: 'カード', icon: '🃏' },
  { type: 'form', label: 'フォーム', icon: '📋' },
]

function createDefaultComponent(type: ComponentType): Component {
  const id = `${type}-${Date.now()}`
  const defaults: Record<ComponentType, Partial<Component>> = {
    hero: { content: { title: 'ヒーロータイトルを入力', subtitle: 'サブタイトル' } },
    text: { content: { body: 'ここにテキストを入力してください。' } },
    cta: {
      content: { text: '詳細を見る', url: '#', color: '#3B82F6' },
      desktopConfig: { width: '300px' },
      tabletConfig: { width: '80%' },
      mobileConfig: { width: '100%' },
    },
    comparison: {
      content: {
        title: '比較表',
        headers: ['項目', 'プランA', 'プランB'],
        rows: [
          ['価格', '¥1,000', '¥2,000'],
          ['機能', '基本', '全機能'],
        ],
      },
    },
    image: { content: { url: '', alt: '画像の説明' } },
    affiliate: { content: { name: 'アフィリエイト広告', url: '#', code: '' } },
    card: { content: { title: 'カードタイトル', body: 'カードの説明文' } },
    form: { content: { fields: ['name', 'email'], submitText: '送信する' } },
  }

  return {
    id,
    type,
    content: defaults[type]?.content || {},
    desktopConfig: defaults[type]?.desktopConfig || { display: 'block' },
    tabletConfig: defaults[type]?.tabletConfig || { display: 'block' },
    mobileConfig: defaults[type]?.mobileConfig || { display: 'block' },
  }
}

export default function BuilderPage() {
  const { siteId } = useParams<{ siteId: string }>()
  const [site, setSite] = useState<Site | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [currentPage, setCurrentPage] = useState<Page | null>(null)
  const [components, setComponents] = useState<Component[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [device, setDevice] = useState<DeviceMode>('desktop')
  const [saving, setSaving] = useState(false)
  const [undoStack, setUndoStack] = useState<Component[][]>([])
  const [redoStack, setRedoStack] = useState<Component[][]>([])
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [mediaFiles, setMediaFiles] = useState<Array<{ id: string; name: string; url: string }>>([])
  const [showMediaPicker, setShowMediaPicker] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    Promise.all([
      fetch(`/api/sites/${siteId}`).then((r) => r.json()),
      fetch(`/api/sites/${siteId}/pages`).then((r) => r.json()),
      fetch('/api/media').then((r) => r.json()),
    ]).then(([s, p, m]) => {
      setSite(s.site)
      setPages(p.pages || [])
      setMediaFiles(m.files || [])
      if (p.pages?.length > 0) {
        const firstPage = p.pages[0]
        setCurrentPage(firstPage)
        try {
          setComponents(JSON.parse(firstPage.content))
        } catch {
          setComponents([])
        }
      }
    })
  }, [siteId])

  // Auto-save
  useEffect(() => {
    if (!currentPage) return
    if (autoSaveTimer) clearTimeout(autoSaveTimer)
    const timer = setTimeout(() => savePage(false), 3000)
    setAutoSaveTimer(timer)
    return () => clearTimeout(timer)
  }, [components])

  const pushUndo = useCallback((prev: Component[]) => {
    setUndoStack((stack) => [...stack.slice(-19), prev])
    setRedoStack([])
  }, [])

  const handleUndo = () => {
    if (undoStack.length === 0) return
    const prev = undoStack[undoStack.length - 1]
    setRedoStack((s) => [...s, components])
    setComponents(prev)
    setUndoStack((s) => s.slice(0, -1))
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]
    setUndoStack((s) => [...s, components])
    setComponents(next)
    setRedoStack((s) => s.slice(0, -1))
  }

  const savePage = async (showAlert = true) => {
    if (!currentPage) return
    setSaving(true)
    await fetch(`/api/sites/${siteId}/pages/${currentPage.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: JSON.stringify(components) }),
    })
    setSaving(false)
    setLastSaved(new Date())
    if (showAlert) alert('保存しました')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      pushUndo(components)
      const oldIdx = components.findIndex((c) => c.id === active.id)
      const newIdx = components.findIndex((c) => c.id === over.id)
      setComponents(arrayMove(components, oldIdx, newIdx))
    }
  }

  const addComponent = (type: ComponentType) => {
    pushUndo(components)
    const newComp = createDefaultComponent(type)
    setComponents([...components, newComp])
    setSelectedId(newComp.id)
  }

  const deleteComponent = (id: string) => {
    pushUndo(components)
    setComponents(components.filter((c) => c.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const updateComponent = (id: string, updates: Partial<Component>) => {
    setComponents(components.map((c) => c.id === id ? { ...c, ...updates } : c))
  }

  const updateContent = (id: string, key: string, value: any) => {
    setComponents(components.map((c) =>
      c.id === id ? { ...c, content: { ...c.content, [key]: value } } : c
    ))
  }

  const updateConfig = (id: string, device: DeviceMode, key: string, value: any) => {
    const cfgKey = `${device}Config` as keyof Component
    setComponents(components.map((c) =>
      c.id === id
        ? { ...c, [cfgKey]: { ...(c[cfgKey] as Record<string, any>), [key]: value } }
        : c
    ))
  }

  const switchPage = (page: Page) => {
    setCurrentPage(page)
    try {
      setComponents(JSON.parse(page.content))
    } catch {
      setComponents([])
    }
    setSelectedId(null)
  }

  const handlePublishPage = async () => {
    if (!currentPage) return
    await fetch(`/api/sites/${siteId}/pages/${currentPage.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: JSON.stringify(components),
        status: currentPage.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
      }),
    })
    setCurrentPage((p) => p ? { ...p, status: p.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } : p)
  }

  const selectedComponent = components.find((c) => c.id === selectedId)

  const canvasWidth =
    device === 'mobile' ? '390px' : device === 'tablet' ? '768px' : '100%'

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Toolbar */}
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center gap-2 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-1 mr-2">
          <span className="text-sm font-medium text-gray-300">{site?.name}</span>
          <span className="text-gray-500 mx-1">/</span>
          <span className="text-sm text-blue-400">{currentPage?.title}</span>
        </div>

        <div className="flex items-center gap-1 mr-4">
          <button onClick={handleUndo} disabled={undoStack.length === 0}
            className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-30 text-sm" title="元に戻す">↩</button>
          <button onClick={handleRedo} disabled={redoStack.length === 0}
            className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-30 text-sm" title="やり直し">↪</button>
        </div>

        <div className="flex items-center bg-gray-700 rounded-lg p-0.5 gap-0.5">
          {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                device === d ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              {d === 'desktop' ? '🖥 Desktop' : d === 'tablet' ? '📱 Tablet' : '📲 Mobile'}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-gray-400">
              {saving ? '保存中...' : `保存済 ${lastSaved.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`}
            </span>
          )}
          <button onClick={() => savePage(true)} disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-medium">
            💾 保存
          </button>
          <button onClick={handlePublishPage}
            className={`px-3 py-1.5 rounded text-xs font-medium ${
              currentPage?.status === 'PUBLISHED'
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}>
            {currentPage?.status === 'PUBLISHED' ? '非公開' : '🚀 公開'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Components + Pages */}
        <div className="w-48 bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden">
          {/* Pages */}
          <div className="p-2 border-b border-gray-700">
            <p className="text-xs text-gray-400 font-medium mb-1 uppercase">ページ</p>
            <div className="space-y-1">
              {pages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => switchPage(p)}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition ${
                    currentPage?.id === p.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Component Palette */}
          <div className="p-2 flex-1 overflow-y-auto">
            <p className="text-xs text-gray-400 font-medium mb-2 uppercase">コンポーネント追加</p>
            <div className="grid grid-cols-2 gap-1">
              {COMPONENT_TYPES.map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => addComponent(type)}
                  className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded text-xs transition flex flex-col items-center gap-1"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-600 flex flex-col items-center p-4">
          <div
            className="bg-white shadow-2xl transition-all duration-300 min-h-[500px]"
            style={{ width: canvasWidth, maxWidth: '100%' }}
          >
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <div className="p-3">
                  {components.map((component) => (
                    <SortableItem
                      key={component.id}
                      component={component}
                      selected={selectedId === component.id}
                      onClick={() => setSelectedId(component.id === selectedId ? null : component.id)}
                      device={device}
                    />
                  ))}
                  {components.length === 0 && (
                    <div className="drop-zone p-12 text-center">
                      <p className="text-gray-400">左のパネルからコンポーネントを追加してください</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* Right Panel: Properties */}
        <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
          {selectedComponent ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-gray-900">{selectedComponent.type.toUpperCase()} 設定</h3>
                <button onClick={() => deleteComponent(selectedComponent.id)}
                  className="text-red-500 hover:text-red-700 text-xs">削除</button>
              </div>

              {/* Device Tabs */}
              <div className="flex bg-gray-100 rounded p-0.5 mb-4 text-xs">
                {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    className={`flex-1 py-1 rounded text-center transition ${
                      device === d ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-500'
                    }`}
                  >
                    {d === 'desktop' ? '🖥' : d === 'tablet' ? '📱' : '📲'}
                  </button>
                ))}
              </div>

              {/* Content Settings */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-500 uppercase">コンテンツ</p>

                {selectedComponent.type === 'hero' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600">タイトル</label>
                      <input
                        type="text"
                        value={selectedComponent.content.title || ''}
                        onChange={(e) => updateContent(selectedComponent.id, 'title', e.target.value)}
                        className="w-full mt-1 px-2 py-1.5 border rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">サブタイトル</label>
                      <input
                        type="text"
                        value={selectedComponent.content.subtitle || ''}
                        onChange={(e) => updateContent(selectedComponent.id, 'subtitle', e.target.value)}
                        className="w-full mt-1 px-2 py-1.5 border rounded text-xs"
                      />
                    </div>
                  </>
                )}

                {selectedComponent.type === 'text' && (
                  <div>
                    <label className="text-xs text-gray-600">本文</label>
                    <textarea
                      value={selectedComponent.content.body || ''}
                      onChange={(e) => updateContent(selectedComponent.id, 'body', e.target.value)}
                      rows={5}
                      className="w-full mt-1 px-2 py-1.5 border rounded text-xs resize-none"
                    />
                  </div>
                )}

                {selectedComponent.type === 'cta' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600">ボタンテキスト</label>
                      <input
                        type="text"
                        value={selectedComponent.content.text || ''}
                        onChange={(e) => updateContent(selectedComponent.id, 'text', e.target.value)}
                        className="w-full mt-1 px-2 py-1.5 border rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">リンクURL</label>
                      <input
                        type="url"
                        value={selectedComponent.content.url || ''}
                        onChange={(e) => updateContent(selectedComponent.id, 'url', e.target.value)}
                        className="w-full mt-1 px-2 py-1.5 border rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">ボタンカラー</label>
                      <input
                        type="color"
                        value={selectedComponent.content.color || '#3B82F6'}
                        onChange={(e) => updateContent(selectedComponent.id, 'color', e.target.value)}
                        className="w-full mt-1 h-8 border rounded cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {selectedComponent.type === 'image' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600">画像URL</label>
                      <input
                        type="text"
                        value={selectedComponent.content.url || ''}
                        onChange={(e) => updateContent(selectedComponent.id, 'url', e.target.value)}
                        className="w-full mt-1 px-2 py-1.5 border rounded text-xs"
                        placeholder="https://..."
                      />
                    </div>
                    <button
                      onClick={() => setShowMediaPicker(true)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded text-xs"
                    >
                      🖼️ メディアから選択
                    </button>
                    <div>
                      <label className="text-xs text-gray-600">代替テキスト(alt)</label>
                      <input
                        type="text"
                        value={selectedComponent.content.alt || ''}
                        onChange={(e) => updateContent(selectedComponent.id, 'alt', e.target.value)}
                        className="w-full mt-1 px-2 py-1.5 border rounded text-xs"
                      />
                    </div>
                  </>
                )}

                {selectedComponent.type === 'affiliate' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600">広告名</label>
                      <input
                        type="text"
                        value={selectedComponent.content.name || ''}
                        onChange={(e) => updateContent(selectedComponent.id, 'name', e.target.value)}
                        className="w-full mt-1 px-2 py-1.5 border rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">広告コード（元コードを保存）</label>
                      <textarea
                        value={selectedComponent.content.code || ''}
                        onChange={(e) => updateContent(selectedComponent.id, 'code', e.target.value)}
                        rows={3}
                        className="w-full mt-1 px-2 py-1.5 border rounded text-xs font-mono resize-none"
                        placeholder="<a href=...>広告コード</a>"
                      />
                    </div>
                  </>
                )}

                {selectedComponent.type === 'card' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600">タイトル</label>
                      <input
                        type="text"
                        value={selectedComponent.content.title || ''}
                        onChange={(e) => updateContent(selectedComponent.id, 'title', e.target.value)}
                        className="w-full mt-1 px-2 py-1.5 border rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">説明</label>
                      <textarea
                        value={selectedComponent.content.body || ''}
                        onChange={(e) => updateContent(selectedComponent.id, 'body', e.target.value)}
                        rows={3}
                        className="w-full mt-1 px-2 py-1.5 border rounded text-xs resize-none"
                      />
                    </div>
                  </>
                )}

                {selectedComponent.type === 'comparison' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600">テーブルタイトル</label>
                      <input
                        type="text"
                        value={selectedComponent.content.title || ''}
                        onChange={(e) => updateContent(selectedComponent.id, 'title', e.target.value)}
                        className="w-full mt-1 px-2 py-1.5 border rounded text-xs"
                      />
                    </div>
                  </>
                )}

                {/* Device-specific settings */}
                <div className="pt-3 border-t mt-3">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">{device} 設定</p>

                  <div>
                    <label className="text-xs text-gray-600">表示</label>
                    <select
                      value={
                        device === 'mobile' ? selectedComponent.mobileConfig.display || 'block' :
                        device === 'tablet' ? selectedComponent.tabletConfig.display || 'block' :
                        selectedComponent.desktopConfig.display || 'block'
                      }
                      onChange={(e) => updateConfig(selectedComponent.id, device, 'display', e.target.value)}
                      className="w-full mt-1 px-2 py-1.5 border rounded text-xs"
                    >
                      <option value="block">表示</option>
                      <option value="none">非表示</option>
                    </select>
                  </div>

                  {selectedComponent.type === 'cta' && (
                    <div>
                      <label className="text-xs text-gray-600 mt-2 block">幅</label>
                      <input
                        type="text"
                        value={
                          device === 'mobile' ? selectedComponent.mobileConfig.width || '100%' :
                          device === 'tablet' ? selectedComponent.tabletConfig.width || '80%' :
                          selectedComponent.desktopConfig.width || '300px'
                        }
                        onChange={(e) => updateConfig(selectedComponent.id, device, 'width', e.target.value)}
                        className="w-full mt-1 px-2 py-1.5 border rounded text-xs"
                        placeholder="例: 300px, 80%, 100%"
                      />
                    </div>
                  )}

                  {selectedComponent.type === 'comparison' && (
                    <div>
                      <label className="text-xs text-gray-600 mt-2 block">モバイル表示スタイル</label>
                      <select
                        value={selectedComponent.mobileConfig.tableStyle || 'scroll'}
                        onChange={(e) => updateConfig(selectedComponent.id, 'mobile', 'tableStyle', e.target.value)}
                        className="w-full mt-1 px-2 py-1.5 border rounded text-xs"
                      >
                        <option value="scroll">横スクロール</option>
                        <option value="card">カード形式</option>
                        <option value="minimal">重要項目のみ</option>
                      </select>
                    </div>
                  )}

                  {selectedComponent.type === 'text' && (
                    <>
                      <div>
                        <label className="text-xs text-gray-600 mt-2 block">フォントサイズ</label>
                        <input
                          type="text"
                          value={
                            device === 'mobile' ? selectedComponent.mobileConfig.fontSize || '16px' :
                            device === 'tablet' ? selectedComponent.tabletConfig.fontSize || '16px' :
                            selectedComponent.desktopConfig.fontSize || '16px'
                          }
                          onChange={(e) => updateConfig(selectedComponent.id, device, 'fontSize', e.target.value)}
                          className="w-full mt-1 px-2 py-1.5 border rounded text-xs"
                          placeholder="16px"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mt-2 block">行間</label>
                        <input
                          type="text"
                          value={
                            device === 'mobile' ? selectedComponent.mobileConfig.lineHeight || '1.8' :
                            device === 'tablet' ? selectedComponent.tabletConfig.lineHeight || '1.7' :
                            selectedComponent.desktopConfig.lineHeight || '1.6'
                          }
                          onChange={(e) => updateConfig(selectedComponent.id, device, 'lineHeight', e.target.value)}
                          className="w-full mt-1 px-2 py-1.5 border rounded text-xs"
                          placeholder="1.8"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400 text-sm mt-8">
              <p className="text-2xl mb-2">👈</p>
              <p>コンポーネントを選択してプロパティを編集</p>
            </div>
          )}
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">メディアを選択</h3>
              <button onClick={() => setShowMediaPicker(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-4 gap-3">
                {mediaFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => {
                      if (selectedId) {
                        updateContent(selectedId, 'url', file.url)
                        updateContent(selectedId, 'alt', file.name)
                      }
                      setShowMediaPicker(false)
                    }}
                    className="cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition"
                  >
                    <img src={file.url} alt={file.name} className="w-full h-20 object-cover" />
                    <p className="text-xs text-gray-600 p-1 truncate">{file.name}</p>
                  </div>
                ))}
                {!mediaFiles.length && (
                  <div className="col-span-4 text-center py-8 text-gray-400">
                    <p>メディアがありません</p>
                    <p className="text-xs mt-1">メディア管理ページから追加してください</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
