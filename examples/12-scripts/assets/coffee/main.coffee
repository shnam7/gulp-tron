#
# CoffeeScript Sample
#

class CoffeeGreeter
  constructor: (@greeting) ->

  greet: () ->
    square = (x)->x*x;  # this semicolon will generate lint message
    return @greeting + ' CoffeeScript! ' + 'num=' + square(2)


((window, document) ->
  console.log '----- CoffeeScript example...'

  msg = new CoffeeGreeter("Hello").greet()
  p1 = document.createElement('p')
  p1.innerText = msg

  root = document.getElementById('coffeeTest')
  root.appendChild(p1)

)(window, document)
