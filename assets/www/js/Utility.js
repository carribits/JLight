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

    Storage.remove = function(key) {
        return window.localStorage.removeItem(key);
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

    Utility.parseFloat = function(number) {
        if (Utility.isNumeric(number)) {
            return parseFloat(number);
        }
        return 0;
    };

    Utility.alert = function(msg) {
        navigator.notification.alert(msg);
    };

    /* Appliance */
    var Application = function() {

    };

    Application.prototype = {
    };

    Application.view = 'icon';
    Application._id_ = 'power_house';
    Application._version_ = '1.0.0';
    Application.defaultRate = {rate: 0.12, country: 'United States', currency: 'USD', sybmol: '$'};

    Application.saveRate = function(rateInfo) {
        Storage.writeJson(Application._id_ + '_rate', rateInfo);
        Application.setVersion();
    };

    Application.setVersion = function() {
        Storage.writeJson('version', Application._version_);
    };

    Application.getRate = function() {
        var rate = Storage.readJson(Application._id_ + '_rate');
        if (rate === null || rate === undefined) {
            return Application.defaultRate;
        }
        return rate;
    };

    Application.initializeRate = function() {
        var rate = Storage.readJson(Application._id_ + '_rate');
        if (rate === null || rate === undefined) {
            Application.saveRate(Application.defaultRate);
            Application.setVersion();
        }
    };

    Application.applicationConfigured = function() {
        var rate = Storage.readJson(Application._id_ + '_rate');
        return !!(rate !== null & rate !== undefined);
    };

    Application.getCurrency = function() {
        var rateObj = Storage.readJson(Application._id_ + '_rate');

        if (rateObj !== undefined && rateObj !== null) {
            return rateObj.currency;
        }
        return Application.defaultRate.currency;
    };

    Application.getSymbol = function() {
        var currency = Application.getCurrency();
        if (currency === 'GBP') {
            return '£';
        }
        return '$';
    };

    Application.reload = function() {
        location.reload(false);
    };

    Application.clearData = function() {
        Storage.remove('bathroom_appliances');
        Storage.remove('homeoffice_appliances');
        Storage.remove('kitchen_appliances');
        Storage.remove('washroom_appliances');
        Storage.remove('livingroom_appliances');
        Storage.remove('bedroom_appliances');
    };

    var Appliance = function() {

    };

    Appliance.prototype = {
    };

    Appliance.getKey = function(str) {
        var key = CryptoJS.SHA256(str).toString();
        return key;
    };

    Appliance.getConfig = function() {
        var config = Application.getRate();
        return config;
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

    Appliance.getItemCost = function(appliance) {
        var config = Appliance.getConfig();
        var cost = config.rate * Appliance.getItemWatt(appliance);
        return parseFloat(cost);
    };
    Appliance.getItemWatt = function(appliance) {
        var hours = Appliance.getHours(appliance);
        var watt = hours * appliance['quantity'] * (appliance['watt'] / 1000);
        return parseFloat(watt);
    };
    Appliance.getHours = function(appliance) {
        var factor = (appliance['time_unit'] === 'minute') ? (1 / 60) : 1;
        var hours = 0;
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
        return (hours * factor) * appliance['duty_cycle'];
    };
    Appliance.getAppliances = function(room) {
        var storageIndex = room + '_appliances';
        var appliances = Storage.readJson(storageIndex);
        if (appliances === null) {
            appliances = {};
        }
        return appliances;
    };
    Appliance.getRoomInfo = function(room) {
        var config = Appliance.getConfig();
        var rate = config.rate;
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

            hours = Appliance.getHours(appliance);
            watt = appliance['watt'] * appliance['quantity'] * hours;
            kwh += (watt / 1000);
        }
        cost = rate * kwh;

        var result = {
            count: count,
            cost: parseFloat(cost),
            watt: parseFloat(kwh)
        };
        return result;
    };

    var Room = function() {

    };

    Room.prototype = {
    };

    Room.getName = function(key) {
        return rooms[key];
    };

    var lighting = [
        {name: "Compact Fluorescent Light Bulbs (CFL 24 Watt)", hours: 5, watt: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "fluorescent"},
        {name: "Compact Fluorescent Light Bulbs (CFL 18 Watt)", hours: 5, watt: 18, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "fluorescent"},
        {name: "Compact Fluorescent Light Bulbs (CFL 14 Watt)", hours: 5, watt: 14, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "fluorescent"},
        {name: "Incandescent Light Bulb (100 Watt)", hours: 5, watt: 100, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "incandescent"},
        {name: "Incandescent Light Bulb (60 Watt)", hours: 5, watt: 60, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "incandescent"},
        {name: "Incandescent Light Bulb (40 Watt)", hours: 5, watt: 40, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "incandescent"},
        {name: "Incandescent Light Bulb (15 Watt)", hours: 5, watt: 15, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "incandescent"}
    ];

    var entertainment = [
        {name: "LCD/LED Display or TV Screen (15 - 21 Inches)", hours: 5, watt: 30, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "tv"},
        {name: "LCD/LED Display or TV Screen (22 - 37 Inches)", hours: 5, watt: 65, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "tv"},
        {name: "LCD/LED Display or TV Screen (42 - 50 Inches)", hours: 5, watt: 100, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "tv"},
        {name: "CRT TV Screen (15 - 19 Inches)", hours: 5, watt: 75, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "tv"},
        {name: "CRT TV Screen (20 - 24 Inches)", hours: 5, watt: 110, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "tv"},
        {name: "Plasma TV (32 Inches)", watt: 160, hours: 5, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "tv"},
        {name: "Plasma TV (37 Inches)", watt: 180, hours: 5, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "tv"},
        {name: "Plasma TV (42 Inches)", watt: 220, hours: 5, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "tv"},
        {name: "Plasma TV (50 Inches)", watt: 300, hours: 5, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "tv"},
        {name: "CRT Monitor", watt: 75, hours: 5, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "tv"},
        {name: "Game Console", hours: 3, watt: 90, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "game_console"},
        {name: "Standard TV", hours: 5, watt: 188, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "tv"},
        {name: "DVR", watt: 51, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "dvr"},
        {name: "CD/DVD Player", watt: 35, hours: 5, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "dvd"}
    ];

    var heating = [
        {name: "Space Heater", watt: 1500, hours: 5, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "fire"},
        {name: "Water Heater", watt: 4000, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "fire"}
    ];

    var cooling = [
        {name: "Portable Fan", watt: 60, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "standing_fan"},
        {name: "Ceiling Fan", watt: 75, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "ceiling_fan"},
        {name: "Air Conditioner (5,000 BTUH Room Unit)", watt: 900, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "ac"},
        {name: "Air Conditioner (12,000 BTUH Room Unit)", watt: 1500, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "ac"},
        {name: "Central Air Conditioner", watt: 3500, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "ac"}
    ];

    var cleaning = [
        {name: "Vacuum", watt: 1400, hours: 0.1666, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "vacuum"}
    ];

    var computing = [
        {name: "Desktop Computer", watt: 150, hours: 6, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "desktop"},
        {name: "Printer", watt: 40, hours: 0.25, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "printer"},
        {name: "Laser Printer", watt: 600, hours: 0.25, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "printer"},
        {name: "Scanner", watt: 40, hours: 0.25, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "printer"},
        {name: "Cordless Phone", watt: 2, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "cordless_phone"},
        {name: "Radio", watt: 40, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "radio"},
        {name: "Stereo", watt: 2, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "speaker"},
        {name: "VCR", watt: 2, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "vcr"},
        {name: "Alarm Clock Radio", watt: 2, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "alarm"}
    ];

    var internet = [
        {name: "Wi-Fi Router", watt: 6, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "wifi"},
        {name: "Cable Box", watt: 20, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "cable_box"},
        {name: "Satellite Dish", watt: 30, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "satellite"}
    ];

    var general = [
        {name: "Cell Phone Charger", watt: 7.5, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "phone_charger"},
        {name: "Laptop, Notebook or Netbook", watt: 60, hours: 6, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "computer"}
    ];

    var kitchen = Appliance.setUpAppliance([
        {name: "Cooking Stove Top", watt: 1500, hours: 2, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "computer"},
        {name: "Electric Oven", watt: 2400, hours: 1, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "oven"},
        {name: "Dishwasher", watt: 1800, hours: 1, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "dishwasher"},
        {name: "Coffee Maker", watt: 800, hours: 0.33, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "coffee_maker"},
        {name: "Microwave", watt: 1200, hours: 0.5, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "microwave"},
        {name: "Toaster", watt: 1200, hours: 0.2, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "toaster"},
        {name: "Blender", watt: 300, hours: 0.1666, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "blender"},
        {name: "Can Opener", watt: 300, hours: 0.1666, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "can_opener"},
        {name: "Egg Mixer", watt: 200, hours: 0.1666, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "egg_mixer"},
        {name: "Rice Cooker, 1-liter", watt: 450, hours: 1, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "pot"},
        {name: "Rice Cooker, 1.8 liter", watt: 650, hours: 1, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "pot"},
        {name: "Mini Refrigerator", watt: 70, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 0.5, ballast_factor: 1, icon: "refrigerator"},
        {name: "Refrigerator-Freezer 10 cubic feet (w/frost)", watt: 170, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 0.58, ballast_factor: 1, icon: "refrigerator"},
        {name: "Refrigerator-Freezer 12 cubic feet (w/frost)", watt: 240, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 0.58, ballast_factor: 1, icon: "refrigerator"},
        {name: "Refrigerator-Freezer 14 cubic feet (w/frost)", watt: 330, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 0.58, ballast_factor: 1, icon: "refrigerator"},
        {name: "Refrigerator-Freezer 14 cubic feet (frost-free)", watt: 610, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 0.58, ballast_factor: 1, icon: "refrigerator"},
        {name: "Refrigerator-Freezer 18 cubic feet (frost-free)", watt: 720, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 0.58, ballast_factor: 1, icon: "refrigerator"},
        {name: "Refrigerator-Freezer 21 cubic feet (frost-free)", watt: 750, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 0.58, ballast_factor: 1, icon: "refrigerator"},
        {name: "Freezer, 15 cu. ft. (frost free)", watt: 266, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 0.58, ballast_factor: 1, icon: "fros"},
        {name: "Chest Freezer, 8 cu. ft.", watt: 160, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 0.58, ballast_factor: 1, icon: "fros"},
        {name: "Chest Freezer, 10 cu. ft.", watt: 180, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 0.58, ballast_factor: 1, icon: "fros"},
        {name: "Chest Freezer, 12 cu. ft.", watt: 200, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 0.58, ballast_factor: 1, icon: "fros"}
    ], [lighting]);

    var homeoffice = Appliance.setUpAppliance([
        {name: "CRT Monitor", watt: 75, hours: 5, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "crt"}
    ], [computing, general, internet, entertainment, cooling, lighting]);

    var bedroom = Appliance.setUpAppliance([
    ], [cooling, entertainment, cleaning, internet, lighting]);

    var livingroom = Appliance.setUpAppliance([
        {name: "Electric Furnace", watt: 18000, hours: 2, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "fire"}
    ], [entertainment, internet, general, cooling, cleaning, lighting]);

    var washroom = Appliance.setUpAppliance([
        {name: "Electrical Iron", watt: 1100, hours: 1.0, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "iron"},
        {name: "Clothes Washer", watt: 500, hours: 0.25, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "washer"},
        {name: "Clothes Dryer", watt: 3000, hours: 0.25, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "clothes_dryer"}
    ], [lighting]);

    var bathroom = Appliance.setUpAppliance([
        {name: "Hair Dryer", watt: 1500, hours: 0.1666, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "hairdryer"},
        {name: "Shaver", watt: 15, hours: 0.1666, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "shaver"},
        {name: "Waterpik", watt: 100, hours: 0.1666, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "waterpik"},
        {name: "Electric Toothbrush", watt: 220, hours: 0.1666, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "toothbrush"}
    ], [heating, lighting]);

    var DefaultAppliances = {
        homeoffice: homeoffice,
        bathroom: bathroom,
        bedroom: bedroom,
        kitchen: kitchen,
        livingroom: livingroom,
        washroom: washroom
    };

    var Colors = {
        bathroom: "#F38630",
        homeoffice: "#00688B",
        kitchen: "#aa609b",
        washroom: "#82ba00",
        livingroom: "#f92e2e",
        bedroom: "#d24726"
    };

    var rooms = {
        bathroom: "bathroom",
        homeoffice: "home office",
        kitchen: "kitchen",
        washroom: "washroom",
        livingroom: "living room",
        bedroom: "bedroom"
    };

    var Countries = [
        {name: "American Samoa", rate: 38.3, currency: "USD", symbol: "$"},
        {name: "Argentina (Buenos Aires)", rate: 3.1, currency: "USD", symbol: "$"},
        {name: "Argentina (Concordia)", rate: 19.13, currency: "USD", symbol: "$"},
        {name: "Australia", rate: 22, currency: "USD", symbol: "$"},
        {name: "Belgium", rate: 29.08, currency: "USD", symbol: "$"},
        {name: "Bulgaria", rate: 16.33, currency: "USD", symbol: "$"},
        {name: "Brazil", rate: 16.2, currency: "USD", symbol: "$"},
        {name: "Cambodia", rate: 15.63, currency: "USD", symbol: "$"},
        {name: "Canada, Ontario", rate: 11.17, currency: "USD", symbol: "$"},
        {name: "Canada, Ontario, Toronto", rate: 6.52, currency: "USD", symbol: "$"},
        {name: "Canada, Quebec", rate: 5.41, currency: "USD", symbol: "$"},
        {name: "China", rate: 7.5, currency: "USD", symbol: "$"},
        {name: "Chile", rate: 23.11, currency: "USD", symbol: "$"},
        {name: "Colombia (Bogota)", rate: 18.05, currency: "USD", symbol: "$"},
        {name: "Cook Islands", rate: 34.6, currency: "USD", symbol: "$"},
        {name: "Croatia", rate: 17.55, currency: "USD", symbol: "$"},
        {name: "Denmark", rate: 40.38, currency: "USD", symbol: "$"},
        {name: "Dubai", rate: 6.26, currency: "USD", symbol: "$"},
        {name: "Fiji", rate: 12, currency: "USD", symbol: "$"},
        {name: "Finland", rate: 20.65, currency: "USD", symbol: "$"},
        {name: "France", rate: 19.39, currency: "USD", symbol: "$"},
        {name: "Germany", rate: 36.25, currency: "USD", symbol: "$"},
        {name: "Romania", rate: 18.4, currency: "USD", symbol: "$"},
        {name: "Guyana", rate: 26.8, currency: "USD", symbol: "$"},
        {name: "Switzerland", rate: 25, currency: "USD", symbol: "$"},
        {name: "Hungary", rate: 23.44, currency: "USD", symbol: "$"},
        {name: "Hong Kong	(HK Is.)", rate: 12.04, currency: "USD", symbol: "$"},
        {name: "Hong Kong (Kln.)", rate: 12.66, currency: "USD", symbol: "$"},
        {name: "India", rate: 8, currency: "USD", symbol: "$"},
        {name: "Indonesia", rate: 8.75, currency: "USD", symbol: "$"},
        {name: "Iceland", rate: 9, currency: "USD", symbol: "$"},
        {name: "Ireland", rate: 28.36, currency: "USD", symbol: "$"},
        {name: "Israel", rate: 18, currency: "USD", symbol: "$"},
        {name: "Italy", rate: 28.39, currency: "USD", symbol: "$"},
        {name: "Jamaica", rate: 44.7, currency: "JMD", symbol: "$"},
        {name: "Japan", rate: 20, currency: "USD", symbol: "$"},
        {name: "Kiribati", rate: 32.7, currency: "USD", symbol: "$"},
        {name: "Kuwait", rate: 1, currency: "USD", symbol: "$"},
        {name: "Laos", rate: 11.95, currency: "USD", symbol: "$"},
        {name: "Latvia", rate: 18.25, currency: "USD", symbol: "$"},
        {name: "Lithuania", rate: 19.27, currency: "USD", symbol: "$"},
        {name: "Marshall Islands", rate: 29.2, currency: "USD", symbol: "$"},
        {name: "Mexico", rate: 19.28, currency: "USD", symbol: "$"},
        {name: "Moldova", rate: 11.11, currency: "USD", symbol: "$"},
        {name: "Myanmar", rate: 3.6, currency: "USD", symbol: "$"},
        {name: "Nepal", rate: 7.2, currency: "USD", symbol: "$"},
        {name: "Netherlands", rate: 28.89, currency: "USD", symbol: "$"},
        {name: "New Zealand", rate: 19.15, currency: "USD", symbol: "$"},
        {name: "Niue", rate: 44.3, currency: "USD", symbol: "$"},
        {name: "Norway", rate: 15.9, currency: "USD", symbol: "$"},
        {name: "Palau", rate: 22.83, currency: "USD", symbol: "$"},
        {name: "Paraguay", rate: 8, currency: "USD", symbol: "$"},
        {name: "Peru", rate: 10.44, currency: "USD", symbol: "$"},
        {name: "Philippines", rate: 36.13, currency: "USD", symbol: "$"},
        {name: "Portugal", rate: 25.25, currency: "USD", symbol: "$"},
        {name: "Singapore", rate: 20.88, currency: "USD", symbol: "$"},
        {name: "Spain", rate: 22.73, currency: "USD", symbol: "$"},
        {name: "Solomon Islands", rate: 88, currency: "USD", symbol: "$"},
        {name: "South Africa", rate: 8, currency: "USD", symbol: "$"},
        {name: "Surinam", rate: 3.9, currency: "USD", symbol: "$"},
        {name: "Sweden", rate: 27.1, currency: "USD", symbol: "$"},
        {name: "Tahiti", rate: 25, currency: "USD", symbol: "$"},
        {name: "Tonga", rate: 47, currency: "USD", symbol: "$"},
        {name: "Turkey", rate: 12.57, currency: "USD", symbol: "$"},
        {name: "Turks and Caicos Islands", rate: 48.99, currency: "USD", symbol: "$"},
        {name: "Tuvalu", rate: 36.55, currency: "USD", symbol: "$"},
        {name: "Ukraine", rate: 3.05, currency: "USD", symbol: "$"},
        {name: "United Kingdom", rate: 0.125, currency: "GBP", symbol: "£"},
        {name: "United States", rate: 12, currency: "USD", symbol: "$"},
        {name: "United States Virgin Islands", rate: 50.8, currency: "USD", symbol: "$"},
        {name: "Uruguay", rate: 17.07, currency: "USD", symbol: "$"},
        {name: "Uzbekistan", rate: 4.95, currency: "USD", symbol: "$"},
        {name: "Venezuela", rate: 3.1, currency: "USD", symbol: "$"},
        {name: "Vietnam", rate: 6.2, currency: "USD"},
        {name: "Western Samoa", rate: 30.5, currency: "USD", symbol: "$"}
    ];

    var USStates = [
        {name: "Alabama", rate: 10.74, currency: "USD", symbol: "$"},
        {name: "Alaska", rate: 18.21, currency: "USD", symbol: "$"},
        {name: "Arizona", rate: 10.92, currency: "USD", symbol: "$"},
        {name: "Arkansas", rate: 8.3, currency: "USD", symbol: "$"},
        {name: "California", rate: 16.64, currency: "USD", symbol: "$"},
        {name: "Colorado", rate: 11.46, currency: "USD", symbol: "$"},
        {name: "Connecticut", rate: 18.3, currency: "USD", symbol: "$"},
        {name: "District of Columbia", rate: 12.59, currency: "USD", symbol: "$"},
        {name: "Florida", rate: 11.78, currency: "USD", symbol: "$"},
        {name: "Georgia", rate: 10.86, currency: "USD", symbol: "$"},
        {name: "Hawaii", rate: 37.4, currency: "USD", symbol: "$"},
        {name: "Idaho", rate: 8.89, currency: "USD", symbol: "$"},
        {name: "Illinois", rate: 9.76, currency: "USD", symbol: "$"},
        {name: "Indiana", rate: 10.16, currency: "USD", symbol: "$"},
        {name: "Iowa", rate: 10, currency: "USD", symbol: "$"},
        {name: "Kansas", rate: 10.96, currency: "USD", symbol: "$"},
        {name: "Kentucky", rate: 9.42, currency: "USD", symbol: "$"},
        {name: "Louisiana", rate: 8.5, currency: "USD", symbol: "$"},
        {name: "Maine", rate: 14.45, currency: "USD", symbol: "$"},
        {name: "Maryland", rate: 13.14, currency: "USD", symbol: "$"},
        {name: "Massachusetts", rate: 16.38, currency: "USD", symbol: "$"},
        {name: "Michigan", rate: 13.85, currency: "USD", symbol: "$"},
        {name: "Minnesota", rate: 11.34, currency: "USD", symbol: "$"},
        {name: "Mississippi", rate: 10.48, currency: "USD", symbol: "$"},
        {name: "Missouri", rate: 8.87, currency: "USD", symbol: "$"},
        {name: "Montana", rate: 9.88, currency: "USD", symbol: "$"},
        {name: "Nebraska", rate: 8.98, currency: "USD", symbol: "$"},
        {name: "Nevada", rate: 12.46, currency: "USD", symbol: "$"},
        {name: "New Jersey", rate: 15.26, currency: "USD", symbol: "$"},
        {name: "New Hampshire", rate: 16.54, currency: "USD", symbol: "$"},
        {name: "New Mexico", rate: 11.3, currency: "USD", symbol: "$"},
        {name: "New York", rate: 19.52, currency: "USD", symbol: "$"},
        {name: "North Carolina", rate: 10.3, currency: "USD", symbol: "$"},
        {name: "North Dakota", rate: 7.79, currency: "USD", symbol: "$"},
        {name: "Ohio", rate: 10.98, currency: "USD", symbol: "$"},
        {name: "Oklahoma", rate: 8.33, currency: "USD", symbol: "$"},
        {name: "Oregon", rate: 10.08, currency: "USD", symbol: "$"},
        {name: "Pennsylvania", rate: 12.74, currency: "USD", symbol: "$"},
        {name: "Rhode Island", rate: 20.16, currency: "USD", symbol: "$"},
        {name: "South Carolina", rate: 11.76, currency: "USD", symbol: "$"},
        {name: "South Dakota", rate: 9.44, currency: "USD", symbol: "$"},
        {name: "Tennessee", rate: 9.74, currency: "USD", symbol: "$"},
        {name: "Texas", rate: 11.19, currency: "USD", symbol: "$"},
        {name: "Utah", rate: 10, currency: "USD", symbol: "$"},
        {name: "Vermont", rate: 16.94, currency: "USD", symbol: "$"},
        {name: "Virginia", rate: 10.09, currency: "USD", symbol: "$"},
        {name: "West Virginia", rate: 9.01, currency: "USD", symbol: "$"},
        {name: "Washington", rate: 8.59, currency: "USD", symbol: "$"},
        {name: "Wisconsin", rate: 13.11, currency: "USD", symbol: "$"},
        {name: "Wyoming", rate: 9.77, currency: "USD", symbol: "$"},
    ];

    return {
        Storage: Storage,
        DefaultAppliances: DefaultAppliances,
        Appliance: Appliance,
        Utility: Utility,
        Application: Application,
        Colors: Colors,
        Room: Room,
        Countries: Countries,
        USStates: USStates
    };
});