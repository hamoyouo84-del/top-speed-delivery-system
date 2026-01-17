// database.js
const DB = {
    save: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    load: (key) => JSON.parse(localStorage.getItem(key)) || [],
    clear: () => localStorage.clear()
};

// مثال لاستخدامه:
// DB.save('drivers', driversList);

