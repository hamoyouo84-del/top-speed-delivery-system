// --- 1. نظام التحميل (Loader) ---
const loaderLogic = {
    init: () => {
        const counter = document.getElementById('counter');
        const status = document.getElementById('status');
        const wrapper = document.getElementById('loaderWrapper');
        const main = document.getElementById('mainSystem');
        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 5) + 2;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                if(status) status.innerText = "ACCESS GRANTED";
                setTimeout(() => {
                    if(wrapper) wrapper.style.display = 'none';
                    if(main) main.style.display = 'flex';
                    document.body.classList.remove('overflow-hidden');
                }, 500);
            }
            if(counter) counter.innerText = progress + '%';
        }, 30);
    }
};

// --- 2. نظام قاعدة البيانات (Database) ---
const DB = {
    save: (key, val) => localStorage.setItem('ts_' + key, JSON.stringify(val)),
    load: (key) => {
        const data = localStorage.getItem('ts_' + key);
        try { return data ? JSON.parse(data) : null; } catch { return null; }
    }
};

// --- 3. المتغيرات الأساسية ---
let orders = DB.load('orders') || [];
let drivers = DB.load('drivers') || [];
let dailyTotal = parseFloat(DB.load('total')) || 0;

// --- 4. الدالات الأساسية ---

// تحديث واجهة المناديب
function updateDriverUI() {
    const grid = document.getElementById('driversGrid');
    const select = document.getElementById('driverSelect');
    if(!grid || !select) return;

    grid.innerHTML = '';
    select.innerHTML = '<option value="" disabled selected>-- اختر المندوب --</option>';

    drivers.forEach((d, index) => {
        // إضافة للمستطيلات
        grid.innerHTML += `
            <div class="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
                <div><p class="font-bold text-slate-800">${d.name}</p><p class="text-xs text-slate-500">كود: ${d.code}</p></div>
                <button onclick="deleteDriver(${index})" class="text-red-400 hover:text-red-600"><i class="fas fa-trash-alt"></i></button>
            </div>`;
        // إضافة للقائمة المنسدلة
        const opt = document.createElement('option');
        opt.value = d.code;
        opt.innerText = d.name;
        select.appendChild(opt);
    });
}

function deleteDriver(index) {
    if(confirm("حذف هذا المندوب؟")) {
        drivers.splice(index, 1);
        DB.save('drivers', drivers);
        updateDriverUI();
    }
}

// إضافة أوردر جديد
function addNewOrder() {
    const rest = document.getElementById('restName').value.trim();
    const address = document.getElementById('orderAddress').value.trim();
    const price = parseFloat(document.getElementById('orderPrice').value);
    const dCode = document.getElementById('driverSelect').value;

    if(!rest || !address || !price || !dCode) return alert("اكمل البيانات أولاً");

    const driverName = drivers.find(d => d.code === dCode).name;

    const newOrder = {
        id: Date.now(),
        rest, address, price, 
        driverCode: dCode,
        driverName: driverName,
        status: 'معلق'
    };

    orders.push(newOrder);
    DB.save('orders', orders);
    
    dailyTotal += price;
    DB.save('total', dailyTotal);
    document.getElementById('dailyIncome').innerText = dailyTotal.toLocaleString();

    renderOrders();
    // تصفير الخانات
    document.getElementById('restName').value = '';
    document.getElementById('orderAddress').value = '';
    document.getElementById('orderPrice').value = '';
}

// عرض الأوردرات
function renderOrders() {
    const body = document.getElementById('ordersTableBody');
    if(!body) return;
    body.innerHTML = '';

    orders.forEach((o) => {
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`;
        const statusClass = o.status === 'تم التسليم' ? 'status-done' : 'status-pending';

        body.innerHTML += `
            <tr class="border-b hover:bg-slate-50 transition">
                <td class="p-4 font-bold">${o.rest}</td>
                <td class="p-4">
                    <div class="flex flex-col">
                        <span class="text-xs text-slate-600">${o.address}</span>
                        <a href="${mapUrl}" target="_blank" class="text-blue-500 text-[10px] font-bold mt-1"><i class="fas fa-map-marker-alt"></i> الخريطة</a>
                    </div>
                </td>
                <td class="p-4 font-bold text-blue-600">${o.price} EGP</td>
                <td class="p-4 font-bold">${o.driverName}</td>
                <td class="p-4 text-center">
                    <button onclick="toggleStatus(${o.id})" class="px-3 py-1 rounded-lg text-[10px] ${statusClass}">${o.status}</button>
                </td>
            </tr>`;
    });
}

function toggleStatus(id) {
    const order = orders.find(o => o.id === id);
    if(order) {
        order.status = (order.status === 'معلق') ? 'تم التسليم' : 'معلق';
        DB.save('orders', orders);
        renderOrders();
    }
}

function showSection(id) {
    document.getElementById('ordersSection').classList.add('hidden');
    document.getElementById('driversSection').classList.add('hidden');
    document.getElementById(id + 'Section').classList.remove('hidden');
}

// --- 5. تشغيل النظام عند التحميل ---
document.addEventListener('DOMContentLoaded', () => {
    loaderLogic.init();
    updateDriverUI();
    renderOrders();
    if(document.getElementById('dailyIncome')) {
        document.getElementById('dailyIncome').innerText = dailyTotal.toLocaleString();
    }
});

