(function() {
  var MonadicWrapper, OneTimeWrapper, functionalize, root;
  var __slice = Array.prototype.slice;

  root = this;

  functionalize = function(fn) {
    if (typeof fn === 'function') {
      return fn;
    } else if (typeof fn === 'string' && /^[_a-zA-Z]\w*$/.test(fn)) {
      return function() {
        var args, receiver, _ref;
        receiver = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return (_ref = receiver[fn]).call.apply(_ref, [receiver].concat(__slice.call(args)));
      };
    } else if (typeof fn.lambda === 'function') {
      return fn.lambda();
    } else if (typeof fn.toFunction === 'function') {
      return fn.toFunction();
    }
  };

  OneTimeWrapper = (function() {

    function OneTimeWrapper(what) {
      this.what = what;
    }

    OneTimeWrapper.prototype.K = function() {
      var args, fn;
      fn = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      functionalize(fn).apply(null, [this.what].concat(__slice.call(args)));
      return this.what;
    };

    OneTimeWrapper.prototype.T = function() {
      var args, fn;
      fn = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return functionalize(fn).apply(null, [this.what].concat(__slice.call(args)));
    };

    OneTimeWrapper.prototype.chain = function() {
      return new MonadicWrapper(this.what);
    };

    OneTimeWrapper.prototype.value = function() {
      return this.what;
    };

    return OneTimeWrapper;

  })();

  MonadicWrapper = (function() {

    function MonadicWrapper(what) {
      this.what = what;
    }

    MonadicWrapper.prototype.K = function() {
      var args, fn;
      fn = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      functionalize(fn).apply(null, [this.what].concat(__slice.call(args)));
      return this;
    };

    MonadicWrapper.prototype.T = function() {
      var args, fn;
      fn = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return new MonadicWrapper(functionalize(fn).apply(null, [this.what].concat(__slice.call(args))));
    };

    MonadicWrapper.prototype.chain = function() {
      return this;
    };

    MonadicWrapper.prototype.value = function() {
      return this.what;
    };

    return MonadicWrapper;

  })();

  root.KT = function(what) {
    return new OneTimeWrapper(what);
  };

  root.KT.mixInto = function() {
    var clazz, clazzes, _i, _len, _results;
    clazzes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    _results = [];
    for (_i = 0, _len = clazzes.length; _i < _len; _i++) {
      clazz = clazzes[_i];
      _results.push((function(clazz) {
        clazz.prototype.K = function() {
          var args, fn;
          fn = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          functionalize(fn).apply(null, [this].concat(__slice.call(args)));
          return this;
        };
        return clazz.prototype.T = function() {
          var args, fn;
          fn = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          return functionalize(fn).apply(null, [this].concat(__slice.call(args)));
        };
      })(clazz));
    }
    return _results;
  };

  root.KT.installStringLambdas = function() {
    if (String.prototype.lambda == null) return require('./to-function.js');
  };

}).call(this);
