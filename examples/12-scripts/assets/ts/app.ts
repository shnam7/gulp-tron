import Greeter from "./Greeter.js"

console.log(`----- Typescript test.`)


const greeter = new Greeter()
console.log('Greeter loaded:', greeter.greet())

const p1 = document.createElement("p")
p1.innerText = `${greeter.greet()}`

document.body.appendChild(p1)
