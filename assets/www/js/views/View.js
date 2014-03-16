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

    // Returns the View class
    return{
        HomeView: HomeView,
        TipsView: TipsView,
        SettingView: SettingView,
        RoomView: RoomView
    };

});