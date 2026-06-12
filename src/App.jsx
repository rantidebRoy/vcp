import React, { useMemo, useState, useEffect, useRef } from 'react';

/* ============================================================
   MOCK DATA
   ============================================================ */

const SKILLS = [
  { id: 'js',       name: 'JavaScript',        demandTrend: 'rising'    },
  { id: 'react',    name: 'React',             demandTrend: 'rising'    },
  { id: 'node',     name: 'Node.js',           demandTrend: 'stable'    },
  { id: 'py',       name: 'Python',            demandTrend: 'rising'    },
  { id: 'ml',       name: 'Machine Learning',  demandTrend: 'rising'    },
  { id: 'sql',      name: 'SQL',               demandTrend: 'stable'    },
  { id: 'cloud',    name: 'Cloud (AWS/GCP)',   demandTrend: 'rising'    },
  { id: 'docker',   name: 'Docker',            demandTrend: 'stable'    },
  { id: 'figma',    name: 'Figma / UI Design', demandTrend: 'rising'    },
  { id: 'ux',       name: 'UX Research',       demandTrend: 'stable'    },
  { id: 'data',     name: 'Data Analysis',     demandTrend: 'rising'    },
  { id: 'stats',    name: 'Statistics',        demandTrend: 'stable'    },
  { id: 'comm',     name: 'Communication',     demandTrend: 'stable'    },
  { id: 'legacy',   name: 'jQuery',            demandTrend: 'declining' },
  { id: 'flash',    name: 'Flash / Silverlight', demandTrend: 'declining' },
];

const STUDENTS = [
  {
    id: 's1',
    name: 'Aarav Sharma',
    skills: {
      js: 'have', react: 'in-progress', node: 'have', py: 'have',
      sql: 'have', cloud: 'in-progress', comm: 'have',
      legacy: 'have',
    },
  },
  {
    id: 's2',
    name: 'Priya Das',
    skills: {
      py: 'have', ml: 'in-progress', data: 'have', stats: 'have',
      sql: 'in-progress', comm: 'have', ux: 'have',
    },
  },
  {
    id: 's3',
    name: 'Rohan Mehta',
    skills: {
      figma: 'have', ux: 'in-progress', comm: 'have',
      js: 'in-progress', react: 'have',
    },
  },
];

const JOB_ROLES = [
  {
    id: 'fe', title: 'Frontend Developer',
    required: ['js', 'react', 'node', 'git', 'figma'],
  },
  {
    id: 'be', title: 'Backend Developer',
    required: ['node', 'sql', 'cloud', 'docker', 'py'],
  },
  {
    id: 'ds', title: 'Data Scientist',
    required: ['py', 'ml', 'stats', 'data', 'sql'],
  },
  {
    id: 'de', title: 'Data Engineer',
    required: ['py', 'sql', 'cloud', 'docker', 'data'],
  },
  {
    id: 'ml', title: 'ML Engineer',
    required: ['py', 'ml', 'cloud', 'docker', 'stats'],
  },
  {
    id: 'ux', title: 'UX Designer',
    required: ['figma', 'ux', 'comm', 'data'],
  },
  {
    id: 'pm', title: 'Product Manager',
    required: ['comm', 'data', 'ux', 'cloud'],
  },
];

const CURRICULA = [
  {
    id: 'c1', name: 'B.Sc. Computer Science',
    teaches: ['js', 'react', 'node', 'py', 'sql', 'comm', 'legacy'],
  },
  {
    id: 'c2', name: 'B.Tech Information Technology',
    teaches: ['js', 'node', 'sql', 'cloud', 'docker', 'comm'],
  },
  {
    id: 'c3', name: 'B.Des. Interaction Design',
    teaches: ['figma', 'ux', 'comm', 'js', 'react'],
  },
  {
    id: 'c4', name: 'M.Sc. Data Science',
    teaches: ['py', 'ml', 'stats', 'data', 'sql'],
  },
  {
    id: 'c5', name: 'Diploma in Web Development',
    teaches: ['js', 'react', 'figma', 'legacy', 'flash'],
  },
];

/* ============================================================
   HELPERS
   ============================================================ */

const skillById = (id) => SKILLS.find((s) => s.id === id);
const demandIcon = (trend) =>
  trend === 'rising' ? '↑' : trend === 'declining' ? '↓' : '→';
const demandColor = (trend) =>
  trend === 'rising'
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : trend === 'declining'
    ? 'text-rose-700 bg-rose-50 border-rose-200'
    : 'text-slate-700 bg-slate-50 border-slate-200';

const GAP_STYLES = {
  have:         'bg-emerald-100 text-emerald-800 border-emerald-300',
  'in-progress':'bg-amber-100 text-amber-800 border-amber-300',
  missing:      'bg-rose-100 text-rose-800 border-rose-300',
};

function statusFor(student, skillId) {
  if (!student) return 'missing';
  return student.skills[skillId] || 'missing';
}

/* ============================================================
   AI COACH (rule-based)
   ============================================================ */

function coachReply(student, role, text) {
  const q = text.toLowerCase().trim();
  if (!q) return null;

  // Tip on a specific skill
  const mentioned = SKILLS.find((s) => q.includes(s.name.toLowerCase()));
  if (mentioned) {
    const status = statusFor(student, mentioned.id);
    if (mentioned.demandTrend === 'declining') {
      return `${mentioned.name} is on a declining trend in current job postings across South Asia. I'd prioritise newer alternatives before investing more time here.`;
    }
    if (status === 'have') {
      return `You already list ${mentioned.name} as a skill. To stand out, build a small portfolio piece (e.g. a 2-week project) so it's demonstrable, not just claimed.`;
    }
    if (status === 'in-progress') {
      return `${mentioned.name} is in progress — good. Aim for one concrete artefact (a notebook, a deployed app, a case study) before switching tabs.`;
    }
    return `${mentioned.name} is a ${mentioned.demandTrend}-demand skill${role ? ` for ${role.title}` : ''}. Start with the official docs, then build a tiny project in 1-2 weeks.`;
  }

  // "what should I learn next"
  if (/what.*(next|learn|should|recommend)/.test(q)) {
    if (!role) {
      return 'Pick a target job role first (Student View → Job role), then I can give you a ranked shortlist of the top 3 missing skills.';
    }
    const gaps = role.required
      .filter((sid) => statusFor(student, sid) !== 'have')
      .map((sid) => skillById(sid))
      .filter(Boolean);
    if (gaps.length === 0) {
      return `You're already aligned with ${role.title}. As a stretch, look at adjacent emerging skills (e.g. ML basics for frontend, or cloud cost optimisation) to differentiate.`;
    }
    const top = gaps.slice(0, 3).map((s) => s.name).join(', ');
    return `For ${role.title}, your top gaps are: ${top}. I'd tackle them in that order, prioritising the ones with a "rising" demand trend.`;
  }

  return "I can help with skill tips, next-step recommendations, or career path questions. Try asking: 'Should I learn React?' or 'What should I learn next?'";
}

/* ============================================================
   VIEWS
   ============================================================ */

function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Skills Alignment Navigator
        </h1>
        <p className="mt-2 text-slate-600 max-w-3xl">
          South Asian curricula typically refresh every 2–5 years while job-market
          demand shifts every 12–18 months — leaving 40–60% of graduates under-placed.
          This tool maps <em>your</em> skills to in-demand roles and flags where
          curricula are falling behind.
        </p>
      </div>
    </header>
  );
}

function Tabs({ active, onChange }) {
  const tabs = ['Student', 'Curriculum', 'Job Market', 'AI Coach'];
  return (
    <nav role="tablist" aria-label="Main views"
         className="max-w-6xl mx-auto px-4 mt-6 flex flex-wrap gap-2">
      {tabs.map((t) => {
        const isActive = active === t;
        return (
          <button
            key={t}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t)}
            className={[
              'px-4 py-2 rounded-lg text-sm font-medium border transition',
              isActive
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100',
            ].join(' ')}
          >
            {t}
          </button>
        );
      })}
    </nav>
  );
}

function Badge({ status, children }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
        'whitespace-nowrap',
        GAP_STYLES[status] || GAP_STYLES.missing,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

function StudentView({ student, setStudent, role, setRole, onJumpToCoach }) {
  const [recommendations, setRecommendations] = useState([]);

  // Recompute gap + recommendations whenever inputs change
  useEffect(() => {
    if (!role) {
      setRecommendations([]);
      return;
    }
    const gaps = role.required
      .filter((sid) => statusFor(student, sid) !== 'have')
      .map((sid) => skillById(sid))
      .filter(Boolean);

    if (gaps.length === 0) {
      // Zero-gap edge case → suggest a stretch skill (a rising-demand skill not in role)
      const stretch = SKILLS.find(
        (s) =>
          s.demandTrend === 'rising' &&
          !role.required.includes(s.id) &&
          student.skills[s.id] !== 'have'
      );
      setRecommendations(
        stretch
          ? [
              `You're aligned with ${role.title} on the core requirements.`,
              `As a stretch, consider ${stretch.name} — it's a rising-demand skill that would differentiate you.`,
              `Tip: pick one portfolio project that combines ${role.title} basics with ${stretch.name}.`,
            ]
          : [
              `You're aligned with ${role.title} on the core requirements.`,
              `Try a portfolio project that demonstrates depth, not just breadth.`,
            ]
      );
      return;
    }

    const recs = [];
    const top = gaps.slice(0, 3);
    top.forEach((s) => {
      recs.push(
        `Learn ${s.name} — required for ${role.title}, ${
          student.skills[s.id] === 'in-progress' ? 'in progress, keep going' : 'not yet in your skillset'
        }.`
      );
    });
    if (top.some((s) => s.demandTrend === 'rising')) {
      recs.push(`Prioritise rising-demand skills first; they'll compound in the next 12-18 months.`);
    }
    setRecommendations(recs);
  }, [student, role]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Student</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            value={student.id}
            onChange={(e) =>
              setStudent(STUDENTS.find((s) => s.id === e.target.value))
            }
          >
            {STUDENTS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Target job role</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            value={role ? role.id : ''}
            onChange={(e) =>
              setRole(JOB_ROLES.find((r) => r.id === e.target.value) || null)
            }
          >
            <option value="">— Select a role —</option>
            {JOB_ROLES.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </label>
      </div>

      {!role ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-500 text-sm">
          Pick a target job role above to see your skill gap and recommendations.
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Skill gap for <span className="text-blue-700">{role.title}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {role.required.map((sid) => {
                const s = skillById(sid);
                const status = statusFor(student, sid);
                return (
                  <Badge key={sid} status={status}>
                    {s?.name || sid}
                    {status === 'have' && ' ✓'}
                    {status === 'in-progress' && ' ⏳'}
                    {status === 'missing' && ' ✗'}
                  </Badge>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-300 align-middle mr-1" /> have
              <span className="inline-block w-3 h-3 rounded-full bg-amber-300 align-middle mx-1 ml-3" /> in-progress
              <span className="inline-block w-3 h-3 rounded-full bg-rose-300 align-middle mx-1 ml-3" /> missing
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Recommendations</h3>
            <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
              {recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
            <button
              onClick={onJumpToCoach}
              className="mt-4 text-sm font-medium text-blue-700 hover:underline"
            >
              Ask the AI Coach for a study plan →
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function CurriculumView() {
  const rows = useMemo(() => {
    return SKILLS.map((skill) => {
      const teachingCurricula = CURRICULA.filter((c) =>
        c.teaches.includes(skill.id)
      );
      const coverage = Math.round(
        (teachingCurricula.length / CURRICULA.length) * 100
      );
      const underTaught =
        skill.demandTrend === 'rising' && coverage < 60;
      return { skill, coverage, underTaught };
    });
  }, []);

  const underCount = rows.filter((r) => r.underTaught).length;
  const risingTaught = rows.filter(
    (r) => r.skill.demandTrend === 'rising' && r.coverage >= 60
  ).length;

  return (
    <section className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-700">
          <strong className="text-slate-900">{underCount}</strong> rising-demand skill(s) are
          under-taught across curricula (coverage below 60%). Of {rows.filter((r) => r.skill.demandTrend === 'rising').length} rising-demand skills,
          <strong className="text-slate-900"> {risingTaught}</strong> have broad coverage — the rest
          are exactly the gaps that produce the 40-60% under-placement rate.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">Skill</th>
              <th className="text-left px-4 py-2 font-semibold">Demand</th>
              <th className="text-left px-4 py-2 font-semibold">Curriculum coverage</th>
              <th className="text-left px-4 py-2 font-semibold">Flag</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ skill, coverage, underTaught }) => (
              <tr key={skill.id} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium text-slate-900">{skill.name}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${demandColor(skill.demandTrend)}`}>
                    {demandIcon(skill.demandTrend)} {skill.demandTrend}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${coverage >= 60 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${coverage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600">{coverage}%</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  {underTaught ? (
                    <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-2 py-0.5">
                      Under-taught
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function JobMarketView({ onPickRole }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {JOB_ROLES.map((role) => {
          // Aggregate demand trend for the role's required skills
          const trends = role.required
            .map((id) => skillById(id)?.demandTrend)
            .filter(Boolean);
          const rising   = trends.filter((t) => t === 'rising').length;
          const declining = trends.filter((t) => t === 'declining').length;
          const stable    = trends.length - rising - declining;
          const headline =
            rising > stable && rising > declining
              ? 'rising'
              : declining > rising && declining > stable
              ? 'declining'
              : 'stable';
          return (
            <button
              key={role.id}
              onClick={() => onPickRole(role)}
              className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md hover:border-blue-300 transition focus:outline-none"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-slate-900">{role.title}</h3>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${demandColor(headline)}`}
                  title="Aggregate demand trend"
                >
                  {demandIcon(headline)} {headline}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Top required skills</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {role.required.slice(0, 5).map((sid) => {
                  const s = skillById(sid);
                  return (
                    <span
                      key={sid}
                      className={`text-xs px-2 py-0.5 rounded-md border ${demandColor(s?.demandTrend)}`}
                    >
                      {s?.name}
                    </span>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-blue-700">Click to see your gap →</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CoachView({ student, role }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  // Welcome message depends on student/role; reset stale state on switch
  useEffect(() => {
    const greet = role
      ? `Hi ${student.name.split(' ')[0]} — I see you're exploring ${role.title}. Ask me about a specific skill or what to learn next.`
      : `Hi ${student.name.split(' ')[0]} — pick a target role in the Student view, then ask me anything.`;
    setMessages([{ from: 'coach', text: greet }]);
  }, [student.id, role?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' });
  }, [messages]);

  function send() {
    const text = draft.trim();
    if (!text) return; // ignore empty
    const reply = coachReply(student, role, text) ||
      "I can help with skill tips, next-step recommendations, or career path questions.";
    setMessages((m) => [...m, { from: 'user', text }, { from: 'coach', text: reply }]);
    setDraft('');
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-6">
      <div className="rounded-xl border border-slate-200 bg-white flex flex-col h-[480px]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={[
                'max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                m.from === 'user'
                  ? 'ml-auto bg-blue-600 text-white'
                  : 'mr-auto bg-slate-100 text-slate-800',
              ].join(' ')}
            >
              {m.text}
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="border-t border-slate-200 p-3 flex gap-2"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Should I learn React? What should I learn next?"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            aria-label="Ask the AI coach"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
}

/* ============================================================
   ROOT
   ============================================================ */

export default function App() {
  const [tab, setTab] = useState('Student');
  const [student, setStudent] = useState(STUDENTS[0]);
  const [role, setRole] = useState(null);

  function pickRoleFromMarket(r) {
    setRole(r);
    setTab('Student');
  }

  function jumpToCoach() {
    setTab('AI Coach');
  }

  return (
    <div className="min-h-screen pb-12">
      <Header />
      <Tabs active={tab} onChange={setTab} />
      <main>
        {tab === 'Student' && (
          <StudentView
            student={student} setStudent={setStudent}
            role={role}       setRole={setRole}
            onJumpToCoach={jumpToCoach}
          />
        )}
        {tab === 'Curriculum' && <CurriculumView />}
        {tab === 'Job Market' && <JobMarketView onPickRole={pickRoleFromMarket} />}
        {tab === 'AI Coach' && <CoachView student={student} role={role} />}
      </main>
      <footer className="max-w-6xl mx-auto px-4 mt-10 text-xs text-slate-500">
        Static demo · all data is mocked in-memory · no backend, no auth, no API keys.
      </footer>
    </div>
  );
}
