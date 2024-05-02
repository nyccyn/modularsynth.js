class GateProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        if (inputs.length === 0) return true;

        const input = inputs[0];
        if (input.length === 0) return true;

        const buffer = input[0];       
        if (Math.max(...buffer) >= 0.99) {
            this.port.postMessage(1);
        }
        else {
            const min = Math.min(...buffer);
            if (min === 0 || min <= -0.99) {
                this.port.postMessage(0);
            }
        }

        return true;
    }
}

registerProcessor('gate-processor', GateProcessor);