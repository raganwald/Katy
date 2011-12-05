KT = require('../lib/katy.coffee').KT
require 'UnderscoreMatchersForJasmine'

describe "Wrapping Katy", ->

  khw = KT("Hello World")

  describe 'K', ->

    it "should provide K", ->

      expect( khw ).toRespondTo('K')

    it 'should execute the function', ->

      called = false
      khw.K ->
        called = true

      expect(called).toBeTruthy()

    it 'should return the receiver', ->

      expect( khw.K( (x) -> 'XXX' + x + 'XXX') ).toEqual("Hello World")

  describe 'T', ->

    it "should provide T", ->

      expect( khw ).toRespondTo('T')

    it 'should execute the function', ->

      called = false
      khw.T ->
        called = true

      expect(called).toBeTruthy()

    it 'should return the result', ->

      expect( khw.T( (x) -> 'XXX' + x + 'XXX') ).toEqual("XXXHello WorldXXX")

describe 'Installing Katy', ->

  KT.mixInto(Object)

  hw = "Hello World"

  describe 'K', ->

    it "should provide K", ->

      expect( hw ).toRespondTo('K')

    it 'should execute the function', ->

      called = false
      hw.K ->
        called = true

      expect(called).toBeTruthy()

    it 'should return the receiver', ->

      expect( hw.K( (x) -> 'XXX' + x + 'XXX') ).toEqual("Hello World")

  describe 'T', ->

    it "should provide T", ->

      expect( hw ).toRespondTo('T')

    it 'should execute the function', ->

      called = false
      hw.T ->
        called = true

      expect(called).toBeTruthy()

    it 'should return the result', ->

      expect( hw.T( (x) -> 'XXX' + x + 'XXX') ).toEqual("XXXHello WorldXXX")

describe "Functionalizing Strings", ->

  describe "lambdas", ->

    KT.installStringLambdas()

    k123 = KT([1..3])

    it 'should accept a string lambda for K', ->

      expect( k123.K('.concat([4, 5, 6])') ).toEqual([1..3])

    it 'should accept a string lambda for T', ->

      expect( k123.T('.concat([4, 5, 6])') ).toEqual([1..6])

  describe 'messages', ->

    k123 = KT([1..3])

    it 'should accept a message and argument(s) for K', ->

      expect( k123.K('concat',[4, 5, 6]) ).toEqual([1..3])

    it 'should accept a message and argument(s) for T', ->

      expect( k123.T('concat',[4, 5, 6]) ).toEqual([1..6])

describe 'code examples', ->

  it 'should reproduce example 1', ->

    expect([1..10]
      .K('pop')
      .K('pop')
      .K('pop')
      .T('pop')).toEqual(7)
