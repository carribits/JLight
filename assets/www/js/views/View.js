// Category View
// =============

// Includes file dependencies
define(["jquery", "backbone", "models/Model"], function($, Backbone, ModelModule) {

    var BaseView = Backbone.View.extend({
        validateAppliance: function(params) {
            console.log(params);
            if (!Utility.isNumeric(params['quantity']) || !Utility.isNumeric(params['hours'])) {
                Utility.alert("Values entered are incorrect");
                return false;
            }

            if (params['hours'] <= 0 || params['quantity'] <= 0) {
                Utility.alert("Values entered are incorrect");
                return false;
            }

            //Validate daily usage
            if (params['usage'] === 'daily' && params['hours'] > 24 && params['time_unit'] === 'hour') {
                Utility.alert("Hours must be between 1 and 24 for daily usage");
                return false;
            }
            if (params['usage'] === 'daily' && params['hours'] > 1440 && params['time_unit'] === 'minute') {
                Utility.alert("Minutes must be between 1 and 1440 for daily usage");
                return false;
            }

            //Validate weekly usage
            if (params['usage'] === 'weekly' && params['hours'] > 168 && params['time_unit'] === 'hour') {
                Utility.alert("Hours must be between 1 and 168 for weekly usage");
                return false;
            }
            if (params['usage'] === 'weekly' && params['hours'] > 10080 && params['time_unit'] === 'minute') {
                Utility.alert("Minutes must be between 1 and 10080 for weekly usage");
                return false;
            }

            //Validate monthly usage
            if (params['usage'] === 'monthly' && params['hours'] > 730 && params['time_unit'] === 'hour') {
                Utility.alert("Hours must be between 1 and 730 for monthly usage");
                return false;
            }
            if (params['usage'] === 'monthly' && params['hours'] > 44640 && params['time_unit'] === 'minute') {
                Utility.alert("Minutes must be between 1 and 44640 for monthly usage");
                return false;
            }

            return true;
        },
        validateCustomAppliance: function(params) {
            var validation = BaseView.prototype.validateAppliance.call(this, params);

            if (validation) {
                if (!Utility.isNumeric(params['watt']) || params['watt'] <= 0) {
                    Utility.alert("Watt amount is incorrect");
                    return false;
                }

                if ($.trim(params['name']) === '') {
                    Utility.alert("Appliance name is incorrect");
                    return false;
                }
            } else {
                return false;
            }

            return true;
        }
    });
    var HomeView = Backbone.View.extend({
        initialize: function() {
        },
        // Renders all of the Category models on the UI
        render: function() {
            var self = this;
            this.renderIconView();
            this.renderListView();
            this.initLayout();

            $("a#app-view-switch").click(function(event) {
                event.preventDefault();
                self.changeLayout();
            });

            return this;
        },
        changeLayout: function() {
            if (Application.view === 'icon') {
                Application.view = 'list';
                $('#icon-view').hide();
                $('#list-view').show();
                $('#app-view-switch img').attr("src", 'images/icon_view_i.png');
            } else {
                Application.view = 'icon';
                $('#list-view').hide();
                $('#icon-view').show();
                $('#app-view-switch img').attr("src", 'images/list_view_i.png');
            }

        },
        initLayout: function() {
            if (Application.view === 'icon') {
                $('#list-view').hide();
                $('#icon-view').show();
            } else {
                $('#icon-view').hide();
                $('#list-view').show();
            }
        },
        renderListView: function() {
            this.renderRoom('bathroom', 'Bathroom', 'ui-first-child');
            this.renderRoom('homeoffice', 'Home Office', '');
            this.renderRoom('kitchen', 'Kitchen', '');
            this.renderRoom('washroom', 'Washroom', '');
            this.renderRoom('livingroom', 'Living Room', '');
            this.renderRoom('bedroom', 'Bedroom', '');
        },
        renderRoom: function(room, roomName, elClass) {
            var appliances = Appliance.getAppliances(room);
            var symbol = Application.getSymbol();

            for (var key in appliances) {
                var appliance = appliances[key];
                appliance['cost'] = Appliance.getItemCost(appliance).toFixed(2);
                appliance['watt'] = Appliance.getItemWatt(appliance).toFixed(2);
                appliance['symbol'] = symbol + ' ';
            }

            var divider = _.template($("script#appliance-divider").html(), {room: room, roomName: roomName, class: elClass});
            this.$el.find('#room-appl-listview').append(divider);

            var applianceItem = _.template($("script#appliance-item").html(), {"appliances": appliances});
            this.$el.find('#room-appl-listview').append(applianceItem);
        },
        renderIconView: function() {
            var currency = Application.getCurrency();
            var symbol = Application.getSymbol();

            this.houseInfo = {
                count: 0,
                cost: 0,
                watt: 0
            };

            var template = _.template($("#home").html());
            this.$el.find("#content-holder").html(template);

            this.computeRoom('bathroom');
            this.computeRoom('homeoffice');
            this.computeRoom('kitchen');
            this.computeRoom('washroom');
            this.computeRoom('livingroom');
            this.computeRoom('bedroom');

            this.houseInfo['watt'] = this.houseInfo['watt'].toFixed(2);
            this.houseInfo['cost'] = this.houseInfo['cost'].toFixed(2);

            this.$el.find('ul#meter-total .appliance-count').text(this.houseInfo['count'] + ' Appliance(s)');
            this.$el.find('ul#meter-total .room-watt').text(this.houseInfo['watt'] + ' kWh');
            this.$el.find('ul#meter-total .room-cost').text(symbol + ' ' + toMoney(this.houseInfo['cost']) + ' ' + currency);
        },
        computeRoom: function(room) {
            var symbol = Application.getSymbol();
            var roomInfo = Appliance.getRoomInfo(room);

            roomInfo['watt'] = Utility.parseFloat(roomInfo['watt']).toFixed(2);
            roomInfo['cost'] = Utility.parseFloat(roomInfo['cost']).toFixed(2);

            this.$el.find('ul#' + room + ' .appliance-count').text(roomInfo['count'] + ' Appliance(s)');
            this.$el.find('ul#' + room + ' .room-watt').text(roomInfo['watt'] + ' kWh');
            this.$el.find('ul#' + room + ' .room-cost').text(symbol + ' ' + toMoney(roomInfo['cost']));

            this.houseInfo.count += roomInfo['count'];
            this.houseInfo.watt += parseFloat(roomInfo['watt']);
            this.houseInfo.cost += parseFloat(roomInfo['cost']);
        }
    });

    var TipsView = Backbone.View.extend({
        initialize: function() {
        },
        render: function() {
            var template = _.template($("#tips").html());
            this.$el.find("#content-holder").html(template);
            return this;
        }
    });

    var DiscoverApplianceView = Backbone.View.extend({
        initialize: function() {
        },
        render: function(room) {
            var count = 0;
            var storageIndex = room + '_appliances';
            var appliances = DefaultAppliances[room];
            var title = Room.getName(room).toUpperCase();
            var template = _.template($("#discoverappliance").html());
            this.$el.find("#content-holder").html(template);
            var title = 'ADD ' + title.toUpperCase() + ' APPLIANCES';

            $('#discoverappliance-title').text(title);

            for (var i = 0; i < appliances.length; i++) {
                var appliance = appliances[i];
                var storedAppliances = Storage.readJson(storageIndex);
                if (storedAppliances === null)
                    storedAppliances = {};

                var item = storedAppliances[appliance['key']];
                if (item === null || item === undefined) {
                    appliance['room'] = room;
                    if (count === 0) {
                        $.extend(appliance, {class: "ui-first-child"});
                    }
                    var item = _.template($("script#appliance-add").html(), {"appliance": appliance});
                    this.$el.find('#discoverappliance-list').append(item);
                    count++;
                }
            }
            $.mobile.loading("hide");
            return this;
        }
    });

    var RoomView = Backbone.View.extend({
        initialize: function() {
        },
        render: function(room) {
            var storageIndex = room + '_appliances';
            var count = 0;

            var title = Room.getName(room).toUpperCase() + ' ' + 'APPLIANCES';
            var template = _.template($("#room").html());
            this.$el.find("#content-holder").html(template);
            $('#room-link').attr('href', '#discoverappliance?' + room);
            $('#custom-app-link').attr('href', '#addcustom?' + room);
            $('#room-name').text(title);

            var appliances = Storage.readJson(storageIndex);
            if (appliances === null) {
                appliances = {};
            }

            for (var key in appliances) {
                var appliance = appliances[key];
                appliance['key'] = key;
                var item = '';
                if (count === 0) {
                    $.extend(appliance, {class: "ui-first-child"});
                }
                $.extend(appliance, {room: room});
                item = _.template($("script#room-appliance-li").html(), {"appliance": appliance});

                this.$el.find('ul#room-appliances-list').append(item);
                count++;
            }

            $.mobile.loading("hide");
            return this;
        }
    });

    var SettingView = Backbone.View.extend({
        initialize: function() {
        },
        render: function() {
            var template = _.template($("#setting").html());
            this.$el.find("#content-holder").html(template);

            $.mobile.loading("hide");
            return this;
        }
    });

    var RateView = Backbone.View.extend({
        initialize: function() {
        },
        render: function() {
            var config = Application.getRate();
            var template = _.template($("#setrate").html());
            this.$el.find("#content-holder").html(template);
            var rate = config.rate;
            var countryList = '';
            var stateList = '';
            var country = config.country;
            var currency = config.currency;

            rate = rate.toFixed(2);

            var formContent = _.template($("script#rate-view-tmp").html());
            this.$el.find('#rateform').html(formContent);

            if (currency !== null && currency !== '') {
                $("#rateform #currency-ind").text('Currency is ' + currency);
            }

            //Load countries
            for (var i = 0; i < Countries.length; i++) {
                var countryObj = {name: Countries[i]['name'], rate: Countries[i]['rate'], currency: Countries[i]['currency']};
                if (countryObj['currency'] === 'USD') {
                    countryObj['rate'] = (parseFloat(countryObj['rate']) / 100).toFixed(2);
                }
                countryList += _.template($("script#rate-form-option-tmp").html(), countryObj);
            }
            this.$el.find('#rateform #country').append(countryList);


            //Load USA states
            for (var i = 0; i < USStates.length; i++) {
                var state = {name: USStates[i]['name'], rate: USStates[i]['rate'], currency: USStates[i]['currency']};
                if (state['currency'] === 'USD') {
                    state['rate'] = (parseFloat(state['rate']) / 100).toFixed(2);
                }
                stateList += _.template($("script#rate-form-option-tmp").html(), state);
            }
            this.$el.find('#rateform #state').append(stateList);

            //Initialize widgets
            $("#rateform #state-list").hide();
            $("#rateform #country").selectmenu();
            $("#rateform #state").selectmenu();
            $("#rateform #rate-amt").textinput();
            $("#rateform #rate-amt").val(rate);

            //Change the rate amount everytime the country or state changes
            $('#rateform #country, #rateform #state').on('change', function() {
                country = $(this).find(":selected").text();
                currency = $(this).find(":selected").attr('data-currency');

                rate = $(this).val();
                $("#rateform #rate-amt").val(rate);
                $("#rateform #currency-ind").text('Currency is ' + currency);
                $("#rateform #currency-ind").show();
            });

            //Show US states of country selected is USA
            $('#rateform #country').on('change', function() {
                if (country === 'United States') {
                    $("#rateform #state-list").show();
                } else {
                    $("#rateform #state-list").hide();
                }
            });

            //Save rate entered
            $('#rateform a#appliance-rate-form-save').click(function(event) {
                rate = $("#rateform #rate-amt").val();
                if (Utility.isNumeric(rate) && rate > 0) {
                    Application.saveRate({rate: parseFloat(rate), currency: currency, country: country});
                } else {
                    event.preventDefault();
                    Utility.alert("Rate is incorrect");
                }
            });

            //Initialize rate on startup if user cancels rate seletction
            $('#rateform a#appliance-rate-cancel').click(function(event) {
                Application.initializeRate();
            });

            //Select the country found
            $("#country option").each(function() {
                this.selected = false;
            });
            $("#country option").each(function() {
                this.selected = (this.text === country);
            });
            $('#country').selectmenu('refresh');

            //Reset country and currency if rate change
            $("#rateform #rate-amt").on('change keyup paste mouseup', function() {
                if ($(this).val() !== rate) {
                    rate = $(this).val();
                    $("#rateform #currency-ind").hide();
                    currency = '';
                    country = '';

                    $("#country option").each(function() {
                        this.selected = false;
                    });
                    $("#country option").each(function() {
                        this.selected = (this.value === 0);
                    });
                    $('#country').selectmenu('refresh');
                }
            });

            //Show states
            if (country === 'United States') {
                $("#rateform #state-list").show();
            }

            $.mobile.loading("hide");
            return this;
        }
    });

    var AddCustomApplianceView = Backbone.View.extend({
        initialize: function() {
        },
        render: function(room) {
            var template = _.template($("#addcustom").html());
            this.$el.find("#content-holder").html(template);
            var formContent = _.template($("script#add-custom-appl-tmp").html());

            this.$el.find('#custom-appl-form').html(formContent);

            $('#custom-appl-form .room-custom').html(room);

            // Set input to zero to avoid crash
            $("#custom-appl-form #appliance-watt").val(0);
            $("#custom-appl-form #appliance-hours").val(0);
            $("#custom-appl-form #appliance-quantity").val(0);

            //Initialize text inpute
            $("#custom-appl-form #appliance-name").textinput();
            $("#custom-appl-form #appliance-watt").textinput();
            $("#custom-appl-form #appliance-hours").textinput();
            $("#custom-appl-form #appliance-usage").selectmenu();
            $("#custom-appl-form #appliance-quantity").textinput();
            $("#custom-appl-form #time-unit").flipswitch();

            $("#custom-appl-form #time-unit").change(function(e) {
                $('#custom-appl-form #unit-title').text((ucfirst($("#custom-appl-form #time-unit").val() + 's' + ' Used')));
            });
            $('#custom-appl-form #unit-title').text((ucfirst($("#custom-appl-form #time-unit").val() + 's' + ' Used')));

            $('#custom-appl-form a#appliance-add-form-save').click(function(event) {
                var name = $("#custom-appl-form #appliance-name").val();
                var dutyCycle = 1.0;

                if (name.toLowerCase().indexOf("freezer") !== -1 || name.toLowerCase().indexOf("refrigerator") !== -1) {
                    dutyCycle = 0.50;
                }

                var params = {
                    usage: $("#custom-appl-form #appliance-usage").val(),
                    usage_list: ['daily', 'weekly', 'monthly'],
                    hours: parseFloat($("#custom-appl-form #appliance-hours").val()),
                    quantity: parseInt($("#custom-appl-form #appliance-quantity").val()),
                    name: $("#custom-appl-form #appliance-name").val(),
                    watt: parseFloat($("#custom-appl-form #appliance-watt").val()),
                    icon: "default",
                    duty_cycle: dutyCycle,
                    ballast_factor: 1,
                    room: room,
                    time_unit: $("#custom-appl-form #time-unit").val()
                };
                var appid = Appliance.getKey(params['name'].toLowerCase() + params['watt']);

                if (BaseView.prototype.validateCustomAppliance.call(this, params)) {
                    Appliance.saveAppliance(params, room, appid);
                } else {
                    event.preventDefault();
                }
            });

            $.mobile.loading("hide");
            return this;
        }
    });

    var ApplianceView = Backbone.View.extend({
        initialize: function() {
        },
        render: function() {
            var template = _.template($("#appliance").html());
            this.$el.find("#content-holder").html(template);

            $("input#slider-0").slider();

            $.mobile.loading("hide");
            return this;
        }
    });

    var EditApplianceView = Backbone.View.extend({
        initialize: function() {
        },
        render: function(room, appid) {
            var option = '';
            var appliance = Appliance.getStoredAppliance(room, appid);
            var applianceForm = _.template($("script#appliance-add-form").html(), {"appliance": appliance});

            var template = _.template($("#addappliance").html());
            this.$el.find("#content-holder").html(template);
            this.$el.find('#addappliance-form').html(applianceForm);
            $("#addappliance-form input#appliance-hours").textinput();

            for (var i = 0; i < appliance['usage_list'].length; i++) {
                option += '<option value="' + appliance['usage_list'][i] + '">' + ucfirst(appliance['usage_list'][i]) + '</option>';
            }
            $("#addappliance-form #appliance-usage").html(option);

            $("#addappliance-form #appliance-usage").val(appliance['usage']);
            $("#addappliance-form #time-unit").val(appliance['time_unit']);

            $("#addappliance-form #appliance-usage").selectmenu();
            $("#addappliance-form #appliance-quantity").textinput();
            $("#addappliance-form #time-unit").flipswitch();

            $("#addappliance-form #time-unit").change(function(e) {
                $('#addappliance-form #unit-title').text((ucfirst($("#addappliance-form #time-unit").val() + 's' + ' Used')));
            });
            $('#addappliance-form #unit-title').text((ucfirst($("#addappliance-form #time-unit").val() + 's' + ' Used')));

            $.mobile.loading("hide");

            $('#addappliance-form a#appliance-add-form-save').click(function(event) {
                var params = {
                    usage: $("#addappliance-form #appliance-usage").val(),
                    usage_list: appliance['usage_list'],
                    hours: parseFloat($("#addappliance-form #appliance-hours").val()),
                    quantity: parseInt($("#addappliance-form #appliance-quantity").val()),
                    name: appliance['name'],
                    watt: parseFloat(appliance['watt']),
                    icon: appliance['icon'],
                    duty_cycle: appliance['duty_cycle'],
                    ballast_factor: appliance['ballast_factor'],
                    room: room,
                    time_unit: $("#addappliance-form #time-unit").val()
                };

                if (BaseView.prototype.validateAppliance.call(this, params)) {
                    Appliance.saveAppliance(params, room, appid);
                } else {
                    event.preventDefault();
                }
            });
            return this;
        }
    });

    var AddApplianceView = Backbone.View.extend({
        initialize: function() {
        },
        render: function(room, appid) {
            var appliance = Appliance.getAppliance(room, appid);
            appliance['quantity'] = 1;
            var option = '';
            var unitValue = appliance['hours'];
            var unit = 'hour';

            //Change time unit to minute if hours less than 1
            if (unitValue < 1) {
                unitValue = Math.round(unitValue * 60);
                unit = 'minute';
            }
            appliance['hours'] = unitValue;
            var applianceForm = _.template($("script#appliance-add-form").html(), {"appliance": appliance});

            var template = _.template($("#addappliance").html());
            this.$el.find("#content-holder").html(template);
            this.$el.find('#addappliance-form').html(applianceForm);
            $("#addappliance-form input#appliance-hours").textinput();

            //Add usage list
            for (var i = 0; i < appliance['usage_list'].length; i++) {
                option += '<option value="' + appliance['usage_list'][i] + '">' + ucfirst(appliance['usage_list'][i]) + '</option>';
            }
            $("#addappliance-form #appliance-usage").html(option);

            $("#addappliance-form #time-unit").val(unit);

            $("#addappliance-form #appliance-usage").selectmenu();
            $("#addappliance-form #appliance-quantity").textinput();
            $("#addappliance-form #time-unit").flipswitch();

            $("#addappliance-form #time-unit").change(function(e) {
                $('#addappliance-form #unit-title').text((ucfirst($("#addappliance-form #time-unit").val() + 's' + ' Used')));
            });

            $.mobile.loading("hide");

            $('#addappliance-form a#appliance-add-form-save').click(function(event) {
                var params = {
                    usage: $("#addappliance-form #appliance-usage").val(),
                    usage_list: appliance['usage_list'],
                    hours: parseFloat($("#addappliance-form #appliance-hours").val()),
                    quantity: parseInt($("#addappliance-form #appliance-quantity").val()),
                    name: appliance['name'],
                    watt: parseFloat(appliance['watt']),
                    icon: appliance['icon'],
                    duty_cycle: appliance['duty_cycle'],
                    ballast_factor: appliance['ballast_factor'],
                    room: room,
                    time_unit: $("#addappliance-form #time-unit").val()
                };

                if (BaseView.prototype.validateAppliance.call(this, params)) {
                    Appliance.saveAppliance(params, room, appid);
                } else {
                    event.preventDefault();
                }
            });
            return this;
        }
    });

    var GraphView = Backbone.View.extend({
        initialize: function() {
        },
        render: function() {
            var pieData = [];
            var totalWatt = 0.00;

            var bathroom = Appliance.getRoomInfo('bathroom');
            totalWatt += bathroom['watt'];
            pieData.push({value: bathroom['watt'] * 1000, color: Colors.bathroom});
            $('#piechart-stat .bathroom').css('background', Colors.bathroom);

            var homeoffice = Appliance.getRoomInfo('homeoffice');
            totalWatt += homeoffice['watt'];
            pieData.push({value: homeoffice['watt'] * 1000, color: Colors.homeoffice});
            $('#piechart-stat .homeoffice').css('background', Colors.homeoffice);

            var kitchen = Appliance.getRoomInfo('kitchen');
            totalWatt += kitchen['watt'];
            pieData.push({value: kitchen['watt'] * 1000, color: Colors.kitchen});
            $('#piechart-stat .kitchen').css('background', Colors.kitchen);

            var washroom = Appliance.getRoomInfo('washroom');
            totalWatt += washroom['watt'];
            pieData.push({value: washroom['watt'] * 1000, color: Colors.washroom});
            $('#piechart-stat .washroom').css('background', Colors.washroom);

            var livingroom = Appliance.getRoomInfo('livingroom');
            totalWatt += livingroom['watt'];
            pieData.push({value: livingroom['watt'] * 1000, color: Colors.livingroom});
            $('#piechart-stat .livingroom').css('background', Colors.livingroom);

            var bedroom = Appliance.getRoomInfo('bedroom');
            totalWatt += bedroom['watt'];
            pieData.push({value: bedroom['watt'] * 1000, color: Colors.bedroom});
            $('#piechart-stat .bedroom').css('background', Colors.bedroom);

            $('#piechart-stat .bathroom-perc').text(this.percentage(bathroom['watt'], totalWatt));
            $('#piechart-stat .homeoffice-perc').text(this.percentage(homeoffice['watt'], totalWatt));
            $('#piechart-stat .kitchen-perc').text(this.percentage(kitchen['watt'], totalWatt));
            $('#piechart-stat .washroom-perc').text(this.percentage(washroom['watt'], totalWatt));
            $('#piechart-stat .livingroom-perc').text(this.percentage(livingroom['watt'], totalWatt));
            $('#piechart-stat .bedroom-perc').text(this.percentage(bedroom['watt'], totalWatt));

            var template = _.template($("#graph").html());
            this.$el.find("#content-holder").html(template);
            var canvas = $('#canvas')[0];

            canvas.width = 208;
            canvas.height = 208;

            new Chart(canvas.getContext("2d")).Pie(pieData);

            $.mobile.loading("hide");
            return this;
        },
        percentage: function(value, total) {
            if (total === 0) {
                return '0%';
            }
            var perc = (value / total) * 100;
            return perc.toFixed(2) + '%';
        }
    });

    var RoomStatView = Backbone.View.extend({
        initialize: function() {
        },
        render: function(room) {
            var template = _.template($("#roomstat").html());
            this.$el.find("#content-holder").html(template);

            var applNames = [];
            var appReading = [];

            var canvas = $('#canvas')[0];
            canvas.height = $(window).height() * 0.65;

            var appliances = Appliance.getAppliances(room);

            for (var key in appliances) {
                var appliance = appliances[key];
                applNames.push(appliance['name'].ellipse(20));
                appReading.push(Appliance.getItemWatt(appliance) * 1000);
            }

            if (applNames.length === 1) {
                applNames.push('');
                appReading.push(0);
            }

            var data = {
                labels: applNames,
                datasets: [
                    {
                        fillColor: "rgba(62, 178, 73,0.5)",
                        strokeColor: "rgba(151,187,205,1)",
                        data: appReading
                    }
                ]
            };


            var myPie = new Chart(canvas.getContext("2d")).Bar(data);

            $.mobile.loading("hide");
            return this;
        }
    });


    var AboutView = Backbone.View.extend({
        initialize: function() {
        },
        render: function() {
            var template = _.template($("#about").html());
            this.$el.find("#content-holder").html(template);
            return this;
        }
    });
    var DisclaimerView = Backbone.View.extend({
        initialize: function() {
        },
        render: function() {
            var template = _.template($("#disclaimer").html());
            this.$el.find("#content-holder").html(template);
            return this;
        }
    });

    var ResetView = Backbone.View.extend({
        initialize: function() {
        },
        render: function() {
            var template = _.template($("#reset").html());
            this.$el.find("#content-holder").html(template);

            $('#clear-link').click(function(event) {
                Application.clearData();
            });
            return this;
        }
    });

    // Returns the View class
    return{
        HomeView: HomeView,
        TipsView: TipsView,
        SettingView: SettingView,
        RoomView: RoomView,
        GraphView: GraphView,
        ApplianceView: ApplianceView,
        DiscoverApplianceView: DiscoverApplianceView,
        AddApplianceView: AddApplianceView,
        EditApplianceView: EditApplianceView,
        RateView: RateView,
        AddCustomApplianceView: AddCustomApplianceView,
        RoomStatView: RoomStatView,
        AboutView: AboutView,
        DisclaimerView: DisclaimerView,
        ResetView: ResetView
    };
});