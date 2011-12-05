root = this

class Wrapper
  constructor: (@what) ->
  K: (fn) ->
    fn(@what)
    @what
  T: (fn) ->
    fn(@what)
  yourself: -> @what

root.KT = (what) -> new Wrapper(what)