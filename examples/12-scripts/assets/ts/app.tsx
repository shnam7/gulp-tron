import React from 'react'
import ReactDOM from 'react-dom/client'
import Greeter from "./Greeter.js"
import GreeterReact from "./GreeterReact.js"

console.log(`----- Typescript test.`)


const greeter = new Greeter()
console.log('Greeter loaded:', greeter.greet())

const p1 = document.createElement("p")
p1.innerText = `${greeter.greet()}`

document.body.appendChild(p1)

const rootNode = document.getElementById('react-app-ts')
if (rootNode) ReactDOM.createRoot(rootNode).render(<GreeterReact />)
