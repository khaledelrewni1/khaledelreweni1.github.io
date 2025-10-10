console.log('Script.js loaded!');  // للاختبار

// البيانات الأساسية - بدء الأسبوع بالسبت، أوقات حتى 10:00 م مع تمييز ص/م
const times = ['8:00 ص', '9:00 ص', '10:00 ص', '11:00 ص', '12:00 م', '1:00 م', '2:00 م', '3:00 م', '4:00 م', '5:00 م', '6:00 م', '7:00 م', '8:00 م', '9:00 م', '10:00 م'];
const days = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];  // بدء بالسبت
const dayNames = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];  // مطابق للترتيب

// كلمات المرور (غيّرها للأمان في الإنتاج)
const validLogins = {
    'student': '123',
    'admin': 'adminpass'
};

let schedule = {};  // الجدول

// تحميل الجدول من localStorage
function loadSchedule() {
    console.log('Loading schedule...');
    const saved = localStorage.getItem('schedule');
    schedule = saved ? JSON.parse(saved) : {};
    
    // بيانات تجريبية إذا فاضي - تعديل للأيام والأوقات الجديدة
    if (Object.keys(schedule).length === 0) {
        schedule.sat = { '10:00 ص': { subject: 'رياضيات', teacher: 'د. أحمد', room: 'A101' } };  // مثال على السبت
        schedule.mon = { '10:00 ص': { subject: 'رياضيات', teacher: 'د. أحمد', room: 'A101' } };
        schedule.tue = { '9:00 ص': { subject: 'فيزياء', teacher: 'د. سارة', room: 'B202' } };
        saveSchedule();
        console.log('Added default data');
    }
    console.log('Schedule loaded:', schedule);
}

// حفظ في localStorage
function saveSchedule() {
    localStorage.setItem('schedule', JSON.stringify(schedule));
    showNotification('تم حفظ التغييرات!');
    console.log('Saved schedule');
}

// بناء الجدول - تعديل: قلب الجدول (أيام في الصفوف، أوقات في الأعمدة)، خلايا كروت لشبه widgets
function buildTable(tableId, bodyId, editable = false) {
    console.log('Building table for', tableId);
    const tbody = document.getElementById(bodyId);
    if (!tbody) {
        console.error('Tbody not found:', bodyId);
        return;
    }
    tbody.innerHTML = '';

    days.forEach((day, dayIndex) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td class="day-widget"><strong>${dayNames[dayIndex]}</strong></td>`;  // يوم كـ widget في أول عمود
        
        times.forEach(time => {
            const cell = document.createElement('td');
            const data = schedule[day] && schedule[day][time] ? schedule[day][time] : null;
            
            if (data) {
                cell.classList.add('lecture-widget');  // class للـ CSS
                cell.innerHTML = `
                    <div class="widget-card">
                        <i class="bi bi-book-fill"></i>  <!-- أيقونة كتاب -->
                        <div>${data.subject}</div>
                        <small>${data.teacher} - ${data.room || 'غير محدد'}</small>
                    </div>
                `;
                if (editable) {
                    cell.innerHTML += `
                        <br>
                        <button class="btn btn-sm btn-outline-warning" onclick="editLecture('${day}', '${time}')"><i class="bi bi-pencil"></i> تعديل</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteLecture('${day}', '${time}')"><i class="bi bi-trash"></i> حذف</button>
                    `;
                } else {
                    cell.style.cursor = 'pointer';
                    cell.onclick = () => alert(`المادة: ${data.subject}\nالمدرس: ${data.teacher}\nالغرفة: ${data.room || 'غير محدد'}`);
                }
            } else if (editable) {
                cell.innerHTML = '<div class="empty-widget"><small>اضغط لإضافة</small></div>';
                cell.style.cursor = 'pointer';
                cell.onclick = () => addLecturePrompt(day, time);
            }
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
}

// إضافة/تعديل محاضرة
function addLecturePrompt(day, time) {
    const subject = prompt('اسم المادة:');
    const teacher = prompt('المدرس:');
    const room = prompt('الغرفة (اختياري):') || '';
    if (subject && teacher) {
        if (!schedule[day]) schedule[day] = {};
        schedule[day][time] = { subject, teacher, room };
        saveSchedule();
        buildTable('adminTable', 'adminTableBody', true);
        showNotification('تم إضافة/تعديل المحاضرة!');
    }
}

// تعديل
function editLecture(day, time) {
    addLecturePrompt(day, time);
}

// حذف
function deleteLecture(day, time) {
    if (confirm('هل تريد حذف هذه المحاضرة؟')) {
        delete schedule[day][time];
        if (Object.keys(schedule[day]).length === 0) delete schedule[day];
        saveSchedule();
        buildTable('adminTable', 'adminTableBody', true);
        showNotification('تم الحذف!');
    }
}

// إعداد البحث (للطلاب) - يعمل على الصفوف الجديدة
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#tableBody tr');
            rows.forEach(row => {
                let visible = false;
                row.querySelectorAll('td').forEach(td => {
                    if (td.textContent.toLowerCase().includes(term)) visible = true;
                });
                row.style.display = visible ? '' : 'none';
            });
        });
        console.log('Search setup done');
    }
}

// إعداد التقويم الأسبوعي (widget) - أسلوب أندرويد مع ألوان ديناميكية
function setupWeekCalendar() {
    const calendar = document.getElementById('weekCalendar');
    if (calendar) {
        calendar.innerHTML = '';
        days.forEach((day, i) => {
            const div = document.createElement('div');
            div.className = 'col-md-1 p-3 android-widget m-2 rounded';  // class جديد
            const count = schedule[day] ? Object.keys(schedule[day]).length : 0;
            const colorClass = count > 2 ? 'bg-danger' : count > 0 ? 'bg-success' : 'bg-secondary';  // ألوان بناءً على العدد
            div.innerHTML = `
                <i class="bi bi-calendar-day fs-4 mb-2"></i>
                <strong>${dayNames[i]}</strong><br>
                <small class="badge ${colorClass}">${count} محاضرات</small>
            `;
            calendar.appendChild(div);
        });
        console.log('Calendar setup done');
    }
}

// إشعارات (widget) - تأثير أندرويد
function showNotification(msg, type = 'success') {
    const notif = document.getElementById('notifications');
    if (notif) {
        notif.textContent = msg;
        notif.className = `alert alert-${type} android-notification mt-3`;
        notif.style.display = 'block';
        setTimeout(() => notif.style.display = 'none', 3000);
    }
}

// التحميل الرئيسي
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    const form = document.getElementById('loginForm');
    if (!form) {
        console.error('Login form not found!');
        return;
    }
    console.log('Form found');

    // تسجيل الدخول
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Submit clicked!');
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        
        console.log('Login attempt:', username, password);

        if (validLogins[username] && validLogins[username] === password) {
            console.log('Login successful for', username);
            localStorage.setItem('user', username);
            errorDiv.style.display = 'none';
            document.getElementById('loginPage').style.display = 'none';
            
            loadSchedule();
            
            if (username === 'admin') {
                document.getElementById('adminView').style.display = 'block';
                buildTable('adminTable', 'adminTableBody', true);
                setupWeekCalendar();
                
                // إضافة محاضرة من النموذج
                const addBtn = document.getElementById('addLecture');
                if (addBtn && !addBtn.hasListener) {
                    addBtn.addEventListener('click', () => {
                        const day = document.getElementById('daySelect').value;
                        const time = document.getElementById('timeSelect').value;
                        const subject = document.getElementById('subjectInput').value.trim();
                        const teacher = document.getElementById('teacherInput').value.trim();
                        const room = document.getElementById('roomInput').value.trim() || '';
                        if (subject && teacher) {
                            if (!schedule[day]) schedule[day] = {};
                            schedule[day][time] = { subject, teacher, room };
                            document.getElementById('subjectInput').value = '';
                            document.getElementById('teacherInput').value = '';
                            document.getElementById('roomInput').value = '';
                            saveSchedule();
                            buildTable('adminTable', 'adminTableBody', true);
                            showNotification('تم إضافة المحاضرة!');
                        } else {
                            alert('أدخل اسم المادة والمدرس!');
                        }
                    });
                    addBtn.hasListener = true;
                }
            } else {
                document.getElementById('studentView').style.display = 'block';
                buildTable('scheduleTable', 'tableBody', false);
                setupWeekCalendar();
                setupSearch();
            }
        } else {
            console.log('Login failed');
            errorDiv.textContent = 'اسم المستخدم أو كلمة المرور خاطئة! جرب: student / 123 أو admin / adminpass';
            errorDiv.style.display = 'block';
        }
    });

    // أزرار الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            location.reload();
        });
    }
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            location.reload();
        });
    }

    // تحقق من الجلسة المحفوظة عند التحميل
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        console.log('Found saved user:', savedUser);
        document.getElementById('loginPage').style.display = 'none';
        loadSchedule();
        if (savedUser === 'admin') {
            document.getElementById('adminView').style.display = 'block';
            buildTable('adminTable', 'adminTableBody', true);
            setupWeekCalendar();
            // إضافة event listener للـ addLecture إذا مش موجود
            const addBtn = document.getElementById('addLecture');
            if (addBtn && !addBtn.hasListener) {
                addBtn.addEventListener('click', () => {
                    const day = document.getElementById('daySelect').value;
                    const time = document.getElementById('timeSelect').value;
                    const subject = document.getElementById('subjectInput').value.trim();
                    const teacher = document.getElementById('teacherInput').value.trim();
                    const room = document.getElementById('roomInput').value.trim() || '';
                    if (subject && teacher) {
                        if (!schedule[day]) schedule[day] = {};
                        schedule[day][time] = { subject, teacher, room };
                        document.getElementById('subjectInput').value = '';
                        document.getElementById('teacherInput').value = '';
                        document.getElementById('roomInput').value = '';
                        saveSchedule();
                        buildTable('adminTable', 'adminTableBody', true);
                        showNotification('تم إضافة المحاضرة!');
                    } else {
                        alert('أدخل اسم المادة والمدرس!');
                    }
                });
                addBtn.hasListener = true;
            }
        } else {
            document.getElementById('studentView').style.display = 'block';
            buildTable('scheduleTable', 'tableBody', false);
            setupWeekCalendar();
            setupSearch();
        }
    }
});