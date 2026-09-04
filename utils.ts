import { instanceToIndex, type Module } from "../common-types/Module"

export function getModuleEndpoint(module : Module, endpoint : string){
    switch (module.type) {
        case "pump":
            return `/pump/${endpoint}?instance=${instanceToIndex[module.instance]}`
        default:
            return `/${module.type}/${endpoint}`
    }
}
