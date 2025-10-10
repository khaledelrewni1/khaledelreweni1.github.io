let scheduleData = JSON.parse(localStorage.getItem('scheduleData')) || [ /* نفس البيانات من script.js */ ];
let adminCalendar;

const adminPassword = 'admin';  // غيرها
const adminUser = 'admin';

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('adminLogin');
    modal.classList.add('show');  // أنيم
