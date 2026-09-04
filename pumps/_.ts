import { instanceToIndex, type moduleInstancesType } from "../../components/other/ModuleListProvider";
import { checkNumber, sendJsonApiMessage, type apiMessageOptions } from "../apiMessageBase"

export namespace Pumps{
    export function getPumpUrl(instance : moduleInstancesType, index : number | undefined, endpoint : string){
        const instanceIndex = instanceToIndex[instance];

        if(instanceIndex === 0){
            throw Error("invalid pump instance");
        }
        if(index !== undefined){
            return `/pumps/${instanceIndex}/${endpoint}/${index}`
        }else{
            return `/pumps/${instanceIndex}/${endpoint}`
        }
    }

    export interface pumpsOptions {
        instance : moduleInstancesType,
        pumpIndex : number
    }

    export type infoResult = {
        maxFlowrate: number
        minFlowrate: number
    }

    export async function sendInfo(options : pumpsOptions) : Promise<infoResult>{
        let opts : apiMessageOptions= {
            url: getPumpUrl(options.instance,options.pumpIndex,"info")
        }

        let result = await sendJsonApiMessage(opts);
        let data = result.jsonValue;

        checkNumber(data,"max_flowrate",opts);
        checkNumber(data,"min_flowrate",opts);

        return {
            maxFlowrate : data.max_flowrate,
            minFlowrate : data.min_flowrate
        };
    }

    export async function sendStop(options : pumpsOptions) : Promise<void>{
        let opts : apiMessageOptions= {
            url: getPumpUrl(options.instance,options.pumpIndex,"stop")
        }

        await sendJsonApiMessage(opts);
    }
}