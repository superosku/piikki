var chromedriver = require('chromedriver');
module.export = {
  before : function(done) {
    chromedriver.start();
    done();
  },

  after : function(done) {
    chromedriver.stop();
    done();
  }
};
