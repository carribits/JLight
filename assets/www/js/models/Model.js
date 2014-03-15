// Category Model
// ==============

// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {
    var BaseModel = Backbone.Model.extend({
    });

    Reading = Backbone.Model.extend({
        initialize: function() {

        },
        sync: function(method, model, options) {
            var categories = {a: 1};
            var deferred = $.Deferred();

            options.success(categories);
            this.trigger("added");
            deferred.resolve();
            return deferred;
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
        Reading: Reading,
        Tips: Tips,
        Setting: Setting
    };

});