define([], function() {
    var Storage = function() {

    };

    Storage.prototype = {
    };

    Storage.write = function(key, value) {
        window.localStorage.setItem(key, value);

        console.log(Storage);
    };

    Storage.writeJson = function(key, value) {
        window.localStorage.setItem(key, JSON.stringify(value));
    };

    Storage.read = function(key) {
        return window.localStorage.getItem(key);
    };

    Storage.readJson = function(key) {
        return JSON.parse(window.localStorage.getItem(key));
    };

    var kitchen = [
        {name: "Electric Oven", watt: 2300, usage: "hourly", icon: "oven"},
        {name: "Microwave oven", watt: 750, usage: "hourly", icon: "microwave"},
        {name: "Coffee maker", watt: 120, usage: "hourly", icon: "coffee_maker"},
        {name: "Dishwasher", watt: 1500, usage: "hourly", icon: "dishwasher"},
        {name: "Toaster oven", watt: 750, usage: "hourly", icon: "toaster"},
        {name: "Refrigerator (frost-free), 15 cu. Ft. (1996 unit)", watt: 150000, usage: "monthly", icon: "refrigerator"},
        {name: "Freezer (manual defrost), 15 cu. Ft. (old unit)", watt: 90000, usage: "monthly", icon: "refrigerator"},
        {name: "Refrigerator (frost-free), 15 cu. Ft. (1996 unit)", watt: 50000, usage: "monthly", icon: "refrigerator"},
        {name: "Refrigerator (frost-free), 20 cu. Ft. (1996 unit)", watt: 54000, usage: "monthly", icon: "refrigerator"},
        {name: "Refrigerator, 1.7 cu. Ft.", watt: 30000, icon: "refrigerator"},
        {name: "Energy Star Refrigerator, 14 cu. Ft.", watt: 43000, usage: "monthly", icon: "refrigerator"},
        {name: "Energy Star Refrigerator (frost-free), 14 cu. Ft.", watt: 57000, usage: "monthly", icon: "refrigerator"},
        {name: "Energy Star Refrigerator (frost-free), 17 cu. Ft.", watt: 73000, usage: "monthly", icon: "refrigerator"},
        {name: "Energy Star Refrigerator (frost-free), 19 cu. Ft.", watt: 80000, usage: "monthly", icon: "refrigerator"},
        {name: "Energy Star Refrigerator (Side by Side) 21 cu. Ft.", watt: 123000, usage: "monthly", icon: "refrigerator"},
        {name: "Energy Star Refrigerator (frost-free) 24 cu. Ft.", watt: 102000, usage: "monthly", icon: "refrigerator"},
        {name: "Energy Star Refrigerator (Side by Side) 25 cu. Ft.", watt: 132000, usage: "monthly", icon: "refrigerator"}
    ];

    var homeoffice = [
      
    ];

    var DefaultAppliances = {
        kitchen: kitchen,
        homeoffice: homeoffice
    };

    return {
        Storage: Storage,
        DefaultAppliances: DefaultAppliances
    };
});
