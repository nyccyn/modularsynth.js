const createVoltToFreqExpCurve = baseFrequency => {
    const BUFFER_LENGTH = 8192;
    const curve = new Float32Array(BUFFER_LENGTH);
    for (let i = 0; i < BUFFER_LENGTH; i++) {
        const normalized = (i / (BUFFER_LENGTH - 1)) * 4 - 2;
        curve[i] = baseFrequency * Math.pow(2, normalized);
    }
    return curve;
};

export default function createVoltToHzConverter(baseFrequency, octaves) {
    const node = this.createConstantSource();
    node.volt = node.offset;
    const voltToFreqWaveshaper = this.createWaveShaper();
    const voltScale = this.createGain();
    voltToFreqWaveshaper.curve = createVoltToFreqExpCurve(baseFrequency);
    voltScale.gain.value = 1 / octaves;
    node.connect(voltScale).connect(voltToFreqWaveshaper);

    node.connect = function() {
        voltToFreqWaveshaper.connect.apply(voltToFreqWaveshaper, arguments);
        return voltScale;
    };

    node.disconnect = function() {
        voltToFreqWaveshaper.disconnect.apply(voltToFreqWaveshaper, arguments);
        return voltScale;
    };
    return node;
}