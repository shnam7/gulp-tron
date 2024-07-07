import React from 'react' // eslint-disable-line unicorn/filename-case

type ContainerProps = {
    children?: React.ReactNode
}

export default function Container({children}: ContainerProps) {
    return (
        <div
            style={{
                position: 'relative',
                border: '1px solid gray',
                padding: '0 1rem',
            }}>
            {children}
        </div>
    )
}
