import { LuaEngineOptions } from './types'
import Global from './global'
import Thread from './thread'
import createErrorType from './type-extensions/error'
import createFunctionType from './type-extensions/function'
import createPromiseType from './type-extensions/promise'
import createProxyType from './type-extensions/proxy'
import createTableType from './type-extensions/table'
import createUserdataType from './type-extensions/userdata'
import type LuaWasm from './luawasm'

const defaultOptions: LuaEngineOptions = {
    openStandardLibs: true,
    injectObjects: false,
    enableProxy: true,
}

export default class Lua {
    public global: Global

    public constructor(private cmodule: LuaWasm, userOptions?: Partial<LuaEngineOptions>) {
        this.global = new Global(this.cmodule)

        const options: LuaEngineOptions = {
            ...defaultOptions,
            ...(userOptions || {}),
        }

        // Generic handlers - These may be required to be registered for additional types.
        this.global.registerTypeExtension(0, createTableType(this.global))
        this.global.registerTypeExtension(0, createFunctionType(this.global))

        // Contains the :await functionality.
        this.global.registerTypeExtension(1, createPromiseType(this.global, options.injectObjects))

        if (options.enableProxy) {
            // This extension only really overrides tables and arrays.
            // When a function is looked up in one of it's tables it's bound and then
            // handled by the function type extension.
            this.global.registerTypeExtension(3, createProxyType(this.global))
        } else {
            // No need to register this when the proxy is enabled.
            this.global.registerTypeExtension(1, createErrorType(this.global, options.injectObjects))
        }

        // Higher priority than proxied objects to allow custom user data without exposing methods.
        this.global.registerTypeExtension(4, createUserdataType(this.global))

        if (this.global.isClosed()) {
            throw new Error('Lua state could not be created (probably due to lack of memory)')
        }

        if (options.openStandardLibs) {
            this.cmodule.luaL_openlibs(this.global.address)
        }
    }

    public doString(script: string): Promise<any> {
        return this.callByteCode((thread) => thread.loadString(script))
    }

    public doFile(filename: string): Promise<any> {
        return this.callByteCode((thread) => thread.loadFile(filename))
    }

    public doStringSync(script: string): Promise<any> {
        this.global.loadString(script)
        const result = this.global.runSync()
        return result[0]
    }

    public doFileSync(filename: string): Promise<any> {
        this.global.loadFile(filename)
        const result = this.global.runSync()
        return result[0]
    }

    private async callByteCode(loader: (thread: Thread) => void): Promise<any> {
        const thread = this.global.newThread()
        const threadIndex = this.global.getTop()
        try {
            loader(thread)
            const result = await thread.run(0)
            if (result.length > 0) {
                this.cmodule.lua_xmove(thread.address, this.global.address, result.length)
            }
            return result[0]
        } finally {
            // Pop the read on success or failure
            this.global.remove(threadIndex)
        }
    }
}
