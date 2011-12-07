(function() {
  var MonadicWrapper, OneTimeWrapper, functionalize, root, to_function;
  var __slice = Array.prototype.slice;

  root = this;

  if ('ab'.split(/a*/).length < 2) {
    if (typeof console !== "undefined" && console !== null) {
      console.log("Warning: IE6 split is not ECMAScript-compliant.  This breaks '->1' in Katy");
    }
  }

  to_function = function(str) {
    var expr, leftSection, params, rightSection, sections, v, vars, _i, _len;
    params = [];
    expr = str;
    sections = expr.split(/\s*->\s*/m);
    if (sections.length > 1) {
      while (sections.length) {
        expr = sections.pop();
        params = sections.pop().split(/\s*,\s*|\s+/m);
        sections.length && sections.push('(function(' + params + '){return (' + expr + ')})');
      }
    } else if (expr.match(/\b_\b/)) {
      params = '_';
    } else {
      leftSection = expr.match(/^\s*(?:[+*\/%&|\^\.=<>]|!=)/m);
      rightSection = expr.match(/[+\-*\/%&|\^\.=<>!]\s*$/m);
      if (leftSection || rightSection) {
        if (leftSection) {
          params.push('$1');
          expr = '$1' + expr;
        }
        if (rightSection) {
          params.push('$2');
          expr = expr + '$2';
        }
      } else {
        vars = str.replace(/(?:\b[A-Z]|\.[a-zA-Z_$])[a-zA-Z_$\d]*|[a-zA-Z_$][a-zA-Z_$\d]*\s*:|this|arguments|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, '').match(/([a-z_$][a-z_$\d]*)/gi) || [];
        for (_i = 0, _len = vars.length; _i < _len; _i++) {
          v = vars[_i];
          params.indexOf(v) >= 0 || params.push(v);
        }
      }
    }
    return new Function(params, 'return (' + expr + ')');
  };

  functionalize = function(fn) {
    if (typeof fn === 'function') {
      return fn;
    } else if (typeof fn === 'string' && /^[_a-zA-Z]\w*$/.test(fn)) {
      return function() {
        var args, receiver, _ref;
        receiver = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return (_ref = receiver[fn]).call.apply(_ref, [receiver].concat(__slice.call(args)));
      };
    } else if (typeof fn === 'string') {
      return to_function(fn);
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

}).call(this);
