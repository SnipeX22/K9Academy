function fmt(text) {
  return text.split(/\*\*(.*?)\*\*/g).map((p, i) =>
    i % 2 === 1 ? <strong key={i}>{p}</strong> : p
  );
}

function ClItem({ item, checked, onToggle }) {
  return (
    <div className="cl-item" onClick={onToggle}>
      <div className={`cl-box ${checked ? "on" : ""}`}>
        {checked && <span style={{color:"var(--black)",fontSize:11,fontWeight:700}}>✓</span>}
      </div>
      <span className={`cl-lbl ${checked ? "done" : ""}`}>{item}</span>
    </div>
  );
}

export default function LessonViewer({ course, lessonIdx, onSelectLesson, onBack, checks, onCheck }) {
  const lesson = course.lessons[lessonIdx];
  const lessonChecks = (checks[course.id] || {})[lessonIdx] || {};

  return (
    <div className="viewer">
      <div className="vsidebar">
        <div className="vsidebar-title">{course.title}</div>
        {course.lessons.map((l, i) => (
          <button key={i} className={`lbtn ${i === lessonIdx ? "active" : ""}`} onClick={() => onSelectLesson(i)}>
            <span className="lbtn-title">{l.title}</span>
          </button>
        ))}
        {course.printables?.length > 0 && (
          <>
            <span className="prlabel">Printables</span>
            {course.printables.map((p, i) => (
              <button key={i} className="prbtn"
                onClick={() => p.url ? window.open(p.url) : alert(`Add a URL for "${p.name}" in src/data/courses.js`)}>
                ↓ {p.name}
              </button>
            ))}
          </>
        )}
      </div>

      <div className="vcontent">
        <button className="vback" onClick={onBack}>← Back to Dashboard</button>
        <span className="ltag">{course.tag} · Lesson {lessonIdx + 1} of {course.lessons.length}</span>
        <h1 className="ltitle">{lesson.title}</h1>
        <div className="lbody">{fmt(lesson.content)}</div>

        <div className="checklist">
          <div className="cl-hdr">Action Checklist — check off as you go</div>
          {lesson.checklist.map((item, i) => (
            <ClItem key={i} item={item} checked={!!lessonChecks[i]} onToggle={() => onCheck(course.id, lessonIdx, i)} />
          ))}
        </div>

        <div className="vnav">
          <button className="btn btn-ghost btn-sm" disabled={lessonIdx === 0} onClick={() => onSelectLesson(lessonIdx - 1)} style={lessonIdx === 0 ? {opacity:.3} : {}}>← Previous</button>
          <button className="btn btn-outline btn-sm" disabled={lessonIdx === course.lessons.length - 1} onClick={() => onSelectLesson(lessonIdx + 1)} style={lessonIdx === course.lessons.length - 1 ? {opacity:.3} : {}}>Next Lesson →</button>
        </div>
      </div>
    </div>
  );
}
