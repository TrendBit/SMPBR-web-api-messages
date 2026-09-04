import { checkNumber, sendJsonApiMessage, type apiMessageOptions } from "../apiMessageBase"

export namespace Control_Mixer{
    export type infoResult = {
        maxRPM: number
        minRPM: number,
    }

    export async function sendInfo() : Promise<infoResult>{
        let opts : apiMessageOptions= {
            url: "/control/mixer/info"
        }

        let result = await sendJsonApiMessage(opts);
        let data = result.jsonValue;

        checkNumber(data,"max_rpm",opts);
        checkNumber(data,"min_rpm",opts);

        return {
            maxRPM : data.max_rpm,
            minRPM : data.min_rpm
        };
    }
}