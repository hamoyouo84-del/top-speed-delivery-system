// --- الجزء الخاص بصفحة التحميل (Hacker Loader) ---
const counterElement = document.getElementById('counter');
const statusElement = document.getElementById('status');
const loaderContainer = document.getElementById('loaderContainer');
const loaderWrapper = document.getElementById('loaderWrapper');
const mainSystem = document.getElementById('mainSystem');

let count = 0;

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function updateLoader() {
    if (count < 100) {
        let increment = (Math.random() > 0.8) ? 2 : 1;
        count = Math.min(count + increment, 100);
        counterElement.innerText = count + '%';

        if (count === 30) statusElement.innerText = "Verifying...";
        if (count === 70) statusElement.innerText = "Optimizing...";
        if (count === 90) statusElement.innerText = "Finalizing...";

        let speed = getRandom(20, 100);
        if (count > 95) speed = 250;
        setTimeout(updateLoader, speed);
    } else {
        finishLoading();
    }
}

function finishLoading() {
    statusElement.innerText = "ACCESS GRANTED";
    loaderContainer.classList.add('finished');
    
    // إخفاء الـ Loader وإظهار السيستم بعد ثانية واحدة
    setTimeout(() => {
        loaderWrapper.style.display = 'none';
        mainSystem.style.display = 'flex';
        document.body.classList.remove('overflow-hidden');
    }, 1200);
}

// تشغيل الـ Loader عند فتح الصفحة
setTimeout(updateLoader, 500);


// --- الجزء الخاص بنظام Top Speed ---
let orders = [];
let drivers = [];
let dailyTotal = 0;

function addNewDriver() {
    const name = document.getElementById('newDriverName').value.trim();
    const code = document.getElementById('newDriverCode').value.trim();
    if(!name || !code) return alert("أدخل بيانات المندوب!");
    drivers.push({ name, code });
    updateDriverUI();
    document.getElementById('newDriverName').value = '';
    document.getElementById('newDriverCode').value = '';
}

function updateDriverUI() {
    const grid = document.getElementById('driversGrid');
    const select = document.getElementById('driverSelect');
    grid.innerHTML = '';
    select.innerHTML = '<option value="" disabled selected>-- اختر المندوب --</option>';
    drivers.forEach(d => {
        const opt = document.createElement('option');
        opt.value = `${d.code}|${d.name}`;
        opt.innerText = `${d.name} (${d.code})`;
        select.appendChild(opt);
        grid.innerHTML += `<div class="bg-white p-4 rounded-xl border-b-4 border-blue-600 shadow flex justify-between items-center"><span class="font-black">${d.name}</span><span class="text-xs bg-slate-100 p-1 rounded font-mono">${d.code}</span></div>`;
    });
}

function addNewOrder() {
    const rest = document.getElementById('restName').value;
    const price = document.getElementById('orderPrice').value;
    const driverVal = document.getElementById('driverSelect').value;
    if(!rest || !price || !driverVal) return alert("أكمل البيانات!");
    const [dCode, dName] = driverVal.split('|');
    orders.push({ id: Date.now(), rest, price: parseFloat(price), driverCode: dCode, driverName: dName, status: 'pending' });
    renderOrders();
    document.getElementById('restName').value = '';
    document.getElementById('orderPrice').value = '';
}

function updateStatus(id, nextStatus) {
    const order = orders.find(o => o.id === id);
    if(nextStatus === 'delivered' && order.status !== 'delivered') {
        dailyTotal += order.price;
        document.getElementById('dailyIncome').innerText = dailyTotal.toLocaleString();
    }
    order.status = nextStatus;
    renderOrders();
}

function deleteOrder(id) {
    const order = orders.find(o => o.id === id);
    if(order.status === 'delivered') dailyTotal -= order.price;
    orders = orders.filter(o => o.id !== id);
    document.getElementById('dailyIncome').innerText = dailyTotal.toLocaleString();
    renderOrders();
}

function renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';
    orders.forEach(order => {
        let badge = '', btn = '';
        if(order.status === 'pending') {
            badge = '<span class="text-orange-500 font-bold italic">معلق</span>';
            btn = `<button onclick="updateStatus(${order.id}, 'moving')" class="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs">تحرك</button>`;
        } else if(order.status === 'moving') {
            badge = '<span class="text-blue-500 font-bold italic">في الطريق</span>';
            btn = `<button onclick="updateStatus(${order.id}, 'delivered')" class="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs">تم التسليم</button>`;
        } else {
            badge = '<span class="text-green-600 font-bold italic">مكتمل ✓</span>';
            btn = `<span class="text-slate-300 text-xs uppercase">انتهى</span>`;
        }
        tbody.innerHTML += `<tr class="border-b"><td class="p-4 font-bold uppercase italic">${order.rest}</td><td class="p-4 font-black">${order.price}</td><td class="p-4 text-xs font-bold">${order.driverName}</td><td class="p-4">${badge}</td><td class="p-4 flex gap-2 justify-center">${btn}<button onclick="deleteOrder(${order.id})" class="text-red-300"><i class="fas fa-trash"></i></button></td></tr>`;
    });
}

function showSection(section) {
    document.getElementById('ordersSection').classList.toggle('hidden', section !== 'orders');
    document.getElementById('driversSection').classList.toggle('hidden', section !== 'drivers');
}

