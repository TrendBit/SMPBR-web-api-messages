import { moduleInstances, moduleTypes, type Module, type moduleInstancesType, type moduleTypesType } from "../../common-types/Module";
import { apiTarget, checkArray, checkBoolean, checkNumber, checkString, checkStringEnum, checkTimestamp, sendJsonApiMessage, type apiMessageOptions } from "../apiMessageBase"
import { reactorApiTarget, smbr_apiMessageConfig } from "../apiMessageConfig";

export namespace System{

    export type modulesResult = {
        modules : Module[]
    }

    export async function sendModules(target : apiTarget = reactorApiTarget) : Promise<modulesResult>{
        let opts : apiMessageOptions = {
            url: "/system/modules",
            target: target
        }

        let response = await sendJsonApiMessage(opts);

        let result : Module[] = [];
        checkArray({data:response.jsonValue},"data",(element : any)=>{
            checkStringEnum(element,"module_type",moduleTypes,opts);
            checkString(element,"uid",opts);
            checkStringEnum(element, "instance", moduleInstances, opts);

            result.push({
                type: element.module_type,
                uid: element.uid,
                instance: element.instance
            })
            return true;
        },opts);

        result.sort((a:Module,b:Module)=>(
            (a.uid===b.uid)?(
                0
            ):(
                (a.uid>b.uid)?(
                    -1
                ):(
                    1
                )
            )
        ))

        return {
            modules: result
        }
    }

    export type Problem = {
        type : string,
        id: number,
        message: string,
        detail: string
    }

    export type  problemResult = {
        message: string,
        problems: Problem[]
    }

    async function sendProblems(url : string, target : apiTarget) : Promise<problemResult>{
        let opts : apiMessageOptions = {
            url: url,
            target: target
        }

        let response = await sendJsonApiMessage(opts);
        let data = response.jsonValue;

        checkString(data,"message",opts);
        checkArray(data,"problems",(el)=>{
            checkString(el,"type",opts);
            checkNumber(el,"id",opts);
            checkString(el,"message",opts);
            checkString(el,"detail",opts);
            return true;
        },opts);

        return data;
    }

    export async function sendErrors(target : apiTarget = reactorApiTarget) : Promise<problemResult>{
        return await sendProblems("/system/errors", target);
    }

    export async function sendWarnings(target : apiTarget = reactorApiTarget) : Promise<problemResult>{
       return await sendProblems("/system/warnings", target);
    }

    export type issueType = {
        id: number,
        name: string,
        index: number,
        timestamp: string,
        value: number,
        module: moduleTypesType,
        instance: moduleInstancesType
    }

    export type issuesResult = {
        message: string,
        issues : issueType[]
    }

    export async function sendIssues(target : apiTarget = reactorApiTarget) : Promise<issuesResult>{
        let opts : apiMessageOptions = {
            url: "/system/module/issues",
            target: target
        }

        let response = await sendJsonApiMessage(opts);
        let data = response.jsonValue;

        checkString(data,"message",opts);
        checkArray(data,"issues",(el)=>{
            checkNumber(el,"id",opts);
            checkString(el,"name",opts);
            checkNumber(el,"index",opts);
            checkTimestamp(el,"timestamp",opts);
            checkNumber(el,"value",opts);
            checkStringEnum(el,"module",moduleTypes,opts);
            checkStringEnum(el,"instance",moduleInstances,opts);
            return true;
        }, opts);

        data.issues.sort((a : issueType, b : issueType) => {
            let res = a.module.localeCompare(b.module);
            if (res == 0) {
                return a.instance.localeCompare(b.instance);
            } else {
                return res;
            }
        })

        return data;
    }


    export type versionResult = {
        version: string,
        hash: string,
        dirty: boolean
    }

    export async function sendVersion(target : apiTarget = reactorApiTarget): Promise<versionResult>{
        let opts: apiMessageOptions = {
            url: "/system/version",
            target: target
        }

        let response = await sendJsonApiMessage(opts);
        let data = response.jsonValue;

        checkString(data, "version", opts);
        checkString(data, "hash", opts);
        checkBoolean(data, "dirty", opts);

        return {
            version: data.version,
            hash: data.hash,
            dirty: data.dirty
        }
    }


    export async function sendHostname(newHostname: string, target : apiTarget = reactorApiTarget): Promise<void>{
        let opts: apiMessageOptions = {
            url: "/core/hostname",
            data: '{"hostname": "' + newHostname + '"}',
            method: "POST",
            target: target
        }

        let response = await sendJsonApiMessage(opts);

        smbr_apiMessageConfig.deviceRestartHandler({
            hostname: newHostname
        })
    }
}
