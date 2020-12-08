import initWasmModule from './lua/glue.js'
import './lua/glue.wasm'
import { LuaReturn, LuaState, LuaType } from './types'

interface LuaEmscriptenModule extends EmscriptenModule {
    cwrap: typeof cwrap
    addFunction: typeof addFunction
    FS: typeof FS
}

export default class LuaWasm {
    public static module: LuaEmscriptenModule

    public static async ensureInitialization(customName?: string) {
        if (!LuaWasm.module) {
            LuaWasm.module = <LuaEmscriptenModule>await initWasmModule({
                print: console.log,
                printErr: console.error,
                locateFile: (path: string, scriptDirectory: string) => {
                    return customName || scriptDirectory + path
                }
            })
            LuaWasm.bindWrappedFunctions()
        }
    }

    public static luaL_newstate: () => LuaState
    public static luaL_openlibs: (L: LuaState) => void
    public static clua_dostring: (L: LuaState, code: string) => LuaReturn
    public static lua_getglobal: (L: LuaState, name: string) => LuaType
    public static clua_tonumber: (L: LuaState, idx: number) => number
    public static clua_tostring: (L: LuaState, idx: number) => string
    public static lua_toboolean: (L: LuaState, idx: number) => boolean
    public static lua_topointer: (L: LuaState, idx: number) => number
    public static lua_tothread: (L: LuaState, idx: number) => number
    public static lua_gettable: (L: LuaState, idx: number) => number
    public static lua_next: (L: LuaState, idx: number) => boolean
    public static lua_type: (L: LuaState, idx: number) => LuaType
    public static clua_pop: (L: LuaState, idx: number) => void
    public static clua_dump_stack: (L: LuaState) => void
    public static lua_pushnil: (L: LuaState) => void
    public static lua_pushvalue: (L: LuaState, idx: number) => void
    public static lua_pushinteger: (L: LuaState, integer: number) => void
    public static lua_pushnumber: (L: LuaState, number: number) => void
    public static lua_pushstring: (L: LuaState, string: string) => void
    public static lua_pushboolean: (L: LuaState, boolean: boolean) => void
    public static lua_pushthread: (L: LuaState) => number
    public static lua_setglobal: (L: LuaState, name: string) => void
    public static lua_setmetatable: (L: LuaState, idx: number) => void
    public static clua_newtable: (L: LuaState) => void
    public static lua_gettop: (L: LuaState) => number
    public static lua_settable: (L: LuaState, idx: number) => void
    public static clua_call: (L: LuaState, nargs: number, nresults: number) => void
    public static clua_pushcfunction: (L: LuaState, cfunction: number) => void
    public static luaL_ref: (L: LuaState, table: number) => number
    public static luaL_unref: (L: LuaState, table: number, ref: number) => void
    public static lua_rawgeti: (L: LuaState, idx: number, ref: number) => number
    public static lua_close: (L: LuaState) => void

    private static bindWrappedFunctions() {
        LuaWasm.luaL_newstate = LuaWasm.module.cwrap('luaL_newstate', 'number', [])
        LuaWasm.luaL_openlibs = LuaWasm.module.cwrap('luaL_openlibs', undefined, ['number'])
        LuaWasm.clua_dostring = LuaWasm.module.cwrap('clua_dostring', 'number', ['number', 'string'])
        LuaWasm.lua_getglobal = LuaWasm.module.cwrap('lua_getglobal', 'number', ['number', 'string'])
        LuaWasm.clua_tonumber = LuaWasm.module.cwrap('clua_tonumber', 'number', ['number', 'number'])
        LuaWasm.clua_tostring = LuaWasm.module.cwrap('clua_tostring', 'string', ['number', 'number'])
        LuaWasm.lua_toboolean = LuaWasm.module.cwrap('lua_toboolean', 'boolean', ['number', 'number'])
        LuaWasm.lua_topointer = LuaWasm.module.cwrap('lua_topointer', 'number', ['number', 'number'])
        LuaWasm.lua_tothread = LuaWasm.module.cwrap('lua_tothread', 'number', ['number', 'number'])
        LuaWasm.lua_gettable = LuaWasm.module.cwrap('lua_gettable', 'number', ['number', 'number'])
        LuaWasm.lua_next = LuaWasm.module.cwrap('lua_next', 'boolean', ['number', 'number'])
        LuaWasm.lua_type = LuaWasm.module.cwrap('lua_type', 'number', ['number', 'number'])
        LuaWasm.clua_pop = LuaWasm.module.cwrap('clua_pop', undefined, ['number', 'number'])
        LuaWasm.clua_dump_stack = LuaWasm.module.cwrap('clua_dump_stack', undefined, ['number'])
        LuaWasm.lua_pushnil = LuaWasm.module.cwrap('lua_pushnil', undefined, ['number'])
        LuaWasm.lua_pushvalue = LuaWasm.module.cwrap('lua_pushvalue', undefined, ['number', 'number'])
        LuaWasm.lua_pushinteger = LuaWasm.module.cwrap('lua_pushinteger', undefined, ['number', 'number'])
        LuaWasm.lua_pushnumber = LuaWasm.module.cwrap('lua_pushnumber', undefined, ['number', 'number'])
        LuaWasm.lua_pushstring = LuaWasm.module.cwrap('lua_pushstring', undefined, ['number', 'string'])
        LuaWasm.lua_pushboolean = LuaWasm.module.cwrap('lua_pushboolean', undefined, ['number', 'boolean'])
        LuaWasm.lua_pushthread = LuaWasm.module.cwrap('lua_pushthread', 'number', ['number'])
        LuaWasm.lua_setglobal = LuaWasm.module.cwrap('lua_setglobal', undefined, ['number', 'string'])
        LuaWasm.lua_setmetatable = LuaWasm.module.cwrap('lua_setmetatable', 'number', ['number', 'number'])
        LuaWasm.clua_newtable = LuaWasm.module.cwrap('clua_newtable', undefined, ['number'])
        LuaWasm.lua_gettop = LuaWasm.module.cwrap('lua_gettop', 'number', ['number'])
        LuaWasm.lua_settable = LuaWasm.module.cwrap('lua_settable', undefined, ['number', 'number'])
        LuaWasm.clua_call = LuaWasm.module.cwrap('clua_call', undefined, ['number', 'number', 'number'])
        LuaWasm.clua_pushcfunction = LuaWasm.module.cwrap('clua_pushcfunction', undefined, ['number', 'number'])
        LuaWasm.luaL_ref = LuaWasm.module.cwrap('luaL_ref', 'number', ['number', 'number'])
        LuaWasm.luaL_unref = LuaWasm.module.cwrap('luaL_unref', undefined, ['number', 'number', 'number'])
        LuaWasm.lua_rawgeti = LuaWasm.module.cwrap('lua_rawgeti', 'number', ['number', 'number', 'number'])
        LuaWasm.lua_close = LuaWasm.module.cwrap('lua_close', undefined, ['number'])
    }
}
