import { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Input({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  )
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  )
}

function Pill({ children, active, onClick }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-full text-sm font-medium border ${active ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
      {children}
    </button>
  )
}

export default function App() {
  const [admin, setAdmin] = useState(false)
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <div className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-indigo-500 to-violet-500" />
            <span className="font-semibold text-gray-800 text-lg">CourseHub</span>
          </div>
          <div className="flex items-center gap-2">
            <Pill active={!admin} onClick={() => setAdmin(false)}>Store</Pill>
            <Pill active={admin} onClick={() => setAdmin(true)}>Admin</Pill>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {admin ? <AdminPanel /> : <Storefront />}
      </main>

      <footer className="border-t mt-10 py-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} CourseHub</footer>
    </div>
  )
}

function Storefront() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const fetchCourses = async () => {
    setLoading(true)
    const res = await fetch(`${API}/api/courses?published=true`)
    const data = await res.json()
    setCourses(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Featured Courses</h2>
        <button onClick={fetchCourses} className="text-sm px-3 py-1.5 rounded border bg-white hover:bg-gray-50">Refresh</button>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading courses…</div>
      ) : courses.length === 0 ? (
        <div className="text-gray-500">No courses yet. Check back soon!</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} expanded={expanded===c.id} onToggle={() => setExpanded(expanded===c.id?null:c.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function CourseCard({ course, expanded, onToggle }) {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchLessons = async () => {
    setLoading(true)
    const res = await fetch(`${API}/api/courses/${course.id}/lessons`)
    const data = await res.json()
    setLessons(data)
    setLoading(false)
  }

  const buy = async () => {
    const buyer_name = prompt('Your name')
    if (!buyer_name) return
    const buyer_email = prompt('Your email')
    if (!buyer_email) return
    const res = await fetch(`${API}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: course.id, buyer_name, buyer_email })
    })
    const data = await res.json()
    alert(`Purchase ${data.status}. Order ID: ${data.id}`)
  }

  useEffect(() => {
    if (expanded) fetchLessons()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded])

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 flex-1">
        <div className="aspect-video w-full rounded bg-gradient-to-br from-slate-100 to-slate-200 mb-3 overflow-hidden">
          {course.thumbnail_url && <img src={course.thumbnail_url} alt="thumb" className="w-full h-full object-cover" />}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
        {course.subtitle && <p className="text-gray-600 text-sm mt-1 line-clamp-2">{course.subtitle}</p>}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-indigo-600 font-bold">${course.price}</span>
          <div className="flex gap-2">
            <button onClick={onToggle} className="text-sm px-3 py-1.5 rounded border bg-white hover:bg-gray-50">{expanded?'Hide':'Details'}</button>
            <button onClick={buy} className="text-sm px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700">Buy</button>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="border-t p-4 bg-slate-50 text-sm">
          <p className="text-gray-700 mb-2">{course.description || 'No description.'}</p>
          <div>
            <div className="font-medium text-gray-900 mb-1">Lessons</div>
            {loading ? (
              <div className="text-gray-500">Loading lessons…</div>
            ) : lessons.length === 0 ? (
              <div className="text-gray-500">No lessons yet.</div>
            ) : (
              <ol className="list-decimal pl-5 space-y-1">
                {lessons.map(ls => (
                  <li key={ls.id} className="text-gray-700">{ls.title} {ls.free_preview && <span className="text-xs text-green-600">(preview)</span>}</li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AdminPanel() {
  const [summary, setSummary] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const [s, c] = await Promise.all([
      fetch(`${API}/api/admin/summary`).then(r=>r.json()),
      fetch(`${API}/api/courses`).then(r=>r.json()),
    ])
    setSummary(s)
    setCourses(c)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
        {summary ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Courses" value={summary.total_courses} />
            <StatCard label="Published" value={summary.published_courses} />
            <StatCard label="Lessons" value={summary.total_lessons} />
            <StatCard label="Sales" value={summary.total_sales} />
            <StatCard label="Revenue" value={`$${summary.revenue.toFixed ? summary.revenue.toFixed(2) : summary.revenue}`}/>
          </div>
        ) : (
          <div className="text-gray-500">Loading…</div>
        )}
      </section>

      <CreateCourse onCreated={fetchData} />

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900">Manage Courses</h3>
          <button onClick={fetchData} className="text-sm px-3 py-1.5 rounded border bg-white hover:bg-gray-50">Refresh</button>
        </div>
        {loading ? (
          <div className="text-gray-500">Loading…</div>
        ) : courses.length === 0 ? (
          <div className="text-gray-500">No courses yet.</div>
        ) : (
          <div className="space-y-4">
            {courses.map(c => (
              <AdminCourseRow key={c.id} course={c} onChange={fetchData} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  )
}

function CreateCourse({ onCreated }) {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!title || !price) return alert('Title and price are required')
    const res = await fetch(`${API}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, subtitle, price: parseFloat(price), description, thumbnail_url: thumbnail, published: false })
    })
    await res.json()
    setTitle(''); setSubtitle(''); setPrice(''); setDescription(''); setThumbnail('');
    onCreated && onCreated()
  }

  return (
    <section className="bg-white border rounded-lg p-4">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Course</h3>
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
        <Input label="Title" value={title} onChange={setTitle} placeholder="e.g., React for Beginners" />
        <Input label="Subtitle" value={subtitle} onChange={setSubtitle} placeholder="Short tagline" />
        <Input label="Price (USD)" value={price} onChange={setPrice} type="number" placeholder="49" />
        <Input label="Thumbnail URL" value={thumbnail} onChange={setThumbnail} placeholder="https://..." />
        <div className="md:col-span-2">
          <Textarea label="Description" value={description} onChange={setDescription} placeholder="What students will learn…" />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Create</button>
        </div>
      </form>
    </section>
  )
}

function AdminCourseRow({ course, onChange }) {
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showAddLesson, setShowAddLesson] = useState(false)

  const togglePublish = async () => {
    setPublishing(true)
    await fetch(`${API}/api/courses/${course.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...course, published: !course.published })
    })
    setPublishing(false)
    onChange && onChange()
  }

  const remove = async () => {
    if (!confirm('Delete this course?')) return
    setDeleting(true)
    await fetch(`${API}/api/courses/${course.id}`, { method: 'DELETE' })
    setDeleting(false)
    onChange && onChange()
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold text-gray-900">{course.title}</div>
          <div className="text-sm text-gray-600">${course.price} • {course.published ? 'Published' : 'Draft'}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddLesson(s=>!s)} className="text-sm px-3 py-1.5 rounded border bg-white hover:bg-gray-50">Add Lesson</button>
          <button disabled={publishing} onClick={togglePublish} className={`text-sm px-3 py-1.5 rounded ${course.published ? 'bg-gray-900 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{publishing?'…':course.published?'Unpublish':'Publish'}</button>
          <button disabled={deleting} onClick={remove} className="text-sm px-3 py-1.5 rounded border bg-white hover:bg-gray-50">{deleting?'Deleting…':'Delete'}</button>
        </div>
      </div>
      {showAddLesson && <AddLesson courseId={course.id} onDone={() => { setShowAddLesson(false); onChange&&onChange() }} />}
    </div>
  )
}

function AddLesson({ courseId, onDone }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [video, setVideo] = useState('')
  const [order, setOrder] = useState('0')
  const [preview, setPreview] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    await fetch(`${API}/api/courses/${courseId}/lessons`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId, title, content, video_url: video, order: parseInt(order||'0',10), free_preview: preview })
    })
    onDone && onDone()
  }

  return (
    <form onSubmit={submit} className="mt-4 grid md:grid-cols-2 gap-4 border-t pt-4">
      <Input label="Lesson title" value={title} onChange={setTitle} placeholder="e.g., Introduction" />
      <Input label="Video URL (optional)" value={video} onChange={setVideo} placeholder="https://..." />
      <Input label="Order" type="number" value={order} onChange={setOrder} />
      <label className="flex items-center gap-2 text-sm text-gray-700 mt-6">
        <input type="checkbox" checked={preview} onChange={(e)=>setPreview(e.target.checked)} /> Free preview
      </label>
      <div className="md:col-span-2">
        <Textarea label="Content" value={content} onChange={setContent} placeholder="Lesson text or notes…" />
      </div>
      <div className="md:col-span-2 flex justify-end">
        <button type="submit" className="px-4 py-2 rounded bg-gray-900 text-white">Add Lesson</button>
      </div>
    </form>
  )
}
