export function listenToFirstAudioParam(audioNode, callback)
{
    let interval = null;
    for (let p in audioNode) {
        if (audioNode[p] instanceof AudioParam) {
            let lastValue = audioNode[p].value;
            callback(lastValue);
            interval = setInterval(() => {
                if (lastValue !== audioNode[p].value) {
                    lastValue = audioNode[p].value;
                    callback(lastValue);
                }
            }, 0);
            break;
        }
    }
    return interval;
}