export default function createGate() {
    const node = this.createScriptProcessor(256, 1, 1);
    node.connect(this.destination);
    node.gateOn = false;
    node.onaudioprocess = e => {  
        const buffer = e.inputBuffer.getChannelData(0);
        if (Math.max(...buffer) >= 0.99 && !node.gateOn) {
            node.gateOn = true;
            node.gateChange && node.gateChange(1);
        }
        else {
            const min = Math.min(...buffer);
            if ((min === 0 || min <= -0.99) && node.gateOn) {
                node.gateOn = false;
                node.gateChange && node.gateChange(0);
            }
        }

    };

    return node;
}