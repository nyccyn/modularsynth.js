export default function createClockProcessorNode() {    
    const clockNode = new AudioWorkletNode(this, 'clock-processor');
    clockNode.port.onmessage = e => {
        if (e.data === 'tick' && clockNode.onTick) {
            clockNode.onTick();
        }
    }    
    clockNode.play = value => clockNode.port.postMessage(value);
    clockNode.connect(this.destination);
    return clockNode;
}