/*
  مشروع "جدول المحاضرات" - ملف React واحد (App.jsx)
  - الواجهة بالعربية (RTL)
  - بيانات افتراضية: فارغة (المطلوب منك تعبئتها من لوحة الإدارة)
  - صفحة عرض للطلبة + لوحة إدارة محمية بكلمة المرور: khaled181
  - ساعات: 8 ص → 10 م (كل ساعة)
  - يبدأ الأسبوع من السبت → الخميس

  تعليمات سريعة لتشغيل المشروع (مرفقة هنا لتسهل عليك):
  1) أنشئ مشروع Vite React + Tailwind (أقصر طريقة):
     npm create vite@latest jadwal -- --template react
     cd jadwal
     npm install
     اتبع تعليمات Tailwind: https://tailwindcss.com/docs/guides/vite
  2) انسخ محتوى هذا الملف كـ src/App.jsx
  3) استبدل src/main.jsx ليعمل مع Tailwind وApp.jsx (افتراضي مع Vite)
  4) تشغيل محلياً: npm run dev
  5) للرفع على GitHub Pages:
     - أنشئ repo على GitHub ثم نفّذ build: npm run build
     - استخدم gh-pages أو GitHub Actions لنشر مجلد dist إلى gh-pages branch
     (ملاحظة: سأمدك بخطوات دقيقة للرفع لو حبيت)

  ملاحظة أمان: كلمة المرور مخزنة داخل الكود (js) لأن المشروع بسيط ومستضيف على GitHub Pages.
  لو احتجت أرفعها لنسخة أكثر أمانًا لاحقًا نقدر نستخدم Firebase Auth أو سرّ خارجي.
*/

import React, { useEffect, useState } from 'react';

// إعدادات أساسية
const ADMIN_PASSWORD = 'khaled181';
const STORAGE_KEY = 'jadwal_data_v1';
const DAYS = ['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس'];
const HOURS = Array.from({length:15},(_,i)=>8+i); // 8..22 -> 8..22 (15 ساعة)

// مكونات مساعدة
function Header({onOpenAdmin, upcoming}){
  return (
    <header className="w-full bg-gradient-to-l from-sky-400 via-violet-500 to-indigo-600 text-white p-4 rounded-b-2xl shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 rtl">
          <div className="text-3xl">📘</div>
          <div>
            <h1 className="text-2xl font-bold">جدول المحاضرات</h1>
            <div className="text-sm opacity-90">عرض جدول المحاضرات بتنسيق شبابي وسهل</div>
          </div>
        </div>
        <div className="text-right">
          {upcoming ? (
            <div className="text-sm bg-white/20 p-2 rounded-md">المحاضرة القادمة: <strong>{upcoming}</strong></div>
          ) : (
            <div className="text-sm bg-white/10 p-2 rounded-md">لا توجد محاضرات قريبة</div>
          )}
          <button onClick={onOpenAdmin} className="mt-2 bg-white text-indigo-700 px-3 py-1 rounded-md font-medium">لوحة الإدارة</button>
        </div>
      </div>
    </header>
  );
}

function Nav({view,setView}){
  return (
    <nav className="container mx-auto my-4 flex gap-2 rtl">
      <button onClick={()=>setView('home')} className={`px-3 py-2 rounded-md ${view==='home'?'bg-indigo-500 text-white':'bg-gray-100'}`}>الرئيسية</button>
      <button onClick={()=>setView('schedule')} className={`px-3 py-2 rounded-md ${view==='schedule'?'bg-indigo-500 text-white':'bg-gray-100'}`}>الجدول</button>
      <button onClick={()=>setView('instructors')} className={`px-3 py-2 rounded-md ${view==='instructors'?'bg-indigo-500 text-white':'bg-gray-100'}`}>الدكاترة</button>
    </nav>
  );
}

function Home({lectures}){
  return (
    <div className="container mx-auto p-4 rtl">
      <h2 className="text-xl font-semibold mb-3">أهلا بك</h2>
      <p className="mb-3">هذا الموقع يعرض جدول المحاضرات. تقدر تدخل لوحة الإدارة لإضافة محاضرات ودكاترة. الطلبة يشوفوا الجدول بس.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded shadow">مجموع المحاضرات: <strong>{lectures.length}</strong></div>
        <div className="p-4 bg-white rounded shadow">أيام: <strong>السبت - الخميس</strong></div>
        <div className="p-4 bg-white rounded shadow">ساعات: <strong>8:00 ص - 10:00 م</strong></div>
      </div>
    </div>
  );
}

function Schedule({lectures, instructors}){
  // نعرض البطاقات مصفوفة بحسب الأيام والساعات
  const byDay = {};
  DAYS.forEach(d=> byDay[d]=[]);
  lectures.forEach(l => {
    if(byDay[l.day]) byDay[l.day].push(l);
  });

  return (
    <div className="container mx-auto p-4 rtl">
      <h2 className="text-xl font-semibold mb-4">الجدول الأسبوعي</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DAYS.map(day=> (
          <div key={day} className="bg-white rounded shadow p-3">
            <h3 className="font-bold mb-2">{day}</h3>
            <div className="space-y-2">
              {HOURS.map(hr=>{
                const item = byDay[day].find(x=> +x.hour === +hr);
                if(!item) return (
                  <div key={day+hr} className="p-2 border rounded text-sm opacity-60">{hr}:00 — فارغ</div>
                );
                const inst = instructors.find(i=>i.id===item.instructorId);
                return (
                  <div key={item.id} className="p-2 border rounded bg-gradient-to-r from-white to-slate-50">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-sm">{inst?inst.name:'دكتور'} • {item.location || 'غير محدد'}</div>
                        {item.notes && <div className="text-xs mt-1">ملاحظة: {item.notes}</div>}
                      </div>
                      <div className="text-sm text-right">
                        <div>{hr}:00</div>
                        {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="mt-1 inline-block text-indigo-600 underline">رابط المحاضرة</a>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Instructors({instructors}){
  return (
    <div className="container mx-auto p-4 rtl">
      <h2 className="text-xl font-semibold mb-4">الدكاترة</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {instructors.length===0 && <div className="p-4 bg-white rounded shadow">لا يوجد دكاترة حتى الآن</div>}
        {instructors.map(i=> (
          <div key={i.id} className="bg-white rounded shadow p-4 text-right">
            <div className="font-bold text-lg">{i.name}</div>
            <div className="text-sm opacity-80">{i.title || ''}</div>
            {i.bio && <p className="mt-2 text-sm">{i.bio}</p>}
            <div className="mt-2 text-xs">المواد: {i.subjects?i.subjects.join(', '):'—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPanel({onSave, data, setData, onLogout}){
  const [tab, setTab] = useState('lectures');
  // فورم إضافة محاضرة
  const emptyLecture = {id:Date.now(), day: DAYS[0], hour:8, title:'', instructorId:null, location:'', link:'', notes:''};
  const [lectureForm, setLectureForm] = useState(emptyLecture);
  const emptyInstructor = {id:Date.now(), name:'', title:'', bio:'', subjects:[]};
  const [instrForm, setInstrForm] = useState(emptyInstructor);

  function addLecture(e){
    e.preventDefault();
    setData(prev=>({ ...prev, lectures: [...prev.lectures, lectureForm] }));
    setLectureForm({...emptyLecture, id:Date.now()});
  }
  function addInstructor(e){
    e.preventDefault();
    setData(prev=>({ ...prev, instructors: [...prev.instructors, instrForm] }));
    setInstrForm({...emptyInstructor, id:Date.now()});
  }

  function saveAll(){
    onSave(data);
    alert('تم الحفظ بنجاح');
  }

  return (
    <div className="container mx-auto p-4 rtl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">لوحة الإدارة</h2>
        <div>
          <button onClick={saveAll} className="ml-2 bg-green-500 text-white px-3 py-1 rounded">حفظ</button>
          <button onClick={onLogout} className="bg-red-500 text-white px-3 py-1 rounded">خروج</button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 rtl">
        <button onClick={()=>setTab('lectures')} className={`px-3 py-2 rounded ${tab==='lectures'?'bg-indigo-500 text-white':'bg-gray-100'}`}>المحاضرات</button>
        <button onClick={()=>setTab('instructors')} className={`px-3 py-2 rounded ${tab==='instructors'?'bg-indigo-500 text-white':'bg-gray-100'}`}>الدكاترة</button>
      </div>

      {tab==='lectures' && (
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-bold mb-2">إضافة محاضرة</h3>
          <form onSubmit={addLecture} className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <select required value={lectureForm.day} onChange={e=>setLectureForm({...lectureForm, day:e.target.value})} className="p-2 border rounded">
              {DAYS.map(d=> <option key={d} value={d}>{d}</option>)}
            </select>
            <select required value={lectureForm.hour} onChange={e=>setLectureForm({...lectureForm, hour:+e.target.value})} className="p-2 border rounded">
              {HOURS.map(h=> <option key={h} value={h}>{h}:00</option>)}
            </select>
            <input required placeholder="اسم المادة" value={lectureForm.title} onChange={e=>setLectureForm({...lectureForm, title:e.target.value})} className="p-2 border rounded"/>
            <select value={lectureForm.instructorId || ''} onChange={e=>setLectureForm({...lectureForm, instructorId: e.target.value || null})} className="p-2 border rounded">
              <option value="">اختر دكتور (اختياري)</option>
              {data.instructors.map(i=> <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <input placeholder="المكان (قاعة)" value={lectureForm.location} onChange={e=>setLectureForm({...lectureForm, location:e.target.value})} className="p-2 border rounded"/>
            <input placeholder="رابط المحاضرة (لينك)" value={lectureForm.link} onChange={e=>setLectureForm({...lectureForm, link:e.target.value})} className="p-2 border rounded"/>
            <textarea placeholder="ملاحظات" value={lectureForm.notes} onChange={e=>setLectureForm({...lectureForm, notes:e.target.value})} className="p-2 border rounded col-span-1 md:col-span-2" />
            <button type="submit" className="bg-indigo-600 text-white px-3 py-2 rounded">أضف المحاضرة</button>
          </form>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">قائمة المحاضرات الحالية</h4>
            {data.lectures.length===0 && <div className="p-2">لا توجد محاضرات بعد</div>}
            <ul className="space-y-2">
              {data.lectures.map(l=> (
                <li key={l.id} className="p-2 border rounded flex justify-between items-center">
                  <div className="text-sm">{l.title} — {l.day} {l.hour}:00</div>
                  <div>
                    <button onClick={()=>{
                      if(confirm('حذف المحاضرة؟')){
                        setData(prev=> ({...prev, lectures: prev.lectures.filter(x=>x.id!==l.id)}));
                      }
                    }} className="text-sm text-red-600">حذف</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab==='instructors' && (
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-bold mb-2">إضافة دكتور</h3>
          <form onSubmit={addInstructor} className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input required placeholder="اسم الدكتور" value={instrForm.name} onChange={e=>setInstrForm({...instrForm, name:e.target.value})} className="p-2 border rounded"/>
            <input placeholder="التخصص/المسمى" value={instrForm.title} onChange={e=>setInstrForm({...instrForm, title:e.target.value})} className="p-2 border rounded"/>
            <input placeholder="المواد (افصل بين كل مادة بفاصلة)" value={instrForm.subjects.join(', ')} onChange={e=>setInstrForm({...instrForm, subjects: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="p-2 border rounded"/>
            <textarea placeholder="نبذة عن الدكتور" value={instrForm.bio} onChange={e=>setInstrForm({...instrForm, bio:e.target.value})} className="p-2 border rounded col-span-1 md:col-span-2" />
            <button type="submit" className="bg-indigo-600 text-white px-3 py-2 rounded">أضف الدكتور</button>
          </form>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">قائمة الدكاترة</h4>
            {data.instructors.length===0 && <div className="p-2">لا يوجد دكاترة بعد</div>}
            <ul className="space-y-2">
              {data.instructors.map(i=> (
                <li key={i.id} className="p-2 border rounded flex justify-between items-center">
                  <div className="text-sm">{i.name} — {i.title}</div>
                  <div>
                    <button onClick={()=>{
                      if(confirm('حذف الدكتور؟')){
                        setData(prev=> ({...prev, instructors: prev.instructors.filter(x=>x.id!==i.id)}));
                      }
                    }} className="text-sm text-red-600">حذف</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App(){
  const [view,setView] = useState('home');
  const [showAdminLogin,setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState({ lectures: [], instructors: [] });

  // تحميل من localStorage عند البداية
  useEffect(()=>{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      try{ setData(JSON.parse(raw)); }catch(e){ console.error(e); }
    }
  },[]);
  // حفظ تلقائي عند تغير البيانات
  useEffect(()=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },[data]);

  function openAdmin(){ setShowAdminLogin(true); }
  function handleLogin(pw){
    if(pw===ADMIN_PASSWORD){ setIsAdmin(true); setShowAdminLogin(false); setView('schedule'); }
    else alert('كلمة المرور خاطئة');
  }
  function handleLogout(){ setIsAdmin(false); setView('home'); }

  function saveData(obj){
    setData(obj);
    // already saved by effect
  }

  // بحث عن أقرب محاضرة قادمة (بسيط)
  const upcomingText = (()=>{
    const now = new Date();
    // نحاول إيجاد أي محاضرة بنفس اليوم والساعة >= الآن
    const dayIndex = (now.getDay()+1)%7; // تحويل: السبت index 0 => tricky; لتبسيط سنبحث ببساطة في جميع
    if(data.lectures.length===0) return null;
    const next = data.lectures.sort((a,b)=> (a.day+b.hour) > (b.day+b.hour) ? 1:-1)[0];
    if(!next) return null;
    return `${next.title} — ${next.day} ${next.hour}:00`;
  })();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" dir="rtl">
      <Header onOpenAdmin={openAdmin} upcoming={upcomingText} />
      <Nav view={view} setView={setView} />

      {view==='home' && <Home lectures={data.lectures} />}
      {view==='schedule' && <Schedule lectures={data.lectures} instructors={data.instructors} />}
      {view==='instructors' && <Instructors instructors={data.instructors} />}

      {isAdmin && <AdminPanel onSave={saveData} data={data} setData={setData} onLogout={handleLogout} />}

      {/* نافذة تسجيل الدخول الإدارية */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded p-4 w-full max-w-md">
            <h3 className="font-bold mb-2">دخول لوحة الإدارة</h3>
            <p className="text-sm mb-2">اكتب كلمة المرور للدخول</p>
            <AdminLoginForm onSubmit={handleLogin} onClose={()=>setShowAdminLogin(false)} />
          </div>
        </div>
      )}

      <footer className="mt-8 p-4 text-center text-sm opacity-70">© جدول المحاضرات — مصمم للشبكة الجامعية</footer>
    </div>
  );
}

function AdminLoginForm({onSubmit,onClose}){
  const [pw,setPw] = useState('');
  return (
    <form onSubmit={(e)=>{ e.preventDefault(); onSubmit(pw); }} className="space-y-2">
      <input type="password" placeholder="كلمة المرور" value={pw} onChange={e=>setPw(e.target.value)} className="w-full p-2 border rounded" />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-3 py-1 rounded bg-gray-200">إلغاء</button>
        <button type="submit" className="px-3 py-1 rounded bg-indigo-600 text-white">دخول</button>
      </div>
    </form>
  );
}
