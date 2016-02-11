var config = {};

var env = process.env.NODE_ENV;
console.log("Environment: " + env);

config.enableCache = true;
config.enableImageCache = true;
config.version = "1.1.8";
config.useragent = 'TheBatServer (http://thebatplayer.fm v' + config.version + ')';
config.cachetime = 5;

config.discogsAccesskey = "DISCOGS-ACCESS-KEY";
config.discogsSecret = "DISCOGS-SECRET";
config.lastfmKey = "LASTFM-KEY";

config.gracenoteClientId = "GRACENOTE-CLIENT-ID";
config.gracenoteClientTag = "GRACENOTE-CLIENT-TAG";
config.gracenoteUserId = "GRACENOTE-USER-ID";

config.enableAnalytics = true;

config.rollbarKey = "ROLLBARKEY"; // Used for error reporting

// https://www.imgix.com/docs
config.imgixKey = "IMGXKEY" // Used for image generation

// For remote logging
config.paperTrailHost = "something.papertrailapp.com";
config.paperTrailPort = 12345;


// Override for tests
if (env === "test") {
  config.enableCache = false;
  config.enableImageCache = false;
  config.enableAnalytics = false;
}

// This is the Amazon AWS elasticache autodiscovery server that returns back a memcache instance
// https://aws.amazon.com/elasticache/faqs/
config.awsElasticacheConfigServer = "something.like.cfg.usw2.cache.amazonaws.com:11211";
module.exports = config;
