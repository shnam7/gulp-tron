console.log(`----- Plain Javascript test.`)

const msg = 'Greetings from plain JavaScript.'
const p1 = document.createElement('p')
p1.innerText = msg

const root = document.getElementById('jsTest')
root.appendChild(p1)
