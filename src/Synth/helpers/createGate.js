export default function createGate() {
    const node = new AudioWorkletNode(this, 'gate-processor');
    node.gateOn = false;
    node.port.onmessage = e => {
        if ((e.data === 1 && !node.gateOn) || (e.data === 0 && node.gateOn)) {
            node.gateOn = e.data === 1;
            node.gateChange && node.gateChange(e.data);
        }
    }    
    node.connect(this.destination);
    return node;
}