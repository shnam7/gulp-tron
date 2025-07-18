import React from 'react' // eslint-disable-line unicorn/filename-case

type ContainerProps = {
    id: number
}

export default function Item({id}: ContainerProps) {
    return <p>This is item #{id}.</p>
}
