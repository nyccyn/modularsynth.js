// const convertTempoToSeconds = (tempo, sampleRate) => Math.pow(1 / sampleRate / 6, tempo) * 6;
function convertTempoToSeconds(tempo, sampleRate) {
    // Constants
    const maxValue = 6;
    const minValue = 1 / sampleRate;
    const inputMin = -5;
    const inputMax = 5;
    
    // Scale and shift the input to fit the range from 0 to 1
    const scaledTempo = (tempo - inputMin) / (inputMax - inputMin);
    
    // Calculate the exponential function
    return maxValue * Math.pow(minValue / maxValue, scaledTempo);
}

class ClockProcessor extends AudioWorkletProcessor {
    constructor(...args) {
        super(...args);
        this.isPlaying = false;
        this.tempo = 0.5; // Default tempo                
        this.startTime = 0;

        this.port.onmessage = e => {      
            if (this.isPlaying === e.data) return;
            
            this.isPlaying = e.data;
            if (e.data) {                
                this.port.postMessage('tick')                
                this.startTime = currentTime;
            }
        };
    }

    static get parameterDescriptors() {
        return [
            {
                name: 'tempo',
                defaultValue: -2.5,
                minValue: -4,
                maxValue: -1
            },
            {
                name: 'tempoCv',
                defaultValue: 0,
                minValue: -5,
                maxValue: 5
            }
        ];
    }

    process(inputs, outputs, parameters) {
        const tempo = parameters.tempo[0] + parameters.tempoCv[0];        
        if (tempo !== this.tempo) {
            this.tempo = tempo; 
        }       

        if (this.isPlaying) {               
            const tempoInSeconds = convertTempoToSeconds(this.tempo, sampleRate);
            if (currentTime - this.startTime >= tempoInSeconds) { 
                this.startTime = currentTime;
                this.port.postMessage('tick')                
            }
        }

        return true;
    }
}

registerProcessor('clock-processor', ClockProcessor);