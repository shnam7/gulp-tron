const container = document.getElementById('vanilla')

container.style.cssText = `
    position: relative;
    border: 1px solid gray;
    padding: 0 1rem;
`

const title = document.createElement('h1')
title.innerText = 'Vanilla JavaScript'

container.appendChild(title)
container.appendChild(getSub1Node())
container.appendChild(getSub2Node())
