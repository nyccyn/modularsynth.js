// Pulse oscillator from Andy Harman
// https://github.com/pendragon-andyh/WebAudio-PulseOscillator
const pulseCurve = new Float32Array(256);
for(let i = 0; i < 128; i++) {
    pulseCurve[i] = -1;
    pulseCurve[i + 128] = 1;
}
const constantOneCurve = new Float32Array(2);
constantOneCurve[0] = 1;
constantOneCurve[1] = 1;
export default function createPulseOscillator() {
    const node = this.createOscillator();
    node.type = "sawtooth";

    const pulseShaper = this.createWaveShaper();
    pulseShaper.curve = pulseCurve;
    node.connect(pulseShaper);
    const widthGain = this.createGain();
    widthGain.gain.value = 0;
    node.width = widthGain.gain;
    node.widthGain = widthGain;
    widthGain.connect(pulseShaper);

    const constantOneShaper = this.createWaveShaper();
    constantOneShaper.curve = constantOneCurve;
    node.connect(constantOneShaper);
    constantOneShaper.connect(widthGain);

    node.connect = function() {
        pulseShaper.connect.apply(pulseShaper, arguments);
        return node;
    };

    node.disconnect = function() {
        pulseShaper.disconnect.apply(pulseShaper, arguments);
        return node;
    };

    return node;
}