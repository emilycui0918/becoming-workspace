// Small local chart renderer: exact values remain available in an accessible table.
class Chart {
 constructor(canvas,config){this.canvas=canvas;this.panel=document.createElement('div');this.panel.className='chart-panel';canvas.hidden=true;canvas.after(this.panel);this.render(config);}
 render(config){const labels=config.data.labels||[],sets=config.data.datasets||[];const max=Math.max(1,...sets.flatMap(s=>s.data.map(v=>Number(v)||0)));const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 720 220');svg.setAttribute('role','img');svg.setAttribute('aria-label',sets.map(s=>s.label||'分布').join('、'));this.panel.appendChild(svg);
 const colors=['#234dff','#ff5a36','#15876a','#7850b0'];
 sets.forEach((s,si)=>{const data=s.data.map(v=>Number(v)||0),color=typeof s.borderColor==='string'?s.borderColor:colors[si%4];if(config.type==='line'){const line=document.createElementNS(ns,'polyline');line.setAttribute('fill','none');line.setAttribute('stroke',color);line.setAttribute('stroke-width','3');line.setAttribute('points',data.map((v,i)=>`${25+i*670/Math.max(1,labels.length-1)},${195-v/max*170}`).join(' '));svg.appendChild(line);}else data.forEach((v,i)=>{const bar=document.createElementNS(ns,'rect'),slot=670/Math.max(1,labels.length);bar.setAttribute('x',String(25+i*slot+si*slot/sets.length));bar.setAttribute('y',String(195-v/max*170));bar.setAttribute('width',String(Math.max(1,slot/sets.length-3)));bar.setAttribute('height',String(v/max*170));bar.setAttribute('fill',Array.isArray(s.backgroundColor)?s.backgroundColor[i]:color);svg.appendChild(bar);});});
 const table=document.createElement('table'),head=table.createTHead().insertRow();['日期 / 类别',...sets.map(s=>s.label||'数量')].forEach(t=>{const th=document.createElement('th');th.textContent=t;head.appendChild(th);});const body=table.createTBody();labels.forEach((l,i)=>{const row=body.insertRow();row.insertCell().textContent=l;sets.forEach(s=>row.insertCell().textContent=String(s.data[i]??0));});this.panel.appendChild(table);}
 destroy(){this.panel.remove();this.canvas.hidden=false;}
}

/* ---- preserved execution layer ---- */

(function () {
  const STORAGE_KEY = 'becoming_undergraduate_offline_v6';
  const LEGACY_KEYS = ['becoming_undergraduate_offline_v5', 'becoming_undergraduate_offline'];
  function readSaved() {
    const candidates = [STORAGE_KEY, ...LEGACY_KEYS];
    for (const key of candidates) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      } catch (error) {
        console.warn('无法读取本机记录', error);
      }
    }
    return {};
  }
  function setStatus(message, isError) {
    const el = document.getElementById('cloudMessage');
    if (!el) return;
    el.textContent = message;
    el.style.color = isError ? '#b42318' : '';
    const utility = document.getElementById('v5SyncStatus');
    if (utility) utility.textContent = message;
  }
  window.__initialWorkspace = readSaved();
  window.__workspaceRevision = 0;
  window.__workspaceOffline = true;
  window.queueWorkspaceSave = function (snapshot) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      window.__initialWorkspace = snapshot;
      setStatus('网页版 · 已自动保存到此浏览器');
    } catch (error) {
      console.error(error);
      setStatus('本机保存失败，请立即导出 JSON 备份', true);
    }
  };
  window.addEventListener('error', function (event) {
    console.error('Becoming Offline error:', event.error || event.message);
  });
  const layout = document.getElementById('appLayout');
  if (layout) layout.inert = false;
})();

/* ---- preserved execution layer ---- */

function validateImportIds(value){if(!value||typeof value!=="object")return;for(const [k,v] of Object.entries(value)){if((k==="id"||k.endsWith("Id"))&&typeof v==="string"&&!/^[a-zA-Z0-9_-]*$/.test(v))throw new Error("记录标识包含不支持的字符");if(k==="__proto__"||k==="constructor"||k==="prototype")throw new Error("不支持的属性");validateImportIds(v);}}

    const STORAGE_KEY = 'undergraduate_master_workspace_merged_v1';
    const SUBMISSION_COLUMNS = ['选题中','写作中','待投稿','已投稿','审稿中','返修中','已接收','已见刊/已收录','搁置/拒稿'];
    const STAGE_COLORS = {
      '选题中':'#9B5DE5','写作中':'#FF8C42','待投稿':'#4D9DE0','已投稿':'#43AA8B','审稿中':'#3b82f6','返修中':'#f97316','已接收':'#10b981','已见刊/已收录':'#059669','搁置/拒稿':'#9ca3af'
    };
    const CATEGORY_COLORS = { research:'#BBAECC', writing:'#FF8C42', reading:'#4D9DE0', admin:'#9fbcdb', other:'#43AA8B' };
    const GTD_BUCKETS = [
      { value:'inbox', label:'收集箱', short:'Inbox' },
      { value:'next', label:'下一步', short:'Next' },
      { value:'waiting', label:'等待反馈', short:'Waiting' },
      { value:'someday', label:'将来也许', short:'Someday' },
      { value:'done', label:'已完成', short:'Done' }
    ];
    const QUADRANT_OPTIONS = [
      { value:'q1', label:'重要且紧急', short:'Q1', note:'先处理，防止失控', color:'bg-rose-100 text-rose-700' },
      { value:'q2', label:'重要不紧急', short:'Q2', note:'最值得主动安排时间块', color:'bg-purple-100 text-purple-700' },
      { value:'q3', label:'紧急不重要', short:'Q3', note:'能委托就委托，能压缩就压缩', color:'bg-sky-100 text-sky-700' },
      { value:'q4', label:'不紧急不重要', short:'Q4', note:'少量保留，避免吞掉注意力', color:'bg-gray-100 text-gray-600' }
    ];
    const TODAY_BUCKETS = [
      { value:'', label:'不放入今日清单', short:'未安排', color:'bg-gray-100 text-gray-600' },
      { value:'must', label:'今日必做', short:'Must', color:'bg-rose-100 text-rose-700' },
      { value:'should', label:'今日应该', short:'Should', color:'bg-amber-100 text-amber-700' },
      { value:'could', label:'今日可以', short:'Could', color:'bg-emerald-100 text-emerald-700' }
    ];
    const TASK_STATUS_OPTIONS = [
      { value:'planned', label:'计划中', progress:10, color:'bg-slate-100 text-slate-600' },
      { value:'todo', label:'没开始', progress:0, color:'bg-gray-100 text-gray-600' },
      { value:'active', label:'进行中', progress:50, color:'bg-sky-100 text-sky-700' },
      { value:'done', label:'完成', progress:100, color:'bg-emerald-100 text-emerald-700' }
    ];
    const PROJECT_AREAS = [
      { value:'writing', label:'写作 / 论文' }
    ];
    const PROJECT_STATUS_OPTIONS = [
      { value:'active', label:'进行中' },
      { value:'paused', label:'暂停' },
      { value:'done', label:'已完成' }
    ];
    const CARE_MOOD_OPTIONS = [
      { value:'overloaded', emoji:'😣', label:'压力拉满' },
      { value:'tense', emoji:'😕', label:'绷得很紧' },
      { value:'steady', emoji:'😐', label:'勉强平稳' },
      { value:'lighter', emoji:'🙂', label:'慢慢松开' },
      { value:'energized', emoji:'😊', label:'有一点能量' }
    ];
    const MENTOR_STATUS_OPTIONS = [
      { value:'drafting', emoji:'📝', label:'准备汇报' },
      { value:'reported', emoji:'📤', label:'已汇报' },
      { value:'meeting', emoji:'🗣️', label:'已沟通 / 已开会' },
      { value:'waiting', emoji:'⏳', label:'等待反馈' },
      { value:'blocked', emoji:'🚩', label:'需要主动推进' }
    ];
    const MENTOR_PROMISE_STATUS_OPTIONS = [
      { value:'open', label:'待核对', color:'bg-yellow-100 text-yellow-800' },
      { value:'confirmed', label:'已确认待兑现', color:'bg-sky-100 text-sky-700' },
      { value:'remind', label:'需再次提醒', color:'bg-rose-100 text-rose-700' },
      { value:'resolved', label:'已落实', color:'bg-emerald-100 text-emerald-700' }
    ];
    const MENTOR_CHANNEL_OPTIONS = ['', '面谈', '邮件 / 微信', '文稿批注', '组会', '其他'];
    const REVIEW_ENERGY_OPTIONS = [
      { value:'high', emoji:'☀️', label:'高：可以攻坚', short:'高', color:'text-dopamine-orange' },
      { value:'medium', emoji:'😐', label:'中：稳定推进', short:'中', color:'text-dopamine-sky' },
      { value:'low', emoji:'🌧️', label:'低：需要降载', short:'低', color:'text-dopamine-purple' }
    ];
    const DEFAULT_HABITS = [];
    const LEGACY_REMOVED_HABITS = new Set(['habit_reading','habit_writing','habit_phone_control','habit_food_journal','habit_mind_record']);

    const $ = (id) => document.getElementById(id);
    const sections = ['home-section','workflow-section','thesis-section','submission-section','habit-section','care-section','mentor-section','review-section','achievement-section','dashboard-section','settings-section','life-section','studio-section','homebase-section','recipe-section','english-section','opportunity-section','learning-section','study-section','information-section','plan-section','university-section','applications-section','style-section','money-section'];
    const charts = { focus:null, attendance:null, habit:null, thesis:null, wellbeing:null, submission:null };
    const PREF_SIDEBAR_HIDDEN_KEY = `${STORAGE_KEY}__sidebar_hidden`;
    const PREF_STATS_MODE_KEY = `${STORAGE_KEY}__stats_mode`;
    let currentSection = 'home-section';
    let focusInterval = null;
    let selectedCareMood = 'steady';
    let editContext = null;
    let sidebarHidden = false;
    let statsMode = 'day'; // 'day' | 'week' | 'month'

    function uid(prefix='id') { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }
    function pad(n) { return String(n).padStart(2,'0'); }
    function todayStr(offset=0) { const d = new Date(); d.setDate(d.getDate()+offset); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
    function nowTime() { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
    function nowDateTime() { const d = new Date(); return `${todayStr()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }
    function parseYMD(dateStr) {
      const m = String(dateStr || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!m) return null;
      const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      d.setHours(0,0,0,0);
      return d;
    }
    function ymd(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
    function dateFromDateTime(dtStr='') { return String(dtStr || '').slice(0,10); }
    function shiftDate(dateStr, offset=0) {
      const d = parseYMD(dateStr);
      if (!d) return todayStr(offset);
      d.setDate(d.getDate() + offset);
      return ymd(d);
    }
    function parseHM(v) { if (!v) return null; const m=String(v).match(/^(\d{1,2}):(\d{2})$/); if(!m) return null; const h=+m[1], mm=+m[2]; if(h<0||h>23||mm<0||mm>59) return null; return `${pad(h)}:${pad(mm)}`; }
    function escapeHtml(s='') { return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
    function hmToMinutes(hm) { const t=parseHM(hm); if(!t) return 0; const [h,m]=t.split(':').map(Number); return h*60+m; }
    function minutesBetween(start,end) { let s=hmToMinutes(start), e=hmToMinutes(end); if (e < s) e += 24*60; return Math.max(0, e-s); }
    function formatMinutes(mins) { mins = Math.round(Number(mins)||0); const h=Math.floor(mins/60), m=mins%60; return h>0 ? `${h}小时 ${m}分钟` : `${m}分钟`; }
    function formatDurationHM(mins) { mins=Math.round(Number(mins)||0); const h=Math.floor(mins/60), m=mins%60; return `${pad(h)}:${pad(m)}`; }
    function addMinutesToHM(start, mins) {
      const base = hmToMinutes(start);
      const total = (base + Math.max(0, Number(mins) || 0)) % (24 * 60);
      return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
    }
    function bytesToKB(bytes) { return `${(bytes/1024).toFixed(1)} KB`; }
    function dayLabel(dateStr) { const d=parseYMD(dateStr); return d ? `${dateStr} · 周${'日一二三四五六'[d.getDay()]}` : String(dateStr || ''); }
    function sortByTime(arr, key='start') { return [...arr].sort((a,b)=>(a[key]||'').localeCompare(b[key]||'')); }
    function jsDateFrom(dateStr, hm='00:00') { return new Date(`${dateStr}T${parseHM(hm)||'00:00'}:00`); }
    function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
    function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }

    function diffDays(fromDateStr, toDateStr) {
      const a = parseYMD(fromDateStr);
      const b = parseYMD(toDateStr);
      if (!a || !b) return NaN;
      return Math.round((b - a) / (1000 * 3600 * 24));
    }
    function startOfWeek(dateStr) {
      const d = parseYMD(dateStr);
      if (!d) return todayStr();
      // Monday as first day of week.
      const weekday = d.getDay(); // 0 Sun - 6 Sat
      const diff = weekday === 0 ? 6 : weekday - 1;
      d.setDate(d.getDate() - diff);
      return ymd(d);
    }
    function startOfMonth(dateStr) {
      const d = parseYMD(dateStr);
      if (!d) return todayStr();
      d.setDate(1);
      return ymd(d);
    }
    function dateSpan(startStr, endStr) {
      const start = parseYMD(startStr);
      const end = parseYMD(endStr);
      if (!start || !end || start > end) return [];
      const dates = [];
      const cursor = new Date(start);
      while (cursor <= end) {
        dates.push(ymd(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      return dates;
    }
    function isDateInRange(dateStr, startStr, endStr) {
      if (!dateStr || !startStr || !endStr) return false;
      return dateStr >= startStr && dateStr <= endStr;
    }
    function statsModeText(baseDate=todayStr()) {
      if (statsMode === 'week') return '本周';
      if (statsMode === 'month') return '本月';
      return baseDate === todayStr() ? '今日' : '当日';
    }
    function getStatsRange(baseDate=todayStr()) {
      const base = baseDate || todayStr();
      if (statsMode === 'week') {
        const start = startOfWeek(base);
        return { start, end: base, dates: dateSpan(start, base), label: `本周 ${start} ~ ${base}` };
      }
      if (statsMode === 'month') {
        const start = startOfMonth(base);
        return { start, end: base, dates: dateSpan(start, base), label: `本月 ${start} ~ ${base}` };
      }
      return { start: base, end: base, dates: [base], label: dayLabel(base) };
    }

    function syncStatsModeButtons() {
      document.querySelectorAll('.stats-mode-btn').forEach(btn => {
        const active = btn.dataset.statsMode === statsMode;
        btn.classList.toggle('bg-dopamine-orange', active);
        btn.classList.toggle('text-white', active);
        btn.classList.toggle('shadow-soft', active);
        btn.classList.toggle('text-calm-mute', !active);
      });
    }
    function statsModeToDashboardDays(mode) { return mode === 'week' ? 7 : mode === 'month' ? 30 : 1; }
    function syncDashboardRangeToStatsMode() {
      const el = $('dashboardRange');
      if (!el) return;
      const nextDays = String(statsModeToDashboardDays(statsMode));
      if (el.value !== nextDays) el.value = nextDays;
    }
    function setStatsMode(nextMode, { persist=true, rerender=true } = {}) {
      const mode = ['day','week','month'].includes(nextMode) ? nextMode : 'day';
      if (statsMode === mode) return;
      statsMode = mode;
      if (persist) localStorage.setItem(PREF_STATS_MODE_KEY, statsMode);
      syncStatsModeButtons();
      syncDashboardRangeToStatsMode();
      if (rerender) renderAll();
    }

    function applySidebarHidden(hidden) {
      const layout = $('appLayout');
      if (!layout) return;
      layout.classList.toggle('layout-sidebar-hidden', !!hidden);
      const btn = $('btnSidebarToggle');
      if (!btn) return;
      const label = hidden ? '显示边栏' : '隐藏边栏';
      btn.setAttribute('aria-label', label);
      btn.title = label;
      btn.innerHTML = `<i class="fa-solid ${hidden ? 'fa-angles-right' : 'fa-angles-left'}"></i>`;
    }
    function toggleSidebar() {
      sidebarHidden = !sidebarHidden;
      localStorage.setItem(PREF_SIDEBAR_HIDDEN_KEY, sidebarHidden ? '1' : '0');
      applySidebarHidden(sidebarHidden);
    }
    function loadPrefs() {
      const storedMode = localStorage.getItem(PREF_STATS_MODE_KEY);
      statsMode = ['day','week','month'].includes(storedMode) ? storedMode : 'day';
      sidebarHidden = localStorage.getItem(PREF_SIDEBAR_HIDDEN_KEY) === '1';
      applySidebarHidden(sidebarHidden);
      syncStatsModeButtons();
      syncDashboardRangeToStatsMode();
    }

    function taskBucketMeta(bucket) {
      return GTD_BUCKETS.find(item => item.value === bucket) || GTD_BUCKETS[1];
    }
    function taskQuadrantMeta(quadrant) {
      return QUADRANT_OPTIONS.find(item => item.value === quadrant) || QUADRANT_OPTIONS[1];
    }
    function todayBucketMeta(bucket) {
      return TODAY_BUCKETS.find(item => item.value === bucket) || TODAY_BUCKETS[0];
    }
    function taskStatusMeta(status) {
      return TASK_STATUS_OPTIONS.find(item => item.value === status) || TASK_STATUS_OPTIONS[1];
    }
    function projectAreaMeta(area) {
      return PROJECT_AREAS.find(item => item.value === area) || { value:String(area || 'writing'), label:String(area || '写作 / 论文') };
    }
    function projectStatusMeta(status) {
      return PROJECT_STATUS_OPTIONS.find(item => item.value === status) || PROJECT_STATUS_OPTIONS[0];
    }
    function blockColorForTask(task) {
      const quadrant = taskQuadrantMeta(task?.quadrant);
      if (quadrant.value === 'q1') return '#FB7185';
      if (quadrant.value === 'q2') return '#9B5DE5';
      if (quadrant.value === 'q3') return '#4D9DE0';
      return '#9CA3AF';
    }

    function normalizeTaskItem(item) {
      if (!item || item.title == null) return null;
      const title = String(item.title || '').trim();
      if (!title) return null;
      const status = TASK_STATUS_OPTIONS.some(opt => opt.value === item.status) ? item.status : 'todo';
      const rawBucket = GTD_BUCKETS.some(opt => opt.value === item.gtdBucket) ? item.gtdBucket : (status === 'done' ? 'done' : 'next');
      const bucket = status === 'done' ? 'done' : rawBucket;
      const quadrant = QUADRANT_OPTIONS.some(opt => opt.value === item.quadrant) ? item.quadrant : 'q2';
      const todayBucket = TODAY_BUCKETS.some(opt => opt.value === item.todayBucket) ? item.todayBucket : '';
      return {
        id: String(item.id || uid('task')),
        title,
        status,
        projectId: String(item.projectId || ''),
        gtdBucket: bucket,
        quadrant,
        todayBucket: status === 'done' ? '' : todayBucket,
        dueDate: String(item.dueDate || ''),
        estimate: Math.max(0, Number(item.estimate) || 0),
        context: String(item.context || ''),
        note: String(item.note || item.notes || ''),
        createdAt: String(item.createdAt || nowDateTime()),
        startedAt: String(item.startedAt || ''),
        doneAt: String(item.doneAt || '')
      };
    }

    function normalizeTasksState(tasks) {
      return Array.isArray(tasks) ? tasks.map(normalizeTaskItem).filter(Boolean) : [];
    }

    function normalizeProgressLog(item) {
      if (!item || typeof item !== 'object') return null;
      const note = String(item.note || item.title || '').trim();
      if (!note) return null;
      return {
        id: String(item.id || uid('plog')),
        date: String(item.date || dateFromDateTime(item.at) || todayStr()),
        type: String(item.type || '推进'),
        minutes: Math.max(0, Number(item.minutes) || 0),
        note,
        sourceTaskId: String(item.sourceTaskId || item.taskId || ''),
        at: String(item.at || nowDateTime())
      };
    }

    function normalizeProjectItem(item) {
      if (!item || item.title == null) return null;
      const title = String(item.title || '').trim();
      if (!title) return null;
      const area = String(item.area || 'writing');
      const status = PROJECT_STATUS_OPTIONS.some(opt => opt.value === item.status) ? item.status : 'active';
      return {
        id: String(item.id || uid('proj')),
        title,
        outcome: String(item.outcome || ''),
        area,
        status,
        startDate: String(item.startDate || dateFromDateTime(item.createdAt || nowDateTime()) || ''),
        deadline: String(item.deadline || ''),
        note: String(item.note || ''),
        logs: Array.isArray(item.logs) ? item.logs.map(normalizeProgressLog).filter(Boolean) : [],
        createdAt: String(item.createdAt || nowDateTime()),
        updatedAt: String(item.updatedAt || item.createdAt || nowDateTime())
      };
    }

    function normalizeProjectsState(projects) {
      return Array.isArray(projects) ? projects.map(normalizeProjectItem).filter(Boolean) : [];
    }

    function normalizeHabitItem(item) {
      if (!item || !item.id) return null;
      const id = String(item.id);
      const name = item.name != null ? String(item.name).trim() : '';
      if (!name) return null;
      const icon = String(item.icon || '✅');
      const rawMode = String(item.mode || 'checkbox');
      let mode = rawMode;
      // Backward compatibility.
      if (mode === 'sleep' || mode === 'wake') mode = 'time';
      if (id === 'habit_early_sleep' || id === 'habit_early_wake') mode = 'time';
      if (id === 'habit_exercise') mode = 'duration';
      if (!['time','duration','checkbox','text','count','food'].includes(mode)) mode = 'checkbox';
      const enabled = item.enabled !== false;
      return { id, name, icon, mode, enabled, locked: !!item.locked };
    }

    function normalizeAttendance(attendance) {
      const out = {};
      if (!attendance || typeof attendance !== 'object') return out;
      for (const [date, rawDay] of Object.entries(attendance)) {
        if (!rawDay || typeof rawDay !== 'object') continue;
        const day = { wake: rawDay.wake || null, sleep: rawDay.sleep || null, logs: [], leaves: [] };
        if (Array.isArray(rawDay.logs)) {
          day.logs = rawDay.logs.map(log => ({
            id: log.id || uid('work'),
            date: log.date || date,
            start: parseHM(log.start) || parseHM(log.in) || nowTime(),
            end: parseHM(log.end) || parseHM(log.out) || null,
            note: log.note || log.notes || ''
          }));
        }
        if (!day.logs.length && rawDay.periods && typeof rawDay.periods === 'object') {
          for (const [periodName, periodData] of Object.entries(rawDay.periods)) {
            if (Array.isArray(periodData?.segments)) {
              periodData.segments.forEach((seg, idx) => {
                day.logs.push({
                  id: seg.id || `legacy_${date}_${periodName}_${idx}`,
                  date,
                  start: parseHM(seg.start) || parseHM(seg.in) || '09:00',
                  end: parseHM(seg.end) || parseHM(seg.out) || null,
                  note: periodName
                });
              });
            }
            if (periodData?.activeStart) {
              day.logs.push({ id:`legacy_open_${date}_${periodName}`, date, start: parseHM(periodData.activeStart) || '09:00', end:null, note:`${periodName}（未结束）`});
            }
          }
        }
        if (Array.isArray(rawDay.leaves)) {
          day.leaves = rawDay.leaves.map(item => ({ id:item.id||uid('leave'), date:item.date||date, type:item.type||'其他' }));
        } else if (rawDay.leave) {
          if (typeof rawDay.leave === 'string') day.leaves = [{ id:uid('leave'), date, type:rawDay.leave }];
          else if (typeof rawDay.leave === 'object') day.leaves = [{ id: rawDay.leave.id||uid('leave'), date, type: rawDay.leave.type||'其他' }];
        }
        out[date] = day;
      }
      return out;
    }

    function normalizeMoodMap(source) {
      const out = {};
      if (!source || typeof source !== 'object') return out;
      for (const [date, value] of Object.entries(source)) {
        if (Array.isArray(value)) {
          out[date] = value.map(item => ({ id:item.id||uid('mood'), mood:item.mood||item.emoji||'😊', note:item.note||'', at:item.at||item.ts||nowDateTime() }));
        } else if (value && typeof value === 'object') {
          out[date] = [{ id:value.id||uid('mood'), mood:value.mood||value.emoji||'😊', note:value.note||'', at:value.at||value.ts||nowDateTime() }];
        }
      }
      return out;
    }

    function normalizeReflectionMap(source) {
      const out = {};
      if (!source || typeof source !== 'object') return out;
      for (const [date, value] of Object.entries(source)) {
        if (Array.isArray(value)) {
          out[date] = value.map(item => ({ id:item.id||uid('ref'), text:item.text||item.note||'', at:item.at||item.ts||nowDateTime() }));
        } else if (typeof value === 'string') {
          out[date] = [{ id:uid('ref'), text:value, at:nowDateTime() }];
        } else if (value && typeof value === 'object' && value.text) {
          out[date] = [{ id:value.id||uid('ref'), text:value.text, at:value.at||value.ts||nowDateTime() }];
        }
      }
      return out;
    }

    function normalizeSubmissionItem(item) {
      if (!item || typeof item !== 'object') return null;
      const stage = SUBMISSION_COLUMNS.includes(item.stage) ? item.stage : '选题中';
      const createdAt = String(item.createdAt || item.at || nowDateTime());
      return {
        id: String(item.id || uid('sub')),
        title: String(item.title || '').trim() || '未命名项目',
        venue: String(item.venue || ''),
        deadline: String(item.deadline || ''),
        stage,
        type: String(item.type || 'Other'),
        notes: String(item.notes || ''),
        logs: Array.isArray(item.logs) ? item.logs.map(log => ({
          id: String(log.id || uid('sublog')),
          date: String(log.date || dateFromDateTime(log.at) || todayStr()),
          type: String(log.type || '推进'),
          minutes: Math.max(0, Number(log.minutes) || 0),
          note: String(log.note || log.text || ''),
          stage: String(log.stage || stage),
          at: String(log.at || log.createdAt || nowDateTime())
        })) : [],
        createdAt,
        updatedAt: String(item.updatedAt || createdAt)
      };
    }

    function normalizeSubmissions(source) {
      return Array.isArray(source) ? source.map(normalizeSubmissionItem).filter(Boolean) : [];
    }

    function legacyMoodToCareMood(rawMood) {
      const mood = String(rawMood || '');
      if (['😭','😣'].includes(mood)) return 'overloaded';
      if (['😕'].includes(mood)) return 'tense';
      if (['🙂'].includes(mood)) return 'lighter';
      if (['😊'].includes(mood)) return 'energized';
      return 'steady';
    }

    function careMoodMeta(mood) {
      return CARE_MOOD_OPTIONS.find(item => item.value === mood) || CARE_MOOD_OPTIONS[2];
    }

    function mentorStatusMeta(status) {
      return MENTOR_STATUS_OPTIONS.find(item => item.value === status) || MENTOR_STATUS_OPTIONS[0];
    }

    function mentorPromiseStatusMeta(status) {
      return MENTOR_PROMISE_STATUS_OPTIONS.find(item => item.value === status) || MENTOR_PROMISE_STATUS_OPTIONS[0];
    }

    function reviewEnergyMeta(energy) {
      return REVIEW_ENERGY_OPTIONS.find(item => item.value === energy) || REVIEW_ENERGY_OPTIONS[1];
    }

    function defaultCareEntry() {
      return {
        mood: 'steady',
        stress: 3,
        energy: 3,
        challenge: '',
        selfCare: '',
        gratitude: '',
        support: '',
        note: '',
        updatedAt: ''
      };
    }

    function normalizeCareEntry(raw) {
      const base = defaultCareEntry();
      if (!raw || typeof raw !== 'object') return { ...base };
      const mood = CARE_MOOD_OPTIONS.some(item => item.value === raw.mood) ? raw.mood : base.mood;
      return {
        mood,
        stress: clamp(raw.stress ?? 3, 1, 5),
        energy: clamp(raw.energy ?? 3, 1, 5),
        challenge: String(raw.challenge || raw.trigger || ''),
        selfCare: String(raw.selfCare || raw.relief || ''),
        gratitude: String(raw.gratitude || ''),
        support: String(raw.support || ''),
        note: String(raw.note || raw.compassion || ''),
        updatedAt: String(raw.updatedAt || raw.at || '')
      };
    }

    function buildLegacyCareEntries(legacyMood) {
      const out = {};
      if (!legacyMood || typeof legacyMood !== 'object') return out;
      for (const [date, items] of Object.entries(legacyMood)) {
        if (!Array.isArray(items) || !items.length) continue;
        const latest = items[0];
        out[date] = normalizeCareEntry({
          mood: legacyMoodToCareMood(latest?.mood || latest?.emoji),
          note: latest?.note || '',
          updatedAt: latest?.at || latest?.ts || ''
        });
      }
      return out;
    }

    function normalizeCareState(care, legacyMood) {
      const merged = buildLegacyCareEntries(legacyMood);
      const sourceEntries = care?.entries && typeof care.entries === 'object' ? care.entries : {};
      Object.entries(sourceEntries).forEach(([date, entry]) => { merged[date] = normalizeCareEntry(entry); });
      return { entries: merged };
    }

    function defaultDailyReviewEntry() {
      return {
        energy: 'medium',
        energyNote: '',
        accomplishments: '',
        unfinished: '',
        insights: '',
        obstacles: '',
        tomorrow: ['', '', ''],
        tomorrowTaskIds: ['', '', ''],
        updatedAt: ''
      };
    }

    function normalizeDailyReviewEntry(raw) {
      const base = defaultDailyReviewEntry();
      if (!raw || typeof raw !== 'object') return { ...base };
      const tomorrow = Array.isArray(raw.tomorrow)
        ? raw.tomorrow.slice(0, 3).map(item => String(item || ''))
        : [
            String(raw.tomorrow1 || raw.priority1 || raw.start || ''),
            String(raw.tomorrow2 || raw.priority2 || ''),
            String(raw.tomorrow3 || raw.priority3 || '')
          ];
      while (tomorrow.length < 3) tomorrow.push('');
      const tomorrowTaskIds = Array.isArray(raw.tomorrowTaskIds) ? raw.tomorrowTaskIds.slice(0, 3).map(item => String(item || '')) : [];
      while (tomorrowTaskIds.length < 3) tomorrowTaskIds.push('');
      const energy = REVIEW_ENERGY_OPTIONS.some(item => item.value === raw.energy) ? raw.energy : base.energy;
      return {
        energy,
        energyNote: String(raw.energyNote || raw.note || ''),
        accomplishments: String(raw.accomplishments || raw.output || raw.keep || ''),
        unfinished: String(raw.unfinished || raw.delayAnalysis || raw.improve || ''),
        insights: String(raw.insights || raw.knowledge || ''),
        obstacles: String(raw.obstacles || raw.action || raw.stop || ''),
        tomorrow,
        tomorrowTaskIds,
        updatedAt: String(raw.updatedAt || raw.at || '')
      };
    }

    function buildLegacyReviewEntries(legacyReflections) {
      const out = {};
      if (!legacyReflections || typeof legacyReflections !== 'object') return out;
      for (const [date, items] of Object.entries(legacyReflections)) {
        if (!Array.isArray(items) || !items.length) continue;
        const latest = items[0];
        out[date] = normalizeDailyReviewEntry({
          accomplishments: latest?.text || '',
          updatedAt: latest?.at || latest?.ts || ''
        });
      }
      return out;
    }

    function normalizeDailyReviewState(reviewDaily, legacyReflections) {
      const merged = buildLegacyReviewEntries(legacyReflections);
      const sourceEntries = reviewDaily?.entries && typeof reviewDaily.entries === 'object' ? reviewDaily.entries : {};
      Object.entries(sourceEntries).forEach(([date, entry]) => { merged[date] = normalizeDailyReviewEntry(entry); });
      return { entries: merged };
    }

    function defaultMentorEntry() {
      return {
        status: 'drafting',
        channel: '',
        pressure: 3,
        clarity: 3,
        topic: '',
        evidence: '',
        ask: '',
        risk: '',
        feedback: '',
        commitment: '',
        confirmation: '',
        followupDate: '',
        promiseStatus: 'open',
        promiseTaskId: '',
        boundary: '',
        nextAction: '',
        nextActionTaskId: '',
        updatedAt: ''
      };
    }

    function normalizeMentorEntry(raw) {
      const base = defaultMentorEntry();
      if (!raw || typeof raw !== 'object') return { ...base };
      const status = MENTOR_STATUS_OPTIONS.some(item => item.value === raw.status) ? raw.status : base.status;
      const channelRaw = String(raw.channel || '').trim().replace(/\s*\/\s*/g, ' / ');
      const channel = MENTOR_CHANNEL_OPTIONS.includes(channelRaw) ? channelRaw : '';
      const promiseStatus = MENTOR_PROMISE_STATUS_OPTIONS.some(item => item.value === raw.promiseStatus) ? raw.promiseStatus : base.promiseStatus;
      return {
        status,
        channel,
        pressure: clamp(raw.pressure ?? raw.stress ?? 3, 1, 5),
        clarity: clamp(raw.clarity ?? 3, 1, 5),
        topic: String(raw.topic || ''),
        evidence: String(raw.evidence || raw.progress || ''),
        ask: String(raw.ask || raw.support || ''),
        risk: String(raw.risk || raw.challenge || ''),
        feedback: String(raw.feedback || raw.decision || raw.response || ''),
        commitment: String(raw.commitment || raw.promise || raw.agreement || ''),
        confirmation: String(raw.confirmation || raw.memo || raw.minutes || ''),
        followupDate: String(raw.followupDate || raw.checkDate || raw.promiseDate || ''),
        promiseStatus,
        promiseTaskId: String(raw.promiseTaskId || ''),
        boundary: String(raw.boundary || ''),
        nextAction: String(raw.nextAction || raw.next || ''),
        nextActionTaskId: String(raw.nextActionTaskId || ''),
        updatedAt: String(raw.updatedAt || raw.at || '')
      };
    }

    function normalizeMentorState(mentor) {
      const entries = mentor?.entries && typeof mentor.entries === 'object' ? mentor.entries : {};
      const out = {};
      Object.entries(entries).forEach(([date, entry]) => { out[date] = normalizeMentorEntry(entry); });
      return { entries: out };
    }

    function normalizeHabitsState(habits) {
      const sourceList = Array.isArray(habits?.list) ? habits.list : [];
      const defaultIds = new Set(DEFAULT_HABITS.map(h => h.id));
      const defaultOverrides = new Map();
      const customs = [];
      const used = new Set();
      sourceList.forEach(item => {
        const clean = normalizeHabitItem(item);
        if (!clean) return;
        if (LEGACY_REMOVED_HABITS.has(clean.id)) return;
        if (defaultIds.has(clean.id)) { defaultOverrides.set(clean.id, clean); used.add(clean.id); return; }
        if (used.has(clean.id)) return;
        customs.push(clean);
        used.add(clean.id);
      });
      return {
        list: [
          ...DEFAULT_HABITS.map(def => {
            const ov = defaultOverrides.get(def.id);
            return ov ? { ...def, ...ov, locked:false } : { ...def };
          }),
          ...customs
        ],
        logs: habits?.logs && typeof habits.logs === 'object' ? habits.logs : {},
        entries: habits?.entries && typeof habits.entries === 'object' ? habits.entries : {}
      };
    }

    function defaultThesisState() {
      return {
        meta: { title:'', targetDate:'', version:'', note:'' },
        milestones: [
          { id:'ms_proposal', name:'开题 / Proposal', due:'', done:false, doneAt:'', note:'' },
          { id:'ms_midterm', name:'中期检查', due:'', done:false, doneAt:'', note:'' },
          { id:'ms_predefense', name:'导师审阅', due:'', done:false, doneAt:'', note:'' },
          { id:'ms_submission', name:'论文提交', due:'', done:false, doneAt:'', note:'' },
          { id:'ms_defense', name:'最终提交确认', due:'', done:false, doneAt:'', note:'' }
        ],
        chapters: [
          { id:'ch_intro', name:'引言 / Introduction', progress:0, status:'draft', updatedAt:'', note:'' },
          { id:'ch_related', name:'文献综述 / Literature Review', progress:0, status:'draft', updatedAt:'', note:'' },
          { id:'ch_method', name:'方法 / Method', progress:0, status:'draft', updatedAt:'', note:'' },
          { id:'ch_exp', name:'分析与讨论 / Analysis & Discussion', progress:0, status:'draft', updatedAt:'', note:'' },
          { id:'ch_conc', name:'结论 / Conclusion', progress:0, status:'draft', updatedAt:'', note:'' }
        ],
        logs: []
      };
    }
    function normalizeThesisState(thesis) {
      const def = defaultThesisState();
      if (!thesis || typeof thesis !== 'object') return def;
      const metaRaw = thesis.meta && typeof thesis.meta === 'object' ? thesis.meta : {};
      const meta = {
        title: String(metaRaw.title || ''),
        targetDate: String(metaRaw.targetDate || ''),
        version: String(metaRaw.version || ''),
        note: String(metaRaw.note || '')
      };
      const milestones = Array.isArray(thesis.milestones)
        ? thesis.milestones.map(item => ({
          id: String(item?.id || uid('ms')),
          name: String(item?.name || '未命名里程碑'),
          due: String(item?.due || ''),
          done: !!item?.done,
          doneAt: String(item?.doneAt || ''),
          note: String(item?.note || '')
        }))
        : def.milestones.map(v => ({ ...v }));
      const chapters = Array.isArray(thesis.chapters)
        ? thesis.chapters.map(item => ({
          id: String(item?.id || uid('ch')),
          name: String(item?.name || '未命名章节'),
          progress: Math.max(0, Math.min(100, Number(item?.progress) || 0)),
          status: ['draft','revise','done'].includes(item?.status) ? item.status : 'draft',
          updatedAt: String(item?.updatedAt || ''),
          note: String(item?.note || '')
        }))
        : def.chapters.map(v => ({ ...v }));
      const logs = Array.isArray(thesis.logs)
        ? thesis.logs.map(item => ({
          id: String(item?.id || uid('thlog')),
          date: String(item?.date || todayStr()),
          type: ['writing','revise','experiment','meeting','other'].includes(item?.type) ? item.type : 'other',
          minutes: Math.max(0, Number(item?.minutes) || 0),
          words: Math.max(0, Number(item?.words) || 0),
          note: String(item?.note || ''),
          at: String(item?.at || item?.ts || nowDateTime())
        }))
        : [];
      return { meta, milestones, chapters, logs };
    }

    function loadState() {
      try {
        const raw = JSON.stringify(window.__initialWorkspace || {});
        const parsed = raw ? JSON.parse(raw) : {}; validateImportIds(parsed);
        return {
          attendance: normalizeAttendance(parsed.attendance),
          timeBlocks: parsed.timeBlocks && typeof parsed.timeBlocks === 'object' ? parsed.timeBlocks : {},
          appleCalendar: parsed.appleCalendar && typeof parsed.appleCalendar === 'object' ? { events: Array.isArray(parsed.appleCalendar.events) ? parsed.appleCalendar.events : [], importedAt: String(parsed.appleCalendar.importedAt || ''), fileName: String(parsed.appleCalendar.fileName || '') } : { events:[], importedAt:'', fileName:'' },
          tasks: normalizeTasksState(parsed.tasks),
          projects: normalizeProjectsState(parsed.projects),
          focus: parsed.focus && typeof parsed.focus === 'object' ? { active: parsed.focus.active || null, sessions: Array.isArray(parsed.focus.sessions) ? parsed.focus.sessions : [] } : { active:null, sessions:[] },
          habits: normalizeHabitsState(parsed.habits),
          foods: Array.isArray(parsed.foods) ? parsed.foods : [],
          weights: Array.isArray(parsed.weights) ? parsed.weights.map(item => ({
            id: String(item.id || uid('weight')),
            date: String(item.date || dateFromDateTime(item.at) || todayStr()),
            value: Math.max(0, Number(item.value) || 0),
            unit: ['kg','斤','lb'].includes(item.unit) ? item.unit : 'kg',
            at: String(item.at || nowDateTime())
          })).filter(item => item.value > 0) : [],
          mood: normalizeMoodMap(parsed.mood),
          reflections: normalizeReflectionMap(parsed.reflections),
          care: normalizeCareState(parsed.care, parsed.mood),
          mentor: normalizeMentorState(parsed.mentor),
          reviewDaily: normalizeDailyReviewState(parsed.reviewDaily, parsed.reflections),
          submissions: normalizeSubmissions(parsed.submissions),
          thesis: normalizeThesisState(parsed.thesis), life: Array.isArray(parsed.life) ? parsed.life : [], portfolio: Array.isArray(parsed.portfolio) ? parsed.portfolio : [], journal: Array.isArray(parsed.journal) ? parsed.journal : [], trips: Array.isArray(parsed.trips) ? parsed.trips : [], travelMap: parsed.travelMap && typeof parsed.travelMap === "object" ? parsed.travelMap : {china:[],world:[]}, routines: Array.isArray(parsed.routines) ? parsed.routines : null, inventory: Array.isArray(parsed.inventory) ? parsed.inventory : null, recipes: Array.isArray(parsed.recipes) ? parsed.recipes : [], english: Array.isArray(parsed.english) ? parsed.english : [], studyAreas: Array.isArray(parsed.studyAreas) ? parsed.studyAreas : [], learningCycles: Array.isArray(parsed.learningCycles) ? parsed.learningCycles : [], studyModules: Array.isArray(parsed.studyModules) ? parsed.studyModules : [], books: Array.isArray(parsed.books) ? parsed.books : [], readingLogs: Array.isArray(parsed.readingLogs) ? parsed.readingLogs : [], newsNotes: Array.isArray(parsed.newsNotes) ? parsed.newsNotes : [], newsBriefs: Array.isArray(parsed.newsBriefs) ? parsed.newsBriefs : [], learningLinks: Array.isArray(parsed.learningLinks) ? parsed.learningLinks : [], customAchievements: Array.isArray(parsed.customAchievements) ? parsed.customAchievements : [], v4Seeds: parsed.v4Seeds && !Array.isArray(parsed.v4Seeds) && typeof parsed.v4Seeds === "object" ? parsed.v4Seeds : {}, inbox: Array.isArray(parsed.inbox) ? parsed.inbox : [], planItems: Array.isArray(parsed.planItems) ? parsed.planItems : [], pointsRules: Array.isArray(parsed.pointsRules) ? parsed.pointsRules : [], pointsLog: Array.isArray(parsed.pointsLog) ? parsed.pointsLog : [], universityAssessments: Array.isArray(parsed.universityAssessments) ? parsed.universityAssessments : [], placementLogs: Array.isArray(parsed.placementLogs) ? parsed.placementLogs : [], applications: Array.isArray(parsed.applications) ? parsed.applications : [], moneyTransactions: Array.isArray(parsed.moneyTransactions) ? parsed.moneyTransactions : [], moneyBudgets: Array.isArray(parsed.moneyBudgets) ? parsed.moneyBudgets : [], moneyAccounts: Array.isArray(parsed.moneyAccounts) ? parsed.moneyAccounts : [], wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [], styleItems: Array.isArray(parsed.styleItems) ? parsed.styleItems : [], decisionLog: Array.isArray(parsed.decisionLog) ? parsed.decisionLog : [], v5Meta: parsed.v5Meta && !Array.isArray(parsed.v5Meta) && typeof parsed.v5Meta === "object" ? parsed.v5Meta : {}
        };
      } catch (err) {
        console.error(err);
        return {
          attendance:{},
          timeBlocks:{},
          tasks:[],
          projects:[],
          focus:{active:null,sessions:[]},
          habits:normalizeHabitsState({}),
          foods:[],
          weights:[],
          mood:{},
          reflections:{},
          care:normalizeCareState({}, {}),
          mentor:normalizeMentorState({}),
          reviewDaily:normalizeDailyReviewState({}, {}),
          submissions:[],
          thesis: defaultThesisState()
        };
      }
    }

    const state = loadState();
    let workflowSelectedProjectId = '';

    function saveState() { window.queueWorkspaceSave(state); }
    function getDayAttendance(date=todayStr()) {
      if (!state.attendance[date]) state.attendance[date] = { wake:null, sleep:null, logs:[], leaves:[] };
      return state.attendance[date];
    }
    function getDayTimeBlocks(date=todayStr()) {
      if (!state.timeBlocks[date]) state.timeBlocks[date] = [];
      return state.timeBlocks[date];
    }
    function getHabitEntryMap(date=todayStr()) {
      if (!state.habits.entries[date]) state.habits.entries[date] = {};
      return state.habits.entries[date];
    }
    function projectById(id='') { return state.projects.find(item => item.id === id) || null; }
    function careEntryOn(date=todayStr()) { return normalizeCareEntry(state.care?.entries?.[date]); }
    function mentorEntryOn(date=todayStr()) { return normalizeMentorEntry(state.mentor?.entries?.[date]); }
    function dailyReviewEntryOn(date=todayStr()) { return normalizeDailyReviewEntry(state.reviewDaily?.entries?.[date]); }
    function activeTask() { return state.tasks.find(t => t.status === 'active') || null; }
    function taskOpen(task) { return task && task.status !== 'done' && task.gtdBucket !== 'done'; }
    function openTasksList() { return state.tasks.filter(taskOpen); }
    function tasksForProject(projectId='') { return state.tasks.filter(item => item.projectId === projectId); }
    function nextActionTasks() { return state.tasks.filter(item => taskOpen(item) && item.gtdBucket === 'next'); }
    function focusMinutesOn(date=todayStr()) { return state.focus.sessions.filter(s => s.date===date).reduce((sum,s)=>sum + (Number(s.minutes)||0), 0); }
    function reviewPriorityCount(entry) {
      const clean = normalizeDailyReviewEntry(entry);
      return clean.tomorrow.filter(item => String(item || '').trim()).length;
    }
    function reviewTemplateCount(entry) {
      const clean = normalizeDailyReviewEntry(entry);
      return [
        clean.accomplishments,
        clean.unfinished,
        clean.insights,
        clean.obstacles,
        reviewPriorityCount(clean) ? 'tomorrow' : ''
      ].filter(item => String(item || '').trim()).length;
    }
    function reviewContentCount(entry) {
      const clean = normalizeDailyReviewEntry(entry);
      return reviewTemplateCount(clean) + (clean.energyNote.trim() ? 1 : 0);
    }
    function careCountOn(date=todayStr()) {
      const entry = careEntryOn(date);
      return entry.updatedAt || entry.challenge || entry.selfCare || entry.gratitude || entry.support || entry.note ? 1 : 0;
    }
    function mentorCountOn(date=todayStr()) {
      const entry = mentorEntryOn(date);
      return entry.updatedAt || entry.topic || entry.evidence || entry.ask || entry.risk || entry.feedback || entry.commitment || entry.confirmation || entry.followupDate || entry.boundary || entry.nextAction || entry.status !== 'drafting' || entry.channel || entry.pressure !== 3 || entry.clarity !== 3 || entry.promiseStatus !== 'open' ? 1 : 0;
    }
    function reviewCountOn(date=todayStr()) {
      const entry = dailyReviewEntryOn(date);
      return entry.updatedAt || reviewContentCount(entry) > 0 ? 1 : 0;
    }
    function supportPageCountOn(date=todayStr()) { return careCountOn(date) + mentorCountOn(date) + reviewCountOn(date); }
    function moodCountOn(date=todayStr()) { return careCountOn(date) + reviewCountOn(date); }
    function mentorPendingItems(baseDate=todayStr()) {
      return Object.entries(state.mentor?.entries || {})
        .map(([date]) => ({ date, entry: mentorEntryOn(date) }))
        .filter(item => item.entry.commitment.trim() && item.entry.promiseStatus !== 'resolved')
        .sort((a, b) => (a.entry.followupDate || '9999-99-99').localeCompare(b.entry.followupDate || '9999-99-99') || b.date.localeCompare(a.date));
    }
    function mentorOverdueCount(baseDate=todayStr()) {
      return mentorPendingItems(baseDate).filter(item => item.entry.followupDate && item.entry.followupDate < baseDate).length;
    }
    function runningSubmissionCount() { return state.submissions.filter(s => !['已接收','已见刊/已收录','搁置/拒稿'].includes(s.stage)).length; }
    function totalAttendanceMinutes(date=todayStr()) { return (state.attendance[date]?.logs || []).reduce((sum,log)=>sum + (log.end ? minutesBetween(log.start, log.end) : 0), 0); }
    function todayOpenLogs(date=todayStr()) { return getDayAttendance(date).logs.filter(log => !log.end); }
    function qualifiesWake(time) { return !!parseHM(time) && hmToMinutes(time) <= hmToMinutes('09:00'); }
    function qualifiesSleep(time) { return !!parseHM(time) && hmToMinutes(time) <= hmToMinutes('23:30'); }
    function todayHabitCompletion(date=todayStr()) {
      const habits = (state.habits?.list || []).filter(h => h && h.enabled !== false);
      const trackables = habits.filter(h => !LEGACY_REMOVED_HABITS.has(h.id));
      if (!trackables.length) return 0;
      const doneCount = trackables.filter(h => habitDoneOnDate(h, date)).length;
      return Math.round(doneCount / trackables.length * 100);
    }
    function ensureTaskCleanup() {
      state.tasks = normalizeTasksState(state.tasks);
      state.projects = normalizeProjectsState(state.projects);
    }
    ensureTaskCleanup();

    function setInputIfIdle(id, value) {
      const el = $(id);
      if (!el) return;
      if (document.activeElement === el) return;
      const v = String(value ?? '');
      if (el.value !== v) el.value = v;
    }

    function thesisOverallProgress() {
      const thesis = state.thesis || defaultThesisState();
      const milestones = Array.isArray(thesis.milestones) ? thesis.milestones : [];
      const chapters = Array.isArray(thesis.chapters) ? thesis.chapters : [];
      const msTotal = milestones.length;
      const msDone = milestones.filter(m => m.done).length;
      const msRatio = msTotal ? msDone / msTotal : 0;
      const chTotal = chapters.length;
      const chRatio = chTotal ? chapters.reduce((sum, c) => sum + (Number(c.progress) || 0), 0) / (100 * chTotal) : 0;
      const overall = Math.round((msRatio * 0.4 + chRatio * 0.6) * 100);
      return Math.max(0, Math.min(100, overall));
    }

    function renderThesisThemeStats() {
      const range = getStatsRange(todayStr());
      if ($('thesisStatsRangeLabel')) $('thesisStatsRangeLabel').textContent = range.label;
      const logs = (state.thesis?.logs || []);
      const inRangeLogs = logs.filter(item => isDateInRange(item.date, range.start, range.end));
      const minutes = inRangeLogs.reduce((sum, item) => sum + (Number(item.minutes) || 0), 0);
      const words = inRangeLogs.reduce((sum, item) => sum + (Number(item.words) || 0), 0);
      const milestoneDone = (state.thesis?.milestones || []).filter(m => m.doneAt && isDateInRange(dateFromDateTime(m.doneAt), range.start, range.end)).length;
      const chapterUpdated = (state.thesis?.chapters || []).filter(c => c.updatedAt && isDateInRange(dateFromDateTime(c.updatedAt), range.start, range.end)).length;
      const cards = [
        { label:`${statsModeText()}日志条目`, value: inRangeLogs.length, color:'text-dopamine-sky' },
        { label:`${statsModeText()}投入分钟`, value: Math.round(minutes), color:'text-dopamine-orange' },
        { label:`${statsModeText()}写作字数`, value: Math.round(words), color:'text-dopamine-pink' },
        { label:`${statsModeText()}章节更新`, value: chapterUpdated, color:'text-dopamine-purple' },
        { label:`${statsModeText()}完成里程碑`, value: milestoneDone, color:'text-dopamine-mint' }
      ];
      $('thesisThemeStats').innerHTML = cards.map(item => `
        <div class="small-stat p-4">
          <div class="text-sm text-calm-mute">${item.label}</div>
          <div class="text-2xl font-black mt-1 ${item.color}">${escapeHtml(String(item.value))}</div>
        </div>
      `).join('');
    }

    function renderThesisMeta() {
      const thesis = state.thesis || defaultThesisState();
      setInputIfIdle('thesisMetaTitle', thesis.meta?.title || '');
      setInputIfIdle('thesisMetaTargetDate', thesis.meta?.targetDate || '');
      setInputIfIdle('thesisMetaVersion', thesis.meta?.version || '');
      setInputIfIdle('thesisMetaNote', thesis.meta?.note || '');
      const overall = thesisOverallProgress();
      if ($('thesisOverallText')) $('thesisOverallText').textContent = `${overall}%`;
      if ($('thesisOverallBar')) $('thesisOverallBar').style.width = `${overall}%`;
      if ($('thesisOverallHint')) {
        const msTotal = thesis.milestones?.length || 0;
        const msDone = (thesis.milestones || []).filter(m => m.done).length;
        const chTotal = thesis.chapters?.length || 0;
        $('thesisOverallHint').textContent = `里程碑 ${msDone}/${msTotal} · 章节 ${chTotal} 个`;
      }
    }

    function addThesisMilestone() {
      const name = $('thesisMilestoneName').value.trim();
      if (!name) return;
      const due = $('thesisMilestoneDue').value || '';
      state.thesis.milestones.unshift({ id: uid('ms'), name, due, done:false, doneAt:'', note:'' });
      $('thesisMilestoneName').value = '';
      $('thesisMilestoneDue').value = '';
      saveState(); renderAll();
    }
    function toggleThesisMilestoneDone(id) {
      const item = state.thesis.milestones.find(m => m.id === id);
      if (!item) return;
      item.done = !item.done;
      item.doneAt = item.done ? nowDateTime() : '';
      saveState(); renderAll();
    }
    function renderThesisMilestones() {
      const list = (state.thesis?.milestones || []);
      $('thesisMilestoneList').innerHTML = list.map(item => `
        <div class="rounded-2xl border border-calm-line bg-white p-3 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-3">
              <button class="w-10 h-10 rounded-2xl ${item.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-calm-mute'} font-black" data-ms-toggle="${item.id}" title="切换完成状态">${item.done ? '✓' : ''}</button>
              <div class="min-w-0">
                <div class="font-black ${item.done ? 'line-through text-calm-mute' : ''}">${escapeHtml(item.name)}</div>
                <div class="text-xs text-calm-mute mt-1">${item.due ? `截止：${escapeHtml(item.due)}` : '未设置截止'}${item.doneAt ? ` · 完成于 ${escapeHtml(item.doneAt)}` : ''}</div>
              </div>
            </div>
          </div>
          <button class="text-sm font-bold text-dopamine-orange" data-ms-edit="${item.id}">修改</button>
        </div>
      `).join('') || '<div class="text-sm text-calm-mute">还没有里程碑，先添加一条吧。</div>';
      $('thesisMilestoneList').querySelectorAll('[data-ms-toggle]').forEach(btn => btn.onclick = () => toggleThesisMilestoneDone(btn.dataset.msToggle));
      $('thesisMilestoneList').querySelectorAll('[data-ms-edit]').forEach(btn => btn.onclick = () => openThesisMilestoneEditor(btn.dataset.msEdit));
    }

    function addThesisChapter() {
      const name = $('thesisChapterName').value.trim();
      if (!name) return;
      const status = ['draft','revise','done'].includes($('thesisChapterStatus').value) ? $('thesisChapterStatus').value : 'draft';
      state.thesis.chapters.unshift({ id: uid('ch'), name, progress: 0, status, updatedAt: nowDateTime(), note:'' });
      $('thesisChapterName').value = '';
      saveState(); renderAll();
    }
    function setThesisChapterProgress(id, value) {
      const item = state.thesis.chapters.find(c => c.id === id);
      if (!item) return;
      item.progress = Math.max(0, Math.min(100, Number(value) || 0));
      item.updatedAt = nowDateTime();
      if (item.progress >= 100) item.status = 'done';
      saveState(); renderAll();
    }
    function renderThesisChapters() {
      const list = (state.thesis?.chapters || []);
      const statusText = { draft:'草稿', revise:'修改', done:'完成' };
      const statusColor = { draft:'bg-gray-100 text-calm-mute', revise:'bg-amber-100 text-amber-700', done:'bg-green-100 text-green-700' };
      $('thesisChapterList').innerHTML = list.map(item => `
        <div class="rounded-2xl border border-calm-line bg-white p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="font-black">${escapeHtml(item.name)}</div>
              <div class="text-xs text-calm-mute mt-1">${item.updatedAt ? `更新：${escapeHtml(item.updatedAt)}` : '未更新'}</div>
            </div>
            <div class="flex items-center gap-2">
              <span class="pill ${statusColor[item.status] || statusColor.draft}">${statusText[item.status] || '草稿'}</span>
              <button class="text-sm font-bold text-dopamine-orange" data-ch-edit="${item.id}">修改</button>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-3">
            <input data-ch-range="${item.id}" type="range" min="0" max="100" value="${Number(item.progress) || 0}" class="w-full">
            <div class="font-black mono w-12 text-right">${Math.round(Number(item.progress) || 0)}%</div>
          </div>
          <div class="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div class="h-full" style="width:${Math.max(0, Math.min(100, Number(item.progress) || 0))}%; background: linear-gradient(90deg, #43AA8B, #4D9DE0);"></div>
          </div>
        </div>
      `).join('') || '<div class="text-sm text-calm-mute">还没有章节，先添加一条吧。</div>';
      $('thesisChapterList').querySelectorAll('[data-ch-range]').forEach(el => el.onchange = () => setThesisChapterProgress(el.dataset.chRange, el.value));
      $('thesisChapterList').querySelectorAll('[data-ch-edit]').forEach(btn => btn.onclick = () => openThesisChapterEditor(btn.dataset.chEdit));
    }

    function addThesisLog() {
      const date = $('thesisLogDate').value || todayStr();
      const type = $('thesisLogType').value || 'other';
      const minutes = Math.max(0, Number($('thesisLogMinutes').value) || 0);
      const words = Math.max(0, Number($('thesisLogWords').value) || 0);
      const note = $('thesisLogNote').value.trim();
      state.thesis.logs.unshift({ id: uid('thlog'), date, type, minutes, words, note, at: nowDateTime() });
      $('thesisLogMinutes').value = '';
      $('thesisLogWords').value = '';
      $('thesisLogNote').value = '';
      saveState(); renderAll();
    }
    function renderThesisLogs() {
      const icons = { writing:'📝', revise:'✍️', experiment:'🧪', meeting:'👥', other:'📌' };
      const typeText = { writing:'写作', revise:'修改', experiment:'实验', meeting:'讨论/组会', other:'其他' };
      const logs = (state.thesis?.logs || []).slice(0, 30);
      $('thesisLogList').innerHTML = logs.map(item => `
        <div class="rounded-2xl border border-calm-line bg-white p-3 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <div class="text-2xl">${icons[item.type] || icons.other}</div>
              <div class="min-w-0">
                <div class="font-black">${escapeHtml(item.date)} · ${escapeHtml(typeText[item.type] || '其他')}</div>
                <div class="text-xs text-calm-mute mt-1">${item.minutes ? `${Math.round(item.minutes)} 分钟` : '—'}${item.words ? ` · ${Math.round(item.words)} 字` : ''}${item.note ? ` · ${escapeHtml(item.note)}` : ''}</div>
              </div>
            </div>
          </div>
          <button class="text-sm font-bold text-dopamine-orange" data-thlog-edit="${item.id}">修改</button>
        </div>
      `).join('') || '<div class="text-sm text-calm-mute">还没有推进日志，先记录一条吧。</div>';
      $('thesisLogList').querySelectorAll('[data-thlog-edit]').forEach(btn => btn.onclick = () => openThesisLogEditor(btn.dataset.thlogEdit));
    }

    function saveThesisMeta() {
      state.thesis.meta = {
        title: $('thesisMetaTitle').value.trim(),
        targetDate: $('thesisMetaTargetDate').value || '',
        version: $('thesisMetaVersion').value.trim(),
        note: $('thesisMetaNote').value.trim()
      };
      saveState(); renderAll();
      alert('已保存论文信息。');
    }

    function renderThesis() {
      renderThesisThemeStats();
      renderThesisMeta();
      renderThesisMilestones();
      renderThesisChapters();
      renderThesisLogs();
    }

    function navTo(sectionId) {
      currentSection = sectionId;
      sections.forEach(id => $(id).classList.toggle('section-hidden', id !== sectionId));
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.target === sectionId));
      if (sectionId === 'dashboard-section') renderDashboard();
      if (sectionId === 'settings-section') refreshSettings();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateClock() {
      const d = new Date();
      $('sidebarNowDate').textContent = `${d.getFullYear()}年${pad(d.getMonth()+1)}月${pad(d.getDate())}日 周${'日一二三四五六'[d.getDay()]}`;
      $('sidebarNowTime').textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    function renderSidebarSnapshot() {
      $('sbFocus').textContent = formatMinutes(focusMinutesOn());
      $('sbTask').textContent = activeTask()?.title || '无';
      $('sbHabit').textContent = `${todayHabitCompletion()}%`;
      $('sbReview').textContent = String(supportPageCountOn());
      $('sbSubmission').textContent = String(runningSubmissionCount());
    }

    function renderHomeQuickLinks() {
      const cards = [
        { target:'workflow-section', label:'项目看板', value:`${openTasksList().length} 项`, color:'text-dopamine-pink', icon:'fa-diagram-project' },
        { target:'submission-section', label:'投稿项目', value:`${state.submissions.length} 项`, color:'text-dopamine-sky', icon:'fa-paper-plane' },
        { target:'thesis-section', label:'论文进度', value:`${thesisOverallProgress()}%`, color:'text-dopamine-purple', icon:'fa-book-open' },
        { target:'habit-section', label:'习惯完成度', value:`${todayHabitCompletion()}%`, color:'text-dopamine-mint', icon:'fa-leaf' },
        { target:'care-section', label:'心灵关怀', value: careCountOn() ? '已记录' : '待关照', color:'text-dopamine-mint', icon:'fa-seedling' },
        { target:'mentor-section', label:'导师沟通', value: mentorCountOn() ? '已梳理' : '待整理', color:'text-dopamine-purple', icon:'fa-user-tie' },
        { target:'review-section', label:'今日复盘', value: reviewCountOn() ? '已写' : '待写', color:'text-dopamine-pink', icon:'fa-heart' },
        { target:'achievement-section', label:'已解锁成就', value:`${getAchievements().filter(a=>a.unlocked).length} 枚`, color:'text-dopamine-yellow', icon:'fa-trophy' },
        { target:'dashboard-section', label:'数据看板', value:'查看趋势', color:'text-dopamine-purple', icon:'fa-chart-line' },
        { target:'settings-section', label:'数据管理', value:'备份 / 导入', color:'text-dopamine-orange', icon:'fa-database' }
      ];
      $('homeQuickLinks').innerHTML = cards.map(card => `
        <div class="overview-link small-stat p-3" data-target="${card.target}">
          <div class="flex items-center justify-between text-sm ${card.color}"><span class="font-black">${card.label}</span><i class="fa-solid ${card.icon}"></i></div>
          <div class="mt-2 font-black text-lg">${card.value}</div>
        </div>
      `).join('');
      $('homeQuickLinks').querySelectorAll('[data-target]').forEach(el => el.onclick = () => navTo(el.dataset.target));
    }

    function renderHomeThemeStats() {
      const range = getStatsRange(todayStr());
      if ($('homeStatsRangeLabel')) $('homeStatsRangeLabel').textContent = range.label;
      const days = Math.max(1, range.dates.length);
      const focusMins = range.dates.reduce((sum, d) => sum + focusMinutesOn(d), 0);
      const workMins = range.dates.reduce((sum, d) => sum + totalAttendanceMinutes(d), 0);
      const avgHabit = Math.round(range.dates.reduce((sum, d) => sum + todayHabitCompletion(d), 0) / days);
      const careEntries = range.dates.reduce((sum, d) => sum + careCountOn(d), 0);
      const mentorEntries = range.dates.reduce((sum, d) => sum + mentorCountOn(d), 0);
      const reviewEntries = range.dates.reduce((sum, d) => sum + reviewCountOn(d), 0);
      const doneTasks = state.tasks.filter(t => t.doneAt && isDateInRange(dateFromDateTime(t.doneAt), range.start, range.end)).length;
      const newSubs = state.submissions.filter(s => s.createdAt && isDateInRange(dateFromDateTime(s.createdAt), range.start, range.end)).length;
      const cards = [
        { label:`${statsModeText()}专注`, value: formatMinutes(focusMins), color:'text-dopamine-orange' },
        { label:`${statsModeText()}打卡`, value: formatMinutes(workMins), color:'text-dopamine-sky' },
        { label:`${statsModeText()}习惯均值`, value: `${avgHabit}%`, color:'text-dopamine-mint' },
        { label:`${statsModeText()}心灵关怀`, value: careEntries, color:'text-dopamine-mint' },
        { label:`${statsModeText()}导师沟通`, value: mentorEntries, color:'text-dopamine-purple' },
        { label:`${statsModeText()}复盘`, value: reviewEntries, color:'text-dopamine-pink' },
        { label:`${statsModeText()}完成任务`, value: doneTasks, color:'text-dopamine-purple' },
        { label:`${statsModeText()}新增投稿`, value: newSubs, color:'text-dopamine-sky' }
      ];
      $('homeThemeStats').innerHTML = cards.map(item => `
        <div class="small-stat p-4">
          <div class="text-sm text-calm-mute">${item.label}</div>
          <div class="text-2xl font-black mt-1 ${item.color}">${escapeHtml(String(item.value))}</div>
        </div>
      `).join('');
    }

    function addWorkLog() {
      const day = getDayAttendance();
      day.logs.push({ id:uid('work'), date:todayStr(), start:nowTime(), end:null, note:'' });
      saveState(); renderAll();
    }
    function endWorkLog() {
      const open = [...todayOpenLogs()].pop();
      if (!open) { alert('今天没有进行中的工作段。'); return; }
      open.end = nowTime();
      saveState(); renderAll();
    }
    function addLeave() {
      const day = getDayAttendance();
      day.leaves.push({ id:uid('leave'), date:todayStr(), type:$('leaveTypeSelect').value || '其他' });
      saveState(); renderAll();
    }
    function closeAllOpenLogs() {
      const now = nowTime();
      todayOpenLogs().forEach(log => { log.end = now; });
      saveState(); renderAll();
    }
    function clearTodayLeaves() {
      getDayAttendance().leaves = [];
      saveState(); renderAll();
    }

    function renderHomeAttendance() {
      const day = getDayAttendance();
      $('todayCheckinCount').textContent = String(day.logs.length);
      $('todayWorkMinutes').textContent = formatMinutes(totalAttendanceMinutes());
      $('todayLeaveCount').textContent = String(day.leaves.length);
      $('todayOpenLogCount').textContent = String(todayOpenLogs().length);
      const logHtml = sortByTime(day.logs).map(log => `
        <div class="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-3 border border-calm-line">
          <div>
            <div class="font-bold">工作段 <span class="text-xs text-calm-mute">${log.start}${log.end ? ` - ${log.end}` : ' - 进行中'}</span></div>
            <div class="text-xs text-calm-mute">${log.end ? formatMinutes(minutesBetween(log.start, log.end)) : '尚未结束'}</div>
          </div>
          <button class="text-sm font-bold text-dopamine-orange" data-edit-log="${log.id}">修改</button>
        </div>
      `).join('');
      const leaveHtml = day.leaves.map(item => `
        <div class="flex items-center justify-between gap-3 rounded-2xl bg-purple-50 px-3 py-3 border border-purple-100">
          <div><div class="font-bold text-dopamine-purple">请假：${item.type}</div><div class="text-xs text-calm-mute">${item.date}</div></div>
          <button class="text-sm font-bold text-dopamine-orange" data-edit-leave="${item.id}">修改</button>
        </div>
      `).join('');
      $('todayAttendanceList').innerHTML = logHtml + leaveHtml || '<div class="text-calm-mute text-sm">今天还没有记录。</div>';
      $('todayAttendanceList').querySelectorAll('[data-edit-log]').forEach(btn => btn.onclick = () => openWorkLogEditor(btn.dataset.editLog));
      $('todayAttendanceList').querySelectorAll('[data-edit-leave]').forEach(btn => btn.onclick = () => openLeaveEditor(btn.dataset.editLeave));
    }

    function createTask(payload = {}) {
      const task = normalizeTaskItem({
        id: uid('task'),
        title: payload.title || '',
        status: payload.status || 'todo',
        projectId: payload.projectId || '',
        gtdBucket: payload.gtdBucket || 'next',
        quadrant: payload.quadrant || 'q2',
        todayBucket: payload.todayBucket || '',
        dueDate: payload.dueDate || '',
        estimate: payload.estimate ?? 25,
        context: payload.context || '',
        note: payload.note || '',
        createdAt: payload.createdAt || nowDateTime(),
        startedAt: payload.startedAt || '',
        doneAt: payload.doneAt || ''
      });
      if (!task) return;
      state.tasks.unshift(task);
      return task;
    }
    function addTask() {
      const title = $('taskInput').value.trim();
      if (!title) return;
      createTask({ title, gtdBucket:'next', quadrant:'q2', todayBucket:'should', estimate:25 });
      $('taskInput').value = '';
      saveState(); renderAll();
    }

    function recordFocusRun({ id, date, title, category='research', note='', start, end, minutes, taskId='' }) {
      const cleanStart = parseHM(start);
      const cleanEnd = parseHM(end);
      if (!cleanStart || !cleanEnd || !title) return;
      const mins = Math.max(0, Math.round(Number.isFinite(Number(minutes)) ? Number(minutes) : minutesBetween(cleanStart, cleanEnd)));
      const focusId = id || uid('focus');
      state.focus.sessions.unshift({ id: focusId, date, title, category, note, start: cleanStart, end: cleanEnd, minutes: mins, taskId });
      const task = state.tasks.find(item => item.id === taskId);
      if (task) {
        getDayTimeBlocks(date).push({ id: uid('block'), taskId, start: cleanStart, end: cleanEnd, title, color: blockColorForTask(task) });
      }
    }
    function taskFocusMinutesOnDate(taskId, date=todayStr()) {
      return state.focus.sessions
        .filter(item => item.taskId === taskId && item.date === date)
        .reduce((sum, item) => sum + (Number(item.minutes) || 0), 0);
    }
    function addUniqueProgressLog(list, sourceTaskId, payload) {
      if (!Array.isArray(list) || !sourceTaskId) return false;
      if (list.some(item => item.sourceTaskId === sourceTaskId)) return false;
      list.unshift({ id: uid('plog'), sourceTaskId, at: nowDateTime(), ...payload });
      return true;
    }
    function thesisLogTypeForTask(task) {
      const text = `${task.title || ''} ${task.context || ''} ${task.note || ''}`;
      if (/实验|数据|样本|分析/.test(text)) return 'experiment';
      if (/改|修|润色|revision|返修/i.test(text)) return 'revise';
      if (/组会|讨论|meeting|导师/i.test(text)) return 'meeting';
      if (/写|章|论文|draft|chapter/i.test(text)) return 'writing';
      return 'other';
    }
    function submissionForCompletedTask(task, project) {
      const note = String(project?.note || '');
      if (note.startsWith('submission:')) return state.submissions.find(item => submissionProjectNote(item.id) === note) || null;
      if (note === 'module:submission') {
        return state.submissions.find(item => task.title.includes(item.title)) || null;
      }
      return null;
    }
    function recordProjectProgressFromTask(task) {
      const project = projectById(task.projectId);
      if (!project) return;
      project.logs = Array.isArray(project.logs) ? project.logs : [];
      const doneDate = dateFromDateTime(task.doneAt) || todayStr();
      const minutes = taskFocusMinutesOnDate(task.id, doneDate);
      const note = `任务完成：${task.title}`;
      addUniqueProgressLog(project.logs, task.id, {
        date: doneDate,
        type: '任务完成',
        minutes,
        note
      });
      project.updatedAt = nowDateTime();

      const projectNote = String(project.note || '');
      if (projectNote === 'module:thesis' || task.note === 'module:thesis') {
        state.thesis.logs = Array.isArray(state.thesis.logs) ? state.thesis.logs : [];
        addUniqueProgressLog(state.thesis.logs, task.id, {
          date: doneDate,
          type: thesisLogTypeForTask(task),
          minutes,
          words: 0,
          note: `${note}${project.title ? `（${project.title}）` : ''}`
        });
      }

      const submission = submissionForCompletedTask(task, project);
      if (submission) {
        submission.logs = Array.isArray(submission.logs) ? submission.logs : [];
        addUniqueProgressLog(submission.logs, task.id, {
          date: doneDate,
          type: '任务完成',
          minutes,
          note,
          stage: submission.stage
        });
        submission.updatedAt = nowDateTime();
        syncSubmissionProject(submission);
      }
    }
    function finishActiveFocusRunForTask(task) {
      const active = state.focus.active;
      if (active?.taskId === task.id) {
        recordFocusRun({
          id: active.id,
          date: active.date || todayStr(),
          title: active.title || task.title,
          category: active.category || 'research',
          note: active.note || '任务自动记录',
          start: active.start,
          end: nowTime(),
          minutes: Math.max(0, Math.round((Date.now() - active.startedAtTs) / 60000)),
          taskId: task.id
        });
        state.focus.active = null;
        return;
      }
      const startAt = task.startedAt || nowDateTime();
      const date = dateFromDateTime(startAt) || todayStr();
      recordFocusRun({
        date,
        title: task.title,
        category: 'research',
        note: '任务自动记录',
        start: String(startAt).slice(11, 16),
        end: nowTime(),
        taskId: task.id
      });
    }
    function stopAllActiveTaskRuns(exceptId='') {
      state.tasks.forEach(task => {
        if (task.status === 'active' && task.id !== exceptId) {
          finishActiveFocusRunForTask(task);
          task.status = 'todo';
        }
      });
      if (state.focus.active && state.focus.active.taskId !== exceptId) {
        const linked = state.tasks.find(task => task.id === state.focus.active.taskId);
        if (linked) linked.status = 'todo';
        stopFocus(false);
      }
    }
    function toggleTaskStart(id) {
      const task = state.tasks.find(item => item.id === id);
      if (!task) return;
      if (task.status === 'active') {
        finishActiveFocusRunForTask(task);
        task.status = 'todo';
        saveState(); renderAll();
        stopFocusTicker();
        return;
      }
      stopAllActiveTaskRuns(id);
      const startDateTime = nowDateTime();
      task.status = 'active';
      task.gtdBucket = task.gtdBucket === 'inbox' || task.gtdBucket === 'done' ? 'next' : task.gtdBucket;
      task.todayBucket = task.todayBucket || 'should';
      task.doneAt = '';
      task.startedAt = startDateTime;
      state.focus.active = {
        id: uid('focus'),
        title: task.title,
        category: 'research',
        note: '任务自动记录',
        date: todayStr(),
        start: nowTime(),
        startedAtTs: Date.now(),
        taskId: task.id
      };
      saveState(); renderAll();
      startFocusTicker();
    }
    function finishTask(id) {
      const task = state.tasks.find(item => item.id === id);
      if (!task) return;
      if (task.status === 'done') return;
      if (task.status === 'active') finishActiveFocusRunForTask(task);
      task.status = 'done';
      task.gtdBucket = 'done';
      task.todayBucket = '';
      task.doneAt = nowDateTime();
      recordProjectProgressFromTask(task);
      saveState(); renderAll();
      stopFocusTicker();
    }
    function deleteTask(id) { state.tasks = state.tasks.filter(task => task.id !== id); saveState(); renderAll(); }
    function updateTaskField(id, patch = {}) {
      const task = state.tasks.find(item => item.id === id);
      if (!task) return;
      Object.assign(task, patch);
      if (task.status === 'done') {
        task.gtdBucket = 'done';
        task.todayBucket = '';
      } else if (task.gtdBucket === 'done') {
        task.gtdBucket = 'next';
      }
      saveState();
      renderAll();
    }
    function setTaskBucket(id, bucket) {
      if (bucket === 'done') return finishTask(id);
      const task = state.tasks.find(item => item.id === id);
      if (!task) return;
      task.gtdBucket = GTD_BUCKETS.some(opt => opt.value === bucket) ? bucket : task.gtdBucket;
      if (task.status === 'done') {
        task.status = 'todo';
        task.doneAt = '';
      }
      saveState();
      renderAll();
    }
    function setTaskQuadrant(id, quadrant) { updateTaskField(id, { quadrant: taskQuadrantMeta(quadrant).value }); }
    function setTaskTodayBucket(id, bucket) { updateTaskField(id, { todayBucket: todayBucketMeta(bucket).value }); }
    function setTaskProject(id, projectId) { updateTaskField(id, { projectId }); }

    function todayExecutionTasks(date=todayStr()) {
      const rank = { active:0, todo:1, planned:2, done:3 };
      const todayRank = { must:0, should:1, could:2, '':3 };
      return state.tasks
        .filter(task => {
          const doneDate = dateFromDateTime(task.doneAt);
          if (task.status === 'done') return doneDate === date;
          return task.status === 'active'
            || !!task.todayBucket
            || task.dueDate === date
            || dateFromDateTime(task.createdAt) === date;
        })
        .sort((a, b) => {
          const statusDiff = (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
          if (statusDiff) return statusDiff;
          const todayDiff = (todayRank[a.todayBucket || ''] ?? 9) - (todayRank[b.todayBucket || ''] ?? 9);
          if (todayDiff) return todayDiff;
          return (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99')
            || (b.startedAt || b.createdAt || '').localeCompare(a.startedAt || a.createdAt || '');
        });
    }

    function renderTasks() {
      const activeCount = state.tasks.filter(t=>t.status==='active').length;
      $('activeTaskBadge').textContent = `进行中 ${activeCount}`;
      const todayTasks = todayExecutionTasks();
      const doneToday = todayTasks.filter(task => task.status === 'done').length;
      const openToday = todayTasks.length - doneToday;
      const taskLinkedFocus = state.focus.sessions.filter(item => item.date === todayStr() && item.taskId);
      const taskLinkedBlocks = (state.timeBlocks?.[todayStr()] || []).filter(item => item.taskId);
      const taskLinkedMinutes = taskLinkedFocus.reduce((sum, item) => sum + (Number(item.minutes) || 0), 0);
      $('taskNowPane').innerHTML = todayTasks.length
        ? `今日 ${todayTasks.length} 项 · 待完成 ${openToday} 项 · 已完成 ${doneToday} 项${activeCount ? ` · 进行中 ${activeCount} 项` : ''}`
        : '暂无今日任务。可以新增临时任务，或在项目看板把任务交给今天。';
      if ($('taskAutoLogPane')) {
        $('taskAutoLogPane').textContent = `自动记录：任务专注 ${taskLinkedFocus.length} 次 / ${formatMinutes(taskLinkedMinutes)}，已生成日程时间块 ${taskLinkedBlocks.length} 个。`;
      }
      const list = todayTasks.map(task => {
        const bucket = taskBucketMeta(task.gtdBucket);
        const project = projectById(task.projectId);
        const today = todayBucketMeta(task.todayBucket);
        const sessions = state.focus.sessions.filter(item => item.taskId === task.id && item.date === todayStr());
        const sessionMinutes = sessions.reduce((sum, item) => sum + (Number(item.minutes) || 0), 0);
        const isDone = task.status === 'done';
        const isActive = task.status === 'active';
        return `
          <div class="rounded-2xl border border-calm-line bg-white p-3 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="font-bold ${isDone ? 'line-through text-calm-mute' : ''}">${escapeHtml(task.title)}</div>
              <div class="text-xs text-calm-mute mt-1 flex flex-wrap gap-2">
                <span>${escapeHtml(isDone ? '已完成' : isActive ? '进行中' : task.status === 'planned' ? '计划中' : '待开始')}</span>
                <span>·</span>
                <span>${escapeHtml(today.value ? today.label : bucket.label)}</span>
                ${project ? `<span>· ${escapeHtml(project.title)}</span>` : ''}
                ${task.dueDate ? `<span>· 截止 ${escapeHtml(task.dueDate)}</span>` : ''}
                ${isActive ? `<span>· 开始于 ${escapeHtml(task.startedAt || '')}</span>` : ''}
                ${sessions.length ? `<span>· 今日专注 ${sessions.length} 次 / ${formatMinutes(sessionMinutes)}</span>` : ''}
              </div>
            </div>
            <div class="flex gap-2 shrink-0">
              ${isDone ? '' : `<button class="px-2 py-1 rounded-xl text-xs font-bold bg-pink-50 text-dopamine-pink" data-task-start="${task.id}">${isActive ? '结束' : '开始'}</button>`}
              ${isDone ? '' : `<button class="px-2 py-1 rounded-xl text-xs font-bold bg-green-50 text-green-600" data-task-done="${task.id}">完成</button>`}
              <button class="px-2 py-1 rounded-xl text-xs font-bold bg-gray-100 text-calm-mute" data-task-edit="${task.id}">修改</button>
            </div>
          </div>`;
      }).join('');
      $('taskList').innerHTML = list || '<div class="text-sm text-calm-mute">还没有今日任务，先新增一条吧。</div>';
      $('taskList').querySelectorAll('[data-task-start]').forEach(btn => btn.onclick = () => toggleTaskStart(btn.dataset.taskStart));
      $('taskList').querySelectorAll('[data-task-done]').forEach(btn => btn.onclick = () => finishTask(btn.dataset.taskDone));
      $('taskList').querySelectorAll('[data-task-edit]').forEach(btn => btn.onclick = () => openTaskEditor(btn.dataset.taskEdit));
    }

    function startFocusTicker() {
      stopFocusTicker();
      focusInterval = setInterval(renderFocusTimer, 1000);
      renderFocusTimer();
    }
    function stopFocusTicker() { if (focusInterval) { clearInterval(focusInterval); focusInterval = null; } }
    function renderFocusTimer() {
      const active = state.focus.active;
      if (!active) {
        $('focusClock').textContent = '00:00:00';
        $('focusStatusPill').textContent = '未开始';
        return;
      }
      const elapsed = Math.max(0, Math.floor((Date.now() - active.startedAtTs) / 1000));
      const h = Math.floor(elapsed/3600), m = Math.floor((elapsed%3600)/60), s = elapsed%60;
      $('focusClock').textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
      $('focusStatusPill').textContent = '进行中';
    }
    function startFocus() {
      if (state.focus.active) { alert('已经有进行中的专注了。'); return; }
      const linkedTask = activeTask();
      const title = $('focusTitle').value.trim() || linkedTask?.title || '未命名专注';
      state.focus.active = {
        id: uid('focus'),
        title,
        category: $('focusCategory').value,
        note: $('focusNote').value.trim(),
        date: todayStr(),
        start: nowTime(),
        startedAtTs: Date.now(),
        taskId: linkedTask?.id || null
      };
      saveState(); renderAll();
      startFocusTicker();
    }
    function stopFocus(shouldRender=true) {
      const active = state.focus.active;
      if (!active) return;
      const end = nowTime();
      const mins = Math.max(0, Math.round((Date.now() - active.startedAtTs) / 60000));
      recordFocusRun({ id: active.id, date: active.date, title: active.title, category: active.category, note: active.note, start: active.start, end, minutes: mins, taskId: active.taskId || '' });
      const linkedTask = state.tasks.find(task => task.id === active.taskId);
      if (linkedTask && linkedTask.status === 'active') linkedTask.status = 'todo';
      state.focus.active = null;
      saveState();
      if (shouldRender) renderAll();
      stopFocusTicker();
    }
    function discardFocus() {
      const active = state.focus.active;
      const linkedTask = state.tasks.find(task => task.id === active?.taskId);
      if (linkedTask && linkedTask.status === 'active') linkedTask.status = 'todo';
      state.focus.active = null;
      saveState(); renderAll();
      stopFocusTicker();
    }
    function addManualFocus() {
      const date = $('manualFocusDate').value || todayStr();
      const title = $('manualFocusTitle').value.trim();
      const start = parseHM($('manualFocusStart').value);
      const end = parseHM($('manualFocusEnd').value);
      if (!title || !start || !end) { alert('请至少填写日期、主题、开始和结束时间。'); return; }
      state.focus.sessions.unshift({ id:uid('focus'), date, title, category:'other', note:'手动补录', start, end, minutes:minutesBetween(start,end) });
      $('manualFocusTitle').value = '';
      saveState(); renderAll();
    }
    function renderFocusTimeline() {
      renderFocusTimer();
      const todaySessions = state.focus.sessions.filter(s => s.date === todayStr());
      $('focusTodaySummary').textContent = `今日 ${formatMinutes(focusMinutesOn())}`;
      $('focusTimeline').innerHTML = todaySessions.map(item => `
        <div class="rounded-2xl border border-calm-line bg-white p-3 flex items-start justify-between gap-3">
          <div>
            <div class="font-bold">${escapeHtml(item.title)}</div>
            <div class="text-xs text-calm-mute mt-1">${item.start} - ${item.end} · ${formatMinutes(item.minutes)}</div>
          </div>
          <button class="text-sm font-bold text-dopamine-orange" data-focus-edit="${item.id}">修改</button>
        </div>
      `).join('') || '<div class="text-sm text-calm-mute">今天还没有专注记录。</div>';
      $('focusTimeline').querySelectorAll('[data-focus-edit]').forEach(btn => btn.onclick = () => openFocusEditor(btn.dataset.focusEdit));
      if (state.focus.active) startFocusTicker(); else stopFocusTicker();
    }

    function schedulePlannerTasks() {
      return todayExecutionTasks().filter(task => task.status !== 'done');
    }
    function renderSchedulePlanner() {
      const select = $('scheduleTaskSelect');
      if (!select) return;
      const date = $('scheduleDate').value || todayStr();
      const blocks = sortByTime(getDayTimeBlocks(date));
      const tasks = schedulePlannerTasks();
      const selected = select.value;
      select.innerHTML = '<option value="">从今日执行选择</option>' + tasks.map(task => {
        const project = projectById(task.projectId);
        const today = todayBucketMeta(task.todayBucket);
        const label = `${today.short} · ${project ? `${project.title} / ` : ''}${task.title}${task.estimate ? ` · ${task.estimate}分钟` : ''}`;
        return `<option value="${task.id}" ${task.id===selected?'selected':''}>${escapeHtml(label)}</option>`;
      }).join('');
      if (selected && !tasks.some(task => task.id === selected)) select.value = '';
      const scheduledMinutes = blocks.reduce((sum, item) => sum + minutesBetween(item.start, item.end), 0);
      $('schedulePlanSummary').textContent = `${blocks.length} 个时间块 · ${formatMinutes(scheduledMinutes)}`;
    }
    function addScheduledTaskBlock() {
      const date = $('scheduleDate').value || todayStr();
      const task = state.tasks.find(item => item.id === $('scheduleTaskSelect').value);
      const start = parseHM($('scheduleTaskStart').value);
      let end = parseHM($('scheduleTaskEnd').value);
      const title = $('scheduleTaskTitle').value.trim() || task?.title || '';
      if (start && !end && task?.estimate) end = addMinutesToHM(start, task.estimate);
      if (!start || !end || !title) { alert('请选择任务或填写标题，并设置开始 / 结束时间。'); return; }
      getDayTimeBlocks(date).push({
        id: uid('block'),
        taskId: task?.id || '',
        start,
        end,
        title,
        color: task ? blockColorForTask(task) : '#4D9DE0'
      });
      if (task) {
        if (!task.todayBucket) task.todayBucket = 'should';
        if (task.gtdBucket === 'inbox') task.gtdBucket = 'next';
      }
      $('scheduleTaskTitle').value = '';
      saveState();
      renderAll();
    }
    function renderTimeline() {
      const date = $('scheduleDate').value || todayStr();
      const blocks = sortByTime(getDayTimeBlocks(date));
      const startMinute = 6 * 60; const endMinute = 24 * 60; const hourHeight = 72;
      const hourLines = [];
      for (let hour = 6; hour < 24; hour++) {
        hourLines.push(`<div class="timeline-hour"><div class="timeline-hour-label">${pad(hour)}:00</div></div>`);
      }
      const events = blocks.map(block => {
        let top = ((hmToMinutes(block.start) - startMinute) / 60) * hourHeight;
        let height = Math.max(32, minutesBetween(block.start, block.end) / 60 * hourHeight);
        if (top < 0) top = 0;
        const bg = block.color || '#4D9DE0';
        return `<div class="timeline-event" style="top:${top}px;height:${height}px;background:${bg};" data-block-edit="${block.id}"><div class="font-black truncate">${escapeHtml(block.title)}</div><div class="text-xs opacity-90">${block.start} - ${block.end}</div></div>`;
      }).join('');
      $('timelineContainer').innerHTML = `${hourLines.join('')}<div class="absolute inset-0">${events}</div>`;
      $('timelineContainer').querySelectorAll('[data-block-edit]').forEach(el => el.onclick = () => openBlockEditor(el.dataset.blockEdit, date));
    }

    function addWorkflowProject() {
      const title = $('workflowProjectTitle').value.trim();
      if (!title) { alert('请填写项目名。'); return; }
      state.projects.unshift(normalizeProjectItem({
        id: uid('proj'),
        title,
        outcome: $('workflowProjectOutcome').value.trim(),
        area: $('workflowProjectArea').value,
        status: 'active',
        startDate: $('workflowProjectStartDate')?.value || todayStr(),
        deadline: $('workflowProjectDeadline').value || '',
        createdAt: nowDateTime(),
        updatedAt: nowDateTime()
      }));
      $('workflowProjectTitle').value = '';
      $('workflowProjectOutcome').value = '';
      if ($('workflowProjectStartDate')) $('workflowProjectStartDate').value = todayStr();
      $('workflowProjectDeadline').value = '';
      saveState();
      renderAll();
    }

    function addWorkflowCaptureTask() {
      const title = $('workflowCaptureText').value.trim();
      if (!title) { alert('请先填写任务名称。'); return; }
      const projectId = $('workflowCaptureProject')?.value || workflowSelectedProjectId || '';
      const estimate = Math.max(0, Number($('workflowCaptureEstimate')?.value) || 25);
      const status = taskStatusMeta($('workflowCaptureStatus')?.value).value;
      createTask({
        title,
        projectId,
        status,
        gtdBucket: status === 'done' ? 'done' : (projectId ? 'next' : 'inbox'),
        quadrant: $('workflowCaptureQuadrant')?.value || 'q2',
        todayBucket: '',
        dueDate: $('workflowCaptureDue')?.value || '',
        estimate,
        startedAt: status === 'active' ? nowDateTime() : '',
        doneAt: status === 'done' ? nowDateTime() : ''
      });
      $('workflowCaptureText').value = '';
      if ($('workflowCaptureDue')) $('workflowCaptureDue').value = '';
      if ($('workflowCaptureEstimate')) $('workflowCaptureEstimate').value = '25';
      if ($('workflowCaptureQuadrant')) $('workflowCaptureQuadrant').value = 'q2';
      if ($('workflowCaptureStatus')) $('workflowCaptureStatus').value = 'planned';
      if ($('workflowCaptureProject')) $('workflowCaptureProject').value = workflowSelectedProjectId || '';
      saveState();
      renderAll();
    }

    function nearestSubmissionDeadline() {
      return state.submissions
        .filter(item => !['已接收','已见刊/已收录','搁置/拒稿'].includes(item.stage) && item.deadline)
        .sort((a, b) => a.deadline.localeCompare(b.deadline))[0]?.deadline || '';
    }
    function workflowModuleProjectConfig(source) {
      const today = todayStr();
      if (source === 'thesis') {
        const openMilestone = (state.thesis?.milestones || []).filter(item => !item.done).sort((a, b) => (a.due || '9999-99-99').localeCompare(b.due || '9999-99-99'))[0];
        return {
          title: '本科毕业论文推进',
          outcome: `把毕业论文推进到可答辩版本（当前总体进度 ${thesisOverallProgress()}%）`,
          area: 'writing',
          deadline: state.thesis?.meta?.targetDate || openMilestone?.due || '',
          note: 'module:thesis',
          taskTitle: openMilestone ? `推进论文里程碑：${openMilestone.name}` : '推进论文：更新章节或补一条推进日志',
          taskDue: openMilestone?.due || state.thesis?.meta?.targetDate || ''
        };
      }
      if (source === 'submission') {
        const active = state.submissions.filter(item => !['已接收','已见刊/已收录','搁置/拒稿'].includes(item.stage));
        const next = active.filter(item => item.deadline).sort((a, b) => a.deadline.localeCompare(b.deadline))[0] || active[0];
        return {
          title: '投稿与发表管线',
          outcome: `推进 ${active.length} 个进行中投稿，优先处理临近截止与返修`,
          area: 'writing',
          deadline: nearestSubmissionDeadline(),
          note: 'module:submission',
          taskTitle: next ? `推进投稿：${next.title}` : '检查投稿管线：补充下一步动作',
          taskDue: next?.deadline || ''
        };
      }
      const pending = mentorPendingItems(today);
      const next = pending[0];
      return {
        title: '导师沟通与承诺跟进',
        outcome: `记录导师说过的话、跟进 ${pending.length} 条未落实承诺，避免计划漂移`,
        area: 'writing',
        deadline: next?.entry?.followupDate || '',
        note: 'module:mentor',
        taskTitle: next ? `跟进导师承诺：${next.entry.commitment.slice(0, 32)}` : '整理导师沟通记录并确认下一步',
        taskDue: next?.entry?.followupDate || ''
      };
    }
    function ensureWorkflowModuleProject(source, shouldRender=true) {
      const config = workflowModuleProjectConfig(source);
      let project = state.projects.find(item => item.note === config.note || item.title === config.title);
      if (project) {
        project.outcome = config.outcome;
        project.area = config.area;
        project.deadline = config.deadline;
        project.note = config.note;
        if (project.status === 'done') project.status = 'active';
        project.updatedAt = nowDateTime();
      } else {
        project = normalizeProjectItem({
          id: uid('proj'),
          title: config.title,
          outcome: config.outcome,
          area: config.area,
          status: 'active',
          deadline: config.deadline,
          note: config.note,
          createdAt: nowDateTime(),
          updatedAt: nowDateTime()
        });
        state.projects.unshift(project);
      }
      if (shouldRender) { saveState(); renderAll(); }
      return project;
    }
    function createWorkflowModuleTask(source) {
      const config = workflowModuleProjectConfig(source);
      const project = ensureWorkflowModuleProject(source, false);
      createTask({
        title: config.taskTitle,
        projectId: project.id,
        gtdBucket: 'next',
        quadrant: 'q2',
        todayBucket: 'should',
        dueDate: config.taskDue,
        estimate: 30,
        context: source === 'mentor' ? '沟通' : source === 'submission' ? '投稿' : '论文',
        note: config.note
      });
      saveState();
      renderAll();
    }
    function renderWorkflowModuleLinks(date=todayStr()) {
      return;
    }

    function renderWorkflow() {
      const date = $('workflowDate').value || todayStr();
      syncAllSubmissionProjects();
      const allTasks = state.tasks.filter(task => !window.isLegacyRoutineTask?.(task));
      const allProjects = [...state.projects];
      if (workflowSelectedProjectId && !projectById(workflowSelectedProjectId)) workflowSelectedProjectId = '';

      const openTasks = allTasks.filter(taskOpen);
      const activeProjects = allProjects.filter(item => item.status === 'active').length;
      const unlinkedTasks = openTasks.filter(item => !item.projectId || item.gtdBucket === 'inbox');
      const nextTasks = openTasks.filter(item => item.gtdBucket === 'next');
      const waitingTasks = openTasks.filter(item => item.gtdBucket === 'waiting');
      const mustTasks = openTasks.filter(item => item.todayBucket === 'must');
      const shouldTasks = openTasks.filter(item => item.todayBucket === 'should');
      const couldTasks = openTasks.filter(item => item.todayBucket === 'could');
      const dueSoonTasks = openTasks.filter(item => item.dueDate && diffDays(date, item.dueDate) >= 0 && diffDays(date, item.dueDate) <= 7);
      const doneTasks = allTasks.filter(item => item.status === 'done');

      $('workflowStats').innerHTML = [
        { label:'项目总数', value: allProjects.length, color:'text-dopamine-purple', note:'长期目标池' },
        { label:'进行中项目', value: activeProjects, color:'text-dopamine-mint', note:'当前需要推进' },
        { label:'任务总数', value: allTasks.length, color:'text-dopamine-sky', note:'全部任务记录' },
        { label:'未完成任务', value: openTasks.length, color:'text-dopamine-pink', note:'计划中 / 没开始 / 进行中' },
        { label:'7 天内到期', value: dueSoonTasks.length, color:'text-dopamine-yellow', note:'需要提前安排' },
        { label:'未归项目', value: unlinkedTasks.length, color:'text-dopamine-orange', note:'需要归档清理' }
      ].map(item => `
        <div class="workflow-metric-card p-4">
          <div class="text-sm text-calm-mute">${item.label}</div>
          <div class="text-3xl font-black mt-1 ${item.color}">${escapeHtml(String(item.value))}</div>
          <div class="text-xs text-calm-mute mt-2">${escapeHtml(item.note)}</div>
        </div>
      `).join('');

      const projectDueSoon = [...allProjects]
        .filter(item => item.status !== 'done' && item.deadline)
        .sort((a, b) => a.deadline.localeCompare(b.deadline))
        .slice(0, 3);
      $('workflowInsightCards').innerHTML = [
        {
          tone:'from-purple-50 to-white border-purple-100',
          icon:'fa-folder-open',
          color:'text-dopamine-purple',
          title:'项目层',
          lines:[`进行中 ${activeProjects} 个`, `已完成 ${allProjects.filter(item => item.status === 'done').length} 个`, `暂停 ${allProjects.filter(item => item.status === 'paused').length} 个`]
        },
        {
          tone:'from-amber-50 to-white border-amber-100',
          icon:'fa-clock',
          color:'text-dopamine-orange',
          title:'近期截止',
          lines: projectDueSoon.length ? projectDueSoon.map(item => `${item.title} · ${item.deadline}`) : ['暂无设置截止日期的项目']
        },
        {
          tone:'from-sky-50 to-white border-sky-100',
          icon:'fa-list-check',
          color:'text-dopamine-sky',
          title:'任务层',
          lines:[`下一步 ${nextTasks.length} 项`, `等待反馈 ${waitingTasks.length} 项`, `已完成 ${doneTasks.length} 项`]
        }
      ].map(card => `
        <div class="rounded-2xl border bg-gradient-to-r ${card.tone} p-4">
          <div class="font-black flex items-center gap-2 ${card.color}"><i class="fa-solid ${card.icon}"></i> ${escapeHtml(card.title)}</div>
          <div class="text-sm text-calm-mute mt-3 leading-6">${card.lines.map(line => escapeHtml(line)).join('<br>')}</div>
        </div>
      `).join('');

      const quadrantStats = QUADRANT_OPTIONS.map(opt => ({
        label: opt.short,
        value: openTasks.filter(item => item.quadrant === opt.value).length,
        color: opt.color,
        note: opt.label
      }));
      const todayStats = [
        { label:'今日必做', value: mustTasks.length, color:'bg-rose-100 text-rose-700', note:'Must' },
        { label:'今日应该', value: shouldTasks.length + couldTasks.length, color:'bg-amber-100 text-amber-700', note:'Should / Could' }
      ];
      $('workflowQuadrantSummary').innerHTML = [...quadrantStats, ...todayStats].map(item => `
        <div class="workflow-kpi-strip p-3">
          <div class="flex items-center justify-between gap-2">
            <span class="workflow-tag ${item.color}">${escapeHtml(item.label)}</span>
            <span class="text-xl font-black">${escapeHtml(String(item.value))}</span>
          </div>
          <div class="text-xs text-calm-mute mt-2">${escapeHtml(item.note)}</div>
        </div>
      `).join('');

      $('workflowProjectBadge').textContent = `${allProjects.length} 个`;
      if ($('workflowCaptureProject')) {
        const current = $('workflowCaptureProject').value;
        $('workflowCaptureProject').innerHTML = '<option value="">选择所属项目</option>' + allProjects.map(project => `<option value="${project.id}">${escapeHtml(project.title)}</option>`).join('');
        $('workflowCaptureProject').value = allProjects.some(project => project.id === current) ? current : (workflowSelectedProjectId || '');
      }
      if ($('workflowProjectFilterSelect')) {
        $('workflowProjectFilterSelect').innerHTML = '<option value="">全部项目</option>' + allProjects.map(project => `<option value="${project.id}">${escapeHtml(project.title)}</option>`).join('');
        $('workflowProjectFilterSelect').value = workflowSelectedProjectId || '';
      }

      const sortedProjects = [...allProjects].sort((a, b) => {
        const order = { active:0, paused:1, done:2 };
        return (order[a.status] ?? 9) - (order[b.status] ?? 9) || (a.deadline || '9999-99-99').localeCompare(b.deadline || '9999-99-99');
      });
      function projectProgress(project) {
        const tasks = tasksForProject(project.id);
        const openCount = tasks.filter(taskOpen).length;
        const doneCount = tasks.filter(item => item.status === 'done').length;
        return Math.round(doneCount / Math.max(1, openCount + doneCount) * 100);
      }
      function projectRemainingLabel(project) {
        if (project.status === 'done') return { text:'已完成', tone:'text-emerald-600' };
        if (!project.deadline) return { text:'未设截止', tone:'text-calm-mute' };
        const days = diffDays(date, project.deadline);
        if (Number.isNaN(days)) return { text:'日期异常', tone:'text-calm-mute' };
        if (days < 0) return { text:`逾期 ${Math.abs(days)} 天`, tone:'text-rose-600 font-bold' };
        if (days === 0) return { text:'今日到期', tone:'text-dopamine-orange font-bold' };
        return { text:`剩 ${days} 天`, tone:days <= 7 ? 'text-dopamine-orange font-bold' : 'text-calm-mute' };
      }
      function renderProjectRows(projects) {
        if (!projects.length) return '<div class="px-4 py-5 text-sm text-calm-mute">暂无项目。</div>';
        return projects.map(project => {
          const area = projectAreaMeta(project.area);
          const status = projectStatusMeta(project.status);
          const tasks = tasksForProject(project.id);
          const openCount = tasks.filter(taskOpen).length;
          const doneCount = tasks.filter(item => item.status === 'done').length;
          const logCount = Array.isArray(project.logs) ? project.logs.length : 0;
          const progress = projectProgress(project);
          const startDate = project.startDate || dateFromDateTime(project.createdAt) || '—';
          const remaining = projectRemainingLabel(project);
          const statusTone = project.status === 'done' ? 'bg-emerald-100 text-emerald-700' : project.status === 'paused' ? 'bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-700';
          const activeClass = workflowSelectedProjectId === project.id ? 'bg-sky-50' : 'bg-white';
          return `
            <div class="grid grid-cols-[minmax(220px,1.4fr)_140px_minmax(200px,1.2fr)_110px_150px_120px_120px_120px_90px] gap-3 px-4 py-3 border-t border-calm-line items-center text-sm hover:bg-calm-bg/70 ${activeClass}" data-workflow-focus-project="${project.id}">
              <div class="min-w-0">
                <div class="font-bold truncate">${escapeHtml(project.title)}</div>
                <div class="text-xs text-calm-mute mt-1">任务 ${tasks.length} · 未完成 ${openCount} · 已完成 ${doneCount} · 日志 ${logCount}</div>
              </div>
              <div class="text-calm-mute">${escapeHtml(area.label)}</div>
              <div class="min-w-0 text-calm-mute truncate" title="${escapeHtml(project.outcome || '')}">${escapeHtml(project.outcome || '未填写完成结果')}</div>
              <span class="workflow-tag ${statusTone} justify-self-start">${escapeHtml(status.label)}</span>
              <div>
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden"><div class="h-full bg-dopamine-purple" style="width:${progress}%"></div></div>
                  <span class="text-xs font-black text-calm-mute">${progress}%</span>
                </div>
              </div>
              <div class="text-calm-mute">${project.deadline ? escapeHtml(project.deadline) : '—'}</div>
              <div class="text-calm-mute">${escapeHtml(startDate)}</div>
              <div class="${remaining.tone}">${escapeHtml(remaining.text)}</div>
              <div class="text-right"><button class="text-xs font-bold text-dopamine-orange" data-project-edit="${project.id}">修改</button></div>
            </div>`;
        }).join('');
      }
      const projectGroups = PROJECT_AREAS.map(area => ({ ...area, items: sortedProjects.filter(project => project.area === area.value) }))
        .filter(group => group.items.length);
      $('workflowProjectList').innerHTML = projectGroups.map(group => `
        <details class="rounded-2xl border border-calm-line bg-white overflow-hidden" open>
          <summary class="cursor-pointer select-none px-4 py-3 bg-calm-bg font-black flex items-center justify-between gap-3">
            <span>${escapeHtml(group.label)}</span>
            <span class="pill bg-white border border-calm-line text-calm-mute">${group.items.length} 个</span>
          </summary>
          <div class="overflow-auto scroll-thin">
            <div class="min-w-[1320px]">
              <div class="grid grid-cols-[minmax(220px,1.4fr)_140px_minmax(200px,1.2fr)_110px_150px_120px_120px_120px_90px] gap-3 px-4 py-3 text-xs font-black tracking-wide text-calm-mute bg-white">
                <div>项目名称</div>
                <div>项目分类</div>
                <div>完成结果</div>
                <div>状态</div>
                <div>进度</div>
                <div>截止日期</div>
                <div>开始日期</div>
                <div>剩余日期</div>
                <div class="text-right">操作</div>
              </div>
              ${renderProjectRows(group.items)}
            </div>
          </div>
        </details>`).join('') || '<div class="text-sm text-calm-mute">还没有项目。先创建一个需要多个动作才能完成的长期目标。</div>';

      const filter = $('workflowTaskFilter').value || 'all';
      const scopedTasks = workflowSelectedProjectId ? allTasks.filter(item => item.projectId === workflowSelectedProjectId) : allTasks;
      const filteredTasks = scopedTasks.filter(task => {
        if (filter === 'today') return !!task.todayBucket && task.status !== 'done';
        if (QUADRANT_OPTIONS.some(opt => opt.value === filter)) return task.quadrant === filter;
        return true;
      }).sort((a, b) => {
        const statusOrder = { planned:0, todo:1, active:2, done:3 };
        return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)
          || (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99')
          || (b.createdAt || '').localeCompare(a.createdAt || '');
      });

      function taskCompletion(task) {
        return taskStatusMeta(task.status).progress;
      }
      function compactDateTime(ts) {
        return ts ? escapeHtml(String(ts).slice(0, 16)) : '—';
      }
      function renderTaskRows(items) {
        if (!items.length) return '<div class="px-4 py-6 text-sm text-calm-mute border-t border-calm-line">这一组暂无任务。</div>';
        return items.map(task => {
          const project = projectById(task.projectId);
          const quadrant = taskQuadrantMeta(task.quadrant);
          const today = todayBucketMeta(task.todayBucket);
          const completion = taskCompletion(task);
          return `
            <div class="grid grid-cols-[minmax(220px,1.3fr)_minmax(160px,1fr)_150px_120px_120px_140px_150px_150px_120px] gap-3 px-4 py-3 border-t border-calm-line items-center text-sm hover:bg-calm-bg/70">
              <div class="min-w-0">
                <div class="font-bold truncate ${task.status === 'done' ? 'line-through text-calm-mute' : ''}">${escapeHtml(task.title)}</div>
                <div class="text-xs text-calm-mute mt-1">${task.estimate ? `预计 ${task.estimate} 分钟` : '未设置预计时长'}</div>
              </div>
              <div class="truncate text-calm-mute">${escapeHtml(project?.title || '未关联项目')}</div>
              <span class="workflow-tag ${quadrant.color} justify-self-start">${escapeHtml(quadrant.label)}</span>
              <select class="px-3 py-2 rounded-xl border border-calm-line bg-white text-sm" data-workflow-status="${task.id}">
                ${TASK_STATUS_OPTIONS.map(opt => `<option value="${opt.value}" ${task.status === opt.value ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`).join('')}
              </select>
              <div class="text-calm-mute">${task.dueDate ? escapeHtml(task.dueDate) : '—'}</div>
              <div class="text-calm-mute">${compactDateTime(task.startedAt)}</div>
              <div>
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden"><div class="h-full bg-dopamine-mint" style="width:${completion}%"></div></div>
                  <span class="text-xs font-black text-calm-mute">${completion}%</span>
                </div>
              </div>
              <div>
                <select class="w-full px-3 py-2 rounded-xl border border-calm-line bg-white text-sm" data-workflow-today-toggle="${task.id}" ${task.status === 'done' ? 'disabled' : ''}>
                  <option value="" ${task.todayBucket ? '' : 'selected'}>否</option>
                  <option value="should" ${task.todayBucket ? 'selected' : ''}>是</option>
                </select>
                <div class="text-[11px] text-calm-mute mt-1">${task.status === 'done' ? '已完成不加入' : today.value ? escapeHtml(today.label) : '不进入今日执行'}</div>
              </div>
              <div class="flex gap-2 justify-end">
                ${task.status === 'done' ? '' : `<button class="text-xs font-bold text-dopamine-pink" data-workflow-start="${task.id}">${task.status === 'active' ? '结束' : '开始'}</button>`}
                ${task.status === 'done' ? '' : `<button class="text-xs font-bold text-green-600" data-workflow-done="${task.id}">完成</button>`}
                <button class="text-xs font-bold text-dopamine-orange" data-workflow-edit="${task.id}">修改</button>
              </div>
            </div>`;
        }).join('');
      }
      const taskGroups = TASK_STATUS_OPTIONS.map(status => ({
        ...status,
        items: filteredTasks.filter(task => task.status === status.value)
      }));
      $('workflowTaskTable').innerHTML = taskGroups.map(group => `
        <details class="border-t border-calm-line first:border-t-0" open>
          <summary class="cursor-pointer select-none px-4 py-3 bg-calm-bg font-black flex items-center justify-between gap-3">
            <span class="flex items-center gap-2"><span class="workflow-tag ${group.color}">${escapeHtml(group.label)}</span><span>任务</span></span>
            <span class="pill bg-white border border-calm-line text-calm-mute">${group.items.length} 项</span>
          </summary>
          <div class="overflow-auto scroll-thin">
            <div class="min-w-[1440px]">
              <div class="grid grid-cols-[minmax(220px,1.3fr)_minmax(160px,1fr)_150px_120px_120px_140px_150px_150px_120px] gap-3 px-4 py-3 text-xs font-black tracking-wide text-calm-mute bg-white">
                <div>任务名称</div>
                <div>所属项目</div>
                <div>紧急程度（4 象限）</div>
                <div>状态</div>
                <div>到期时间</div>
                <div>开始时间</div>
                <div>完成度</div>
                <div>加入今日执行</div>
                <div class="text-right">操作</div>
              </div>
              ${renderTaskRows(group.items)}
            </div>
          </div>
        </details>`).join('');

      $('workflowProjectList').querySelectorAll('[data-workflow-focus-project]').forEach(card => card.onclick = (event) => {
        if (event.target.closest('button')) return;
        workflowSelectedProjectId = card.dataset.workflowFocusProject;
        if ($('workflowProjectFilterSelect')) $('workflowProjectFilterSelect').value = workflowSelectedProjectId;
        renderWorkflow();
      });
      $('workflowProjectList').querySelectorAll('[data-project-edit]').forEach(btn => btn.onclick = () => openProjectEditor(btn.dataset.projectEdit));
      if ($('workflowProjectFilterSelect')) {
        $('workflowProjectFilterSelect').onchange = () => {
          workflowSelectedProjectId = $('workflowProjectFilterSelect').value || '';
          renderWorkflow();
        };
      }
      $('workflowTaskTable').querySelectorAll('[data-workflow-start]').forEach(btn => btn.onclick = () => toggleTaskStart(btn.dataset.workflowStart));
      $('workflowTaskTable').querySelectorAll('[data-workflow-done]').forEach(btn => btn.onclick = () => finishTask(btn.dataset.workflowDone));
      $('workflowTaskTable').querySelectorAll('[data-workflow-edit]').forEach(btn => btn.onclick = () => openTaskEditor(btn.dataset.workflowEdit));
      $('workflowTaskTable').querySelectorAll('[data-workflow-today-toggle]').forEach(select => select.onchange = () => {
        setTaskTodayBucket(select.dataset.workflowTodayToggle, select.value ? 'should' : '');
      });
      $('workflowTaskTable').querySelectorAll('[data-workflow-status]').forEach(select => select.onchange = () => {
        const task = state.tasks.find(item => item.id === select.dataset.workflowStatus);
        if (!task) return;
        const nextStatus = taskStatusMeta(select.value).value;
        if (nextStatus === 'done') return finishTask(task.id);
        updateTaskField(task.id, {
          status: nextStatus,
          gtdBucket: task.gtdBucket === 'done' ? 'next' : task.gtdBucket,
          doneAt: '',
          startedAt: nextStatus === 'active' ? (task.startedAt || nowDateTime()) : task.startedAt
        });
      });
    }

    function habitModeLabel(mode) {
      return ({
        time: '时间',
        duration: '时长',
        checkbox: '打卡',
        count: '次数',
        text: '文字',
        food: '饮食'
      })[mode] || String(mode || '');
    }

    function normalizeCheckboxEntry(raw) {
      if (!raw || typeof raw !== 'object') return { done:false, note:'' };
      return { done: !!raw.done, note: String(raw.note || '') };
    }
    function normalizeTextEntry(raw) {
      if (!raw || typeof raw !== 'object') return { text:'' };
      return { text: String(raw.text || '') };
    }
    function normalizeCountEntry(raw) {
      if (!raw || typeof raw !== 'object') return { count:0, note:'' };
      return { count: Math.max(0, Number(raw.count) || 0), note: String(raw.note || '') };
    }
    function normalizeTimeEntry(raw) {
      if (!raw || typeof raw !== 'object') return { time:'', note:'' };
      return { time: parseHM(raw.time) || '', note: String(raw.note || '') };
    }
    function normalizeDurationEntry(raw) {
      if (!raw || typeof raw !== 'object') return { minutes:0, type:'', intensity:'', note:'', done:false };
      const minutes = Math.max(0, Number(raw.minutes ?? raw.mins ?? raw.min ?? 0) || 0);
      const type = String(raw.type || raw.sport || '');
      const intensity = String(raw.intensity || '');
      const note = String(raw.note || raw.notes || '');
      const done = raw.done === true || minutes > 0;
      return { minutes, type, intensity, note, done };
    }

    function getDurationEntry(date, habitId) {
      return normalizeDurationEntry(state.habits?.entries?.[date]?.[habitId]);
    }
    function setDurationEntry(date, habitId, patch) {
      const map = getHabitEntryMap(date);
      map[habitId] = { ...getDurationEntry(date, habitId), ...patch };
    }

    function getTimeHabitValue(date, habitId) {
      if (habitId === 'habit_early_wake') return parseHM(state.attendance?.[date]?.wake) || '';
      if (habitId === 'habit_early_sleep') return parseHM(state.attendance?.[date]?.sleep) || '';
      return normalizeTimeEntry(state.habits?.entries?.[date]?.[habitId]).time || '';
    }
    function setTimeHabitValue(date, habitId, time) {
      const t = parseHM(time);
      if (habitId === 'habit_early_wake') { getDayAttendance(date).wake = t; return; }
      if (habitId === 'habit_early_sleep') { getDayAttendance(date).sleep = t; return; }
      const map = getHabitEntryMap(date);
      map[habitId] = { ...normalizeTimeEntry(map[habitId]), time: t || '' };
    }
    function clearTimeHabitValue(date, habitId) {
      if (habitId === 'habit_early_wake') { getDayAttendance(date).wake = null; return; }
      if (habitId === 'habit_early_sleep') { getDayAttendance(date).sleep = null; return; }
      const map = getHabitEntryMap(date);
      delete map[habitId];
    }

    function habitDoneOnDate(habit, date) {
      if (!habit || habit.enabled === false) return false;
      const id = habit.id;
      const mode = habit.mode;
      if (id === 'habit_early_wake') return !!state.attendance?.[date]?.wake;
      if (id === 'habit_early_sleep') return !!state.attendance?.[date]?.sleep;
      if (id === 'habit_food_record' || mode === 'food') return state.foods.some(item => item.date === date);
      if (mode === 'time') return !!getTimeHabitValue(date, id);
      if (mode === 'duration') return getDurationEntry(date, id).done;
      if (mode === 'checkbox') return normalizeCheckboxEntry(state.habits?.entries?.[date]?.[id]).done;
      if (mode === 'count') return normalizeCountEntry(state.habits?.entries?.[date]?.[id]).count > 0;
      if (mode === 'text') return (normalizeTextEntry(state.habits?.entries?.[date]?.[id]).text || '').trim().length > 0;
      return false;
    }

    function exerciseDoneOn(date=todayStr()) { return getDurationEntry(date, 'habit_exercise').done; }
    function renderHabitSnapshot() {
      const date = $('habitDate').value || todayStr();
      const range = getStatsRange(date);
      if ($('habitStatsRangeLabel')) $('habitStatsRangeLabel').textContent = range.label;
      const enabledIds = new Set((state.habits?.list || []).filter(h => h && h.enabled !== false).map(h => h.id));
      const day = getDayAttendance(date);
      let cards = [];
      if (statsMode === 'day') {
        const ex = getDurationEntry(date, 'habit_exercise');
        const exMinutes = Math.round(ex.minutes) || 0;
        const exBase = exMinutes ? `${exMinutes} 分钟` : '已记录';
        const exText = ex.done
          ? `${exBase}${ex.type ? ` · ${escapeHtml(ex.type)}` : ''}${ex.intensity ? ` · ${escapeHtml(ex.intensity)}` : ''}`
          : '未记录';
        const weight = (state.weights || []).find(item => item.date === date);
        cards = [
          enabledIds.has('habit_early_sleep') ? { key:'sleep', name:'早睡', icon:'🌙', value: day.sleep ? `${day.sleep} ${qualifiesSleep(day.sleep) ? '✓' : '稍晚'}` : '未记录', accent:'text-dopamine-purple' } : null,
          enabledIds.has('habit_early_wake') ? { key:'wake', name:'早起', icon:'🌞', value: day.wake ? `${day.wake} ${qualifiesWake(day.wake) ? '✓' : '偏晚'}` : '未记录', accent:'text-dopamine-yellow' } : null,
          enabledIds.has('habit_exercise') ? { key:'exercise', name:'运动', icon:'🏃', value: exText, accent:'text-dopamine-mint' } : null,
          enabledIds.has('habit_food_record') ? { key:'food', name:'饮食记录', icon:'🍽️', value: `${state.foods.filter(item => item.date===date).length} 条`, accent:'text-dopamine-orange' } : null,
          { key:'weight', name:'体重', icon:'⚖️', value: weight ? `${weight.value} ${weight.unit}` : '未记录', accent:'text-dopamine-sky' }
        ].filter(Boolean);
        $('habitCompletionText').textContent = `${todayHabitCompletion(date)}%`;
      } else {
        const totalDays = Math.max(1, range.dates.length);
        const sleepGood = range.dates.filter(d => qualifiesSleep(state.attendance[d]?.sleep)).length;
        const wakeGood = range.dates.filter(d => qualifiesWake(state.attendance[d]?.wake)).length;
        const exerciseDays = range.dates.filter(d => exerciseDoneOn(d)).length;
        const foodEntries = state.foods.filter(item => isDateInRange(item.date, range.start, range.end)).length;
        const weightEntries = (state.weights || []).filter(item => isDateInRange(item.date, range.start, range.end)).length;
        const avgCompletion = Math.round(range.dates.reduce((sum, d) => sum + todayHabitCompletion(d), 0) / totalDays);
        cards = [
          enabledIds.has('habit_early_sleep') ? { key:'sleep', name:'早睡', icon:'🌙', value: `达标 ${sleepGood}/${totalDays} 天`, accent:'text-dopamine-purple' } : null,
          enabledIds.has('habit_early_wake') ? { key:'wake', name:'早起', icon:'🌞', value: `达标 ${wakeGood}/${totalDays} 天`, accent:'text-dopamine-yellow' } : null,
          enabledIds.has('habit_exercise') ? { key:'exercise', name:'运动', icon:'🏃', value: `完成 ${exerciseDays}/${totalDays} 天`, accent:'text-dopamine-mint' } : null,
          enabledIds.has('habit_food_record') ? { key:'food', name:'饮食记录', icon:'🍽️', value: `${foodEntries} 条`, accent:'text-dopamine-orange' } : null,
          { key:'weight', name:'体重记录', icon:'⚖️', value: `${weightEntries} 条`, accent:'text-dopamine-sky' }
        ].filter(Boolean);
        $('habitCompletionText').textContent = `平均 ${avgCompletion}%`;
      }
      $('habitSnapshot').innerHTML = cards.map(card => `
        <div class="small-stat p-4">
          <div class="text-sm font-black ${card.accent}">${card.icon} ${card.name}</div>
          <div class="mt-2 text-lg font-black">${card.value}</div>
        </div>
      `).join('');
    }

    function addCustomHabit() {
      const name = $('customHabitName').value.trim(); if (!name) return;
      const mode = $('customHabitMode').value; const icon = $('customHabitIcon').value.trim() || '✅';
      const id = uid('habit');
      state.habits.list.push(normalizeHabitItem({ id, name, icon, mode, enabled:true, locked:false }) || { id, name, icon, mode, enabled:true, locked:false });
      $('customHabitName').value = ''; $('customHabitIcon').value = '';
      saveState(); renderAll();
    }

    function renderHabitList() {
      const date = $('habitDate').value || todayStr();
      const entryMap = getHabitEntryMap(date);
      const enabledHabits = (state.habits?.list || []).filter(h => h && h.enabled !== false);
      const recordHabits = enabledHabits.filter(h => ['time','duration','checkbox','count','text'].includes(h.mode));

      const timeHabits = recordHabits.filter(h => h.mode === 'time');
      const durationHabits = recordHabits.filter(h => h.mode === 'duration');
      const checkboxHabits = recordHabits.filter(h => h.mode === 'checkbox');
      const countHabits = recordHabits.filter(h => h.mode === 'count');
      const textHabits = recordHabits.filter(h => h.mode === 'text');

      function groupCard(title, desc, bodyHtml, count) {
        if (!count) return '';
        return `
          <div class="small-stat p-4">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div>
                <div class="font-black">${escapeHtml(title)}</div>
                <div class="text-xs text-calm-mute mt-1">${escapeHtml(desc || '')}</div>
              </div>
              <span class="pill bg-white border border-calm-line text-calm-mute">${count} 项</span>
            </div>
            <div class="space-y-3">${bodyHtml}</div>
          </div>`;
      }

      const timeHtml = timeHabits.map(habit => {
        const timeVal = getTimeHabitValue(date, habit.id);
        const status = timeVal
          ? (habit.id === 'habit_early_wake' ? (qualifiesWake(timeVal) ? '达标早起 ✓' : '已记录') : habit.id === 'habit_early_sleep' ? (qualifiesSleep(timeVal) ? '达标早睡 ✓' : '已记录') : '已记录')
          : '未记录';
        const nowBtn = habit.id === 'habit_early_wake'
          ? `<button class="px-3 py-1.5 rounded-xl text-sm font-bold bg-yellow-100 text-yellow-800" data-habit-time-now="${habit.id}">现在</button>`
          : '';
        return `
          <div class="rounded-2xl border border-calm-line bg-white p-4">
            <div class="flex items-center justify-between gap-3 mb-2">
              <div class="font-black">${escapeHtml(habit.icon)} ${escapeHtml(habit.name)}</div>
              <div class="flex gap-2 shrink-0">
                ${nowBtn}
                <button class="px-3 py-1.5 rounded-xl text-sm font-bold bg-gray-100 text-calm-mute" data-habit-time-clear="${habit.id}">清空</button>
                <button class="px-3 py-1.5 rounded-xl text-sm font-bold bg-white border border-calm-line" data-habit-def-edit="${habit.id}">管理</button>
              </div>
            </div>
            <div class="grid grid-cols-[minmax(0,1fr)_160px] gap-2 items-center">
              <div class="text-sm text-calm-mute">${escapeHtml(status)}</div>
              <input data-habit-time="${habit.id}" type="time" class="px-3 py-2 rounded-2xl border border-calm-line bg-calm-bg font-semibold" value="${escapeHtml(timeVal)}">
            </div>
          </div>`;
      }).join('');

      const durationHtml = durationHabits.map(habit => {
        const entry = getDurationEntry(date, habit.id);
        const minutes = entry.minutes ? String(Math.round(entry.minutes)) : '';
        const intensity = entry.intensity || '';
        return `
          <div class="rounded-2xl border border-calm-line bg-white p-4">
            <div class="flex items-center justify-between gap-3 mb-2">
              <div class="font-black">${escapeHtml(habit.icon)} ${escapeHtml(habit.name)}</div>
              <div class="flex gap-2 shrink-0">
                <span class="pill ${entry.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-calm-mute'}">${entry.done ? '已记录' : '未记录'}</span>
                <button class="px-3 py-1.5 rounded-xl text-sm font-bold bg-gray-100 text-calm-mute" data-habit-duration-clear="${habit.id}">清空</button>
                <button class="px-3 py-1.5 rounded-xl text-sm font-bold bg-white border border-calm-line" data-habit-def-edit="${habit.id}">管理</button>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input data-habit-duration-minutes="${habit.id}" type="number" min="0" class="px-3 py-3 rounded-2xl border border-calm-line bg-calm-bg" placeholder="${habit.id==='habit_exercise' ? '运动时长（分钟）' : '时长（分钟）'}" value="${escapeHtml(minutes)}">
              <input data-habit-duration-type="${habit.id}" class="px-3 py-3 rounded-2xl border border-calm-line bg-calm-bg" placeholder="${habit.id==='habit_exercise' ? '运动类型，如：跑步 / 力量 / 瑜伽' : '类型（可选）'}" value="${escapeHtml(entry.type || '')}">
              <select data-habit-duration-intensity="${habit.id}" class="px-3 py-3 rounded-2xl border border-calm-line bg-calm-bg">
                <option value="">运动强度</option>
                <option value="低" ${intensity==='低'?'selected':''}>低</option>
                <option value="中" ${intensity==='中'?'selected':''}>中</option>
                <option value="高" ${intensity==='高'?'selected':''}>高</option>
              </select>
            </div>
            <textarea data-habit-duration-note="${habit.id}" rows="2" class="w-full mt-2 px-3 py-3 rounded-2xl border border-calm-line bg-calm-bg" placeholder="备注（可选）">${escapeHtml(entry.note || '')}</textarea>
          </div>`;
      }).join('');

      const checkboxHtml = checkboxHabits.map(habit => {
        const entry = normalizeCheckboxEntry(entryMap[habit.id]);
        return `
          <div class="rounded-2xl border border-calm-line bg-white p-4">
            <div class="flex items-center justify-between gap-3 mb-2">
              <div class="font-black">${escapeHtml(habit.icon)} ${escapeHtml(habit.name)}</div>
              <div class="flex gap-2 shrink-0">
                <button class="px-3 py-1.5 rounded-xl text-sm font-bold ${entry.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-calm-mute'}" data-habit-toggle="${habit.id}">${entry.done ? '已完成' : '标记完成'}</button>
                <button class="px-3 py-1.5 rounded-xl text-sm font-bold bg-white border border-calm-line" data-habit-def-edit="${habit.id}">管理</button>
              </div>
            </div>
            <textarea data-habit-note="${habit.id}" rows="2" class="w-full px-3 py-3 rounded-2xl border border-calm-line bg-calm-bg" placeholder="备注（可选）">${escapeHtml(entry.note||'')}</textarea>
          </div>`;
      }).join('');

      const countHtml = countHabits.map(habit => {
        const entry = normalizeCountEntry(entryMap[habit.id]);
        return `
          <div class="rounded-2xl border border-calm-line bg-white p-4">
            <div class="flex items-center justify-between gap-3 mb-2">
              <div class="font-black">${escapeHtml(habit.icon)} ${escapeHtml(habit.name)}</div>
              <div class="flex gap-2 shrink-0">
                <span class="pill ${entry.count>0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-calm-mute'}">${entry.count>0 ? '已记录' : '未记录'}</span>
                <button class="px-3 py-1.5 rounded-xl text-sm font-bold bg-white border border-calm-line" data-habit-def-edit="${habit.id}">管理</button>
              </div>
            </div>
            <div class="grid grid-cols-[140px_minmax(0,1fr)] gap-2">
              <input data-habit-count="${habit.id}" type="number" min="0" class="px-3 py-3 rounded-2xl border border-calm-line bg-calm-bg" value="${escapeHtml(String(entry.count||0))}">
              <input data-habit-count-note="${habit.id}" class="px-3 py-3 rounded-2xl border border-calm-line bg-calm-bg" placeholder="备注（可选）" value="${escapeHtml(entry.note||'')}">
            </div>
          </div>`;
      }).join('');

      const textHtml = textHabits.map(habit => {
        const entry = normalizeTextEntry(entryMap[habit.id]);
        return `
          <div class="rounded-2xl border border-calm-line bg-white p-4">
            <div class="flex items-center justify-between gap-3 mb-2">
              <div class="font-black">${escapeHtml(habit.icon)} ${escapeHtml(habit.name)}</div>
              <div class="flex gap-2 shrink-0">
                <span class="pill ${(entry.text||'').trim() ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-calm-mute'}">${(entry.text||'').trim() ? '已记录' : '未记录'}</span>
                <button class="px-3 py-1.5 rounded-xl text-sm font-bold bg-white border border-calm-line" data-habit-def-edit="${habit.id}">管理</button>
              </div>
            </div>
            <textarea data-habit-text="${habit.id}" rows="3" class="w-full px-3 py-3 rounded-2xl border border-calm-line bg-calm-bg" placeholder="记录内容">${escapeHtml(entry.text||'')}</textarea>
          </div>`;
      }).join('');

      const html = [
        groupCard('时间记录', '如：早起 / 早睡（HH:MM）', timeHtml, timeHabits.length),
        groupCard('时长记录', '如：运动（分钟 + 类型 + 强度）', durationHtml, durationHabits.length),
        groupCard('打卡习惯', '勾选完成 + 备注', checkboxHtml, checkboxHabits.length),
        groupCard('次数记录', '次数 + 备注', countHtml, countHabits.length),
        groupCard('文字记录', '自由文本记录', textHtml, textHabits.length)
      ].filter(Boolean).join('');

      $('habitList').innerHTML = html || '<div class="text-sm text-calm-mute">还没有启用可记录的健康习惯。可以在页面底部添加或启用习惯。</div>';

      $('habitList').querySelectorAll('[data-habit-time]').forEach(input => input.onchange = () => { setTimeHabitValue(date, input.dataset.habitTime, input.value); saveState(); renderAll(); });
      $('habitList').querySelectorAll('[data-habit-time-now]').forEach(btn => btn.onclick = () => { setTimeHabitValue(date, btn.dataset.habitTimeNow, nowTime()); saveState(); renderAll(); });
      $('habitList').querySelectorAll('[data-habit-time-clear]').forEach(btn => btn.onclick = () => { clearTimeHabitValue(date, btn.dataset.habitTimeClear); saveState(); renderAll(); });

      $('habitList').querySelectorAll('[data-habit-duration-minutes]').forEach(input => input.onchange = () => {
        const id = input.dataset.habitDurationMinutes;
        const mins = Math.max(0, Number(input.value) || 0);
        setDurationEntry(date, id, { minutes: mins, done: mins > 0 });
        saveState(); renderAll();
      });
      $('habitList').querySelectorAll('[data-habit-duration-type]').forEach(input => input.onchange = () => { const id=input.dataset.habitDurationType; setDurationEntry(date, id, { type: input.value.trim() }); saveState(); renderAll(); });
      $('habitList').querySelectorAll('[data-habit-duration-intensity]').forEach(input => input.onchange = () => { const id=input.dataset.habitDurationIntensity; setDurationEntry(date, id, { intensity: input.value }); saveState(); renderAll(); });
      $('habitList').querySelectorAll('[data-habit-duration-note]').forEach(input => input.onchange = () => { const id=input.dataset.habitDurationNote; setDurationEntry(date, id, { note: input.value }); saveState(); renderAll(); });
      $('habitList').querySelectorAll('[data-habit-duration-clear]').forEach(btn => btn.onclick = () => { const id=btn.dataset.habitDurationClear; delete entryMap[id]; saveState(); renderAll(); });

      $('habitList').querySelectorAll('[data-habit-toggle]').forEach(btn => btn.onclick = () => { const id=btn.dataset.habitToggle; const entry=normalizeCheckboxEntry(entryMap[id]); entryMap[id] = { ...entry, done: !entry.done }; saveState(); renderAll(); });
      $('habitList').querySelectorAll('[data-habit-note]').forEach(input => input.onchange = () => { const id=input.dataset.habitNote; const entry=normalizeCheckboxEntry(entryMap[id]); entryMap[id] = { ...entry, note: input.value }; saveState(); renderAll(); });
      $('habitList').querySelectorAll('[data-habit-text]').forEach(input => input.onchange = () => { const id=input.dataset.habitText; entryMap[id] = { ...normalizeTextEntry(entryMap[id]), text: input.value }; saveState(); renderAll(); });
      $('habitList').querySelectorAll('[data-habit-count]').forEach(input => input.onchange = () => { const id=input.dataset.habitCount; const noteEl = $('habitList').querySelector(`[data-habit-count-note="${id}"]`); entryMap[id] = { ...normalizeCountEntry(entryMap[id]), count: Math.max(0, Number(input.value) || 0), note: noteEl?.value || '' }; saveState(); renderAll(); });
      $('habitList').querySelectorAll('[data-habit-count-note]').forEach(input => input.onchange = () => { const id=input.dataset.habitCountNote; const countEl = $('habitList').querySelector(`[data-habit-count="${id}"]`); entryMap[id] = { ...normalizeCountEntry(entryMap[id]), count: Math.max(0, Number(countEl?.value) || 0), note: input.value }; saveState(); renderAll(); });
      $('habitList').querySelectorAll('[data-habit-def-edit]').forEach(btn => btn.onclick = () => openHabitDefinitionEditor(btn.dataset.habitDefEdit));

      const enabledIds = new Set(enabledHabits.map(h => h.id));
      if ($('habitFoodCard')) $('habitFoodCard').style.display = enabledIds.has('habit_food_record') ? '' : 'none';
    }

    function isDefaultHabitId(id) { return DEFAULT_HABITS.some(h => h.id === id); }
    function toggleHabitEnabled(id) {
      const item = state.habits.list.find(h => h.id === id);
      if (!item) return;
      item.enabled = item.enabled === false;
      saveState(); renderAll();
    }
    function deleteHabitDefinition(id) {
      const item = state.habits.list.find(h => h.id === id);
      if (!item) return;
      if (isDefaultHabitId(id)) item.enabled = false;
      else state.habits.list = state.habits.list.filter(h => h.id !== id);
      for (const d of Object.keys(state.habits.entries || {})) delete state.habits.entries[d][id];
      saveState(); renderAll();
    }
    function openHabitDefinitionEditor(id) {
      const item = state.habits.list.find(h => h.id === id);
      if (!item) return;
      const modeOptions = [
        { value:'time', label:'时间记录（HH:MM）' },
        { value:'duration', label:'时长记录（分钟 + 类型 + 强度）' },
        { value:'checkbox', label:'勾选完成' },
        { value:'count', label:'次数记录' },
        { value:'text', label:'文字记录' },
        { value:'food', label:'饮食（外部）' }
      ];
      const enabledOptions = [
        { value:'1', label:'启用' },
        { value:'0', label:'停用' }
      ];
      openEditDialog({
        title:'习惯管理',
        desc:`记录方式：${habitModeLabel(item.mode)}`,
        fields:[
          { name:'name', label:'名称', value:item.name },
          { name:'icon', label:'图标', value:item.icon },
          { name:'mode', label:'记录方式', type:'select', value:item.mode, options: modeOptions },
          { name:'enabled', label:'是否启用', type:'select', value: item.enabled === false ? '0' : '1', options: enabledOptions }
        ],
        onSave:(vals) => {
          item.name = vals.name.trim() || item.name;
          item.icon = vals.icon.trim() || item.icon;
          const requestedMode = String(vals.mode || item.mode);
          const requestedEnabled = String(vals.enabled || '1') === '1';
          // Protect system habits.
          if (id === 'habit_early_sleep' || id === 'habit_early_wake') item.mode = 'time';
          else if (id === 'habit_exercise') item.mode = 'duration';
          else if (id === 'habit_food_record') item.mode = 'food';
          else item.mode = ['time','duration','checkbox','count','text'].includes(requestedMode) ? requestedMode : item.mode;
          item.enabled = requestedEnabled;
          saveState(); renderAll();
        },
        onDelete:() => { deleteHabitDefinition(id); }
      });
    }
    function renderHabitManager() {
      const list = state.habits?.list || [];
      const ordered = [...list].sort((a,b) => (a.enabled===false)-(b.enabled===false));
      $('habitManagerList').innerHTML = ordered.map(item => `
        <div class="rounded-2xl border border-calm-line bg-white p-3 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="font-black">${escapeHtml(item.icon)} ${escapeHtml(item.name)}</div>
            <div class="text-xs text-calm-mute mt-1">方式：${escapeHtml(habitModeLabel(item.mode))} · 状态：${item.enabled===false ? '停用' : '启用'}</div>
          </div>
          <div class="flex gap-2 shrink-0 flex-wrap justify-end">
            <button class="px-3 py-1.5 rounded-xl text-sm font-bold bg-white border border-calm-line" data-habit-manage-edit="${item.id}">编辑</button>
            <button class="px-3 py-1.5 rounded-xl text-sm font-bold ${item.enabled===false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-calm-mute'}" data-habit-manage-toggle="${item.id}">${item.enabled===false ? '启用' : '停用'}</button>
            <button class="px-3 py-1.5 rounded-xl text-sm font-bold bg-rose-100 text-rose-600" data-habit-manage-delete="${item.id}">删除</button>
          </div>
        </div>
      `).join('') || '<div class="text-sm text-calm-mute">暂无习惯。</div>';

      $('habitManagerList').querySelectorAll('[data-habit-manage-edit]').forEach(btn => btn.onclick = () => openHabitDefinitionEditor(btn.dataset.habitManageEdit));
      $('habitManagerList').querySelectorAll('[data-habit-manage-toggle]').forEach(btn => btn.onclick = () => toggleHabitEnabled(btn.dataset.habitManageToggle));
      $('habitManagerList').querySelectorAll('[data-habit-manage-delete]').forEach(btn => btn.onclick = () => { if (confirm('确定删除（或停用）这个习惯吗？')) deleteHabitDefinition(btn.dataset.habitManageDelete); });
    }

    function addFood() {
      const date = $('habitDate').value || todayStr();
      const meal = $('foodMeal').value; const text = $('foodText').value.trim();
      if (!text) return;
      state.foods.unshift({ id:uid('food'), date, meal, text, at:nowDateTime() });
      $('foodText').value = '';
      saveState(); renderAll();
    }
    function renderFoods() {
      const date = $('habitDate').value || todayStr();
      const foods = state.foods.filter(item => item.date === date);
      $('foodCountBadge').textContent = `${foods.length} 条`;
      $('foodList').innerHTML = foods.map(item => `
        <div class="rounded-2xl border border-calm-line bg-white p-3 flex items-start justify-between gap-3">
          <div><div class="font-bold">${escapeHtml(item.meal)}</div><div class="text-sm text-calm-mute mt-1">${escapeHtml(item.text)}</div></div>
          <button class="text-sm font-bold text-dopamine-orange" data-food-edit="${item.id}">修改</button>
        </div>
      `).join('') || '<div class="text-sm text-calm-mute">今天还没有饮食记录。</div>';
      $('foodList').querySelectorAll('[data-food-edit]').forEach(btn => btn.onclick = () => openFoodEditor(btn.dataset.foodEdit));
    }

    function addWeight() {
      const date = $('habitDate').value || todayStr();
      const value = Math.max(0, Number($('weightValue').value) || 0);
      if (!value) { alert('请填写体重数值。'); return; }
      state.weights.unshift({ id: uid('weight'), date, value, unit: $('weightUnit').value || 'kg', at: nowDateTime() });
      $('weightValue').value = '';
      saveState();
      renderAll();
    }
    function renderWeights() {
      const date = $('habitDate').value || todayStr();
      const records = (state.weights || []).filter(item => item.date === date);
      const latest = (state.weights || [])[0];
      $('weightLatestBadge').textContent = latest ? `${latest.value} ${latest.unit}` : '未记录';
      $('weightList').innerHTML = records.map(item => `
        <div class="rounded-2xl border border-calm-line bg-white p-3 flex items-start justify-between gap-3">
          <div>
            <div class="font-bold">${escapeHtml(String(item.value))} ${escapeHtml(item.unit)}</div>
            <div class="text-xs text-calm-mute mt-1">${escapeHtml(item.date)} · ${escapeHtml(String(item.at || '').slice(11, 16))}</div>
          </div>
          <button class="text-sm font-bold text-dopamine-orange" data-weight-edit="${item.id}">修改</button>
        </div>
      `).join('') || '<div class="text-sm text-calm-mute">今天还没有体重记录。</div>';
      $('weightList').querySelectorAll('[data-weight-edit]').forEach(btn => btn.onclick = () => openWeightEditor(btn.dataset.weightEdit));
    }

    function saveCareEntry() {
      const date = $('careDate').value || todayStr();
      state.care.entries[date] = normalizeCareEntry({
        mood: selectedCareMood,
        stress: $('careStress').value,
        energy: $('careEnergy').value,
        challenge: $('careChallenge').value.trim(),
        selfCare: $('careSelfCare').value.trim(),
        gratitude: $('careGratitude').value.trim(),
        support: $('careSupport').value.trim(),
        note: $('careNote').value.trim(),
        updatedAt: nowDateTime()
      });
      saveState();
      renderAll();
    }

    function deleteCareEntry(date = $('careDate').value || todayStr()) {
      delete state.care.entries[date];
      saveState();
      renderAll();
    }

    function renderCareThemeStats() {
      const baseDate = $('careDate').value || todayStr();
      const range = getStatsRange(baseDate);
      if ($('careStatsRangeLabel')) $('careStatsRangeLabel').textContent = range.label;
      const entries = range.dates.map(date => ({ date, entry: careEntryOn(date) })).filter(item => careCountOn(item.date));
      const count = entries.length;
      const avgStress = count ? (entries.reduce((sum, item) => sum + item.entry.stress, 0) / count).toFixed(1) : '0.0';
      const avgEnergy = count ? (entries.reduce((sum, item) => sum + item.entry.energy, 0) / count).toFixed(1) : '0.0';
      const gratitudeDays = entries.filter(item => item.entry.gratitude.trim()).length;
      const supportDays = entries.filter(item => item.entry.support.trim() || item.entry.stress >= 4).length;
      const cards = [
        { label:`${statsModeText(baseDate)}有记录天数`, value: `${count}/${Math.max(1, range.dates.length)}`, color:'text-dopamine-mint' },
        { label:`${statsModeText(baseDate)}平均压力`, value: `${avgStress}/5`, color:'text-dopamine-pink' },
        { label:`${statsModeText(baseDate)}平均能量`, value: `${avgEnergy}/5`, color:'text-dopamine-sky' },
        { label:`${statsModeText(baseDate)}写下感谢`, value: gratitudeDays, color:'text-dopamine-yellow' },
        { label:`${statsModeText(baseDate)}需要支持`, value: supportDays, color:'text-dopamine-purple' }
      ];
      $('careThemeStats').innerHTML = cards.map(item => `
        <div class="small-stat p-4">
          <div class="text-sm text-calm-mute">${item.label}</div>
          <div class="text-2xl font-black mt-1 ${item.color}">${escapeHtml(String(item.value))}</div>
        </div>
      `).join('');
    }

    function renderCare() {
      const date = $('careDate').value || todayStr();
      const entry = careEntryOn(date);
      selectedCareMood = entry.mood || 'steady';
      document.querySelectorAll('[data-care-mood]').forEach(btn => btn.classList.toggle('active', btn.dataset.careMood === selectedCareMood));
      setInputIfIdle('careStress', String(entry.stress || 3));
      setInputIfIdle('careEnergy', String(entry.energy || 3));
      setInputIfIdle('careChallenge', entry.challenge || '');
      setInputIfIdle('careSelfCare', entry.selfCare || '');
      setInputIfIdle('careGratitude', entry.gratitude || '');
      setInputIfIdle('careSupport', entry.support || '');
      setInputIfIdle('careNote', entry.note || '');

      const mood = careMoodMeta(entry.mood);
      const careHint = entry.stress >= 4
        ? '今天更适合先减压，再谈效率。'
        : entry.energy >= 4
          ? '你今天有一点回升，可以把能量留给最重要的一件事。'
          : '先把自己放回可持续状态，比硬撑更重要。';
      $('careSummary').innerHTML = careCountOn(date) ? `
        <div class="rounded-2xl bg-white border border-calm-line px-4 py-4">
          <div class="font-black">${mood.emoji} ${mood.label}</div>
          <div class="text-sm text-calm-mute mt-1">压力 ${entry.stress}/5 · 能量 ${entry.energy}/5</div>
        </div>
        <div class="rounded-2xl bg-white border border-calm-line px-4 py-4">
          <div class="font-black mb-1">给今天的提醒</div>
          <div class="text-sm leading-6">${escapeHtml(careHint)}</div>
        </div>
        <div class="rounded-2xl bg-white border border-calm-line px-4 py-4">
          <div class="text-sm text-calm-mute">自我关怀</div>
          <div class="font-bold mt-1">${escapeHtml(entry.selfCare || '今天还没有写下恢复动作。')}</div>
        </div>
        <div class="rounded-2xl bg-white border border-calm-line px-4 py-4">
          <div class="text-sm text-calm-mute">支持 / 边界</div>
          <div class="font-bold mt-1">${escapeHtml(entry.support || '今天还没有写下支持需求。')}</div>
        </div>
      ` : '<div class="text-sm text-calm-mute">今天还没有记录心灵关怀。先写下压力、能量和一个最小的恢复动作吧。</div>';

      $('careHistoryList').innerHTML = recentDates(7).map(d => {
        const item = careEntryOn(d);
        const hasRecord = careCountOn(d);
        const itemMood = careMoodMeta(item.mood);
        return `
          <div class="rounded-2xl border border-calm-line bg-white px-3 py-3 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="font-bold">${dayLabel(d)}</div>
              <div class="text-xs text-calm-mute mt-1">${hasRecord ? `${itemMood.emoji} ${itemMood.label} · 压力 ${item.stress}/5 · 能量 ${item.energy}/5` : '未记录'}</div>
            </div>
            <div class="flex gap-2 shrink-0">
              <button class="text-sm font-bold text-dopamine-orange" data-care-jump="${d}">查看</button>
              ${hasRecord ? `<button class="text-sm font-bold text-rose-600" data-care-delete="${d}">删除</button>` : ''}
            </div>
          </div>`;
      }).join('');
      $('careHistoryList').querySelectorAll('[data-care-jump]').forEach(btn => btn.onclick = () => { $('careDate').value = btn.dataset.careJump; navTo('care-section'); renderAll(); });
      $('careHistoryList').querySelectorAll('[data-care-delete]').forEach(btn => btn.onclick = () => { if (confirm('确定删除这天的心灵关怀记录吗？')) deleteCareEntry(btn.dataset.careDelete); });
    }

    function ensureMentorEntryTask(date, entry, kind='nextAction') {
      const text = kind === 'promise' ? entry.commitment : entry.nextAction;
      if (!String(text || '').trim()) return null;
      const project = ensureWorkflowModuleProject('mentor', false);
      const taskKey = kind === 'promise' ? 'promiseTaskId' : 'nextActionTaskId';
      const dueDate = entry.followupDate || shiftDate(date, 1);
      let task = state.tasks.find(item => item.id === entry[taskKey]);
      if (task?.status === 'done') return task;
      const titlePrefix = kind === 'promise' ? '跟进导师承诺' : '导师跟进';
      const title = `${titlePrefix}：${String(text).slice(0, 48)}`;
      const patch = {
        title,
        projectId: project.id,
        gtdBucket: 'next',
        quadrant: dueDate && dueDate <= todayStr() ? 'q1' : 'q2',
        todayBucket: dueDate === todayStr() ? 'should' : '',
        dueDate,
        estimate: 25,
        context: '沟通',
        note: `mentor:${date}:${kind}`
      };
      if (task) {
        Object.assign(task, patch);
      } else {
        task = createTask({ ...patch, status:'planned' });
        entry[taskKey] = task?.id || '';
      }
      return task;
    }

    function ensureMentorPromiseTaskForDate(date) {
      const entry = mentorEntryOn(date);
      const task = ensureMentorEntryTask(date, entry, 'promise');
      state.mentor.entries[date] = normalizeMentorEntry(entry);
      saveState();
      renderAll();
      return task;
    }

    function updateMentorPromiseStatus(date, status) {
      const entry = mentorEntryOn(date);
      entry.promiseStatus = mentorPromiseStatusMeta(status).value;
      entry.updatedAt = nowDateTime();
      if (entry.promiseStatus === 'resolved' && entry.promiseTaskId) {
        const task = state.tasks.find(item => item.id === entry.promiseTaskId);
        if (task && task.status !== 'done') finishTask(task.id);
      }
      state.mentor.entries[date] = normalizeMentorEntry(entry);
      saveState();
      renderAll();
    }

    function saveMentorEntry() {
      const date = $('mentorDate').value || todayStr();
      const existing = mentorEntryOn(date);
      const nextEntry = normalizeMentorEntry({
        status: $('mentorStatus').value,
        channel: $('mentorChannel').value,
        pressure: Number($('mentorPressure').value || 3),
        clarity: Number($('mentorClarity').value || 3),
        topic: $('mentorTopic').value.trim(),
        evidence: $('mentorEvidence').value.trim(),
        ask: $('mentorAsk').value.trim(),
        risk: $('mentorRisk').value.trim(),
        feedback: $('mentorFeedback').value.trim(),
        commitment: $('mentorCommitment').value.trim(),
        confirmation: $('mentorConfirmation').value.trim(),
        followupDate: $('mentorFollowupDate').value || '',
        promiseStatus: $('mentorPromiseStatus').value || 'open',
        promiseTaskId: existing.promiseTaskId || '',
        boundary: $('mentorBoundary').value.trim(),
        nextAction: $('mentorNextAction').value.trim(),
        nextActionTaskId: existing.nextActionTaskId || '',
        updatedAt: nowDateTime()
      });
      if (nextEntry.nextAction.trim()) ensureMentorEntryTask(date, nextEntry, 'nextAction');
      state.mentor.entries[date] = nextEntry;
      saveState();
      renderAll();
    }

    function deleteMentorEntry(date = $('mentorDate').value || todayStr()) {
      delete state.mentor.entries[date];
      saveState();
      renderAll();
    }

    function renderMentorThemeStats() {
      const baseDate = $('mentorDate').value || todayStr();
      const range = getStatsRange(baseDate);
      if ($('mentorStatsRangeLabel')) $('mentorStatsRangeLabel').textContent = range.label;
      const entries = range.dates.map(date => ({ date, entry: mentorEntryOn(date) })).filter(item => mentorCountOn(item.date));
      const count = entries.length;
      const avgPressure = count ? (entries.reduce((sum, item) => sum + item.entry.pressure, 0) / count).toFixed(1) : '0.0';
      const avgClarity = count ? (entries.reduce((sum, item) => sum + item.entry.clarity, 0) / count).toFixed(1) : '0.0';
      const waitingCount = entries.filter(item => item.entry.status === 'waiting').length;
      const clearAskCount = entries.filter(item => item.entry.ask.trim()).length;
      const blockedCount = entries.filter(item => item.entry.status === 'blocked' || item.entry.pressure >= 4).length;
      const promiseCount = entries.filter(item => item.entry.commitment.trim()).length;
      const remindCount = entries.filter(item => item.entry.promiseStatus === 'remind').length;
      const overdueCount = entries.filter(item => item.entry.commitment.trim() && item.entry.promiseStatus !== 'resolved' && item.entry.followupDate && item.entry.followupDate < baseDate).length;
      const cards = [
        { label:`${statsModeText(baseDate)}有记录天数`, value: `${count}/${Math.max(1, range.dates.length)}`, color:'text-dopamine-purple' },
        { label:`${statsModeText(baseDate)}平均压力`, value: `${avgPressure}/5`, color:'text-dopamine-pink' },
        { label:`${statsModeText(baseDate)}预期清晰度`, value: `${avgClarity}/5`, color:'text-dopamine-sky' },
        { label:`${statsModeText(baseDate)}等待反馈`, value: waitingCount, color:'text-dopamine-yellow' },
        { label:`${statsModeText(baseDate)}明确请求`, value: clearAskCount, color:'text-dopamine-mint' },
        { label:`${statsModeText(baseDate)}高压 / 需推进`, value: blockedCount, color:'text-dopamine-orange' },
        { label:`${statsModeText(baseDate)}承诺留痕`, value: promiseCount, color:'text-dopamine-purple' },
        { label:`${statsModeText(baseDate)}待提醒 / 已超期`, value: `${remindCount} / ${overdueCount}`, color:'text-rose-600' }
      ];
      $('mentorThemeStats').innerHTML = cards.map(item => `
        <div class="small-stat p-4">
          <div class="text-sm text-calm-mute">${item.label}</div>
          <div class="text-2xl font-black mt-1 ${item.color}">${escapeHtml(String(item.value))}</div>
        </div>
      `).join('');
    }

    function renderMentor() {
      const date = $('mentorDate').value || todayStr();
      const entry = mentorEntryOn(date);
      setInputIfIdle('mentorStatus', entry.status || 'drafting');
      setInputIfIdle('mentorChannel', entry.channel || '');
      setInputIfIdle('mentorPressure', String(entry.pressure || 3));
      setInputIfIdle('mentorClarity', String(entry.clarity || 3));
      setInputIfIdle('mentorTopic', entry.topic || '');
      setInputIfIdle('mentorEvidence', entry.evidence || '');
      setInputIfIdle('mentorAsk', entry.ask || '');
      setInputIfIdle('mentorRisk', entry.risk || '');
      setInputIfIdle('mentorFeedback', entry.feedback || '');
      setInputIfIdle('mentorCommitment', entry.commitment || '');
      setInputIfIdle('mentorConfirmation', entry.confirmation || '');
      setInputIfIdle('mentorFollowupDate', entry.followupDate || '');
      setInputIfIdle('mentorPromiseStatus', entry.promiseStatus || 'open');
      setInputIfIdle('mentorBoundary', entry.boundary || '');
      setInputIfIdle('mentorNextAction', entry.nextAction || '');

      const status = mentorStatusMeta(entry.status);
      const promiseStatus = mentorPromiseStatusMeta(entry.promiseStatus);
      const pendingPromises = mentorPendingItems(date);
      const pressureHint = entry.pressure >= 4
        ? '先把问题收束成 1-2 个明确请求，再决定要不要立刻沟通。'
        : entry.clarity >= 4
          ? '今天适合把准备好的材料和问题一起发出去，减少来回试探。'
          : '先整理你的证据和问题，比反复猜导师在想什么更有帮助。';
      $('mentorSummary').innerHTML = mentorCountOn(date) ? `
        <div class="rounded-2xl bg-white border border-calm-line px-4 py-4">
          <div class="font-black">${status.emoji} ${status.label}</div>
          <div class="text-sm text-calm-mute mt-1">压力 ${entry.pressure}/5 · 清晰度 ${entry.clarity}/5${entry.channel ? ` · ${escapeHtml(entry.channel)}` : ''}</div>
        </div>
        <div class="rounded-2xl bg-white border border-calm-line px-4 py-4">
          <div class="font-black mb-1">今天最值得守住的一点</div>
          <div class="text-sm leading-6">${escapeHtml(pressureHint)}</div>
        </div>
        <div class="rounded-2xl bg-white border border-calm-line px-4 py-4">
          <div class="text-sm text-calm-mute">我要问导师什么</div>
          <div class="font-bold mt-1">${escapeHtml(entry.ask || '还没有写下明确请求。')}</div>
        </div>
        <div class="rounded-2xl bg-white border border-calm-line px-4 py-4">
          <div class="text-sm text-calm-mute">导师反馈 / 决策</div>
          <div class="font-bold mt-1">${escapeHtml(entry.feedback || '还没有记录导师这次的反馈。')}</div>
        </div>
        <div class="rounded-2xl bg-white border border-calm-line px-4 py-4">
          <div class="text-sm text-calm-mute">导师承诺 / 计划追踪</div>
          <div class="font-bold mt-1">${escapeHtml(entry.commitment || '今天还没有记录导师说过的话。')}</div>
          <div class="text-xs text-calm-mute mt-2">${escapeHtml(promiseStatus.label)}${entry.followupDate ? ` · 下次核对 ${entry.followupDate}` : ''}</div>
        </div>
        <div class="rounded-2xl bg-white border border-calm-line px-4 py-4">
          <div class="text-sm text-calm-mute">下一步动作</div>
          <div class="font-bold mt-1">${escapeHtml(entry.nextAction || '还没有写下下一步。')}</div>
          <div class="text-xs text-calm-mute mt-2">${entry.nextActionTaskId ? '已加入任务总表' : '保存下一步动作后会自动加入任务总表'}</div>
        </div>
      ` : '<div class="text-sm text-calm-mute">今天还没有记录导师沟通。先写下你准备了什么、想问什么，以及下一步跟进动作吧。</div>';

      $('mentorPromiseList').innerHTML = pendingPromises.slice(0, 8).map(item => {
        const meta = mentorPromiseStatusMeta(item.entry.promiseStatus);
        const overdue = item.entry.followupDate && item.entry.followupDate < date;
        return `
          <div class="rounded-2xl border border-calm-line bg-white px-3 py-3 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="font-bold">${dayLabel(item.date)}</div>
              <div class="text-sm mt-1 leading-6">${escapeHtml(item.entry.commitment)}</div>
              <div class="text-xs text-calm-mute mt-2">${escapeHtml(meta.label)}${item.entry.followupDate ? ` · 核对 ${item.entry.followupDate}` : ''}${overdue ? ' · 已超期' : ''}${item.entry.promiseTaskId ? ' · 已加入任务' : ''}</div>
              <div class="flex flex-wrap gap-2 mt-3">
                <button class="px-2 py-1 rounded-xl bg-sky-50 text-dopamine-sky text-xs font-bold" data-mentor-promise-task="${item.date}">${item.entry.promiseTaskId ? '更新任务' : '加入任务'}</button>
                <button class="px-2 py-1 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold" data-mentor-promise-status="${item.date}" data-status="remind">需提醒</button>
                <button class="px-2 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold" data-mentor-promise-status="${item.date}" data-status="resolved">已落实</button>
              </div>
            </div>
            <button class="text-sm font-bold text-dopamine-orange shrink-0" data-mentor-promise-jump="${item.date}">查看</button>
          </div>`;
      }).join('') || '<div class="text-sm text-calm-mute">目前没有待追踪承诺。把导师的口头计划和你的复述确认记下来，会轻松很多。</div>';

      $('mentorHistoryList').innerHTML = recentDates(7).map(d => {
        const item = mentorEntryOn(d);
        const hasRecord = mentorCountOn(d);
        const itemStatus = mentorStatusMeta(item.status);
        return `
          <div class="rounded-2xl border border-calm-line bg-white px-3 py-3 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="font-bold">${dayLabel(d)}</div>
              <div class="text-xs text-calm-mute mt-1">${hasRecord ? `${itemStatus.emoji} ${itemStatus.label} · 压力 ${item.pressure}/5 · 清晰度 ${item.clarity}/5${item.commitment ? ' · 有承诺留痕' : ''}` : '未记录'}</div>
            </div>
            <div class="flex gap-2 shrink-0">
              <button class="text-sm font-bold text-dopamine-orange" data-mentor-jump="${d}">查看</button>
              ${hasRecord ? `<button class="text-sm font-bold text-rose-600" data-mentor-delete="${d}">删除</button>` : ''}
            </div>
          </div>`;
      }).join('');
      $('mentorPromiseList').querySelectorAll('[data-mentor-promise-jump]').forEach(btn => btn.onclick = () => { $('mentorDate').value = btn.dataset.mentorPromiseJump; navTo('mentor-section'); renderAll(); });
      $('mentorPromiseList').querySelectorAll('[data-mentor-promise-task]').forEach(btn => btn.onclick = () => ensureMentorPromiseTaskForDate(btn.dataset.mentorPromiseTask));
      $('mentorPromiseList').querySelectorAll('[data-mentor-promise-status]').forEach(btn => btn.onclick = () => updateMentorPromiseStatus(btn.dataset.mentorPromiseStatus, btn.dataset.status));
      $('mentorHistoryList').querySelectorAll('[data-mentor-jump]').forEach(btn => btn.onclick = () => { $('mentorDate').value = btn.dataset.mentorJump; navTo('mentor-section'); renderAll(); });
      $('mentorHistoryList').querySelectorAll('[data-mentor-delete]').forEach(btn => btn.onclick = () => { if (confirm('确定删除这天的导师沟通记录吗？')) deleteMentorEntry(btn.dataset.mentorDelete); });
    }

    function syncReviewTomorrowTasks(date, entry) {
      const targetDate = shiftDate(date, 1);
      entry.tomorrowTaskIds = Array.isArray(entry.tomorrowTaskIds) ? entry.tomorrowTaskIds.slice(0, 3) : ['', '', ''];
      while (entry.tomorrowTaskIds.length < 3) entry.tomorrowTaskIds.push('');
      entry.tomorrow.forEach((rawTitle, index) => {
        const title = String(rawTitle || '').trim();
        if (!title) return;
        let task = state.tasks.find(item => item.id === entry.tomorrowTaskIds[index]);
        const todayBucket = targetDate === todayStr() ? (index === 0 ? 'must' : 'should') : '';
        const patch = {
          title: `明日优先 ${index + 1}：${title}`,
          projectId: '',
          gtdBucket: 'next',
          quadrant: index === 0 ? 'q1' : 'q2',
          todayBucket,
          dueDate: targetDate,
          estimate: index === 0 ? 45 : 30,
          context: '复盘',
          note: `review:${date}:tomorrow:${index + 1}`
        };
        if (task && task.status !== 'done') {
          Object.assign(task, patch);
        } else if (!task) {
          task = createTask({ ...patch, status:'planned' });
          entry.tomorrowTaskIds[index] = task?.id || '';
        }
      });
    }

    function saveDailyReview() {
      const date = $('reviewDate').value || todayStr();
      const existing = dailyReviewEntryOn(date);
      const nextEntry = normalizeDailyReviewEntry({
        energy: $('reviewEnergy').value,
        energyNote: $('reviewEnergyNote').value.trim(),
        accomplishments: $('reviewAccomplishments').value.trim(),
        unfinished: $('reviewUnfinished').value.trim(),
        insights: $('reviewInsights').value.trim(),
        obstacles: $('reviewObstacles').value.trim(),
        tomorrow: [
          $('reviewTomorrow1').value.trim(),
          $('reviewTomorrow2').value.trim(),
          $('reviewTomorrow3').value.trim()
        ],
        tomorrowTaskIds: existing.tomorrowTaskIds || ['', '', ''],
        updatedAt: nowDateTime()
      });
      if (!reviewContentCount(nextEntry)) {
        alert('至少写下一条核心成果、未竟分析、学术洞见、障碍对策或明日优先任务，再保存复盘。');
        return;
      }
      syncReviewTomorrowTasks(date, nextEntry);
      state.reviewDaily.entries[date] = nextEntry;
      saveState();
      renderAll();
    }

    function deleteDailyReview(date = $('reviewDate').value || todayStr()) {
      delete state.reviewDaily.entries[date];
      saveState();
      renderAll();
    }

    function buildDailyDigest(date=todayStr()) {
      const workLogs = state.attendance?.[date]?.logs || [];
      const workMinutes = totalAttendanceMinutes(date);
      const leaveCount = (state.attendance?.[date]?.leaves || []).length;
      const focusSessions = state.focus.sessions.filter(item => item.date === date);
      const focusMinutes = focusMinutesOn(date);
      const taskCreated = state.tasks.filter(item => dateFromDateTime(item.createdAt) === date).length;
      const taskStarted = state.tasks.filter(item => dateFromDateTime(item.startedAt) === date).length;
      const taskDone = state.tasks.filter(item => dateFromDateTime(item.doneAt) === date).length;
      const scheduleBlocks = state.timeBlocks?.[date] || [];
      const scheduleCount = scheduleBlocks.length;
      const scheduleMinutes = scheduleBlocks.reduce((sum, item) => sum + minutesBetween(item.start, item.end), 0);

      const thesisLogs = (state.thesis?.logs || []).filter(item => item.date === date);
      const thesisMinutes = thesisLogs.reduce((sum, item) => sum + (Number(item.minutes) || 0), 0);
      const thesisWords = thesisLogs.reduce((sum, item) => sum + (Number(item.words) || 0), 0);
      const milestoneDone = (state.thesis?.milestones || []).filter(item => dateFromDateTime(item.doneAt) === date).length;
      const chapterUpdated = (state.thesis?.chapters || []).filter(item => dateFromDateTime(item.updatedAt) === date).length;

      const submissionCreated = state.submissions.filter(item => dateFromDateTime(item.createdAt) === date).length;
      const submissionUpdated = state.submissions.filter(item => dateFromDateTime(item.updatedAt) === date && dateFromDateTime(item.createdAt) !== date).length;
      const submissionDue = state.submissions.filter(item => item.deadline === date).length;
      const submissionMoves = submissionCreated + submissionUpdated;
      const submissionLogsToday = state.submissions.flatMap(item => (item.logs || []).filter(log => log.date === date).map(log => ({ item, log })));

      const enabledHabits = (state.habits?.list || []).filter(item => item && item.enabled !== false && !LEGACY_REMOVED_HABITS.has(item.id));
      const doneHabits = enabledHabits.filter(item => habitDoneOnDate(item, date)).length;
      const exercise = getDurationEntry(date, 'habit_exercise');
      const foods = state.foods.filter(item => item.date === date);
      const weights = (state.weights || []).filter(item => item.date === date);
      const care = careEntryOn(date);
      const mentor = mentorEntryOn(date);
      const review = dailyReviewEntryOn(date);
      const careMood = careMoodMeta(care.mood);
      const mentorStatus = mentorStatusMeta(mentor.status);
      const reviewEnergy = reviewEnergyMeta(review.energy);
      const exMinutes = Math.round(exercise.minutes) || 0;
      const exInfo = exercise.done ? `${exMinutes ? `${exMinutes} 分钟` : '已记录'}${exercise.type ? ` · ${exercise.type}` : ''}${exercise.intensity ? ` · ${exercise.intensity}` : ''}` : '未记录';

      const cards = [
        { label:'总览首页', value:`${workLogs.length} 段 / ${focusSessions.length} 次`, color:'text-dopamine-orange' },
        { label:'时间块', value:`${scheduleCount} 个 / ${formatMinutes(scheduleMinutes)}`, color:'text-dopamine-sky' },
        { label:'论文进度', value:`${thesisLogs.length} 条`, color:'text-dopamine-purple' },
        { label:'投稿管理', value:`${submissionMoves} 动`, color:'text-dopamine-sky' },
        { label:'健康管理', value:`${todayHabitCompletion(date)}%`, color:'text-dopamine-mint' },
        { label:'心灵关怀', value: careCountOn(date) ? `${careMood.emoji} 压力${care.stress}` : '未记录', color:'text-dopamine-pink' },
        { label:'导师沟通', value: mentorCountOn(date) ? `${mentorStatus.emoji} ${mentorStatus.label}` : '未记录', color:'text-dopamine-purple' },
        { label:'每日复盘', value: reviewCountOn(date) ? `${reviewEnergy.emoji} ${reviewTemplateCount(review)}/5` : '未写', color:'text-dopamine-yellow' }
      ];

      const sections = [
        {
          title: '总览首页',
          lines: [
            `工作打卡：${workLogs.length} 段，共 ${formatMinutes(workMinutes)}`,
            `请假记录：${leaveCount} 条`,
            `专注记录：${focusSessions.length} 次，共 ${formatMinutes(focusMinutes)}`,
            `任务推进：新增 ${taskCreated}，启动 ${taskStarted}，完成 ${taskDone}`,
            `日程时间块：${scheduleCount} 个，共 ${formatMinutes(scheduleMinutes)}`
          ]
        },
        {
          title: '本科毕业论文进度',
          lines: [
            `推进日志：${thesisLogs.length} 条，共 ${formatMinutes(thesisMinutes)}${thesisWords ? `，${thesisWords} 字` : ''}`,
            `完成里程碑：${milestoneDone} 个`,
            `更新章节：${chapterUpdated} 个`
          ]
        },
        {
          title: '投稿管理',
          lines: [
            `新增项目：${submissionCreated} 个`,
            `今日更新：${submissionUpdated} 个`,
            `推进日志：${submissionLogsToday.length} 条`,
            `今日截止：${submissionDue} 个`,
            `进行中项目：${runningSubmissionCount()} 个`
          ]
        },
        {
          title: '健康管理',
          lines: [
            `习惯完成度：${todayHabitCompletion(date)}%（${doneHabits}/${enabledHabits.length || 0}）`,
            `早起：${state.attendance?.[date]?.wake ? `${state.attendance[date].wake}${qualifiesWake(state.attendance[date].wake) ? ' · 达标' : ''}` : '未记录'}`,
            `早睡：${state.attendance?.[date]?.sleep ? `${state.attendance[date].sleep}${qualifiesSleep(state.attendance[date].sleep) ? ' · 达标' : ''}` : '未记录'}`,
            `运动：${exInfo}`,
            `饮食记录：${foods.length} 条`,
            `体重记录：${weights.length ? weights.map(item => `${item.value} ${item.unit}`).join('；') : '未记录'}`
          ]
        },
        {
          title: '心灵关怀',
          lines: careCountOn(date)
            ? [
                `情绪状态：${careMood.emoji} ${careMood.label}`,
                `压力 / 能量：${care.stress}/5 · ${care.energy}/5`,
                `自我关怀：${care.selfCare ? '已记录' : '未记录'}`,
                `支持 / 边界：${care.support ? '已记录' : '未记录'}`
              ]
            : ['今天还没有心灵关怀记录。']
        },
        {
          title: '导师与 PAT 沟通',
          lines: mentorCountOn(date)
            ? [
                `沟通状态：${mentorStatus.emoji} ${mentorStatus.label}`,
                `压力 / 清晰度：${mentor.pressure}/5 · ${mentor.clarity}/5`,
                `明确请求：${mentor.ask ? '已写' : '未写'}`,
                `导师反馈 / 决策：${mentor.feedback ? '已写' : '未写'}`,
                `导师承诺留痕：${mentor.commitment ? '已写' : '未写'}`,
                `下一步动作：${mentor.nextAction ? '已写' : '未写'}${mentor.nextActionTaskId ? ' · 已加入任务总表' : ''}`
              ]
            : ['今天还没有整理导师沟通。']
        },
        {
          title: '每日复盘',
          lines: reviewCountOn(date)
            ? [
                `状态 / 能量：${reviewEnergy.emoji} ${reviewEnergy.label}${review.energyNote ? `｜${review.energyNote}` : ''}`,
                `今日核心成果：${review.accomplishments || '未写'}`,
                `未完成与拖延分析：${review.unfinished || '未写'}`,
                `学术洞见与新发现：${review.insights || '未写'}`,
                `障碍与对策：${review.obstacles || '未写'}`,
                `明日优先任务：${review.tomorrow.filter(item => item.trim()).join('；') || '未写'}`,
                `任务联动：${(review.tomorrowTaskIds || []).filter(Boolean).length} 条已加入任务总表`
              ]
            : ['今天还没有保存结构化复盘。']
        }
      ];

      const markdown = [
        `# ${date} Undergraduate 每日复盘与记录统计`,
        '',
        ...sections.flatMap(section => [`## ${section.title}`, ...section.lines.map(line => `- ${line}`), ''])
      ].join('\n').trim();

      return { cards, sections, markdown };
    }

    function downloadReviewMarkdown() {
      const date = $('reviewDate').value || todayStr();
      const digest = buildDailyDigest(date);
      const blob = new Blob([digest.markdown], { type:'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `undergraduate_daily_review_${date}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }

    function renderReview() {
      const date = $('reviewDate').value || todayStr();
      const review = dailyReviewEntryOn(date);
      setInputIfIdle('reviewEnergy', review.energy || 'medium');
      setInputIfIdle('reviewEnergyNote', review.energyNote || '');
      setInputIfIdle('reviewAccomplishments', review.accomplishments || '');
      setInputIfIdle('reviewUnfinished', review.unfinished || '');
      setInputIfIdle('reviewInsights', review.insights || '');
      setInputIfIdle('reviewObstacles', review.obstacles || '');
      setInputIfIdle('reviewTomorrow1', review.tomorrow[0] || '');
      setInputIfIdle('reviewTomorrow2', review.tomorrow[1] || '');
      setInputIfIdle('reviewTomorrow3', review.tomorrow[2] || '');

      const digest = buildDailyDigest(date);
      $('reviewGeneratedStats').innerHTML = digest.cards.map(item => `
        <div class="small-stat p-4">
          <div class="text-sm text-calm-mute">${item.label}</div>
          <div class="text-xl font-black mt-1 ${item.color}">${escapeHtml(String(item.value))}</div>
        </div>
      `).join('');
      $('reviewGeneratedSections').innerHTML = digest.sections.map(section => `
        <div class="small-stat p-4">
          <div class="font-black mb-2">${escapeHtml(section.title)}</div>
          <div class="space-y-1 text-sm">
            ${section.lines.map(line => `<div>${escapeHtml(line)}</div>`).join('')}
          </div>
        </div>
      `).join('');
      $('reviewGeneratedMd').textContent = digest.markdown;

      $('reviewHistory').innerHTML = recentDates(7).map(d => {
        const item = dailyReviewEntryOn(d);
        const energy = reviewEnergyMeta(item.energy);
        return `
          <div class="rounded-2xl border border-calm-line bg-white px-3 py-3 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="font-bold">${dayLabel(d)}</div>
              <div class="text-xs text-calm-mute mt-1">${reviewCountOn(d) ? `${energy.emoji} 能量${energy.short} · 学术项 ${reviewTemplateCount(item)}/5 · 明日 ${reviewPriorityCount(item)}/3` : '未写复盘'}</div>
            </div>
            <div class="flex gap-2 shrink-0">
              <button class="text-sm font-bold text-dopamine-orange" data-jump-review="${d}">查看</button>
              ${reviewCountOn(d) ? `<button class="text-sm font-bold text-rose-600" data-delete-review="${d}">删除</button>` : ''}
            </div>
          </div>`;
      }).join('');
      $('reviewHistory').querySelectorAll('[data-jump-review]').forEach(btn => btn.onclick = () => { $('reviewDate').value = btn.dataset.jumpReview; navTo('review-section'); renderAll(); });
      $('reviewHistory').querySelectorAll('[data-delete-review]').forEach(btn => btn.onclick = () => { if (confirm('确定删除这天的复盘吗？')) deleteDailyReview(btn.dataset.deleteReview); });
    }

    function renderReviewThemeStats() {
      const baseDate = $('reviewDate').value || todayStr();
      const range = getStatsRange(baseDate);
      if ($('reviewStatsRangeLabel')) $('reviewStatsRangeLabel').textContent = range.label;
      const entries = range.dates.map(date => ({ date, entry: dailyReviewEntryOn(date) })).filter(item => reviewCountOn(item.date));
      const count = entries.length;
      const accomplishmentDays = entries.filter(item => item.entry.accomplishments.trim()).length;
      const insightDays = entries.filter(item => item.entry.insights.trim()).length;
      const obstacleDays = entries.filter(item => item.entry.obstacles.trim()).length;
      const priorityTotal = entries.reduce((sum, item) => sum + reviewPriorityCount(item.entry), 0);
      const syncDays = entries.filter(item => careCountOn(item.date)).length;
      const cards = [
        { label:`${statsModeText(baseDate)}复盘完成`, value: `${count}/${Math.max(1, range.dates.length)}`, color:'text-dopamine-pink' },
        { label:`${statsModeText(baseDate)}记录成果`, value: accomplishmentDays, color:'text-dopamine-yellow' },
        { label:`${statsModeText(baseDate)}学术洞见`, value: insightDays, color:'text-dopamine-sky' },
        { label:`${statsModeText(baseDate)}障碍对策`, value: obstacleDays, color:'text-dopamine-mint' },
        { label:`${statsModeText(baseDate)}明日优先`, value: priorityTotal, color:'text-dopamine-orange' },
        { label:`${statsModeText(baseDate)}同步心灵关怀`, value: syncDays, color:'text-dopamine-purple' }
      ];
      $('reviewThemeStats').innerHTML = cards.map(item => `
        <div class="small-stat p-4">
          <div class="text-sm text-calm-mute">${item.label}</div>
          <div class="text-2xl font-black mt-1 ${item.color}">${escapeHtml(String(item.value))}</div>
        </div>
      `).join('');
    }

    function submissionProjectNote(id) { return `submission:${id}`; }
    function submissionProjectStatus(item) {
      if (['已接收','已见刊/已收录'].includes(item.stage)) return 'done';
      if (['搁置/拒稿'].includes(item.stage)) return 'paused';
      return 'active';
    }
    function syncSubmissionProject(item) {
      if (!item) return null;
      const note = submissionProjectNote(item.id);
      let project = state.projects.find(project => project.note === note);
      const patch = {
        title: item.title,
        outcome: `${item.stage}${item.venue ? ` · ${item.venue}` : ''}${item.notes ? ` · ${item.notes}` : ''}`,
        area: 'writing',
        status: submissionProjectStatus(item),
        startDate: item.startDate || dateFromDateTime(item.createdAt) || todayStr(),
        deadline: item.deadline || '',
        note,
        updatedAt: item.updatedAt || nowDateTime()
      };
      if (project) {
        Object.assign(project, patch);
      } else {
        project = normalizeProjectItem({
          id: uid('proj'),
          ...patch,
          createdAt: item.createdAt || nowDateTime()
        });
        state.projects.unshift(project);
      }
      return project;
    }
    function syncAllSubmissionProjects() {
      state.submissions.forEach(item => syncSubmissionProject(item));
    }

    function recentDates(days=7) {
      const dates = [];
      for (let i = days - 1; i >= 0; i--) dates.push(todayStr(-i));
      return dates;
    }

    function achievementCategoryMeta(category) {
      return ({
        system: { label:'执行系统', icon:'🗂️', desc:'项目、任务和时间安排让执行变得更稳。' },
        research: { label:'科研推进', icon:'🔬', desc:'论文、投稿和专注记录共同构成你的研究推进曲线。' },
        health: { label:'身心恢复', icon:'🌿', desc:'早睡、早起、运动这些基础盘，直接决定能否长期稳定输出。' },
        support: { label:'支持体系', icon:'🫶', desc:'心灵关怀、导师沟通和复盘，帮助你不靠硬扛完成本科。' }
      })[category] || { label:category, icon:'🏅', desc:'' };
    }

    function buildTierSeries({ category, seriesId, title, icon, color, value, goals, noun }) {
      const tierNames = ['初阶','进阶','高阶'];
      return goals.map((goal, index) => ({
        id:`${seriesId}_${index + 1}`,
        category,
        seriesId,
        title:`${title} · ${tierNames[index]}`,
        baseTitle:title,
        tier:index + 1,
        tierName:tierNames[index],
        desc:`累计 ${noun} ${goal}`,
        progress:Math.min(value, goal),
        rawValue:value,
        goal,
        unlocked:value >= goal,
        icon,
        color
      }));
    }

    function getAchievements() {
      const totalFocusSessions = state.focus.sessions.length;
      const totalFocusMinutes = state.focus.sessions.reduce((sum, s) => sum + (Number(s.minutes)||0), 0);
      const totalWorkLogs = Object.values(state.attendance).reduce((sum, day) => sum + (day.logs?.length||0), 0);
      const totalScheduleBlocks = Object.values(state.timeBlocks || {}).reduce((sum, blocks) => sum + (Array.isArray(blocks) ? blocks.length : 0), 0);
      const totalProjects = state.projects.length;
      const totalDoneTasks = state.tasks.filter(item => item.status === 'done').length;
      const earlyWakeCount = Object.values(state.attendance).filter(day => qualifiesWake(day.wake)).length;
      const earlySleepCount = Object.values(state.attendance).filter(day => qualifiesSleep(day.sleep)).length;
      const exerciseDays = Object.entries(state.habits.entries).filter(([_, map]) => normalizeDurationEntry(map?.['habit_exercise']).done).length;
      const habitStrongDays = Object.keys(state.habits.entries || {}).filter(date => todayHabitCompletion(date) >= 80).length;
      const careEntries = Object.keys(state.care?.entries || {}).filter(date => careCountOn(date)).length;
      const reviewEntries = Object.keys(state.reviewDaily?.entries || {}).filter(date => reviewCountOn(date)).length;
      const mentorEntries = Object.keys(state.mentor?.entries || {}).filter(date => mentorCountOn(date)).length;
      const supportEntries = careEntries + reviewEntries + mentorEntries;
      const thesisLogs = state.thesis?.logs?.length || 0;
      const submissionCount = state.submissions.length;
      const acceptedCount = state.submissions.filter(s => ['已接收','已见刊/已收录'].includes(s.stage)).length;

      return [
        ...buildTierSeries({ category:'system', seriesId:'projects', title:'项目系统搭建者', icon:'📁', color:'from-purple-400 to-indigo-500', value:totalProjects, goals:[1, 3, 8], noun:'创建项目' }),
        ...buildTierSeries({ category:'system', seriesId:'tasks_done', title:'下一步执行者', icon:'✅', color:'from-pink-400 to-rose-500', value:totalDoneTasks, goals:[5, 25, 100], noun:'完成任务' }),
        ...buildTierSeries({ category:'system', seriesId:'schedule_blocks', title:'时间块设计师', icon:'🗓️', color:'from-sky-400 to-cyan-500', value:totalScheduleBlocks, goals:[10, 40, 120], noun:'安排时间块' }),

        ...buildTierSeries({ category:'research', seriesId:'focus_sessions', title:'深度专注者', icon:'⏱️', color:'from-orange-400 to-pink-400', value:totalFocusSessions, goals:[1, 10, 50], noun:'次专注记录' }),
        ...buildTierSeries({ category:'research', seriesId:'focus_minutes', title:'研究引擎点火', icon:'🔥', color:'from-yellow-400 to-orange-500', value:totalFocusMinutes, goals:[300, 1000, 3000], noun:'分钟专注' }),
        ...buildTierSeries({ category:'research', seriesId:'thesis_logs', title:'论文推进工匠', icon:'📝', color:'from-violet-400 to-purple-600', value:thesisLogs, goals:[5, 20, 80], noun:'条论文日志' }),
        ...buildTierSeries({ category:'research', seriesId:'submission_created', title:'投稿管线启动者', icon:'📮', color:'from-sky-400 to-blue-500', value:submissionCount, goals:[1, 5, 12], noun:'个投稿项目' }),
        ...buildTierSeries({ category:'research', seriesId:'accepted', title:'成果归档者', icon:'🏆', color:'from-emerald-400 to-green-500', value:acceptedCount, goals:[1, 3, 5], noun:'个已接收 / 见刊项目' }),

        ...buildTierSeries({ category:'health', seriesId:'wake', title:'清晨掌控者', icon:'🌅', color:'from-yellow-300 to-orange-400', value:earlyWakeCount, goals:[7, 21, 60], noun:'天达标早起' }),
        ...buildTierSeries({ category:'health', seriesId:'sleep', title:'作息守恒者', icon:'🌙', color:'from-indigo-400 to-purple-500', value:earlySleepCount, goals:[7, 21, 60], noun:'天达标早睡' }),
        ...buildTierSeries({ category:'health', seriesId:'exercise', title:'身体底盘建设者', icon:'🏃', color:'from-green-400 to-emerald-500', value:exerciseDays, goals:[7, 21, 60], noun:'天运动记录' }),
        ...buildTierSeries({ category:'health', seriesId:'habit_strong', title:'可持续节奏维护者', icon:'🌿', color:'from-lime-400 to-green-500', value:habitStrongDays, goals:[5, 20, 60], noun:'天习惯完成度达到 80%' }),

        ...buildTierSeries({ category:'support', seriesId:'care', title:'自我关怀练习者', icon:'🌱', color:'from-teal-400 to-emerald-500', value:careEntries, goals:[5, 20, 60], noun:'天心灵关怀' }),
        ...buildTierSeries({ category:'support', seriesId:'review', title:'结构化复盘者', icon:'💗', color:'from-pink-400 to-fuchsia-500', value:reviewEntries, goals:[5, 20, 60], noun:'天每日复盘' }),
        ...buildTierSeries({ category:'support', seriesId:'mentor', title:'导师沟通设计师', icon:'🤝', color:'from-violet-400 to-fuchsia-500', value:mentorEntries, goals:[3, 15, 40], noun:'天导师沟通记录' }),
        ...buildTierSeries({ category:'support', seriesId:'support_all', title:'支持体系编织者', icon:'🫶', color:'from-rose-400 to-orange-500', value:supportEntries, goals:[10, 30, 90], noun:'条支持性记录' })
      ];
    }

    function renderAchievements() {
      const achievements = getAchievements();
      const unlocked = achievements.filter(a => a.unlocked).length;
      const total = achievements.length;
      const bySeries = {};
      achievements.forEach(item => {
        if (!bySeries[item.seriesId]) bySeries[item.seriesId] = [];
        bySeries[item.seriesId].push(item);
      });
      const completedSeries = Object.values(bySeries).filter(items => items.every(item => item.unlocked)).length;
      const highTierUnlocked = achievements.filter(item => item.tier === 3 && item.unlocked).length;
      $('achievementSummary').innerHTML = `
        <div class="small-stat p-3"><div class="text-xs text-calm-mute">已解锁徽章</div><div class="text-2xl font-black">${unlocked}</div></div>
        <div class="small-stat p-3"><div class="text-xs text-calm-mute">总徽章</div><div class="text-2xl font-black">${total}</div></div>
        <div class="small-stat p-3"><div class="text-xs text-calm-mute">完整系列</div><div class="text-2xl font-black text-dopamine-mint">${completedSeries}</div></div>
        <div class="small-stat p-3"><div class="text-xs text-calm-mute">高阶成就</div><div class="text-2xl font-black text-dopamine-orange">${highTierUnlocked}</div></div>`;

      const categoryEntries = Object.entries(achievements.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {}));
      $('achievementSeriesOverview').innerHTML = categoryEntries.map(([category, items]) => {
        const meta = achievementCategoryMeta(category);
        const unlockedCount = items.filter(item => item.unlocked).length;
        return `
          <div class="rounded-2xl bg-white border border-calm-line px-4 py-4">
            <div class="font-black">${meta.icon} ${escapeHtml(meta.label)}</div>
            <div class="text-sm text-calm-mute mt-1">${escapeHtml(meta.desc)}</div>
            <div class="text-xl font-black mt-3">${unlockedCount} / ${items.length}</div>
          </div>`;
      }).join('');

      $('achievementGrid').innerHTML = categoryEntries.map(([category, items]) => {
        const meta = achievementCategoryMeta(category);
        const sectionItems = items.sort((a, b) => a.seriesId.localeCompare(b.seriesId) || a.tier - b.tier);
        return `
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-xl font-black">${meta.icon} ${escapeHtml(meta.label)}</div>
                <div class="text-sm text-calm-mute mt-1">${escapeHtml(meta.desc)}</div>
              </div>
              <span class="pill bg-white border border-calm-line text-calm-mute">${sectionItems.filter(item => item.unlocked).length} / ${sectionItems.length}</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              ${sectionItems.map(item => `
                <div class="achievement-card ${item.unlocked ? '' : 'locked'} rounded-[1.4rem] border border-calm-line bg-white p-4 shadow-soft">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <div class="text-3xl mb-2">${item.icon}</div>
                      <div class="font-black text-lg">${escapeHtml(item.title)}</div>
                      <div class="text-sm text-calm-mute mt-1">${escapeHtml(item.desc)}</div>
                    </div>
                    <span class="pill ${item.unlocked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-calm-mute'}">${item.unlocked ? '已解锁' : item.tierName}</span>
                  </div>
                  <div class="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden"><div class="h-full bg-gradient-to-r ${item.color}" style="width:${Math.min(100, item.progress / item.goal * 100)}%"></div></div>
                  <div class="flex items-center justify-between gap-3 text-xs text-calm-mute mt-2">
                    <span>进度：${escapeHtml(String(item.progress))} / ${escapeHtml(String(item.goal))}</span>
                    <span>系列 ${item.tier}/3</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>`;
      }).join('');
    }

    function renderAchievementRangeStats() {
      const range = getStatsRange(todayStr());
      if ($('achievementStatsRangeLabel')) $('achievementStatsRangeLabel').textContent = range.label;
      const days = Math.max(1, range.dates.length);
      const focusSessions = state.focus.sessions.filter(s => isDateInRange(s.date, range.start, range.end)).length;
      const focusMinutes = state.focus.sessions.filter(s => isDateInRange(s.date, range.start, range.end)).reduce((sum, s) => sum + (Number(s.minutes)||0), 0);
      const tasksDone = state.tasks.filter(item => item.doneAt && isDateInRange(dateFromDateTime(item.doneAt), range.start, range.end)).length;
      const thesisLogs = (state.thesis?.logs || []).filter(item => isDateInRange(item.date, range.start, range.end)).length;
      const mentorDays = range.dates.reduce((sum, date) => sum + mentorCountOn(date), 0);
      const avgHabit = Math.round(range.dates.reduce((sum, d) => sum + todayHabitCompletion(d), 0) / days);
      const cards = [
        { label:`${statsModeText()}专注次数`, value: focusSessions, color:'text-dopamine-orange' },
        { label:`${statsModeText()}专注时长`, value: formatMinutes(focusMinutes), color:'text-dopamine-orange' },
        { label:`${statsModeText()}完成任务`, value: tasksDone, color:'text-dopamine-pink' },
        { label:`${statsModeText()}论文日志`, value: thesisLogs, color:'text-dopamine-purple' },
        { label:`${statsModeText()}导师沟通`, value: mentorDays, color:'text-dopamine-sky' },
        { label:`${statsModeText()}习惯均值`, value: `${avgHabit}%`, color:'text-dopamine-mint' }
      ];
      $('achievementRangeStats').innerHTML = cards.map(item => `
        <div class="small-stat p-4">
          <div class="text-sm text-calm-mute">${item.label}</div>
          <div class="text-2xl font-black mt-1 ${item.color}">${escapeHtml(String(item.value))}</div>
        </div>
      `).join('');
    }

    function submissionStatsData() {
      const range = getStatsRange(todayStr());
      const dueSoon = state.submissions.filter(item => item.deadline && diffDays(todayStr(), item.deadline) <= 14 && diffDays(todayStr(), item.deadline) >= 0).length;
      const createdInRange = state.submissions.filter(item => isDateInRange(dateFromDateTime(item.createdAt), range.start, range.end)).length;
      const dueInRange = state.submissions.filter(item => item.deadline && isDateInRange(item.deadline, range.start, range.end)).length;
      const archived = state.submissions.filter(s => ['已接收','已见刊/已收录'].includes(s.stage)).length;
      return [
        { label:`${statsModeText()}新增项目`, value: createdInRange, color:'text-dopamine-sky' },
        { label:`${statsModeText()}截止项目`, value: dueInRange, color:'text-dopamine-pink' },
        { label:'进行中', value: runningSubmissionCount(), color:'text-dopamine-orange' },
        { label:'成果归档', value: archived, color:'text-dopamine-mint' },
        { label:'14 天内截止', value: dueSoon, color:'text-dopamine-purple' }
      ];
    }
    function renderSubmissionStats() {
      const range = getStatsRange(todayStr());
      if ($('submissionStatsRangeLabel')) $('submissionStatsRangeLabel').textContent = range.label;
      $('submissionStats').innerHTML = submissionStatsData().map(item => `
        <div class="small-stat p-4"><div class="text-sm text-calm-mute">${item.label}</div><div class="text-3xl font-black mt-1 ${item.color}">${item.value}</div></div>
      `).join('');
    }
    function addSubmission() {
      const title = $('subTitle').value.trim(); if (!title) { alert('请填写题目 / 项目名。'); return; }
      const timestamp = nowDateTime();
      const item = {
        id: uid('sub'),
        title,
        venue: $('subVenue').value.trim(),
        deadline: $('subDeadline').value || '',
        stage: $('subStage').value || '选题中',
        type: $('subType').value,
        notes: $('subNotes').value.trim(),
        logs: [],
        createdAt: timestamp,
        updatedAt: timestamp
      };
      state.submissions.unshift(item);
      syncSubmissionProject(item);
      ['subTitle','subVenue','subDeadline','subNotes'].forEach(id => $(id).value='');
      saveState(); renderAll();
    }
    function renderSubmissionBoard() {
      renderSubmissionStats();
      syncAllSubmissionProjects();
      const prevFilterStage = $('submissionFilterStage').value;
      const prevFormStage = $('subStage').value;
      const prevLogProject = $('submissionLogProject')?.value || '';
      $('submissionFilterStage').innerHTML = `<option value="">全部阶段</option>` + SUBMISSION_COLUMNS.map(s => `<option value="${s}">${s}</option>`).join('');
      $('submissionFilterStage').value = prevFilterStage;
      $('subStage').innerHTML = SUBMISSION_COLUMNS.map(s => `<option value="${s}">${s}</option>`).join('');
      $('subStage').value = prevFormStage || '选题中';
      if ($('submissionLogProject')) {
        $('submissionLogProject').innerHTML = state.submissions.map(item => `<option value="${item.id}">${escapeHtml(item.title)}</option>`).join('');
        $('submissionLogProject').value = state.submissions.some(item => item.id === prevLogProject) ? prevLogProject : (state.submissions[0]?.id || '');
      }
      const q = $('submissionFilterQuery').value.trim().toLowerCase();
      const month = $('submissionFilterMonth').value;
      const stageFilter = $('submissionFilterStage').value;
      const filtered = state.submissions.filter(item => {
        const matchesQ = !q || `${item.title} ${item.venue} ${item.notes}`.toLowerCase().includes(q);
        const matchesMonth = !month || (item.deadline || '').startsWith(month);
        const matchesStage = !stageFilter || item.stage === stageFilter;
        return matchesQ && matchesMonth && matchesStage;
      });
      const boardItems = SUBMISSION_COLUMNS.filter(stage => !['已接收','已见刊/已收录'].includes(stage)).map(stage => ({ stage, items: filtered.filter(item => item.stage === stage) }));
      $('submissionBoard').innerHTML = boardItems.map(col => `
        <div class="small-stat p-4 kanban-col">
          <div class="flex items-center justify-between mb-3"><div class="font-black">${col.stage}</div><span class="pill" style="background:${STAGE_COLORS[col.stage]}20;color:${STAGE_COLORS[col.stage]}">${col.items.length}</span></div>
          <div class="space-y-3">${col.items.map(item => `
            <div class="rounded-2xl bg-white border border-calm-line p-3">
              <div class="font-bold line-clamp-2">${escapeHtml(item.title)}</div>
              <div class="text-xs text-calm-mute mt-1">${escapeHtml(item.venue || '未填写 venue')}</div>
              <div class="text-xs text-calm-mute mt-1">${item.deadline ? `截止：${item.deadline}` : '无截止日期'}</div>
              <div class="flex gap-2 mt-3 flex-wrap">
                <button class="px-2 py-1 rounded-xl text-xs font-bold bg-gray-100 text-calm-mute" data-sub-edit="${item.id}">修改</button>
                <button class="px-2 py-1 rounded-xl text-xs font-bold bg-green-100 text-green-700" data-sub-next="${item.id}">推进</button>
              </div>
            </div>
          `).join('') || '<div class="text-sm text-calm-mute">暂无项目</div>'}</div>
        </div>
      `).join('');
      $('submissionBoard').querySelectorAll('[data-sub-edit]').forEach(btn => btn.onclick = () => openSubmissionEditor(btn.dataset.subEdit));
      $('submissionBoard').querySelectorAll('[data-sub-next]').forEach(btn => btn.onclick = () => advanceSubmission(btn.dataset.subNext));

      const archive = filtered.filter(item => ['已接收','已见刊/已收录'].includes(item.stage));
      $('submissionArchive').innerHTML = archive.map(item => `
        <div class="rounded-2xl border border-calm-line bg-white p-4 flex items-start justify-between gap-4">
          <div>
            <div class="font-black">${escapeHtml(item.title)}</div>
            <div class="text-sm text-calm-mute mt-1">${escapeHtml(item.venue || '')}</div>
            <div class="text-xs text-calm-mute mt-1">${item.stage}${item.deadline ? ` · 截止 ${item.deadline}` : ''}</div>
          </div>
          <button class="text-sm font-bold text-dopamine-orange" data-sub-edit="${item.id}">修改</button>
        </div>
      `).join('') || '<div class="text-sm text-calm-mute">还没有进入成果归档的项目。</div>';
      $('submissionArchive').querySelectorAll('[data-sub-edit]').forEach(btn => btn.onclick = () => openSubmissionEditor(btn.dataset.subEdit));
      renderSubmissionLogs();
    }
    function advanceSubmission(id) {
      const idx = state.submissions.findIndex(item => item.id === id); if (idx < 0) return;
      const item = state.submissions[idx];
      const current = SUBMISSION_COLUMNS.indexOf(item.stage);
      const nextStage = SUBMISSION_COLUMNS[Math.min(SUBMISSION_COLUMNS.length - 1, current + 1)] || item.stage;
      state.submissions[idx] = { ...item, stage: nextStage, updatedAt: nowDateTime() };
      syncSubmissionProject(state.submissions[idx]);
      saveState(); renderAll();
    }

    function addSubmissionLog() {
      const id = $('submissionLogProject').value;
      const item = state.submissions.find(sub => sub.id === id);
      if (!item) { alert('请先选择投稿项目。'); return; }
      const note = $('submissionLogNote').value.trim();
      if (!note) { alert('请填写推进日志内容。'); return; }
      item.logs = Array.isArray(item.logs) ? item.logs : [];
      item.logs.unshift({
        id: uid('sublog'),
        date: $('submissionLogDate').value || todayStr(),
        type: $('submissionLogType').value || '推进',
        minutes: Math.max(0, Number($('submissionLogMinutes').value) || 0),
        note,
        stage: item.stage,
        at: nowDateTime()
      });
      item.updatedAt = nowDateTime();
      $('submissionLogNote').value = '';
      $('submissionLogMinutes').value = '';
      syncSubmissionProject(item);
      saveState();
      renderAll();
    }
    function renderSubmissionLogs() {
      if (!$('submissionLogList')) return;
      const selectedId = $('submissionLogProject')?.value || '';
      const selected = state.submissions.find(item => item.id === selectedId);
      const logs = selected
        ? (selected.logs || []).map(log => ({ item:selected, log }))
        : state.submissions.flatMap(item => (item.logs || []).map(log => ({ item, log })));
      $('submissionLogList').innerHTML = logs.slice(0, 20).map(({ item, log }) => `
        <div class="rounded-2xl border border-calm-line bg-white px-4 py-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="font-bold">${escapeHtml(item.title)}</div>
              <div class="text-xs text-calm-mute mt-1">${escapeHtml(log.date)} · ${escapeHtml(log.type)} · ${escapeHtml(log.stage || item.stage)}${log.minutes ? ` · ${formatMinutes(log.minutes)}` : ''}</div>
              <div class="text-sm leading-6 mt-2">${escapeHtml(log.note)}</div>
            </div>
          </div>
        </div>
      `).join('') || '<div class="text-sm text-calm-mute">还没有投稿推进日志。</div>';
    }
    function downloadSubmissionMarkdown() {
      const id = $('submissionLogProject').value;
      const item = state.submissions.find(sub => sub.id === id);
      if (!item) { alert('请先选择投稿项目。'); return; }
      const logs = [...(item.logs || [])].sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.at || '').localeCompare(a.at || ''));
      const md = [
        `# 投稿推进日志：${item.title}`,
        '',
        `- Venue：${item.venue || '未填写'}`,
        `- 类型：${item.type || 'Other'}`,
        `- 当前阶段：${item.stage}`,
        `- 截止日期：${item.deadline || '未设置'}`,
        `- 备注：${item.notes || '无'}`,
        '',
        '## 推进日志',
        '',
        ...(logs.length ? logs.flatMap(log => [
          `### ${log.date} · ${log.type}`,
          '',
          `- 阶段：${log.stage || item.stage}`,
          `- 投入：${log.minutes ? formatMinutes(log.minutes) : '未记录'}`,
          `- 记录：${log.note}`,
          ''
        ]) : ['暂无推进日志。'])
      ].join('\n');
      const blob = new Blob([md], { type:'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submission_${item.title.replace(/[\\/:*?"<>|]/g, '_')}_logs.md`;
      a.click();
      URL.revokeObjectURL(url);
    }

    function renderDashboard() {
      const days = Number($('dashboardRange').value || 7);
      const dates = recentDates(days);
      const rangeLabel = days === 1 ? '今日' : days === 7 ? '本周' : days === 30 ? '本月' : `近 ${days} 天`;
      const start = dates[0];
      const end = dates[dates.length - 1];
      const focusTotal = dates.reduce((sum, d) => sum + focusMinutesOn(d), 0);
      const workTotal = dates.reduce((sum, d) => sum + totalAttendanceMinutes(d), 0);
      const avgHabit = Math.round(dates.reduce((sum, d) => sum + todayHabitCompletion(d), 0) / Math.max(1, days));
      const exerciseDays = dates.filter(d => exerciseDoneOn(d)).length;
      const careDays = dates.reduce((sum, d) => sum + careCountOn(d), 0);
      const mentorDays = dates.reduce((sum, d) => sum + mentorCountOn(d), 0);
      const reviewDays = dates.reduce((sum, d) => sum + reviewCountOn(d), 0);
      const focusSessions = state.focus.sessions.filter(item => isDateInRange(item.date, start, end));
      const workLogs = Object.entries(state.attendance)
        .filter(([date]) => isDateInRange(date, start, end))
        .flatMap(([, day]) => day.logs || []);
      const leaveCount = Object.entries(state.attendance)
        .filter(([date]) => isDateInRange(date, start, end))
        .reduce((sum, [, day]) => sum + (day.leaves?.length || 0), 0);
      const scheduleCount = Object.entries(state.timeBlocks || {})
        .filter(([date]) => isDateInRange(date, start, end))
        .reduce((sum, [, items]) => sum + (Array.isArray(items) ? items.length : 0), 0);
      const scheduleMinutes = Object.entries(state.timeBlocks || {})
        .filter(([date]) => isDateInRange(date, start, end))
        .reduce((sum, [, items]) => sum + (Array.isArray(items) ? items.reduce((inner, item) => inner + minutesBetween(item.start, item.end), 0) : 0), 0);
      const tasksDone = state.tasks.filter(item => item.doneAt && isDateInRange(dateFromDateTime(item.doneAt), start, end)).length;
      const tasksStarted = state.tasks.filter(item => item.startedAt && isDateInRange(dateFromDateTime(item.startedAt), start, end)).length;
      const thesisLogs = (state.thesis?.logs || []).filter(item => isDateInRange(item.date, start, end));
      const thesisMinutes = thesisLogs.reduce((sum, item) => sum + (Number(item.minutes) || 0), 0);
      const thesisWords = thesisLogs.reduce((sum, item) => sum + (Number(item.words) || 0), 0);
      const chapterUpdates = (state.thesis?.chapters || []).filter(item => item.updatedAt && isDateInRange(dateFromDateTime(item.updatedAt), start, end)).length;
      const milestoneDone = (state.thesis?.milestones || []).filter(item => item.doneAt && isDateInRange(dateFromDateTime(item.doneAt), start, end)).length;
      const submissionCreated = state.submissions.filter(item => item.createdAt && isDateInRange(dateFromDateTime(item.createdAt), start, end)).length;
      const submissionUpdated = state.submissions.filter(item => item.updatedAt && isDateInRange(dateFromDateTime(item.updatedAt), start, end) && dateFromDateTime(item.createdAt) !== dateFromDateTime(item.updatedAt)).length;
      const submissionDue = state.submissions.filter(item => isDateInRange(item.deadline, start, end)).length;
      const submissionMoves = submissionCreated + submissionUpdated;
      const foodLogs = state.foods.filter(item => isDateInRange(item.date, start, end)).length;
      const avgCareStress = careDays ? (dates.filter(d => careCountOn(d)).reduce((sum, d) => sum + careEntryOn(d).stress, 0) / careDays).toFixed(1) : '0.0';
      const avgMentorPressure = mentorDays ? (dates.filter(d => mentorCountOn(d)).reduce((sum, d) => sum + mentorEntryOn(d).pressure, 0) / mentorDays).toFixed(1) : '0.0';
      const reviewTemplateTotal = dates.reduce((sum, d) => sum + reviewTemplateCount(dailyReviewEntryOn(d)), 0);
      const reviewPriorityTotal = dates.reduce((sum, d) => sum + reviewPriorityCount(dailyReviewEntryOn(d)), 0);

      const statCards = [
        { label:`${rangeLabel}专注`, value: formatMinutes(focusTotal), color:'text-dopamine-orange' },
        { label:`${rangeLabel}时间块`, value: `${scheduleCount} 个 / ${formatMinutes(scheduleMinutes)}`, color:'text-dopamine-sky' },
        { label:`${rangeLabel}打卡`, value: formatMinutes(workTotal), color:'text-dopamine-sky' },
        { label:`${rangeLabel}论文投入`, value: formatMinutes(thesisMinutes), color:'text-dopamine-purple' },
        { label:`${rangeLabel}论文字数`, value: Math.round(thesisWords), color:'text-dopamine-pink' },
        { label:`${rangeLabel}投稿动作`, value: submissionMoves, color:'text-dopamine-sky' },
        { label:`${rangeLabel}习惯均值`, value: `${avgHabit}%`, color:'text-dopamine-mint' },
        { label:`${rangeLabel}心灵关怀`, value: careDays, color:'text-dopamine-yellow' },
        { label:`${rangeLabel}导师沟通`, value: mentorDays, color:'text-dopamine-purple' },
        { label:`${rangeLabel}每日复盘`, value: reviewDays, color:'text-dopamine-pink' },
        { label:'进行中投稿', value: runningSubmissionCount(), color:'text-dopamine-orange' }
      ];
      $('dashboardStats').innerHTML = statCards.map(item => `
        <div class="small-stat p-4">
          <div class="text-sm text-calm-mute">${item.label}</div>
          <div class="text-2xl font-black mt-1 ${item.color}">${escapeHtml(String(item.value))}</div>
        </div>
      `).join('');

      const highlightCards = [
        {
          title: '节奏推进',
          body: `${rangeLabel}累计 ${workLogs.length} 段工作、${focusSessions.length} 次专注，完成任务 ${tasksDone} 项。`,
          note: `请假 ${leaveCount} 条 · 时间块 ${scheduleCount} 个 / ${formatMinutes(scheduleMinutes)}`
        },
        {
          title: '论文与投稿',
          body: `论文日志 ${thesisLogs.length} 条，共 ${formatMinutes(thesisMinutes)}${thesisWords ? `，${Math.round(thesisWords)} 字` : ''}。`,
          note: `章节更新 ${chapterUpdates} 次 · 里程碑完成 ${milestoneDone} 个 · 投稿动作 ${submissionMoves} 次`
        },
        {
          title: '健康恢复',
          body: `习惯平均完成 ${avgHabit}% ，运动 ${exerciseDays} 天，饮食记录 ${foodLogs} 条。`,
          note: `更适合看“是否有恢复动作”，而不只是有没有硬撑。`
        },
        {
          title: '心理与沟通',
          body: `心灵关怀 ${careDays} 天、导师沟通 ${mentorDays} 天、每日复盘 ${reviewDays} 天。`,
          note: `平均关怀压力 ${avgCareStress}/5 · 导师沟通压力 ${avgMentorPressure}/5 · 学术复盘项 ${reviewTemplateTotal} 条`
        }
      ];
      $('dashboardHighlights').innerHTML = highlightCards.map(item => `
        <div class="rounded-2xl bg-white border border-calm-line px-4 py-4">
          <div class="font-black">${escapeHtml(item.title)}</div>
          <div class="text-sm leading-6 mt-2">${escapeHtml(item.body)}</div>
          <div class="text-xs text-calm-mute mt-2">${escapeHtml(item.note)}</div>
        </div>
      `).join('');

      const coverageRows = [
        {
          label: '总览首页',
          ratio: dates.filter(d => totalAttendanceMinutes(d) > 0 || focusMinutesOn(d) > 0 || (state.timeBlocks?.[d]?.length || 0) > 0 || state.tasks.some(item => [item.createdAt, item.startedAt, item.doneAt].some(ts => dateFromDateTime(ts) === d))).length / Math.max(1, days),
          detail: `工作 ${workLogs.length} 段 · 专注 ${focusSessions.length} 次 · 完成任务 ${tasksDone}`
        },
        {
          label: '本科毕业论文进度',
          ratio: dates.filter(d => thesisLogs.some(item => item.date === d) || (state.thesis?.chapters || []).some(item => dateFromDateTime(item.updatedAt) === d) || (state.thesis?.milestones || []).some(item => dateFromDateTime(item.doneAt) === d)).length / Math.max(1, days),
          detail: `日志 ${thesisLogs.length} 条 · 章节更新 ${chapterUpdates} 次 · 里程碑 ${milestoneDone} 个`
        },
        {
          label: '投稿管理',
          ratio: Math.min(1, (submissionMoves + submissionDue) / Math.max(1, days)),
          detail: `新增 ${submissionCreated} · 更新 ${submissionUpdated} · 截止 ${submissionDue}`
        },
        {
          label: '健康管理',
          ratio: dates.filter(d => todayHabitCompletion(d) > 0 || state.foods.some(item => item.date === d)).length / Math.max(1, days),
          detail: `习惯均值 ${avgHabit}% · 运动 ${exerciseDays} 天 · 饮食 ${foodLogs} 条`
        },
        {
          label: '心灵关怀',
          ratio: careDays / Math.max(1, days),
          detail: `记录 ${careDays} 天 · 平均压力 ${avgCareStress}/5`
        },
        {
          label: '导师与 PAT 沟通',
          ratio: mentorDays / Math.max(1, days),
          detail: `记录 ${mentorDays} 天 · 等反馈 ${dates.filter(d => mentorEntryOn(d).status === 'waiting').length} 天`
        },
        {
          label: '每日复盘',
          ratio: reviewDays / Math.max(1, days),
          detail: `记录 ${reviewDays} 天 · 学术复盘项 ${reviewTemplateTotal} 条 · 明日优先 ${reviewPriorityTotal} 条`
        }
      ];
      $('dashboardCoverage').innerHTML = coverageRows.map(item => {
        const percent = Math.round(clamp(item.ratio * 100, 0, 100));
        return `
          <div class="rounded-2xl bg-white border border-calm-line px-3 py-3">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="font-bold">${escapeHtml(item.label)}</div>
                <div class="text-xs text-calm-mute mt-1">${escapeHtml(item.detail)}</div>
              </div>
              <span class="pill bg-dopamine-sky/10 text-dopamine-sky shrink-0">${percent}%</span>
            </div>
            <div class="mt-3 h-2 rounded-full bg-calm-bg overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-dopamine-orange via-dopamine-sky to-dopamine-mint" style="width:${percent}%"></div>
            </div>
          </div>`;
      }).join('');

      makeOrUpdateChart('focusChart','focus',{
        type:'line',
        data:{
          labels: dates.map(d => d.slice(5)),
          datasets:[{
            label:'专注分钟',
            data: dates.map(d => focusMinutesOn(d)),
            borderColor:'#FF8C42',
            backgroundColor:'rgba(255,140,66,0.18)',
            fill:true,
            tension:.35
          }]
        },
        options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:true } } }
      });
      makeOrUpdateChart('attendanceChart','attendance',{
        type:'bar',
        data:{
          labels: dates.map(d => d.slice(5)),
          datasets:[{
            label:'工作分钟',
            data: dates.map(d => totalAttendanceMinutes(d)),
            backgroundColor:'#4D9DE0',
            borderRadius:12
          }]
        },
        options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:true } } }
      });
      makeOrUpdateChart('habitChart','habit',{
        type:'line',
        data:{
          labels: dates.map(d => d.slice(5)),
          datasets:[{
            label:'完成度 %',
            data: dates.map(d => todayHabitCompletion(d)),
            borderColor:'#43AA8B',
            backgroundColor:'rgba(67,170,139,0.15)',
            fill:true,
            tension:.3
          }]
        },
        options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:true, max:100 } } }
      });
      makeOrUpdateChart('thesisChart','thesis',{
        type:'bar',
        data:{
          labels: dates.map(d => d.slice(5)),
          datasets:[
            {
              type:'bar',
              label:'投入分钟',
              data: dates.map(d => (state.thesis?.logs || []).filter(item => item.date === d).reduce((sum, item) => sum + (Number(item.minutes) || 0), 0)),
              backgroundColor:'#9B5DE5',
              borderRadius:12,
              yAxisID:'y'
            },
            {
              type:'line',
              label:'写作字数',
              data: dates.map(d => (state.thesis?.logs || []).filter(item => item.date === d).reduce((sum, item) => sum + (Number(item.words) || 0), 0)),
              borderColor:'#FF5A5F',
              backgroundColor:'rgba(255,90,95,0.15)',
              tension:.3,
              yAxisID:'y1'
            }
          ]
        },
        options:{
          responsive:true,
          maintainAspectRatio:false,
          scales:{
            y:{ beginAtZero:true, title:{ display:true, text:'分钟' } },
            y1:{ beginAtZero:true, position:'right', grid:{ drawOnChartArea:false }, title:{ display:true, text:'字数' } }
          }
        }
      });
      makeOrUpdateChart('wellbeingChart','wellbeing',{
        type:'bar',
        data:{
          labels: dates.map(d => d.slice(5)),
          datasets:[
            { label:'心灵关怀', data: dates.map(d => careCountOn(d)), backgroundColor:'#F6BD60', borderRadius:10 },
            { label:'导师沟通', data: dates.map(d => mentorCountOn(d)), backgroundColor:'#9B5DE5', borderRadius:10 },
            { label:'每日复盘', data: dates.map(d => reviewCountOn(d)), backgroundColor:'#FF5A5F', borderRadius:10 }
          ]
        },
        options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:true, max:1, ticks:{ stepSize:1 } } } }
      });
      const stageCounts = SUBMISSION_COLUMNS.map(stage => state.submissions.filter(item => item.stage===stage).length);
      makeOrUpdateChart('submissionChart','submission',{
        type:'doughnut',
        data:{ labels: SUBMISSION_COLUMNS, datasets:[{ data: stageCounts, backgroundColor: SUBMISSION_COLUMNS.map(stage => STAGE_COLORS[stage] || '#d1d5db') }] },
        options:{ responsive:true, maintainAspectRatio:false }
      });
    }

    function makeOrUpdateChart(canvasId, key, config) {
      const canvas = $(canvasId);
      if (!canvas) return;
      if (charts[key]) charts[key].destroy();
      charts[key] = new Chart(canvas, config);
    }

    function renderSettingsRangeStats() {
      const range = getStatsRange(todayStr());
      if ($('settingsStatsRangeLabel')) $('settingsStatsRangeLabel').textContent = range.label;
      const createdTasks = state.tasks.filter(t => t.createdAt && isDateInRange(dateFromDateTime(t.createdAt), range.start, range.end)).length;
      const doneTasks = state.tasks.filter(t => t.doneAt && isDateInRange(dateFromDateTime(t.doneAt), range.start, range.end)).length;
      const newSubs = state.submissions.filter(s => s.createdAt && isDateInRange(dateFromDateTime(s.createdAt), range.start, range.end)).length;
      const thesisLogs = (state.thesis?.logs || []).filter(l => isDateInRange(l.date, range.start, range.end)).length;
      const careLogs = range.dates.reduce((sum, date) => sum + careCountOn(date), 0);
      const mentorLogs = range.dates.reduce((sum, date) => sum + mentorCountOn(date), 0);
      const cards = [
        { label:`${statsModeText()}新增任务`, value: createdTasks, color:'text-dopamine-pink' },
        { label:`${statsModeText()}完成任务`, value: doneTasks, color:'text-dopamine-mint' },
        { label:`${statsModeText()}新增投稿`, value: newSubs, color:'text-dopamine-sky' },
        { label:`${statsModeText()}论文日志`, value: thesisLogs, color:'text-dopamine-purple' },
        { label:`${statsModeText()}心灵关怀`, value: careLogs, color:'text-dopamine-yellow' },
        { label:`${statsModeText()}导师沟通`, value: mentorLogs, color:'text-dopamine-orange' }
      ];
      $('settingsRangeStats').innerHTML = cards.map(item => `
        <div class="rounded-2xl bg-white border border-calm-line px-3 py-3">
          <div class="text-xs text-calm-mute">${item.label}</div>
          <div class="text-xl font-black mt-1 ${item.color}">${escapeHtml(String(item.value))}</div>
        </div>
      `).join('');
    }

    function refreshSettings() {
      const raw = JSON.stringify(state, null, 2);
      $('jsonEditor').value = raw;
      $('storageSizeText').textContent = bytesToKB(new Blob([raw]).size);
      $('settingsRefreshTime').textContent = nowDateTime();
      $('settingsSummary').innerHTML = [
        ['工作打卡', Object.values(state.attendance).reduce((sum,day)=>sum+(day.logs?.length||0),0)],
        ['请假记录', Object.values(state.attendance).reduce((sum,day)=>sum+(day.leaves?.length||0),0)],
        ['任务数', state.tasks.length],
        ['项目数', state.projects.length],
        ['专注记录', state.focus.sessions.length],
        ['饮食记录', state.foods.length],
        ['体重记录', state.weights.length],
        ['心灵关怀', Object.keys(state.care?.entries || {}).filter(date => careCountOn(date)).length],
        ['导师沟通', Object.keys(state.mentor?.entries || {}).filter(date => mentorCountOn(date)).length],
        ['每日复盘', Object.keys(state.reviewDaily?.entries || {}).filter(date => reviewCountOn(date)).length],
        ['投稿项目', state.submissions.length],
        ['论文日志', state.thesis?.logs?.length || 0]
      ].map(([label,value]) => `<div class="rounded-2xl bg-white border border-calm-line px-3 py-3"><div class="text-xs text-calm-mute">${label}</div><div class="text-xl font-black">${value}</div></div>`).join('');
    }

    function exportJson() {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type:'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `undergraduate_workspace_backup_${todayStr()}.json`; a.click();
      URL.revokeObjectURL(url);
    }
    async function copyJson() {
      await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
      alert('已复制到剪贴板。');
    }
    function importJsonText(raw) {
      if(!confirm('导入将替换本科工作台中的记录（学习中心记录不受影响）。先自动导出当前备份，继续吗？'))return;
      exportJson();
      try {
        const parsed = JSON.parse(raw); validateImportIds(parsed);
        if(!parsed||Array.isArray(parsed)||!Array.isArray(parsed.tasks)||!parsed.thesis||!parsed.focus)throw new Error('不是有效工作台备份');
        const next = {
          attendance: normalizeAttendance(parsed.attendance),
          timeBlocks: parsed.timeBlocks && typeof parsed.timeBlocks === 'object' ? parsed.timeBlocks : {},
          appleCalendar: parsed.appleCalendar && typeof parsed.appleCalendar === 'object' ? { events: Array.isArray(parsed.appleCalendar.events) ? parsed.appleCalendar.events : [], importedAt: String(parsed.appleCalendar.importedAt || ''), fileName: String(parsed.appleCalendar.fileName || '') } : { events:[], importedAt:'', fileName:'' },
          tasks: normalizeTasksState(parsed.tasks),
          projects: normalizeProjectsState(parsed.projects),
          focus: parsed.focus && typeof parsed.focus === 'object' ? { active: parsed.focus.active || null, sessions: Array.isArray(parsed.focus.sessions) ? parsed.focus.sessions : [] } : { active:null, sessions:[] },
          habits: normalizeHabitsState(parsed.habits),
          foods: Array.isArray(parsed.foods) ? parsed.foods : [],
          weights: Array.isArray(parsed.weights) ? parsed.weights.map(item => ({
            id: String(item.id || uid('weight')),
            date: String(item.date || dateFromDateTime(item.at) || todayStr()),
            value: Math.max(0, Number(item.value) || 0),
            unit: ['kg','斤','lb'].includes(item.unit) ? item.unit : 'kg',
            at: String(item.at || nowDateTime())
          })).filter(item => item.value > 0) : [],
          mood: normalizeMoodMap(parsed.mood),
          reflections: normalizeReflectionMap(parsed.reflections),
          care: normalizeCareState(parsed.care, parsed.mood),
          mentor: normalizeMentorState(parsed.mentor),
          reviewDaily: normalizeDailyReviewState(parsed.reviewDaily, parsed.reflections),
          submissions: normalizeSubmissions(parsed.submissions),
          thesis: normalizeThesisState(parsed.thesis), life: Array.isArray(parsed.life) ? parsed.life : [], portfolio: Array.isArray(parsed.portfolio) ? parsed.portfolio : [], journal: Array.isArray(parsed.journal) ? parsed.journal : [], trips: Array.isArray(parsed.trips) ? parsed.trips : [], travelMap: parsed.travelMap && typeof parsed.travelMap === "object" ? parsed.travelMap : {china:[],world:[]}, routines: Array.isArray(parsed.routines) ? parsed.routines : null, inventory: Array.isArray(parsed.inventory) ? parsed.inventory : null, recipes: Array.isArray(parsed.recipes) ? parsed.recipes : [], english: Array.isArray(parsed.english) ? parsed.english : [], studyAreas: Array.isArray(parsed.studyAreas) ? parsed.studyAreas : [], learningCycles: Array.isArray(parsed.learningCycles) ? parsed.learningCycles : [], studyModules: Array.isArray(parsed.studyModules) ? parsed.studyModules : [], books: Array.isArray(parsed.books) ? parsed.books : [], readingLogs: Array.isArray(parsed.readingLogs) ? parsed.readingLogs : [], newsNotes: Array.isArray(parsed.newsNotes) ? parsed.newsNotes : [], newsBriefs: Array.isArray(parsed.newsBriefs) ? parsed.newsBriefs : [], learningLinks: Array.isArray(parsed.learningLinks) ? parsed.learningLinks : [], customAchievements: Array.isArray(parsed.customAchievements) ? parsed.customAchievements : [], v4Seeds: parsed.v4Seeds && !Array.isArray(parsed.v4Seeds) && typeof parsed.v4Seeds === "object" ? parsed.v4Seeds : {}, inbox: Array.isArray(parsed.inbox) ? parsed.inbox : [], planItems: Array.isArray(parsed.planItems) ? parsed.planItems : [], pointsRules: Array.isArray(parsed.pointsRules) ? parsed.pointsRules : [], pointsLog: Array.isArray(parsed.pointsLog) ? parsed.pointsLog : [], universityAssessments: Array.isArray(parsed.universityAssessments) ? parsed.universityAssessments : [], placementLogs: Array.isArray(parsed.placementLogs) ? parsed.placementLogs : [], applications: Array.isArray(parsed.applications) ? parsed.applications : [], moneyTransactions: Array.isArray(parsed.moneyTransactions) ? parsed.moneyTransactions : [], moneyBudgets: Array.isArray(parsed.moneyBudgets) ? parsed.moneyBudgets : [], moneyAccounts: Array.isArray(parsed.moneyAccounts) ? parsed.moneyAccounts : [], wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [], styleItems: Array.isArray(parsed.styleItems) ? parsed.styleItems : [], decisionLog: Array.isArray(parsed.decisionLog) ? parsed.decisionLog : [], v5Meta: parsed.v5Meta && !Array.isArray(parsed.v5Meta) && typeof parsed.v5Meta === "object" ? parsed.v5Meta : {}
        };
        Object.keys(state).forEach(key => delete state[key]);
        Object.assign(state, next);
        saveState(); renderAll(); alert('已载入备份。请等顶部显示已保存到账号后再离开。');
      } catch (err) { console.error(err); alert('JSON 导入失败：' + (err && err.message ? err.message : '请选择工作台导出的 .json 文件，不要选择 .html 文件')); }
    }

    function clearAllData() {
      if (!confirm('确定清空全部数据吗？此操作不可撤销。')) return;
      exportJson(); Object.keys(state).forEach(k=>delete state[k]); window.__initialWorkspace={}; Object.assign(state,loadState()); saveState(); renderAll();
    }

    function openEditDialog(config) {
      editContext = config;
      $('editDialogTitle').textContent = config.title || '编辑记录';
      $('editDialogDesc').textContent = config.desc || '';
      $('editDialogBody').innerHTML = (config.fields || []).map(field => {
        if (field.type === 'textarea') {
          return `<label class="block"><div class="text-sm font-bold mb-1">${field.label}</div><textarea data-edit-field="${field.name}" rows="${field.rows||4}" class="w-full px-3 py-3 rounded-2xl border border-calm-line bg-white">${escapeHtml(field.value||'')}</textarea></label>`;
        }
        if (field.type === 'select') {
          const options = Array.isArray(field.options) ? field.options : [];
          const current = String(field.value ?? '');
          const html = options.map(opt => {
            const value = String(opt?.value ?? '');
            const label = String(opt?.label ?? value);
            return `<option value="${escapeHtml(value)}" ${value===current ? 'selected' : ''}>${escapeHtml(label)}</option>`;
          }).join('');
          return `<label class="block"><div class="text-sm font-bold mb-1">${field.label}</div><select data-edit-field="${field.name}" class="w-full px-3 py-3 rounded-2xl border border-calm-line bg-white font-semibold">${html}</select></label>`;
        }
        return `<label class="block"><div class="text-sm font-bold mb-1">${field.label}</div><input data-edit-field="${field.name}" type="${field.type||'text'}" value="${escapeHtml(field.value||'')}" class="w-full px-3 py-3 rounded-2xl border border-calm-line bg-white"></label>`;
      }).join('');
      $('btnDeleteRecord').style.display = config.onDelete ? 'inline-flex' : 'none';
      $('editDialog').showModal();
    }
    function closeEditDialog() { $('editDialog').close(); editContext = null; }
    function collectEditValues() {
      const vals = {};
      $('editDialogBody').querySelectorAll('[data-edit-field]').forEach(el => vals[el.dataset.editField] = el.value);
      return vals;
    }

    function openProjectEditor(id) {
      const project = state.projects.find(item => item.id===id); if (!project) return;
      openEditDialog({
        title:'修改项目',
        desc:project.title,
        fields:[
          { name:'title', label:'项目名', value:project.title },
          { name:'outcome', label:'完成结果', value:project.outcome },
          { name:'area', label:'项目类别', type:'select', value:project.area, options:PROJECT_AREAS.map(item => ({ value:item.value, label:item.label })) },
          { name:'status', label:'项目状态', type:'select', value:project.status, options:PROJECT_STATUS_OPTIONS.map(item => ({ value:item.value, label:item.label })) },
          { name:'startDate', label:'开始日期', type:'date', value:project.startDate || dateFromDateTime(project.createdAt) || '' },
          { name:'deadline', label:'截止日期', type:'date', value:project.deadline || '' },
          { name:'note', label:'备注', type:'textarea', value:project.note || '' }
        ],
        onSave:(vals)=>{
          project.title = vals.title.trim() || project.title;
          project.outcome = vals.outcome.trim();
          project.area = projectAreaMeta(vals.area).value;
          project.status = projectStatusMeta(vals.status).value;
          project.startDate = vals.startDate || '';
          project.deadline = vals.deadline || '';
          project.note = vals.note || '';
          project.updatedAt = nowDateTime();
          saveState(); renderAll();
        },
        onDelete:()=>{
          state.tasks = state.tasks.map(item => item.projectId === id ? { ...item, projectId:'' } : item);
          state.projects = state.projects.filter(item => item.id !== id);
          saveState(); renderAll();
        }
      });
    }

    function openTaskEditor(id) {
      const task = state.tasks.find(item => item.id===id); if (!task) return;
      openEditDialog({
        title:'修改任务', desc:task.status==='done'?'已完成任务':'任务信息',
        fields:[
          { name:'title', label:'任务名称', value:task.title },
          { name:'projectId', label:'所属项目', type:'select', value:task.projectId || '', options:[{ value:'', label:'未关联项目' }, ...state.projects.map(project => ({ value:project.id, label:project.title }))] },
          { name:'quadrant', label:'紧急程度（4 象限）', type:'select', value:task.quadrant || 'q2', options:QUADRANT_OPTIONS.map(item => ({ value:item.value, label:item.label })) },
          { name:'status', label:'状态', type:'select', value:task.status, options:TASK_STATUS_OPTIONS.map(item => ({ value:item.value, label:item.label })) },
          { name:'joinToday', label:'加入今日执行', type:'select', value:task.todayBucket ? 'yes' : 'no', options:[{ value:'no', label:'否' }, { value:'yes', label:'是' }] },
          { name:'dueDate', label:'截止日期', type:'date', value:task.dueDate || '' },
          { name:'estimate', label:'预计分钟', value:String(task.estimate || '') }
        ],
        onSave:(vals)=>{
          const wasDone = task.status === 'done';
          task.title = vals.title.trim() || task.title;
          task.projectId = vals.projectId || '';
          task.quadrant = taskQuadrantMeta(vals.quadrant).value;
          task.dueDate = vals.dueDate || '';
          task.estimate = Math.max(0, Number(vals.estimate) || 0);
          const nextStatus = taskStatusMeta(vals.status).value;
          if (nextStatus === 'done' && !wasDone) {
            finishTask(task.id);
            return;
          }
          task.status = nextStatus;
          if (nextStatus === 'done') {
            task.gtdBucket = 'done';
            task.todayBucket = '';
            task.doneAt = task.doneAt || nowDateTime();
          } else {
            task.gtdBucket = task.projectId ? 'next' : 'inbox';
            task.todayBucket = vals.joinToday === 'yes' ? (task.todayBucket || 'should') : '';
            task.doneAt = '';
            if (nextStatus === 'active') task.startedAt = task.startedAt || nowDateTime();
          }
          saveState(); renderAll();
        },
        onDelete:()=>{ deleteTask(id); }
      });
    }
    function openWorkLogEditor(id) {
      const day = getDayAttendance(); const item = day.logs.find(log => log.id===id); if (!item) return;
      openEditDialog({ title:'修改工作打卡', desc: dayLabel(item.date), fields:[{name:'start',label:'开始时间',type:'time',value:item.start},{name:'end',label:'结束时间',type:'time',value:item.end||''}], onSave:(vals)=>{ item.start=parseHM(vals.start)||item.start; item.end=parseHM(vals.end)||null; saveState(); renderAll(); }, onDelete:()=>{ day.logs = day.logs.filter(log => log.id!==id); saveState(); renderAll(); } });
    }
    function openLeaveEditor(id) {
      const day = getDayAttendance(); const item = day.leaves.find(v => v.id===id); if (!item) return;
      openEditDialog({ title:'修改请假记录', desc: dayLabel(item.date), fields:[{name:'type',label:'请假类型',value:item.type}], onSave:(vals)=>{ item.type = vals.type.trim() || item.type; saveState(); renderAll(); }, onDelete:()=>{ day.leaves = day.leaves.filter(v => v.id!==id); saveState(); renderAll(); } });
    }
    function openFocusEditor(id) {
      const item = state.focus.sessions.find(v => v.id===id); if (!item) return;
      openEditDialog({ title:'修改专注记录', desc:item.date, fields:[{name:'date',label:'日期',type:'date',value:item.date},{name:'title',label:'主题',value:item.title},{name:'start',label:'开始时间',type:'time',value:item.start},{name:'end',label:'结束时间',type:'time',value:item.end}], onSave:(vals)=>{ item.date = vals.date || item.date; item.title = vals.title.trim() || item.title; item.start = parseHM(vals.start)||item.start; item.end = parseHM(vals.end)||item.end; item.minutes = minutesBetween(item.start,item.end); saveState(); renderAll(); }, onDelete:()=>{ state.focus.sessions = state.focus.sessions.filter(v => v.id!==id); saveState(); renderAll(); } });
    }
    function openBlockEditor(id,date) {
      const blocks = getDayTimeBlocks(date); const item = blocks.find(v => v.id===id); if (!item) return;
      openEditDialog({ title:'修改日程安排', desc:date, fields:[{name:'date',label:'日期',type:'date',value:date},{name:'title',label:'标题',value:item.title},{name:'start',label:'开始时间',type:'time',value:item.start},{name:'end',label:'结束时间',type:'time',value:item.end}], onSave:(vals)=>{ const targetDate = vals.date || date; item.title = vals.title.trim() || item.title; item.start = parseHM(vals.start)||item.start; item.end = parseHM(vals.end)||item.end; if (targetDate !== date) { state.timeBlocks[date] = blocks.filter(v => v.id!==id); getDayTimeBlocks(targetDate).push(item); } saveState(); $('scheduleDate').value = targetDate; renderAll(); }, onDelete:()=>{ state.timeBlocks[date] = blocks.filter(v => v.id!==id); saveState(); renderAll(); } });
    }
    function openFoodEditor(id) {
      const item = state.foods.find(v => v.id===id); if (!item) return;
      openEditDialog({ title:'修改饮食记录', desc:item.date, fields:[{name:'date',label:'日期',type:'date',value:item.date},{name:'meal',label:'类别',value:item.meal},{name:'text',label:'内容',type:'textarea',value:item.text}], onSave:(vals)=>{ item.date = vals.date || item.date; item.meal = vals.meal.trim() || item.meal; item.text = vals.text.trim() || item.text; saveState(); renderAll(); }, onDelete:()=>{ state.foods = state.foods.filter(v => v.id!==id); saveState(); renderAll(); } });
    }
    function openWeightEditor(id) {
      const item = state.weights.find(v => v.id===id); if (!item) return;
      openEditDialog({
        title:'修改体重记录',
        desc:item.date,
        fields:[
          { name:'date', label:'日期', type:'date', value:item.date },
          { name:'value', label:'数值', type:'number', value:String(item.value) },
          { name:'unit', label:'单位（kg / 斤 / lb）', value:item.unit || 'kg' }
        ],
        onSave:(vals)=>{
          item.date = vals.date || item.date;
          item.value = Math.max(0, Number(vals.value) || item.value);
          item.unit = ['kg','斤','lb'].includes(vals.unit) ? vals.unit : item.unit;
          saveState(); renderAll();
        },
        onDelete:()=>{ state.weights = state.weights.filter(v => v.id!==id); saveState(); renderAll(); }
      });
    }
    function openSubmissionEditor(id) {
      const item = state.submissions.find(v => v.id===id); if (!item) return;
      openEditDialog({ title:'修改投稿项目', desc:item.venue || '', fields:[{name:'title',label:'题目',value:item.title},{name:'venue',label:'Venue',value:item.venue||''},{name:'deadline',label:'截止日期',type:'date',value:item.deadline||''},{name:'stage',label:'阶段',value:item.stage||''},{name:'notes',label:'备注',type:'textarea',value:item.notes||''}], onSave:(vals)=>{ item.title = vals.title.trim() || item.title; item.venue = vals.venue.trim(); item.deadline = vals.deadline || ''; item.stage = SUBMISSION_COLUMNS.includes(vals.stage) ? vals.stage : item.stage; item.notes = vals.notes || ''; item.updatedAt = nowDateTime(); syncSubmissionProject(item); saveState(); renderAll(); }, onDelete:()=>{ state.submissions = state.submissions.filter(v => v.id!==id); state.projects = state.projects.filter(project => project.note !== submissionProjectNote(id)); saveState(); renderAll(); } });
    }

    function openThesisMilestoneEditor(id) {
      const item = state.thesis.milestones.find(v => v.id === id);
      if (!item) return;
      openEditDialog({
        title:'修改里程碑',
        desc:'本科毕业论文进度',
        fields:[
          { name:'name', label:'名称', value:item.name },
          { name:'due', label:'截止日期', type:'date', value:item.due || '' },
          { name:'done', label:'完成（true / false，可留空保持不变）', value:'' },
          { name:'note', label:'备注', type:'textarea', value:item.note || '' }
        ],
        onSave:(vals) => {
          item.name = vals.name.trim() || item.name;
          item.due = vals.due || '';
          item.note = vals.note || '';
          const doneRaw = String(vals.done || '').trim().toLowerCase();
          if (doneRaw) {
            const prev = !!item.done;
            item.done = ['true','1','yes','y'].includes(doneRaw);
            if (item.done && !prev) item.doneAt = nowDateTime();
            if (!item.done) item.doneAt = '';
          }
          saveState(); renderAll();
        },
        onDelete:() => {
          state.thesis.milestones = state.thesis.milestones.filter(v => v.id !== id);
          saveState(); renderAll();
        }
      });
    }
    function openThesisChapterEditor(id) {
      const item = state.thesis.chapters.find(v => v.id === id);
      if (!item) return;
      openEditDialog({
        title:'修改章节',
        desc:'本科毕业论文进度',
        fields:[
          { name:'name', label:'名称', value:item.name },
          { name:'progress', label:'进度（0-100）', value:String(item.progress ?? 0) },
          { name:'status', label:'状态（draft / revise / done）', value:item.status || 'draft' },
          { name:'note', label:'备注', type:'textarea', value:item.note || '' }
        ],
        onSave:(vals) => {
          item.name = vals.name.trim() || item.name;
          item.progress = Math.max(0, Math.min(100, Number(vals.progress) || 0));
          item.status = ['draft','revise','done'].includes(vals.status) ? vals.status : item.status;
          if (item.progress >= 100) item.status = 'done';
          item.note = vals.note || '';
          item.updatedAt = nowDateTime();
          saveState(); renderAll();
        },
        onDelete:() => {
          state.thesis.chapters = state.thesis.chapters.filter(v => v.id !== id);
          saveState(); renderAll();
        }
      });
    }
    function openThesisLogEditor(id) {
      const item = state.thesis.logs.find(v => v.id === id);
      if (!item) return;
      openEditDialog({
        title:'修改推进日志',
        desc:'本科毕业论文进度',
        fields:[
          { name:'date', label:'日期', type:'date', value:item.date || todayStr() },
          { name:'type', label:'类型（writing / revise / experiment / meeting / other）', value:item.type || 'other' },
          { name:'minutes', label:'分钟', value:String(item.minutes ?? 0) },
          { name:'words', label:'字数', value:String(item.words ?? 0) },
          { name:'note', label:'备注', type:'textarea', value:item.note || '' }
        ],
        onSave:(vals) => {
          item.date = vals.date || item.date;
          item.type = ['writing','revise','experiment','meeting','other'].includes(vals.type) ? vals.type : item.type;
          item.minutes = Math.max(0, Number(vals.minutes) || 0);
          item.words = Math.max(0, Number(vals.words) || 0);
          item.note = vals.note || '';
          saveState(); renderAll();
        },
        onDelete:() => {
          state.thesis.logs = state.thesis.logs.filter(v => v.id !== id);
          saveState(); renderAll();
        }
      });
    }

    function renderAll() {
      updateClock();
      syncStatsModeButtons();
      renderSidebarSnapshot();
      renderHomeQuickLinks();
      renderHomeThemeStats();
      renderWorkflow();
      renderThesis();
      renderHomeAttendance();
      renderTasks();
      renderFocusTimeline();
      renderTimeline();
      renderSchedulePlanner();
      renderHabitSnapshot();
      renderHabitList();
      renderHabitManager();
      renderFoods();
      renderWeights();
      renderCareThemeStats();
      renderCare();
      renderMentorThemeStats();
      renderMentor();
      renderReview();
      renderReviewThemeStats();
      renderAchievements();
      renderAchievementRangeStats();
      renderSubmissionBoard();
      renderSettingsRangeStats();
      if (currentSection === 'dashboard-section') renderDashboard();
      if (currentSection === 'settings-section') refreshSettings();
    }

    function bindEvents() {
      document.querySelectorAll('.nav-btn').forEach(btn => btn.onclick = () => navTo(btn.dataset.target));
      document.querySelectorAll('.stats-mode-btn').forEach(btn => btn.onclick = () => setStatsMode(btn.dataset.statsMode));
      $('btnSidebarToggle').onclick = toggleSidebar;

      $('btnSaveThesisMeta').onclick = saveThesisMeta;
      $('btnAddThesisMilestone').onclick = addThesisMilestone;
      $('btnAddThesisChapter').onclick = addThesisChapter;
      $('btnAddThesisLog').onclick = addThesisLog;
      $('thesisLogDate').value = todayStr();

      $('btnCheckinStart').onclick = addWorkLog;
      $('btnCheckinEnd').onclick = endWorkLog;
      $('btnLeaveAdd').onclick = addLeave;
      $('btnCloseOpenLogs').onclick = closeAllOpenLogs;
      $('btnClearTodayLeaves').onclick = clearTodayLeaves;

      $('workflowDate').value = todayStr();
      if ($('workflowProjectStartDate')) $('workflowProjectStartDate').value = todayStr();
      $('workflowDate').onchange = renderAll;
      $('btnWorkflowToday').onclick = () => { $('workflowDate').value = todayStr(); renderAll(); };
      $('btnWorkflowCapture').onclick = addWorkflowCaptureTask;
      $('btnAddWorkflowProject').onclick = addWorkflowProject;
      $('workflowTaskFilter').onchange = renderWorkflow;
      if ($('workflowProjectFilterSelect')) $('workflowProjectFilterSelect').onchange = () => { workflowSelectedProjectId = $('workflowProjectFilterSelect').value || ''; renderWorkflow(); };
      const jumpWorkflowToSchedule = () => {
        $('scheduleDate').value = $('workflowDate').value || todayStr();
        navTo('home-section');
        renderAll();
      };
      $('btnWorkflowJumpScheduleTop').onclick = jumpWorkflowToSchedule;

      $('btnAddTask').onclick = addTask;
      $('taskInput').addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
      $('btnFocusStart').onclick = startFocus;
      $('btnFocusStop').onclick = stopFocus;
      $('btnFocusDiscard').onclick = discardFocus;
      $('manualFocusDate').value = todayStr();
      $('btnAddManualFocus').onclick = addManualFocus;
      $('scheduleDate').value = todayStr();
      $('scheduleDate').onchange = renderAll;
      $('btnScheduleToday').onclick = () => { $('scheduleDate').value = todayStr(); renderAll(); };
      $('scheduleTaskSelect').onchange = () => {
        const task = state.tasks.find(item => item.id === $('scheduleTaskSelect').value);
        if (!task) return;
        $('scheduleTaskTitle').value = task.title;
        if (parseHM($('scheduleTaskStart').value) && task.estimate) $('scheduleTaskEnd').value = addMinutesToHM($('scheduleTaskStart').value, task.estimate);
      };
      $('scheduleTaskStart').onchange = () => {
        const task = state.tasks.find(item => item.id === $('scheduleTaskSelect').value);
        if (task?.estimate && parseHM($('scheduleTaskStart').value)) $('scheduleTaskEnd').value = addMinutesToHM($('scheduleTaskStart').value, task.estimate);
      };
      $('btnAddTaskBlock').onclick = addScheduledTaskBlock;

      $('habitDate').value = todayStr();
      $('habitDate').onchange = renderAll;
      $('btnHabitToday').onclick = () => { $('habitDate').value = todayStr(); renderAll(); };
      $('btnAddHabit').onclick = addCustomHabit;
      $('btnAddFood').onclick = addFood;
      $('btnAddWeight').onclick = addWeight;

      $('careDate').value = todayStr();
      $('careDate').onchange = renderAll;
      $('btnCareToday').onclick = () => { $('careDate').value = todayStr(); renderAll(); };
      document.querySelectorAll('[data-care-mood]').forEach(btn => btn.onclick = () => {
        selectedCareMood = btn.dataset.careMood;
        document.querySelectorAll('[data-care-mood]').forEach(el => el.classList.toggle('active', el.dataset.careMood === selectedCareMood));
      });
      $('btnSaveCare').onclick = saveCareEntry;
      $('btnDeleteCare').onclick = () => { if (confirm('确定清空这天的心灵关怀记录吗？')) deleteCareEntry(); };

      $('mentorDate').value = todayStr();
      $('mentorDate').onchange = renderAll;
      $('btnMentorToday').onclick = () => { $('mentorDate').value = todayStr(); renderAll(); };
      $('btnSaveMentor').onclick = saveMentorEntry;
      $('btnDeleteMentor').onclick = () => { if (confirm('确定清空这天的导师沟通记录吗？')) deleteMentorEntry(); };

      $('reviewDate').value = todayStr();
      $('reviewDate').onchange = renderAll;
      $('btnSaveDailyReview').onclick = saveDailyReview;
      $('btnDeleteDailyReview').onclick = () => { if (confirm('确定清空这天的每日复盘吗？')) deleteDailyReview(); };
      $('btnDownloadReviewMd').onclick = downloadReviewMarkdown;
      $('btnReviewToday').onclick = () => { $('reviewDate').value = todayStr(); renderAll(); };

      $('btnToggleSubmissionForm').onclick = () => $('submissionFormWrap').classList.toggle('hidden');
      $('btnCancelSubmissionForm').onclick = () => $('submissionFormWrap').classList.add('hidden');
      $('btnAddSubmission').onclick = addSubmission;
      $('submissionFilterQuery').oninput = renderSubmissionBoard;
      $('submissionFilterMonth').onchange = renderSubmissionBoard;
      $('submissionFilterStage').onchange = renderSubmissionBoard;
      $('submissionLogDate').value = todayStr();
      $('submissionLogProject').onchange = renderSubmissionLogs;
      $('btnAddSubmissionLog').onclick = addSubmissionLog;
      $('btnDownloadSubmissionMd').onclick = downloadSubmissionMarkdown;

      $('dashboardRange').onchange = () => {
        const v = String($('dashboardRange').value || '');
        if (v === '7') setStatsMode('week');
        else if (v === '30') setStatsMode('month');
        else setStatsMode('day');
      };

      $('btnExportJson').onclick = exportJson;
      $('btnCopyJson').onclick = copyJson;
      $('btnImportJsonText').onclick = () => importJsonText($('jsonEditor').value);
      $('btnRefreshJsonPreview').onclick = refreshSettings;
      $('btnClearAllData').onclick = clearAllData;
      $('importFile').onchange = async (e) => { const file = e.target.files?.[0]; if (!file) return; importJsonText(await file.text()); e.target.value=''; };

      $('btnCloseEditDialog').onclick = closeEditDialog;
      $('btnSaveRecord').onclick = () => { const result = editContext?.onSave ? editContext.onSave(collectEditValues()) : undefined; if(result !== false) closeEditDialog(); };
      $('btnDeleteRecord').onclick = () => { if (editContext?.onDelete && confirm('确定删除这条记录吗？')) { editContext.onDelete(); closeEditDialog(); } };
    }

// Undergraduate and life modules share the reference's save/edit and task workflows.
const LIFE_TYPES={
 course:{label:'课程与作业',fields:[['title','课程 / 作业名称'],['module','所属模块'],['date','截止日期','date'],['weight','成绩占比（%）','number'],['status','当前状态'],['notes','要求、反馈与下一步','textarea']]},
 placement:{label:'Placement',fields:[['title','单位 / 活动'],['date','日期','date'],['hours','实际小时','number'],['contact','直接接触小时（如适用）','number'],['proof','证明 / 签字人 / 文件位置'],['notes','具体工作与反思','textarea']]},
 requirement:{label:'小时要求',fields:[['title','学校要求名称'],['hours','确认后的要求小时','number'],['date','核对日期','date'],['notes','官方要求来源与计入规则','textarea']]},
 finance:{label:'收支与预算',fields:[['title','项目'],['date','日期','date'],['flow','类别','select',['支出','收入','预算']],['amount','金额','number'],['currency','币种','select',['GBP','CNY','USD','HKD']],['notes','用途与调整','textarea']]},
 wish:{label:'愿望与消费',fields:[['title','想买 / 想做的事'],['date','冷静期复查日期','date'],['amount','预计金额','number'],['currency','币种','select',['GBP','CNY','USD','HKD']],['notes','喜欢的具体理由、使用场景与机会成本','textarea']]},
 career:{label:'申请与职业',fields:[['title','项目 / 岗位 / 奖学金'],['date','截止 / 跟进日期','date'],['status','状态'],['contact','推荐人 / 联系人'],['notes','材料清单、证据与下一步','textarea']]},
 relationship:{label:'关系与边界',fields:[['title','关系 / 对话主题'],['date','联系 / 复查日期','date'],['notes','发生了什么、我的需求、边界、下一步','textarea']]},
 aesthetic:{label:'审美与作品',fields:[['title','对象 / 作品'],['date','观察日期','date'],['url','来源链接'],['notes','比例、色彩、材质、语境；我自己的判断','textarea']]},
 life:{label:'生活与旅行',fields:[['title','行程 / 家务 / 生活事务'],['date','计划日期','date'],['status','状态'],['notes','安排、准备物品与下一步','textarea']]},
 media:{label:'兴趣与体验',fields:[['title','电影 / 比赛 / 茶 / 阅读'],['date','体验日期','date'],['notes','让我好奇或被触动的地方','textarea']]},
 admin:{label:'证件与续期',fields:[['title','事务名称（不填证件号码）'],['date','到期 / 提醒日期','date'],['status','状态'],['notes','材料位置与办理步骤；不要填写密码','textarea']]}
};
function lifeRows(){if(!Array.isArray(state.life))state.life=[];state.life=state.life.filter(r=>r&&LIFE_TYPES[r.type]&&/^[a-zA-Z0-9_-]+$/.test(r.id||''));return state.life;}
function editLife(type,id=''){
 const definition=LIFE_TYPES[type];if(!definition)return;const old=lifeRows().find(r=>r.id===id)||{};
 openEditDialog({title:definition.label,desc:'保存后可再编辑。需要跟进的记录可单独加入项目任务。',fields:definition.fields.map(([name,label,kind,options])=>({name,label,type:kind||'text',value:old[name]||((name==='date'&&['placement','finance','aesthetic','media'].includes(type))?todayStr():''),options:options?.map(v=>({value:v,label:v}))})),onSave:values=>{
 if(!values.title?.trim()){alert('请填写名称');return false;}const item={...old,...values,id:id||uid('life'),type,updatedAt:nowDateTime()};
 if(['hours','amount','contact','weight'].some(k=>item[k]!==''&&item[k]!=null&&(!Number.isFinite(Number(item[k]))||Number(item[k])<0))){alert('数值必须为非负数');return false;}
 if(id)state.life=lifeRows().map(r=>r.id===id?item:r);else state.life.unshift(item);saveState();renderLife();
 },onDelete:id?()=>{state.life=lifeRows().filter(r=>r.id!==id);saveState();renderLife();}:null});
}
function lifeToTask(id){const r=lifeRows().find(x=>x.id===id);if(!r)return;const taskId='life_'+id;if(state.tasks.some(t=>t.id===taskId)){navTo('workflow-section');return;}
 state.tasks.unshift(normalizeTaskItem({id:taskId,title:r.title,gtdBucket:'next',quadrant:'q2',status:'todo',dueDate:r.date||'',estimate:25,todayBucket:r.date===todayStr()?'should':''}));saveState();renderAll();alert('已加入任务总表；到期任务会进入今日执行。');}
function renderLife(){
 const select=$('lifeFilter');if(select.options.length===1)Object.entries(LIFE_TYPES).forEach(([id,t])=>select.add(new Option(t.label,id)));
 $('lifeTypes').innerHTML=Object.entries(LIFE_TYPES).map(([id,t])=>`<button data-life-type="${id}" onclick="editLife('${id}')">＋ ${t.label}</button>`).join('');
 const q=$('lifeSearch').value.toLowerCase(),type=select.value;
 const all=lifeRows(),items=all.filter(r=>(type==='all'||r.type===type)&&JSON.stringify(r).toLowerCase().includes(q)).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
 const hours=all.filter(r=>r.type==='placement').reduce((s,r)=>s+(Number(r.hours)||0),0);
 const money=['GBP','CNY','USD','HKD'].map(c=>{const expense=all.filter(r=>r.type==='finance'&&r.flow==='支出'&&r.currency===c&&(r.date||'').startsWith(todayStr().slice(0,7))).reduce((s,r)=>s+(Number(r.amount)||0),0);return `${c} ${expense.toFixed(2)}`;}).join(' · ');
 $('lifeStats').innerHTML=`<div class="small-stat p-3">真实 placement：<b>${hours.toFixed(1)} 小时</b><p>按学校核实要求判断，不自动假定毕业达标。</p></div><div class="small-stat p-3">本月支出<p>${money}</p></div><div class="small-stat p-3">全部生活记录：<b>${all.length}</b><p>不同币种不相加，记录数不代表生活质量。</p></div>`;
 $('lifeList').innerHTML=items.length?items.map(r=>`<article class="life-card"><span class="label">${escapeHtml(LIFE_TYPES[r.type].label)} · ${escapeHtml(r.date||'未安排日期')}</span><h3>${escapeHtml(r.title)}</h3><div class="life-grid">${LIFE_TYPES[r.type].fields.filter(([k])=>!['title','date','notes'].includes(k)&&r[k]).map(([k,l])=>`<p><span class="label">${escapeHtml(l)}：</span>${escapeHtml(r[k])}</p>`).join('')}</div><p>${escapeHtml(r.notes||'')}</p><button onclick="editLife('${r.type}','${r.id}')">编辑 / 删除</button> <button onclick="lifeToTask('${r.id}')">加入跟进任务</button></article>`).join(''):'<p class="text-calm-mute py-6">还没有匹配记录。点击上方类型添加第一条。</p>';
}
$('lifeSearch').oninput=renderLife;$('lifeFilter').onchange=renderLife;

const STUDIO_DEFS={
 portfolio:{title:'作品',fields:[['type','类型','select',['论文','Written work','Lesson plan','Research','Placement','其他']],['title','作品名称'],['date','完成 / 更新日期','date'],['status','状态','select',['构思','进行中','待反馈','完成','已发表']],['url','文件或公开链接'],['summary','核心问题、论点与方法','textarea'],['evidence','成果证据 / 反馈 / 下一版改进','textarea']]},
 journal:{title:'日记与笔记',fields:[['type','笔记类型','select',['日记','读书','电影','游戏','比赛','茶与体验']],['title','标题'],['date','日期','date'],['source','书名 / 影片 / 游戏 / 事件'],['rating','个人评分（可留空）'],['summary','发生了什么 / 内容摘要','textarea'],['judgement','我的判断、疑问或改变','textarea'],['connection','与教育、社会或自己的连接','textarea']]},
 trip:{title:'旅行日志',fields:[['title','地点 / 行程'],['date','日期','date'],['region','国家 / 省区'],['companions','同行人'],['status','状态','select',['想去','计划中','去过','想重访']],['summary','路线、花费、准备或现场记录','textarea'],['judgement','最具体的感受与下次调整','textarea']]}
};
function studioRows(kind){const key=kind==='trip'?'trips':kind;if(!Array.isArray(state[key]))state[key]=[];state[key]=state[key].filter(r=>r&&/^[a-zA-Z0-9_-]+$/.test(r.id||''));return state[key];}
function editStudio(kind,id=''){const def=STUDIO_DEFS[kind],rows=studioRows(kind),old=rows.find(r=>r.id===id)||{};openEditDialog({title:def.title,desc:'只保存你真实完成、观察或计划的内容；链接可以留空。',fields:def.fields.map(([name,label,type,options])=>({name,label,type:type||'text',value:old[name]||((name==='date')?todayStr():''),options:options?.map(v=>({value:v,label:v}))})),onSave:v=>{if(!v.title?.trim()){alert('请填写标题');return false;}const item={...old,...v,id:id||uid(kind),updatedAt:nowDateTime()};const key=kind==='trip'?'trips':kind;state[key]=id?rows.map(r=>r.id===id?item:r):[item,...rows];saveState();renderStudio();},onDelete:id?()=>{const key=kind==='trip'?'trips':kind;state[key]=rows.filter(r=>r.id!==id);saveState();renderStudio();}:null});}
function setStudioTab(tab){['portfolio','journal','travel'].forEach(x=>{$('studio'+x[0].toUpperCase()+x.slice(1)).hidden=x!==tab;});document.querySelectorAll('[data-studio-tab]').forEach(b=>b.classList.toggle('active',b.dataset.studioTab===tab));renderStudio();}
function renderStudio(){
 const pQ=$('portfolioSearch').value.toLowerCase(),pF=$('portfolioFilter').value;const p=studioRows('portfolio').filter(r=>(pF==='all'||r.type===pF)&&JSON.stringify(r).toLowerCase().includes(pQ));
 $('portfolioList').innerHTML=p.length?p.map(r=>`<article class="portfolio-card"><span>${escapeHtml(r.type||'作品')} · ${escapeHtml(r.status||'未标状态')}</span><h3>${escapeHtml(r.title)}</h3><p>${escapeHtml(r.summary||'尚未填写摘要')}</p><small>${escapeHtml(r.date||'日期待定')}</small><div><button onclick="editStudio('portfolio','${r.id}')">阅读 / 编辑</button>${r.url?`<a href="${safeExternalUrl(r.url)}" target="_blank" rel="noopener noreferrer">打开作品</a>`:''}</div></article>`).join(''):'<div class="empty-state">还没有作品。先放入一篇论文、written work 或 lesson plan。</div>';
 const jQ=$('journalSearch').value.toLowerCase(),jF=$('journalFilter').value;const j=studioRows('journal').filter(r=>(jF==='all'||r.type===jF)&&JSON.stringify(r).toLowerCase().includes(jQ));
 $('journalQuick').innerHTML=['日记','读书','电影','游戏','比赛','茶与体验'].map(t=>`<button onclick="editStudioPreset('${t}')">＋ ${t}</button>`).join('');
 $('journalList').innerHTML=j.length?j.map(r=>`<article class="note-card"><span>${escapeHtml(r.type||'笔记')} · ${escapeHtml(r.date||'')}</span><h3>${escapeHtml(r.title)}</h3><p>${escapeHtml(r.judgement||r.summary||'')}</p><button onclick="editStudio('journal','${r.id}')">继续写 / 删除</button></article>`).join(''):'<div class="empty-state">没有匹配的笔记。记录一个具体判断就够了。</div>';
 renderTravel();
}
function safeExternalUrl(raw){try{const u=new URL(raw,location.origin);return ['http:','https:'].includes(u.protocol)?escapeHtml(u.href):'#';}catch{return '#';}}
function editStudioPreset(type){editStudio('journal');setTimeout(()=>{const el=document.querySelector('#editDialogBody [data-edit-field="type"]');if(el)el.value=type;},0);}
['portfolioSearch','portfolioFilter','journalSearch','journalFilter'].forEach(id=>{$(id).oninput=renderStudio;$(id).onchange=renderStudio;});
document.querySelectorAll('[data-studio-tab]').forEach(b=>b.onclick=()=>setStudioTab(b.dataset.studioTab));

const CHINA_REGIONS=['北京','天津','河北','山西','内蒙古','辽宁','吉林','黑龙江','上海','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','广西','海南','重庆','四川','贵州','云南','西藏','陕西','甘肃','青海','宁夏','新疆','香港','澳门','台湾'];
const WORLD_REGIONS={
 亚洲:['中国','日本','韩国','朝鲜','蒙古','新加坡','马来西亚','泰国','越南','菲律宾','印度尼西亚','文莱','柬埔寨','老挝','缅甸','东帝汶','印度','巴基斯坦','孟加拉国','斯里兰卡','尼泊尔','不丹','马尔代夫','哈萨克斯坦','乌兹别克斯坦','吉尔吉斯斯坦','塔吉克斯坦','土库曼斯坦','阿富汗','伊朗','伊拉克','以色列','巴勒斯坦','约旦','黎巴嫩','叙利亚','沙特阿拉伯','阿联酋','卡塔尔','科威特','巴林','阿曼','也门','土耳其','格鲁吉亚','亚美尼亚','阿塞拜疆','塞浦路斯'],
 欧洲:['英国','爱尔兰','法国','德国','意大利','西班牙','葡萄牙','荷兰','比利时','卢森堡','瑞士','奥地利','丹麦','瑞典','挪威','芬兰','冰岛','波兰','捷克','斯洛伐克','匈牙利','罗马尼亚','保加利亚','希腊','阿尔巴尼亚','北马其顿','塞尔维亚','黑山','波黑','克罗地亚','斯洛文尼亚','科索沃','摩尔多瓦','乌克兰','白俄罗斯','立陶宛','拉脱维亚','爱沙尼亚','俄罗斯','马耳他','安道尔','摩纳哥','列支敦士登','圣马力诺','梵蒂冈'],
 非洲:['埃及','利比亚','突尼斯','阿尔及利亚','摩洛哥','苏丹','南苏丹','埃塞俄比亚','厄立特里亚','吉布提','索马里','肯尼亚','乌干达','坦桑尼亚','卢旺达','布隆迪','刚果（金）','刚果（布）','中非','乍得','喀麦隆','尼日利亚','尼日尔','贝宁','多哥','加纳','科特迪瓦','利比里亚','塞拉利昂','几内亚','几内亚比绍','塞内加尔','冈比亚','毛里塔尼亚','马里','布基纳法索','佛得角','赤道几内亚','加蓬','圣多美和普林西比','安哥拉','赞比亚','津巴布韦','马拉维','莫桑比克','纳米比亚','博茨瓦纳','南非','莱索托','斯威士兰','马达加斯加','毛里求斯','塞舌尔','科摩罗'],
 北美洲:['加拿大','美国','墨西哥','危地马拉','伯利兹','洪都拉斯','萨尔瓦多','尼加拉瓜','哥斯达黎加','巴拿马','古巴','牙买加','海地','多米尼加','巴哈马','巴巴多斯','特立尼达和多巴哥','格林纳达','多米尼克','圣卢西亚','圣文森特和格林纳丁斯','安提瓜和巴布达','圣基茨和尼维斯'],
 南美洲:['哥伦比亚','委内瑞拉','圭亚那','苏里南','厄瓜多尔','秘鲁','玻利维亚','巴西','巴拉圭','乌拉圭','阿根廷','智利'],
 大洋洲:['澳大利亚','新西兰','巴布亚新几内亚','斐济','所罗门群岛','瓦努阿图','萨摩亚','汤加','图瓦卢','基里巴斯','瑙鲁','帕劳','密克罗尼西亚','马绍尔群岛']
};
function travelState(){if(!state.travelMap||typeof state.travelMap!=='object')state.travelMap={china:[],world:[]};for(const k of ['china','world'])if(!Array.isArray(state.travelMap[k]))state.travelMap[k]=[];return state.travelMap;}
function toggleVisited(scope,name){const t=travelState();t[scope]=t[scope].includes(name)?t[scope].filter(x=>x!==name):[...t[scope],name];saveState();renderTravel();}
function renderTravel(){const t=travelState();$('chinaMap').innerHTML=CHINA_REGIONS.map((n,i)=>`<button style="--map-index:${i}" class="${t.china.includes(n)?'visited':''}" onclick="toggleVisited('china','${n}')">${n}</button>`).join('');const continent=$('continentFilter');if(!continent.options.length)Object.keys(WORLD_REGIONS).forEach(n=>continent.add(new Option(n,n)));const list=WORLD_REGIONS[continent.value||'亚洲'];$('worldMap').innerHTML=list.map(n=>`<button class="${t.world.includes(n)?'visited':''}" onclick="toggleVisited('world','${n}')">${n}</button>`).join('');$('travelStats').innerHTML=metricCards([['中国足迹',`${t.china.length} / ${CHINA_REGIONS.length}`,'点击可取消'],['全球足迹',`${t.world.length}`,'个国家或地区'],['旅行日志',studioRows('trip').length,'条具体记录']]);$('tripList').innerHTML=studioRows('trip').map(r=>`<article class="life-card"><span class="label">${escapeHtml(r.status||'旅行')} · ${escapeHtml(r.date||'日期待定')}</span><h3>${escapeHtml(r.title)}</h3><p>${escapeHtml(r.judgement||r.summary||'')}</p><button onclick="editStudio('trip','${r.id}')">编辑 / 删除</button></article>`).join('');}
$('continentFilter').onchange=renderTravel;

const DEFAULT_ROUTINES=[];
function routineRows(){if(!Array.isArray(state.routines))state.routines=DEFAULT_ROUTINES.map(x=>({...x}));return state.routines;}
function editRoutine(id=''){const rows=routineRows(),old=rows.find(r=>r.id===id)||{};openEditDialog({title:'SOP 项目',fields:[{name:'cadence',label:'频次',type:'select',value:old.cadence||'daily',options:[['daily','每日'],['weekly','每周'],['monthly','每月']].map(([value,label])=>({value,label}))},{name:'area',label:'领域',value:old.area||''},{name:'title',label:'动作',value:old.title||''},{name:'when',label:'时间 / 星期',value:old.when||''},{name:'minutes',label:'预计分钟',type:'number',value:old.minutes||''},{name:'notes',label:'完成标准',type:'textarea',value:old.notes||''},{name:'active',label:'状态',type:'select',value:String(old.active!==false),options:[{value:'true',label:'启用'},{value:'false',label:'停用'}]}],onSave:v=>{if(!v.title.trim()){alert('请填写动作');return false;}if(v.minutes&&Number(v.minutes)<0){alert('分钟不能为负数');return false;}const item={...old,...v,id:id||uid('routine'),active:v.active==='true'};state.routines=id?rows.map(r=>r.id===id?item:r):[...rows,item];saveState();renderHomebase();},onDelete:id?()=>{state.routines=rows.filter(r=>r.id!==id);saveState();renderHomebase();}:null});}
function routineToTask(id){const r=routineRows().find(x=>x.id===id);if(!r)return;const taskId='routine_'+id+'_'+todayStr();if(!state.tasks.some(t=>t.id===taskId))state.tasks.unshift(normalizeTaskItem({id:taskId,title:r.title,gtdBucket:'next',quadrant:'q2',status:'todo',dueDate:todayStr(),estimate:Number(r.minutes)||15,todayBucket:'should'}));saveState();renderAll();navTo('home-section');}
function renderRoutines(){const cadence=$('routineCadence').value,area=$('routineArea');const areas=[...new Set(routineRows().map(r=>r.area))];if(area.options.length===1)areas.forEach(n=>area.add(new Option(n,n)));const rows=routineRows().filter(r=>r.cadence===cadence&&(area.value==='all'||r.area===area.value));$('routineBoard').innerHTML=rows.map(r=>`<article class="routine-row ${r.active===false?'inactive':''}"><time>${escapeHtml(r.when||'自行安排')}</time><div><span>${escapeHtml(r.area)}</span><h3>${escapeHtml(r.title)}</h3><p>${escapeHtml(r.notes||'')}</p></div><strong>${escapeHtml(r.minutes||'—')} 分</strong><div><button onclick="routineToTask('${r.id}')">放入今天</button><button onclick="editRoutine('${r.id}')">编辑</button></div></article>`).join('')||'<div class="empty-state">当前筛选没有 SOP。</div>';}

const DEFAULT_INVENTORY=[];
function inventoryRows(){if(!Array.isArray(state.inventory))state.inventory=DEFAULT_INVENTORY.map(x=>({...x}));return state.inventory.filter(r=>r&&/^[a-zA-Z0-9_-]+$/.test(r.id||''));}
function editInventory(id=''){const rows=inventoryRows(),old=rows.find(r=>r.id===id)||{};openEditDialog({title:'宿舍物品',fields:[{name:'area',label:'位置 / 类别',value:old.area||''},{name:'title',label:'物品名称',value:old.title||''},{name:'quantity',label:'当前数量',type:'number',value:old.quantity??''},{name:'unit',label:'单位',value:old.unit||''},{name:'threshold',label:'补货警戒线',type:'number',value:old.threshold??''},{name:'expiry',label:'到期日期（可选）',type:'date',value:old.expiry||''},{name:'notes',label:'规格、购买地或备注',type:'textarea',value:old.notes||''}],onSave:v=>{if(!v.title.trim()){alert('请填写物品');return false;}if([v.quantity,v.threshold].some(n=>!Number.isFinite(Number(n))||Number(n)<0)){alert('数量必须是非负数');return false;}const item={...old,...v,id:id||uid('inventory'),quantity:Number(v.quantity),threshold:Number(v.threshold)};state.inventory=id?rows.map(r=>r.id===id?item:r):[item,...rows];saveState();renderInventory();},onDelete:id?()=>{state.inventory=rows.filter(r=>r.id!==id);saveState();renderInventory();}:null});}
function adjustInventory(id,delta){state.inventory=inventoryRows().map(r=>r.id===id?{...r,quantity:Math.max(0,Number(r.quantity||0)+delta)}:r);saveState();renderInventory();}
function renderInventory(){const rows=inventoryRows(),area=$('inventoryArea'),areas=[...new Set(rows.map(r=>r.area))];if(area.options.length===1)areas.forEach(n=>area.add(new Option(n,n)));const q=$('inventorySearch').value.toLowerCase(),lowOnly=$('inventoryLow').checked;const items=rows.filter(r=>(area.value==='all'||r.area===area.value)&&(!lowOnly||Number(r.quantity)<=Number(r.threshold))&&JSON.stringify(r).toLowerCase().includes(q));const low=rows.filter(r=>Number(r.quantity)<=Number(r.threshold)).length,expiring=rows.filter(r=>r.expiry&&r.expiry<=shiftDate(todayStr(),30)).length;$('inventoryStats').innerHTML=metricCards([['物品',rows.length,'类'],['需要补货',low,'项'],['30 天内到期',expiring,'项']]);$('inventoryList').innerHTML=items.map(r=>`<article class="inventory-card ${Number(r.quantity)<=Number(r.threshold)?'low':''}"><span>${escapeHtml(r.area)}</span><h3>${escapeHtml(r.title)}</h3><div class="qty-control"><button onclick="adjustInventory('${r.id}',-1)">−</button><strong>${escapeHtml(r.quantity)} ${escapeHtml(r.unit||'')}</strong><button onclick="adjustInventory('${r.id}',1)">＋</button></div><p>警戒线 ${escapeHtml(r.threshold)} ${escapeHtml(r.unit||'')}${r.expiry?` · 到期 ${escapeHtml(r.expiry)}`:''}</p><button onclick="editInventory('${r.id}')">编辑 / 删除</button></article>`).join('')||'<div class="empty-state">没有匹配物品。</div>';}
['inventorySearch','inventoryArea','inventoryLow'].forEach(id=>{$(id).oninput=renderInventory;$(id).onchange=renderInventory;});
['routineCadence','routineArea'].forEach(id=>$(id).onchange=renderRoutines);
document.querySelectorAll('[data-home-tab]').forEach(b=>b.onclick=()=>{const tab=b.dataset.homeTab;$('homeRoutine').hidden=tab!=='routine';$('homeInventory').hidden=tab!=='inventory';$('homeFitness').hidden=tab!=='fitness';document.querySelectorAll('[data-home-tab]').forEach(x=>x.classList.toggle('active',x===b));renderHomebase();});
function renderHomebase(){renderRoutines();renderInventory();$('fitnessPlan').innerHTML='<div class="empty-state">导入私人备份，或在上方建立自己的运动计划。</div>';$('skincarePlan').innerHTML='<div class="empty-state">导入私人备份，或建立自己的护理计划。</div>';}



const RECIPE_GROUPS={
 '鲁菜':'葱烧海参|九转大肠|糖醋鲤鱼|油焖大虾|德州扒鸡|四喜丸子|木须肉|醋溜白菜|拔丝地瓜|鲅鱼水饺|锅塌豆腐|芙蓉鸡片',
 '川菜':'麻婆豆腐|宫保鸡丁|鱼香肉丝|回锅肉|水煮牛肉|辣子鸡|酸菜鱼|口水鸡|夫妻肺片|担担面|干煸四季豆|蒜泥白肉|毛血旺|蚂蚁上树',
 '粤菜':'白切鸡|豉汁蒸排骨|蜜汁叉烧|清蒸鲈鱼|煲仔饭|干炒牛河|艇仔粥|虾饺|烧卖|萝卜糕|菠萝咕咾肉|白灼菜心|老火汤',
 '苏浙沪':'红烧肉|东坡肉|西湖醋鱼|龙井虾仁|叫花鸡|松鼠鳜鱼|狮子头|腌笃鲜|响油鳝糊|油焖春笋|雪菜肉丝面|酒酿圆子|蟹粉豆腐',
 '湘鄂赣':'剁椒鱼头|小炒黄牛肉|农家小炒肉|辣椒炒肉|粉蒸肉|莲藕排骨汤|热干面|三杯鸡|瓦罐汤|南昌拌粉|藜蒿炒腊肉|沔阳三蒸',
 '闽台潮汕':'佛跳墙|荔枝肉|沙茶面|海蛎煎|卤肉饭|三杯鸡|肉燕|鱼丸汤|蚵仔煎|潮汕牛肉火锅|粿条汤|姜母鸭',
 '西北':'羊肉泡馍|肉夹馍|油泼面|臊子面|手抓羊肉|大盘鸡|新疆炒米粉|抓饭|兰州牛肉面|凉皮|烤包子|莜面栲栳栳',
 '东北':'锅包肉|地三鲜|小鸡炖蘑菇|猪肉炖粉条|酸菜白肉|东北乱炖|溜肉段|酱骨头|铁锅炖鱼|韭菜盒子|冷面|粘豆包',
 '家常快手':'番茄炒蛋|青椒肉丝|可乐鸡翅|红烧排骨|土豆炖牛肉|鱼香茄子|肉末豆腐|蒜蓉西兰花|蚝油生菜|蛋炒饭|紫菜蛋花汤|酸辣土豆丝|香菇滑鸡|白菜炖豆腐|蒸蛋|咖喱鸡肉饭',
 '面点早餐':'包子|饺子|馄饨|葱油饼|鸡蛋灌饼|豆浆|油条|小米粥|皮蛋瘦肉粥|阳春面|炸酱面|葱油拌面|馒头|花卷|烧饼|豆腐脑',
 '日韩料理':'亲子丼|寿喜烧|味噌汤|日式咖喱饭|照烧鸡|饭团|大阪烧|冷荞麦面|韩式拌饭|部队锅|泡菜炒饭|海鲜煎饼',
 '东南亚':'泰式绿咖喱|冬阴功汤|泰式炒河粉|海南鸡饭|新加坡叻沙|越南河粉|越南春卷|印尼炒饭|沙嗲鸡|芒果糯米饭',
 '欧洲美洲':'番茄肉酱意面|奶油蘑菇意面|玛格丽特披萨|西班牙海鲜饭|法式炖牛肉|牧羊人派|英式早餐|炸鱼薯条|墨西哥卷饼|墨西哥辣肉酱|汉堡|烤鸡沙拉|南瓜汤|香蕉面包'
};
function recipeMain(name){for(const [re,v] of [[/鸡|翅/,'鸡肉'],[/牛/,'牛肉'],[/猪|肉|排骨|大肠/,'猪肉'],[/鱼|海参|虾|海鲜|蛎|蚵|蟹/,'水产'],[/豆腐|豆浆|豆脑/,'豆制品'],[/面|粉|饼|包|饺|馄饨|馒头|花卷|饭/,'主食'],[/蛋/,'蛋类']])if(re.test(name))return v;return '蔬菜／其他';}
function recipeType(name){if(/汤|粥|锅|炖/.test(name))return '汤锅';if(/面|粉|饼|包|饺|馄饨|馒头|花卷|饭|粿/.test(name))return '主食';if(/糕|圆子|面包|豆浆|豆腐脑/.test(name))return '早餐甜点';return '菜肴';}
const RECIPE_CATALOG=Object.entries(RECIPE_GROUPS).flatMap(([cuisine,names],groupIndex)=>names.split('|').map((name,i)=>({id:`catalog_${groupIndex}_${i}`,name,cuisine,type:recipeType(name),main:recipeMain(name)})));
function recipeRows(){if(!Array.isArray(state.recipes))state.recipes=[];return state.recipes.filter(r=>r&&/^[a-zA-Z0-9_-]+$/.test(r.id||''));}
function editRecipe(id=''){const rows=recipeRows(),old=rows.find(r=>r.id===id)||{};openEditDialog({title:'我的菜谱',fields:[{name:'name',label:'菜名',value:old.name||''},{name:'cuisine',label:'菜系 / 国家',value:old.cuisine||'我的菜谱'},{name:'type',label:'类型',value:old.type||'菜肴'},{name:'main',label:'主要食材',value:old.main||''},{name:'status',label:'状态',type:'select',value:old.status||'想做',options:['想做','做过','常做'].map(value=>({value,label:value}))},{name:'ingredients',label:'我实际使用的食材与份量',type:'textarea',value:old.ingredients||''},{name:'steps',label:'我的步骤与火候记录',type:'textarea',value:old.steps||''},{name:'notes',label:'来源、替换、过敏信息与下次调整',type:'textarea',value:old.notes||''}],onSave:v=>{if(!v.name.trim()){alert('请填写菜名');return false;}const item={...old,...v,id:id||uid('recipe'),updatedAt:nowDateTime()};state.recipes=id?rows.map(r=>r.id===id?item:r):[item,...rows];saveState();renderRecipes();},onDelete:id?()=>{state.recipes=rows.filter(r=>r.id!==id);saveState();renderRecipes();}:null});}
function saveCatalogRecipe(id){const r=RECIPE_CATALOG.find(x=>x.id===id);if(!r)return;const existing=recipeRows().find(x=>x.catalogId===id);if(existing){editRecipe(existing.id);return;}state.recipes.unshift({...r,id:uid('recipe'),catalogId:id,status:'想做',ingredients:'',steps:'',notes:'',updatedAt:nowDateTime()});saveState();renderRecipes();}
function renderRecipes(){const selects=[['recipeCuisine','cuisine'],['recipeType','type'],['recipeMain','main']];const all=[...RECIPE_CATALOG,...recipeRows()];for(const [id,key] of selects){const el=$(id);if(el.options.length===1)[...new Set(all.map(r=>r[key]).filter(Boolean))].sort().forEach(n=>el.add(new Option(n,n)));}const q=$('recipeSearch').value.toLowerCase(),c=$('recipeCuisine').value,t=$('recipeType').value,m=$('recipeMain').value;const items=all.filter(r=>(c==='all'||r.cuisine===c)&&(t==='all'||r.type===t)&&(m==='all'||r.main===m)&&JSON.stringify(r).toLowerCase().includes(q));const saved=recipeRows(),made=saved.filter(r=>['做过','常做'].includes(r.status)).length;$('recipeStats').innerHTML=metricCards([['内置索引',RECIPE_CATALOG.length,'道中外菜名'],['我的收藏',saved.length,'道可编辑菜谱'],['已经做过',made,'道']]);$('recipeList').innerHTML=items.slice(0,120).map(r=>{const custom=!r.id.startsWith('catalog_');return `<article class="recipe-card"><span>${escapeHtml(r.cuisine)} · ${escapeHtml(r.type)}</span><h3>${escapeHtml(r.name)}</h3><p>${escapeHtml(r.main||'')}</p><button onclick="${custom?`editRecipe('${r.id}')`:`saveCatalogRecipe('${r.id}')`}">${custom?'查看 / 编辑':saved.some(x=>x.catalogId===r.id)?'已收藏 · 编辑':'收藏并写做法'}</button></article>`;}).join('')||'<div class="empty-state">没有匹配菜谱；可以清空筛选或自建一条。</div>';}
['recipeSearch','recipeCuisine','recipeType','recipeMain'].forEach(id=>{$(id).oninput=renderRecipes;$(id).onchange=renderRecipes;});

function englishRows(){if(!Array.isArray(state.english))state.english=[];return state.english.filter(r=>r&&/^[a-zA-Z0-9_-]+$/.test(r.id||''));}
function editEnglish(id=''){const rows=englishRows(),old=rows.find(r=>r.id===id)||{};openEditDialog({title:'英语训练记录',fields:[{name:'type',label:'训练类型',type:'select',value:old.type||'精听',options:['精听','泛听','口语','词汇','阅读','学术写作','电影'].map(value=>({value,label:value}))},{name:'title',label:'来源 / 任务',value:old.title||''},{name:'date',label:'日期',type:'date',value:old.date||todayStr()},{name:'minutes',label:'实际分钟',type:'number',value:old.minutes||''},{name:'missed',label:'听漏 / 错误 / 卡住的位置',type:'textarea',value:old.missed||''},{name:'phrases',label:'值得复用的词与搭配',type:'textarea',value:old.phrases||''},{name:'output',label:'我的短输出 / 改写',type:'textarea',value:old.output||''},{name:'next',label:'下一次具体调整',type:'textarea',value:old.next||''}],onSave:v=>{if(!v.title.trim()||!v.date){alert('请填写来源和日期');return false;}if(!Number.isFinite(Number(v.minutes))||Number(v.minutes)<0){alert('分钟必须是非负数');return false;}const item={...old,...v,id:id||uid('english'),minutes:Number(v.minutes),updatedAt:nowDateTime()};state.english=id?rows.map(r=>r.id===id?item:r):[item,...rows];saveState();renderEnglish();},onDelete:id?()=>{state.english=rows.filter(r=>r.id!==id);saveState();renderEnglish();}:null});}
function mondayOf(date){const d=new Date(date+'T12:00:00'),day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return ymd(d);}
function renderEnglish(){const rows=englishRows(),start=mondayOf(todayStr()),end=shiftDate(start,7),week=rows.filter(r=>r.date>=start&&r.date<end);const mins=week.reduce((s,r)=>s+Number(r.minutes||0),0),intensive=week.filter(r=>r.type==='精听').length,short=week.filter(r=>['口语','词汇'].includes(r.type)).length;$('englishStats').innerHTML=metricCards([['本周投入',mins,'分钟'],['精听',`${intensive} / 2`,'次'],['短口语／词汇',`${short} / 5`,'次']]);const plan=[['周一','10 分','短口语＋词汇'],['周二','10 分','短口语＋词汇'],['周三','30＋10 分','精听＋短输出'],['周四','10 分','短口语＋词汇'],['周五','10 分','短口语＋词汇'],['周六','30 分','精听；可加电影'],['周日','10 分','复用本周表达']];$('englishWeek').innerHTML=plan.map(x=>`<article><span>${x[0]}</span><strong>${x[2]}</strong><small>${x[1]}</small></article>`).join('');const q=$('englishSearch').value.toLowerCase(),type=$('englishType').value,items=rows.filter(r=>(type==='all'||r.type===type)&&JSON.stringify(r).toLowerCase().includes(q));$('englishList').innerHTML=items.map(r=>`<article class="life-card"><span class="label">${escapeHtml(r.type)} · ${escapeHtml(r.date)} · ${escapeHtml(r.minutes)} 分钟</span><h3>${escapeHtml(r.title)}</h3><p>${escapeHtml(r.output||r.phrases||r.missed||'')}</p><button onclick="editEnglish('${r.id}')">阅读 / 编辑 / 删除</button></article>`).join('')||'<div class="empty-state">还没有训练记录。先完成 10 分钟短口语或一段精听。</div>';}
['englishSearch','englishType'].forEach(id=>{$(id).oninput=renderEnglish;$(id).onchange=renderEnglish;});

function metricCards(items){return items.map(([label,value,note])=>`<div class="metric-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note||'')}</small></div>`).join('');}
async function renderLearningBridge(){try{const r=await fetch('/api/records',{cache:'no-store'});if(!r.ok)throw new Error('原有学习记录暂时无法读取');const b=await r.json();const counts={plan:0,log:0,note:0,milestone:0,resource:0};for(const row of b.records){if(row.kind in counts)counts[row.kind]++;}
 $('learningBridge').innerHTML=`<p>自定义学习计划 ${counts.plan} · 完成记录 ${counts.log} · 成果与复盘 ${counts.note} · 更新的里程碑 ${counts.milestone} · 资源设置 ${counts.resource}</p><p>默认学习频次、完整资源入口与 13 个领域继续在学习中心使用。</p>`;}catch(e){$('learningBridge').textContent=e.message;}}
// No source data is silently removed by import. Retain life entries and make backup scope explicit.
const originalNav=navTo;
navTo=function(id){originalNav(id);if(id==='life-section')renderLife();if(id==='studio-section')renderStudio();if(id==='homebase-section')renderHomebase();if(id==='recipe-section')renderRecipes();if(id==='english-section')renderEnglish();if(id==='learning-section')renderLearningBridge();};
const originalExport=exportJson;
exportJson=function(){const blob=new Blob([JSON.stringify({...state,format:'becoming-undergraduate-v3'},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`undergraduate-workspace-${todayStr()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
copyJson=async function(){try{await navigator.clipboard.writeText(JSON.stringify(state,null,2));alert('已复制本科工作台备份');}catch{$('jsonEditor').value=JSON.stringify(state,null,2);navTo('settings-section');alert('剪贴板不可用，JSON 已显示，请手动复制。');}};

// V4 information architecture and editable Notion-like databases.
const V4_AREAS=[];

const V4_CYCLES=[];

const V4_MODULES=[];

const V4_BOOKS=[];

const V4_ROUTINES=[];

const V4_LINKS=[];

function mergeDefaults(key,defaults){if(!Array.isArray(state[key]))state[key]=[];if(!state.v4Seeds||Array.isArray(state.v4Seeds)||typeof state.v4Seeds!=='object')state.v4Seeds={};if(!state.v4Seeds[key]){const ids=new Set(state[key].map(x=>x&&x.id));for(const item of defaults)if(!ids.has(item.id))state[key].push({...item});state.v4Seeds[key]=true;}return state[key].filter(x=>x&&/^[a-zA-Z0-9_-]+$/.test(x.id||''));}
function studyAreas(){return mergeDefaults('studyAreas',V4_AREAS)}
function learningCycles(){return mergeDefaults('learningCycles',V4_CYCLES)}
function studyModules(){return mergeDefaults('studyModules',V4_MODULES)}
function books(){return mergeDefaults('books',V4_BOOKS)}
function readingLogs(){if(!Array.isArray(state.readingLogs))state.readingLogs=[];return state.readingLogs.filter(x=>x&&/^[a-zA-Z0-9_-]+$/.test(x.id||''));}
function newsNotes(){if(!Array.isArray(state.newsNotes))state.newsNotes=[];return state.newsNotes.filter(x=>x&&/^[a-zA-Z0-9_-]+$/.test(x.id||''));}
function newsBriefs(){if(!Array.isArray(state.newsBriefs))state.newsBriefs=[];return state.newsBriefs.filter(x=>x&&/^[a-zA-Z0-9_-]+$/.test(x.id||''));}
function learningLinks(){return mergeDefaults('learningLinks',V4_LINKS)}
function customAchievements(){if(!Array.isArray(state.customAchievements))state.customAchievements=[];return state.customAchievements.filter(x=>x&&/^[a-zA-Z0-9_-]+$/.test(x.id||''));}

function editStudyModule(id=''){const rows=studyModules(),old=rows.find(x=>x.id===id)||{};openEditDialog({title:'大三课程',fields:[{name:'name',label:'课程名称',value:old.name||''},{name:'term',label:'学期',value:old.term||''},{name:'lecture',label:'Lecture / Seminar 时间',value:old.lecture||''},{name:'coreReading',label:'本周 Core Reading',type:'textarea',value:old.coreReading||''},{name:'weeklyOutput',label:'本周完成证据',type:'textarea',value:old.weeklyOutput||''},{name:'status',label:'状态',type:'select',value:old.status||'Active',options:['Active','Paused','Completed'].map(value=>({value,label:value}))}],onSave:v=>{if(!v.name.trim())return false;const item={...old,...v,id:id||uid('module')};state.studyModules=id?rows.map(x=>x.id===id?item:x):[item,...rows];saveState();renderStudy();},onDelete:id?()=>{state.studyModules=rows.filter(x=>x.id!==id);saveState();renderStudy();}:null});}
function editStudyArea(id=''){const rows=studyAreas(),old=rows.find(x=>x.id===id)||{};openEditDialog({title:'Area',fields:[{name:'name',label:'领域名称',value:old.name||''},{name:'role',label:'Role',type:'select',value:old.role||'Queued',options:['Core','Active','Maintenance','Paused','Queued'].map(value=>({value,label:value}))},{name:'priority',label:'优先级',value:old.priority||''},{name:'now',label:'Now',type:'select',value:old.now||'Level 0',options:['Level 0','Level 1','Level 2','Level 3','Level 4'].map(value=>({value,label:value}))},{name:'entry',label:'第一入口',value:old.entry||''},{name:'system',label:'系统学习',value:old.system||''},{name:'tracking',label:'长期跟踪',value:old.tracking||''},{name:'deep',label:'深入',value:old.deep||''}],onSave:v=>{if(!v.name.trim())return false;const item={...old,...v,id:id||uid('area')};state.studyAreas=id?rows.map(x=>x.id===id?item:x):[item,...rows];saveState();renderStudy();},onDelete:id?()=>{state.studyAreas=rows.filter(x=>x.id!==id);saveState();renderStudy();}:null});}
function editLearningCycle(id=''){const rows=learningCycles(),old=rows.find(x=>x.id===id)||{};openEditDialog({title:'Learning Cycle',fields:[{name:'period',label:'时间',value:old.period||''},{name:'title',label:'Cycle 名称',value:old.title||''},{name:'area',label:'Areas',value:old.area||''},{name:'role',label:'定位',type:'select',value:old.role||'Active',options:['Core','Active','Maintenance','Paused','Queued'].map(value=>({value,label:value}))},{name:'goal',label:'Goal',type:'textarea',value:old.goal||''},{name:'questions',label:'Core Questions',type:'textarea',value:old.questions||''},{name:'resources',label:'Main Resources',type:'textarea',value:old.resources||''},{name:'weekly',label:'Weekly Allocation',type:'textarea',value:old.weekly||''},{name:'output',label:'Output',type:'textarea',value:old.output||''},{name:'test',label:'Graduation Test',type:'textarea',value:old.test||''},{name:'planned',label:'每周计划 Sessions',type:'number',value:old.planned??''},{name:'completed',label:'已完成 Sessions',type:'number',value:old.completed??0}],onSave:v=>{if(!v.title.trim())return false;const item={...old,...v,id:id||uid('cycle'),planned:Number(v.planned||0),completed:Number(v.completed||0)};state.learningCycles=id?rows.map(x=>x.id===id?item:x):[item,...rows];saveState();renderStudy();},onDelete:id?()=>{state.learningCycles=rows.filter(x=>x.id!==id);saveState();renderStudy();}:null});}
function editBook(id=''){const rows=books(),old=rows.find(x=>x.id===id)||{};openEditDialog({title:'推荐书架',fields:[{name:'category',label:'能力类别',value:old.category||''},{name:'title',label:'书名',value:old.title||''},{name:'author',label:'作者',value:old.author||''},{name:'why',label:'为什么读 / 想练什么',type:'textarea',value:old.why||''},{name:'status',label:'状态',type:'select',value:old.status||'想读',options:['想读','在读','读完','暂停'].map(value=>({value,label:value}))},{name:'url',label:'链接',value:old.url||''}],onSave:v=>{if(!v.title.trim())return false;const item={...old,...v,id:id||uid('book')};state.books=id?rows.map(x=>x.id===id?item:x):[item,...rows];saveState();renderStudy();},onDelete:id?()=>{state.books=rows.filter(x=>x.id!==id);saveState();renderStudy();}:null});}
function editReadingLog(id=''){const rows=readingLogs(),old=rows.find(x=>x.id===id)||{};openEditDialog({title:'今日阅读',fields:[{name:'date',label:'日期',type:'date',value:old.date||todayStr()},{name:'title',label:'书／论文／章节',value:old.title||''},{name:'pages',label:'页码 / 进度',value:old.pages||''},{name:'minutes',label:'分钟',type:'number',value:old.minutes||''},{name:'claim',label:'核心命题',type:'textarea',value:old.claim||''},{name:'evidence',label:'关键证据 / 例子',type:'textarea',value:old.evidence||''},{name:'question',label:'我的质疑 / 不懂之处',type:'textarea',value:old.question||''},{name:'output',label:'可迁移输出',type:'textarea',value:old.output||''}],onSave:v=>{if(!v.title.trim())return false;const item={...old,...v,id:id||uid('reading'),minutes:Number(v.minutes||0)};state.readingLogs=id?rows.map(x=>x.id===id?item:x):[item,...rows];saveState();renderStudy();},onDelete:id?()=>{state.readingLogs=rows.filter(x=>x.id!==id);saveState();renderStudy();}:null});}

function renderStudy(){
 const week=[['Monday','大三课程 1：PPT + core reading','English Core','3 概念 + 1 论点 + 1 质疑'],['Tuesday','面试知识：2 张 Question Cards','精听 1','2 个 90 秒回答'],['Wednesday','大三课程 2：PPT + core reading','English Core','课程笔记 + 1 段回答'],['Thursday','Academic Writing Lab','英语口述段落','300–500 词段落／拆文'],['Friday','大三课程 3：PPT + core reading','精听 2','课程笔记 + Error Log'],['Saturday','Archive Review + Film','2 分钟口述','1 张 Knowledge Card'],['Sunday','Mock + Weekly Review','轻量输出','3 个下周 Must-win']];
 $('studyWeekBoard').innerHTML='<div class="weekly-plan-table">'+week.map(x=>`<article><b>${x[0]}</b><strong>${x[1]}</strong><span>${x[2]}</span><small>${x[3]}</small></article>`).join('')+'</div><p class="rule-note">正式课表出来后只移动课程块，不增加总量。连续两周完成率低于 60%，下调任务量 20%；漏一天不双倍补。</p>';
 $('moduleTable').innerHTML=notionTable(['课程','学期','Lecture / Seminar','Core reading','完成证据','状态'],studyModules().map(x=>[`<button onclick="editStudyModule('${x.id}')">${escapeHtml(x.name)}</button>`,escapeHtml(x.term),escapeHtml(x.lecture),escapeHtml(x.coreReading),escapeHtml(x.weeklyOutput),escapeHtml(x.status)]));
 const ar=$('areaRoleFilter').value,q=$('areaSearch').value.toLowerCase();const a=studyAreas().filter(x=>(ar==='all'||x.role===ar)&&JSON.stringify(x).toLowerCase().includes(q));
 $('areaTable').innerHTML=notionTable(['Area','Role','优先级','Now','第一入口','系统学习','长期跟踪'],a.map(x=>[`<button onclick="editStudyArea('${x.id}')">${escapeHtml(x.name)}</button>`,`<span class="role-pill ${x.role.toLowerCase()}">${escapeHtml(x.role)}</span>`,escapeHtml(x.priority),escapeHtml(x.now),escapeHtml(x.entry),escapeHtml(x.system),escapeHtml(x.tracking)]));
 $('cycleTable').innerHTML=notionTable(['时间','Learning Cycle','Areas','定位','每周次数','完成','Goal / Output / Test'],learningCycles().map(x=>[escapeHtml(x.period),`<button onclick="editLearningCycle('${x.id}')">${escapeHtml(x.title)}</button>`,escapeHtml(x.area),escapeHtml(x.role),escapeHtml(x.planned),escapeHtml(x.completed),`<details><summary>${escapeHtml(x.goal)}</summary><p><b>Core question</b> ${escapeHtml(x.questions)}</p><p><b>Resources</b> ${escapeHtml(x.resources)}</p><p><b>Weekly</b> ${escapeHtml(x.weekly)}</p><p><b>Output</b> ${escapeHtml(x.output)}</p><p><b>Graduation Test</b> ${escapeHtml(x.test)}</p></details>`]));
 const cat=$('bookCategory'),allBooks=books();if(cat.options.length===1)[...new Set(allBooks.map(x=>x.category))].forEach(n=>cat.add(new Option(n,n)));const bq=$('bookSearch').value.toLowerCase(),bc=cat.value;const shown=allBooks.filter(x=>(bc==='all'||x.category===bc)&&JSON.stringify(x).toLowerCase().includes(bq));
 $('bookShelf').innerHTML=shown.map(x=>`<article><span>${escapeHtml(x.category)} · ${escapeHtml(x.status)}</span><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.author)}</p><small>${escapeHtml(x.why)}</small><div><button onclick="editBook('${x.id}')">编辑</button>${x.url?`<a href="${safeExternalUrl(x.url)}" target="_blank" rel="noopener noreferrer">查找</a>`:''}</div></article>`).join('')||'<div class="empty-state">没有匹配的书。</div>';
 $('readingLogList').innerHTML=readingLogs().map(x=>`<article class="life-card"><span class="label">${escapeHtml(x.date)} · ${escapeHtml(x.minutes)} 分钟 · ${escapeHtml(x.pages||'')}</span><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.claim||x.output||x.question||'')}</p><button onclick="editReadingLog('${x.id}')">编辑 / 删除</button></article>`).join('')||'<div class="empty-state">还没有阅读记录。今天读完后留下一个核心命题和一个质疑。</div>';
}
function notionTable(headers,rows){return `<div class="notion-table-wrap"><table class="notion-table"><thead><tr>${headers.map(x=>`<th>${escapeHtml(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(cell=>`<td>${cell??''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
function setStudyTab(tab){['week','modules','areas','cycles','reading'].forEach(x=>{$('study'+x[0].toUpperCase()+x.slice(1)).hidden=x!==tab});document.querySelectorAll('[data-study-tab]').forEach(b=>b.classList.toggle('active',b.dataset.studyTab===tab));renderStudy();}

function editNewsNote(id=''){const rows=newsNotes(),old=rows.find(x=>x.id===id)||{};openEditDialog({title:'我最应该注意什么',fields:[{name:'date',label:'日期',type:'date',value:old.date||todayStr()},{name:'topic',label:'新闻 / 变化',value:old.topic||''},{name:'area',label:'关联领域',value:old.area||'教育 / 英国 / 中国 / AI / 政策'},{name:'why',label:'为什么与我有关',type:'textarea',value:old.why||''},{name:'judgement',label:'我的判断 / 仍不确定',type:'textarea',value:old.judgement||''},{name:'action',label:'下一步（可留空）',type:'textarea',value:old.action||''}],onSave:v=>{if(!v.topic.trim())return false;const item={...old,...v,id:id||uid('newsnote')};state.newsNotes=id?rows.map(x=>x.id===id?item:x):[item,...rows];saveState();renderInformation();},onDelete:id?()=>{state.newsNotes=rows.filter(x=>x.id!==id);saveState();renderInformation();}:null});}
function editBrief(id=''){const rows=newsBriefs(),old=rows.find(x=>x.id===id)||{};openEditDialog({title:'08:00 简报归档',fields:[{name:'date',label:'日期',type:'date',value:old.date||todayStr()},{name:'title',label:'简报标题',value:old.title||'今日 3 件事'},{name:'items',label:'最重要的三件事',type:'textarea',value:old.items||''},{name:'attention',label:'我最要注意的一个变化',type:'textarea',value:old.attention||''},{name:'source',label:'来源链接 / 备注',value:old.source||''}],onSave:v=>{if(!v.title.trim())return false;const item={...old,...v,id:id||uid('brief')};state.newsBriefs=id?rows.map(x=>x.id===id?item:x):[item,...rows];saveState();renderInformation();},onDelete:id?()=>{state.newsBriefs=rows.filter(x=>x.id!==id);saveState();renderInformation();}:null});}
async function loadLiveNews(force=false){const status=$('liveNewsStatus');status.textContent='正在读取最新标题…';try{const r=await fetch('/api/news'+(force?'?refresh=1':''),{cache:force?'reload':'default'});if(!r.ok)throw new Error('暂时无法加载');const data=await r.json();status.textContent=`最新读取：${data.updatedAt||'刚刚'} · 标题会随来源更新`;$('liveNews').innerHTML=(data.items||[]).map(x=>`<a href="${safeExternalUrl(x.url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(x.source||'News')}</span><strong>${escapeHtml(x.title)}</strong></a>`).join('')||'<p>暂无可用标题。</p>';}catch(e){status.textContent='热点标题暂时未载入，可直接打开下方来源。';$('liveNews').innerHTML='<a href="https://www.reuters.com/world/" target="_blank" rel="noopener noreferrer"><span>Reuters</span><strong>World News</strong></a><a href="https://www.bbc.co.uk/news" target="_blank" rel="noopener noreferrer"><span>BBC</span><strong>UK & World News</strong></a><a href="https://www.theguardian.com/education" target="_blank" rel="noopener noreferrer"><span>The Guardian</span><strong>Education</strong></a><a href="https://theconversation.com/uk/education" target="_blank" rel="noopener noreferrer"><span>The Conversation</span><strong>Education analysis</strong></a>';}}
function renderInformation(){const n=newsNotes();$('attentionList').innerHTML=n.slice(0,5).map(x=>`<article class="life-card"><span class="label">${escapeHtml(x.date)} · ${escapeHtml(x.area)}</span><h3>${escapeHtml(x.topic)}</h3><p>${escapeHtml(x.why||x.judgement||'')}</p><button onclick="editNewsNote('${x.id}')">编辑 / 删除</button></article>`).join('')||'<div class="empty-state">还没有写今日判断。</div>';const b=newsBriefs();$('briefList').innerHTML=notionTable(['日期','简报','三件事','最需注意'],b.map(x=>[escapeHtml(x.date),`<button onclick="editBrief('${x.id}')">${escapeHtml(x.title)}</button>`,escapeHtml(x.items),escapeHtml(x.attention)]));}

function editLearningLink(id=''){const rows=learningLinks(),old=rows.find(x=>x.id===id)||{};openEditDialog({title:'运动／化妆学习入口',fields:[{name:'type',label:'类别',type:'select',value:old.type||'健身',options:['健身','化妆','护肤','学习','其他'].map(value=>({value,label:value}))},{name:'title',label:'名称',value:old.title||''},{name:'url',label:'链接',value:old.url||''},{name:'notes',label:'怎样使用',type:'textarea',value:old.notes||''}],onSave:v=>{if(!v.title.trim())return false;const item={...old,...v,id:id||uid('link')};state.learningLinks=id?rows.map(x=>x.id===id?item:x):[item,...rows];saveState();renderHomebase();},onDelete:id?()=>{state.learningLinks=rows.filter(x=>x.id!==id);saveState();renderHomebase();}:null});}

renderHomebase=function(){
 mergeDefaults('routines',V4_ROUTINES);renderRoutines();mergeDefaults('inventory',[['护肤彩妆','防晒',1,'支',1],['护肤彩妆','面霜／乳液',1,'瓶',1],['护肤彩妆','唇膏',1,'支',1],['护肤彩妆','身体乳',1,'瓶',1],['护肤彩妆','头发精油',1,'瓶',1],['食品柜','鱼油／个人保健品',1,'瓶',1],['冰箱','牛排／肉类',2,'份',1],['冰箱','豆腐／豆类',2,'份',1]].map((x,i)=>({id:'v4_inventory_'+i,area:x[0],title:x[1],quantity:x[2],unit:x[3],threshold:x[4],expiry:'',notes:''})));renderInventory();
 const movement=routineRows().filter(x=>x.area==='身体'||x.area==='运动'),skin=routineRows().filter(x=>x.area.includes('妆护'));
 $('fitnessPlan').innerHTML=movement.map(x=>`<div class="plan-line"><b>${escapeHtml(x.when)}</b><span>${escapeHtml(x.title)}</span><button onclick="editRoutine('${x.id}')">编辑</button></div>`).join('')+'<p class="safety-note">出现黑视、胸闷、异常气短或疼痛时立即停止并寻求医疗建议。</p>';
 $('skincarePlan').innerHTML=skin.map(x=>`<div class="plan-line"><b>${escapeHtml(x.when)}</b><span>${escapeHtml(x.title)}</span><button onclick="editRoutine('${x.id}')">编辑</button></div>`).join('');
 if($('lifeLearningLinks'))$('lifeLearningLinks').innerHTML=learningLinks().map(x=>`<article><span>${escapeHtml(x.type)}</span><a href="${safeExternalUrl(x.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(x.title)}</a><p>${escapeHtml(x.notes||'')}</p><button onclick="editLearningLink('${x.id}')">编辑</button></article>`).join('');
}

const V4_RECIPE_GROUPS={
 '家常肉菜':'黄焖鸡|板栗烧鸡|香菇炖鸡|啤酒鸭|萝卜炖牛腩|番茄牛腩|土豆烧排骨|豆角焖排骨|梅菜扣肉|京酱肉丝|尖椒牛柳|孜然羊肉|冬瓜丸子|腐乳红烧肉|照烧鸡腿|盐焗鸡翅|蒜香排骨|糖醋里脊',
 '家常素菜':'手撕包菜|虎皮青椒|干锅花菜|地三鲜|上汤娃娃菜|清炒荷兰豆|凉拌黄瓜|凉拌木耳|麻酱菠菜|蒜蓉空心菜|番茄豆腐|家常烧茄子|香煎豆腐|菌菇煲|玉米烙|韭黄炒蛋|西葫芦炒蛋|芹菜香干',
 '汤羹炖菜':'玉米排骨汤|山药排骨汤|番茄蛋花汤|冬瓜虾皮汤|菌菇鸡汤|萝卜牛腩煲|番茄土豆炖牛肉|白菜豆腐煲|酸辣汤|银耳莲子羹|红豆薏米汤|绿豆汤|罗宋汤|奶油蘑菇汤|法式洋葱汤|韩式豆腐汤',
 '一周备饭':'卤牛肉|酱牛腱|卤鸡腿|番茄炖牛腩|咖喱牛肉|台式卤肉|肉酱|烤鸡腿|盐水鸡胸|照烧豆腐|杂粮饭|烤时蔬|蔬菜高汤|冷藏燕麦',
 '中式甜品':'杨枝甘露|双皮奶|姜撞奶|桂花酒酿圆子|红糖糍粑|芋圆烧仙草|绿豆糕|驴打滚|豌豆黄|鲜花饼|蛋黄酥|老婆饼|桃酥|芝麻汤圆|红豆沙|冰粉|杏仁豆腐|椰汁西米露',
 '小蛋糕与烘焙':'戚风蛋糕|海绵蛋糕|纸杯蛋糕|巴斯克芝士蛋糕|纽约芝士蛋糕|提拉米苏|红丝绒蛋糕|胡萝卜蛋糕|柠檬磅蛋糕|香蕉玛芬|巧克力布朗尼|玛德琳|司康|曲奇|泡芙|蛋挞|可丽露|苹果派|肉桂卷|北海道吐司',
 '世界甜品':'法式焦糖布丁|马卡龙|舒芙蕾|可丽饼|意式奶冻|西西里卡诺里|西班牙吉事果|葡式蛋挞|英国太妃布丁|英式松糕|奥地利萨赫蛋糕|德国黑森林蛋糕|比利时华夫饼|土耳其果仁蜜饼|日式大福|铜锣烧|抹茶生巧|韩式年糕甜汤|泰式椰奶糕|美式苹果派',
 '无酒精饮品':'柠檬红茶|蜜桃乌龙|桂花拿铁|抹茶拿铁|黑糖珍珠奶茶|杨梅荔枝饮|百香果蜂蜜水|冰镇酸梅汤|桂花乌梅饮|椰青美式|橙香气泡水|黄瓜薄荷水|香蕉奶昔|芒果酸奶昔|热巧克力|印度奶茶|越南冰咖啡|Dalgona 咖啡',
 '酒精饮品':'Mojito|Aperol Spritz|Gin and Tonic|Moscow Mule|Whiskey Sour|Old Fashioned|Negroni|Margarita|Daiquiri|Piña Colada|Espresso Martini|French 75|Bellini|Sangria|Hot Toddy|Mulled Wine|梅酒苏打|桂花米酒',
 '日韩与东南亚':'日式牛肉饭|日式茶碗蒸|日式炸猪排|乌冬面|玉子烧|韩式炸鸡|辣炒年糕|泡菜豆腐锅|参鸡汤|越南烤肉米粉|泰式打抛饭|马来椰浆饭|菲律宾阿多波|新加坡咖椰吐司|印尼仁当牛肉|缅甸鱼汤面',
 '南亚中东非洲':'印度黄油鸡|印度菠菜奶酪|印度香饭|印度扁豆咖喱|中东鹰嘴豆泥|沙克舒卡|土耳其烤肉|黎巴嫩塔布勒沙拉|摩洛哥塔吉锅|埃及库莎丽|埃塞俄比亚炖鸡|南非波波蒂',
 '欧洲美洲扩展':'意式千层面|意式烩饭|意式青酱面|法式洛林咸派|法式红酒炖鸡|西班牙土豆饼|希腊穆萨卡|匈牙利炖牛肉|德国烤猪肘|波兰饺子|瑞典肉丸|加拿大肉汁奶酪薯条|美式烤肋排|美式松饼|古巴三明治|秘鲁烤鸡|巴西黑豆饭|阿根廷馅饼'
};
const V4_RECIPE_CATALOG=Object.entries(V4_RECIPE_GROUPS).flatMap(([cuisine,names],g)=>names.split('|').map((name,i)=>({id:`v4_catalog_${g}_${i}`,name,cuisine,type:recipeType(name),main:recipeMain(name)})));
const FULL_RECIPE_CATALOG=[...RECIPE_CATALOG,...V4_RECIPE_CATALOG];
saveCatalogRecipe=function(id){const r=FULL_RECIPE_CATALOG.find(x=>x.id===id);if(!r)return;const existing=recipeRows().find(x=>x.catalogId===id);if(existing){editRecipe(existing.id);return;}state.recipes.unshift({...r,id:uid('recipe'),catalogId:id,status:'想做',ingredients:'',steps:'',notes:'',updatedAt:nowDateTime()});saveState();renderRecipes();};
renderRecipes=function(){const selects=[['recipeCuisine','cuisine'],['recipeType','type'],['recipeMain','main']];const all=[...FULL_RECIPE_CATALOG,...recipeRows()];for(const [id,key] of selects){const el=$(id);if(el.options.length===1)[...new Set(all.map(r=>r[key]).filter(Boolean))].sort().forEach(n=>el.add(new Option(n,n)));}const q=$('recipeSearch').value.toLowerCase(),c=$('recipeCuisine').value,t=$('recipeType').value,m=$('recipeMain').value;const items=all.filter(r=>(c==='all'||r.cuisine===c)&&(t==='all'||r.type===t)&&(m==='all'||r.main===m)&&JSON.stringify(r).toLowerCase().includes(q));const saved=recipeRows(),made=saved.filter(r=>['做过','常做'].includes(r.status)).length;$('recipeStats').innerHTML=metricCards([['可筛选索引',FULL_RECIPE_CATALOG.length,'道中外菜名'],['我的菜谱',saved.length,'道可编辑记录'],['已经做过',made,'道']]);$('recipeList').innerHTML=items.slice(0,180).map(r=>{const custom=!r.id.includes('catalog_');return `<article class="recipe-card"><span>${escapeHtml(r.cuisine)} · ${escapeHtml(r.type)}</span><h3>${escapeHtml(r.name)}</h3><p>${escapeHtml(r.main||'')}</p><button onclick="${custom?`editRecipe('${r.id}')`:`saveCatalogRecipe('${r.id}')`}">${custom?'查看 / 编辑':saved.some(x=>x.catalogId===r.id)?'已收藏 · 编辑':'收藏并写做法'}</button></article>`;}).join('')||'<div class="empty-state">没有匹配菜谱；可以清空筛选或自建一条。</div>';};

function editAchievement(id=''){const rows=customAchievements(),old=rows.find(x=>x.id===id)||{};openEditDialog({title:'我的成就徽章',fields:[{name:'category',label:'类别',value:old.category||'学习成长'},{name:'title',label:'徽章名称',value:old.title||''},{name:'level',label:'等级',type:'select',value:old.level||'初阶',options:['初阶','进阶','高阶','自定义'].map(value=>({value,label:value}))},{name:'date',label:'获得日期',type:'date',value:old.date||todayStr()},{name:'evidence',label:'为什么值得记录 / 证据',type:'textarea',value:old.evidence||''}],onSave:v=>{if(!v.title.trim())return false;const item={...old,...v,id:id||uid('achievement')};state.customAchievements=id?rows.map(x=>x.id===id?item:x):[item,...rows];saveState();renderCustomAchievements();},onDelete:id?()=>{state.customAchievements=rows.filter(x=>x.id!==id);saveState();renderCustomAchievements();}:null});}
function renderCustomAchievements(){let panel=$('customAchievementPanel');if(!panel){panel=document.createElement('div');panel.id='customAchievementPanel';panel.className='soft-card p-5';panel.innerHTML='<div class="section-head"><div><h2>我的自定义徽章</h2><p>系统徽章保留；这里的名称、等级和证据全部由你编辑。</p></div><button class="btn-main" onclick="editAchievement()">＋ 添加徽章</button></div><div id="customAchievementList" class="achievement-custom-grid"></div>';$('achievement-section').appendChild(panel);}const list=$('customAchievementList');list.innerHTML=customAchievements().map(x=>`<article><span>${escapeHtml(x.category)} · ${escapeHtml(x.level)}</span><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.evidence||'')}</p><button onclick="editAchievement('${x.id}')">编辑 / 删除</button></article>`).join('')||'<div class="empty-state">还没有自定义徽章。</div>';}

function prepareV4UI(){
 document.querySelectorAll('[data-study-tab]').forEach(b=>b.onclick=()=>setStudyTab(b.dataset.studyTab));
 ['areaRoleFilter','areaSearch','bookCategory','bookSearch'].forEach(id=>{const el=$(id);el.oninput=renderStudy;el.onchange=renderStudy;});
 const themeCard=document.querySelector('#home-section > .soft-card:nth-child(2)');if(themeCard)themeCard.classList.add('home-analytics-hidden');
 const attendance=document.querySelector('#home-section > .soft-card:nth-child(3)');if(attendance){attendance.classList.add('home-attendance-compact');const details=attendance.querySelector('.mt-4.grid');if(details){details.hidden=true;const btn=document.createElement('button');btn.className='secondary-action';btn.textContent='查看 / 修正明细';btn.onclick=()=>{details.hidden=!details.hidden;btn.textContent=details.hidden?'查看 / 修正明细':'收起明细'};attendance.querySelector('.flex.flex-wrap.gap-2.items-center')?.appendChild(btn);}}
 renderStudy();renderInformation();renderCustomAchievements();loadLiveNews();
}

const v3Nav=navTo;
navTo=function(id){v3Nav(id);if(id==='study-section')renderStudy();if(id==='information-section'){renderInformation();loadLiveNews();}if(id==='achievement-section')renderCustomAchievements();};
const v3Export=exportJson;
exportJson=function(){const blob=new Blob([JSON.stringify({...state,format:'becoming-undergraduate-v4'},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`becoming-workspace-${todayStr()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};

const V5_DATA_KEYS = ['inbox', 'planItems', 'pointsRules', 'pointsLog', 'universityAssessments', 'placementLogs', 'applications', 'moneyTransactions', 'moneyBudgets', 'moneyAccounts', 'wishlist', 'styleItems', 'decisionLog'];
function openWorkflowTaskEditor(id) { openTaskEditor(id); }
function ensureV5State() { V5_DATA_KEYS.forEach(k => { if (!Array.isArray(state[k]))
    state[k] = []; }); if (!state.v5Meta || Array.isArray(state.v5Meta) || typeof state.v5Meta !== 'object')
    state.v5Meta = {}; if (!state.pointsRules.length)
    state.pointsRules = [['SOP / Habit', 10], ['Reading session', 10], ['English session', 10], ['Exercise', 10], ['Finish a movie', 100], ['Finish a book', 200], ['Weekly Review', 30], ['Monthly Review', 100]].map((x, i) => ({ id: 'point_rule_' + i, title: x[0], points: x[1], active: true })); }
function v5Rows(key) { ensureV5State(); return state[key]; }
function v5Save() { saveState(); renderV5Current(); renderV5Home(); }
function v5Delete(key, id) { state[key] = v5Rows(key).filter(x => x.id !== id); v5Save(); }
function v5DateLabel() { return new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date()); }
function v5Title(s = '') { return escapeHtml(String(s || '')); }
function v5Empty(text, action = '', onclick = '') { return `<div class="v5-empty">${escapeHtml(text)}${action ? ` <button class="btn-main" onclick="${onclick}">${escapeHtml(action)}</button>` : ''}</div>`; }
function v5List(rows, render, empty = '还没有记录。') { return rows.length ? `<div class="v5-list">${rows.map(render).join('')}</div>` : v5Empty(empty); }
function editPlanItem(id = '', scope = 'week') { const rows = v5Rows('planItems'), old = rows.find(x => x.id === id) || {}; openEditDialog({ title: '计划项目 · Plan item', fields: [{ name: 'scope', label: '层级 · Level', type: 'select', value: old.scope || scope, options: [['day', '日 Day'], ['week', '周 Week'], ['month', '月 Month'], ['year', '年 Year'], ['not-month', 'Not this month']].map(([value, label]) => ({ value, label })) }, { name: 'title', label: '结果 / 方向 · Outcome', value: old.title || '' }, { name: 'area', label: '领域 · Area', value: old.area || 'Academic' }, { name: 'date', label: '日期 / 截止 · Date', type: 'date', value: old.date || '' }, { name: 'status', label: '状态 · Status', type: 'select', value: old.status || 'active', options: [['active', 'Active'], ['done', 'Done'], ['paused', 'Paused']].map(([value, label]) => ({ value, label })) }, { name: 'notes', label: '下一步 / 证据 · Next action', type: 'textarea', value: old.notes || '' }], onSave: v => { if (!v.title.trim())
        return false; const item = { ...old, ...v, id: id || uid('plan') }; state.planItems = id ? rows.map(x => x.id === id ? item : x) : [item, ...rows]; v5Save(); }, onDelete: id ? () => v5Delete('planItems', id) : null }); }
function editPointRule(id = '') { const rows = v5Rows('pointsRules'), old = rows.find(x => x.id === id) || {}; openEditDialog({ title: '积分规则 · Points rule', fields: [{ name: 'title', label: '活动 · Activity', value: old.title || '' }, { name: 'points', label: '积分 · Points', type: 'number', value: old.points ?? 10 }, { name: 'active', label: '状态 · Status', type: 'select', value: String(old.active !== false), options: [{ value: 'true', label: '启用 Enabled' }, { value: 'false', label: '停用 Disabled' }] }], onSave: v => { if (!v.title.trim())
        return false; const item = { ...old, ...v, id: id || uid('point-rule'), points: Number(v.points || 0), active: v.active === 'true' }; state.pointsRules = id ? rows.map(x => x.id === id ? item : x) : [...rows, item]; v5Save(); }, onDelete: id ? () => v5Delete('pointsRules', id) : null }); }
function addPoints(ruleId = '') { const rule = v5Rows('pointsRules').find(x => x.id === ruleId); openEditDialog({ title: '记录积分 · Add points', fields: [{ name: 'title', label: '活动 · Activity', value: rule?.title || '' }, { name: 'points', label: '积分 · Points', type: 'number', value: rule?.points ?? 10 }, { name: 'date', label: '日期 · Date', type: 'date', value: todayStr() }, { name: 'note', label: '证据 / 备注 · Evidence', type: 'textarea', value: '' }], onSave: v => { if (!v.title.trim())
        return false; state.pointsLog.unshift({ ...v, id: uid('point-log'), points: Number(v.points || 0) }); v5Save(); } }); }

function ensureAppleCalendarState() {
  if (!state.appleCalendar || typeof state.appleCalendar !== 'object') state.appleCalendar = { events:[], importedAt:'', fileName:'' };
  if (!Array.isArray(state.appleCalendar.events)) state.appleCalendar.events = [];
  return state.appleCalendar;
}
function appleUnescape(value='') {
  return String(value).replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\').trim();
}
function applePad(value) { return String(value).padStart(2, '0'); }
function appleDateKey(date) { return date.getFullYear() + '-' + applePad(date.getMonth() + 1) + '-' + applePad(date.getDate()); }
function appleTime(date) { return applePad(date.getHours()) + ':' + applePad(date.getMinutes()); }
function appleZonedDate(parts, timeZone) {
  if (!timeZone) return new Date(parts.y, parts.m - 1, parts.d, parts.h || 0, parts.mi || 0, parts.s || 0);
  try {
    let guess = Date.UTC(parts.y, parts.m - 1, parts.d, parts.h || 0, parts.mi || 0, parts.s || 0);
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone, hourCycle:'h23', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' });
    for (let pass = 0; pass < 2; pass++) {
      const found = Object.fromEntries(formatter.formatToParts(new Date(guess)).filter(x => x.type !== 'literal').map(x => [x.type, Number(x.value)]));
      const shown = Date.UTC(found.year, found.month - 1, found.day, found.hour === 24 ? 0 : found.hour, found.minute, found.second);
      guess += Date.UTC(parts.y, parts.m - 1, parts.d, parts.h || 0, parts.mi || 0, parts.s || 0) - shown;
    }
    return new Date(guess);
  } catch (_) { return new Date(parts.y, parts.m - 1, parts.d, parts.h || 0, parts.mi || 0, parts.s || 0); }
}
function parseAppleDate(value='', params={}) {
  const raw = String(value).trim();
  const match = raw.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?(Z)?$/);
  if (!match) return null;
  const parts = { y:+match[1], m:+match[2], d:+match[3], h:+(match[4] || 0), mi:+(match[5] || 0), s:+(match[6] || 0) };
  const allDay = !match[4] || String(params.VALUE || '').toUpperCase() === 'DATE';
  const date = match[7] ? new Date(Date.UTC(parts.y, parts.m - 1, parts.d, parts.h, parts.mi, parts.s)) : appleZonedDate(parts, params.TZID || '');
  return { date, allDay, parts, timeZone:params.TZID || '' };
}
function parseAppleProperty(line) {
  const cut = line.indexOf(':'); if (cut < 0) return null;
  const left = line.slice(0, cut).split(';'), name = left.shift().toUpperCase(), params = {};
  left.forEach(part => { const i = part.indexOf('='); if (i > 0) params[part.slice(0, i).toUpperCase()] = part.slice(i + 1).replace(/^"|"$/g, ''); });
  return { name, params, value:line.slice(cut + 1) };
}
function appleRrule(rule='') { return Object.fromEntries(String(rule).split(';').map(x => x.split('=')).filter(x => x.length === 2).map(([k,v]) => [k.toUpperCase(), v])); }
function appleSynthetic(parts) { return new Date(parts.y, parts.m - 1, parts.d, parts.h || 0, parts.mi || 0, parts.s || 0); }
function appleParts(date) { return { y:date.getFullYear(), m:date.getMonth()+1, d:date.getDate(), h:date.getHours(), mi:date.getMinutes(), s:date.getSeconds() }; }
function expandAppleEvent(raw, minDate, maxDate) {
  const startInfo = parseAppleDate(raw.DTSTART?.value, raw.DTSTART?.params || {}); if (!startInfo) return [];
  const endInfo = parseAppleDate(raw.DTEND?.value, raw.DTEND?.params || {});
  const start = startInfo.date, fallbackMs = startInfo.allDay ? 86400000 : 3600000;
  const duration = Math.max(0, (endInfo?.date?.getTime() || start.getTime() + fallbackMs) - start.getTime());
  const make = (date, index=0) => ({ id:'apple_' + (raw.UID || 'event') + '_' + date.getTime() + '_' + index, uid:raw.UID || '', title:appleUnescape(raw.SUMMARY || '未命名日程'), startIso:date.toISOString(), endIso:new Date(date.getTime() + duration).toISOString(), allDay:startInfo.allDay, location:appleUnescape(raw.LOCATION || ''), notes:appleUnescape(raw.DESCRIPTION || ''), url:appleUnescape(raw.URL || ''), source:'apple-calendar' });
  if (!raw.RRULE) return [make(start)];
  const rule = appleRrule(raw.RRULE), freq = rule.FREQ, interval = Math.max(1, Number(rule.INTERVAL || 1)), count = Math.min(5000, Math.max(1, Number(rule.COUNT || 5000)));
  const untilInfo = rule.UNTIL ? parseAppleDate(rule.UNTIL, {}) : null, until = untilInfo?.date || maxDate;
  const excluded = new Set((raw.EXDATE || []).flatMap(item => String(item.value || '').split(',')).map(value => parseAppleDate(value, {})?.date?.getTime()).filter(Boolean));
  const results = [], seed = appleSynthetic(startInfo.parts), byDays = String(rule.BYDAY || '').split(',').filter(Boolean).map(x => x.replace(/^[-+]?\d+/, '')).map(x => ({SU:0,MO:1,TU:2,WE:3,TH:4,FR:5,SA:6})[x]).filter(x => x !== undefined);
  let generated = 0;
  if (freq === 'WEEKLY' && byDays.length) {
    const cursor = new Date(seed); cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));
    for (let week=0; generated<count && cursor<=until && cursor<=maxDate; week+=interval) {
      for (const weekday of byDays) { const occurrence = new Date(cursor); occurrence.setDate(cursor.getDate() + ((weekday + 6) % 7) + week * 7); if (occurrence < seed || occurrence > until || occurrence > maxDate) continue; generated++; const actual = appleZonedDate(appleParts(occurrence), startInfo.timeZone); if (actual >= minDate && !excluded.has(actual.getTime())) results.push(make(actual, generated)); if (generated >= count) break; }
    }
  } else {
    for (let i=0; generated<count; i++) {
      const occurrence = new Date(seed);
      if (freq === 'DAILY') occurrence.setDate(seed.getDate() + i * interval);
      else if (freq === 'WEEKLY') occurrence.setDate(seed.getDate() + i * 7 * interval);
      else if (freq === 'MONTHLY') occurrence.setMonth(seed.getMonth() + i * interval);
      else if (freq === 'YEARLY') occurrence.setFullYear(seed.getFullYear() + i * interval);
      else break;
      const actual = appleZonedDate(appleParts(occurrence), startInfo.timeZone); if (actual > until || actual > maxDate) break;
      generated++; if (actual >= minDate && !excluded.has(actual.getTime())) results.push(make(actual, generated));
    }
  }
  return results;
}
function parseAppleCalendar(text) {
  const lines = String(text).replace(/\r?\n[ \t]/g, '').split(/\r?\n/), rows = []; let current = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { current = { EXDATE:[] }; continue; }
    if (line === 'END:VEVENT') { if (current) rows.push(current); current = null; continue; }
    if (!current) continue; const prop = parseAppleProperty(line); if (!prop) continue;
    if (prop.name === 'EXDATE') current.EXDATE.push(prop); else if (['DTSTART','DTEND'].includes(prop.name)) current[prop.name] = prop; else current[prop.name] = prop.value;
  }
  const now = new Date(), min = new Date(now.getFullYear()-1, 0, 1), max = new Date(now.getFullYear()+3, 11, 31, 23, 59, 59);
  const exceptionRows = rows.filter(x => x['RECURRENCE-ID']);
  const exceptionKeys = new Set(exceptionRows.map(x => { const d = parseAppleDate(x['RECURRENCE-ID'], {})?.date; return String(x.UID || '') + '|' + (d ? d.getTime() : ''); }));
  const events = rows.filter(x => !x['RECURRENCE-ID']).flatMap(x => expandAppleEvent(x, min, max)).filter(x => !exceptionKeys.has(String(x.uid || '') + '|' + new Date(x.startIso).getTime()));
  exceptionRows.filter(x => String(x.STATUS || '').toUpperCase() !== 'CANCELLED').forEach(x => events.push(...expandAppleEvent(x, min, max)));
  return events.sort((a,b) => a.startIso.localeCompare(b.startIso));
}
function appleEventsForDate(date=todayStr()) {
  const calendar = ensureAppleCalendarState();
  return calendar.events.filter(item => {
    const start = new Date(item.startIso), end = new Date(item.endIso); if (!Number.isFinite(start.getTime())) return false;
    const startKey = appleDateKey(start), endKey = appleDateKey(new Date(Math.max(start.getTime(), end.getTime() - 1)));
    return date >= startKey && date <= endKey;
  }).map(item => { const start = new Date(item.startIso), end = new Date(item.endIso), startsToday = appleDateKey(start) === date; return { ...item, start:item.allDay ? '全天' : (startsToday ? appleTime(start) : '00:00'), end:item.allDay ? '' : appleTime(end), color:'#ff4f63' }; });
}
function combinedScheduleBlocks(date=todayStr()) { return [...getDayTimeBlocks(date), ...appleEventsForDate(date)].sort((a,b) => (a.start === '全天' ? '00:00' : a.start || '').localeCompare(b.start === '全天' ? '00:00' : b.start || '')); }
function scheduleWhen(item) { const time = item.allDay || !item.end ? (item.start || '全天') : (item.start || '') + '–' + item.end; return time + (item.location ? ' · ' + item.location : ''); }
function appleCalendarControls() {
  const c = ensureAppleCalendarState(), detail = c.events.length ? '<span class="apple-calendar-source"><i class="apple-calendar-dot"></i>' + c.events.length + ' events</span>' : '';
  return '<div class="apple-calendar-actions">' + detail + '<button type="button" onclick="openAppleCalendarImport()">' + (c.events.length ? '更新 Apple Calendar' : '导入 Apple Calendar') + '</button>' + (c.events.length ? '<button type="button" onclick="clearAppleCalendar()">清除</button>' : '') + '</div>';
}
function openAppleCalendarImport() { const input = $('appleCalendarFile'); input.value = ''; input.click(); }
async function importAppleCalendarFiles(fileList) {
  const files = [...(fileList || [])]; if (!files.length) return;
  try { const texts = await Promise.all(files.map(file => file.text())); if (texts.some(text => !/BEGIN:VCALENDAR/i.test(text))) return alert('选择的文件中有一个不是 Apple 日历导出的 .ics 文件。'); const events = texts.flatMap(parseAppleCalendar); if (!events.length) return alert('没有在文件中找到可显示的日历事件。'); state.appleCalendar = { events, importedAt:nowDateTime(), fileName:files.map(x => x.name).join(', ') }; saveState(); renderAll(); renderV5Home(); if (currentSection === 'plan-section') renderPlan('day'); alert('已从 ' + files.length + ' 个日历文件导入 ' + events.length + ' 个事件。内容只保存在此浏览器。'); }
  catch (error) { console.error(error); alert('日历导入失败：' + (error?.message || '请重新从 Apple 日历导出 .ics 文件')); }
}
function clearAppleCalendar() { if (!confirm('只清除网页中导入的 Apple 日历事件吗？Apple 日历本身不会受影响。')) return; state.appleCalendar = { events:[], importedAt:'', fileName:'' }; saveState(); renderAll(); renderV5Home(); if (currentSection === 'plan-section') renderPlan('day'); }

function renderPlan(tab = state.v5Meta.planTab || 'day') {
    ensureV5State();
    state.v5Meta.planTab = tab;
    document.querySelectorAll('[data-plan-tab]').forEach(b => b.classList.toggle('active', b.dataset.planTab === tab));
    const root = $('planContent');
    if (!root)
        return;
    const items = v5Rows('planItems');
    if (tab === 'sop') {
        root.innerHTML = `<div class="v5-split"><div><div class="section-head"><div><h2>锚点与维护 · Anchors & Maintenance</h2><p>每日锚点常驻；每周与每月维护只在需要时出现。</p></div><button class="btn-main" onclick="editRoutine()">＋ New SOP</button></div>${v5List(routineRows().filter(x => x.active !== false), (x) => `<div class="v5-list-row"><div><h3>${v5Title(x.title)}</h3><p>${v5Title(x.cadence)} · ${v5Title(x.when)} · ${v5Title(x.notes)}</p></div><button onclick="editRoutine('${x.id}')">编辑 · Edit</button></div>`, '还没有启用的 SOP。')}</div><aside><div class="v5-editorial-card tint-sage"><p class="eyebrow">LIBRARY</p><h3>SOP Library</h3><p>晨间、出门、学习、睡前、个人护理、清洁、采购、备饭、旅行打包、作业提交与大学事务。</p><button onclick="navTo('homebase-section')">打开完整 SOP →</button></div></aside></div>`;
        return;
    }
    if (tab === 'points') {
        const total = v5Rows('pointsLog').reduce((s, x) => s + Number(x.points || 0), 0);
        root.innerHTML = `<div class="v5-split"><div><div class="section-head"><div><h2>积分记录 · Points Journal</h2><p>这是温和的积累证据，不是生活成绩单。</p></div><button class="btn-main" onclick="addPoints()">＋ Manual adjustment</button></div><p class="points-total"><span>累计 · Total</span><strong>${total}</strong></p>${v5List(v5Rows('pointsLog').slice(0, 20), x => `<div class="v5-list-row"><div><h3>${v5Title(x.title)}</h3><p>${v5Title(x.date)} · ${v5Title(x.note)}</p></div><strong>${Number(x.points) > 0 ? '+' : ''}${Number(x.points || 0)}</strong></div>`, '完成一次真正重要的活动后，再记录第一笔积分。')}</div><aside><div class="section-head"><div><h2>规则 · Rules</h2><p>全部可编辑或停用。</p></div><button onclick="editPointRule()">＋ Add</button></div>${v5List(v5Rows('pointsRules'), x => `<div class="v5-list-row"><div><h3>${v5Title(x.title)}</h3><p>${x.active === false ? 'Paused' : 'Enabled'}</p></div><button onclick="editPointRule('${x.id}')">${Number(x.points) > 0 ? '+' : ''}${Number(x.points || 0)}</button></div>`)}</aside></div>`;
        return;
    }
    const labels = { day: ['今天 · Day', 'Must Do 最多 3 项；再看日程和 routine anchors。'], week: ['本周 · Week', '只决定 3 个 Must-win，不自动滚动全部未完成任务。'], month: ['本月 · Month', '3–5 个结果、关键截止与当前 Learning Cycle。'], year: ['今年 · Year', '关注方向和能力证据，而不是堆很多目标。'] };
    const scoped = items.filter(x => x.scope === tab);
    let primary = '';
    if (tab === 'day') {
        const tasks = state.tasks.filter(taskOpen).filter(t => t.todayBucket || t.dueDate === todayStr() || t.status === 'active').slice(0, 3);
        const blocks = combinedScheduleBlocks(todayStr());
        const anchors = routineRows().filter(x => x.active !== false && x.cadence === 'daily').slice(0, 8);
        primary = `<div class="v5-split"><div><div class="section-head"><div><h2>Must Do</h2><p>今天最重要的三件事。</p></div><button onclick="navTo('workflow-section')">管理任务 →</button></div>${v5List(tasks, (x, i) => `<div class="v5-list-row"><div><h3>${i + 1}. ${v5Title(x.title)}</h3><p>${v5Title(projectById(x.projectId)?.title || x.context || 'Today')} ${x.estimate ? `· ${x.estimate} min` : ''}</p></div><button onclick="openWorkflowTaskEditor('${x.id}')">编辑</button></div>`, '今天还没有 Must Do。', '＋ 添加一项', 'editPlanItem(\'\',\'day\')')}<div class="section-head v5-top-space"><div><h2>日程 · Schedule</h2></div>${appleCalendarControls()}</div>${v5List(blocks, x => `<div class="v5-list-row"><div><h3>${v5Title(x.title)}</h3><p>${v5Title(scheduleWhen(x))}</p></div></div>`, '今天还没有排时间块。')}</div><aside><div class="section-head"><div><h2>Routine Anchors</h2><p>可放进今天，也可以今天跳过。</p></div></div>${v5List(anchors, x => `<div class="v5-list-row"><div><h3>${v5Title(x.title)}</h3><p>${v5Title(x.when)} · ${v5Title(x.minutes)} min</p></div><button onclick="routineToTask('${x.id}')">＋ Today</button></div>`)}</aside></div>`;
    }
    else {
        primary = `<div class="section-head"><div><h2>${labels[tab][0]}</h2><p>${labels[tab][1]}</p></div><button class="btn-main" onclick="editPlanItem('', '${tab}')">＋ New</button></div>${v5List(scoped, x => `<div class="v5-list-row"><div><h3>${v5Title(x.title)}</h3><p>${v5Title(x.area)}${x.date ? ` · ${v5Title(x.date)}` : ''} · ${v5Title(x.notes)}</p></div><button onclick="editPlanItem('${x.id}')">编辑 · Edit</button></div>`, '这里保持空白，直到你决定本阶段真正重要的结果。')}${tab === 'month' ? `<div class="section-head v5-top-space"><div><h2>Not This Month</h2><p>值得做，但现在不启动。</p></div><button onclick="editPlanItem('', 'not-month')">＋ Add</button></div>${v5List(items.filter(x => x.scope === 'not-month'), x => `<div class="v5-list-row"><div><h3>${v5Title(x.title)}</h3><p>${v5Title(x.area)} · ${v5Title(x.notes)}</p></div><button onclick="editPlanItem('${x.id}')">编辑</button></div>`, '目前没有刻意暂停的方向。')}` : ''}`;
    }
    root.innerHTML = primary;
}
function editUniversityAssessment(id = '') { const rows = v5Rows('universityAssessments'), old = rows.find(x => x.id === id) || {}; openEditDialog({ title: '课程作业 · Assessment', fields: [{ name: 'module', label: '课程 · Module', value: old.module || '' }, { name: 'type', label: '类型 · Type', value: old.type || 'Essay' }, { name: 'title', label: '题目 · Title', value: old.title || '' }, { name: 'deadline', label: '截止 · Deadline', type: 'date', value: old.deadline || '' }, { name: 'weighting', label: '权重 · Weighting', value: old.weighting || '' }, { name: 'status', label: '状态 · Status', value: old.status || 'Not started' }, { name: 'progress', label: '进度 · Progress', type: 'number', value: old.progress || 0 }, { name: 'next', label: '下一步 · Next action', type: 'textarea', value: old.next || '' }, { name: 'links', label: '文件 / 链接 · Files', type: 'textarea', value: old.links || '' }], onSave: v => { if (!v.title.trim())
        return false; const item = { ...old, ...v, id: id || uid('assessment'), progress: Math.max(0, Math.min(100, Number(v.progress || 0))) }; state.universityAssessments = id ? rows.map(x => x.id === id ? item : x) : [item, ...rows]; v5Save(); }, onDelete: id ? () => v5Delete('universityAssessments', id) : null }); }
function editPlacement(id = '') { const rows = v5Rows('placementLogs'), old = rows.find(x => x.id === id) || {}; openEditDialog({ title: 'Placement 记录', fields: [{ name: 'date', label: '日期 · Date', type: 'date', value: old.date || todayStr() }, { name: 'hours', label: '时数 · Hours', type: 'number', value: old.hours || '' }, { name: 'category', label: '类别 · Category', value: old.category || 'Direct contact' }, { name: 'evidence', label: '实践与证据 · Evidence', type: 'textarea', value: old.evidence || '' }, { name: 'reflection', label: '反思 · Reflection', type: 'textarea', value: old.reflection || '' }], onSave: v => { const item = { ...old, ...v, id: id || uid('placement'), hours: Number(v.hours || 0) }; state.placementLogs = id ? rows.map(x => x.id === id ? item : x) : [item, ...rows]; v5Save(); }, onDelete: id ? () => v5Delete('placementLogs', id) : null }); }
function renderUniversity(tab = state.v5Meta.universityTab || 'overview') {
    state.v5Meta.universityTab = tab;
    document.querySelectorAll('[data-university-tab]').forEach(b => b.classList.toggle('active', b.dataset.universityTab === tab));
    const root = $('universityContent');
    if (!root)
        return;
    const assessments = v5Rows('universityAssessments');
    if (tab === 'overview') {
        const next = assessments.filter(x => x.status !== 'Complete').sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999')).slice(0, 3);
        root.innerHTML = `<div class="v5-split"><div><div class="section-head"><div><h2>下一步 · Next Actions</h2><p>课程与论文最接近交付的动作。</p></div></div>${v5List(next, x => `<div class="v5-list-row"><div><h3>${v5Title(x.next || x.title)}</h3><p>${v5Title(x.module)}${x.deadline ? ` · ${v5Title(x.deadline)}` : ''}</p></div><button onclick="editUniversityAssessment('${x.id}')">Edit</button></div>`, '还没有课程作业。')}</div><aside><div class="v5-editorial-card tint-sky"><p class="eyebrow">YEAR 3</p><h3>课程 → 作业 → 证据</h3><p>Lecture、seminar、reading、PPT 与 assessment 保持连接。</p><button onclick="renderUniversity('modules')">查看课程</button></div></aside></div>`;
    }
    if (tab === 'modules')
        root.innerHTML = `<div class="section-head"><div><h2>课程 · Modules</h2><p>Lecture、seminar、weekly reading、slides、notes 与 seminar questions。</p></div><button class="btn-main" onclick="editStudyModule()">＋ New Module</button></div><div id="v5ModuleTable"></div>`;
    if (tab === 'modules') {
        const el = $('v5ModuleTable');
        el.innerHTML = notionTable(['课程 Module', '学期 Term', 'Lecture / Seminar', 'Core reading', '证据 Evidence', '状态'], studyModules().map(x => [`<button onclick="editStudyModule('${x.id}')">${v5Title(x.name)}</button>`, v5Title(x.term), v5Title(x.lecture), v5Title(x.coreReading), v5Title(x.weeklyOutput), v5Title(x.status)]));
    }
    if (tab === 'assessments')
        root.innerHTML = `<div class="section-head"><div><h2>作业 · Assessments</h2><p>只在列表显示截止、进度和下一步；详细材料打开后再看。</p></div><button class="btn-main" onclick="editUniversityAssessment()">＋ New Assessment</button></div>${v5List(assessments, x => `<div class="v5-list-row"><div><h3>${v5Title(x.title)}</h3><p>${v5Title(x.module)} · ${v5Title(x.type)} · ${v5Title(x.status)}${x.deadline ? ` · ${v5Title(x.deadline)}` : ''}<br>${v5Title(x.next)}</p></div><button onclick="editUniversityAssessment('${x.id}')">${Number(x.progress || 0)}%</button></div>`, 'No assessments yet. Add the first deadline when your module information is confirmed.')}`;
    if (tab === 'placement') {
        const logs = v5Rows('placementLogs');
        const hours = logs.reduce((s, x) => s + Number(x.hours || 0), 0);
        root.innerHTML = `<div class="section-head"><div><h2>Placement</h2><p>${hours} hours recorded · 记录时数、接触类别、证据和反思。</p></div><button class="btn-main" onclick="editPlacement()">＋ Add Log</button></div>${v5List(logs, x => `<div class="v5-list-row"><div><h3>${v5Title(x.date)} · ${v5Title(x.category)}</h3><p>${v5Title(x.evidence || x.reflection)}</p></div><button onclick="editPlacement('${x.id}')">${Number(x.hours || 0)} h</button></div>`, 'No placement logs yet.')}`;
    }
}
function editApplication(id = '') { const rows = v5Rows('applications'), old = rows.find(x => x.id === id) || {}; openEditDialog({ title: '研究生申请 · Application', fields: [{ name: 'university', label: '大学 · University', value: old.university || '' }, { name: 'programme', label: '项目 · Programme', value: old.programme || '' }, { name: 'deadline', label: '截止 · Deadline', type: 'date', value: old.deadline || '' }, { name: 'priority', label: '优先级 · Priority', value: old.priority || 'Primary' }, { name: 'status', label: '状态 · Status', type: 'select', value: old.status || 'Researching', options: ['Researching', 'Preparing', 'Waiting for', 'Ready', 'Submitted', 'Interview', 'Offer', 'Unsuccessful', 'Paused'].map(value => ({ value, label: value })) }, { name: 'requirements', label: '要求 / Checklist', type: 'textarea', value: old.requirements || 'Transcript\nCV\nEnglish-language proof\nWritten work\nReferences\nCertificates\nForms' }, { name: 'written', label: 'Written work / Statement', type: 'textarea', value: old.written || '' }, { name: 'references', label: '推荐信 · References', type: 'textarea', value: old.references || '' }, { name: 'waiting', label: '正在等待 · Waiting for', type: 'textarea', value: old.waiting || '' }, { name: 'interview', label: '面试准备 · Interview', type: 'textarea', value: old.interview || '' }, { name: 'next', label: '下一步 · Next action', type: 'textarea', value: old.next || '' }], onSave: v => { if (!v.university.trim() && !v.programme.trim())
            return false; const item = { ...old, ...v, id: id || uid('application') }; state.applications = id ? rows.map(x => x.id === id ? item : x) : [item, ...rows]; v5Save(); }, onDelete: id ? () => v5Delete('applications', id) : null }); }
    function renderApplications(tab = state.v5Meta.applicationTab || 'programmes') { state.v5Meta.applicationTab = tab; document.querySelectorAll('[data-application-tab]').forEach(b => b.classList.toggle('active', b.dataset.applicationTab === tab)); const root = $('applicationsContent'); if (!root)
        return; const apps = v5Rows('applications'), filtered = tab === 'waiting' ? apps.filter(x => x.status === 'Waiting for' || x.waiting) : apps; const title = tab === 'waiting' ? '正在等待 · Waiting For' : tab === 'written' ? 'Written Work & Statements' : '申请项目 · Programmes'; root.innerHTML = `<div class="section-head"><div><h2>${title}</h2><p>${tab === 'waiting' ? '把推荐人、导师、文件处理和决定的等待事项写清楚。' : tab === 'written' ? '将阅读、论证、版本和反馈连接到具体 programme。' : '一个 programme 是一个完整申请容器，而不是普通任务。'}</p></div><button class="btn-main" onclick="editApplication()">＋ New Application</button></div>${v5List(filtered, x => `<div class="v5-list-row"><div><h3>${v5Title(x.university)} · ${v5Title(x.programme)}</h3><p>${v5Title(x.status)}${x.deadline ? ` · ${v5Title(x.deadline)}` : ''}<br>${v5Title(tab === 'waiting' ? x.waiting : tab === 'written' ? x.written : x.next)}</p></div><button onclick="editApplication('${x.id}')">编辑 · Edit</button></div>`, tab === 'waiting' ? '目前没有等待事项。' : '还没有申请项目；确认 programme 后再建立。')}`; }
    function editMoney(kind, id = '') { const key = kind === 'transaction' ? 'moneyTransactions' : kind === 'budget' ? 'moneyBudgets' : kind === 'account' ? 'moneyAccounts' : 'wishlist', rows = v5Rows(key), old = rows.find(x => x.id === id) || {}; let fields = []; if (kind === 'transaction')
        fields = [{ name: 'amount', label: '金额 · Amount', type: 'number', value: old.amount || '' }, { name: 'currency', label: '币种 · Currency', value: old.currency || 'GBP' }, { name: 'date', label: '日期 · Date', type: 'date', value: old.date || todayStr() }, { name: 'category', label: '类别 · Category', value: old.category || 'Groceries' }, { name: 'subcategory', label: '子类别 · Subcategory', value: old.subcategory || '' }, { name: 'merchant', label: '商家 · Merchant', value: old.merchant || '' }, { name: 'payment', label: '支付方式 · Payment', value: old.payment || '' }, { name: 'note', label: '备注 · Note', type: 'textarea', value: old.note || '' }]; if (kind === 'budget')
        fields = [{ name: 'category', label: '类别 · Category', value: old.category || '' }, { name: 'amount', label: '预算 · Amount', type: 'number', value: old.amount || '' }, { name: 'currency', label: '币种 · Currency', value: old.currency || 'GBP' }, { name: 'period', label: '周期 · Period', value: old.period || 'Monthly' }, { name: 'note', label: '说明 · Note', type: 'textarea', value: old.note || '' }]; if (kind === 'account')
        fields = [{ name: 'name', label: '账户 · Account', value: old.name || '' }, { name: 'currency', label: '币种 · Currency', value: old.currency || 'GBP' }, { name: 'balance', label: '余额 · Balance', type: 'number', value: old.balance || '' }, { name: 'note', label: '备注 · Note', type: 'textarea', value: old.note || '' }]; if (kind === 'wishlist')
        fields = [{ name: 'item', label: '物品 · Item', value: old.item || '' }, { name: 'category', label: '类别 · Category', value: old.category || '' }, { name: 'url', label: '图片 / 链接 · Link', value: old.url || '' }, { name: 'price', label: '价格 · Price', type: 'number', value: old.price || '' }, { name: 'currency', label: '币种 · Currency', value: old.currency || 'GBP' }, { name: 'priority', label: '优先级 · Priority', value: old.priority || 'Maybe' }, { name: 'reviewDate', label: '冷静期复查 · Review date', type: 'date', value: old.reviewDate || '' }, { name: 'status', label: '状态 · Status', value: old.status || 'Considering' }, { name: 'notes', label: '备注 · Notes', type: 'textarea', value: old.notes || '' }]; openEditDialog({ title: { transaction: '交易 · Transaction', budget: '预算 · Budget', account: '账户 · Account', wishlist: '愿望清单 · Wishlist' }[kind], fields, onSave: v => { const name = v.item || v.name || v.category || v.merchant; if (!String(name || '').trim())
            return false; const item = { ...old, ...v, id: id || uid(kind) }; ['amount', 'price', 'balance'].forEach(k => { if (k in item)
            item[k] = Number(item[k] || 0); }); state[key] = id ? rows.map(x => x.id === id ? item : x) : [item, ...rows]; v5Save(); }, onDelete: id ? () => v5Delete(key, id) : null }); }
    function moneyTotals() { const out = {}; v5Rows('moneyTransactions').forEach(x => { out[x.currency || 'GBP'] = (out[x.currency || 'GBP'] || 0) + Number(x.amount || 0); }); return out; }
    function renderMoney(tab = state.v5Meta.moneyTab || 'overview') { state.v5Meta.moneyTab = tab; document.querySelectorAll('[data-money-tab]').forEach(b => b.classList.toggle('active', b.dataset.moneyTab === tab)); const root = $('moneyContent'); if (!root)
        return; let key = tab === 'transactions' ? 'moneyTransactions' : tab === 'budget' ? 'moneyBudgets' : tab === 'accounts' ? 'moneyAccounts' : tab === 'wishlist' ? 'wishlist' : ''; if (tab === 'overview') {
        const totals = moneyTotals();
        root.innerHTML = `<div class="v5-split"><div><div class="section-head"><div><h2>按币种查看 · By Currency</h2><p>不做未定义汇率的静默合并。</p></div><button class="btn-main" onclick="editMoney('transaction')">＋ Transaction</button></div>${Object.keys(totals).length ? v5List(Object.entries(totals), ([c, v]) => `<div class="v5-list-row"><div><h3>${v5Title(c)}</h3><p>已记录支出 · Recorded spending</p></div><strong>${Number(v).toFixed(2)}</strong></div>`) : v5Empty('还没有交易记录。')}</div><aside><div class="v5-editorial-card tint-butter"><p class="eyebrow">MONTHLY</p><h3>月底对账</h3><p>按 GBP、CNY 等币种分别查看，再决定下月预算。</p><button onclick="renderMoney('budget')">打开预算 →</button></div></aside></div>`;
        return;
    } const names = { transactions: ['流水 · Transactions', 'transaction'], budget: ['预算 · Budget', 'budget'], accounts: ['账户 · Accounts', 'account'], wishlist: ['愿望清单 · Wishlist', 'wishlist'] }, [label, kind] = names[tab], rows = v5Rows(key); root.innerHTML = `<div class="section-head"><div><h2>${label}</h2><p>所有类别、币种、金额和备注都可修改。</p></div><button class="btn-main" onclick="editMoney('${kind}')">＋ Add</button></div>${v5List(rows, x => `<div class="v5-list-row"><div><h3>${v5Title(x.item || x.name || x.merchant || x.category)}</h3><p>${v5Title(x.date || x.period || x.reviewDate || '')} · ${v5Title(x.category || x.currency || '')} · ${v5Title(x.note || x.notes || x.status || '')}</p></div><button onclick="editMoney('${kind}','${x.id}')">${x.amount != null ? `${v5Title(x.currency)} ${Number(x.amount).toFixed(2)}` : x.price != null ? `${v5Title(x.currency)} ${Number(x.price).toFixed(2)}` : 'Edit'}</button></div>`, '还没有记录。')}`; }
    function editStyle(id = '', type = 'look') { const rows = v5Rows('styleItems'), old = rows.find(x => x.id === id) || {}; openEditDialog({ title: '风格记录 · Style', fields: [{ name: 'type', label: '类型 · Type', type: 'select', value: old.type || type, options: ['look', 'inspiration', 'knowledge'].map(value => ({ value, label: value })) }, { name: 'title', label: '名称 · Title', value: old.title || '' }, { name: 'date', label: '日期 · Date', type: 'date', value: old.date || todayStr() }, { name: 'occasion', label: '场合 · Occasion', value: old.occasion || '' }, { name: 'weather', label: '天气 / 温度 · Weather', value: old.weather || '' }, { name: 'keywords', label: '风格关键词 · Keywords', value: old.keywords || '' }, { name: 'pieces', label: '上装 / 下装 / 外套 / 鞋 / 包 / 配饰', type: 'textarea', value: old.pieces || '' }, { name: 'palette', label: '色彩 · Palette', value: old.palette || '' }, { name: 'url', label: '图片 / 来源 · Image or link', value: old.url || '' }, { name: 'notes', label: '搭配解释 / 笔记 · Notes', type: 'textarea', value: old.notes || '' }, { name: 'again', label: 'Would wear again?', value: old.again || '' }], onSave: v => { if (!v.title.trim())
            return false; const item = { ...old, ...v, id: id || uid('style') }; state.styleItems = id ? rows.map(x => x.id === id ? item : x) : [item, ...rows]; v5Save(); }, onDelete: id ? () => v5Delete('styleItems', id) : null }); }
    function renderStyle(tab = state.v5Meta.styleTab || 'today') { state.v5Meta.styleTab = tab; document.querySelectorAll('[data-style-tab]').forEach(b => b.classList.toggle('active', b.dataset.styleTab === tab)); const root = $('styleContent'); if (!root)
        return; const rows = v5Rows('styleItems'); if (tab === 'resources') {
        const links = [['小红书 · 英国秋冬穿搭', 'https://www.xiaohongshu.com/search_result?keyword=' + encodeURIComponent('英国秋冬穿搭')], ['小红书 · 图书馆穿搭', 'https://www.xiaohongshu.com/search_result?keyword=' + encodeURIComponent('图书馆穿搭')], ['小红书 · 低饱和穿搭', 'https://www.xiaohongshu.com/search_result?keyword=' + encodeURIComponent('低饱和穿搭')], ['WEAR', 'https://wear.net/'], ['Vogue Street Style', 'https://www.vogue.com/fashion/street-style'], ['Who What Wear', 'https://www.whowhatwear.com/']];
        root.innerHTML = `<div class="section-head"><div><h2>灵感入口 · Resources</h2><p>使用正常外部链接，主动打开原始来源。</p></div></div><div class="v5-editorial-grid">${links.map((x, i) => `<article class="v5-editorial-card ${['tint-blush', 'tint-sage', 'tint-sky'][i % 3]}"><p class="eyebrow">READ ORIGINAL ↗</p><h3>${v5Title(x[0])}</h3><a href="${x[1]}" target="_blank" rel="noopener noreferrer">打开来源 · Open</a></article>`).join('')}</div>`;
        return;
    } if (tab === 'knowledge') {
        const topics = ['比例 · Proportion', '轮廓 · Silhouette', '色彩 · Colour', '叠穿 · Layering', '材质 · Texture', '配饰 · Accessories', '场合 · Occasion', '季节穿搭 · Seasonal dressing', '衣橱基础 · Wardrobe basics'];
        root.innerHTML = `<div class="section-head"><div><h2>风格知识 · Style Knowledge</h2><p>可以继续添加自己的规则、例子和反例。</p></div><button class="btn-main" onclick="editStyle('', 'knowledge')">＋ Add Note</button></div><div class="v5-editorial-grid">${topics.map((x, i) => `<article class="v5-editorial-card ${i % 4 === 0 ? 'tint-blush' : i % 4 === 1 ? 'tint-sage' : i % 4 === 2 ? 'tint-butter' : 'tint-sky'}"><p class="eyebrow">STYLE STUDY</p><h3>${x}</h3><p>记录适合自己的原则与真实穿着证据。</p></article>`).join('')}</div>${v5List(rows.filter(x => x.type === 'knowledge'), x => `<div class="v5-list-row"><div><h3>${v5Title(x.title)}</h3><p>${v5Title(x.notes)}</p></div><button onclick="editStyle('${x.id}')">Edit</button></div>`, '还没有个人风格笔记。')}`;
        return;
    } const type = tab === 'inspiration' ? 'inspiration' : 'look', shown = rows.filter(x => x.type === type); root.innerHTML = `<div class="section-head"><div><h2>${tab === 'today' ? '今日穿搭 · Today’s Outfit' : tab === 'inspiration' ? '灵感 · Inspiration' : '我的造型 · My Looks'}</h2><p>${tab === 'today' ? '天气、场合、单品、色彩和“会不会再穿”。' : '保存真正有用的参考，并写下为什么。'}</p></div><button class="btn-main" onclick="editStyle('', '${type}')">＋ Add</button></div>${v5List(shown, x => `<div class="v5-list-row"><div><h3>${v5Title(x.title)}</h3><p>${v5Title(x.date)} · ${v5Title(x.occasion)} · ${v5Title(x.keywords)}<br>${v5Title(x.pieces || x.notes)}</p></div><button onclick="editStyle('${x.id}')">编辑 · Edit</button></div>`, '还没有保存这一类风格记录。')}`; }
    function editCapture(id = '') { const rows = v5Rows('inbox'), old = rows.find(x => x.id === id) || {}; openEditDialog({ title: 'Inbox item', fields: [{ name: 'type', label: '类型 · Type', value: old.type || 'Note' }, { name: 'text', label: '内容 · Content', type: 'textarea', value: old.text || '' }, { name: 'url', label: '链接 · Link', value: old.url || '' }, { name: 'status', label: '状态 · Status', type: 'select', value: old.status || 'inbox', options: ['inbox', 'processed', 'archived'].map(value => ({ value, label: value })) }], onSave: v => { if (!v.text.trim())
            return false; const item = { ...old, ...v, id: id || uid('capture'), createdAt: old.createdAt || nowDateTime() }; state.inbox = id ? rows.map(x => x.id === id ? item : x) : [item, ...rows]; v5Save(); }, onDelete: id ? () => v5Delete('inbox', id) : null }); }
    function openCapture() { const d = $('captureDialog'); $('captureText').value = ''; $('captureUrl').value = ''; d.showModal(); setTimeout(() => $('captureText').focus(), 50); }
    function saveCaptureFromDialog(e) { e?.preventDefault(); const text = $('captureText').value.trim(); if (!text)
        return; v5Rows('inbox').unshift({ id: uid('capture'), type: $('captureType').value, text, url: $('captureUrl').value.trim(), status: 'inbox', createdAt: nowDateTime() }); saveState(); $('captureDialog').close(); renderV5Home(); }
    function renderV5Home() { const root = $('v5Home'); if (!root)
        return; ensureV5State(); const tasks = state.tasks.filter(taskOpen).filter(t => t.status === 'active' || t.todayBucket || t.dueDate === todayStr()).slice(0, 3); const blocks = combinedScheduleBlocks(todayStr()); const week = v5Rows('planItems').filter(x => x.scope === 'week' && x.status !== 'done').slice(0, 3); const reminders = [...v5Rows('inbox').filter(x => x.status === 'inbox').slice(0, 2).map(x => x.text), ...inventoryRows().filter(x => Number(x.quantity) <= Number(x.threshold)).slice(0, 2).map(x => '补货：' + x.title)].slice(0, 4); root.innerHTML = `<div class="home-greeting"><p class="eyebrow">${v5Title(v5DateLabel())}</p><h1>${new Date().getHours() < 12 ? '早上好' : '欢迎回来'}，今天只先看最重要的事。</h1><p>What matters today?</p></div><div class="home-layout"><div><section class="quiet-section"><div class="quiet-section-title"><h2>今天 · Today</h2><button onclick="navTo('plan-section')">打开计划 →</button></div><ol class="priority-list">${tasks.length ? tasks.map((x, i) => `<li class="priority-item"><span class="priority-index">0${i + 1}</span><div><strong>${v5Title(x.title)}</strong><small>${v5Title(projectById(x.projectId)?.title || x.context || 'Today')}${x.estimate ? ` · ${x.estimate} min` : ''}${x.dueDate ? ` · ${v5Title(x.dueDate)}` : ''}</small></div><button onclick="openWorkflowTaskEditor('${x.id}')">Edit</button></li>`).join('') : `<li class="priority-item"><span class="priority-index">01</span><div><strong>选择今天第一件真正重要的事</strong><small>最多放 3 项，其他内容留在 Plan。</small></div><button onclick="navTo('workflow-section')">＋ Add</button></li>`}</ol></section><section class="quiet-section"><div class="quiet-section-title"><h2>今日日程 · Today’s Schedule</h2>${appleCalendarControls()}</div>${blocks.length ? `<div class="timeline-list">${blocks.map(x => `<div class="timeline-item"><time>${v5Title(x.start)}</time><div><strong>${v5Title(x.title)}</strong><small>${v5Title(scheduleWhen(x))}</small></div></div>`).join('')}</div>` : v5Empty('还没有时间块；需要时再安排，不必先填满整天。')}</section><section class="quiet-section"><div class="quiet-section-title"><h2>本周 · This Week</h2><button onclick="renderPlan('week');navTo('plan-section')">规划本周 →</button></div><ul class="quiet-list">${week.length ? week.map(x => `<li><strong>${v5Title(x.title)}</strong><span>${v5Title(x.area)}</span></li>`).join('') : '<li><strong>尚未设定 3 个 Must-win</strong><span>Week</span></li>'}</ul></section></div><aside><section class="quiet-section"><div class="quiet-section-title"><h2>别忘了 · Don’t Forget</h2><button onclick="showInbox()">Inbox ${v5Rows('inbox').filter(x => x.status === 'inbox').length}</button></div><ul class="quiet-list">${reminders.length ? reminders.map(x => `<li><span>${v5Title(x)}</span></li>`).join('') : '<li><span>目前没有紧急提醒。</span></li>'}</ul></section><section class="quiet-section"><div class="quiet-section-title"><h2>快速进入 · Quick Access</h2></div><div class="quick-grid">${[['项目', 'Projects', 'workflow-section'], ['大学', 'University', 'university-section'], ['申请', 'Applications', 'applications-section'], ['知识', 'Knowledge', 'study-section'], ['健康', 'Health', 'habit-section'], ['厨房', 'Kitchen', 'recipe-section'], ['风格', 'Style', 'style-section'], ['复盘', 'Review', 'review-section']].map(x => `<button class="quick-link" onclick="navTo('${x[2]}')">${x[0]}<span>${x[1]}</span></button>`).join('')}</div></section></aside></div>`; }
    function showInbox() { const rows = v5Rows('inbox').filter(x => x.status !== 'archived'); openEditDialog({ title: `Inbox · ${rows.length} items`, desc: '逐条处理、归类或归档。Weekly Review 会提醒你清理这里。', fields: [], onSave: () => { closeEditDialog(); } }); $('editDialogBody').innerHTML = rows.length ? `<div class="v5-list">${rows.map(x => `<div class="v5-list-row"><div><h3>${v5Title(x.text)}</h3><p>${v5Title(x.type)} · ${v5Title(x.createdAt)}</p></div><button onclick="closeEditDialog();editCapture('${x.id}')">Edit</button></div>`).join('')}</div>` : v5Empty('Inbox is clear.'); }
    function globalSearchData() { const items = []; const add = (type, rows, title, body, route, edit) => rows.forEach(x => items.push({ type, title: title(x), body: body(x), route, edit: edit?.(x) })); add('Task', state.tasks, x => x.title, x => x.note || x.context, 'workflow-section', x => `openWorkflowTaskEditor('${x.id}')`); add('Project', state.projects, x => x.title, x => x.outcome || '', 'workflow-section'); add('Knowledge', studyAreas(), x => x.name, x => x.now + ' ' + x.entry, 'study-section', x => `editStudyArea('${x.id}')`); add('Book', books(), x => x.title, x => x.author + ' ' + x.why, 'study-section', x => `editBook('${x.id}')`); add('Application', v5Rows('applications'), x => x.university + ' ' + x.programme, x => x.next + ' ' + x.waiting, 'applications-section', x => `editApplication('${x.id}')`); add('SOP', routineRows(), x => x.title, x => x.notes, 'homebase-section', x => `editRoutine('${x.id}')`); add('Recipe', recipeRows(), x => x.name, x => x.ingredients + ' ' + x.notes, 'recipe-section', x => `editRecipe('${x.id}')`); add('Travel', state.trips || [], x => x.title || x.place, x => x.summary || x.judgement || '', 'studio-section'); add('Portfolio', state.portfolio || [], x => x.title, x => x.summary || x.judgement || '', 'studio-section'); add('Journal', state.journal || [], x => x.title, x => x.summary || x.judgement || '', 'studio-section'); add('Inbox', v5Rows('inbox'), x => x.text, x => x.type, 'home-section', x => `editCapture('${x.id}')`); return items; }
    function openGlobalSearch() { const d = $('searchDialog'); $('globalSearchInput').value = ''; $('globalSearchResults').innerHTML = v5Empty('输入一个词，搜索整个 Becoming。'); d.showModal(); setTimeout(() => $('globalSearchInput').focus(), 50); }
    function renderGlobalSearch() { const q = $('globalSearchInput').value.trim().toLowerCase(), root = $('globalSearchResults'); if (!q) {
        root.innerHTML = v5Empty('输入一个词，搜索整个 Becoming。');
        return;
    } const rows = globalSearchData().filter(x => (x.title + ' ' + x.body + ' ' + x.type).toLowerCase().includes(q)).slice(0, 40); root.innerHTML = rows.length ? rows.map(x => `<button class="search-result" onclick="$(${JSON.stringify('searchDialog')}).close();navTo('${x.route}');${x.edit || ''}"><small>${v5Title(x.type)}</small><strong>${v5Title(x.title)}</strong><span>${v5Title(x.body)}</span></button>`).join('') : v5Empty('没有匹配结果。'); }
    const V5_GROUPS = {
        HOME: [['今日 · Today', 'home-section'], ['每日简报 · Briefing', 'information-section']],
        PLAN: [['计划 · Plan', 'plan-section'], ['项目 · Projects', 'workflow-section'], ['SOP Library', 'homebase-section']],
        UNIVERSITY: [['大学总览 · Hub', 'university-section'], ['论文 · Dissertation', 'thesis-section'], ['PAT / Admin', 'mentor-section']],
        APPLICATIONS: [['申请 · Applications', 'applications-section'], ['投稿 · Submissions', 'submission-section'], ['兼职 · Opportunities', 'opportunity-section']],
        KNOWLEDGE: [['知识系统 · My Knowledge', 'study-section'], ['英语 · English', 'english-section']],
        LIFE: [['生活系统 · My System', 'homebase-section'], ['健康 · Health', 'habit-section'], ['厨房 · Kitchen', 'recipe-section'], ['风格 · Style', 'style-section'], ['旅行 · Travel', 'studio-section', 'travel'], ['生活事务 · Life Admin', 'life-section']],
        MONEY: [['金钱 · Money', 'money-section']],
        REVIEW: [['复盘 · Review', 'review-section'], ['心灵关怀 · Care', 'care-section'], ['成就 · Achievements', 'achievement-section'], ['趋势 · Analytics', 'dashboard-section']],
        ARCHIVE: [['作品 · Portfolio', 'studio-section', 'portfolio'], ['日记 · Journal', 'studio-section', 'journal'], ['数据设置 · Settings', 'settings-section']]
    };
    function groupForSection(id) { for (const [group, items] of Object.entries(V5_GROUPS))
        if (items.some(x => x[1] === id))
            return group; return 'HOME'; }
    function renderSystemSubnav(id) { const group = groupForSection(id), bar = $('systemSubnav'); document.querySelectorAll('#globalTopNav [data-group]').forEach(b => { const active = b.dataset.group === group; b.classList.toggle('active', active); if (active) b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }); if (!bar)
        return; bar.innerHTML = V5_GROUPS[group].map(x => `<button class="${x[1] === id ? 'active' : ''}" onclick="navTo('${x[1]}');${x[2] ? `setStudioTab('${x[2]}')` : ''}">${x[0]}</button>`).join(''); document.querySelectorAll('#sidebar .nav-btn').forEach(b => b.classList.toggle('active', b.dataset.group === group)); }
    function renderV5Current() { if (currentSection === 'plan-section')
        renderPlan(); if (currentSection === 'university-section')
        renderUniversity(); if (currentSection === 'applications-section')
        renderApplications(); if (currentSection === 'style-section')
        renderStyle(); if (currentSection === 'money-section')
        renderMoney(); }
    function rebuildSidebar() { const nav = $('sidebar').querySelector('nav'); const labels = [['HOME', '首页 Home', '⌂', 'home-section'], ['PLAN', '计划 Plan', '◷', 'plan-section'], ['UNIVERSITY', '大学 University', 'U', 'university-section'], ['APPLICATIONS', '申请 Applications', '↗', 'applications-section'], ['KNOWLEDGE', '我的知识 My Knowledge', 'K', 'study-section'], ['LIFE', '生活 Life', 'L', 'life-section'], ['MONEY', '金钱 Money', '£', 'money-section'], ['REVIEW', '复盘 Review', 'R', 'review-section'], ['ARCHIVE', '档案 Archive', 'A', 'studio-section']]; nav.innerHTML = labels.map((x, i) => `<button class="nav-btn ${i === 0 ? 'active' : ''}" data-group="${x[0]}" data-target="${x[3]}"><span class="nav-glyph" aria-hidden="true">${x[2]}</span><span>${x[1]}</span></button>`).join(''); nav.querySelectorAll('.nav-btn').forEach(button => { button.onclick = () => navTo(button.dataset.target); }); }
    function prepareUtility() { const bar = $('cloudBar'); bar.innerHTML += `<button id="v5UtilityButton" aria-label="更多与设置" aria-expanded="false">•••</button><div id="v5UtilityMenu" hidden><div id="v5SyncStatus">${v5Title($('cloudMessage')?.textContent || 'Syncing…')}</div><button onclick="openGlobalSearch();$('v5UtilityMenu').hidden=true">搜索 · Search</button><button onclick="showInbox();$('v5UtilityMenu').hidden=true">Inbox</button><button onclick="exportJson()">导出备份 · Export</button><button onclick="navTo('settings-section');$('v5UtilityMenu').hidden=true">数据设置 · Settings</button><button onclick="location.reload()">重新加载 · Reload</button></div>`; const btn = $('v5UtilityButton'), menu = $('v5UtilityMenu'); btn.onclick = () => { menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', String(!menu.hidden)); }; }
    function collapseLegacyBuilders() { document.querySelectorAll('#workflow-section .small-stat').forEach(el => { if (/新建项目|新建任务/.test(el.textContent || '')) {
        const d = document.createElement('details');
        d.className = 'legacy-builder';
        const s = document.createElement('summary');
        s.textContent = /新建项目/.test(el.textContent) ? '＋ 新建项目 · New Project' : '＋ 新建任务 · New Task';
        const body = document.createElement('div');
        body.className = 'legacy-builder-body';
        el.parentNode.insertBefore(d, el);
        body.appendChild(el);
        d.append(s, body);
    } }); }
    function bilingualiseHeadings() { const map = { '项目看板': '项目 · Projects', '本科毕业论文进度': '本科论文 · Dissertation', '投稿管理': '投稿 · Submissions', '健康管理': '健康 · Health', '心灵关怀': '心灵关怀 · Care', '导师与 PAT 沟通': '导师与 PAT · Supervision', '每日复盘': '每日复盘 · Daily Review', '成就殿堂': '成就 · Achievements', '数据看板': '趋势 · Analytics', '数据看板设置 / 数据管理': '数据设置 · Data Settings', '生活与本科事务': '生活事务 · Life Admin', '作品与生活档案': '个人档案 · Personal Archive', 'My System': '个人系统 · My System', '菜谱索引': '厨房 · Kitchen', '英语学习打卡': '英语 · English', 'Study System': '我的知识 · My Knowledge', 'Daily Briefing Desk': '每日简报 · Daily Briefing' }; document.querySelectorAll('main h1').forEach(h => { const k = h.textContent.trim(); if (map[k])
        h.textContent = map[k]; }); }
    function prepareV5UI() { ensureV5State(); ensureAppleCalendarState(); $('appleCalendarFile').onchange = event => importAppleCalendarFiles(event.target.files); rebuildSidebar(); prepareUtility(); bilingualiseHeadings(); const main = document.querySelector('main'); const sub = document.createElement('div'); sub.id = 'systemSubnav'; sub.className = 'system-subnav'; main.prepend(sub); const home = $('home-section'); const v = document.createElement('div'); v.id = 'v5Home'; home.prepend(v); const fab = document.createElement('button'); fab.className = 'capture-fab'; fab.textContent = '＋ 收集 · Capture'; fab.onclick = openCapture; document.body.appendChild(fab); document.querySelectorAll('[data-plan-tab]').forEach(b => b.onclick = () => renderPlan(b.dataset.planTab)); document.querySelectorAll('[data-university-tab]').forEach(b => b.onclick = () => renderUniversity(b.dataset.universityTab)); document.querySelectorAll('[data-university-route]').forEach(b => b.onclick = () => navTo(b.dataset.universityRoute)); document.querySelectorAll('[data-application-tab]').forEach(b => b.onclick = () => renderApplications(b.dataset.applicationTab)); document.querySelectorAll('[data-application-route]').forEach(b => b.onclick = () => navTo(b.dataset.applicationRoute)); document.querySelectorAll('[data-style-tab]').forEach(b => b.onclick = () => renderStyle(b.dataset.styleTab)); document.querySelectorAll('[data-money-tab]').forEach(b => b.onclick = () => renderMoney(b.dataset.moneyTab)); $('saveCapture').onclick = saveCaptureFromDialog; $('globalSearchInput').oninput = renderGlobalSearch; collapseLegacyBuilders(); renderV5Home(); renderSystemSubnav('home-section'); }
    const v4Nav = navTo;
    navTo = function (id) { v4Nav(id); renderSystemSubnav(id); renderV5Current(); if (id === 'home-section')
        renderV5Home(); };

    bindEvents();
    loadPrefs();
    renderAll();
    renderLife();
    renderStudio();
    renderHomebase();
    renderRecipes();
    renderEnglish();
    renderLearningBridge();
    prepareV4UI();
    prepareV5UI();
    updateClock();
    setInterval(updateClock, 1000);

/* ---- preserved execution layer ---- */

(function () {
  const status = document.getElementById('cloudMessage');
  if (status) status.textContent = '离线版 · 已自动保存到此设备';
  const reload = document.getElementById('reloadWorkspace');
  if (reload) {
    reload.textContent = '重新载入';
    reload.onclick = function () { location.reload(); };
  }
  const exportButton = document.getElementById('exportUnsaved');
  if (exportButton) {
    exportButton.textContent = '下载 JSON 备份';
    exportButton.onclick = function () {
      if (typeof exportJson === 'function') exportJson();
    };
  }
  const retry = document.getElementById('retrySave');
  if (retry) retry.hidden = true;
  const relogin = document.getElementById('relogin');
  if (relogin) relogin.remove();
  document.querySelectorAll('[data-offline-learning-link="true"]').forEach(function (link) {
    link.href = '#';
    link.onclick = function (event) {
      event.preventDefault();
      if (typeof navTo === 'function') navTo('study-section');
    };
  });
})();

/* V10: user-managed project categories. */
(function(){
  function projectCategoryRows(){
    state.v5Meta=state.v5Meta&&typeof state.v5Meta==='object'?state.v5Meta:{};
    const saved=Array.isArray(state.v5Meta.projectCategories)?state.v5Meta.projectCategories:[];
    const combined=[{value:'writing',label:'写作 / 论文'},...saved];
    const seen=new Set(),rows=combined.filter(x=>x&&x.value&&!seen.has(x.value)&&seen.add(x.value)).map(x=>({value:String(x.value),label:String(x.label||x.value)}));
    state.v5Meta.projectCategories=rows;
    PROJECT_AREAS.splice(0,PROJECT_AREAS.length,...rows);
    const allowed=new Set(rows.map(x=>x.value));state.projects.forEach(p=>{if(!allowed.has(p.area))p.area='writing';});
    return rows;
  }
  function saveProjectCategories(){state.v5Meta.projectCategories=PROJECT_AREAS.map(x=>({...x}));saveState();}
  function refreshProjectCategorySelect(){const select=document.getElementById('workflowProjectArea');if(!select)return;const current=select.value;select.innerHTML=PROJECT_AREAS.map(x=>`<option value="${v5Title(x.value)}">${v5Title(x.label)}</option>`).join('');select.value=PROJECT_AREAS.some(x=>x.value===current)?current:PROJECT_AREAS[0]?.value||'writing';}
  function managerDialog(){let d=document.getElementById('v10ProjectCategoryDialog');if(!d){d=document.createElement('dialog');d.id='v10ProjectCategoryDialog';d.className='v8-dialog';document.body.appendChild(d)}return d;}
  window.openProjectCategoryManager=function(){projectCategoryRows();const d=managerDialog();d.innerHTML=`<div class="v8-dialog-inner"><h2>项目分类 · Categories</h2><p>分类由你自己管理。重命名不会影响项目、任务、日志或截止日期。</p><div class="v8-dialog-list">${PROJECT_AREAS.map((x,i)=>`<div class="v8-dialog-row"><strong>${v5Title(x.label)}</strong><span><button type="button" onclick="renameProjectCategory(${i})">重命名</button>${PROJECT_AREAS.length>1?` <button type="button" onclick="deleteProjectCategory(${i})">删除</button>`:''}</span></div>`).join('')}</div><div class="v8-dialog-actions"><button type="button" onclick="this.closest('dialog').close()">关闭</button><button type="button" class="primary" onclick="addProjectCategory()">＋ 新增分类</button></div></div>`;if(!d.open)d.showModal();};
  window.addProjectCategory=function(){const label=prompt('新分类名称，例如：申请文书、课程论文、个人项目');if(!label?.trim())return;const clean=label.trim();if(PROJECT_AREAS.some(x=>x.label.toLowerCase()===clean.toLowerCase()))return alert('这个分类已经存在。');PROJECT_AREAS.push({value:'category_'+Date.now().toString(36),label:clean});saveProjectCategories();refreshProjectCategorySelect();openProjectCategoryManager();renderWorkflow();};
  window.renameProjectCategory=function(index){const item=PROJECT_AREAS[index];if(!item)return;const label=prompt('修改分类名称',item.label);if(!label?.trim())return;item.label=label.trim();saveProjectCategories();refreshProjectCategorySelect();openProjectCategoryManager();renderWorkflow();};
  window.deleteProjectCategory=function(index){const item=PROJECT_AREAS[index];if(!item||PROJECT_AREAS.length<=1)return;const fallback=PROJECT_AREAS.find((_,i)=>i!==index);const count=state.projects.filter(p=>p.area===item.value).length;if(!confirm(count?`“${item.label}”下有 ${count} 个项目。删除分类后，这些项目会移动到“${fallback.label}”，继续吗？`:`删除空分类“${item.label}”吗？`))return;state.projects.forEach(p=>{if(p.area===item.value)p.area=fallback.value});PROJECT_AREAS.splice(index,1);saveProjectCategories();refreshProjectCategorySelect();openProjectCategoryManager();renderWorkflow();};
  function mountManagerButton(){const badge=document.getElementById('workflowProjectBadge');if(!badge||document.getElementById('v10CategoryButton'))return;badge.insertAdjacentHTML('afterend','<button id="v10CategoryButton" type="button" class="secondary-action" onclick="openProjectCategoryManager()">管理分类</button>');}
  projectCategoryRows();refreshProjectCategorySelect();
  const priorWorkflow=renderWorkflow;
  renderWorkflow=function(){projectCategoryRows();priorWorkflow();refreshProjectCategorySelect();mountManagerButton();};
  renderWorkflow();
})();

/* ---- preserved execution layer ---- */

/* V6 execution upgrades: visible focus timer, period routines, and draggable quadrant board. */
(function () {
  const legacyRenderPlan = renderPlan;
  const legacyRenderWorkflow = renderWorkflow;

  function focusElapsedMs(active) {
    if (!active) return 0;
    const end = active.paused ? Number(active.pausedAtTs || Date.now()) : Date.now();
    return Math.max(0, end - Number(active.startedAtTs || end) - Number(active.pausedTotalMs || 0));
  }
  function focusClockText(seconds) {
    seconds = Math.max(0, Math.ceil(Number(seconds) || 0));
    const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
    return h ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }
  function planFocusMarkup() {
    const active = state.focus.active;
    const open = state.tasks.filter(taskOpen);
    const taskOptions = open.map(task => `<option value="${task.id}">${v5Title(projectById(task.projectId)?.title ? projectById(task.projectId).title + ' / ' + task.title : task.title)}</option>`).join('');
    return `<section class="v6-focus-panel" aria-label="专注计时器">
      <div class="v6-focus-head"><div><h2>专注 · Focus</h2><p>选一个任务和时长，倒计时结束后自动记录专注分钟。</p></div><span id="planFocusStatus" class="v6-focus-status">${active ? (active.paused ? '已暂停' : '专注中') : '准备开始'}</span></div>
      <div class="v6-focus-body"><div id="planFocusClock" class="v6-focus-clock">25:00<small>${active ? v5Title(active.title) : 'FOCUS TIMER'}</small></div>
      <div><div class="v6-focus-form">
        <select id="planFocusTask" ${active ? 'disabled' : ''} onchange="syncPlanFocusTitle(this.value)"><option value="">不关联任务</option>${taskOptions}</select>
        <input id="planFocusTitle" ${active ? 'disabled' : ''} placeholder="本次专注主题" value="${active ? v5Title(active.title) : ''}">
        <select id="planFocusDuration" ${active ? 'disabled' : ''} onchange="renderFocusTimer()"><option value="25">25 分钟</option><option value="45">45 分钟</option><option value="60">60 分钟</option><option value="90">90 分钟</option></select>
      </div><div class="v6-focus-actions">
        ${active ? `<button type="button" onclick="togglePlanFocusPause()">${active.paused ? '继续' : '暂停'}</button><button type="button" class="finish" onclick="completePlanFocus(false)">结束并记录</button><button type="button" class="cancel" onclick="cancelPlanFocus()">取消本次</button>` : '<button type="button" class="start" onclick="startPlanFocus()">开始专注</button>'}
      </div></div></div></section>`;
  }
  window.syncPlanFocusTitle = function (taskId) { const task=state.tasks.find(item=>item.id===taskId), input=$('planFocusTitle'); if (task && input && !input.value.trim()) input.value=task.title; };
  window.startPlanFocus = function () {
    if (state.focus.active) return alert('已经有一段专注正在进行。');
    const taskId = $('planFocusTask')?.value || '';
    const task = state.tasks.find(item => item.id === taskId);
    const title = $('planFocusTitle')?.value.trim() || task?.title || '未命名专注';
    const durationMin = Math.max(1, Number($('planFocusDuration')?.value || 25));
    state.focus.active = { id:uid('focus'), title, category:'focus', note:'计划页倒计时', date:todayStr(), start:nowTime(), startedAtTs:Date.now(), paused:false, pausedAtTs:0, pausedTotalMs:0, durationMin, taskId:taskId || null };
    if (task && task.status !== 'done') { task.status = 'active'; task.startedAt = task.startedAt || nowDateTime(); }
    saveState(); renderAll(); renderPlan('day'); startFocusTicker();
  };
  window.togglePlanFocusPause = function () {
    const active = state.focus.active; if (!active) return;
    if (active.paused) { active.pausedTotalMs = Number(active.pausedTotalMs || 0) + Math.max(0, Date.now() - Number(active.pausedAtTs || Date.now())); active.paused = false; active.pausedAtTs = 0; }
    else { active.paused = true; active.pausedAtTs = Date.now(); }
    saveState(); renderPlan('day'); renderFocusTimer();
  };
  window.completePlanFocus = function (automatic) {
    const active = state.focus.active; if (!active) return;
    const elapsed = focusElapsedMs(active);
    const minutes = Math.max(1, Math.round(elapsed / 60000));
    recordFocusRun({ id:active.id, date:active.date || todayStr(), title:active.title, category:active.category || 'focus', note:active.note || '', start:active.start || nowTime(), end:nowTime(), minutes, taskId:active.taskId || '' });
    const task = state.tasks.find(item => item.id === active.taskId); if (task && task.status === 'active') task.status = 'todo';
    state.focus.active = null; saveState(); stopFocusTicker(); renderAll(); if (currentSection === 'plan-section') renderPlan('day');
    if (automatic) alert('这一段专注完成了，已经记录到今日专注。');
  };
  window.cancelPlanFocus = function () {
    const active = state.focus.active; if (!active) return;
    const task = state.tasks.find(item => item.id === active.taskId); if (task && task.status === 'active') task.status = 'todo';
    state.focus.active = null; saveState(); stopFocusTicker(); renderAll(); if (currentSection === 'plan-section') renderPlan('day');
  };
  renderFocusTimer = function () {
    const active = state.focus.active;
    const legacyClock = $('focusClock'), legacyStatus = $('focusStatusPill'), clock = $('planFocusClock'), status = $('planFocusStatus');
    if (!active) { if (legacyClock) legacyClock.textContent = '00:00:00'; if (legacyStatus) legacyStatus.textContent = '未开始'; if (clock) { const duration = Number($('planFocusDuration')?.value || 25); clock.childNodes[0].nodeValue = focusClockText(duration * 60); } if (status) { status.textContent = '准备开始'; status.className = 'v6-focus-status'; } return; }
    const elapsedMs = focusElapsedMs(active), durationMs = Number(active.durationMin || 0) * 60000;
    const shownSeconds = durationMs ? Math.max(0, (durationMs - elapsedMs) / 1000) : elapsedMs / 1000;
    const shown = focusClockText(shownSeconds);
    if (legacyClock) legacyClock.textContent = durationMs ? shown : focusClockText(elapsedMs / 1000);
    if (legacyStatus) legacyStatus.textContent = active.paused ? '已暂停' : '进行中';
    if (clock) clock.childNodes[0].nodeValue = shown;
    if (status) { status.textContent = active.paused ? '已暂停' : '专注中'; status.className = 'v6-focus-status ' + (active.paused ? 'paused' : 'running'); }
    if (durationMs && elapsedMs >= durationMs && !active.paused && !active.completing) { active.completing = true; completePlanFocus(true); }
  };

  window.editPlanRoutine = function (cadence, id = '') {
    const rows = routineRows(), old = rows.find(item => item.id === id) || {};
    const isWeek = cadence === 'weekly';
    openEditDialog({ title:isWeek ? '周末 / 每周 Routine' : '月底 / 每月 Routine', fields:[
      { name:'title', label:'要做的事情', value:old.title || '' },
      { name:'when', label:isWeek ? '星期 / 周末时间' : '月底时间', value:old.when || (isWeek ? '周末' : '月底') },
      { name:'area', label:'领域', value:old.area || 'Life' },
      { name:'minutes', label:'预计分钟', type:'number', value:old.minutes || '' },
      { name:'notes', label:'完成标准 / 备注', type:'textarea', value:old.notes || '' },
      { name:'active', label:'状态', type:'select', value:String(old.active !== false), options:[{value:'true',label:'启用'},{value:'false',label:'停用'}] }
    ], onSave:values => { if (!values.title.trim()) return false; const item={...old,...values,id:id||uid('routine'),cadence,active:values.active==='true'}; state.routines=id?rows.map(row=>row.id===id?item:row):[...rows,item]; saveState(); renderPlan(isWeek?'week':'month'); }, onDelete:id?()=>{ state.routines=rows.filter(row=>row.id!==id); saveState(); renderPlan(isWeek?'week':'month'); }:null });
  };
  window.routineToPeriod = function (id, scope) {
    const routine = routineRows().find(item => item.id === id); if (!routine) return;
    const periodKey = scope === 'week' ? startOfWeek(todayStr()) : startOfMonth(todayStr());
    const exists = v5Rows('planItems').some(item => item.routineId === id && item.scope === scope && item.periodKey === periodKey);
    if (exists) return alert(scope === 'week' ? '这项已经放进本周计划。' : '这项已经放进本月计划。');
    state.planItems.unshift({ id:uid('plan'), scope, title:routine.title, area:routine.area || 'Life', date:periodKey, status:'active', notes:routine.notes || '', routineId:id, periodKey });
    saveState(); renderPlan(scope);
  };
  function periodRoutineMarkup(tab) {
    const cadence = tab === 'week' ? 'weekly' : 'monthly', title = tab === 'week' ? 'Weekly Routine · 周末与每周' : 'Monthly Routine · 月底', addLabel = tab === 'week' ? '＋ This Week' : '＋ This Month';
    const rows = routineRows().filter(item => item.active !== false && item.cadence === cadence);
    return `<aside class="v6-routine-panel"><div class="section-head"><div><h2>${title}</h2><p>${tab === 'week' ? '把周末固定要做的事情放在这里。' : '把月底复盘、对账和整理放在这里。'}</p></div><button onclick="editPlanRoutine('${cadence}')">＋ Add</button></div>${v5List(rows,item=>`<div class="v5-list-row"><div><h3>${v5Title(item.title)}</h3><p>${v5Title(item.when || '')}${item.minutes ? ` · ${v5Title(item.minutes)} min` : ''}<br>${v5Title(item.notes || '')}</p></div><div class="v6-routine-actions"><button onclick="routineToPeriod('${item.id}','${tab}')">${addLabel}</button><button onclick="editPlanRoutine('${cadence}','${item.id}')">编辑</button></div></div>`, '还没有这一周期的 Routine；点击 Add 自己建立。')}</aside>`;
  }
  renderPlan = function (tab = state.v5Meta.planTab || 'day') {
    legacyRenderPlan(tab);
    const root = $('planContent'); if (!root) return;
    if (tab === 'day') { root.insertAdjacentHTML('afterbegin', planFocusMarkup()); renderFocusTimer(); }
    if (tab === 'week' || tab === 'month') { const current = root.innerHTML; root.innerHTML = `<div class="v6-period-layout"><div>${current}</div>${periodRoutineMarkup(tab)}</div>`; }
  };

  let quadrantProjectFilter = '';
  function ensureQuadrantHost() {
    let board = $('quadrantBoardV6'); if (board) return board;
    const details = $('workflowTaskTableDetails'), host = details?.parentElement; if (!host) return null;
    [...host.children].forEach(child => child.hidden = true);
    board = document.createElement('div'); board.id = 'quadrantBoardV6'; board.className = 'v6-quadrant-wrap'; board.hidden = false; host.appendChild(board); return board;
  }
  window.addQuadrantTask = function (quadrant) {
    openEditDialog({ title:'添加四象限任务', desc:taskQuadrantMeta(quadrant).label, fields:[
      {name:'title',label:'任务内容',value:''},
      {name:'projectId',label:'所属项目',type:'select',value:quadrantProjectFilter||'',options:[{value:'',label:'未关联项目'},...state.projects.map(p=>({value:p.id,label:p.title}))]},
      {name:'dueDate',label:'截止日期',type:'date',value:''},
      {name:'estimate',label:'预计分钟',type:'number',value:'25'},
      {name:'note',label:'备注',type:'textarea',value:''}
    ], onSave:values => { if (!values.title.trim()) return false; state.tasks.unshift(normalizeTaskItem({...values,id:uid('task'),status:'todo',gtdBucket:values.projectId?'next':'inbox',quadrant,todayBucket:'',createdAt:nowDateTime()})); saveState(); renderAll(); } });
  };
  window.moveQuadrantTask = function (id, quadrant, beforeId = '') {
    const index = state.tasks.findIndex(item => item.id === id); if (index < 0) return;
    const [task] = state.tasks.splice(index,1); task.quadrant = taskQuadrantMeta(quadrant).value;
    if (beforeId && beforeId !== id) { const beforeIndex = state.tasks.findIndex(item => item.id === beforeId); state.tasks.splice(beforeIndex < 0 ? state.tasks.length : beforeIndex,0,task); }
    else state.tasks.push(task);
    saveState(); renderAll();
  };
  window.setQuadrantProjectFilter = function (value) { quadrantProjectFilter = value || ''; renderQuadrantBoard(); };
  function bindQuadrantDrag(board) {
    board.querySelectorAll('.v6-q-task').forEach(card => {
      card.ondragstart = event => { card.classList.add('dragging'); event.dataTransfer.effectAllowed='move'; event.dataTransfer.setData('text/plain',card.dataset.taskId); };
      card.ondragend = () => { card.classList.remove('dragging'); board.querySelectorAll('.v6-quadrant').forEach(col=>col.classList.remove('drag-over')); };
    });
    board.querySelectorAll('.v6-quadrant').forEach(column => {
      column.ondragover = event => { event.preventDefault(); event.dataTransfer.dropEffect='move'; column.classList.add('drag-over'); };
      column.ondragleave = event => { if (!column.contains(event.relatedTarget)) column.classList.remove('drag-over'); };
      column.ondrop = event => { event.preventDefault(); const id=event.dataTransfer.getData('text/plain'), before=event.target.closest('.v6-q-task')?.dataset.taskId||''; column.classList.remove('drag-over'); moveQuadrantTask(id,column.dataset.quadrant,before); };
    });
  }
  function renderQuadrantBoard() {
    const board = ensureQuadrantHost(); if (!board) return;
    const tasks = state.tasks.filter(taskOpen).filter(task => !window.isLegacyRoutineTask?.(task)).filter(task => !quadrantProjectFilter || task.projectId === quadrantProjectFilter);
    const projectOptions = state.projects.map(project=>`<option value="${project.id}" ${project.id===quadrantProjectFilter?'selected':''}>${v5Title(project.title)}</option>`).join('');
    board.innerHTML = `<div class="v6-quadrant-toolbar"><div><h2>任务四象限 · Eisenhower Matrix</h2><p>拖动任务卡可以跨象限或调整顺序；手机上使用卡片里的“移动到”。</p></div><select onchange="setQuadrantProjectFilter(this.value)"><option value="">全部项目</option>${projectOptions}</select></div><div class="v6-quadrant-grid">${QUADRANT_OPTIONS.map(meta=>{
      const rows=tasks.filter(task=>task.quadrant===meta.value);
      return `<section class="v6-quadrant" data-quadrant="${meta.value}"><header class="v6-quadrant-head"><div><h3>${meta.short} · ${meta.label}</h3><p>${meta.note} · ${rows.length} 项</p></div><button onclick="addQuadrantTask('${meta.value}')">＋ 添加</button></header><div class="v6-quadrant-body">${rows.length?rows.map(task=>{
        const project=projectById(task.projectId),status=taskStatusMeta(task.status);
        return `<article class="v6-q-task" draggable="true" data-task-id="${task.id}"><h4>${v5Title(task.title)}</h4><p>${v5Title(project?.title||'未关联项目')}${task.dueDate?` · 截止 ${v5Title(task.dueDate)}`:''} · ${v5Title(status.label)}</p><div class="v6-q-task-actions"><select aria-label="移动任务" onchange="moveQuadrantTask('${task.id}',this.value)">${QUADRANT_OPTIONS.map(q=>`<option value="${q.value}" ${q.value===task.quadrant?'selected':''}>移动到 ${q.short}</option>`).join('')}</select><button onclick="openTaskEditor('${task.id}')">编辑</button><button onclick="finishTask('${task.id}')">完成</button></div></article>`;
      }).join(''):'<div class="v6-q-empty">把任务拖到这里，或点击“添加”。</div>'}</div></section>`;
    }).join('')}</div>`;
    bindQuadrantDrag(board);
  }
  renderWorkflow = function () { legacyRenderWorkflow(); renderQuadrantBoard(); };

  renderWorkflow();
  if (currentSection === 'plan-section') renderPlan(state.v5Meta.planTab || 'day');
})();

/* V9: unified Today execution without merging unlike data types. */
(function(){
  function routineDoneMap(date=todayStr()){
    state.v5Meta=state.v5Meta&&typeof state.v5Meta==='object'?state.v5Meta:{};
    state.v5Meta.routineDoneByDate=state.v5Meta.routineDoneByDate&&typeof state.v5Meta.routineDoneByDate==='object'?state.v5Meta.routineDoneByDate:{};
    if(!state.v5Meta.routineDoneByDate[date])state.v5Meta.routineDoneByDate[date]={};
    return state.v5Meta.routineDoneByDate[date];
  }
  window.isLegacyRoutineTask=function(task){
    if(!task||!/^routine_/.test(String(task.id||'')))return false;
    return routineRows().some(r=>r&&r.title===task.title);
  };
  window.toggleTodayRoutine=function(id){const map=routineDoneMap(todayStr());map[id]=!map[id];saveState();renderPlan('day');renderV5Home();};
  window.toggleTodayHealth=function(id){
    const habit=(state.habits?.list||[]).find(h=>h.id===id);if(!habit)return;
    if(habit.mode!=='checkbox'){navTo('habit-section');return;}
    const map=getHabitEntryMap(todayStr()),entry=normalizeCheckboxEntry(map[id]);map[id]={...entry,done:!entry.done};saveState();renderPlan('day');renderV5Home();
  };
  function todayExecutionTasks(){const rows=state.tasks.filter(taskOpen).filter(t=>!window.isLegacyRoutineTask(t)).filter(t=>t.todayBucket||t.status==='active'||t.dueDate===todayStr());const rank={must:0,should:1,could:2,'':3};return rows.sort((a,b)=>(rank[a.todayBucket]??4)-(rank[b.todayBucket]??4)||(a.dueDate||'9999').localeCompare(b.dueDate||'9999'));}
  function executionTaskRows(){
    return todayExecutionTasks().map(t=>`<div class="v9-exec-row"><button type="button" aria-label="完成任务" onclick="finishTask('${t.id}')">✓</button><div><strong>${v5Title(t.title)}</strong><small>${v5Title(todayBucketMeta(t.todayBucket).short)}${projectById(t.projectId)?' · '+v5Title(projectById(t.projectId).title):''}</small></div><button type="button" class="v9-row-open" onclick="openWorkflowTaskEditor('${t.id}')">编辑</button></div>`).join('')||'<div class="v9-empty">还没有加入今天的项目任务。四象限里的任务不会全部自动压到今天。</div>';
  }
  function executionRoutineRows(){
    const done=routineDoneMap(todayStr()),rows=routineRows().filter(r=>r.active!==false&&r.cadence==='daily');
    return rows.map(r=>`<div class="v9-exec-row ${done[r.id]?'done':''}"><button type="button" aria-label="${done[r.id]?'取消完成':'完成 SOP'}" onclick="toggleTodayRoutine('${r.id}')">✓</button><div><strong>${v5Title(r.title)}</strong><small>${v5Title(r.when||'自行安排')}${r.minutes?' · '+v5Title(r.minutes)+' min':''}</small></div><button type="button" class="v9-row-open" onclick="editRoutine('${r.id}')">编辑</button></div>`).join('')||'<div class="v9-empty">还没有启用的每日 SOP。</div>';
  }
  function executionHealthRows(){
    const rows=(state.habits?.list||[]).filter(h=>h&&h.enabled!==false),date=todayStr();
    return rows.map(h=>{const done=habitDoneOnDate(h,date);return `<div class="v9-exec-row ${done?'done':''}"><button type="button" aria-label="${done?'已完成':'记录健康项目'}" onclick="toggleTodayHealth('${h.id}')">✓</button><div><strong>${v5Title(h.icon)} ${v5Title(h.name)}</strong><small>${done?'今日已完成':h.mode==='checkbox'?'点击即可完成':'进入健康页记录'}</small></div><button type="button" class="v9-row-open" onclick="navTo('habit-section')">详情</button></div>`}).join('')||'<div class="v9-empty">还没有启用的健康项目。</div>';
  }
  function executionMarkup(){
    const tasks=todayExecutionTasks(),routines=routineRows().filter(r=>r.active!==false&&r.cadence==='daily'),doneMap=routineDoneMap(todayStr()),habits=(state.habits?.list||[]).filter(h=>h&&h.enabled!==false),doneCount=routines.filter(r=>doneMap[r.id]).length+habits.filter(h=>habitDoneOnDate(h,todayStr())).length,total=tasks.length+routines.length+habits.length;
    return `<section class="v9-execution"><div class="v9-execution-head"><div><h2>今日执行 · Today</h2><p>任务、SOP、健康只在这里汇总，不互相复制，也不改变三个原页面。</p></div><span class="v9-execution-score">${doneCount}/${total} 已完成</span></div><div class="v9-execution-grid"><section class="v9-source"><header><strong>① 项目任务</strong><button type="button" onclick="navTo('workflow-section')">四象限 →</button></header><div class="v9-source-list">${executionTaskRows()}</div></section><section class="v9-source"><header><strong>② 今日 SOP</strong><button type="button" onclick="navTo('homebase-section')">SOP →</button></header><div class="v9-source-list">${executionRoutineRows()}</div></section><section class="v9-source"><header><strong>③ 健康底线</strong><button type="button" onclick="navTo('habit-section')">健康 →</button></header><div class="v9-source-list">${executionHealthRows()}</div></section></div><p class="v9-legacy-note">以前由“放入今天”生成的 SOP 任务仍保留在备份中，但不再重复显示在四象限和项目任务表。</p></section>`;
  }
  const priorPlan=renderPlan;
  renderPlan=function(tab=state.v5Meta.planTab||'day'){priorPlan(tab);if(tab==='day'){const root=document.getElementById('planContent');root?.insertAdjacentHTML('afterbegin',executionMarkup())}};
  if(currentSection==='plan-section')renderPlan('day');
})();

/* ---- preserved execution layer ---- */

/* V7 life routing and built-in outfit adviser. */
(function () {
  const previousLifeNav = navTo;
  navTo = function (id) {
    previousLifeNav(id);
    if (id === 'homebase-section') {
      const routineTab = document.querySelector('[data-home-tab="routine"]');
      if (routineTab && !routineTab.classList.contains('active')) routineTab.click();
    }
  };

  const previousRenderStyle = renderStyle;
  let outfitRefreshSeed = 0;
  let currentOutfitRecommendations = [];
  const OUTFIT_BASES = {
    cold:[
      {title:'干净保暖的长线条',pieces:'奶油色高领或细针织＋深色直筒裤＋中长羊毛大衣＋短靴',why:'上浅下深拉长比例，大衣的纵向线条让保暖穿搭不显臃肿。'},
      {title:'卫衣也能穿得利落',pieces:'灰色连帽卫衣＋挺括直筒牛仔裤＋短款羽绒服＋复古运动鞋',why:'外短内松、裤腿保持直线，舒服但不会像随手套上的居家服。'},
      {title:'柔和叠穿',pieces:'白色衬衫＋圆领毛衣露出领口和下摆＋烟管裤＋乐福鞋或短靴',why:'领口和下摆的小面积白色形成层次，适合室内外温差。'},
      {title:'深色同色系',pieces:'黑色打底＋炭灰阔腿裤＋深灰大衣＋黑色鞋包',why:'同色系减少切割感，用不同材质避免沉闷。'}
    ],
    cool:[
      {title:'校园里最稳的一套',pieces:'白色 T 恤或衬衫＋细针织开衫＋高腰直筒牛仔裤＋干净运动鞋',why:'上半身有层次、下半身线条简单，适合上课和图书馆。'},
      {title:'轻松但有轮廓',pieces:'薄卫衣＋卡其风衣＋黑色直筒裤＋德训鞋',why:'风衣负责轮廓，卫衣负责松弛感，颜色控制在三种以内。'},
      {title:'学院感叠穿',pieces:'浅蓝衬衫＋深色针织背心＋百褶中长裙或直筒裤＋乐福鞋',why:'衬衫和针织形成清晰层次，裙长或裤线维持利落比例。'},
      {title:'低饱和温柔配色',pieces:'燕麦色针织＋灰蓝直筒裤＋浅灰外套＋棕色鞋包',why:'冷暖中性色互相平衡，比全身米色更有层次。'}
    ],
    mild:[
      {title:'简洁的上课穿搭',pieces:'有质感的纯色 T 恤＋薄西装或开衫＋高腰阔腿裤＋小白鞋',why:'外层提供结构，阔腿裤保持垂坠，简单但不像基础款堆叠。'},
      {title:'衬衫作为轻外套',pieces:'背心或修身 T 恤＋宽松条纹衬衫敞穿＋直筒牛仔裤＋运动鞋',why:'内紧外松让比例更清楚，条纹增加视觉方向。'},
      {title:'轻法式日常',pieces:'方领上衣或合身针织＋高腰 A 字中长裙＋芭蕾鞋或乐福鞋',why:'上身收、下摆展开，轮廓明确但不过分正式。'},
      {title:'干净的同色穿搭',pieces:'浅灰上衣＋深灰西装裤＋银色小配饰＋白灰运动鞋',why:'同一色相用明度差制造层次，适合不想费力搭颜色的日子。'}
    ],
    warm:[
      {title:'清爽直线感',pieces:'棉质短袖衬衫＋高腰直筒裤＋薄底运动鞋或凉鞋',why:'挺括上衣和直筒裤减少贴身感，炎热天气也保持整洁。'},
      {title:'轻盈裙装',pieces:'合身纯色 T 恤＋高腰 A 字中长裙＋凉鞋＋小号肩背包',why:'上简下有体积，腰线清楚，走路时有轻盈感。'},
      {title:'低饱和夏日配色',pieces:'雾蓝或鼠尾草绿上衣＋米白长裤＋棕色凉鞋和包',why:'一个低饱和彩色配两个中性色，柔和但不寡淡。'},
      {title:'运动休闲但不随便',pieces:'短款或塞衣角的 T 恤＋垂坠运动长裤＋轻量球鞋＋棒球帽',why:'明确腰线并统一鞋帽颜色，运动单品会更完整。'}
    ]
  };
  const OUTFIT_OCCASIONS = {
    university:'搭配帆布托特或简洁双肩包；首饰只留一处，保证坐一整天仍然舒服。',
    library:'优先柔软腰头和可穿脱外层，带一条轻薄围巾应对空调。',
    social:'换成小号有结构的包，加耳饰或项链，并把鞋换成乐福鞋、短靴或芭蕾鞋。',
    weekend:'可以加入棒球帽、彩色袜子或一件有图案的单品，让基础搭配更有趣。',
    rain:'外层选择防泼水材质，裤脚不要拖地，鞋用深色防滑款并带折叠伞。'
  };
  const OUTFIT_STYLES = {
    clean:{label:'简洁利落',palette:'黑、白、灰、海军蓝，最多加入一个低饱和强调色',finish:'保持包和鞋的线条干净，避免同时出现太多装饰。'},
    soft:{label:'柔和松弛',palette:'燕麦、奶油、灰粉、雾蓝与浅棕',finish:'用针织、麂皮感或柔软棉料增加质感，但仍保留清楚的腰线。'},
    preppy:{label:'学院感',palette:'海军蓝、酒红、灰色、米白与棕色',finish:'加入衬衫领、针织背心或乐福鞋，图案一次只选格纹或条纹之一。'},
    sporty:{label:'运动休闲',palette:'灰、黑、白为主，可用红色或蓝色做一个小面积强调',finish:'用短外套、高腰线或同色鞋帽把运动单品收拢成完整造型。'}
  };
  function outfitAdviserMarkup(tab) {
    return `<section class="outfit-adviser"><div class="outfit-adviser-head"><div><p class="eyebrow">OUTFIT ADVISER</p><h2>${tab==='today'?'今天穿什么 · What to Wear':'穿搭灵感推荐 · Inspiration'}</h2><p>不用先自己想。选择温度、场合和风格，我直接给你三套完整搭配；你仍然可以把自己的灵感加进来。</p></div></div>
      <div class="outfit-filters"><select id="outfitTemp"><option value="cold">低于 8°C · 冷</option><option value="cool" selected>8–15°C · 偏凉</option><option value="mild">16–22°C · 温和</option><option value="warm">23°C 以上 · 暖热</option></select><select id="outfitOccasion"><option value="university">上课 / 校园</option><option value="library">图书馆 / 长时间学习</option><option value="social">聚餐 / 见朋友</option><option value="weekend">周末休闲</option><option value="rain">下雨通勤</option></select><select id="outfitStyle"><option value="clean">简洁利落</option><option value="soft">柔和松弛</option><option value="preppy">学院感</option><option value="sporty">运动休闲</option></select><button type="button" onclick="refreshOutfitRecommendations()">给我推荐三套</button></div><div id="outfitRecommendations" class="outfit-recommendations"></div><p class="outfit-note">推荐只在当前页面生成，不读取或上传你的私人衣柜；保存后可在“我的造型”继续修改。</p></section>`;
  }
  function buildOutfitRecommendations() {
    const temp=$('outfitTemp')?.value||'cool', occasion=$('outfitOccasion')?.value||'university', styleKey=$('outfitStyle')?.value||'clean', bases=OUTFIT_BASES[temp], style=OUTFIT_STYLES[styleKey];
    currentOutfitRecommendations=[0,1,2].map((_,index)=>{ const base=bases[(index+outfitRefreshSeed)%bases.length]; return {title:base.title,pieces:base.pieces,why:base.why,occasion:OUTFIT_OCCASIONS[occasion],weather:temp,style:style.label,palette:style.palette,finish:style.finish,occasionKey:occasion}; });
    const root=$('outfitRecommendations'); if(!root)return;
    root.innerHTML=currentOutfitRecommendations.map((look,index)=>`<article class="outfit-card"><span class="look-no">LOOK 0${index+1}</span><h3>${v5Title(look.title)}</h3><p>${v5Title(look.pieces)}</p><small>${v5Title(look.why)} ${v5Title(look.occasion)} ${v5Title(look.finish)}</small><button type="button" onclick="saveOutfitRecommendation(${index})">＋ 保存到我的造型</button></article>`).join('');
  }
  window.refreshOutfitRecommendations=function(){outfitRefreshSeed=(outfitRefreshSeed+1)%4;buildOutfitRecommendations();};
  window.saveOutfitRecommendation=function(index){const look=currentOutfitRecommendations[index];if(!look)return;v5Rows('styleItems').unshift({id:uid('style'),type:'look',title:look.title,date:todayStr(),occasion:look.occasionKey,weather:look.weather,keywords:look.style,pieces:look.pieces,palette:look.palette,url:'',notes:`${look.why} ${look.occasion} ${look.finish}`,again:''});saveState();alert('已经保存到“我的造型”，你可以继续修改成自己真正拥有的单品。');};
  renderStyle=function(tab=state.v5Meta.styleTab||'today'){previousRenderStyle(tab);if(tab==='today'||tab==='inspiration'){const root=$('styleContent');root.insertAdjacentHTML('afterbegin',outfitAdviserMarkup(tab));buildOutfitRecommendations();}};

  if(currentSection==='style-section')renderStyle(state.v5Meta.styleTab||'today');
})();

/* ---- preserved execution layer ---- */

/* V8 stability, unified hubs, recovery and interaction layer. Existing records remain authoritative. */
(function(){
  const RECOVERY_KEY='becoming_workspace_recovery_v8';
  const BACKUP_DATE_KEY='becoming_workspace_last_export_v8';
  const VERSION='8.0';
  const ARRAY_LABELS={tasks:'任务',projects:'项目',focus:'专注',life:'生活事务',portfolio:'作品',journal:'日记与笔记',trips:'旅行',routines:'SOP / Routine',inventory:'库存',recipes:'菜谱',english:'英语记录',studyAreas:'学习领域',learningCycles:'学习周期',studyModules:'课程',books:'书籍',readingLogs:'阅读记录',newsNotes:'新闻判断',newsBriefs:'简报',learningLinks:'学习链接',customAchievements:'自定义成就',inbox:'Inbox',planItems:'计划',pointsRules:'积分规则',pointsLog:'积分记录',universityAssessments:'大学作业',placementLogs:'实习',applications:'申请',moneyTransactions:'金钱流水',moneyBudgets:'预算',moneyAccounts:'账户',wishlist:'愿望清单',styleItems:'穿搭与风格',decisionLog:'决定记录'};
  let toastTimer=0,lastSnapshotAt=0,lastSnapshotText='';
  function toast(message,error=false){let el=document.getElementById('v8Toast');if(!el){el=document.createElement('div');el.id='v8Toast';el.className='v8-toast';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.appendChild(el);}el.textContent=message;el.className='v8-toast show'+(error?' error':'');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.className='v8-toast',3200);}
  function recoveryRows(){try{return JSON.parse(localStorage.getItem(RECOVERY_KEY)||'[]')}catch{return []}}
  function snapshot(force=false,label='自动恢复点'){try{const text=JSON.stringify(state);const now=Date.now();if(!force&&(text===lastSnapshotText||now-lastSnapshotAt<10*60*1000))return;const rows=recoveryRows();rows.unshift({id:'recovery_'+now,at:new Date().toISOString(),label,version:VERSION,data:JSON.parse(text)});localStorage.setItem(RECOVERY_KEY,JSON.stringify(rows.slice(0,8)));lastSnapshotAt=now;lastSnapshotText=text;}catch(error){console.warn('恢复点保存失败',error)}}
  const baseQueueSave=window.queueWorkspaceSave;
  window.queueWorkspaceSave=function(data){snapshot(false);baseQueueSave(data);updateSafetyBar();};
  const baseExport=exportJson;
  exportJson=function(){snapshot(true,'导出前恢复点');baseExport();localStorage.setItem(BACKUP_DATE_KEY,new Date().toISOString());updateSafetyBar();toast('JSON 备份已下载；请把文件放到安全的位置。');};
  function bytesLabel(n){return n<1024?`${n} B`:n<1048576?`${(n/1024).toFixed(1)} KB`:`${(n/1048576).toFixed(1)} MB`}
  function backupAge(){const raw=localStorage.getItem(BACKUP_DATE_KEY);if(!raw)return '还没有下载过备份';const days=Math.floor((Date.now()-new Date(raw).getTime())/86400000);return days<1?'今天已备份':days===1?'上次备份：昨天':`上次备份：${days} 天前`;}
  function updateSafetyBar(){const el=document.getElementById('v8SafetyMeta');if(el)el.textContent=`${backupAge()} · 本机数据约 ${bytesLabel(new Blob([JSON.stringify(state)]).size)} · ${recoveryRows().length} 个恢复点`;}
  function safetyMarkup(){return `<div id="v8SafetyBar" class="v8-safety"><strong>数据安全</strong><span id="v8SafetyMeta"></span><span class="v8-safety-spacer"></span><button type="button" onclick="openRecoveryCenter()">恢复中心</button><button type="button" class="primary" onclick="exportJson()">下载备份</button></div>`}
  function mountSafety(){const main=document.querySelector('main');if(main&&!document.getElementById('v8SafetyBar'))main.insertAdjacentHTML('afterbegin',safetyMarkup());updateSafetyBar();const raw=localStorage.getItem(BACKUP_DATE_KEY);if(!raw||Date.now()-new Date(raw).getTime()>7*86400000)document.getElementById('v8SafetyBar')?.classList.add('needs-backup');}
  window.createRecoverySnapshot=function(){snapshot(true,'手动恢复点');document.getElementById('v8RecoveryDialog')?.close();toast('已建立恢复点');};
  window.openRecoveryCenter=function(){let d=document.getElementById('v8RecoveryDialog');if(!d){d=document.createElement('dialog');d.id='v8RecoveryDialog';d.className='v8-dialog';document.body.appendChild(d);}const rows=recoveryRows();d.innerHTML=`<div class="v8-dialog-inner"><h2>恢复中心 · Recovery</h2><p>网站自动保留最近 8 个本机恢复点。恢复前会再保存当前状态。</p><div class="v8-dialog-list">${rows.length?rows.map((x,i)=>`<div class="v8-dialog-row"><span>${new Date(x.at).toLocaleString()} · ${v5Title(x.label)}</span><button type="button" onclick="restoreRecovery(${i})">恢复</button></div>`).join(''):'<div class="v8-dialog-row"><span>还没有恢复点。</span></div>'}</div><div class="v8-dialog-actions"><button type="button" onclick="this.closest('dialog').close()">关闭</button><button type="button" class="primary" onclick="createRecoverySnapshot()">立即建立恢复点</button></div></div>`;d.showModal();};
  window.restoreRecovery=function(index){const row=recoveryRows()[index];if(!row)return;if(!confirm(`恢复到 ${new Date(row.at).toLocaleString()} 吗？当前状态会先保留。`))return;snapshot(true,'恢复操作前');Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,row.data);saveState();renderAll();renderV5Home();document.getElementById('v8RecoveryDialog')?.close();toast('已经恢复，并保留了恢复前的状态。');};
  function normalizeIncoming(parsed){const previous=window.__initialWorkspace;window.__initialWorkspace=parsed;const normalized=loadState();window.__initialWorkspace=previous;return normalized;}
  function mergeArray(a,b){const out=[...(Array.isArray(a)?a:[])],byId=new Map(out.map((x,i)=>[x&&x.id,i]));for(const item of (Array.isArray(b)?b:[])){if(item&&item.id&&byId.has(item.id))out[byId.get(item.id)]={...out[byId.get(item.id)],...item};else if(!out.some(x=>JSON.stringify(x)===JSON.stringify(item)))out.push(item)}return out}
  function mergeValue(current,incoming,key){if(Array.isArray(incoming))return mergeArray(current,incoming);if(key==='focus')return {...current,...incoming,sessions:mergeArray(current?.sessions,incoming?.sessions),active:current?.active||incoming?.active||null};if(incoming&&typeof incoming==='object')return {...(current&&typeof current==='object'?current:{}),...incoming};return incoming}
  function importSummary(parsed){return Object.entries(parsed).flatMap(([key,value])=>{if(Array.isArray(value))return [[ARRAY_LABELS[key]||key,value.length]];if(key==='focus'&&Array.isArray(value?.sessions))return [['专注记录',value.sessions.length]];if(value&&typeof value==='object')return [[ARRAY_LABELS[key]||key,Object.keys(value).length]];return []}).filter(x=>x[1]>0)}
  importJsonText=function(raw){let parsed;try{parsed=JSON.parse(raw);validateImportIds(parsed);if(!parsed||Array.isArray(parsed)||!Array.isArray(parsed.tasks))throw new Error('不是有效的 Becoming JSON 备份');}catch(error){toast('导入失败：'+error.message,true);alert('JSON 导入失败：'+error.message);return}const summary=importSummary(parsed);let d=document.getElementById('v8ImportDialog');if(!d){d=document.createElement('dialog');d.id='v8ImportDialog';d.className='v8-dialog';document.body.appendChild(d)}d.__incoming=parsed;d.innerHTML=`<div class="v8-dialog-inner"><h2>导入预览 · Import Preview</h2><p>文件中找到以下内容。合并会按记录 ID 去重；完全替换会先建立恢复点。</p><div class="v8-dialog-list">${summary.map(x=>`<div class="v8-dialog-row"><span>${v5Title(x[0])}</span><strong>${x[1]}</strong></div>`).join('')||'<div class="v8-dialog-row"><span>文件没有可识别的记录</span></div>'}</div><div class="v8-dialog-actions"><button type="button" onclick="this.closest('dialog').close()">取消</button><button type="button" onclick="applyV8Import('replace')">完全替换</button><button type="button" class="primary" onclick="applyV8Import('merge')">合并并去重</button></div></div>`;d.showModal();};
  window.applyV8Import=function(mode){const d=document.getElementById('v8ImportDialog'),incoming=normalizeIncoming(d.__incoming);snapshot(true,'导入前恢复点');if(mode==='replace'){Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,incoming)}else{for(const [key,value] of Object.entries(incoming))state[key]=mergeValue(state[key],value,key)}saveState();renderAll();renderV5Home();d.close();toast(mode==='replace'?'备份已完整载入。':'备份已合并并按 ID 去重。');};
  function lifeHub(){return `<section class="v8-hub"><div class="v8-hub-head"><div><h2>生活中心 · Life Hub</h2><p>这里是统一入口；原来的记录没有删除，只是归回各自系统。</p></div></div><div class="v8-hub-grid">${[
    ['生活系统 · My System','SOP、作息、家务、采购与库存','homebase-section'],['健康 · Health','习惯、饮食、体重、运动与护理','habit-section'],['厨房 · Kitchen','菜谱、备饭和食材使用','recipe-section'],['风格 · Style','今日穿搭、灵感、我的造型与衣橱知识','style-section'],['旅行 · Travel','旅行地图、计划和日志','studio-section','travel'],['生活事务 · Life Admin','当前页：行政、证件、住宿和日常事务','life-section']
  ].map(x=>`<button type="button" class="v8-hub-card" onclick="navTo('${x[2]}');${x[3]?`setStudioTab('${x[3]}')`:''}"><strong>${x[0]}</strong><span>${x[1]}</span><em>打开 →</em></button>`).join('')}</div></section>`}
  function mountLifeHub(){const section=document.getElementById('life-section'),host=section?.querySelector('.soft-card');if(host&&!document.getElementById('v8LifeHub')){const wrap=document.createElement('div');wrap.id='v8LifeHub';wrap.innerHTML=lifeHub();section.insertBefore(wrap,host)}}
  const baseHome=renderV5Home;
  renderV5Home=function(){baseHome();const root=document.getElementById('v5Home');if(root&&!root.querySelector('.v8-home-action')){const greeting=root.querySelector('.home-greeting');greeting?.insertAdjacentHTML('afterend',`<div class="v8-home-action"><div><strong>${state.focus?.active?'正在专注：'+v5Title(state.focus.active.title):'现在开始第一件事'}</strong><span>${state.focus?.active?'计时会在刷新后继续，不会丢失。':'先选任务，再进入一段 25 分钟专注。'}</span></div><button type="button" onclick="navTo('plan-section');renderPlan('day')">${state.focus?.active?'查看计时':'开始专注'} →</button></div>`)}};
  const basePlan=renderPlan;
  renderPlan=function(tab=state.v5Meta.planTab||'day'){basePlan(tab);if(tab==='week'||tab==='month'){const root=document.getElementById('planContent');root?.insertAdjacentHTML('beforeend',`<div class="v8-period-close"><p>${tab==='week'?'周末结算：完成、推迟或停止本周事项，再决定下周候选。':'月底结算：核对预算、学习周期和未完成结果，再决定下月方向。'}</p><button type="button" onclick="navTo('review-section')">进入${tab==='week'?'周':'月'}复盘</button><button type="button" onclick="exportJson()">备份本周期</button></div>`)}};
  const baseNav=navTo;
  navTo=function(id){baseNav(id);document.querySelectorAll('.v8-mobile-nav button').forEach(b=>b.classList.toggle('active',b.dataset.target===id));if(id==='life-section')mountLifeHub()};
  function mobileNav(){if(document.getElementById('v8MobileNav'))return;document.body.insertAdjacentHTML('beforeend',`<nav id="v8MobileNav" class="v8-mobile-nav" aria-label="手机主导航">${[['⌂','今天','home-section'],['◷','计划','plan-section'],['✓','任务','workflow-section'],['L','生活','life-section'],['•••','更多','settings-section']].map(x=>`<button type="button" data-target="${x[2]}" onclick="navTo('${x[2]}')"><span>${x[0]}</span>${x[1]}</button>`).join('')}</nav>`) }
  function accessibilityPass(root=document){root.querySelectorAll('button:not([type])').forEach(b=>b.type='button');const names=[['btnCloseEditDialog','关闭编辑窗口'],['v5UtilityButton','更多与设置'],['btnSidebarToggle','显示或隐藏侧栏']];names.forEach(([id,label])=>{const el=document.getElementById(id);if(el&&!el.getAttribute('aria-label'))el.setAttribute('aria-label',label)})}
  loadLiveNews=async function(){const status=document.getElementById('liveNewsStatus'),root=document.getElementById('liveNews');if(status)status.textContent='GitHub 静态版不在后台读取或上传信息；请主动打开可信来源。';if(root)root.innerHTML='<a href="https://www.reuters.com/world/" target="_blank" rel="noopener noreferrer"><span>Reuters</span><strong>World News</strong></a><a href="https://www.bbc.co.uk/news" target="_blank" rel="noopener noreferrer"><span>BBC</span><strong>UK & World News</strong></a><a href="https://theconversation.com/uk/education" target="_blank" rel="noopener noreferrer"><span>The Conversation</span><strong>Education analysis</strong></a>'};
  renderLearningBridge=async function(){const root=document.getElementById('learningBridge');if(root)root.innerHTML=`<div class="empty-state">学习内容已统一保存在“我的知识”中：${studyAreas().length} 个领域、${books().length} 本书、${v5Rows('readingLogs').length} 条阅读记录。</div>`};
  const baseCalendarImport=importAppleCalendarFiles;
  importAppleCalendarFiles=async function(files){await baseCalendarImport(files);const seen=new Map();for(const event of (state.appleCalendar?.events||[])){const key=[event.uid||'',event.startIso||'',event.endIso||'',event.title||''].join('|');seen.set(key,event)}if(seen.size!==(state.appleCalendar?.events||[]).length){state.appleCalendar.events=[...seen.values()].sort((a,b)=>a.startIso.localeCompare(b.startIso));saveState();renderAll();renderV5Home();toast(`日历已去重，保留 ${seen.size} 个事件。`)}};
  const baseStartPlanFocus=startPlanFocus;
  startPlanFocus=function(){if('Notification' in window&&Notification.permission==='default')Notification.requestPermission().catch(()=>{});baseStartPlanFocus();};
  const baseCompletePlanFocus=completePlanFocus;
  completePlanFocus=function(automatic=false){const title=state.focus?.active?.title||'本轮专注';baseCompletePlanFocus(automatic);if(automatic&&'Notification' in window&&Notification.permission==='granted'){try{new Notification('专注完成',{body:`${title} 已记录。休息一下，或开始下一步。`})}catch{}}};
  const observer=new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1)accessibilityPass(n)})));
  snapshot(true,'V8 升级前状态');mountSafety();mountLifeHub();mobileNav();accessibilityPass();observer.observe(document.body,{childList:true,subtree:true});renderV5Home();if(currentSection==='plan-section')renderPlan(state.v5Meta.planTab||'day');
  if(navigator.storage?.persist)navigator.storage.persist().catch(()=>{});
  window.addEventListener('pagehide',()=>snapshot(true,'离开页面前'));
})();
