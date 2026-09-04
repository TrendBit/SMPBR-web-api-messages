import { ApiMessageError, sendApiMessage, sendJsonApiMessage, type apiMessageOptions, type targetsType } from "./apiMessageBase"

export type apiMessageSimple = {
    url : string,
    key : string,
    target? : targetsType,
}

export class ApiMessageSimpleMissingKey extends ApiMessageError {
  constructor(options: apiMessageOptions,key : string) {
    super(options,`missing key: ${key}`);
    this.name = "ApiMessageSimpleMissingKey";
  }
}

export async function sendApiMessageSimple(options : apiMessageSimple) : Promise<string | number | boolean>{
    let opts : apiMessageOptions = {
        url: options.url,
        target: options.target,
        method: "GET"
    }
    let response = await sendJsonApiMessage(opts);

    let result = response.jsonValue[options.key]
    if(result != undefined){
        return result
    }else{
        throw new ApiMessageSimpleMissingKey(opts,options.key);
    }
}

export async function sendApiMessageSimplePost(options : apiMessageSimple, data : any) : Promise<void>{
    let opts : apiMessageOptions= {
        url: options.url,
        target: options.target,
        method: "POST"
    }

    opts.data = JSON.stringify({[options.key]: data});

    let response = await sendJsonApiMessage(opts);
}