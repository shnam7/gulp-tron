/*
 * Sample.js
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { Hello } from './hello.js'

console.log(`----- Babel with react eaxmple...`)

const msg = `Greetings from ES6/Babel script.`

// test es6 function
const greetings = msg => {
    console.log(`Hello, ${msg}`)
}
greetings(msg)

const p1 = document.createElement('p')
p1.innerText = `${msg}`
const root = document.getElementById('babelTest')
root.appendChild(p1)

//--- react
const app = ReactDOM.createRoot(document.getElementById('react-app'))
app.render(<Hello />)
