// دالة للتأكد من أن النظام سيفتح مهما حدث خطأ
function forceOpenSystem() {
    console.log("Force opening system...");
    const loader = document.getElementById('loaderWrapper');
    const system = document.getElementById('mainSystem');
    if(loader) loader.style.setProperty('display', 'none', 'important');
    if(system) system.style.setProperty('display', 'flex', 'important');
    document.body.classList.remove('overflow-hidden');
    document.body.style.overflow = 'auto';
}

// 1. نظام التحميل (Loader) مع مؤقت أمان
let count = 0;
const counter = document.getElementById('counter');

function updateLoader() {
    if (count < 100) {
        count += 2;
        if(counter) counter.innerText = count + "%";
        setTimeout(updateLoader, 20);
    } else {
        forceOpenSystem();
    }
}

// مؤقت أمان: إذا لم يفتح النظام خلال 5 ثوانٍ، افتحه إجبارياً
setTimeout(() => {
    if(document.getElementById('loaderWrapper').style.display !== 'none') {
        console.warn("Safety timer triggered");
        forceOpenSystem();
    }
}, 5000);

// بدء التحميل
updateLoader();

// 2. إدارة البيانات (بشكل آمن جداً)
const TopSpeedDB = {
    save: (key, data) => {
        try { localStorage.setItem('ts_' + key, JSON.stringify(data)); } 
        catch(e) { console.error("Save Error", e); }
    },
    load: (key) => {
        try {
            const data = localStorage.getItem('ts_' + key);
            return data ? JSON.parse(data) : [];
        } catch(e) { return []; }
    },
    clear: () => {
        if(confirm("تصفير البيانات؟")) {
            localStorage.clear();
            location.reload();
        }
    }
};

// 3. المنطق الأساسي للنظام
let orders = TopSpeedDB.load('orders');
let drivers = TopSpeedDB.load('drivers');
let total = parseFloat(localStorage.getItem('ts_total')) || 0;

function updateDriverUI() {
    const grid = document.getElementById('driversGrid');
    const select = document.getElementById('driverSelect');
    if(!grid || !select) return;

    grid.innerHTML = '';
    select.innerHTML = '<option value="" disabled selected>-- اختر المندوب --</option>';
    
    drivers.forEach((d, i) => {
        grid.innerHTML += `
            <div class="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm">
                <b>${d.name} <span class="text-gray-400 text-xs">(${d.code})</span></b>
                <button onclick="deleteDriver(${i})" class="text-red-500 p-2"><i class="fas fa-trash"></i></button>
            </div>`;
        const opt = document.createElement('option');
        opt.value = d.code;
        opt.innerText = d.name;
        select.appendChild(opt);
    });
}

function addNewDriver() {
    const nameEl = document.getElementById('newDriverName');
    const codeEl = document.getElementById('newDriverCode');
    if(!nameEl.value || !codeEl.value) return alert("أكمل بيانات المندوب");
    
    drivers.push({name: nameEl.value, code: codeEl.value});
    TopSpeedDB.save('drivers', drivers);
    updateDriverUI();
    nameEl.value = ''; codeEl.value = '';
}

function deleteDriver(i) {
    if(confirm("حذف المندوب؟")) {
        drivers.splice(i, 1);
        TopSpeedDB.save('drivers', drivers);
        updateDriverUI();
    }
}

function addNewOrder() {
    const rest = document.getElementById('restName');
    const addr = document.getElementById('orderAddress');
    const price = document.getElementById('orderPrice');
    const dCode = document.getElementById('driverSelect');

    if(!rest.value || !addr.value || !price.value || !dCode.value) return alert("اكمل بيانات الأوردر");

    const order = {
        id: Date.now(),
        rest: rest.value,
        addr: addr.value,
        price: parseFloat(price.value),
        dCode: dCode.value,
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
        const driver = drivers.find(d => d.code == o.dCode);
        const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.addr)}`;
        
        body.innerHTML += `
            <tr class="border-b text-sm">
                <td class="p-4 font-bold text-slate-800">${o.rest}</td>
                <td class="p-4">
                    <a href="${map}" target="_blank" class="text-blue-600 hover:underline">
                        <i class="fas fa-map-marker-alt ml-1"></i> ${o.addr}
                    </a>
                </td>
                <td class="p-4 font-bold text-blue-700">${o.price} EGP</td>
                <td class="p-4">${driver ? driver.name : '---'}</td>
                <td class="p-4"><span class="px-2 py-1 rounded-full text-[10px] font-black ${o.status === 'تم' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${o.status}</span></td>
            </tr>`;
    });
}

function showSection(id) {
    document.getElementById('ordersSection').classList.add('hidden');
    document.getElementById('driversSection').classList.add('hidden');
    document.getElementById(id + 'Section').classList.remove('hidden');
}

// تشغيل عند التحميل
window.addEventListener('load', () => {
    updateDriverUI();
    renderOrders();
    const incomeEl = document.getElementById('dailyIncome');
    if(incomeEl) incomeEl.innerText = total.toLocaleString();
});
