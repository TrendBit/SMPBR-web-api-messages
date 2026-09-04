import { checkNull, checkNumber, sendJsonApiMessage, type apiMessageOptions } from "../apiMessageBase";

export namespace Sensor_Heater{
    export type getTargetResult = {
        targetTemp : number | undefined
    }

    export async function sendGetTarget() : Promise<getTargetResult>{
        let opts : apiMessageOptions= {
            url: "/control/heater/target_temperature",
            validStatusCodes: [200,404]
        }

        let result = await sendJsonApiMessage(opts);
        
        if(result.response.status == 404){
            return {
                targetTemp: undefined
            };
        }

        let data = result.jsonValue
        try {
            checkNumber(data,"temperature",opts);
        } catch (error) {
            checkNull(data,"temperature",opts);
            return {
                targetTemp: undefined
            }
        }

        return {
            targetTemp: data.temperature
        }
    }
}