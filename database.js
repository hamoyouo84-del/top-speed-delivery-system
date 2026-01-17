const TopSpeedDB = {
    save: (key, data) => localStorage.setItem('ts_' + key, JSON.stringify(data)),
    load: (key) => JSON.parse(localStorage.getItem('ts_' + key)),
    clear: () => {
        if(confirm("هل أنت متأكد من تصفير النظام؟")) {
            localStorage.clear();
            location.reload();
        }
    }
};
