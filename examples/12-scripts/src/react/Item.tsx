import React from 'react'

type ContainerProps = {
    id: number
}

export default function Item({ id }: ContainerProps) {
    return (
        <p>This is item #{id}.</p>
    )
}
