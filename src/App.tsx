import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Camera,
  Check,
  ChevronRight,
  CirclePlay,
  Clock3,
  Copy,
  Ellipsis,
  ExternalLink,
  Flame,
  Gauge,
  Heart,
  Image,
  Link2,
  ListFilter,
  MapPin,
  Menu,
  MessageCircle,
  Pause,
  Pencil,
  Play,
  Plus,
  QrCode,
  RotateCcw,
  Search,
  Settings,
  Share2,
  Sparkles,
  Star,
  Upload,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react'

type Role = 'teacher' | 'student'
type Screen = 'workspace' | 'lesson' | 'practice' | 'result'
type Modal =
  | 'group'
  | 'lesson'
  | 'settings'
  | 'profile'
  | 'notifications'
  | 'student'
  | 'share'
  | 'lessonMenu'
  | 'practiceMenu'
  | null

type Studio = {
  name: string
  handle: string
  city: string
  address: string
  description: string
  directions: string
  contact: string
  logo: string
  cover: string
  accent: string
}

type StudentProfile = {
  firstName: string
  lastName: string
  nickname: string
  age: string
  city: string
  bio: string
  styles: string
  avatar: string
}

type Group = {
  id: string
  name: string
  description: string
  meta: string
  accent: string
  lessons: number
  students: number
}

type Lesson = {
  id: string
  number: string
  title: string
  style: string
  duration: string
  progress: number
  status: 'new' | 'active' | 'done'
}

type StudentRow = {
  name: string
  tag: string
  status: 'Сдала' | 'Учит' | 'Посмотрела' | 'Не начал'
  score: number
  stars: number
  avatar: string
  streak: number
}

const defaultStudio: Studio = {
  name: 'ДВИЖЕНИЕ ГОВОРИТ',
  handle: '@dancelab',
  city: 'Москва',
  address: 'Хлебозавод, Новодмитровская 1',
  description: 'Учимся слышать музыку телом. Пространство для практики, свободы и сильной подачи.',
  directions: 'Hip-hop · Choreo · Freestyle',
  contact: 'https://dancelab.ru',
  logo: '',
  cover: '',
  accent: '#d9ff43',
}

const defaultProfile: StudentProfile = {
  firstName: 'Мира',
  lastName: 'Лис',
  nickname: '@miralis',
  age: '15',
  city: 'Москва',
  bio: 'Танцую, чтобы становиться смелее. Люблю музыкальность, фристайл и длинные вечерние тренировки.',
  styles: 'Hip-hop · Choreo · Freestyle',
  avatar: '',
}

const defaultGroups: Group[] = [
  { id: 'g1', name: 'PRO / 16+', description: 'Сценическая группа', meta: 'Продвинутый', accent: '#ff6947', lessons: 12, students: 18 },
  { id: 'g2', name: 'TEENS', description: 'Основной состав', meta: '12–15 лет', accent: '#d9ff43', lessons: 8, students: 24 },
  { id: 'g3', name: 'START', description: 'Первые шаги', meta: 'Начальный', accent: '#8ba6ff', lessons: 5, students: 16 },
]

const defaultLessons: Lesson[] = [
  { id: 'l1', number: '01', title: 'ГРОМЧЕ ТЕЛА', style: 'Hip-hop', duration: '18 мин', progress: 72, status: 'active' },
  { id: 'l2', number: '02', title: 'ТОЧКА ОПОРЫ', style: 'Choreo', duration: '24 мин', progress: 0, status: 'new' },
  { id: 'l3', number: '03', title: 'НЕ ДУМАЙ — ДВИГАЙ', style: 'Freestyle', duration: '14 мин', progress: 100, status: 'done' },
]

const studentRows: StudentRow[] = [
  { name: 'Мира Лис', tag: '@miralis', status: 'Сдала', score: 94, stars: 5, avatar: 'МЛ', streak: 7 },
  { name: 'Саша Ким', tag: '@kimoves', status: 'Учит', score: 76, stars: 3, avatar: 'СК', streak: 4 },
  { name: 'Лиза Ной', tag: '@noiz', status: 'Посмотрела', score: 0, stars: 0, avatar: 'ЛН', streak: 2 },
  { name: 'Платон Рэй', tag: '@pray', status: 'Не начал', score: 0, stars: 0, avatar: 'ПР', streak: 0 },
]

function readLocal<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function fileToDataUrl(file: File, callback: (url: string) => void) {
  const reader = new FileReader()
  reader.onload = () => callback(String(reader.result))
  reader.readAsDataURL(file)
}

function App() {
  const [role, setRole] = useState<Role>('teacher')
  const [screen, setScreen] = useState<Screen>('workspace')
  const [modal, setModal] = useState<Modal>(null)
  const [groups, setGroups] = useState<Group[]>(() => readLocal('danceOversizedGroups', defaultGroups))
  const [lessons, setLessons] = useState<Lesson[]>(() => readLocal('danceOversizedLessons', defaultLessons))
  const [studio, setStudio] = useState<Studio>(() => readLocal('danceOversizedStudio', defaultStudio))
  const [profile, setProfile] = useState<StudentProfile>(() => readLocal('danceOversizedProfile', defaultProfile))
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => localStorage.setItem('danceOversizedGroups', JSON.stringify(groups)), [groups])
  useEffect(() => localStorage.setItem('danceOversizedLessons', JSON.stringify(lessons)), [lessons])
  useEffect(() => localStorage.setItem('danceOversizedStudio', JSON.stringify(studio)), [studio])
  useEffect(() => localStorage.setItem('danceOversizedProfile', JSON.stringify(profile)), [profile])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const switchRole = (nextRole: Role) => {
    setRole(nextRole)
    setScreen('workspace')
    setActiveGroup(null)
    setModal(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openLesson = () => {
    setScreen(role === 'teacher' ? 'lesson' : 'practice')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const addGroup = (name: string, description: string) => {
    setGroups((current) => [...current, {
      id: crypto.randomUUID(),
      name: name.toUpperCase(),
      description: description || 'Новая танцевальная группа',
      meta: 'Новый набор',
      accent: '#f1b8ff',
      lessons: 0,
      students: 0,
    }])
    setModal(null)
    setToast('Группа создана')
  }

  const addLesson = (name: string, description: string) => {
    const lesson: Lesson = {
      id: crypto.randomUUID(),
      number: String(lessons.length + 1).padStart(2, '0'),
      title: name.toUpperCase(),
      style: description || 'Choreo',
      duration: 'Новый',
      progress: 0,
      status: 'new',
    }
    setLessons((current) => [...current, lesson])
    setModal(null)
    setToast(`Черновик «${name}» создан`)
    setScreen('lesson')
  }

  const notify = (message: string) => setToast(message)

  return (
    <div className="app-shell">
      <TopBar
        role={role}
        profile={profile}
        onRoleChange={switchRole}
        onNotifications={() => setModal('notifications')}
        onProfile={() => setModal('profile')}
        onMenu={() => notify('Навигация открыта — выберите режим в центре шапки')}
      />

      {role === 'teacher' ? (
        <>
          <StudioHero
            studio={studio}
            onSettings={() => setModal('settings')}
            onShare={() => setModal('share')}
            onInvite={() => notify('Ссылка-приглашение скопирована')}
          />
          {screen === 'workspace' && (
            <TeacherWorkspace
              groups={groups}
              lessons={lessons}
              activeGroup={activeGroup}
              onGroupChange={setActiveGroup}
              onAddGroup={() => setModal('group')}
              onAddLesson={() => setModal('lesson')}
              onOpenLesson={openLesson}
              onAction={notify}
            />
          )}
          {screen === 'lesson' && (
            <TeacherLesson
              group={activeGroup}
              onBack={() => setScreen('workspace')}
              onPublish={() => notify('Урок опубликован для группы')}
              onMenu={() => setModal('lessonMenu')}
              onStudent={(student) => {
                setSelectedStudent(student)
                setModal('student')
              }}
              onAction={notify}
            />
          )}
        </>
      ) : (
        <>
          {screen === 'workspace' && (
            <StudentDashboard
              profile={profile}
              studio={studio}
              lessons={lessons}
              onOpenLesson={openLesson}
              onEditProfile={() => setModal('profile')}
              onShare={() => setModal('share')}
              onAction={notify}
            />
          )}
          {screen === 'practice' && (
            <PracticeScreen
              onBack={() => setScreen('workspace')}
              onComplete={() => setScreen('result')}
              onMenu={() => setModal('practiceMenu')}
              onAction={notify}
            />
          )}
          {screen === 'result' && (
            <ResultScreen
              onRetry={() => setScreen('practice')}
              onFinish={() => setScreen('workspace')}
              onShare={() => setModal('share')}
            />
          )}
        </>
      )}

      {modal === 'group' && (
        <CreateModal eyebrow="Новое пространство" title="СОЗДАТЬ ГРУППУ" submitLabel="Создать" onClose={() => setModal(null)} onSubmit={addGroup} />
      )}
      {modal === 'lesson' && (
        <CreateModal eyebrow="Новый материал" title="СОЗДАТЬ УРОК" submitLabel="Продолжить" onClose={() => setModal(null)} onSubmit={addLesson} />
      )}
      {modal === 'settings' && (
        <StudioSettingsModal studio={studio} onClose={() => setModal(null)} onSave={(next) => {
          setStudio(next)
          setModal(null)
          notify('Страница студии обновлена')
        }} />
      )}
      {modal === 'profile' && (
        <ProfileModal profile={profile} onClose={() => setModal(null)} onSave={(next) => {
          setProfile(next)
          setModal(null)
          notify('Профиль обновлен')
        }} />
      )}
      {modal === 'notifications' && <NotificationsModal onClose={() => setModal(null)} onAction={notify} />}
      {modal === 'student' && selectedStudent && <StudentDetailModal student={selectedStudent} onClose={() => setModal(null)} onAction={notify} />}
      {modal === 'share' && <ShareModal role={role} onClose={() => setModal(null)} onAction={notify} />}
      {modal === 'lessonMenu' && (
        <ActionModal title="УРОК" onClose={() => setModal(null)} actions={[
          ['Редактировать описание', () => notify('Редактор описания открыт')],
          ['Дублировать урок', () => notify('Копия урока создана')],
          ['Скопировать ссылку', () => notify('Ссылка на урок скопирована')],
          ['Переместить в архив', () => notify('Урок перемещен в архив')],
        ]} />
      )}
      {modal === 'practiceMenu' && (
        <ActionModal title="НАСТРОЙКИ" onClose={() => setModal(null)} actions={[
          ['Как правильно поставить камеру', () => notify('Подсказка по камере включена')],
          ['Включить зеркальное отражение', () => notify('Зеркальное отражение включено')],
          ['Сообщить о проблеме', () => notify('Форма обратной связи открыта')],
        ]} />
      )}
      {toast && <div className="toast" role="status"><Check size={18} /> {toast}</div>}
    </div>
  )
}

function TopBar({
  role,
  profile,
  onRoleChange,
  onNotifications,
  onProfile,
  onMenu,
}: {
  role: Role
  profile: StudentProfile
  onRoleChange: (role: Role) => void
  onNotifications: () => void
  onProfile: () => void
  onMenu: () => void
}) {
  const initials = role === 'teacher' ? 'АЛ' : `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`
  return (
    <header className="topbar">
      <button className="brand" onClick={() => onRoleChange(role)} aria-label="На главную">ТАНЦУЙ<span>●</span></button>
      <nav className="role-switch" aria-label="Режим приложения">
        <button className={role === 'teacher' ? 'active' : ''} onClick={() => onRoleChange('teacher')}>Педагог</button>
        <button className={role === 'student' ? 'active' : ''} onClick={() => onRoleChange('student')}>Ученик</button>
      </nav>
      <div className="top-actions">
        <button className="icon-button notification-button" aria-label="Уведомления" onClick={onNotifications}><Bell size={19} /><i /></button>
        <button className="profile-chip" onClick={onProfile}>
          <span style={profile.avatar ? { backgroundImage: `url(${profile.avatar})` } : undefined}>{profile.avatar ? '' : initials}</span>
          <b>{role === 'teacher' ? 'Аня Ли' : `${profile.firstName} ${profile.lastName}`}</b>
        </button>
        <button className="icon-button mobile-menu" aria-label="Меню" onClick={onMenu}><Menu size={22} /></button>
      </div>
    </header>
  )
}

function StudioHero({
  studio,
  onSettings,
  onShare,
  onInvite,
}: {
  studio: Studio
  onSettings: () => void
  onShare: () => void
  onInvite: () => void
}) {
  const linkLabel = studio.contact.replace(/^https?:\/\//, '').replace(/\/$/, '')
  return (
    <section className={`studio-hero ${studio.cover ? 'has-cover' : ''}`} style={studio.cover ? { backgroundImage: `linear-gradient(90deg, rgba(10,10,9,.9), rgba(10,10,9,.35)), url(${studio.cover})` } : undefined}>
      {!studio.cover && <div className="hero-figure" aria-hidden="true"><div className="figure-head" /><div className="figure-body" /><div className="figure-arm arm-left" /><div className="figure-arm arm-right" /><div className="figure-leg leg-left" /><div className="figure-leg leg-right" /></div>}
      <div className="hero-noise" />
      <div className="studio-meta">
        <button className="studio-logo" onClick={onSettings} aria-label="Изменить логотип" style={studio.logo ? { backgroundImage: `url(${studio.logo})`, backgroundColor: studio.accent } : { backgroundColor: studio.accent }}>
          {studio.logo ? '' : 'D/LAB'}
          <i><Pencil size={13} /></i>
        </button>
        <div>
          <p className="eyebrow light">{studio.city} · ТАНЦЕВАЛЬНАЯ СТУДИЯ · {studio.handle}</p>
          <h1>{studio.name}</h1>
        </div>
      </div>
      <div className="hero-bottom">
        <div className="studio-description">
          <p>{studio.description}</p>
          <span>{studio.directions}</span>
        </div>
        <div className="hero-links">
          <span><Users size={17} /> 58 учеников</span>
          <span><MapPin size={17} /> {studio.address}</span>
          {studio.contact && <a href={studio.contact} target="_blank" rel="noreferrer"><Link2 size={17} /> {linkLabel}</a>}
        </div>
      </div>
      <div className="studio-social-actions">
        <button onClick={onInvite}><UserPlus size={17} /> Пригласить</button>
        <button onClick={onShare}><Share2 size={17} /> Поделиться</button>
        <button onClick={onSettings}><Settings size={17} /> Редактировать</button>
      </div>
    </section>
  )
}

function TeacherWorkspace({
  groups,
  lessons,
  activeGroup,
  onGroupChange,
  onAddGroup,
  onAddLesson,
  onOpenLesson,
  onAction,
}: {
  groups: Group[]
  lessons: Lesson[]
  activeGroup: Group | null
  onGroupChange: (group: Group | null) => void
  onAddGroup: () => void
  onAddLesson: () => void
  onOpenLesson: () => void
  onAction: (message: string) => void
}) {
  return (
    <main className="workspace">
      <div className="studio-tabs" aria-label="Разделы студии">
        <button className="active">Пространство</button>
        <button onClick={() => onAction('Лента студии открыта')}>Лента</button>
        <button onClick={() => onAction('Раздел команды открыт')}>Команда</button>
        <button onClick={() => onAction('Аналитика обновлена')}>Аналитика</button>
      </div>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{activeGroup ? 'Студия / Группы' : 'Рабочее пространство'}</p>
          <h2>{activeGroup ? activeGroup.name : 'МОИ ГРУППЫ'}</h2>
        </div>
        <div className="heading-actions">
          {activeGroup && <button className="button secondary" onClick={() => onGroupChange(null)}><ArrowLeft size={18} /> Назад</button>}
          <button className="button dark" onClick={activeGroup ? onAddLesson : onAddGroup}><Plus size={19} /> {activeGroup ? 'Новый урок' : 'Новая группа'}</button>
        </div>
      </div>

      {!activeGroup ? (
        <div className="group-grid">
          {groups.map((group, index) => (
            <button className="group-card" key={group.id} onClick={() => onGroupChange(group)}>
              <div className="group-card-top"><span className="card-index">{String(index + 1).padStart(2, '0')}</span><span className="round-arrow"><ArrowRight size={21} /></span></div>
              <div className="group-orbit" style={{ background: group.accent }}><span>{group.name.slice(0, 2)}</span></div>
              <p className="card-type">ГРУППА · {group.meta}</p>
              <h3>{group.name}</h3>
              <p className="card-description">{group.description}</p>
              <div className="card-stats"><span>{group.students} учеников</span><span>{group.lessons} уроков</span></div>
            </button>
          ))}
          <button className="group-card add-card" onClick={onAddGroup}><Plus size={50} strokeWidth={1.3} /><span>ДОБАВИТЬ<br />ГРУППУ</span></button>
        </div>
      ) : (
        <GroupDetail group={activeGroup} lessons={lessons} onOpenLesson={onOpenLesson} onAddLesson={onAddLesson} onAction={onAction} />
      )}
    </main>
  )
}

function GroupDetail({
  group,
  lessons,
  onOpenLesson,
  onAddLesson,
  onAction,
}: {
  group: Group
  lessons: Lesson[]
  onOpenLesson: () => void
  onAddLesson: () => void
  onAction: (message: string) => void
}) {
  return (
    <div className="group-detail">
      <div className="group-summary">
        <div className="summary-number">{group.students}</div><p>учеников<br />в группе</p><div className="summary-divider" />
        <button className="summary-kpi" onClick={() => onAction('Открыта аналитика результатов')}><b>78%</b><span>средний результат</span></button>
        <button className="summary-kpi" onClick={() => onAction('Показаны активные ученики')}><b>12</b><span>активны сегодня</span></button>
        <button className="summary-kpi" onClick={() => onAction('Приглашение в группу скопировано')}><QrCode size={28} /><span>QR-приглашение</span></button>
      </div>
      <div className="subheading"><h3>УРОКИ</h3><button className="text-button" onClick={onAddLesson}>Добавить урок <Plus size={18} /></button></div>
      <div className="lesson-list">
        {lessons.map((lesson) => (
          <button className="lesson-row" key={lesson.id} onClick={onOpenLesson}>
            <span className="lesson-number">{lesson.number}</span>
            <div className="lesson-art"><span>{lesson.style}</span><div className="mini-figure" /></div>
            <div className="lesson-copy"><p>{lesson.style} · {lesson.duration}</p><h4>{lesson.title}</h4></div>
            <div className="progress-wrap"><span>{lesson.status === 'done' ? 'Пройден' : lesson.status === 'new' ? 'Черновик' : `${lesson.progress}% группы`}</span><div className="progress"><i style={{ width: `${lesson.progress}%` }} /></div></div>
            <ChevronRight size={28} />
          </button>
        ))}
      </div>
    </div>
  )
}

function TeacherLesson({
  group,
  onBack,
  onPublish,
  onMenu,
  onStudent,
  onAction,
}: {
  group: Group | null
  onBack: () => void
  onPublish: () => void
  onMenu: () => void
  onStudent: (student: StudentRow) => void
  onAction: (message: string) => void
}) {
  const [tab, setTab] = useState<'prepare' | 'students'>('prepare')
  const [step, setStep] = useState(0)
  const [learningVideo, setLearningVideo] = useState<string | null>(null)
  const [examVideo, setExamVideo] = useState<string | null>(null)
  const [building, setBuilding] = useState(false)
  const [referenceReady, setReferenceReady] = useState(false)
  const [published, setPublished] = useState(false)
  const steps = ['Видео', 'Эталон', 'Проверка', 'Фрагмент', 'Публикация']

  const chooseVideo = (event: ChangeEvent<HTMLInputElement>, type: 'learning' | 'exam') => {
    const file = event.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if (type === 'learning') setLearningVideo(url)
    else setExamVideo(url)
  }

  const buildReference = () => {
    setBuilding(true)
    window.setTimeout(() => {
      setBuilding(false)
      setReferenceReady(true)
      setStep(2)
      onAction('Эталон движения построен')
    }, 1400)
  }

  const publish = () => {
    setPublished(true)
    setStep(4)
    onPublish()
  }

  return (
    <main className="lesson-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={18} /> {group?.name || 'К группе'}</button>
      <div className="lesson-title-row">
        <div><p className="eyebrow">Урок 01 · Hip-hop</p><h2>ГРОМЧЕ<br />ТЕЛА</h2></div>
        <div className="lesson-actions">
          <button className="button secondary" aria-label="Меню урока" onClick={onMenu}><Ellipsis size={20} /></button>
          <button className="button acid" onClick={publish} disabled={!referenceReady || published}>{published ? <Check size={18} /> : <Zap size={18} />}{published ? 'Опубликован' : 'Опубликовать'}</button>
        </div>
      </div>
      <div className="tabbar">
        <button className={tab === 'prepare' ? 'active' : ''} onClick={() => setTab('prepare')}>Подготовка урока</button>
        <button className={tab === 'students' ? 'active' : ''} onClick={() => setTab('students')}>Ученики <span>24</span></button>
      </div>
      {tab === 'prepare' ? (
        <>
          <div className="pipeline">
            {steps.map((label, index) => (
              <button key={label} className={index === step ? 'active' : index < step ? 'done' : ''} onClick={() => {
                setStep(index)
                onAction(`Этап «${label}» открыт`)
              }}><span>{index < step ? <Check size={15} /> : index + 1}</span>{label}</button>
            ))}
          </div>
          <section className="video-grid">
            <VideoUploader index="01" label="Обучение" title="ОБЪЯСНЕНИЕ" description="Разбор движений, счет и детали. Это видео не анализируется." video={learningVideo} onChange={(event) => chooseVideo(event, 'learning')} />
            <VideoUploader index="02" label="Эталон" title="ТАНЕЦ + МУЗЫКА" description="Готовый танец. Только из этого видео строится эталонный скелет." video={examVideo} onChange={(event) => chooseVideo(event, 'exam')} accent />
          </section>
          <section className="reference-panel">
            <div><p className="eyebrow">Pose engine · 30 FPS</p><h3>{referenceReady ? 'ЭТАЛОН ГОТОВ' : 'СОБРАТЬ СКЕЛЕТ'}</h3><p>{referenceReady ? '284 кадра сохранены. Синхронизация и нормализация тела выполнены.' : 'Загрузите видео под музыку, отметьте полезный фрагмент и создайте цифровой эталон движения.'}</p></div>
            <button className="button dark" onClick={buildReference} disabled={!examVideo || building || referenceReady}>
              {building ? <><span className="spinner" /> Анализируем…</> : referenceReady ? <><Check size={19} /> Готово</> : <><Sparkles size={19} /> Построить эталон</>}
            </button>
          </section>
        </>
      ) : <StudentTable onStudent={onStudent} onAction={onAction} />}
    </main>
  )
}

function VideoUploader({
  index,
  label,
  title,
  description,
  video,
  onChange,
  accent = false,
}: {
  index: string
  label: string
  title: string
  description: string
  video: string | null
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  accent?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(100)
  return (
    <article className={`video-uploader ${accent ? 'accent' : ''}`}>
      <div className="uploader-heading"><span>{index}</span><div><p>{label}</p><h3>{title}</h3></div></div>
      <p className="uploader-description">{description}</p>
      <div className="video-stage">
        {video ? <video src={video} controls playsInline muted preload="metadata" /> : <button onClick={() => inputRef.current?.click()}><Upload size={28} /><span>Загрузить видео</span><small>MP4, MOV · до 500 МБ</small></button>}
      </div>
      <input ref={inputRef} type="file" accept="video/*" hidden onChange={onChange} />
      {video && (
        <div className="trim-panel">
          <div><span>Начало</span><b>{start.toFixed(1)} сек</b></div>
          <input aria-label={`${label}: начало фрагмента`} type="range" min="0" max="90" value={start} onChange={(e) => setStart(Number(e.target.value))} />
          <input aria-label={`${label}: конец фрагмента`} type="range" min="10" max="100" value={end} onChange={(e) => setEnd(Number(e.target.value))} />
          <div><span>Конец</span><b>{end.toFixed(1)} сек</b></div>
        </div>
      )}
    </article>
  )
}

function StudentTable({ onStudent, onAction }: { onStudent: (student: StudentRow) => void; onAction: (message: string) => void }) {
  const [filter, setFilter] = useState('Все')
  const [query, setQuery] = useState('')
  const filtered = studentRows.filter((student) => (filter === 'Все' || student.status === filter) && `${student.name} ${student.tag}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <section className="students-section">
      <div className="table-tools">
        <div><p className="eyebrow">Прогресс группы</p><h3>{filtered.length} {filtered.length === 1 ? 'УЧЕНИК' : 'УЧЕНИКА'}</h3></div>
        <div className="student-tools">
          <label className="search-field"><Search size={16} /><input aria-label="Поиск учеников" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Найти ученика" /></label>
          <select aria-label="Фильтр учеников" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>Все</option><option>Сдала</option><option>Учит</option><option>Посмотрела</option><option>Не начал</option>
          </select>
          <button className="button secondary" onClick={() => onAction('Список учеников экспортирован')}><ListFilter size={17} /> Экспорт</button>
        </div>
      </div>
      <div className="student-table">
        {filtered.map((student) => (
          <button className="student-row" key={student.tag} onClick={() => onStudent(student)}>
            <span className="student-avatar">{student.avatar}</span>
            <span className="student-name"><b>{student.name}</b><span>{student.tag}</span></span>
            <span className={`status status-${student.status.replace(' ', '-').toLowerCase()}`}>{student.status}</span>
            <b className="student-score">{student.score ? `${student.score}%` : '—'}</b>
            <span className="stars">{student.stars ? `${student.stars} ★` : '—'}</span>
            <ChevronRight size={20} />
          </button>
        ))}
      </div>
    </section>
  )
}

function StudentDashboard({
  profile,
  studio,
  lessons,
  onOpenLesson,
  onEditProfile,
  onShare,
  onAction,
}: {
  profile: StudentProfile
  studio: Studio
  lessons: Lesson[]
  onOpenLesson: () => void
  onEditProfile: () => void
  onShare: () => void
  onAction: (message: string) => void
}) {
  const [studentTab, setStudentTab] = useState<'overview' | 'activity' | 'achievements'>('overview')
  const initials = `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`
  return (
    <main className="student-dashboard">
      <section className="student-profile-hero">
        <div className="profile-cover-art"><span>MOVE / 08</span><div className="profile-cover-figure" /></div>
        <div className="student-profile-main">
          <div className="big-avatar" style={profile.avatar ? { backgroundImage: `url(${profile.avatar})` } : undefined}>{profile.avatar ? '' : initials}</div>
          <div className="student-identity">
            <p className="eyebrow">Профиль ученика · {studio.name}</p>
            <h1>{profile.firstName}<br />{profile.lastName}</h1>
            <div className="identity-meta"><span>{profile.nickname}</span><span><MapPin size={14} /> {profile.city}</span><span>{profile.age} лет</span></div>
          </div>
          <div className="profile-actions">
            <button className="button secondary" onClick={onShare}><Share2 size={17} /> Поделиться</button>
            <button className="button dark" onClick={onEditProfile}><Pencil size={17} /> Редактировать</button>
          </div>
        </div>
        <div className="profile-bio-row">
          <p>{profile.bio}</p>
          <div><span>СТИЛИ</span><b>{profile.styles}</b></div>
          <div><span>ГРУППА</span><button onClick={() => onAction('Открыта страница группы TEENS')}>TEENS <ArrowRight size={15} /></button></div>
        </div>
        <div className="student-profile-tabs">
          <button className={studentTab === 'overview' ? 'active' : ''} onClick={() => setStudentTab('overview')}>Обзор</button>
          <button className={studentTab === 'activity' ? 'active' : ''} onClick={() => setStudentTab('activity')}>Активность</button>
          <button className={studentTab === 'achievements' ? 'active' : ''} onClick={() => setStudentTab('achievements')}>Достижения</button>
        </div>
      </section>

      {studentTab === 'overview' && (
        <>
          <section className="profile-overview">
            <div className="level-card">
              <div className="level-number"><span>УРОВЕНЬ</span><b>08</b></div>
              <div><h2>72 / 90 ЗВЕЗД</h2><div className="level-line"><i /></div><p>Еще 18 звезд — и откроется новый уровень профиля.</p></div>
            </div>
            <div className="social-stat-grid">
              <button onClick={() => onAction('Показана серия тренировок')}><Flame /><b>7</b><span>дней подряд</span></button>
              <button onClick={() => onAction('Открыта коллекция звезд')}><Star /><b>84</b><span>звезды</span></button>
              <button onClick={() => onAction('Открыта лучшая попытка')}><Gauge /><b>94%</b><span>лучший результат</span></button>
              <button onClick={() => onAction('Открыта статистика практики')}><Clock3 /><b>4.2</b><span>часа практики</span></button>
            </div>
          </section>
          <FeaturedLesson onOpenLesson={onOpenLesson} />
          <ContinueLessons lessons={lessons} onOpenLesson={onOpenLesson} />
        </>
      )}

      {studentTab === 'activity' && <ActivityFeed profile={profile} onAction={onAction} />}
      {studentTab === 'achievements' && <Achievements onAction={onAction} />}
    </main>
  )
}

function FeaturedLesson({ onOpenLesson }: { onOpenLesson: () => void }) {
  return (
    <section className="featured-lesson">
      <div className="featured-copy">
        <p className="eyebrow light">Твоя группа · Новый урок</p><h2>ГРОМЧЕ<br />ТЕЛА</h2>
        <p>Связка на акценты, контраст амплитуды и уверенная подача.</p>
        <button className="button acid" onClick={onOpenLesson}><Play size={18} fill="currentColor" /> Начать урок</button>
      </div>
      <div className="featured-visual"><div className="pose-lines"><i /><i /><i /><i /><i /></div><span className="vertical-type">HIP—HOP / 01</span><button className="giant-play" onClick={onOpenLesson} aria-label="Начать урок"><Play fill="currentColor" /></button></div>
    </section>
  )
}

function ContinueLessons({ lessons, onOpenLesson }: { lessons: Lesson[]; onOpenLesson: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const visibleLessons = expanded ? lessons : lessons.slice(1)
  return (
    <section className="continue-section">
      <div className="subheading"><h3>{expanded ? 'ВСЕ УРОКИ' : 'ПРОДОЛЖИТЬ'}</h3><button className="text-button" onClick={() => setExpanded(!expanded)}>{expanded ? 'Свернуть' : 'Все уроки'} <ArrowRight size={18} /></button></div>
      <div className="continue-grid">
        {visibleLessons.map((lesson) => (
          <button key={lesson.id} className="continue-card" onClick={onOpenLesson}>
            <div className="continue-art"><span>{lesson.number}</span><CirclePlay /></div><p>{lesson.style} · {lesson.duration}</p><h4>{lesson.title}</h4><div className="progress"><i style={{ width: `${lesson.progress}%` }} /></div>
          </button>
        ))}
      </div>
    </section>
  )
}

function ActivityFeed({ profile, onAction }: { profile: StudentProfile; onAction: (message: string) => void }) {
  return (
    <section className="activity-section">
      <div className="section-heading compact"><div><p className="eyebrow">Последние события</p><h2>АКТИВНОСТЬ</h2></div></div>
      <div className="activity-layout">
        <div className="activity-feed">
          <article className="activity-post">
            <div className="post-author"><span>МЛ</span><div><b>{profile.firstName} {profile.lastName}</b><small>сегодня, 18:42 · попытка урока</small></div><button onClick={() => onAction('Меню публикации открыто')} aria-label="Меню публикации"><Ellipsis /></button></div>
            <div className="post-score"><b>94%</b><span>ГРОМЧЕ ТЕЛА</span><i>★★★★★</i></div>
            <p>Кажется, наконец поймала акцент в последней восьмерке. Амплитуда еще просит работы 🖤</p>
            <div className="post-actions"><button onClick={() => onAction('Лайк добавлен')}><Heart size={18} /> 18</button><button onClick={() => onAction('Комментарии открыты')}><MessageCircle size={18} /> 4</button><button onClick={() => onAction('Публикация отправлена')}><Share2 size={18} /></button></div>
          </article>
          <article className="activity-post compact-post">
            <div className="post-author"><span className="studio-post-logo">D/</span><div><b>Движение говорит</b><small>вчера · новая публикация</small></div></div>
            <h3>НОВАЯ НЕДЕЛЯ — НОВЫЙ ФОКУС.</h3><p>На этой неделе работаем над контрастом: маленькое движение должно быть таким же осмысленным, как большое.</p>
            <button className="text-button" onClick={() => onAction('Публикация студии открыта')}>Читать полностью <ArrowRight size={16} /></button>
          </article>
        </div>
        <aside className="activity-aside"><p className="eyebrow">Твоя неделя</p><b>3</b><span>тренировки</span><b>52</b><span>минуты в движении</span><b>+9</b><span>звезд</span></aside>
      </div>
    </section>
  )
}

function Achievements({ onAction }: { onAction: (message: string) => void }) {
  const achievements = [
    ['7', 'Без пауз', 'Серия 7 дней'],
    ['94', 'Точно в бит', 'Результат выше 90%'],
    ['5★', 'Полная отдача', 'Пять звезд за урок'],
    ['12', 'Не сдаюсь', '12 попыток завершено'],
    ['08', 'Новый уровень', 'Достигнут 8 уровень'],
    ['∞', 'Свободный стиль', 'Первый фристайл'],
  ]
  return (
    <section className="achievements-section">
      <div className="section-heading compact"><div><p className="eyebrow">Коллекция профиля</p><h2>ДОСТИЖЕНИЯ</h2></div><span>6 / 24 открыто</span></div>
      <div className="achievement-grid">
        {achievements.map(([mark, title, description], index) => (
          <button key={title} className={index < 4 ? 'unlocked' : ''} onClick={() => onAction(index < 4 ? `Достижение «${title}» открыто` : `До достижения «${title}» еще немного`)}>
            <span>{mark}</span><div><h3>{title}</h3><p>{description}</p></div>
          </button>
        ))}
      </div>
    </section>
  )
}

function PracticeScreen({
  onBack,
  onComplete,
  onMenu,
  onAction,
}: {
  onBack: () => void
  onComplete: () => void
  onMenu: () => void
  onAction: (message: string) => void
}) {
  const [mode, setMode] = useState<'learn' | 'exam'>('learn')
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(0.8)
  const [countdown, setCountdown] = useState<number | null>(null)
  const startExam = () => {
    setCountdown(3)
    let value = 3
    const timer = window.setInterval(() => {
      value -= 1
      if (value === 0) {
        window.clearInterval(timer)
        setCountdown(null)
        setPlaying(true)
        window.setTimeout(onComplete, 2400)
      } else setCountdown(value)
    }, 650)
  }
  return (
    <main className="practice-page">
      <div className="practice-top">
        <button className="back-link light" onClick={onBack}><ArrowLeft size={18} /> К урокам</button>
        <div className="practice-tabs"><button className={mode === 'learn' ? 'active' : ''} onClick={() => setMode('learn')}>Учить</button><button className={mode === 'exam' ? 'active' : ''} onClick={() => setMode('exam')}>Сдать</button></div>
        <button className="icon-button inverted" aria-label="Настройки практики" onClick={onMenu}><Ellipsis /></button>
      </div>
      <div className="practice-stage">
        <div className="practice-title"><span>01 / HIP-HOP</span><h1>ГРОМЧЕ<br />ТЕЛА</h1></div>
        <div className="practice-person"><div className="practice-head" /><div className="practice-torso" /><div className="practice-limb pa1" /><div className="practice-limb pa2" /><div className="practice-limb pl1" /><div className="practice-limb pl2" /></div>
        {mode === 'exam' && <button className="camera-preview" onClick={() => onAction('Предпросмотр камеры развернут')}><Camera size={20} /><span>Камера ученика</span><div className="camera-person" /></button>}
        {countdown !== null && <div className="countdown">{countdown}</div>}
        <div className="practice-controls">
          {mode === 'learn' ? (
            <>
              <button aria-label={playing ? 'Пауза' : 'Воспроизвести'} onClick={() => setPlaying(!playing)}>{playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button>
              <div className="timeline"><i style={{ width: playing ? '64%' : '28%' }} /><span style={{ left: playing ? '64%' : '28%' }} /></div><span>00:18 / 00:42</span>
              <label>Скорость<select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}><option value={0.4}>0.4×</option><option value={0.6}>0.6×</option><option value={0.8}>0.8×</option><option value={1}>1×</option></select></label>
            </>
          ) : <button className="exam-button" onClick={startExam}><Camera size={21} /> Начать сдачу</button>}
        </div>
      </div>
      <div className="practice-note"><p><b>{mode === 'learn' ? 'Смотри и повторяй.' : 'Встань так, чтобы тебя было видно полностью.'}</b><br />{mode === 'learn' ? 'Замедляй сложные моменты и возвращайся к ним столько, сколько нужно.' : 'После отсчета видео и запись начнутся одновременно.'}</p><span>{mode === 'learn' ? 'УЧИСЬ В СВОЕМ РИТМЕ' : 'КАМЕРА · ГОТОВА'}</span></div>
    </main>
  )
}

function ResultScreen({ onRetry, onFinish, onShare }: { onRetry: () => void; onFinish: () => void; onShare: () => void }) {
  const metrics = [['Руки', 96], ['Ноги', 88], ['Корпус', 91], ['Ритм', 94], ['Амплитуда', 86], ['Энергия', 92], ['Траектория', 89], ['Покрытие', 98]] as const
  return (
    <main className="result-page">
      <div className="result-kicker">ПОПАЛА В ДВИЖЕНИЕ</div>
      <section className="score-hero">
        <div className="score-copy"><p>Результат попытки</p><h1>94<span>%</span></h1><div className="big-stars">★★★★★</div></div>
        <div className="score-message"><span>ЛУЧШИЙ РЕЗУЛЬТАТ</span><h2>ТОЧНО.<br />СИЛЬНО.</h2><p>Сильная форма, точный ритм и уверенная энергия. Еще немного амплитуды в переходах — и будет совсем чисто.</p><button className="text-button" onClick={onShare}><Share2 size={17} /> Поделиться результатом</button></div>
      </section>
      <section className="metrics-grid">{metrics.map(([label, value]) => <div className="metric" key={label}><span>{label}</span><b>{value}</b><div><i style={{ width: `${value}%` }} /></div></div>)}</section>
      <section className="result-actions"><div><p className="eyebrow">Награда</p><h3>+5 ЗВЕЗД</h3><p>До 9 уровня осталось 13 звезд.</p></div><div><button className="button secondary" onClick={onRetry}><RotateCcw size={18} /> Еще раз</button><button className="button dark" onClick={onFinish}>Завершить <ArrowRight size={18} /></button></div></section>
    </main>
  )
}

function ModalShell({ children, onClose, className = '' }: { children: ReactNode; onClose: () => void; className?: string }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className={`modal ${className}`} role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}><button type="button" className="modal-close" onClick={onClose} aria-label="Закрыть"><X /></button>{children}</div></div>
}

function CreateModal({
  eyebrow,
  title,
  submitLabel,
  onClose,
  onSubmit,
}: {
  eyebrow: string
  title: string
  submitLabel: string
  onClose: () => void
  onSubmit: (name: string, description: string) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  return (
    <ModalShell onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSubmit(name.trim(), description.trim()) }}>
        <p className="eyebrow">{eyebrow}</p><h2>{title}</h2>
        <label>Название<input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Teens Pro" required /></label>
        <label>Описание или стиль<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Коротко о направлении, уровне или возрасте" /></label>
        <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Отмена</button><button className="button dark" disabled={!name.trim()}>{submitLabel} <ArrowRight size={18} /></button></div>
      </form>
    </ModalShell>
  )
}

function StudioSettingsModal({ studio, onClose, onSave }: { studio: Studio; onClose: () => void; onSave: (studio: Studio) => void }) {
  const [draft, setDraft] = useState(studio)
  const logoRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const update = (key: keyof Studio, value: string) => setDraft((current) => ({ ...current, [key]: value }))
  return (
    <ModalShell onClose={onClose} className="settings-modal wide-modal">
      <form onSubmit={(e) => { e.preventDefault(); if (draft.name.trim()) onSave(draft) }}>
        <p className="eyebrow">Социальная страница</p><h2>РЕДАКТОР<br />СТУДИИ</h2>
        <div className="image-edit-grid">
          <button type="button" className="cover-editor" onClick={() => coverRef.current?.click()} style={draft.cover ? { backgroundImage: `linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2)),url(${draft.cover})` } : undefined}><Image size={24} /><span>{draft.cover ? 'Сменить обложку' : 'Загрузить обложку'}</span></button>
          <button type="button" className="logo-editor" onClick={() => logoRef.current?.click()} style={draft.logo ? { backgroundImage: `url(${draft.logo})`, backgroundColor: draft.accent } : { backgroundColor: draft.accent }}>{draft.logo ? '' : 'D/LAB'}<i><Upload size={14} /></i></button>
        </div>
        <input ref={coverRef} hidden type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) fileToDataUrl(file, (url) => update('cover', url)) }} />
        <input ref={logoRef} hidden type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) fileToDataUrl(file, (url) => update('logo', url)) }} />
        <div className="field-row"><label>Название<input value={draft.name} onChange={(e) => update('name', e.target.value.toUpperCase())} required /></label><label>Ник страницы<input value={draft.handle} onChange={(e) => update('handle', e.target.value)} /></label></div>
        <label>Описание<textarea value={draft.description} onChange={(e) => update('description', e.target.value)} /></label>
        <div className="field-row"><label>Город<input value={draft.city} onChange={(e) => update('city', e.target.value)} /></label><label>Адрес<input value={draft.address} onChange={(e) => update('address', e.target.value)} /></label></div>
        <label>Направления<input value={draft.directions} onChange={(e) => update('directions', e.target.value)} /></label>
        <label>Сайт или социальная сеть<input type="url" value={draft.contact} onChange={(e) => update('contact', e.target.value)} placeholder="https://..." /></label>
        <label>Акцент страницы<div className="color-row">{['#d9ff43', '#ff6947', '#8ba6ff', '#f1b8ff', '#ffffff'].map((color) => <button type="button" key={color} aria-label={`Цвет ${color}`} className={draft.accent === color ? 'active' : ''} style={{ background: color }} onClick={() => update('accent', color)} />)}</div></label>
        <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Отмена</button><button className="button dark"><Check size={18} /> Сохранить страницу</button></div>
      </form>
    </ModalShell>
  )
}

function ProfileModal({ profile, onClose, onSave }: { profile: StudentProfile; onClose: () => void; onSave: (profile: StudentProfile) => void }) {
  const [draft, setDraft] = useState(profile)
  const avatarRef = useRef<HTMLInputElement>(null)
  const update = (key: keyof StudentProfile, value: string) => setDraft((current) => ({ ...current, [key]: value }))
  const initials = `${draft.firstName[0] || ''}${draft.lastName[0] || ''}`
  return (
    <ModalShell onClose={onClose} className="profile-modal">
      <form onSubmit={(e) => { e.preventDefault(); onSave(draft) }}>
        <p className="eyebrow">Личная страница</p><h2>МОЙ<br />ПРОФИЛЬ</h2>
        <button type="button" className="avatar-editor" onClick={() => avatarRef.current?.click()} style={draft.avatar ? { backgroundImage: `url(${draft.avatar})` } : undefined}>{draft.avatar ? '' : initials}<i><Camera size={17} /></i></button>
        <input ref={avatarRef} hidden type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) fileToDataUrl(file, (url) => update('avatar', url)) }} />
        <div className="field-row"><label>Имя<input value={draft.firstName} onChange={(e) => update('firstName', e.target.value)} required /></label><label>Фамилия<input value={draft.lastName} onChange={(e) => update('lastName', e.target.value)} required /></label></div>
        <div className="field-row"><label>Никнейм<input value={draft.nickname} onChange={(e) => update('nickname', e.target.value)} /></label><label>Возраст<input type="number" min="4" max="99" value={draft.age} onChange={(e) => update('age', e.target.value)} /></label></div>
        <label>Город<input value={draft.city} onChange={(e) => update('city', e.target.value)} /></label>
        <label>О себе<textarea value={draft.bio} onChange={(e) => update('bio', e.target.value)} /></label>
        <label>Танцевальные стили<input value={draft.styles} onChange={(e) => update('styles', e.target.value)} /></label>
        <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Отмена</button><button className="button dark"><Check size={18} /> Сохранить</button></div>
      </form>
    </ModalShell>
  )
}

function NotificationsModal({ onClose, onAction }: { onClose: () => void; onAction: (message: string) => void }) {
  const [read, setRead] = useState<string[]>([])
  const items = [
    ['lesson', 'Новый урок в TEENS', 'Аня Ли опубликовала «Громче тела»', '12 мин'],
    ['score', 'Мира получила 5 звезд', 'Новый лучший результат — 94%', '1 ч'],
    ['group', 'В группу вступил ученик', 'Соня Рэй присоединилась по QR', '3 ч'],
  ]
  return (
    <ModalShell onClose={onClose} className="side-modal">
      <p className="eyebrow">Центр событий</p><h2>УВЕДОМЛЕНИЯ</h2>
      <div className="notification-list">
        {items.map(([id, title, text, time]) => (
          <button key={id} className={read.includes(id) ? 'read' : ''} onClick={() => { setRead((current) => [...current, id]); onAction(title) }}>
            <i /><div><b>{title}</b><span>{text}</span></div><small>{time}</small>
          </button>
        ))}
      </div>
      <button className="text-button notification-read-all" onClick={() => setRead(items.map((item) => item[0]))}><Check size={16} /> Отметить все прочитанными</button>
    </ModalShell>
  )
}

function StudentDetailModal({ student, onClose, onAction }: { student: StudentRow; onClose: () => void; onAction: (message: string) => void }) {
  return (
    <ModalShell onClose={onClose} className="student-detail-modal">
      <div className="detail-avatar">{student.avatar}</div><p className="eyebrow">Профиль ученика</p><h2>{student.name.toUpperCase()}</h2><p className="detail-tag">{student.tag} · серия {student.streak} дней</p>
      <div className="detail-score-grid"><div><span>Статус</span><b>{student.status}</b></div><div><span>Лучший результат</span><b>{student.score ? `${student.score}%` : '—'}</b></div><div><span>Звезды</span><b>{student.stars || '—'}</b></div></div>
      <div className="detail-activity"><p>Последняя активность</p><b>{student.status === 'Не начал' ? 'Урок пока не открыт' : 'Громче тела · сегодня, 18:42'}</b></div>
      <div className="modal-actions"><button className="button secondary" onClick={() => onAction(`Сообщение для ${student.name} подготовлено`)}><MessageCircle size={17} /> Написать</button><button className="button dark" onClick={() => onAction(`Прогресс ${student.name} открыт`)}>Весь прогресс <ArrowRight size={17} /></button></div>
    </ModalShell>
  )
}

function ShareModal({ role, onClose, onAction }: { role: Role; onClose: () => void; onAction: (message: string) => void }) {
  const link = role === 'teacher' ? 'tancuy.app/studio/dancelab' : 'tancuy.app/@miralis'
  const copy = async () => {
    try { await navigator.clipboard.writeText(`https://${link}`) } catch { /* local fallback */ }
    onAction('Ссылка скопирована')
    onClose()
  }
  return (
    <ModalShell onClose={onClose} className="share-modal">
      <p className="eyebrow">Социальная ссылка</p><h2>ПОДЕЛИТЬСЯ</h2>
      <div className="share-preview"><QrCode size={110} strokeWidth={1} /><div><span>{role === 'teacher' ? 'Страница студии' : 'Профиль ученика'}</span><b>{link}</b></div></div>
      <div className="share-buttons"><button onClick={copy}><Copy /> Копировать ссылку</button><button onClick={() => { onAction('Системное меню отправки открыто'); onClose() }}><Share2 /> Отправить</button><button onClick={() => { onAction('Публичная страница открыта'); onClose() }}><ExternalLink /> Открыть страницу</button></div>
    </ModalShell>
  )
}

function ActionModal({ title, actions, onClose }: { title: string; actions: [string, () => void][]; onClose: () => void }) {
  return (
    <ModalShell onClose={onClose} className="action-modal">
      <p className="eyebrow">Действия</p><h2>{title}</h2>
      <div className="action-list">{actions.map(([label, action]) => <button key={label} onClick={() => { action(); onClose() }}>{label}<ArrowRight size={18} /></button>)}</div>
    </ModalShell>
  )
}

export default App
