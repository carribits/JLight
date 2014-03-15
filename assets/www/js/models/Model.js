// Category Model
// ==============

// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {
    var BaseModel = Backbone.Model.extend({
    });

    Home = Backbone.Model.extend({
        initialize: function() {

        }
    });

    Tips = Backbone.Model.extend({
        initialize: function() {

        }
    });

    Setting = Backbone.Model.extend({
        initialize: function() {

        }
    });

    // Returns the Model class
    return {
        Home: Home,
        Tips: Tips,
        Setting: Setting
    };

});