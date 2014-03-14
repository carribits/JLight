// Mobile Router
// =============
var Config = null;
var Storage = null;


var liveDada = {};
var Monitor = {};

// Includes file dependencies
define(["jquery", "backbone", "indexjs", "AppModules"],
        function($, Backbone, indexjs, AppModules) {
            //Import Modules
            Config = AppModules.Config;
            LiveData = AppModules.Utility.LiveData;
            Storage = AppModules.Utility.Storage;
            Monitor = AppModules.Utility.Monitor;

            var CategoryRouter = Backbone.Router.extend({
                initialize: function() {
                    this.indexDetailsView = new AppModules.Views.IndexDetailsView({el: "#appview", model: new AppModules.Models.MarketIndexFull()});
                    this.homeView = new AppModules.Views.HomeView({el: "#appview", model: new AppModules.Models.DailyMainMarketSummary()});
                    this.quoteView = new AppModules.Views.QuoteView({el: "#appview", model: new AppModules.Models.Quote()});
                    this.newsView = new AppModules.Views.NewsView({el: "#appview", model: new AppModules.Models.News()});
                    this.newsItemView = new AppModules.Views.NewsItemView({el: "#appview", model: new AppModules.Models.NewsItem()});
                },
                // Backbone.js Routes
                routes: {
                    // When there is no hash bang on the url, the home method is called
                    "": "home",
                    "home": "home",
                    "report": "report",
                    "calendar": "calendar",
                    "news?:id": "viewnews",
                    "news": "news",
                    "quote": "quote"
                },
                route: function(route, name, callback) {

                    var router = this;
                    if (!callback)
                        callback = this[name];

                    var f = function() {
                        $("#index-navbar").hide();
                        $("#index-details-navbar").hide();
                        $("#quote-navbar").hide();
                        $("#symbol-navbar").hide();
                        this.resetIcons();
                        $.mobile.loading("show");
                        callback.apply(router, arguments);
                    };
                    return Backbone.Router.prototype.route.call(this, route, name, f);
                },
                resetIcons: function() {
                    $('#home-icon').removeClass('ui-icon-home-a');
                    $('#quote-icon').removeClass('ui-icon-quote-a');
                    $('#news-icon').removeClass('ui-icon-news-a');
                },
                // Home method
                home: function() {
                    $('#home-icon').addClass('ui-icon-home-a');
                    $("#index-navbar").show();
                    var self = this;

                    
                },
                news: function() {
                    $('#news-icon').addClass('ui-icon-news-a');
                    var self = this;
                    var success = function() {
                        $.mobile.loading("hide");
                        self.newsView.render();
                    };
                    var error = function() {
                        $.mobile.loading("hide");
                    };
                    this.newsView.model.fetch({success: success, error: error});
                },
                viewnews: function(id) {
                    this.newsItemView.render(id);
                },
                symboldetail: function(id) {
                    var self = this;
                    $("#symbol-navbar").show();

                    this.symbolDetailView.render(id);

                    $('#symbol-navbar ul li a').on('click', function(e) {
                        e.preventDefault();
                        var el = e.target.id;
                        var divId = '';
                        switch (el)
                        {
                            case 'trade-data-tab':
                                divId = '#trade-data-tab-page';
                                break;
                            case 'performance-tab':
                                divId = '#performance-tab-page';
                                break;
                        }
                        self.symbolDetailView.changeTab(divId);
                    });
                    $("#trade-data-tab").trigger("click");
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