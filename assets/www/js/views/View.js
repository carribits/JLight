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
            console.log(data);

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
        render: function() {
            var template = _.template($("#discoverappliance").html());
            this.$el.find("#content-holder").html(template);
            return this;
        }
    });

    var RoomView = Backbone.View.extend({
        initialize: function() {
        },
        render: function(name) {
            var template = _.template($("#room").html());
            this.$el.find("#content-holder").html(template);
            return this;
        }
    });

    var SettingView = Backbone.View.extend({
        initialize: function() {
        },
        render: function() {
            var template = _.template($("#about").html());
            this.$el.find("#content-holder").html(template);
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
        DiscoverApplianceView: DiscoverApplianceView
    };

});