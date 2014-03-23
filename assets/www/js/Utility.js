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

    Appliance.getAppliance = function getAppliance(room, appid) {
        var appliances = DefaultAppliances[room];
        for (var i = 0; i < appliances.length; i++) {
            var appliance = appliances[i];
            if (appliance['key'] === appid) {
                appliance['room'] = room;
                return appliance;
            }
        }
        return null;
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

    Appliance.getStoredAppliance = function(room, key) {
        var storageIndex = room + '_appliances';
        var storedAppliances = Storage.readJson(storageIndex);
        var storedAppliance = storedAppliances[key];
        return storedAppliance;
    };

    Appliance.deleteStoredAppliance = function(room, key) {
        var storageIndex = room + '_appliances';
        var storedAppliances = Storage.readJson(storageIndex);

        delete storedAppliances[key];
        Storage.writeJson(storageIndex, storedAppliances);
    };

    Appliance.saveAppliance = function(params, room, key) {
        var storageIndex = room + '_appliances';
        var appliances = Storage.readJson(storageIndex);
        if (appliances === null) {
            appliances = {};
        }

        appliances[key] = params;
        Storage.writeJson(storageIndex, appliances);
    };

    Appliance.deleteRoomAppliance = function(context) {
        var key = $(context).attr('data-appid');
        var room = $(context).attr('data-room');

        Appliance.deleteStoredAppliance(room, key);
        $('#' + key).remove();
    };

    Appliance.getRoomInfo = function(room) {
        var rate = 27;
        var kwh = 0;
        var count = 0;
        var watt = 0;
        var hours = 0;
        var cost = 0;
        var storageIndex = room + '_appliances';
        var appliances = Storage.readJson(storageIndex);

        for (var key in appliances) {
            var appliance = appliances[key];
            count += appliance['quantity'];

            switch (appliance['usage']) {
                case 'daily':
                    hours = ((appliance['hours'] * 7) * 4);
                    break;
                case 'weekly':
                    hours = (appliance['hours']) * 4;
                    break;
                case 'monthly':
                    hours = appliance['hours'];
                    break;
                default:
                    hours = 0;
            }
            watt += appliance['watt'] * appliance['quantity'] * hours;
            kwh += (watt / 1000) * appliance['duty_cycle'];
        }
        cost = rate * kwh;
        var result = {
            count: count,
            cost: cost.toFixed(2),
            watt: (watt / 1000).toFixed(2)
        };
        return result;
    };

    var kitchen = Appliance.setUpAppliance([
        {name: "Electric Oven", watt: 2300, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "oven", },
        {name: "Microwave", watt: 1150, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "microwave"},
        {name: "Coffee maker", watt: 120, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "coffee_maker"},
        {name: "Dishwasher", watt: 1500, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "dishwasher"},
        {name: "Toaster oven", watt: 750, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "toaster"},
        {name: "Refrigerator (small < 12 cuft)", hours_fixed: 730, watt: 130, usage_list: ['monthly'], duty_cycle: 0.7, ballast_factor: 1, icon: "refrigerator"},
        {name: "Refrigerator (medium 15-17 cuft)", hours_fixed: 730, watt: 170, usage_list: ['monthly'], duty_cycle: 0.7, ballast_factor: 1, icon: "refrigerator"},
        {name: "Refrigerator (large 21-25 cuft)", hours_fixed: 730, watt: 210, usage_list: ['monthly'], duty_cycle: 0.7, ballast_factor: 1, icon: "refrigerator"},
        {name: "Freezer (small < 10 cuft)", hours_fixed: 730, watt: 100, usage_list: ['monthly'], duty_cycle: 0.7, ballast_factor: 1, icon: "refrigerator"},
        {name: "Freezer (medium 17 cuft)", hours_fixed: 730, watt: 170, usage_list: ['monthly'], duty_cycle: 0.7, ballast_factor: 1, icon: "refrigerator"},
        {name: "Freezer (large > 17 cuft)", hours_fixed: 730, watt: 220, usage_list: ['monthly'], duty_cycle: 0.7, ballast_factor: 1, icon: "refrigerator"}
    ]);


    var homeoffice = Appliance.setUpAppliance([
        {name: "Computer", watt: 200, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "computer"},
        {name: "Laptop", watt: 60, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "computer"}
    ]);

    var bedroom = Appliance.setUpAppliance([
    ]);

    var livingroom = Appliance.setUpAppliance([
    ]);

    var washroom = Appliance.setUpAppliance([
    ]);

    var bathroom = Appliance.setUpAppliance([
        {name: "Hair dryer", watt: 1500, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Curling iron", watt: 50, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Whirlpool tub", watt: 1800, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Sweep pump (3/4 hp)", watt: 560, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Filter pump (1-1/2 hp)", watt: 1120, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Filter pump (2 hp)", watt: 1500, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Electric water heater", watt: 500, usage_list: ['monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Electric heater (1500 W)", watt: 1500, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Electric heater (5500 W)", watt: 5500, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ]);

    var DefaultAppliances = {
        homeoffice: homeoffice,
        bathroom: bathroom,
        bedroom: bedroom,
        kitchen: kitchen,
        livingroom: livingroom,
        washroom: washroom
    };

    return {
        Storage: Storage,
        DefaultAppliances: DefaultAppliances,
        Appliance: Appliance,
        Utility: Utility
    };
});
