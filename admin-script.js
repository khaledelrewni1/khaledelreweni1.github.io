// نفس بيانات الجدول (هتتحمل من localStorage أو يدويًا)
let scheduleData = JSON.parse(localStorage.getItem('scheduleData')) || [
    // نفس البيانات الأولية من script.js
    { subject: 'رياضيات', doctor: 'د. أحمد', place: 'قاعة 101', day: 'الأحد', time: '10:00 - 12:00', notes: 'لا تغييرات' },
    // ... باقي البيانات
];

// كلمة مرور الأدمن (غيرها!)
const adminPassword = 'Masterpiece1%';
const adminUser = 'Khaled';

// تسجيل الدخول للأدمن
document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;
    if (user === adminUser && pass === adminPassword) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        loadAdminTable();
        loadAdminCalendar();
        document.getElementById('adminLastUpdate').textContent = new Date().toLocaleDateString('ar-EG');
    } else {
        document.getElementById('adminError').textContent = 'بيانات أدمن خاطئة!';
    }
});

// تحميل جدول التعديل (قابل للتعديل)
function loadAdminTable() {
    const tbody = document.getElementById('editTableBody');
    tbody.innerHTML = '';
    scheduleData.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.subject}</td>
            <td>${row.doctor}</td>
            <td>${row.place}</td>
            <td><input type="text" value="${row.day}" onchange="updateData(${index}, 'day', this.value)"></td>
            <td><input type="text" value="${row.time}" onchange="updateData(${index}, 'time', this.value)"></td>
            <td><input type="text" value="${row.notes}" onchange="updateData(${index}, 'notes', this.value)"></td>
        `;
        tbody.appendChild(tr);
    });
}

// تحديث البيانات
function updateData(index, field, value) {
    scheduleData[index][field] = value;
}

// حفظ وتحديث (يحفظ في localStorage، ويحدث التقويم)
function saveAndUpdate() {
    localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
    alert('تم الحفظ! الدفعة هتشوف التحديثات فورًا عند إعادة التحميل.');
    loadAdminTable();  // إعادة تحميل للعرض
    loadAdminCalendar();  // تحديث التقويم
}

// تقويم الأدمن (مشابه، بس مع إمكانية إضافة)
function loadAdminCalendar() {
    // نفس كود loadCalendar من script.js، بس أضف:
    document.getElementById('adminCalendar').innerHTML = '<div id="tempCal"></div>'; 
