// --- الجزء الخاص بصفحة التحميل (Hacker Loader) ---
// (كما هو في كودك الأصلي مع استكمال Logic التشغيل)
const counterElement = document.getElementById('counter');
const statusElement = document.getElementById('status');
const loaderWrapper = document.getElementById('loaderWrapper');
const mainSystem = document.getElementById('mainSystem');

let count = 0;
function updateLoader() {
    if (count < 100) {
        count++;
        counterElement.innerText = count + '%';
        if (count === 30) statusElement.innerText = "Verifying...";
        if (count === 70) statusElement.innerText = "Optimizing UI...";
        setTimeout(updateLoader, 30);
    } else {
        loaderWrapper.style.display = 'none';
        mainSystem.style.display = 'flex';
        document.body.classList.remove('overflow-hidden');
    }
}
setTimeout(updateLoader, 500);

// --- نظام Top Speed المطور ---

// تحميل البيانات من الذاكرة لضمان عدم الضياع
let orders = TopSpeedDB.load('orders') || [];
let drivers = TopSpeedDB.load('drivers') || [];
let dailyTotal = parseFloat(TopSpeedDB.load('total')) || 0;

// تحديث الواجهة عند البداية
window.onload = () => {
    updateDriverUI();
    renderOrders();
    document.getElementById('dailyIncome').innerText = dailyTotal.toLocaleString();
};

// 1. إضافة مندوب جديد
function addNewDriver() {
    const name = document.getElementById('newDriverName').value.trim();
    const code = document.getElementById('newDriverCode').value.trim();
    if(!name || !code) return alert("أدخل بيانات المندوب!");
    
    drivers.push({ name, code });
    TopSpeedDB.save('drivers', drivers); // حفظ
    updateDriverUI();
    
    document.getElementById('newDriverName').value = '';
    document.getElementById('newDriverCode').value = '';
}

function updateDriverUI() {
    const grid = document.getElementById('driversGrid');
    const select = document.getElementById('driverSelect');
    grid.innerHTML = '';
    select.innerHTML = '<option value="" disabled selected>-- اختر المندوب --</option>';
    
    drivers.forEach((d, index) => {
        // تحديث القائمة المنسدلة
        const opt = document.createElement('option');
        opt.value = d.code; // نستخدم الكود كقيمة فريدة
        opt.innerText = `${d.name} (${d.code})`;
        select.appendChild(opt);

        // تحديث شبكة عرض المناديب
        grid.innerHTML += `
            <div class="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
                <div>
                    <p class="font-bold text-slate-800">${d.name}</p>
                    <p class="text-xs text-slate-500 italic">Code: ${d.code}</p>
                </div>
                <button onclick="deleteDriver(${index})" class="text-red-400 hover:text-red-600"><i class="fas fa-trash-alt"></i></button>
            </div>`;
    });
}

// 2. إضافة أوردر جديد (مع العنوان والخريطة)
function addNewOrder() {
    const rest = document.getElementById('restName').value.trim();
    const address = document.getElementById('orderAddress').value.trim();
    const price = parseFloat(document.getElementById('orderPrice').value);
    const driverCode = document.getElementById('driverSelect').value;

    if(!rest || !address || !price || !driverCode) return alert("برجاء إكمال كافة البيانات!");

    // العثور على اسم المندوب من الكود
    const driverName = drivers.find(d => d.code === driverCode).name;

    const newOrder = {
        id: Date.now(),
        rest,
        address,
        price,
        driverCode, // الكود للربط مع سيستم المندوب
        driverName,
        status: 'معلق',
        time: new Date().toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})
    };

    orders.push(newOrder);
    TopSpeedDB.save('orders', orders); // حفظ
    
    // تحديث الإجمالي
    dailyTotal += price;
    TopSpeedDB.save('total', dailyTotal);
    document.getElementById('dailyIncome').innerText = dailyTotal.toLocaleString();

    renderOrders();
    
    // مسح الخانات
    document.getElementById('restName').value = '';
    document.getElementById('orderAddress').value = '';
    document.getElementById('orderPrice').value = '';
}

// 3. عرض الأوردرات في الجدول
function renderOrders() {
    const body = document.getElementById('ordersTableBody');
    body.innerHTML = '';

    orders.forEach((o) => {
        // إنشاء رابط جوجل ماب
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`;
        const statusClass = o.status === 'تم التسليم' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';

        body.innerHTML += `
            <tr class="border-b hover:bg-slate-50 transition">
                <td class="p-4 font-bold text-slate-800">${o.rest}</td>
                <td class="p-4">
                    <div class="flex flex-col">
                        <span class="text-xs text-slate-600 mb-1">${o.address}</span>
                        <a href="${mapUrl}" target="_blank" class="text-blue-500 text-[10px] font-bold flex items-center">
                            <i class="fas fa-map-marker-alt ml-1"></i> فتح الخريطة
                        </a>
                    </div>
                </td>
                <td class="p-4 font-mono font-bold text-blue-600">${o.price} EGP</td>
                <td class="p-4 text-slate-700 font-bold">${o.driverName}</td>
                <td class="p-4 text-center">
                    <span class="px-3 py-1 rounded-lg text-[10px] font-black ${statusClass}">${o.status}</span>
                </td>
            </tr>`;
    });
}

// تنقل الأقسام
function showSection(id) {
    document.getElementById('ordersSection').classList.add('hidden');
    document.getElementById('driversSection').classList.add('hidden');
    document.getElementById(id + 'Section').classList.remove('hidden');
}
