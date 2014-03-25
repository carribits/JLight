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

    Appliance.setUpAppliance = function(appliances, sharedAppliances) {
        var applianceList = [];

        if (sharedAppliances !== undefined) {
            for (var a = 0; a < sharedAppliances.length; a++) {
                appliances = appliances.concat(sharedAppliances[a]);
            }
        }

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
                    hours = appliance['hours'] * 30;
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
            watt += appliance['watt'] * appliance['quantity'] * (hours * appliance['duty_cycle']);
            kwh += (watt / 1000);
        }
        cost = rate * kwh;
        var result = {
            count: count,
            cost: cost.toFixed(2),
            watt: (watt / 1000).toFixed(2)
        };
        return result;
    };

    var lighting = [
        {name: "Compact Fluorescent Light Bulbs (CFLs)", hours: 5, watt: 14, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Incandescent Light Bulb (100 Watt)", hours: 5, watt: 100, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Incandescent Light Bulb (60 Watt)", hours: 5, watt: 60, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Incandescent Light Bulb (40 Watt)", hours: 5, watt: 40, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Incandescent Light Bulb (15 Watt)", hours: 5, watt: 15, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ];

    var entertainment = [
        {name: "LCD/LED Display or TV Screen", hours: 5, watt: 30, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "CRT Monitor", watt: 75, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Game Console", hours: 5, watt: 90, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "DVR", watt: 51, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ];

    var heating = [
        {name: "Space Heater", watt: 1500, hours: 5, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Water Heater", watt: 4000, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
    ];

    var cooling = [
        {name: "Air Conditioner", watt: 1000, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Central Air Conditioner", watt: 3500, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Ceiling Fan", watt: 75, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ];

    var cleaning = [
        {name: "Vacuum", watt: 1400, hours: 0.1666, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ];

    var computing = [
        {name: "Desktop Computer", watt: 100, hours: 6, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Printer", watt: 40, hours: 0.25, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Cordless Phone", watt: 2, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Alarm Clock Radio", watt: 2, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ];

    var internet = [
        {name: "Wi-Fi Router", watt: 6, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ];

    var general = [
        {name: "Cell Phone Charger", watt: 5, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ];

    var kitchen = Appliance.setUpAppliance([
        {name: "Cooking Stove Top", watt: 1500, hours: 2, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "computer"},
        {name: "Electric Oven", watt: 2400, hours: 1, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "oven"},
        {name: "Dishwasher", watt: 1800, hours: 1, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "dishwasher"},
        {name: "Refrigerator", watt: 180, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 0.5, ballast_factor: 1, icon: "refrigerator"},
        {name: "Freezer", watt: 200, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 0.5, ballast_factor: 1, icon: "refrigerator"},
        {name: "Coffee Maker", watt: 800, hours: 0.33, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "coffee_maker"},
        {name: "Microwave", watt: 1200, hours: 0.5, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "microwave"},
        {name: "Toaster", watt: 1200, hours: 0.2, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "toaster"}
    ], [lighting]);


    var homeoffice = Appliance.setUpAppliance([
        {name: "Computer", watt: 200, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "computer"},
        {name: "Laptop, Notebook or Netbook", watt: 60, hours: 6, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "computer"},
        {name: "CRT Monitor", watt: 75, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ], [computing, general, internet, entertainment, lighting]);

    var bedroom = Appliance.setUpAppliance([
    ], [cooling, entertainment, cleaning, lighting]);

    var livingroom = Appliance.setUpAppliance([
        {name: "Electric Furnace", watt: 18000, hours: 2, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ], [entertainment, internet, general, cleaning, lighting]);

    var washroom = Appliance.setUpAppliance([
        {name: "Electrical Iron", watt: 1100, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Clothes Washer", watt: 500, hours: 0.25, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Clothes Dryer", watt: 3000, hours: 0.25, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Iron", watt: 1100, hours: 0.25, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ], [lighting]);

    var bathroom = Appliance.setUpAppliance([
        {name: "Hair Dryer", watt: 1500, hours: 0.1666, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ], [heating, lighting]);

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
