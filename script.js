// بيانات افتراضية للساعات والأيام
const times = ['8:00', '9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00'];
const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// كلمات المرور (غيّرها للأمان)
const validLogins = {
    student: '123',
    admin: 'adminpass'
};

// الجدول الافتراضي (محاضرات تجريبية للاختبار)
let schedule = {};  // { day: { time: { subject: '', teacher: '', room: '' } } }

// دالة للحفظ (Firebase أو localStorage)
async function saveSchedule() {
    try {
        if (window.db) {  // إذا Firebase جاهز
            const querySnapshot = await getDocs(collection(window.db, 'schedule'));
            // مسح القديم وإضافة الجديد
            querySnapshot.forEach((doc) => deleteDoc(doc.ref));
            for (let day in schedule) {
                for (let time in schedule[day]) {
                    await addDoc(collection(window.db, 'schedule'), {
                        day: day,
                        time: time,
                        subject: schedule[day][time].subject,
                        teacher: schedule[day][time].teacher,
                        room: schedule[day][time].room
                    });
                }
            }
            showNotification('تم حفظ الجدول في السحابة!');
        } else {
            // fallback: localStorage
            localStorage.setItem('schedule', JSON.stringify(schedule));
            showNotification('تم حفظ الجدول محليًا!');
        }
    } catch (error) {
        console.error('خطأ في الحفظ:', error);
        showNotification('خطأ في الحفظ! تحقق من Firebase.', 'danger');
    }
}

// دالة تحميل الجدول
async function loadSchedule() {
    try {
        if (window.db) {
            const querySnapshot = await getDocs(collection(window.db, 'schedule'));
            schedule = {};
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (!schedule[data.day]) schedule[data.day] = {};
                schedule[data.day][data.time] = {
                    subject: data.subject,
                    teacher: data.teacher,
                    room: data.room
                };
            });
        } else {
            // fallback: localStorage
            const saved = localStorage.getItem('schedule');
            schedule = saved ? JSON.parse(saved) : {};
        }
        // إضافة بيانات تجريبية إذا فاضي
        if (Object.keys(schedule).length === 0) {
            schedule.mon = { '10:00': { subject: 'رياضيات', teacher: 'د. أحمد', room: 'A101' } };
            schedule.tue = { '9:00': { subject: 'فيزياء', teacher: 'د. سارة', room: 'B202' } };
            saveSchedule();
        }
    } catch (error) {
        console.error('خطأ في التحميل:', error);
        showNotification('خطأ في التحميل! استخدم البيانات الافتراضية.', 'warning');
        // استخدم الافتراضي
        schedule.mon = { '10:00': { subject: 'رياضيات', teacher: 'د. أحمد', room: 'A101' } };
        schedule.tue = { '9:00': { subject: 'فيزياء', teacher: 'د. سارة', room: 'B202' } };
    }
}

// بناء الجدول في HTML
function buildTable(tableId, bodyId, editable = false) {
    const tbody = document.getElementById(bodyId);
    tbody.innerHTML = '';

    times.forEach(time => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${time}</td>`;
        
        days.forEach(day => {
            const cell = document.createElement('td');
            const dayData = schedule[day] ? schedule[day][time] : null;
            
            if (dayData) {
                cell.classList.add('lecture');
                cell.innerHTML = `
                    <div>${dayData.subject}</div>
                    <small>${dayData.teacher} - ${dayData.room}</small>
                `;
                if (editable) {
                    cell.innerHTML += `
                        <button class="btn btn-sm btn-warning edit-btn mt-1" data-day="${day}" data-time="${time}">تعديل</button>
                        <button class="btn btn-sm btn-danger delete-btn mt-1" data-day="${day}" data-time="${time}">حذف</button>
                    `;
                }
                cell.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('btn')) {
                        alert(`المادة: ${dayData.subject}\nالمدرس: ${dayData.teacher}\nالغرفة: ${dayData.room}`);
                    }
                });
            } else {
                cell.textContent = editable ? 'اضغط لإضافة' : '';
                if (editable) {
                    cell.addEventListener('click', () => addLecturePrompt(day, time));
                }
            }
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
}

// إضافة محاضرة
function addLecturePrompt(day, time) {
    const subject = prompt('اسم المادة:');
    const teacher = prompt('المدرس:');
    const room = prompt('الغرفة:');
    if (subject && teacher && room) {
        if (!schedule[day]) schedule[day] = {};
        schedule[day][time] = { subject, teacher, room };
        saveSchedule();
        buildTable('adminTable', 'adminTableBody', true);
        showNotification('تم إضافة المحاضرة!');
    }
}

// أزرار التعديل/الحذف (للأدمن)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
        const day = e.target.dataset.day;
        const time = e.target.dataset.time;
        addLecturePrompt(day, time);  // إعادة استخدام للتعديل
    } else if (e.target.classList.contains('delete-btn')) {
        const day = e.target.dataset.day;
        const time = e.target.dataset.time;
        if (confirm('حذف هذه المحاضرة؟')) {
            delete schedule[day][time];
            if (Object.keys(schedule[day]).length === 0) delete schedule[day];
            saveSchedule();
            buildTable('adminTable', 'adminTableBody', true);
            showNotification('تم الحذف!');
        }
    }
});

// تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    if (validLogins[username] && validLogins[username] === password) {
        localStorage.setItem('user', username);
        errorDiv.style.display = 'none';
        document.getElementById('loginPage').style.display = 'none';
        
        loadSchedule().then(() => {
            if (username === 'admin') {
                document.getElementById('adminView').style.display = 'block';
                buildTable('adminTable', 'adminTableBody', true);
                setupWeekCalendar();
            } else {
                document.getElementById('studentView').style.display = 'block';
                buildTable('scheduleTable', 'tableBody', false);
                setupWeekCalendar();
                setupSearch();
            }
        });
    } else {
        errorDiv.textContent = 'اسم المستخدم أو كلمة المرور خاطئة! جرب: student / 123 أو admin / adminpass';
        errorDiv.style.display = 'block';
    }
});

// إعداد البحث (للطلاب)
function setupSearch() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#tableBody tr');
        rows.forEach(row => {
            let show = false;
            row.querySelectorAll('td.lecture').forEach(cell => {
                if (cell.textContent.toLowerCase().includes(term)) show = true;
            });
            row.style.display = show ? '' : 'none';
        });
    });
}

// إعداد التقويم الأسبوعي (widget)
function setupWeekCalendar() {
    const calendar = document.getElementById('weekCalendar');
    calendar.innerHTML = '';
    const today = new Date().getDay();  // 0=الأحد
    days.forEach((day, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-1';
        col.innerHTML = `<strong>${dayNames[index]}</strong><br><small>${schedule[day] ? Object.keys(schedule[day]).length + ' محاضرة' : 'فاضي'}</small>`;
        if (index === today) col.style.background = '#fff3cd';  // اليوم الحالي مميز
        calendar.appendChild(col);
    });
}

// إشعارات (widget)
function showNotification(message, type = 'success') {
    const notif = document.getElementById('notifications');
    notif.textContent = message;
    notif.className = `alert alert-${type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'success'}`;
    notif.style.display = 'block';
    setTimeout(() => notif.style.display = 'none', 3000);
}

// أزرار الخروج
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('user');
    location.reload();
});
document.getElementById('adminLogoutBtn').addEventListener('click', () => {
    localStorage.removeItem('user');
    location.reload();
});

// إضافة محاضرة من النموذج (للأدمن)
document.getElementById('addLecture').addEventListener('click', () => {
    const day = document.getElementById('daySelect').value;
    const time = document.getElementById('timeSelect').value;
    const subject = document.getElementById('subjectInput').value;
    const teacher = document.getElementById('teacherInput').value;
    if (subject && teacher) {
        if (!schedule[day]) schedule[day] = {};
        schedule[day][time] = { subject, teacher, room: 'غير محدد' };  // room افتراضي
        document.getElementById('subjectInput').value = '';
        document.getElementById('teacherInput').value = '';
        saveSchedule();
        buildTable('adminTable', 'adminTableBody', true);
    } else {
        alert('أدخل اسم المادة والمدرس!');
    }
});

// تحقق من الجلسة المحفوظة عند التحميل
window.addEventListener('load', () => {
    const user = localStorage.getItem('user');
    if (user) {
        document.getElementById('loginPage').style.display = 'none';
        loadSchedule().then(() => {
            if (user === 'admin') {
                document.getElementById('adminView').style.display = 'block';
                buildTable('adminTable', 'adminTableBody', true);
                setupWeekCalendar();
            } else {
                document.getElementById('studentView').style.display = 'block';
                buildTable('scheduleTable', 'tableBody', false);
                setupWeekCalendar();
                setupSearch();
            }
        });
    }
});
