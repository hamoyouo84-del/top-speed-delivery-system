// --- 1. تعريف البيانات أولاً (قبل أي شيء) ---
let drivers = [];
let orders = [];
let total = 0;

// نظام قاعدة البيانات المصغر
const TopSpeedDB = {
    save: (key, data) => {
        localStorage.setItem('ts_' + key, JSON.stringify(data));
    },
    load: (key) => {
        const data = localStorage.getItem('ts_' + key);
        return data ? JSON.parse(data) : [];
    }
};

// --- 2. دالة تشغيل النظام (Initialization) ---
function initSystem() {
    drivers = TopSpeedDB.load('drivers');
    orders = TopSpeedDB.load('orders');
    total = parseFloat(localStorage.getItem('ts_total')) || 0;

    updateDriverUI();
    renderOrders();
    
    const incomeEl = document.getElementById('dailyIncome');
    if(incomeEl) incomeEl.innerText = total.toLocaleString();
}

// --- 3. الدوال الأساسية (إضافة مندوب - إضافة أوردر) ---

function addNewDriver() {
    const nameEl = document.getElementById('newDriverName');
    const codeEl = document.getElementById('newDriverCode');

    if(!nameEl || !codeEl || !nameEl.value.trim() || !codeEl.value.trim()) {
        alert("برجاء إدخال اسم المندوب وكوده");
        return;
    }

    const newDriver = {
        name: nameEl.value.trim(),
        code: codeEl.value.trim()
    };

    drivers.push(newDriver);
    TopSpeedDB.save('drivers', drivers);
    
    updateDriverUI(); // تحديث القائمة فوراً
    
    nameEl.value = '';
    codeEl.value = '';
    alert("تم إضافة المندوب بنجاح");
}

function updateDriverUI() {
    const grid = document.getElementById('driversGrid');
    const select = document.getElementById('driverSelect');
    
    if(grid) grid.innerHTML = '';
    if(select) select.innerHTML = '<option value="" disabled selected>-- اختر المندوب --</option>';
    
    drivers.forEach((d, i) => {
        if(grid) {
            grid.innerHTML += `
                <div class="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm">
                    <b>${d.name} <span class="text-gray-400 text-xs">(${d.code})</span></b>
                    <button onclick="deleteDriver(${i})" class="text-red-500 p-2"><i class="fas fa-trash"></i></button>
                </div>`;
        }
        if(select) {
            const opt = document.createElement('option');
            opt.value = d.code;
            opt.innerText = d.name;
            select.appendChild(opt);
        }
    });
}

// دالة حذف المندوب
function deleteDriver(i) {
    if(confirm("هل تريد حذف هذا المندوب؟")) {
        drivers.splice(i, 1);
        TopSpeedDB.save('drivers', drivers);
        updateDriverUI();
    }
}

// --- بقية الدوال (اللودر، الأوردرات، إلخ) ---

function forceOpenSystem() {
    const loader = document.getElementById('loaderWrapper');
    const system = document.getElementById('mainSystem');
    if(loader) loader.style.display = 'none';
    if(system) system.style.display = 'flex';
    document.body.classList.remove('overflow-hidden');
}

let count = 0;
function updateLoader() {
    const counter = document.getElementById('counter');
    if (count < 100) {
        count += 5;
        if(counter) counter.innerText = count + "%";
        setTimeout(updateLoader, 30);
    } else {
        forceOpenSystem();
    }
}

// تشغيل اللودر والبيانات عند فتح الصفحة
window.addEventListener('DOMContentLoaded', () => {
    updateLoader();
    initSystem();
});

// دالة إضافة الأوردر (تأكد أنها مطابقة لأسماء الـ id عندك)
function addNewOrder() {
    const rest = document.getElementById('restName');
    const addr = document.getElementById('orderAddress');
    const price = document.getElementById('orderPrice');
    const dSelect = document.getElementById('driverSelect');

    if(!rest.value || !addr.value || !price.value || !dSelect.value) {
        alert("أكمل بيانات الأوردر");
        return;
    }

    const order = {
        id: Date.now(),
        rest: rest.value,
        addr: addr.value,
        price: parseFloat(price.value),
        dCode: dSelect.value,
        status: 'معلق'
    };

    orders.push(order);
    TopSpeedDB.save('orders', orders);
    
    total += order.price;
    localStorage.setItem('ts_total', total);
    document.getElementById('dailyIncome').innerText = total.toLocaleString();
    
    renderOrders();
    rest.value = ''; addr.value = ''; price.value = '';
}

function renderOrders() {
    const body = document.getElementById('ordersTableBody');
    if(!body) return;
    body.innerHTML = '';
    orders.forEach(o => {
        const d = drivers.find(drv => drv.code == o.dCode);
        body.innerHTML += `
            <tr class="border-b text-sm">
                <td class="p-4 font-bold">${o.rest}</td>
                <td class="p-4">${o.addr}</td>
                <td class="p-4">${o.price} EGP</td>
                <td class="p-4">${d ? d.name : '---'}</td>
                <td class="p-4 text-center">
                    <span class="px-2 py-1 rounded-full text-[10px] bg-yellow-100 text-yellow-700">${o.status}</span>
                </td>
            </tr>`;
    });
}

function showSection(id) {
    document.getElementById('ordersSection').classList.add('hidden');
    document.getElementById('driversSection').classList.add('hidden');
    document.getElementById(id + 'Section').classList.remove('hidden');
}
