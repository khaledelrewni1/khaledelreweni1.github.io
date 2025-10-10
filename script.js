// بيانات افتراضية للساعات
const times = ['8:00', '9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00'];
const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// Firebase collection للجدول
const scheduleCollection = collection(window.db, 'schedule');

// كلمات المرور البسيطة (غيرها في الإنتاج، استخدم Firebase Auth للأمان)
const validLogins = {
    student: '123',  // للطلاب
    admin: 'adminpass'  // لك
};

// تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    if (validLogins[username] && validLogins[username] === password) {
        localStorage.setItem('user', username);  // حفظ الجلسة محليًا
        errorDiv.style.display = 'none';
        document.getElementById('loginPage').style.display = 'none';
        
        if (username === 'admin') {
            document.getElementById('adminView').style.display = 'block';
            loadAdminSchedule();
        } else {
            document.getElementById('studentView').style.display = 'block';
            loadStudentSchedule();
        }
        setupWidgets();  // إعداد widgets
    } else {
        errorDiv.textContent = 'اسم المستخدم أو كلمة المرور خاطئة!';
        errorDiv.style.display = 'block';
    }
});

// تحميل الجدول (نفس الوظيفة للطالب والأدمن، بس الأدمن يقدر يعدل)
async function loadSchedule(tableId, bodyId, editable = false) {
    const table = document.getElementById(tableId);
    const tbody = document.getElementById(bodyId);
    tbody.innerHTML = '';

    // جلب البيانات من Firebase
    const querySnapshot = await getDocs(scheduleCollection);
    const schedule = {};
    querySnapshot.forEach