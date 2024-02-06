/*
 * Sample.js
 */
;(() => {
    const msg = `Greetings from ES6/Babel script.`

    // test es6 function
    const greetings = msg => {
        console.log(`Hello, ${msg}`)
    }
    greetings(msg)

    const p1 = document.createElement('p')
    p1.innerText = `${msg}`

    document.body.appendChild(p1)
})()
