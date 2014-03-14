// Category Model
// ==============

// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {
    var BaseModel = Backbone.Model.extend({
        getImageDir: function(value) {
            var image = 'one_pixel';
            if (value.indexOf("mov_down") !== -1) {
                image = 'mov_down';
            } else if (value.indexOf("mov_up") !== -1) {
                image = 'mov_up';
            }
            return image;
        },
        getImageClass: function(value) {
            var ImgClass = '';
            if (value.indexOf("mov_down") !== -1) {
                ImgClass = 'value-dir-down';
            } else if (value.indexOf("mov_up") !== -1) {
                ImgClass = 'value-dir-up';
            }
            return ImgClass;
        }
    });

    Symbol = Backbone.Model.extend({
        initialize: function() {
        },
        urlRoot: function() {
            return  Config.baseurl + "/symbollookup/allsymbols";
        },
        parse: function(response) {
            this.symbols = response;

            return this;
        }
    });

    SymbolDetail = Backbone.Model.extend({
        initialize: function(symbolCode) {
            this.symbolCode = symbolCode;
        },
        urlRoot: function() {
            return  Config.baseurl + "/symbollookup/symboldata?symbol_code=" + this.symbolCode;
        },
        parse: function(response) {
            this.symbol = response;
            return this;
        }
    });

    DailyMainMarketSummary = Backbone.Model.extend({
        initialize: function(options) {
        },
        urlRoot: function() {
            return  Config.baseurl + "/mainmarket/dailysummary?date=" + Config.stockDate;
        },
        parse: function(response) {
            if (response.stocks !== null) {
                this.advancing = response.stocks.ADVANCING;
                this.declining = response.stocks.DECLINING;
                this.tradingFirm = response.stocks.TRADING_FIRM;
                this.summary1 = response.details.summary1;
                this.summary2 = response.details.summary2;
                this.summarydate = response.details.summary_date;

                return this;
            }
            return null;
        }
    });

    NewsItem = Backbone.Model.extend({
        initialize: function(newsId) {
            this.newsId = newsId;
        },
        urlRoot: function() {
            return  Config.baseurl + "/news/viewnews?id=" + this.newsId;
        },
        parse: function(response) {
            this.data = response;
            return this;
        }
    });

    MarketIndexDetails = Backbone.Model.extend({
        initialize: function() {

        },
        urlRoot: function() {
            return  Config.baseurl + "/mainmarket/marketindexdetails?date=" + Config.stockDate
                    + '&index_name=' + options.indexName;
        },
        parse: function(response) {
            response['change_dir'] = BaseModel.prototype.getImageDir.call(this, response['change_dir']);
            response['change_perc_dir'] = BaseModel.prototype.getImageDir.call(this, response['change_dir']);

            this.data = response;
            return this;
        }
    });

    MarketIndexFull = Backbone.Model.extend({
        initialize: function(options) {
        },
        urlRoot: function() {
            return  Config.baseurl + "/mainmarket/marketindexfulldetails?date=" + Config.stockDate
                    + '&index_name=' + options.indexName;
        },
        parse: function(response) {
            this.composition = response['composition'];
            this.history = response['history'];
            this.information = response['information'];
            this.performance = response['performance'];

            this.information['change_dir'] = BaseModel.prototype.getImageClass.call(this, this.information['change_dir']);
            this.information['change_perc_dir'] = BaseModel.prototype.getImageClass.call(this, this.information['change_perc_dir']);

            this.information['wtd_direction'] = BaseModel.prototype.getImageClass.call(this, this.information['wtd_direction']);
            this.information['mtd_direction'] = BaseModel.prototype.getImageClass.call(this, this.information['mtd_direction']);
            this.information['qtd_direction'] = BaseModel.prototype.getImageClass.call(this, this.information['qtd_direction']);
            this.information['ytd_direction'] = BaseModel.prototype.getImageClass.call(this, this.information['ytd_direction']);
            return this;
        }
    });

    Quote = Backbone.Model.extend({
        initialize: function(options) {
        },
        urlRoot: function() {
            return  Config.baseurl + "/mainmarket/dailyquote?date=" + Config.stockDate;
        },
        parse: function(response) {
            this.quote = response.quote;
            this.ordinaryShares = response.ordinary_shares;
            this.preferenceShares = response.preference_shares;
            this.usDenominatedShares = response.us_denominated_shares;
            return this;
        }
    });



    News = Backbone.Model.extend({
        initialize: function(options) {
        },
        urlRoot: function() {
            return  Config.baseurl + "/news/dailynews?date=" + Config.stockDate;
        },
        parse: function(response) {
            this.news = response;
            return this;
        }
    });
    // Returns the Model class
    return {
        DailyMainMarketSummary: DailyMainMarketSummary,
        MarketIndexDetails: MarketIndexDetails,
        MarketIndexFull: MarketIndexFull,
        Quote: Quote,
        News: News,
        NewsItem: NewsItem,
        Symbol: Symbol,
        SymbolDetail: SymbolDetail,
    };

});