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
    Application.defaultRate = {rate: 0.12, country: 'United States', currency: 'USD'};

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
        return parseFloat(cost.toFixed(2));
    };
    Appliance.getItemWatt = function(appliance) {
        var hours = Appliance.getHours(appliance);
        var watt = hours * appliance['quantity'] * (appliance['watt'] / 1000);
        return parseFloat(watt.toFixed(2));
    };
    Appliance.getHours = function(appliance) {
        var factor = (appliance['time_unit'] === 'minute') ? 0.01666 : 1;
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
            cost: parseFloat(cost.toFixed(2)),
            watt: parseFloat((kwh).toFixed(2))
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
        {name: "Compact Fluorescent Light Bulbs (CFL 24 Watt)", hours: 5, watt: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "bulb"},
        {name: "Compact Fluorescent Light Bulbs (CFL 18 Watt)", hours: 5, watt: 18, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "bulb"},
        {name: "Compact Fluorescent Light Bulbs (CFL 14 Watt)", hours: 5, watt: 14, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "bulb"},
        {name: "Incandescent Light Bulb (100 Watt)", hours: 5, watt: 100, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "bulb"},
        {name: "Incandescent Light Bulb (60 Watt)", hours: 5, watt: 60, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "bulb"},
        {name: "Incandescent Light Bulb (40 Watt)", hours: 5, watt: 40, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "bulb"},
        {name: "Incandescent Light Bulb (15 Watt)", hours: 5, watt: 15, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "bulb"}
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
        {name: "CRT Monitor", watt: 75, hours: 5, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Game Console", hours: 3, watt: 90, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Standard TV", hours: 5, watt: 188, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "DVR", watt: 51, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ];

    var heating = [
        {name: "Space Heater", watt: 1500, hours: 5, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Water Heater", watt: 4000, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ];

    var cooling = [
        {name: "Portable Fan", watt: 60, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "standing_fan"},
        {name: "Ceiling Fan", watt: 75, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "ceiling_fan"},
        {name: "Air Conditioner (5,000 BTUH Room Unit)", watt: 900, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Air Conditioner (12,000 BTUH Room Unit)", watt: 1500, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Central Air Conditioner", watt: 3500, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ];

    var cleaning = [
        {name: "Vacuum", watt: 1400, hours: 0.1666, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ];

    var computing = [
        {name: "Desktop Computer", watt: 150, hours: 6, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Printer", watt: 40, hours: 0.25, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Cordless Phone", watt: 2, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Radio", watt: 40, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Stereo", watt: 2, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "VCR", watt: 2, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Alarm Clock Radio", watt: 2, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ];

    var internet = [
        {name: "Wi-Fi Router", watt: 6, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Cable Box", watt: 20, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ];

    var general = [
        {name: "Cell Phone Charger", watt: 7.5, hours: 3, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Laptop, Notebook or Netbook", watt: 60, hours: 6, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "computer"}
    ];

    var kitchen = Appliance.setUpAppliance([
        {name: "Cooking Stove Top", watt: 1500, hours: 2, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "computer"},
        {name: "Electric Oven", watt: 2400, hours: 1, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "oven"},
        {name: "Dishwasher", watt: 1800, hours: 1, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "dishwasher"},
        {name: "Refrigerator", watt: 180, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 0.5, ballast_factor: 1, icon: "refrigerator"},
        {name: "Mini Refrigerator", watt: 70, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 0.5, ballast_factor: 1, icon: "refrigerator"},
        {name: "Freezer", watt: 200, hours: 24, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 0.5, ballast_factor: 1, icon: "refrigerator"},
        {name: "Coffee Maker", watt: 800, hours: 0.33, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "coffee_maker"},
        {name: "Microwave", watt: 1200, hours: 0.5, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "microwave"},
        {name: "Toaster", watt: 1200, hours: 0.2, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "toaster"},
        {name: "Blender", watt: 300, hours: 0.1666, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "toaster"},
        {name: "Can Opener", watt: 300, hours: 0.1666, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "toaster"}
    ], [lighting]);

    var homeoffice = Appliance.setUpAppliance([
        {name: "CRT Monitor", watt: 75, hours: 5, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ], [computing, general, internet, entertainment, cooling, lighting]);

    var bedroom = Appliance.setUpAppliance([
    ], [cooling, entertainment, cleaning, internet, lighting]);

    var livingroom = Appliance.setUpAppliance([
        {name: "Electric Furnace", watt: 18000, hours: 2, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ], [entertainment, internet, general, cooling, cleaning, lighting]);

    var washroom = Appliance.setUpAppliance([
        {name: "Electrical Iron", watt: 1100, hours: 1.0, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Clothes Washer", watt: 500, hours: 0.25, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Clothes Dryer", watt: 3000, hours: 0.25, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
    ], [lighting]);

    var bathroom = Appliance.setUpAppliance([
        {name: "Hair Dryer", watt: 1500, hours: 0.1666, usage_list: ['daily', 'weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Shaver", watt: 15, hours: 0.1666, usage_list: ['weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"},
        {name: "Waterpik", watt: 100, hours: 0.1666, usage_list: ['weekly', 'monthly'], duty_cycle: 1.0, ballast_factor: 1, icon: "default"}
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
        {name: "American Samoa", rate: 38.3, currency: "USD"},
        {name: "Argentina (Buenos Aires)", rate: 3.1, currency: "USD"},
        {name: "Argentina (Concordia)", rate: 19.13, currency: "USD"},
        {name: "Australia", rate: 22, currency: "USD"},
        {name: "Belgium", rate: 29.08, currency: "USD"},
        {name: "Bulgaria", rate: 16.33, currency: "USD"},
        {name: "Brazil", rate: 16.2, currency: "USD"},
        {name: "Cambodia", rate: 15.63, currency: "USD"},
        {name: "Canada, Ontario", rate: 11.17, currency: "USD"},
        {name: "Canada, Ontario, Toronto", rate: 6.52, currency: "USD"},
        {name: "Canada, Quebec", rate: 5.41, currency: "USD"},
        {name: "China", rate: 7.5, currency: "USD"},
        {name: "Chile", rate: 23.11, currency: "USD"},
        {name: "Colombia (Bogota)", rate: 18.05, currency: "USD"},
        {name: "Cook Islands", rate: 34.6, currency: "USD"},
        {name: "Croatia", rate: 17.55, currency: "USD"},
        {name: "Denmark", rate: 40.38, currency: "USD"},
        {name: "Dubai", rate: 6.26, currency: "USD"},
        {name: "Fiji", rate: 12, currency: "USD"},
        {name: "Finland", rate: 20.65, currency: "USD"},
        {name: "France", rate: 19.39, currency: "USD"},
        {name: "Germany", rate: 36.25, currency: "USD"},
        {name: "Romania", rate: 18.4, currency: "USD"},
        {name: "Guyana", rate: 26.8, currency: "USD"},
        {name: "Switzerland", rate: 25, currency: "USD"},
        {name: "Hungary", rate: 23.44, currency: "USD"},
        {name: "Hong Kong	(HK Is.)", rate: 12.04, currency: "USD"},
        {name: "Hong Kong (Kln.)", rate: 12.66, currency: "USD"},
        {name: "India", rate: 8, currency: "USD"},
        {name: "Indonesia", rate: 8.75, currency: "USD"},
        {name: "Iceland", rate: 9, currency: "USD"},
        {name: "Ireland", rate: 28.36, currency: "USD"},
        {name: "Israel", rate: 18, currency: "USD"},
        {name: "Italy", rate: 28.39, currency: "USD"},
        {name: "Jamaica", rate: 44.7, currency: "JMD"},
        {name: "Japan", rate: 20, currency: "USD"},
        {name: "Kiribati", rate: 32.7, currency: "USD"},
        {name: "Kuwait", rate: 1, currency: "USD"},
        {name: "Laos", rate: 11.95, currency: "USD"},
        {name: "Latvia", rate: 18.25, currency: "USD"},
        {name: "Lithuania", rate: 19.27, currency: "USD"},
        {name: "Marshall Islands", rate: 29.2, currency: "USD"},
        {name: "Mexico", rate: 19.28, currency: "USD"},
        {name: "Moldova", rate: 11.11, currency: "USD"},
        {name: "Myanmar", rate: 3.6, currency: "USD"},
        {name: "Nepal", rate: 7.2, currency: "USD"},
        {name: "Netherlands", rate: 28.89, currency: "USD"},
        {name: "New Zealand", rate: 19.15, currency: "USD"},
        {name: "Niue", rate: 44.3, currency: "USD"},
        {name: "Norway", rate: 15.9, currency: "USD"},
        {name: "Palau", rate: 22.83, currency: "USD"},
        {name: "Paraguay", rate: 8, currency: "USD"},
        {name: "Peru", rate: 10.44, currency: "USD"},
        {name: "Philippines", rate: 36.13, currency: "USD"},
        {name: "Portugal", rate: 25.25, currency: "USD"},
        {name: "Singapore", rate: 20.88, currency: "USD"},
        {name: "Spain", rate: 22.73, currency: "USD"},
        {name: "Solomon Islands", rate: 88, currency: "USD"},
        {name: "South Africa", rate: 8, currency: "USD"},
        {name: "Surinam", rate: 3.9, currency: "USD"},
        {name: "Sweden", rate: 27.1, currency: "USD"},
        {name: "Tahiti", rate: 25, currency: "USD"},
        {name: "Tonga", rate: 47, currency: "USD"},
        {name: "Turkey", rate: 12.57, currency: "USD"},
        {name: "Turks and Caicos Islands", rate: 48.99, currency: "USD"},
        {name: "Tuvalu", rate: 36.55, currency: "USD"},
        {name: "Ukraine", rate: 3.05, currency: "USD"},
        {name: "United Kingdom", rate: 20, currency: "USD"},
        {name: "United States", rate: 12, currency: "USD"},
        {name: "United States Virgin Islands", rate: 50.8, currency: "USD"},
        {name: "Uruguay", rate: 17.07, currency: "USD"},
        {name: "Uzbekistan", rate: 4.95, currency: "USD"},
        {name: "Venezuela", rate: 3.1, currency: "USD"},
        {name: "Vietnam", rate: 6.2, currency: "USD"},
        {name: "Western Samoa", rate: 30.5, currency: "USD"}
    ];

    var USStates = [
        {name: "Alabama", rate: 10.74, currency: "USD"},
        {name: "Alaska", rate: 18.21, currency: "USD"},
        {name: "California", rate: 16.64, currency: "USD"},
        {name: "Connecticut", rate: 18.3, currency: "USD"},
        {name: "Maine", rate: 14.45, currency: "USD"},
        {name: "Massachusetts", rate: 16.38, currency: "USD"},
        {name: "New Hampshire", rate: 16.54, currency: "USD"},
        {name: "Rhode Island", rate: 20.16, currency: "USD"},
        {name: "Vermont", rate: 16.94, currency: "USD"},
        {name: "New Jersey", rate: 15.26, currency: "USD"},
        {name: "New York", rate: 19.52, currency: "USD"},
        {name: "Pennsylvania", rate: 12.74, currency: "USD"},
        {name: "Illinois", rate: 9.76, currency: "USD"},
        {name: "Indiana", rate: 10.16, currency: "USD"},
        {name: "Michigan", rate: 13.85, currency: "USD"},
        {name: "Ohio", rate: 10.98, currency: "USD"},
        {name: "Wisconsin", rate: 13.11, currency: "USD"},
        {name: "Iowa", rate: 10, currency: "USD"},
        {name: "Kansas", rate: 10.96, currency: "USD"},
        {name: "Minnesota", rate: 11.34, currency: "USD"},
        {name: "Missouri", rate: 8.87, currency: "USD"},
        {name: "Nebraska", rate: 8.98, currency: "USD"},
        {name: "North Dakota", rate: 7.79, currency: "USD"},
        {name: "South Dakota", rate: 9.44, currency: "USD"},
        {name: "District of Columbia", rate: 12.59, currency: "USD"},
        {name: "Florida", rate: 11.78, currency: "USD"},
        {name: "Georgia", rate: 10.86, currency: "USD"},
        {name: "Maryland", rate: 13.14, currency: "USD"},
        {name: "North Carolina", rate: 10.3, currency: "USD"},
        {name: "South Carolina", rate: 11.76, currency: "USD"},
        {name: "Virginia", rate: 10.09, currency: "USD"},
        {name: "West Virginia", rate: 9.01, currency: "USD"},
        {name: "Kentucky", rate: 9.42, currency: "USD"},
        {name: "Mississippi", rate: 10.48, currency: "USD"},
        {name: "Tennessee", rate: 9.74, currency: "USD"},
        {name: "Arkansas", rate: 8.3, currency: "USD"},
        {name: "Louisiana", rate: 8.5, currency: "USD"},
        {name: "Oklahoma", rate: 8.33, currency: "USD"},
        {name: "Texas", rate: 11.19, currency: "USD"},
        {name: "Arizona", rate: 10.92, currency: "USD"},
        {name: "Colorado", rate: 11.46, currency: "USD"},
        {name: "Idaho", rate: 8.89, currency: "USD"},
        {name: "Montana", rate: 9.88, currency: "USD"},
        {name: "Nevada", rate: 12.46, currency: "USD"},
        {name: "New Mexico", rate: 11.3, currency: "USD"},
        {name: "Utah", rate: 10, currency: "USD"},
        {name: "Wyoming", rate: 9.77, currency: "USD"},
        {name: "Oregon", rate: 10.08, currency: "USD"},
        {name: "Washington", rate: 8.59, currency: "USD"},
        {name: "Hawaii", rate: 37.4, currency: "USD"}
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
