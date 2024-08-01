import {describe, expect, test, vi} from 'vitest'
import gulp, {task} from 'gulp'
import {Tron} from '../src/core/tron.js'
import {type TaskConfig} from '../src/core/types.js'
import {BuildStream} from '../src/core/build-stream.js'

const nextTaskName = (() => {
    let _id = 0
    return () => 'task' + _id++
})()

vi.mock('gulp', async importOriginal => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const mod = await importOriginal<typeof import('gulp')>()

    const task = vi.fn()
    return {...mod, task}
})
const tron = new Tron()

const t0 = {
    name: nextTaskName(),
    clean: ['t0-clean1.test', `t0-clean2.test`],
    watch: ['t0-watch1.test', `t0-watch2.test`],
    addWatch: ['t0-watch3.test'],
}
tron.task(t0)

describe('.task()', () => {
    test('does not accept null or undefined name in task config.', () => {
        const spy = vi.spyOn(gulp, 'task')
        tron.use(gulp)
        gulp.task('a')
        expect(() => tron.task('', () => {})).toThrowError()
        expect(() => tron.task({name: ''})).toThrowError()
        expect(spy).toHaveBeenCalled()

        const taskCount = tron.selectTasksAll().length
        expect(() => tron.createTask({name: nextTaskName()})).not.toThrowError()
        expect(tron.selectTasksAll().length).toBe(taskCount + 1)
    })

    test('can create task with build function: (bs)=>{...}.', () => {
        const taskName = nextTaskName()
        expect(gulp.task(taskName)).toBeUndefined()

        tron.task(taskName, bs => {})
        expect(gulp.task(taskName)).toBeTypeOf('function')
    })

    test('can create task with build TaskConfig object.', () => {
        const taskName = nextTaskName()
        expect(gulp.task(taskName)).toBeUndefined()

        tron.task({name: taskName, build(bs) {}})
        expect(gulp.task(taskName)).toBeTypeOf('function')
    })

    test('can create task without build fuction and with no dependsOn/triggers properties.', () => {
        const taskName = nextTaskName()
        expect(gulp.task(taskName)).toBeUndefined()

        tron.task({name: taskName})
        expect(gulp.task(taskName)).toBeTypeOf('function')
    })

    test('can create task with dependents.', () => {
        const build1 = () => {}
        const build2 = () => {}
        const build3 = () => {}
        const build4 = () => {}
        const build5 = () => {}

        const taskConfig: TaskConfig = {
            name: nextTaskName(),
            dependsOn: build1,
            triggers: tron.series(build2, tron.parallel(build3, build4), build5),
        }
        tron.task(taskConfig)

        const conf = tron.findTask(taskConfig.name)
        expect(conf).toBeDefined()
        expect(conf?.name).toBe(taskConfig.name)
        expect(gulp.task(conf ? conf.name : '')).toBeInstanceOf(Function)

        const annonTasks = tron.selectTasks('*-build[1-5]')
        expect(annonTasks?.length).toBe(5)
    })

    test('can create task in ther form: task(buildName)', () => {
        const taskName = nextTaskName()
        tron.task(taskName)
        expect(gulp.task(taskName)).toBeInstanceOf(Function)
    })

    test('can create task in ther form: task(buildName, bs=>{})', () => {
        const taskName = nextTaskName()
        tron.task(taskName, () => {})
        expect(gulp.task(taskName)).toBeInstanceOf(Function)
    })

    test('can create task in ther form: task(buildName, bs=>{}, {...})', () => {
        const taskName = nextTaskName()
        tron.task(taskName, () => {}, {})
        expect(gulp.task(taskName)).toBeInstanceOf(Function)
    })
})

describe('.createTasks()', () => {
    const baseName = nextTaskName()
    const t1 = {name: baseName + '-t1'}
    const t2 = {name: baseName + '-t2'}
    const t3 = {name: baseName + '-t3'}
    // const opt1 = {group: 'createTasks_'}
    const opt1 = {sourcemaps: true}
    tron.createTasks(t1, t2, opt1, t3, {dest: '.'})
    test('create multiple tasks with multiple task options.', () => {
        const sel = tron.selectTasks(baseName + '-t*')
        expect(sel?.length).toBe(3)
        // console.log(gulp.tree())
    })
})

describe('.addCleaner()', () => {
    test(`task created with default name '@clean.`, async () => {
        tron.addCleaner()
        const cleanerConf = tron.findTask('@clean')!

        expect(cleanerConf).toBeDefined()
        expect(cleanerConf.build).toBeDefined()
        expect(cleanerConf.build!.name).toBe('__cleanerFunction__')
        expect(gulp.task(cleanerConf.name)).toBeInstanceOf(Function)

        const messages: string[] = []
        const consoleMock = vi.spyOn(console, 'log').mockImplementation((...args: any[]) => {
            messages.push(args.join(''))
        })
        await cleanerConf.build!(new BuildStream(cleanerConf.name, cleanerConf))
        expect(consoleMock).toHaveBeenCalled()
        expect(messages[0]).toBe(`@clean::cleaning:[${t0.clean.join(', ')}]`)
        consoleMock.mockRestore()
    })
})

describe('.addWatcher()', () => {
    test(`task created with default name '@watch.`, async () => {
        tron.addWatcher()
        const watcherConf = tron.findTask('@watch')!

        expect(watcherConf).toBeDefined()
        expect(watcherConf.build).toBeDefined()
        expect(watcherConf.build!.name).toBe('__watcherFunction__')
        expect(gulp.task(watcherConf.name)).toBeInstanceOf(Function)

        const messages: string[] = []
        const consoleMock = vi.spyOn(console, 'log').mockImplementation((...args: any[]) => {
            messages.push(args.join(''))
        })
        await watcherConf.build!(new BuildStream(watcherConf.name, watcherConf))
        expect(consoleMock).toHaveBeenCalled()
        const watchedFiles = [...t0.watch, ...t0.addWatch].join(', ')
        expect(watchedFiles).toBe(`t0-watch1.test, t0-watch2.test, t0-watch3.test`)
        expect(messages[0]).toBe(`@watch::Watching '${t0.name}':[${watchedFiles}]`)
        consoleMock.mockRestore()
    })
})

describe('.series()', () => {
    test(`create series task from multiple task configuratins.`, () => {
        const t1 = () => {}
        const t2 = () => {}
        const t3 = () => {}
        const s1 = tron.series(t1, t2, t3)

        expect(s1).toBeInstanceOf(Array)
        expect(s1.length).toBe(3)
        expect((s1[0] as any).name).toBe('t1')
        expect((s1[1] as any).name).toBe('t2')
        expect((s1[2] as any).name).toBe('t3')
    })
})

describe('.parallel()', () => {
    test(`create parallel task from multiple task configuratins.`, () => {
        const t1 = () => {}
        const t2 = () => {}
        const t3 = () => {}
        const s1 = tron.parallel(t1, t2, t3)

        expect(s1).toBeInstanceOf(Object)
        expect(s1).haveOwnPropertyDescriptor('set')
        expect((s1.set[0] as any).name).toBe('t1')
        expect((s1.set[1] as any).name).toBe('t2')
        expect((s1.set[2] as any).name).toBe('t3')
        // console.log(gulp.tree())
    })
})

describe('.selectTasks(), selectTasksAll(), findTask()', () => {
    const t1 = {name: '_sel_t01'}
    const t2 = {name: '_sel_t02'}
    const t3 = {name: '_sel_t03'}
    tron.createTasks(t1, t2, t3)

    test(`select all.`, () => {
        expect(tron.selectTasksAll().length).toBe(tron.selectTasks('*')?.length)
    })
    test(`select with glob.`, () => {
        expect(tron.selectTasks('_sel_t*')?.length).toBe(3)
    })
    test(`select with negation.`, () => {
        expect(tron.selectTasks(['_sel_t*', '!*_t0{1,3}'])?.length).toBe(1)
    })
    test(`find task.`, () => {
        const task = tron.findTask('_sel_t01')
        expect(task).toBeDefined()
        expect(task?.name).toBe('_sel_t01')
        expect(tron.findTask('_sel_t01*')).toBeUndefined()
    })
})

describe('._resolveTaskConfg()', () => {
    test('throw error if conf.name is undefined.', () => {
        expect(() => tron._resolveTaskConfg({} as TaskConfig)).toThrow()
    })
    test('throw error if conf.name is empty string.', () => {
        expect(() => tron._resolveTaskConfg({name: ''})).toThrow()
    })
    test('throw error if conf.name is empty string.', () => {
        expect(() => tron._resolveTaskConfg({name: 'aa'})).not.toThrow()
    })

    test(`Task name @clean should have build function named '__cleanerFunction__'.`, () => {
        const buildFunc = () => {}
        expect(() => tron._resolveTaskConfg({name: '@clean', build: buildFunc})).toThrow()

        // eslint-disable-next-line @typescript-eslint/naming-convention
        const __cleanerFunction__ = () => {}
        expect(() =>
            tron._resolveTaskConfg({name: '@clean', build: __cleanerFunction__}),
        ).not.toThrow()
    })

    test(`Task name @watch should have build function named '__watcherFunction__'.`, () => {
        const buildFunc = () => {}
        expect(() => tron._resolveTaskConfg({name: '@watch', build: buildFunc})).toThrow()

        // eslint-disable-next-line @typescript-eslint/naming-convention
        const __watcherFunction__ = () => {}
        expect(() =>
            tron._resolveTaskConfg({name: '@watch', build: __watcherFunction__}),
        ).not.toThrow()
    })

    // test(`Invalid task name to throw error.`, () => {
    //     expect(() => tron._resolveTaskConfg({name: String.prototype.charAt(33)})).not.toThrow()
    // })
})

describe('_resolveBuildSet()', () => {
    expect(gulp.task(t0.name)).toBeDefined()
    test('throw error if gulp task with a given name is not found', () => {
        expect(() => tron._resolveBuildSet(t0.name)).not.toThrow()
        expect(() => tron._resolveBuildSet('__dummy_name__')).toThrow()
    })
})

describe('_resolveBuildSetGroup()', () => {
    test('series', () => {
        expect(() => tron._resolveBuildSetGroup([])).not.toThrow()
    })
    test('parallel', () => {
        expect(() => tron._resolveBuildSetGroup(tron.parallel({name: 'a'}))).not.toThrow()
    })
    test('unknown group', () => {
        expect(() => tron._resolveBuildSetGroup({})).toThrow()
    })
})
