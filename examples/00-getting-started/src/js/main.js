/* global window, document */

// ES6 script

console.log('ES6/Babel sample...')

const greetings = message => {
    console.log(`Hello ${message}`)
}

greetings('ES6/Babel')

window.addEventListener('load', () => {
    document.querySelector('#point1').textContent = 'ES6/Babel is working!'
    setInterval(() => {
        document.querySelector('#point2').textContent = Date.now().toString()
    }, 1000)
})
