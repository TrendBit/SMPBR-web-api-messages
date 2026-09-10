import { type apiTarget } from "./apiMessageBase"
type smbr_apiMessageConfig_type = {
    deviceRestartHandler:  (changes : {
        hostname?: string,
        firmware?: true
    })=>Promise<void>
}

export const smbr_apiMessageConfig : smbr_apiMessageConfig_type= {
    deviceRestartHandler: async (changes) => { console.error("The device is restarting, but no restart handler is set!!!"); }
}

export var reactorApiTarget : apiTarget = {
    name: "Reactor-api",
    port: 8089,
    hostname: window.location.hostname,
    data: undefined,
    method: "GET",
    timeout: 10000,
    contentType: "application/json",
    validStatusCodes: [200]
}

export var webControlApiTarget : apiTarget = {
    name: "web-control-api",
    port: 80,
    hostname: window.location.hostname,
    data: undefined,
    method: "GET",
    timeout: 2000,
    contentType: "application/json",
    validStatusCodes: [200]
}
