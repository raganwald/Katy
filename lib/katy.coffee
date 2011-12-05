root = this

functionalize = (fn) ->
  if typeof(fn) is 'function'
    fn
  else if typeof(fn) is 'string' and /^[_a-zA-Z]\w*$/.test(fn)
    (receiver, args...) ->
      receiver[fn].call(receiver, args...)
  else if typeof(fn.lambda) is 'function'
    fn.lambda()
  else if typeof(fn.toFunction) is 'function'
    fn.toFunction()

class OneTimeWrapper
  constructor: (@what) ->
  K: (fn, args...) ->
    functionalize(fn)(@what, args...)
    @what
  T: (fn, args...) ->
    functionalize(fn)(@what, args...)

root.KT = (what) -> new OneTimeWrapper(what)

root.KT.mixInto = (clazzes...) ->
  for clazz in clazzes
    do (clazz) ->
      clazz.prototype.K = (fn, args...) ->
        functionalize(fn)(this, args...)
        this
      clazz.prototype.T = (fn, args...) ->
        functionalize(fn)(this, args...)

root.KT.installStringLambdas = ->
  require('./to-function.js') unless String.prototype.lambda?