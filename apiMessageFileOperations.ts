import { checkArray, checkString, checkStringEnum, sendApiMessage, sendJsonApiMessage, sendTextApiMessage, type apiMessageOptions, type targetsType } from "./apiMessageBase"

export type apiMessageGetFileList = {
    url: string,
    target?: targetsType,
    reloadFromFileSystem : boolean
}

export type apiMessageGetFileListResult = {
    recipes : string[]
}

export async function sendApiMessageGetFileList(options : apiMessageGetFileList) : Promise<apiMessageGetFileListResult>{
    let opts : apiMessageOptions= {
        url: options.url,
        target: options.target,
        method: (options.reloadFromFileSystem)?"PATCH":"GET"
    }

    let result = await sendJsonApiMessage(opts);

    checkArray({data: result.jsonValue},"data",(element) =>{
        checkString({data: element},"data",opts);
        return true;
    },opts);

    return {
        recipes: result.jsonValue
    }   
}

export type FileListDirectory = {
    name: string;
    subDirectories : Record<string, FileListDirectory>;
    files: string[];
}

export function parseApiMessageFileList(fileList : string[]) : FileListDirectory{
    let root : FileListDirectory = {
        name: "root",
        subDirectories: {},
        files: []
    }

    for(let file of fileList){
        let path : string[] = file.split("|");
        let target : FileListDirectory = root;
        for(let i : number = 0; i<path.length-1; i++){
            let pathSegment = path[i];
            if(target.subDirectories[pathSegment] == undefined){
                target.subDirectories[pathSegment] = {
                    name: pathSegment,
                    subDirectories: {},
                    files: []
                }
            }
            target = target.subDirectories[pathSegment]
        }
        target.files.push(path[path.length-1]);
    }
    
    return root;
}

export type apiMessageGetFileContent = {
    url: string,
    target?: targetsType,
    fileName: string
}

export type apiMessageGetFileContentResult = {
    content: string
}

export async function sendApiMessageGetFileContent(options : apiMessageGetFileContent) : Promise<apiMessageGetFileContentResult>{
    let opts : apiMessageOptions = {
        url: options.url + "/"  +encodeURI(options.fileName),
        target: options.target
    }

    let result = await sendJsonApiMessage(opts);
    let data = result.jsonValue

    checkStringEnum(data,"name",[options.fileName],opts);
    checkString(data,"content",opts);

    return {
        content: data.content
    }
}


export type apiMessageSetFileContent = {
    url: string,
    target?: targetsType,
    fileName: string,
    content: string
}


export async function sendApiMessageSetFileContent(options : apiMessageSetFileContent) : Promise<void>{
    let opts : apiMessageOptions = {
        url: options.url + "/" + encodeURI(options.fileName),
        target: options.target,
        method: "PUT",
        data: JSON.stringify({
            content: options.content
        })
    }

    let result = await sendTextApiMessage(opts);
}

export type apiMessageDeleteFile = {
    url: string,
    target?: targetsType,
    fileName: string
}

export async function sendApiMessageDeleteFile(options: apiMessageDeleteFile) : Promise<void>{
    let opts : apiMessageOptions = {
        url: options.url + "/" + encodeURI(options.fileName),
        method: "DELETE",
        target: options.target,
    }

    let result = await sendTextApiMessage(opts);
}
