Katy: CoffeeScript and JavaScript Combinators
===

Katy makes writing [fluent][fluent] CoffeeScript (and JavaScript!) easy by providing the "K" and "T" combinators for ordinary classes and objects. In plain English, Katy lets you turn any method into a "fluent" method for chaining and Katy lets you use functions as extension methods for any object. Snarf the source here, or install it with `npm install Katy`.

## tl;dr

Katy adds two methods, `.K` and `.T`, to any classes or objects you desire:

```CoffeeScript
KT.mixInto(Array)

# K calls a method on the receiver by name and returns the receiver

[1..10].K 'pop'
  # => returns [1, 2, 3, 4, 5, 6, 7, 8, 9]

[1..10].K 'push', 11
  # => returns [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

# K also calls a function on the receiver and returns the receiver

[10..1].K (arr) -> arr.slice(3).sort (a, b) -> a - b
  # => returns [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
  
# T calls a function on the receiver and returns the result

[10..1].T (arr) -> arr.slice(3).sort (a, b) -> a - b
  # => returns [1, 2, 3, 4, 5, 6, 7]
```

## .K

You're familiar with [fluent interfaces][fluent] like jQuery. A fluent interface uses methods that are written in such a way that you can "chain" methods together, producing code that reads naturally from left-to-right or from top to bottom. For example:

[fluent]: http://en.wikipedia.org/wiki/Fluent_interface

```javascript
// Without fluent interface

myCar = Car();
myCar.setSpeed(100);
myCar.setColor('blue');
myCar.setDoors(5);

// With fluent interface

fluentCar = Car()
  .setSpeed(100)
  .setColor('blue')
  .setDoors(5);
```

Fluent interfaces rely on the author of the API making sure that each method returns its receiver so that you can chain the next method to it. jQuery does this effectively, and libraries like [Underscore][u] provide some special support for chaining its methods as well. But what if you have some objects that weren't written with chaining in mind?

Katy's `.K` allows you to make any function or method "fluent" even if the original author has other ideas. It's very similar to Underscore's `_.tap` (although it has some extra tricks up its sleeve, such as calling a method by name). We'll use a ridiculously simple example to demonstrate: The `.pop()` method of `Array` returns what it pops, not the array. So if you want to pop a few things off an array and then do something with what's left, you can mix Katy into `Array` and use `.K` to call `.pop` by name:

```CoffeeScript
# Example turning .pop() into a fluent method

KT.mixInto(Array)

[10..1]
  .K('pop')
  .K('pop')
  .K('pop')
  .sort (a, b) -> a - b
  # => returns [4, 5, 6, 7, 8, 9, 10]
```

Another aspect of fluent interfaces is that you don't want to mix function calls with methods, you want to make everything read naturally in one direction. So you can call `.K` with a function (either named or anonymous) instead of a method name. Compare these two examples:

```CoffeeScript
# returns an array of things you pop
# e.g pop_n([10..1], 3) => [1, 2, 3]

pop_n = (arr, n) -> 
  for x in [1..n]
    arr.pop()
    
# Without Katy

arr = [10..1]
pop_n(arr, 3)
arr
  .sort (a, b) -> a - b
  # => returns [4, 5, 6, 7, 8, 9, 10]

# With Katy

KT.mixInto(Array)

[10..1]
  .K( pop_n, 3 )
  .sort (a, b) -> a - b
  # => returns [4, 5, 6, 7, 8, 9, 10]
```

Some people would say this is a minor detail, but when writing code for people to read, [no detail is too small][nd]. Hey, that `.sort (a, b) -> a - b` looks handy. Let's make it a function so we can use it again:

[nd]: http://weblog.raganwald.com/2008/01/no-detail-too-small.html "No Detail Too Small"

```coffeescript
numsort = (arr) ->
  arr.sort (a, b) -> a - b

[10..1]
  .K( pop_n, 3 )
  .K( numsort )
  # => returns [4, 5, 6, 7, 8, 9, 10]
```

(As you may have noticed, you can also pass additional parameters to your functions or named methods. In the code above, `pop_n` is called with a first parameter of the receiver and a second parameter of `3`.)

Passing functions to `.K` provides two wins: It makes the functions "fluent," and you also get something a little like a C# extension methods: You get to write your own methods like `pop_n` and `numsort` for classes without opening them up and monkey-patching them.

To recap, when you use `.K`:

1. You can give any built-in method "fluent" (return the receiver) semantics, and;
2. You can make any function into something that can be called like a method, making your code read more naturally and allowing you to extend classes without opening up their prototypes.

## .T

As you saw above, Katy's `.K` allows you to extend classes with your own functions, just as if they were built-in methods, and it makes them fluent by returning the receiver. Sometimes you want to fluently extend a class with your own function, but you don't want it to return the receiver.

Let's say you like `numsort`, but you want to return a *copy* of the array that is numerically sorted:

```coffeescript
sortedcopy = (arr) ->
  arr
    .slice(0)
      .sort (a, b) -> a - b

[10..1]
  .K( sortedcopy )
  # => returns [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] BZZT! FAIL!!
```

`.K` isn't what we want because `.K` always returns the receiver. But we like being able to fluently extend objects with our own functions. What we need is a method that takes a function as an argument and calls the function with the receiver (and any additional arguments, of course). Katy provides this, and it's called `.T`:

```coffeescript
sortedcopy = (arr) ->
  arr
    .slice(0)
      .sort (a, b) -> a - b

[10..1]
  .T( sortedcopy )
  # => returns [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] WIN!
```

Here's another example, a custom array filter:

```CoffeeScript

identifiers = (arrOfSymbols) ->
  arrOfSymbols.filter (str) ->
    /^[_a-zA-Z]\w*$/.test(str)
  
sorted_list_of_identifier_lengths = someArray
  .sort()
  .T( identifiers )
  .map( (i) -> i.length )
```

`.T` lets you use `identifiers` as if it were a method baked into `Array`. You could write `identifiers(someArray.sort())`, but as we saw above, when you are chaining together multiple calls, you want your expression to read very naturally from left to right on one line or from top to bottom on one line.

In summary, `.T` is very much like having C#'s extension methods in your CoffeeScript and JavaScript projects, without returning the receiver.

## Monkey-patching core classes is evil!

No problem. You don't need to mix it into a core class, you can "wrap" an object without altering its prototype:

```CoffeeScript
KT('Hello')
  .K( (s) -> s + ' World' )
    # => returns 'Hello'

KT('Hello')
  .T( (s) -> s + ' World' )
    # => returns 'Hello World'
```

You can also 'chain' multiple invocations in a style borrowed from [Monads][m] and [Underscore][u]:

[m]: http://en.wikipedia.org/wiki/Monad_(functional_programming)
[u]: http://documentcloud.github.com/underscore/

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

For what it's worth, altering core classes is tricky if you're writing a library for others to use, but could be [just fine][nobreak] if you're writing an application and not making life tricky for downstream programmers. And of course, you can mix Katy into your own classes while wrapping core classes like `Array` if you prefer.

[nobreak]: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/ "Extending JavaScript Natives"

## String Lambdas

As you know, Katy accepts any function as an argument to `.K` and `.T`, as in: 

```coffeescript
KT('Hello')
  .T( (s) -> s + ' World' )
    # => returns 'Hello World'
```

CoffeeScript makes writing functions pretty easy, but if you're using JavaScript, writing short functions is not quite as much fun:

```javascript
KT('Hello')
  .T( function (s) { return s + ' World'; } )
    // => returns 'Hello World'
```

The ceremonial trappings overwhelm the logic of what you're writing. That's doubly painful since you're already adding some extra indirection by using Katy. So, Katy lets you define one-liner functions using a highly abbreviated syntax invented by [Oliver Steele][osteele] called "String Lambdas."

Here's the cheat sheet:

```javascript

// ->
//
// Like CoffeeScript, Katy supports using -> in a string. You don't need to parenthesize
// the arguments and no explicit "return" is needed.

KT('Hello').T( "s -> s + ' World'" ) // => returns 'Hello World'
  
// implicit parameters
//
// If you don't use '->', Katy will attempt to infer the parameters in your expression
// from left to right:

KT('Hello').T( "str + ' World'" ) // => returns 'Hello World'
  
// _
//
// If you use an underscore by itself, Katy will assume that's your only parameter.
// Yes, this conflicts with the Underscore library, but that's ok: String Lambdas
// are best for short, simple things. Note that in this example, Katy knows not
// to assume that 'world' is a parameter.

window.world = 'World'

KT('Hello').T( "_ + ' ' + world" ) // => returns 'Hello World'

// point-free
//
// For certain very simple expressions, Katy will assume parameters even if you don't supply them!

KT('Hello').T( "+ ' World'" )  // => returns 'Hello World'
KT('Hello').T( "+", ' World' ) // => returns 'Hello World'
  
// This works for simple message sending and property access as well:

KT('Hello').T( ".toUpperCase()" ) // => 'HELLO'

KT('Hello').T( ".length" ) // => 5
```

You can't be serious!? [Oh yes I can][sl]. String lambdas are slower than "native" JavaScript, but when used judiciously they make your code easier to read and understand. Perhaps not easier to read and understand by a junior developer who is unfamiliar with anything you can't look up on w3schools, but easier to read and understand by an experienced colleague working with the same code base? Absolutely.

[sl]: https://github.com/raganwald/homoiconic/blob/master/2008-11-28/you_cant_be_serious.md

[osteele]: http://osteele.com/

## What's with the naming conventions?

`.T` is known in some CS circles as the [Thrush][t] or `T` combinator. Likewise, `.K` is known in combinatory logic circles as the "K Combinator" or [Kestrel][k]. To simplify the explanation radically, `T` and `K` are called combinators because they combine things to produce a result in different ways. Functional programmers call such things higher-order functions, but what makes combinators interesting is that combinators work by rearranging the order of things in an expression.

For example, `T` reverses the order of two things. Think about it: Instead of writing `identifiers(some_array)`, we use `T` to write `some_array.T(identifiers)`. That rearrangement is very handy for making our code conform to fluent style. Likewise, `K` leaves them in the same order but removes something. This ability to rearrange things is what makes them so useful for taking code that would normally have function calls sprinkled throughout it and rearranging it into a nice tree of method calls in fluent style.

Many other combinators exist, and they are all interesting with applications for functional and OO programmers. With combinators you can even get rid of parentheses in a programming language! If you aren't familiar with Combinatory Logic, I encourage you to follow the links to my posts about Kestrels and Thrushes, and better still do a little digging about Combinatory Logic in general. It's a rich, fascinating field of study that is so simple it's incredibly easy to pick up, and it leads naturally into functional and [concatenative][joy] languages.

## I also use Ruby. Where can I read more about combinators in Ruby?

1. My blog posts about combinators, starting with the [Kestrel][k] and [Thrush][t].
2. [Kestrels, Quirky Birds, and Hopeless Egocentricity](http://leanpub.com/combinators), all of my writing about Ruby combinators, collected into one convenient and inexpensive e-book.

## Katy is the wrong approach, method chaining and cascading is a syntax issue, not a functional issue

[I agree][sans-titre], but that being said:

1. You can use Katy *now* instead of waiting to see if CoffeeScript adopts [a syntax for chaining methods][1495], and;
2. The `.K` and `.T` methods turn any function into something you can call like a method, which makes your code read more cleanly.

[sans-titre]: https://github.com/raganwald/homoiconic/blob/master/2011/11/sans-titre.md "Sans Titre"
[1495]: https://github.com/jashkenas/coffee-script/issues/1495 "Improve chaining syntax"

[y]: http://news.ycombinator.com/item?id=3067434

[um]: https://github.com/raganwald/Underscore-Matchers-for-Jasmine

[jc]: https://github.com/raganwald/JQuery-Combinators
  
## Is Katy any good?

[Yes][y]. And if you like Katy, you'll love [jQuery Combinators][jc].

License
---

    The MIT License

    Copyright (c) 2011 Reginald Braithwaite http://reginald.braythwayt.com
    with contributions from Ben Alman and Oliver Steele

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.

[k]: http://github.com/raganwald/homoiconic/blob/master/2008-10-29/kestrel.markdown#readme
[t]: http://github.com/raganwald/homoiconic/blob/master/2008-10-30/thrush.markdown#readme
[joy]: http://github.com/raganwald/homoiconic/blob/master/2008-11-16/joy.md#readme