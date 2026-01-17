// auth.js
const SITE_CONFIG = { user: "Admin", pass: "1234" };

function initSecurity() {
    if (sessionStorage.getItem('isAuthorized') !== 'true') {
        const u = prompt("اسم المستخدم:");
        const p = prompt("كلمة المرور:");
        if (u === SITE_CONFIG.user && p === SITE_CONFIG.pass) {
            sessionStorage.setItem('isAuthorized', 'true');
        } else {
            alert("بيانات خاطئة!");
            window.location.reload();
        }
    }
}
// تشغيل الحماية فوراً
initSecurity();
