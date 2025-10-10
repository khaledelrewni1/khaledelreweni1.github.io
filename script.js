// بيانات الجدول (ثابتة، غيرها حسب الحاجة - هتتحدث من الأدمن)
let scheduleData = [
    { subject: 'رياضيات', doctor: 'د. أحمد', place: 'قاعة 101', day: 'الأحد', time: '10:00 - 12:00', notes: 'لا تغييرات' },
    { subject: 'فيزياء', doctor: 'د. فاطمة', place: 'قاعة 102', day: 'الاثنين', time: '2:00 - 4:00', notes: 'اختبار قادم' },
    { subject: 'كيمياء', doctor: 'د. محمد', place: 'مختبر 1', day: 'الأربعاء', time: '9:00 - 11:00', notes: '' },
    { subject: 'حاسب آلي', doctor: 'د. سارة', place: 'قاعة 103', day: 'الخميس', time: '11:00 - 1:00', notes: 'عبر الإنترنت' }
];

// كلمة مرور للتسجيل (غيرها، مثل كود الدفعة)
const loginPassword = 'd3f7h';  // مثال: غيرها لشيء سري

// تسجيل الدخول
document.getElementById('login').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if (pass === loginPassword && user) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        loadSchedule();
        loadCalendar();
        document.getElementById('lastUpdate').textContent = new Date().toLocaleDateString('ar-EG');
    } else {
        document.getElementById('errorMsg').textContent = 'بيانات خاطئة! جرب كود الدفعة.';
    }
});

// تحميل الجدول
function loadSchedule() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    scheduleData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.subject}</td>
            <td>${row.doctor}</td>
            <td>${row.place}</td>
            <td>${row.day}</td>
            <td>${row.time}</td>
            <td>${row.notes}</td>
        `;
        tbody.appendChild(tr);
    });
}

// تحميل التقويم التفاعلي
function loadCalendar() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',  // عرض أسبوعي
        locale: 'ar',  // عربي
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' },
        events: scheduleData.map(event => ({
            title: `${event.subject} - ${event.doctor}`,
            start: `2023-10-${['01','02','03','04'][scheduleData.indexOf(event)]}T${event.time.replace(' - ', '/')}`,  // تاريخ ووقت مثالي، غير حسب الحاجة
            location: event.place
        }))
    });
    calendar.render();
}