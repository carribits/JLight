// Mobile Router
// =============
var Config = null;
var Storage = null;

// Includes file dependencies
define(["jquery", "backbone", "indexjs", "AppModules"],
        function($, Backbone, indexjs, AppModules) {
            //Import Modules
            Config = AppModules.Config;

            var CategoryRouter = Backbone.Router.extend({
                initialize: function() {
                    this.homeView = new AppModules.Views.HomeView({el: "#appview", model: new AppModules.Models.Reading()});
                    this.tipsView = new AppModules.Views.TipsView({el: "#appview", model: new AppModules.Models.Tips()});
                    this.settingView = new AppModules.Views.SettingView({el: "#appview", model: new AppModules.Models.Setting()});

                    Backbone.history.start();
                },
                // Backbone.js Routes
                routes: {
                    // When there is no hash bang on the url, the home method is called
                    "": "home",
                    "home": "home",
                    "tips": "tips",
                    "setting": "setting"
                },
                route: function(route, name, callback) {
                    var router = this;
                    if (!callback)
                        callback = this[name];

                    var f = function() {
                        this.resetIcons();
                        $.mobile.loading("show");
                        callback.apply(router, arguments);
                    };
                    return Backbone.Router.prototype.route.call(this, route, name, f);
                },
                resetIcons: function() {
                    $('#home-icon').removeClass('ui-icon-home-a');
                    $('#tips-icon').removeClass('ui-icon-tips-a');
                    $('#setting-icon').removeClass('ui-icon-setting-a');
                },
                home: function() {
                    $('#home-icon').addClass('ui-icon-home-a');
                    this.homeView.model.fetch().done(function() {
                       
                    });
                    $.mobile.loading("hide");
                },
                tips: function() {
                    $('#tips-icon').addClass('ui-icon-tips-a');
                    $.mobile.loading("hide");
                },
                setting: function() {
                    $('#setting-icon').addClass('ui-icon-setting-a');
                    $.mobile.loading("hide");
                },
                disclaimer: function() {
                    $(".jqm-navmenu-panel").panel("close");

                    $('.jqm-navmenu-panel #disclaimer-link').on('click', function(e) {
                        $(".jqm-navmenu-panel").panel("close");
                    });

                    $.mobile.loading("hide");
                    this.disclaimerView.render();
                },
                about: function() {
                    $(".jqm-navmenu-panel").panel("close");

                    $('.jqm-navmenu-panel #about-link').on('click', function(e) {
                        $(".jqm-navmenu-panel").panel("close");
                    });

                    $.mobile.loading("hide");
                    this.aboutView.render();
                }
            });

            // Returns the Router class
            return CategoryRouter;
        });