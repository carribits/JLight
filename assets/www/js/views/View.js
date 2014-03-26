// Category View
// =============

// Includes file dependencies
define(["jquery", "backbone", "models/Model"], function($, Backbone, ModelModule) {

    var BaseView = Backbone.View.extend({
        validateAppliance: function(params) {
            if (!Utility.isNumeric(params['quantity']) || !Utility.isNumeric(params['hours'])) {
                alert("Values entered are incorrect");
                return false;
            }

            console.log();
            if (params['hours'] <= 0 || params['quantity'] <= 0) {
                alert("Values entered are incorrect");
                return false;
            }

            if (params['usage'] === 'daily' && params['hours'] > 24) {
                alert("Hours must be between 1 and 24 for daily usage");
                return false;
            }
            if (params['usage'] === 'weekly' && params['hours'] > 168) {
                alert("Hours must be between 1 and 168 for weekly usage");
                return false;
            }

            if (params['usage'] === 'monthly' && params['hours'] > 730) {
                alert("Hours must be between 1 and 730 for monthly usage");
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
            this.renderIconView();
            this.renderListView();
            return this;
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

            var divider = _.template($("script#new-divider").html(), {room: roomName, class: elClass});
            this.$el.find('#news-list').append(divider);

            var applianceItem = _.template($("script#new-item").html(), {"appliances": appliances});
            console.log(appliances);
            this.$el.find('#news-list').append(applianceItem);
        },
        renderIconView: function() {
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
            this.$el.find('ul#meter-total .room-watt').text(this.houseInfo['watt'] + ' KW');
            this.$el.find('ul#meter-total .room-cost').text('$ ' + this.houseInfo['cost']);
        },
        computeRoom: function(room) {
            var roomInfo = Appliance.getRoomInfo(room);
            this.$el.find('ul#' + room + ' .appliance-count').text(roomInfo['count'] + ' Appliance(s)');
            this.$el.find('ul#' + room + ' .room-watt').text(roomInfo['watt'] + ' KW');
            this.$el.find('ul#' + room + ' .room-cost').text('$ ' + roomInfo['cost']);

            this.houseInfo.count += roomInfo['count'];
            this.houseInfo.watt += parseFloat(roomInfo['watt']);
            this.houseInfo.cost += parseFloat(roomInfo['cost']);
        }
    });

    var TipsView = Backbone.View.extend({
        initialize: function() {
        },
        render: function() {
            var template = _.template($("#disclaimer").html());
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
            var template = _.template($("#discoverappliance").html());
            this.$el.find("#content-holder").html(template);
            var title = 'CHOOSE ' + room.toUpperCase() + ' ' + 'APPLIANCES TO ADD';

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

            var title = room.toUpperCase() + ' ' + 'APPLIANCES';
            var template = _.template($("#room").html());
            this.$el.find("#content-holder").html(template);
            $('.room-button').attr('href', '#discoverappliance?' + room);
            $('#room-name').text(title);

            var appliances = Storage.readJson(storageIndex);
            if (appliances === null) {
                appliances = {};
            }


            for (var key in appliances) {
                var applianceDetails = appliances[key];
                var appliance = Appliance.getAppliance(room, key);
                $.extend(appliance, applianceDetails);
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
            $("#popupDialog").popup( );
            return this;
        }
    });

    var SettingView = Backbone.View.extend({
        initialize: function() {
        },
        render: function() {
            var template = _.template($("#about").html());
            this.$el.find("#content-holder").html(template);

            $.mobile.loading("hide");
            return this;
        }
    });

    var ApplianceView = Backbone.View.extend({
        initialize: function() {
        },
        render: function(name) {
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
            $("#addappliance-form #appliance-usage").selectmenu();
            $("#addappliance-form #appliance-quantity").textinput();

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
                    room: room
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

            var applianceForm = _.template($("script#appliance-add-form").html(), {"appliance": appliance});

            var template = _.template($("#addappliance").html());
            this.$el.find("#content-holder").html(template);
            this.$el.find('#addappliance-form').html(applianceForm);
            $("#addappliance-form input#appliance-hours").textinput();

            for (var i = 0; i < appliance['usage_list'].length; i++) {
                option += '<option value="' + appliance['usage_list'][i] + '">' + ucfirst(appliance['usage_list'][i]) + '</option>';
            }
            $("#addappliance-form #appliance-usage").html(option);

            $("#addappliance-form #appliance-usage").selectmenu();
            $("#addappliance-form #appliance-quantity").textinput();

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
                    room: room
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
            var pieData = [
                {
                    value: 30,
                    color: "#F38630"
                },
                {
                    value: 50,
                    color: "#00688B"
                },
                {
                    value: 100,
                    color: "#aa609b"
                },
                {
                    value: 30,
                    color: "#82ba00"
                },
                {
                    value: 50,
                    color: "#f92e2e"
                },
                {
                    value: 100,
                    color: "#d24726"
                }
            ];
            var template = _.template($("#graph").html());
            this.$el.find("#content-holder").html(template);
            var canvas = $('#canvas')[0];
            var myPie = new Chart(canvas.getContext("2d")).Pie(pieData);

            $.mobile.loading("hide");
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
        EditApplianceView: EditApplianceView
    };

});