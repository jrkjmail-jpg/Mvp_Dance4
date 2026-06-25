import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  CirclePlay,
  Clock3,
  Ellipsis,
  Flame,
  Gauge,
  Link2,
  ListFilter,
  Menu,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings,
  Sparkles,
  Star,
  Upload,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { ChangeEvent, useEffect, useRef, useState } from 'react'

type Role = 'teacher' | 'student'
type Screen = 'workspace' | 'lesson' | 'practice' | 'result'
type Modal = 'group' | 'lesson' | 'settings' | null

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

const defaultGroups: Group[] = [
  {
    id: 'g1',
    name: 'PRO / 16+',
    description: 'Сценическая группа',
    meta: 'Продвинутый',
    accent: '#ff6947',
    lessons: 12,
    students: 18,
  },
  {
    id: 'g2',
    name: 'TEENS',
    description: 'Основной состав',
    meta: '12–15 лет',
    accent: '#d9ff43',
    lessons: 8,
    students: 24,
  },
  {
    id: 'g3',
    name: 'START',
    description: 'Первые шаги',
    meta: 'Начальный',
    accent: '#8ba6ff',
    lessons: 5,
    students: 16,
  },
]

const lessons: Lesson[] = [
  { id: 'l1', number: '01', title: 'ГРОМЧЕ ТЕЛА', style: 'Hip-hop', duration: '18 мин', progress: 72, status: 'active' },
  { id: 'l2', number: '02', title: 'ТОЧКА ОПОРЫ', style: 'Choreo', duration: '24 мин', progress: 0, status: 'new' },
  { id: 'l3', number: '03', title: 'НЕ ДУМАЙ — ДВИГАЙ', style: 'Freestyle', duration: '14 мин', progress: 100, status: 'done' },
]

const studentRows = [
  { name: 'Мира Лис', tag: '@miralis', status: 'Сдала', score: 94, stars: 5, avatar: 'МЛ' },
  { name: 'Саша Ким', tag: '@kimoves', status: 'Учит', score: 76, stars: 3, avatar: 'СК' },
  { name: 'Лиза Ной', tag: '@noiz', status: 'Посмотрела', score: 0, stars: 0, avatar: 'ЛН' },
  { name: 'Платон Рэй', tag: '@pray', status: 'Не начал', score: 0, stars: 0, avatar: 'ПР' },
]

function App() {
  const [role, setRole] = useState<Role>('teacher')
  const [screen, setScreen] = useState<Screen>('workspace')
  const [modal, setModal] = useState<Modal>(null)
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('danceOversizedGroups')
    return saved ? JSON.parse(saved) : defaultGroups
  })
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem('danceOversizedGroups', JSON.stringify(groups))
  }, [groups])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const switchRole = (nextRole: Role) => {
    setRole(nextRole)
    setScreen('workspace')
    setActiveGroup(null)
  }

  const openLesson = () => setScreen(role === 'teacher' ? 'lesson' : 'practice')

  const addGroup = (name: string, description: string) => {
    setGroups((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: name.toUpperCase(),
        description: description || 'Новая танцевальная группа',
        meta: 'Новый набор',
        accent: '#f1b8ff',
        lessons: 0,
        students: 0,
      },
    ])
    setModal(null)
    setToast('Группа создана')
  }

  return (
    <div className="app-shell">
      <TopBar role={role} onRoleChange={switchRole} />
      {role === 'teacher' ? (
        <>
          <StudioHero onSettings={() => setModal('settings')} />
          {screen === 'workspace' && (
            <TeacherWorkspace
              groups={groups}
              activeGroup={activeGroup}
              onGroupChange={setActiveGroup}
              onAddGroup={() => setModal('group')}
              onAddLesson={() => setModal('lesson')}
              onOpenLesson={openLesson}
            />
          )}
          {screen === 'lesson' && (
            <TeacherLesson
              group={activeGroup}
              onBack={() => setScreen('workspace')}
              onPublish={() => setToast('Урок опубликован для группы')}
            />
          )}
        </>
      ) : (
        <>
          {screen === 'workspace' && <StudentDashboard onOpenLesson={openLesson} />}
          {screen === 'practice' && (
            <PracticeScreen
              onBack={() => setScreen('workspace')}
              onComplete={() => setScreen('result')}
            />
          )}
          {screen === 'result' && (
            <ResultScreen
              onRetry={() => setScreen('practice')}
              onFinish={() => setScreen('workspace')}
            />
          )}
        </>
      )}

      {modal === 'group' && (
        <CreateModal
          eyebrow="Новое пространство"
          title="СОЗДАТЬ ГРУППУ"
          submitLabel="Создать"
          onClose={() => setModal(null)}
          onSubmit={addGroup}
        />
      )}
      {modal === 'lesson' && (
        <CreateModal
          eyebrow="Новый материал"
          title="СОЗДАТЬ УРОК"
          submitLabel="Продолжить"
          onClose={() => setModal(null)}
          onSubmit={(name) => {
            setModal(null)
            setToast(`Черновик «${name}» создан`)
            setScreen('lesson')
          }}
        />
      )}
      {modal === 'settings' && <SettingsModal onClose={() => setModal(null)} />}
      {toast && (
        <div className="toast">
          <Check size={18} /> {toast}
        </div>
      )}
    </div>
  )
}

function TopBar({ role, onRoleChange }: { role: Role; onRoleChange: (role: Role) => void }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => onRoleChange(role)} aria-label="На главную">
        ТАНЦУЙ<span>●</span>
      </button>
      <nav className="role-switch" aria-label="Режим приложения">
        <button className={role === 'teacher' ? 'active' : ''} onClick={() => onRoleChange('teacher')}>
          Педагог
        </button>
        <button className={role === 'student' ? 'active' : ''} onClick={() => onRoleChange('student')}>
          Ученик
        </button>
      </nav>
      <div className="top-actions">
        <button className="icon-button" aria-label="Уведомления"><Sparkles size={20} /></button>
        <button className="profile-chip"><span>АЛ</span><b>Аня Ли</b></button>
        <button className="icon-button mobile-menu" aria-label="Меню"><Menu size={22} /></button>
      </div>
    </header>
  )
}

function StudioHero({ onSettings }: { onSettings: () => void }) {
  return (
    <section className="studio-hero">
      <div className="hero-figure" aria-hidden="true">
        <div className="figure-head" />
        <div className="figure-body" />
        <div className="figure-arm arm-left" />
        <div className="figure-arm arm-right" />
        <div className="figure-leg leg-left" />
        <div className="figure-leg leg-right" />
      </div>
      <div className="hero-noise" />
      <div className="studio-meta">
        <div className="studio-logo">D/<br />LAB</div>
        <div>
          <p className="eyebrow light">МОСКВА · ТАНЦЕВАЛЬНАЯ СТУДИЯ</p>
          <h1>ДВИЖЕНИЕ<br />ГОВОРИТ</h1>
        </div>
      </div>
      <div className="hero-bottom">
        <p>Учимся слышать музыку телом.<br />Hip-hop · Choreo · Freestyle</p>
        <div className="hero-links">
          <span><Users size={17} /> 58 учеников</span>
          <a href="https://example.com" target="_blank" rel="noreferrer"><Link2 size={17} /> dancelab.ru</a>
          <button onClick={onSettings}><Settings size={17} /> Настройки</button>
        </div>
      </div>
    </section>
  )
}

function TeacherWorkspace({
  groups,
  activeGroup,
  onGroupChange,
  onAddGroup,
  onAddLesson,
  onOpenLesson,
}: {
  groups: Group[]
  activeGroup: Group | null
  onGroupChange: (group: Group | null) => void
  onAddGroup: () => void
  onAddLesson: () => void
  onOpenLesson: () => void
}) {
  return (
    <main className="workspace">
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
              <div className="group-card-top">
                <span className="card-index">0{index + 1}</span>
                <span className="round-arrow"><ArrowRight size={21} /></span>
              </div>
              <div className="group-orbit" style={{ background: group.accent }}>
                <span>{group.name.slice(0, 2)}</span>
              </div>
              <p className="card-type">ГРУППА · {group.meta}</p>
              <h3>{group.name}</h3>
              <p className="card-description">{group.description}</p>
              <div className="card-stats">
                <span>{group.students} учеников</span>
                <span>{group.lessons} уроков</span>
              </div>
            </button>
          ))}
          <button className="group-card add-card" onClick={onAddGroup}>
            <Plus size={50} strokeWidth={1.3} />
            <span>ДОБАВИТЬ<br />ГРУППУ</span>
          </button>
        </div>
      ) : (
        <GroupDetail group={activeGroup} onOpenLesson={onOpenLesson} onAddLesson={onAddLesson} />
      )}
    </main>
  )
}

function GroupDetail({ group, onOpenLesson, onAddLesson }: { group: Group; onOpenLesson: () => void; onAddLesson: () => void }) {
  return (
    <div className="group-detail">
      <div className="group-summary">
        <div className="summary-number">{group.students}</div>
        <p>учеников<br />в группе</p>
        <div className="summary-divider" />
        <div className="summary-kpi"><b>78%</b><span>средний результат</span></div>
        <div className="summary-kpi"><b>12</b><span>активны сегодня</span></div>
      </div>
      <div className="subheading">
        <h3>УРОКИ</h3>
        <button className="text-button" onClick={onAddLesson}>Все материалы <ArrowRight size={18} /></button>
      </div>
      <div className="lesson-list">
        {lessons.map((lesson) => (
          <button className="lesson-row" key={lesson.id} onClick={onOpenLesson}>
            <span className="lesson-number">{lesson.number}</span>
            <div className="lesson-art"><span>{lesson.style}</span><div className="mini-figure" /></div>
            <div className="lesson-copy"><p>{lesson.style} · {lesson.duration}</p><h4>{lesson.title}</h4></div>
            <div className="progress-wrap">
              <span>{lesson.status === 'done' ? 'Пройден' : lesson.status === 'new' ? 'Черновик' : `${lesson.progress}% группы`}</span>
              <div className="progress"><i style={{ width: `${lesson.progress}%` }} /></div>
            </div>
            <ChevronRight size={28} />
          </button>
        ))}
      </div>
    </div>
  )
}

function TeacherLesson({ group, onBack, onPublish }: { group: Group | null; onBack: () => void; onPublish: () => void }) {
  const [tab, setTab] = useState<'prepare' | 'students'>('prepare')
  const [step, setStep] = useState(0)
  const [learningVideo, setLearningVideo] = useState<string | null>(null)
  const [examVideo, setExamVideo] = useState<string | null>(null)
  const [building, setBuilding] = useState(false)
  const [referenceReady, setReferenceReady] = useState(false)
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
    }, 1500)
  }

  return (
    <main className="lesson-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={18} /> {group?.name || 'К группе'}</button>
      <div className="lesson-title-row">
        <div><p className="eyebrow">Урок 01 · Hip-hop</p><h2>ГРОМЧЕ<br />ТЕЛА</h2></div>
        <div className="lesson-actions">
          <button className="button secondary"><Ellipsis size={20} /></button>
          <button className="button acid" onClick={onPublish} disabled={!referenceReady}><Zap size={18} /> Опубликовать</button>
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
              <button key={label} className={index === step ? 'active' : index < step ? 'done' : ''} onClick={() => setStep(index)}>
                <span>{index < step ? <Check size={15} /> : index + 1}</span>{label}
              </button>
            ))}
          </div>
          <section className="video-grid">
            <VideoUploader
              index="01"
              label="Обучение"
              title="ОБЪЯСНЕНИЕ"
              description="Разбор движений, счет и детали. Это видео не анализируется."
              video={learningVideo}
              onChange={(event) => chooseVideo(event, 'learning')}
            />
            <VideoUploader
              index="02"
              label="Эталон"
              title="ТАНЕЦ + МУЗЫКА"
              description="Готовый танец. Только из этого видео строится эталонный скелет."
              video={examVideo}
              onChange={(event) => chooseVideo(event, 'exam')}
              accent
            />
          </section>
          <section className="reference-panel">
            <div>
              <p className="eyebrow">Pose engine · 30 FPS</p>
              <h3>{referenceReady ? 'ЭТАЛОН ГОТОВ' : 'СОБРАТЬ СКЕЛЕТ'}</h3>
              <p>{referenceReady ? '284 кадра сохранены. Синхронизация и нормализация тела выполнены.' : 'Отметьте полезный фрагмент и создайте цифровой эталон движения.'}</p>
            </div>
            <button className="button dark" onClick={buildReference} disabled={!examVideo || building || referenceReady}>
              {building ? <><span className="spinner" /> Анализируем…</> : referenceReady ? <><Check size={19} /> Готово</> : <><Sparkles size={19} /> Построить эталон</>}
            </button>
          </section>
        </>
      ) : (
        <StudentTable />
      )}
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
      <div className="uploader-heading">
        <span>{index}</span><div><p>{label}</p><h3>{title}</h3></div>
      </div>
      <p className="uploader-description">{description}</p>
      <div className="video-stage">
        {video ? (
          <video src={video} controls playsInline muted preload="metadata" />
        ) : (
          <button onClick={() => inputRef.current?.click()}>
            <Upload size={28} /><span>Загрузить видео</span><small>MP4, MOV · до 500 МБ</small>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="video/*" hidden onChange={onChange} />
      {video && (
        <div className="trim-panel">
          <div><span>Начало</span><b>{start.toFixed(1)} сек</b></div>
          <input type="range" min="0" max="90" value={start} onChange={(e) => setStart(Number(e.target.value))} />
          <input type="range" min="10" max="100" value={end} onChange={(e) => setEnd(Number(e.target.value))} />
          <div><span>Конец</span><b>{end.toFixed(1)} сек</b></div>
        </div>
      )}
    </article>
  )
}

function StudentTable() {
  return (
    <section className="students-section">
      <div className="table-tools">
        <div><p className="eyebrow">Прогресс группы</p><h3>24 УЧЕНИКА</h3></div>
        <button className="button secondary"><ListFilter size={17} /> Фильтр</button>
      </div>
      <div className="student-table">
        {studentRows.map((student) => (
          <div className="student-row" key={student.tag}>
            <span className="student-avatar">{student.avatar}</span>
            <div className="student-name"><b>{student.name}</b><span>{student.tag}</span></div>
            <span className={`status status-${student.status.replace(' ', '-').toLowerCase()}`}>{student.status}</span>
            <b className="student-score">{student.score ? `${student.score}%` : '—'}</b>
            <span className="stars">{student.stars ? `${student.stars} ★` : '—'}</span>
            <button className="icon-button"><ChevronRight size={20} /></button>
          </div>
        ))}
      </div>
    </section>
  )
}

function StudentDashboard({ onOpenLesson }: { onOpenLesson: () => void }) {
  return (
    <main className="student-dashboard">
      <section className="student-intro">
        <div className="student-intro-copy">
          <p className="eyebrow">Пятница, 26 июня</p>
          <h1>МИРА,<br />ТЕЛО ПОМНИТ.</h1>
          <p className="lead">Сегодня — еще один шанс двигаться свободнее, точнее и смелее.</p>
        </div>
        <div className="level-sticker">
          <span>УРОВЕНЬ</span><b>08</b><small>72 / 90 звезд</small>
          <div className="level-progress"><i /></div>
        </div>
      </section>

      <section className="featured-lesson">
        <div className="featured-copy">
          <p className="eyebrow light">Твоя группа · Новый урок</p>
          <h2>ГРОМЧЕ<br />ТЕЛА</h2>
          <p>Связка на акценты, контраст амплитуды и уверенная подача.</p>
          <button className="button acid" onClick={onOpenLesson}><Play size={18} fill="currentColor" /> Начать урок</button>
        </div>
        <div className="featured-visual">
          <div className="pose-lines"><i /><i /><i /><i /><i /></div>
          <span className="vertical-type">HIP—HOP / 01</span>
          <button className="giant-play" onClick={onOpenLesson}><Play fill="currentColor" /></button>
        </div>
      </section>

      <section className="student-stats">
        <div><span><Flame /></span><b>7</b><p>дней подряд</p></div>
        <div><span><Star /></span><b>84</b><p>звезды</p></div>
        <div><span><Gauge /></span><b>89%</b><p>лучший результат</p></div>
        <div><span><Clock3 /></span><b>4.2</b><p>часа практики</p></div>
      </section>

      <section className="continue-section">
        <div className="subheading"><h3>ПРОДОЛЖИТЬ</h3><button className="text-button">Все уроки <ArrowRight size={18} /></button></div>
        <div className="continue-grid">
          {lessons.slice(1).map((lesson) => (
            <button key={lesson.id} className="continue-card" onClick={onOpenLesson}>
              <div className="continue-art"><span>{lesson.number}</span><CirclePlay /></div>
              <p>{lesson.style} · {lesson.duration}</p>
              <h4>{lesson.title}</h4>
              <div className="progress"><i style={{ width: `${lesson.progress}%` }} /></div>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

function PracticeScreen({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
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
        window.setTimeout(onComplete, 2600)
      } else setCountdown(value)
    }, 700)
  }

  return (
    <main className="practice-page">
      <div className="practice-top">
        <button className="back-link light" onClick={onBack}><ArrowLeft size={18} /> К урокам</button>
        <div className="practice-tabs">
          <button className={mode === 'learn' ? 'active' : ''} onClick={() => setMode('learn')}>Учить</button>
          <button className={mode === 'exam' ? 'active' : ''} onClick={() => setMode('exam')}>Сдать</button>
        </div>
        <button className="icon-button inverted"><Ellipsis /></button>
      </div>
      <div className="practice-stage">
        <div className="practice-title"><span>01 / HIP-HOP</span><h1>ГРОМЧЕ<br />ТЕЛА</h1></div>
        <div className="practice-person">
          <div className="practice-head" /><div className="practice-torso" />
          <div className="practice-limb pa1" /><div className="practice-limb pa2" />
          <div className="practice-limb pl1" /><div className="practice-limb pl2" />
        </div>
        {mode === 'exam' && <div className="camera-preview"><Camera size={20} /><span>Камера ученика</span><div className="camera-person" /></div>}
        {countdown !== null && <div className="countdown">{countdown}</div>}
        <div className="practice-controls">
          {mode === 'learn' ? (
            <>
              <button onClick={() => setPlaying(!playing)}>{playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button>
              <div className="timeline"><i style={{ width: playing ? '64%' : '28%' }} /><span /></div>
              <span>00:18 / 00:42</span>
              <label>Скорость
                <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
                  <option value={0.4}>0.4×</option><option value={0.6}>0.6×</option><option value={0.8}>0.8×</option><option value={1}>1×</option>
                </select>
              </label>
            </>
          ) : (
            <button className="exam-button" onClick={startExam}><Camera size={21} /> Начать сдачу</button>
          )}
        </div>
      </div>
      <div className="practice-note">
        <p><b>{mode === 'learn' ? 'Смотри и повторяй.' : 'Встань так, чтобы тебя было видно полностью.'}</b><br />{mode === 'learn' ? 'Замедляй сложные моменты и возвращайся к ним столько, сколько нужно.' : 'После отсчета видео и запись начнутся одновременно.'}</p>
        <span>{mode === 'learn' ? 'УЧИСЬ В СВОЕМ РИТМЕ' : 'КАМЕРА · ГОТОВА'}</span>
      </div>
    </main>
  )
}

function ResultScreen({ onRetry, onFinish }: { onRetry: () => void; onFinish: () => void }) {
  const metrics = [
    ['Руки', 96], ['Ноги', 88], ['Корпус', 91], ['Ритм', 94],
    ['Амплитуда', 86], ['Энергия', 92], ['Траектория', 89], ['Покрытие', 98],
  ] as const
  return (
    <main className="result-page">
      <div className="result-kicker">ПОПАЛА В ДВИЖЕНИЕ</div>
      <section className="score-hero">
        <div className="score-copy"><p>Результат попытки</p><h1>94<span>%</span></h1><div className="big-stars">★★★★★</div></div>
        <div className="score-message"><span>ЛУЧШИЙ РЕЗУЛЬТАТ</span><h2>ТЕЛО<br />УСЛЫШАЛО.</h2><p>Сильная форма, точный ритм и уверенная энергия. Еще немного амплитуды в переходах — и будет совсем чисто.</p></div>
      </section>
      <section className="metrics-grid">
        {metrics.map(([label, value]) => (
          <div className="metric" key={label}><span>{label}</span><b>{value}</b><div><i style={{ width: `${value}%` }} /></div></div>
        ))}
      </section>
      <section className="result-actions">
        <div><p className="eyebrow">Награда</p><h3>+5 ЗВЕЗД</h3><p>До 9 уровня осталось 13 звезд.</p></div>
        <div>
          <button className="button secondary" onClick={onRetry}><RotateCcw size={18} /> Еще раз</button>
          <button className="button dark" onClick={onFinish}>Завершить <ArrowRight size={18} /></button>
        </div>
      </section>
    </main>
  )
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
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSubmit(name.trim(), description.trim()) }}>
        <button type="button" className="modal-close" onClick={onClose}><X /></button>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <label>Название<input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Teens Pro" required /></label>
        <label>Описание<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Коротко о направлении, уровне или возрасте" /></label>
        <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Отмена</button><button className="button dark" disabled={!name.trim()}>{submitLabel} <ArrowRight size={18} /></button></div>
      </form>
    </div>
  )
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [saved, setSaved] = useState(false)
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal settings-modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); setSaved(true); window.setTimeout(onClose, 700) }}>
        <button type="button" className="modal-close" onClick={onClose}><X /></button>
        <p className="eyebrow">Профиль пространства</p><h2>НАСТРОЙКИ<br />СТУДИИ</h2>
        <div className="settings-cover"><span>D/LAB</span><button type="button"><Upload size={17} /> Сменить обложку</button></div>
        <label>Название<input defaultValue="Движение говорит" /></label>
        <label>Описание<textarea defaultValue="Учимся слышать музыку телом." /></label>
        <div className="field-row"><label>Адрес<input defaultValue="Москва, Хлебозавод" /></label><label>Направления<input defaultValue="Hip-hop, Choreo" /></label></div>
        <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Отмена</button><button className="button dark">{saved ? <Check size={18} /> : null}{saved ? 'Сохранено' : 'Сохранить'}</button></div>
      </form>
    </div>
  )
}

export default App
