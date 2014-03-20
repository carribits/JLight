// Category View
// =============

// Includes file dependencies
define(["jquery", "backbone", "models/Model"], function($, Backbone, ModelModule) {
    var HomeView = Backbone.View.extend({
        initialize: function() {
            this.model.on("added", this.render, this);
        },
        // Renders all of the Category models on the UI
        render: function() {
            var data = this.model.attributes;
            var template = _.template($("#home").html());
            this.$el.find("#content-holder").html(template);
            return this;
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
            var appliances = DefaultAppliances[room];
            var template = _.template($("#discoverappliance").html());
            this.$el.find("#content-holder").html(template);
            var title = 'CHOOSE ' + room.toUpperCase() + ' ' + 'APPLIANCES TO ADD';

            $('#discoverappliance-title').text(title);

            for (var i = 0; i < appliances.length; i++) {
                var appliance = appliances[i];
                appliance['room'] = room;
                var item = '';
                if (count === 0) {
                    item = _.template($("script#appliance-add-first").html(), {"appliance": appliance});
                } else {
                    item = _.template($("script#appliance-add").html(), {"appliance": appliance});
                }
                this.$el.find('#discoverappliance-list').append(item);
                count++;
            }
            $.mobile.loading("hide");
            return this;
        }
    });

    var RoomView = Backbone.View.extend({
        initialize: function() {
        },
        render: function(name) {
            var title = name.toUpperCase() + ' ' + 'APPLIANCES';
            var template = _.template($("#room").html());
            this.$el.find("#content-holder").html(template);
            $('#room-button').attr('href', '#discoverappliance?' + name);

            $('#room-name').text(title);
            
            $.mobile.loading("hide");
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

    var AddApplianceView = Backbone.View.extend({
        initialize: function() {
        },
        render: function(room, appid) {
            var appliance = Appliance.getAppliance(room, appid);
            var applianceForm = _.template($("script#appliance-add-form").html(), {"appliance": appliance});
            
            var template = _.template($("#addappliance").html());
            this.$el.find("#content-holder").html(template);
            this.$el.find('#addappliance-form').html(applianceForm);
            $("#addappliance-form input#slider-0").slider();
            
            $("#addappliance-form #select-native-2").selectmenu();
            
            $.mobile.loading("hide");
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
        AddApplianceView: AddApplianceView
    };

});