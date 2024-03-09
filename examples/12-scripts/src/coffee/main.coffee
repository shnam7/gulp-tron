#
# CoffeeScript Sample
#


container = document.getElementById('coffee')
title = document.createElement('h1')

container.style.cssText = '
    position: relative;
    border: 1px solid gray;
    padding: 0 1rem;
'
title.innerText = 'CoffeeScript'

container.appendChild(title)
container.appendChild(@getSub1Node())
container.appendChild(@getSub2Node())
