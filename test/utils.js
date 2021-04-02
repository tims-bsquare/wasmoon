const { LuaFactory } = require('../dist')

process.setMaxListeners(0)

module.exports = {
    getFactory: () => {
        return new LuaFactory()
    },
    getEngine: () => {
        return new LuaFactory().createEngine()
    },
}
