import React from 'react'
import ReactDOM from 'react-dom/client'

import Container from './Container.js'
import Item from './Item.js'

const app = <>
    <Container>
        <h1>React with Typescript</h1>
        <Item id={1} />
        <Item id={2} />
    </Container>
</>

const rootNode = document.getElementById('react-app')
if (rootNode)
    ReactDOM.createRoot(rootNode).render(app)
