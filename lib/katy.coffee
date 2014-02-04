root = this

# Based on String Lambdas (c) Oliver Steele
# http://osteele.com/javascripts/functional

if 'ab'.split(/a*/).length < 2
  console?.log "Warning: IE6 split is not ECMAScript-compliant.  This breaks '->1' in Katy"

to_function = (str) ->
  params = []
  expr = str
  # sections = expr.ECMAsplit(/\s*->\s*/m)
  sections = expr.split(/\s*->\s*/m)
  if sections.length > 1
    while sections.length
      expr = sections.pop()
      params = sections.pop().split(/\s*,\s*|\s+/m)
      sections.length && sections.push('(function('+params+'){return ('+expr+')})')
  else if expr.match(/\b_\b/)
    params = '_'
  else
    # test whether an operator appears on the left (or right), respectively
    leftSection = expr.match(/^\s*(?:[+*\/%&|\^\.=<>]|!=)/m)
    rightSection = expr.match(/[+\-*\/%&|\^\.=<>!]\s*$/m)
    if leftSection || rightSection
      if (leftSection)
        params.push('$1')
        expr = '$1' + expr
      if (rightSection)
        params.push('$2')
        expr = expr + '$2'
    else
      # `replace` removes symbols that are capitalized, follow '.',
      # precede ':', are 'this' or 'arguments'; and also the insides of
      # strings (by a crude test).  `match` extracts the remaining
      # symbols.
      vars = str
        .replace(/(?:\b[A-Z]|\.[a-zA-Z_$])[a-zA-Z_$\d]*|[a-zA-Z_$][a-zA-Z_$\d]*\s*:|this|arguments|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, '')
          .match(/([a-z_$][a-z_$\d]*)/gi) || []
      for v in vars
        params.indexOf(v) >= 0 || params.push(v)
  new Function(params, 'return (' + expr + ')')

functionalize = (fn) ->
  if typeof(fn) is 'function'
    fn
  else if typeof(fn) is 'string' and /^[_a-zA-Z]\w*$/.test(fn)
    (receiver, args...) ->
      receiver[fn].call(receiver, args...)
  else if typeof(fn) is 'string'
    to_function(fn)
  else if typeof(fn.lambda) is 'function'
    fn.lambda()
  else if typeof(fn.toFunction) is 'function'
    fn.toFunction()

class OneTimeWrapper
  constructor: (@what) ->
  K: (fn, args...) ->
    functionalize(fn).apply(@what, @what, args)
    @what
  T: (fn, args...) ->
    functionalize(fn).apply(@what, @what, args)
  chain: -> new MonadicWrapper(@what)
  value: -> @what

class MonadicWrapper
  constructor: (@what) ->
  K: (fn, args...) ->
    functionalize(fn).apply(@what, @what, args)
    this
  T: (fn, args...) ->
    new MonadicWrapper(functionalize(fn).apply(@what, @what, args))
  chain: -> this
  value: -> @what

root.KT = (what) -> new OneTimeWrapper(what)

root.KT.mixInto = (clazzes...) ->
  for clazz in clazzes
    do (clazz) ->
      clazz.prototype.K = (fn, args...) ->
        functionalize(fn).apply(this, this, args)
        this
      clazz.prototype.T = (fn, args...) ->
        functionalize(fn).apply(this, this, args)