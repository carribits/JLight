define([], function() {
    /* Storage */
    var Storage = function() {

    };

    Storage.prototype = {
    };

    Storage.write = function(key, value) {
        window.localStorage.setItem(key, value);
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


    /* Utility */
    var Utility = function() {

    };

    Utility.prototype = {
    };

    Utility.isNumeric = function(number) {
        var numberRegex = /^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/;
        if (numberRegex.test(number)) {
            return true;
        }
        return false;
    };

    /* Appliance */
    var Appliance = function() {

    };

    Appliance.prototype = {
    };

    Appliance.getKey = function(str) {
        var key = CryptoJS.SHA256(str).toString();
        return key;
    };

    Appliance.setUpAppliance = function(appliances) {
        var applianceList = [];
        for (var i = 0; i < appliances.length; i++) {
            var appliance = appliances[i];
            appliance['key'] = Appliance.getKey(appliance['name'].toLowerCase() + appliance['watt']);
            applianceList.push(appliance);
        }
        return applianceList;
    };

    var kitchen = Appliance.setUpAppliance([
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
    ]);


    var homeoffice = Appliance.setUpAppliance([
    ]);

    var bedroom = Appliance.setUpAppliance([
    ]);

    var livingroom = Appliance.setUpAppliance([
    ]);

    var washroom = Appliance.setUpAppliance([
    ]);

    var bathroom = Appliance.setUpAppliance([
        {name: "Hair dryer", watt: 1500, usage: "hourly", icon: "default"},
        {name: "Curling iron", watt: 50, usage: "hourly", icon: "default"},
        {name: "Whirlpool tub", watt: 1800, usage: "hourly", icon: "default"},
        {name: "Sweep pump (3/4 hp)", watt: 560, usage: "hourly", icon: "default"},
        {name: "Filter pump (1-1/2 hp)", watt: 1120, usage: "hourly", icon: "default"},
        {name: "Filter pump (2 hp)", watt: 1500, usage: "hourly", icon: "default"},
        {name: "Electric water heater", watt: 500, usage: "monthly", icon: "default"},
        {name: "Electric heater (1500 W)", watt: 1500, usage: "hourly", icon: "default"},
        {name: "Electric heater (5500 W)", watt: 5500, usage: "hourly", icon: "default"}
    ]);

    var DefaultAppliances = {
        homeoffice: homeoffice,
        bathroom: bathroom,
        bedroom: bedroom,
        kitchen: kitchen,
        livingroom: livingroom,
        washroom: washroom
    };

    Appliance.getAppliance = function getAppliance(room, appid) {
        var appliances = DefaultAppliances[room];
        for (var i = 0; i < appliances.length; i++) {
            var appliance = appliances[i];
            if (appliance['key'] === appid) {
                return appliance;
            }
        }
        return null;
    };

    return {
        Storage: Storage,
        DefaultAppliances: DefaultAppliances,
        Appliance: Appliance,
        Utility: Utility
    };
});
