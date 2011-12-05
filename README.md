Katy: Coffeescript Combinators
===

Katy makes writing fluent Coffeescript easy by providing the `K` and `T` combinators for Coffeescript objects.

## What does Katy do for me?

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

You're familiar with [fluent interfaces][fluent]. They're great, but they rely on the author of the API making sure that each function returns its receiver. The `.K` method allows you to make any function or method "fluent" even if the original author has other ideas. The `K` and `T` methods also allow you to write your own methods and 'call' them just as if they were baked into the original object. For example, you can fake an `identifiers` filter for arrays of strings:

[fluent]: http://en.wikipedia.org/wiki/Fluent_interface

```coffeescript
require 'underscore'

identifiers = (arrOfSymbols) ->
  _.select arrOfSymbols, (str) ->
    /^[_a-zA-Z]\w*$/.test(str)
  
someArray
  .T(identifiers)
  .K(someFunctionOnThem)
  .T(someOtherFilter)
```

The win is that having extended `Array.prototype` with `.K` and `.T` once, you need not extend it any more to add your own custom methods. Furthermore, you can use fluent or pipelining behaviour with your own or any built-in method as you please.
  
## Is Katy be any good?

[Yes][y].

[y]: http://news.ycombinator.com/item?id=3067434

## How do I run tests?

You'll need `node.js` and `coffeescript` for starters. The tests depend on `jasmine-node` and [UnderscoreMatchersForJasmine][um]:

```bash
npm install jasmine-node
npm install UnderscoreMatchersForJasmine 
jasmine-node --coffee spec
```

[um]: https://github.com/raganwald/Underscore-Matchers-for-Jasmine

## Cool! Does it work with jQuery?

Probably, but if you like jQuery and like Katy, you'll really like [jQuery Combinators][jc].

[jc]: https://github.com/raganwald/JQuery-Combinators

## Calling a method by name is cool, but can you do more with Strings?

Try `KT.installStringLambdas()`. The result is not to everybody's taste, but those who like it, like it a lot.