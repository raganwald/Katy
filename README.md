Katy: Coffeescript Combinators
===

Katy makes writing [fluent][fluent] Coffeescript easy by providing the `.K` and `.T` combinators for Coffeescript objects.

The **tl;dr** is that Katy adds two methods, `.K` and `.T` to any class or classes you desire:

```coffeescript
KT = require('Katy').KT

KT.mixInto(String)

# K calls a function on the receiver and returns the receiver

'Hello'.K (s) -> s + ' World'
  # => returns 'Hello'
  
# T calls a function on the receiver and returns the result

'Hello'.K (s) -> s + ' World'
  # => returns 'Hello World'
```

You can also call any method by name:

```coffeescript
KT.mixInto(Array)

[1..10]
  .K('pop')
  .K('pop')
  .K('pop')
  .T('pop')
  # => returns 7
```

## How does that make my code more fluent?

You're familiar with [fluent interfaces][fluent]. They're great, but they rely on the author of the API making sure that each function returns its receiver. The `.K` method allows you to make any function or method "fluent" even if the original author has other ideas. The `.K` and `.T` methods also allow you to write your own methods and 'call' them just as if they were baked into the original object. For example, you can fake an `identifiers` filter for arrays of strings:

[fluent]: http://en.wikipedia.org/wiki/Fluent_interface

```coffeescript
require 'underscore'

identifiers = (arrOfSymbols) ->
  _.select arrOfSymbols, (str) ->
    /^[_a-zA-Z]\w*$/.test(str)
  
someArray
  .T(identifiers)
  .K('someMethodName')
  .T(someOtherFilter)
```

This is cleaner than trying to mix oridinary functions with methods and adopting tenporary variables when you want to work around what the function was written to return. In this example, having extended `Array.prototype` with `.K` and `.T` once, you need not extend it any more to add your own custom methods.

To recap:

1. You can make any function into something that can be called like a method, making your code read more naturally, and;
2. You can give any function or built-in method either "fluent" (return the receiver) or "pipeline" (return its value) semantics as you please.

## Monkey-patching is evil!

I agree. `KT(foo).K(...)` and `KT(foo).T(...)` work just fine without mixing `.K` and `.T` into an existing class, much as `_(...).tap` and other methods work without modifying an existing class. Also:

```coffeescript

KT([1..10])
  .chain()
  .K('pop')
  .K('pop')
  .K('pop')
  .T('pop')
  .value()
  # => returns 7
```

## Stuff an nonsense, this is a syntax issue, not a functional issue

[I agree][sans-titre], but that being said:

1. You can use katy now instead of waiting to see if Coffeescript adopts a syntax for chaining methods, and;
2. The `.K` and `.T` methods turn any function into something you can call like a method, which makes your code read more cleanly.

[sans-titre]: https://github.com/raganwald/homoiconic/blob/master/2011/11/sans-titre.md "Sans Titre"
  
## Is Katy be any good?

[Yes][y].

[y]: http://news.ycombinator.com/item?id=3067434

[um]: https://github.com/raganwald/Underscore-Matchers-for-Jasmine

## Cool! Does it work with jQuery?

Yes, but if you like jQuery and like Katy, you'll love [jQuery Combinators][jc].

[jc]: https://github.com/raganwald/JQuery-Combinators

## Calling a method by name is cool, but can you do more with Strings?

Try `KT.installStringLambdas()`. The result is not to everybody's taste, but those who like it, like it a lot.