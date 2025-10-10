console.log('Script.js loaded!');  // للاختبار

// البيانات الأساسية
const times = ['8:00', '9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00'];
const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

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
    
    // بيانات تجريبية إذا فاضي
    if (Object.keys(schedule).length === 0) {
        schedule.mon = { '10:00': { subject: 'رياضيات', teacher: 'د. أحمد', room: 'A101' } };
        schedule.tue = { '9:00': { subject: 'فيزياء', teacher: 'د. سارة', room: 'B202' } };
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

// بناء الجدول
function buildTable(tableId, bodyId, editable = false) {
    console.log('Building table for', tableId);
    const tbody = document.getElementById(bodyId);
    if (!tbody) {
        console.error('Tbody not found:', bodyId);
        return;
    }
    tbody.innerHTML = '';

    times.forEach(time => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${time}</td>`;
        
        days.forEach(day => {
            const cell = document.createElement('td');
            const data = schedule[day] && schedule[day][time] ? schedule[day][time] : null;
            
            if (data) {
                cell.classList.add('lecture');
                cell.innerHTML = `
                    <div>${data.subject}</div>
                    <small>${data.teacher} - ${data.room || 'غير محدد'}</small>
                `;
                if (editable) {
                    cell.innerHTML += `
                        <br>
                        <button class="btn btn-sm btn-warning" onclick="editLecture('${day}', '${time}')">تعديل</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteLecture('${day}', '${time}')">حذف</button>
                    `;
                } else {
                    cell.style.cursor = 'pointer';
                    cell.onclick = () => alert(`المادة: ${data.subject}\nالمدرس: ${data.teacher}\nالغرفة: ${data.room || 'غير محدد'}`);
                }
            } else if (editable) {
                cell.innerHTML = '<small>اضغط لإضافة</small>';
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

// إعداد البحث (للطلاب)
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

// إعداد التقويم الأسبوعي (widget)
function setupWeekCalendar() {
    const calendar = document.getElementById('weekCalendar');
    if (calendar) {
        calendar.innerHTML = '';
        days.forEach((day, i) => {
            const div = document.createElement('div');
            div.className = 'col-md-1 p-2 bg-light m-1 rounded';
            const count = schedule[day] ? Object.keys(schedule[day]).length : 0;
            div.innerHTML = `<strong>${dayNames[i]}</strong><br><small>${count} محاضرات</small>`;
            calendar.appendChild(div);
        });
        console.log('Calendar setup done');
    }
}

// إشعارات (widget)
function showNotification(msg, type = 'success') {
    const notif = document.getElementById('notifications');
    if (notif) {
        notif.textContent = msg;
        notif.className = `alert alert-${type} mt-3`;
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