import chalk from "chalk"

export function dmsg(...args: any[]) {
    let [arg1, ...arg2] = args // decompose to seperate object priting
    console.log(arg1); if (arg2.length > 0) console.log(...arg2)
}

export function msg(...args: any[]) { console.log(...args) }

export function info(...args: any[]) { console.log(chalk.green(...args)) }

export function notice(...args: any[]) { console.log(chalk.yellow(...args)) }

export function warn(...args: any[]) { console.log(chalk.redBright(...args)) }
