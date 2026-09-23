import { apiTarget } from "../apiMessageBase"
import { reactorApiTarget } from "../apiMessageConfig"
import { sendApiMessageDeleteFile, sendApiMessageGetFileContent, sendApiMessageGetFileList, sendApiMessageSetFileContent, type apiMessageDeleteFile, type apiMessageGetFileContent, type apiMessageGetFileList, type apiMessageSetFileContent } from "../apiMessageFileOperations"

export namespace Recipes{

    export type getFileList = {
        reloadFromFileSystem : boolean
    }

    export type getFileListResult= {
        recipes : string[]
    }

    export async function sendGetFileList(options: getFileList, target : apiTarget = reactorApiTarget) : Promise<getFileListResult>{
        let opts : apiMessageGetFileList = {
            url: "/recipes",
            reloadFromFileSystem: options.reloadFromFileSystem,
            target: target
        }

        let result = await sendApiMessageGetFileList(opts);

        return result;
    }

    export type getFileContent = {
        fileName : string
    }

    export type getFileContentResult = {
        content : string
    }

    export async function sendGetFileContent(options: getFileContent, target : apiTarget = reactorApiTarget) : Promise<getFileContentResult>{
        let opts : apiMessageGetFileContent = {
            url: "/recipes",
            fileName: options.fileName,
            target: target
        }

        let result = await sendApiMessageGetFileContent(opts);

        return result;
    }


    export type setFileContent = {
        fileName : string,
        content : string
    }

    export async function sendSetFileContent(options: setFileContent, target : apiTarget = reactorApiTarget) : Promise<void>{
        let opts : apiMessageSetFileContent = {
            url: "/recipes",
            fileName: options.fileName,
            content: options.content,
            target: target
        }

        await sendApiMessageSetFileContent(opts);
    }


    export type deleteFile = {
        fileName: string
    }

    export async function sendDeleteFile(options: deleteFile, target : apiTarget = reactorApiTarget) : Promise<void>{
        let opts : apiMessageDeleteFile = {
            url: "/recipes",
            fileName: options.fileName,
            target: target
        }
        await sendApiMessageDeleteFile(opts);
    }
}
