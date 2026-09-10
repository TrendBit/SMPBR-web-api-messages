import { isArray, isBoolean, isNull, isNumber, isObject, isString, isValidDateTime } from "../../lib/web-components/other/utils";
import { smbr_apiMessageConfig } from "./apiMessageConfig";

interface  targetOptions {
    port: number,
    hostname: string,
    data: BodyInit | undefined;
    method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

    timeout: number;
    contentType: string;

    validStatusCodes: number[]
}

export interface apiTarget extends targetOptions{
    name: string;
}

export interface apiMessageOptions extends Partial<targetOptions>{
    target: apiTarget;
    url : string;
}


export class ApiMessageError extends Error {
    constructor(options: apiMessageOptions, message: string) {
        const target = options.target;
        const url = options.url;
        const port = options.port ?? target.port;
        const hostname = options.hostname ?? target.hostname;
        const method = options.method ?? target.method;
        
        const fullUrl =
            "http://" +
            hostname +
            ":" +
            port.toString() +
            url;
        
        super(`(${target.name})-> ${fullUrl} [${method}]: ${message}`);
        this.stack = "";
        this.name = "ApiMessageError";
    }
}

export class ApiConnectionError extends ApiMessageError {
  constructor(options: apiMessageOptions) {
    super(options,`connection failed`);
    this.name = "ApiConnectionError";
  }
}

export class ApiInvalidStatusCodeError extends ApiMessageError {
  responseMessage : string | undefined;
  constructor(options: apiMessageOptions, status : number, responseMessage ?: string) {
    const apiResponseText = (responseMessage!==undefined)?`api responded with a message: "${responseMessage}"`:"no details";
    super(options,`invalid status code: ${status}, ${apiResponseText}`);
    this.name = "ApiInvalidStatusCodeError";
    this.responseMessage = responseMessage;
  }
}

export class ApiUnparsableJsonBody extends ApiMessageError{
  constructor(options:apiMessageOptions){
    super(options,`unparsable body (should be JSON)`);
    this.name = "ApiUnparsableJsonBody";
  }
}

export class ApiUnparsableTextBody extends ApiMessageError{
  constructor(options:apiMessageOptions){
    super(options,`unparsable body (should be Text)`);
    this.name = "ApiUnparsableTextBody";
  }
}

export class ApiUnparsableBody extends ApiMessageError{
  constructor(options:apiMessageOptions, message:string){
    super(options,`unparsable body ${message}`);
    this.name = "ApiUnparsableBody";
  }
}

export type apiMessageJsonResult = {
  response: Response,
  jsonValue: any
}

export async function sendApiMessage(options:apiMessageOptions){
    const target = options.target;
    const url = options.url
    const port = options.port ?? target.port
    const hostname = options.hostname ?? target.hostname
    const method = options.method ?? target.method
    const returnCodes = options.validStatusCodes ?? target.validStatusCodes
    const contentType = options.contentType ?? target.contentType
    const data = options.data ?? target.data
    const timeout = options.timeout ?? target.timeout

    const url_full = "http://" + hostname + ":" + port.toString() + url;

    let response : Response;

    try {
        response = await fetch(url_full, {
            "credentials": "omit",
            "headers": {
                "Accept": "*/*",
                "Accept-Language": "cs,sk;q=0.8,en-US;q=0.5,en;q=0.3",
                "Content-Type": contentType
            },
            "body": data,
            "method": method,
            "mode": "cors",
            signal: AbortSignal.timeout( timeout )
        });
    } catch(error){
        throw new ApiConnectionError(options);
    }

    if(returnCodes.includes(response.status)){
        return response;
    }else{
        let responseMessage : string | undefined = undefined;
        try {
            const potentialMessage = (await response.json())["message"];
            if(isString(potentialMessage)){
                responseMessage = potentialMessage;
            }
        } catch (error) {

        }
        throw new ApiInvalidStatusCodeError(options,response.status,responseMessage);
    }
}

export async function sendJsonApiMessage(options:apiMessageOptions) : Promise<apiMessageJsonResult>{
    let response = await sendApiMessage(options)
    try {
      let jsonParsed = await response.json();
      return {
        response: response,
        jsonValue: jsonParsed
      };
    } catch (error) {
      throw new ApiUnparsableJsonBody(options);
    }
}

export type apiMessageTextResult = {
  response: Response,
  textValue: string
}

export async function sendTextApiMessage(options: apiMessageOptions): Promise<apiMessageTextResult> {
    let response = await sendApiMessage(options)
    try {
        let textParsed = await response.text();
        return {
            response: response,
            textValue: textParsed
        };
    } catch (error) {
        throw new ApiUnparsableTextBody(options);
    }
}


export function checkNumber(value: any, key:string, options : apiMessageOptions){
    if(!isNumber(value[key])){
        throw new ApiUnparsableBody(options,`response shoud contain a number: ${key}`);
    }
}

export function checkArray(value: any, key:string, checkElement: (element : any)=>boolean, options : apiMessageOptions){
    let values : any[] = value[key]

    if(!isArray(values)){
        throw new ApiUnparsableBody(options,`should contain ${key} array`)
    }

    for(let i = 0; i<values.length; i++){
        if(!checkElement(values[i])){
          throw new ApiUnparsableBody(options,`element in ${key} is unparsable`)
        }
    }
}

export function checkBoolean(value: any, key:string, options : apiMessageOptions){
    if(!isBoolean(value[key])){
        throw new ApiUnparsableBody(options,`response should contain a boolean: ${key}`)
    }
}

export function checkString(value: any, key:string, options : apiMessageOptions){
    if(!isString(value[key])){
        throw new ApiUnparsableBody(options,`response should contain a string: ${key}`)
    }
}

export function checkStringEnum(value: any, key:string, possibleValues: readonly string[], options : apiMessageOptions){
    checkString(value,key,options);
    if(!possibleValues.includes((value[key] as string))){
        throw new ApiUnparsableBody(options,`response should contain an enum: ${key}`)
    }
}

export function checkTimestamp(value: any, key:string, options: apiMessageOptions){
    if(!isValidDateTime(value[key])){
        throw new ApiUnparsableBody(options,`response should contain a timestamp: ${key}`)
    }
}


export function checkNull(value: any, key: string, options: apiMessageOptions){
    if(!isNull(value[key])){
      throw new ApiUnparsableBody(options,`response should contain a null: ${key}`)
    }
}

export function checkObject(value: any, key: string, objectKeys: string[], options: apiMessageOptions) {
    let object : any = value[key]
    
    if (!isObject(object)) {
        throw new ApiUnparsableBody(options, `response should contain an object: ${key}`)
    }
    for (let subKey of objectKeys) {
        if (!object.hasOwnProperty(subKey)) {
            throw new ApiUnparsableBody(options, `response should contain an object: ${key}, with key: ${subKey}`)
        }
    }
}
