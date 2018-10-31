function Countdown(config) {
  this.selectors = config.selectors;
  this.fill = config.fill;
  this.initialDate = config.date;
  this.counts = config.counts;
  this.time = config.time;

  this.types = config.types.split(' ');

  this.$base = $(this.selectors.base);

  this.$el = {};
  this.$val = {};
  this.radius = {};
  this.array = {};
  this.dash = {};
  this.left = {};

  this.init();

  this.timer = null;
}

Countdown.prototype.init = function() {
  this.types.forEach(function(type) {
    var $el = $(this.selectors.base + '-' + type + '-' + this.selectors.suffix);
    var $val = $(this.selectors.base +'-' + this.selectors.prefix + '-' +type);
    var radius = Number($el.attr('r'));
    var array = 2 * Math.PI * radius;
    var dash = array / this.counts[type];

    this.$el[type] = $el;
    this.$val[type] = $val;
    this.radius[type] = radius;
    this.array[type] = array;
    this.dash[type] = dash;
    this.left[type] = this.initialDate[type];
  }, this);
};

Countdown.prototype.setValue = function(type) {
  var counts = this.counts[type];
  var val = ('0' + (this.counts[type] + this.left[type] % counts) % counts).slice(-2);
  this.$val[type].html(val);
};

Countdown.prototype.setState = function(type) {
  this.$el[type].css({
    'stroke-dasharray': this.array[type],
    'stroke-dashoffset': -this.array[type] + this.dash[type] * this.left[type]
  });
  setTimeout(function() {
    this.setValue(type);
  }.bind(this), this.time / 2);
};

Countdown.prototype.setFillAnimation = function() {
  //TODO calc browser css preffix
  var prefix = '';
  for(var type in this.fill) {
    var anim = this.fill[type];
    var name = 'jsgeneratedfill' + type;
    var keyframe = '@' + prefix + 'keyframes ' +
        name + ' { ';
    for(var pos in anim) {
      var val = -this.array[type] + anim[pos] * this.dash[type] * this.left[type];
      keyframe += pos + '% {' +
        'stroke-dashoffset: ' +
        val +
        ';} ';
    }
    keyframe += '} ';
    this.$el[type].css('animation-name', name);
    document.styleSheets[0].insertRule(keyframe, 0);
  }
};

Countdown.prototype.show = function() {
  this.types.forEach(this.setState.bind(this));
  this.setFillAnimation();

  this.$base.show();
  return this;
};

Countdown.prototype.hide = function() {
  this.$base.hide();
  return this;
};

Countdown.prototype._decrementType = function(index) {
  var type = this.types[index];
  var left = --this.left[type];
  if(index === -1) {
    this.stop();
  }
  this.setState(type);
  if(left % this.counts[type] === 0 && index >= 0) {
    this._decrementType(index - 1);
  }
};

Countdown.prototype.start = function() {
  this.timer = setInterval(function() {
    this._decrementType(this.types.length - 1);
  }.bind(this), this.time);
  return this;
};

Countdown.prototype.stop = function() {
  this.pause();
  setTimeout(function() {
    if(this.timeout) this.timeout();
  }.bind(this), this.time);
  return this;
};

Countdown.prototype.pause = function() {
  clearInterval(this.timer);
  return this;
};

Countdown.prototype.onEnd = function(cb) {
  this.timeout = cb;
  return this;
};

var endDate = new Date('February 1, 2019, 12:00:00');
var date = new Date();

var _second = 1000;
var _minute = _second * 60;
var _hour = _minute * 60;
var _day = _hour * 24;

var delta = endDate - date;

var days = Math.floor(delta / _day);
delta -= days * _day
var hours = Math.floor(delta / _hour);
delta -= hours * _hour;
var minutes = Math.floor(delta / _minute);
var seconds = Math.floor((delta - minutes * _minute) / 1000);

var countdown = new Countdown({
  selectors: {
    base: '#main-timer',
    suffix: 'circle',
    prefix: 'digits'
  },
  types: 'days hours minutes seconds',
  date: {
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds
  },
  counts: {
    days: 100,
    hours: 24,
    minutes: 60,
    seconds: 60
  },
  time: 1000,
  fill: {
    days: {
      0: 0,
      20: 0,
      100: 1
    },
    hours: {
      0: 0,
      100: 1
    }
  }
}).hide();

$(window).load(function() {
  countdown
    .onEnd(function() {
      window.alert('That\'s all folks!');
    })
    .show()
    .start();
});
