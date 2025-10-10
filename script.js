let scheduleData = JSON.parse(localStorage.getItem('scheduleData')) || [
    { subject: 'رياضيات', doctor: 'د. أحمد', place: 'قاعة 101', day: 'الأحد', time: '10:00 - 12:00', notes: 'لا تغييرات' },
    { subject: 'فيزياء', doctor: 'د. فاطمة', place: 'قاعة 102', day: 'الاثنين', time: '14:00 - 16:00', notes: 'اختبار قادم' },
    { subject: 'كيمياء', doctor: 'د. محمد', place: 'مختبر 1', day: 'الأربعاء', time: '09:00 - 11:00', notes: '' },
    { subject: 'حاسب آلي', doctor: 'د. سارة', place: 'قاعة 103', day: 'الخميس', time: '11:00 - 13:00', notes: 'عبر الإنترنت' }
];

const loginPassword = 'd3f7h';  // غيرها بعد الاختبار

// تسجيل الدخول
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('loginForm');
    modal.classList.add('show');  // أنيميشن فتح
    modal.addEventListener('click', function(e) { if (e.target === this) modal.style.display = 'none'; });
    document.getElementById('login').addEventListener('submit', function(e) {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        if (pass === loginPassword && user) {
            modal.style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            loadSchedule();
            loadCalendar();
            document.getElementById('lastUpdate').textContent = new Date(localStorage.getItem('lastUpdate') || Date.now()).toLocaleDateString('ar-EG');
        } else {
            document.getElementById('errorMsg').textContent = 'بيانات خاطئة!';
        }
    });
});

function loadSchedule() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    scheduleData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="المادة">${row.subject}</td>
            <td data-label="الدكتور/ة">${row.doctor}</td>
            <td data-label="المكان">${row.place}</td>
            <td data-label="اليوم">${row.day}</td>
            <td data-label="الوقت">${row.time}</td>
            <td data-label="ملاحظات">${row.notes}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ترتيب الجدول (تفاعل جديد زي Manus)
function sortTable(col) {
    const tbody = document.getElementById('tableBody');
    const rows = Array.from(tbody.rows);
    rows.sort((a, b) => a.cells[col].textContent.localeCompare(b.cells[col].textContent));
    rows.forEach(row => tbody.appendChild(row));
    alert('تم الترتيب بالعمود ' + col);  // تأكيد
}

function loadCalendar() {
    const calendarEl = document.getElementById('calendar');
    const today = new Date();
    const daysMap = { 'الأحد': 0, 'الاثنين': 1, 'الثلاثاء': 2, 'الأربعاء': 3, 'الخميس': 4, 'الجمعة': 5, 'السبت': 6 };
    const events = scheduleData.map((event, index) => {
        const dayNum = daysMap[event.day] || 0;
        const eventDate = new Date(today);
        eventDate.setDate(today.getDate() + (dayNum - today.getDay() + 7) % 7);
        const [startTime, endTime] = event.time.split(' - ');
        const start = `${eventDate.toISOString().split('T')[0]}T${startTime}:00`;
        const end = `${eventDate.toISOString().split('T')[0]}T${endTime}:00`;
        return {
            id: index,
            title: `${event.subject} - ${event.doctor}`,
            start: start,
            end: end,
            extendedProps: { place: event.place, notes: event.notes }  // تفاصيل إضافية
        };
    });

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'ar',
        direction: 'rtl',
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' },
        events: events,
        eventDisplay: 'block',
        height: 'auto',
        eventClick: function(info) {  // تفاعل كليك زي Manus
            alert(`تفاصيل: ${info.event.title}\nالمكان: ${info.event.extendedProps.place}\nملاحظات: ${info.event.extendedProps.notes}`);
        }
    });
    calendar.render();
}
