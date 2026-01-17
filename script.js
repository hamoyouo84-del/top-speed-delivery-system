// --- الجزء الخاص بصفحة التحميل (Hacker Loader) ---
const counterElement = document.getElementById('counter');
const statusElement = document.getElementById('status');
const loaderWrapper = document.getElementById('loaderWrapper');
const mainSystem = document.getElementById('mainSystem');

let count = 0;
function updateLoader() {
    if (count < 100) {
        count += 2; // تسريع التحميل قليلاً
        if(count > 100) count = 100;
        counterElement.innerText = count + '%';
        
        if (count === 30) statusElement.innerText = "Verifying...";
        if (count === 70) statusElement.innerText = "Optimizing UI...";
        setTimeout(updateLoader, 30);
    } else {
        // إخفاء الـ Loader وإظهار النظام
        if(loaderWrapper) loaderWrapper.style.display = 'none';
        if(mainSystem) mainSystem.style.display = 'flex';
        document.body.classList.remove('overflow-hidden');
    }
}

// تشغيل اللودر بعد نصف ثانية
setTimeout(updateLoader, 500);

// --- نظام Top Speed المطور ---

// دالة أمان للتأكد من وجود قاعدة البيانات
const getDB = () => {
    return typeof TopSpeedDB !== 'undefined' ? TopSpeedDB : {
        save: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
        load: (k) => JSON.parse(localStorage.getItem(k))
    };
};

let orders = getDB().load('orders') || [];
let drivers = getDB().load('drivers') || [];
let dailyTotal = parseFloat(getDB().load('total')) || 0;

// تحديث الواجهة عند البداية
window.addEventListener('load', () => {
    updateDriverUI();
    renderOrders();
    const incomeEl = document.getElementById('dailyIncome');
    if(incomeEl) incomeEl.innerText = dailyTotal.toLocaleString();
});

// 1. إضافة مندوب جديد
function addNewDriver() {
    const nameInput = document.getElementById('newDriverName');
    const codeInput = document.getElementById('newDriverCode');
    const name = nameInput.value.trim();
    const code = codeInput.value.trim();
    
    if(!name || !code) return alert("أدخل بيانات المندوب!");
    
    drivers.push({ name, code });
    getDB().save('drivers', drivers);
    updateDriverUI();
    
    nameInput.value = '';
    codeInput.value = '';
}

function updateDriverUI() {
    const grid = document.getElementById('driversGrid');
    const select = document.getElementById('driverSelect');
    if(!grid || !select) return;

    grid.innerHTML = '';
    select.innerHTML = '<option value="" disabled selected>-- اختر المندوب --</option>';
    
    drivers.forEach((d, index) => {
        const opt = document.createElement('option');
        opt.value = d.code;
        opt.innerText = `${d.name} (${d.code})`;
        select.appendChild(opt);

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

function deleteDriver(index) {
    if(confirm("هل تريد حذف هذا المندوب؟")) {
        drivers.splice(index, 1);
        getDB().save('drivers', drivers);
        updateDriverUI();
    }
}

// 2. إضافة أوردر جديد
function addNewOrder() {
    const rest = document.getElementById('restName').value.trim();
    const address = document.getElementById('orderAddress').value.trim();
    const priceInput = document.getElementById('orderPrice');
    const price = parseFloat(priceInput.value);
    const driverCode = document.getElementById('driverSelect').value;

    if(!rest || !address || isNaN(price) || !driverCode) return alert("برجاء إكمال كافة البيانات!");

    const driverObj = drivers.find(d => d.code === driverCode);
    const driverName = driverObj ? driverObj.name : "غير معروف";

    const newOrder = {
        id: Date.now(),
        rest,
        address,
        price,
        driverCode,
        driverName,
        status: 'معلق'
    };

    orders.push(newOrder);
    getDB().save('orders', orders);
    
    dailyTotal += price;
    getDB().save('total', dailyTotal);
    document.getElementById('dailyIncome').innerText = dailyTotal.toLocaleString();

    renderOrders();
    
    document.getElementById('restName').value = '';
    document.getElementById('orderAddress').value = '';
    priceInput.value = '';
}

// 3. عرض الأوردرات
function renderOrders() {
    const body = document.getElementById('ordersTableBody');
    if(!body) return;
    body.innerHTML = '';

    orders.forEach((o) => {
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

function showSection(id) {
    document.getElementById('ordersSection').classList.add('hidden');
    document.getElementById('driversSection').classList.add('hidden');
    document.getElementById(id + 'Section').classList.remove('hidden');
}
