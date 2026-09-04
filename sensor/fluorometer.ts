import { ApiMessageError, checkArray, checkBoolean, checkNumber, checkString, checkStringEnum, checkTimestamp, sendJsonApiMessage, type apiMessageOptions } from "../apiMessageBase"
import { Time } from "../time/_";

export namespace Sensor_Fluorometer{
    const detectorGainsValues = ["x1", "x10", "x50", "Auto"] as const
    export type detectorGainsType = typeof detectorGainsValues[number];
    
    export const detectorTimebaseValues = ["logarithmic", "linear"] as const;
    export type detectorTimebaseType = typeof detectorTimebaseValues[number];
    
    export type Sample = {
        time_ms: number,
        raw_value: number,
        relative_value: number,
        absolute_value: number
    }
    
    export type Measurement = {
        measurement_id: number,
        read: boolean,
        saturated: boolean,
        detector_gain: detectorGainsType,
        intensity: number,
        timebase: detectorTimebaseType,
        length_ms: number,
        required_samples: number,
        captured_samples: number,
        missing_samples: number,
        timestamp: string,
        timestampCorrect: Date | undefined,
        samples: Sample[]
    }
    
    function checkMeasurement(data : any, opts : apiMessageOptions) : Measurement{
        checkNumber(data,"measurement_id",opts);
        checkBoolean(data,"read",opts);
        checkBoolean(data,"saturated",opts);
        checkStringEnum(data,"detector_gain",detectorGainsValues,opts);
        checkNumber(data,"emitor_intensity",opts);
        checkStringEnum(data,"timebase",detectorTimebaseValues,opts);
        checkNumber(data,"length_ms",opts);
        checkNumber(data,"required_samples",opts);
        checkNumber(data,"captured_samples",opts);
        checkNumber(data,"missing_samples",opts);
        checkTimestamp(data,"timestamp",opts);
        checkArray(data,"samples",(element:  any)=>{
            checkNumber(element,"absolute_value",opts);
            checkNumber(element,"relative_value",opts);
            checkNumber(element,"raw_value",opts);
            checkNumber(element,"time_ms",opts);
            return true;
        },opts);

        return {
            measurement_id: data.measurement_id,
            read: data.read,
            saturated: data.saturated,
            detector_gain: data.detector_gain,
            intensity: data.emitor_intensity,
            timebase: data.timebase,
            length_ms: data.length_ms,
            required_samples: data.required_samples,
            captured_samples: data.captured_samples,
            missing_samples: data.missing_samples,
            timestamp: data.timestamp,
            timestampCorrect: undefined,
            samples: data.samples
        }
    }
    
    export async function fillCorrectedTimestamp(measurement : Measurement){
        let correctedTime = await Time.sendConvertTime({timestamp:measurement.timestamp});
        measurement.timestampCorrect = correctedTime;
    }
    
    type capture = {
        detectorGain: detectorGainsType
        emitorIntensity: number,
        timebase: detectorTimebaseType,
        lengthMs: number,
        sampleCount: number
    }
    
    export type captureResult = {
        measurement: Measurement,
    }
    
    export async function sendCapture(options : capture) : Promise<captureResult>{
        let opts : apiMessageOptions = {
            url: "/sensor/fluorometer/ojip/capture",
            method: "POST",
            timeout: 5*options.lengthMs
        }

        if(!(await sendCompleted()).capture_complete){
            throw new ApiMessageError(opts,"fluorometer ojip is still capturing");
        }
    
        opts.data = JSON.stringify({
            "detector_gain": options.detectorGain,
            "emitor_intensity": options.emitorIntensity,
            "timebase": options.timebase,
            "length_ms": options.lengthMs,
            "sample_count": options.sampleCount
        })
    
        let result = await sendJsonApiMessage(opts)
    
        let data = ( result.jsonValue as Measurement)
        
        return {
            measurement: checkMeasurement(data,opts)
        }
    }
    
    
    
    
    export type completedResult = {
        capture_complete: boolean
    }
    
    export async function sendCompleted(): Promise<completedResult> {
        let opts: apiMessageOptions = {
            url: "/sensor/fluorometer/ojip/completed"
        }
    
        let response = await sendJsonApiMessage(opts);
        let data = response.jsonValue
    
        checkBoolean(data, "capture_complete", opts);
    
        return {
            capture_complete: data["capture_complete"]
        }
    }
    
    
    
    export type sendReadLastResult = {
        measurement: Measurement
    }
    
    export async function sendReadLast(): Promise<sendReadLastResult> {
        let opts: apiMessageOptions = {
            url: "/sensor/fluorometer/ojip/read_last"
        }

        if(!(await sendCompleted()).capture_complete){
            throw new ApiMessageError(opts,"fluorometer ojip is still capturing");
        }
    
        let response = await sendJsonApiMessage(opts);
        let data = response.jsonValue
        
        return {
            measurement: checkMeasurement(data,opts)
        }
    }

    export async function sendCalibrate() : Promise<void> {
        let opts: apiMessageOptions = {
            url: "/sensor/fluorometer/calibrate",
            method: "POST",
            data: "{}"
        }

        if(!(await sendCompleted()).capture_complete){
            throw new ApiMessageError(opts,"fluorometer ojip is still capturing");
        }
    
        await sendJsonApiMessage(opts);
    }
}