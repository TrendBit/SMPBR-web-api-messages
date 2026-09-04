import { checkArray, checkBoolean, checkNull, checkNumber, checkString, checkTimestamp, sendJsonApiMessage, sendTextApiMessage, type apiMessageOptions } from "../apiMessageBase"

export namespace Scheduler {
    export type getScheduledResult = {
        fileName: string,
        content: string
    }

    export async function sendGetScheduled() : Promise<getScheduledResult>{
        let opts : apiMessageOptions = {
            url: "/scheduler/recipe"
        }

        let result = await sendJsonApiMessage(opts);
        let data = result.jsonValue;

        checkString(data,"name",opts);
        checkString(data,"content",opts);

        return {
            fileName: data.name,
            content: data.content
        }
    }

    export type setSchedule = {
        fileName : string
    }

    export async function sendSetScheduled(options : setSchedule) : Promise<void> {
        let opts : apiMessageOptions = {
            url: "/scheduler/recipe/"+encodeURI(options.fileName),
            method: "POST"
        }

        await sendTextApiMessage(opts);
    }

    export type startScheduledResult = {
        processId : number
    }

    export async function sendStartScheduled() : Promise<startScheduledResult>{
        let opts : apiMessageOptions = {
            url: "/scheduler/start",
            method: "POST"
        }

        let result = await sendJsonApiMessage(opts);
        let data = result.jsonValue;

        checkNumber(data,"processId",opts);

        return {
            processId: data.processId
        }
    }

    export async function sendStopScheduled() : Promise<void>{
        let opts : apiMessageOptions = {
            url: "/scheduler/stop",
            method: "POST"
        }

        await sendTextApiMessage(opts);
    }

    export type runtimeInfoResult = {
        processId: number,
        name: string,
        finalMessage: string,
        stack: number[],
        output: {timeStamp: string, output: string}[],
        state: "Running" | "Paused" | "Stopped" | "NeverStarted"
        startedAt: Date | undefined
    }

    export async function sendRuntimeInfo() : Promise<runtimeInfoResult>{
        let opts : apiMessageOptions = {
            url: "/scheduler/runtime"
        }

        let result = await sendJsonApiMessage(opts);
        let data = result.jsonValue;
        let outputParsed : {timeStamp: string, output: string}[] = [];

        checkNumber(data,"processId",opts);
        checkString(data,"name",opts);
        checkString(data,"finalMessage",opts);
        checkArray(data,"stack",(el)=>{
            checkNumber({data:el},"data",opts);
            return true;
        },opts);
        checkArray(data,"output",(el)=>{
            checkString({data:el},"data",opts);

            let split = (el as string).split(" ");
            if(split.length > 2){
                outputParsed.push({
                    timeStamp: split.slice(0,2).join(" "),
                    output: split.slice(2).join(" ")
                })
            }else{
                return false
            }
            return true;
        },opts);
        checkBoolean(data,"started",opts);
        checkBoolean(data,"stopped",opts);
        
        let startedAtGiven = true;
        try {
            checkTimestamp(data,"startedAt",opts);
        } catch (error) {
            startedAtGiven=false;
            checkNull(data,"startedAt",opts);
        }

        let state : "Running" | "Paused" | "Stopped" | "NeverStarted"  = "NeverStarted"
        if(data.started && !data.stopped){
            state = "Running"
        }
        if(!data.started && data.stopped){
            state = "Stopped"
        }
        if(data.started && data.stopped){
            state = "Paused"
        }

        return {
            processId: data.processId,
            name: data.name,
            finalMessage: data.finalMessage,
            stack: data.stack,
            output: outputParsed,
            state: state,
            startedAt: startedAtGiven?(new Date(data.startedAt)):(undefined) 
        }
    }
}