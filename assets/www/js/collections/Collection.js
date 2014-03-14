define(["jquery", "backbone", "models/Model"], function($, Backbone, ModelModule) {
    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend({
      
    });
    // Returns the Model class
    return {
        Collection: Collection,
    };
});