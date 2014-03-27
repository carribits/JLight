// Mobile Router
// =============
var Config = null;
var Storage = null;
var DefaultAppliances = null;
var Appliance = null;
var Utility = null;
var Application = null;

// Includes file dependencies
define(["jquery", "backbone", "indexjs", "AppModules"],
        function($, Backbone, indexjs, AppModules) {
            Config = AppModules.Config;
            Storage = AppModules.Utility.Storage;
            DefaultAppliances = AppModules.Utility.DefaultAppliances;
            Appliance = AppModules.Utility.Appliance;
            Utility = AppModules.Utility.Utility;
            Application = AppModules.Utility.Application;

            var CategoryRouter = Backbone.Router.extend({
                initialize: function() {
                    this.homeView = new AppModules.Views.HomeView({el: "#appview", model: new AppModules.Models.Reading()});
                    this.tipsView = new AppModules.Views.TipsView({el: "#appview", model: new AppModules.Models.Tips()});
                    this.settingView = new AppModules.Views.SettingView({el: "#appview", model: new AppModules.Models.Setting()});
                    this.roomView = new AppModules.Views.RoomView({el: "#appview"});
                    this.graphView = new AppModules.Views.GraphView({el: "#appview"});
                    this.applianceView = new AppModules.Views.ApplianceView({el: "#appview"});
                    this.discoverApplianceView = new AppModules.Views.DiscoverApplianceView({el: "#appview"});
                    this.addApplianceView = new AppModules.Views.AddApplianceView({el: "#appview"});
                    this.editApplianceView = new AppModules.Views.EditApplianceView({el: "#appview"});
                    this.rateView = new AppModules.Views.RateView({el: "#appview"});
                    this.addcustomApplianceView = new AppModules.Views.AddCustomApplianceView({el: "#appview"});

                    Backbone.history.start();
                },
                routes: {
                    "": "home",
                    "home": "home",
                    "tips": "tips",
                    "setting": "setting",
                    "room?:room": "room",
                    "appliance?:room": "appliance",
                    "discoverappliance": "discoverappliance",
                    "addappliance?:room?:appid": "addappliance",
                    "editappliance?:room?:appid": "editappliance",
                    "graph": "graph",
                    "appliancestat": "appliancestat",
                    "setrate": "setrate",
                    "addcustom": "addcustom"
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
                    this.homeView.render();
                    $.mobile.loading("hide");
                },
                appliance: function(name) {
                    this.applianceView.render(name);
                },
                discoverappliance: function(name) {
                    this.discoverApplianceView.render(name);
                },
                addappliance: function(room, appid) {
                    this.addApplianceView.render(room, appid);
                },
                editappliance: function(room, appid) {
                    console.log('cccc');
                    this.editApplianceView.render(room, appid);
                },
                room: function(name) {
                    this.roomView.render(name);
                },
                graph: function(name) {
                    this.graphView.render(name);
                },
                tips: function() {
                    $('#tips-icon').addClass('ui-icon-tips-a');
                    this.tipsView.render(name);
                    $.mobile.loading("hide");
                },
                setting: function() {
                    $('#setting-icon').addClass('ui-icon-setting-a');
                    this.settingView.render();
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
                },
                setrate: function() {
                    this.rateView.render();
                    //$.mobile.changePage("#test");
                    $.mobile.loading("hide");
                },
                addcustom: function() {
                    this.addcustomApplianceView.render();
                    $.mobile.loading("hide");
                }
            });
            return CategoryRouter;
        });