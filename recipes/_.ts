import { sendApiMessageDeleteFile, sendApiMessageGetFileContent, sendApiMessageGetFileList, sendApiMessageSetFileContent, type apiMessageDeleteFile, type apiMessageGetFileContent, type apiMessageGetFileList, type apiMessageSetFileContent } from "../apiMessageFileOperations"

export namespace Recipes{

    export type getFileList = {
        reloadFromFileSystem : boolean
    }

    export type getFileListResult= {
        recipes : string[]
    }

    export async function sendGetFileList(options: getFileList) : Promise<getFileListResult>{
        let opts : apiMessageGetFileList = {
            url: "/recipes",
            reloadFromFileSystem: options.reloadFromFileSystem
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

    export async function sendGetFileContent(options: getFileContent) : Promise<getFileContentResult>{
        let opts : apiMessageGetFileContent = {
            url: "/recipes",
            fileName: options.fileName
        }

        let result = await sendApiMessageGetFileContent(opts);

        return result;
    }


    export type setFileContent = {
        fileName : string,
        content : string
    }

    export async function sendSetFileContent(options: setFileContent) : Promise<void>{
        let opts : apiMessageSetFileContent = {
            url: "/recipes",
            fileName: options.fileName,
            content: options.content
        }

        await sendApiMessageSetFileContent(opts);
    }


    export type deleteFile = {
        fileName: string
    }

    export async function sendDeleteFile(options: deleteFile) : Promise<void>{
        let opts : apiMessageDeleteFile = {
            url: "/recipes",
            fileName: options.fileName
        }
        await sendApiMessageDeleteFile(opts);
    }
}