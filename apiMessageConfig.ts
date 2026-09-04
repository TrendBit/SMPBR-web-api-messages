
export const smbr_apiMessageConfig = {
    defaultHostnames : {
        reactorApi: window.location.hostname,
        webControlApi: window.location.hostname
    },
    defaultPorts : {
        reactorApi: 8089,
        webControlApi: 80
    },
    deviceRestartHandler : (changes : {
        hostname?: string,
        firmware?: true
    })=>Promise<void>
}
