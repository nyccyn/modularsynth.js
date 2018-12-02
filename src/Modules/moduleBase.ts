export interface ModuleProps {
    audioContext: AudioContext;
    registerInput?: () => void;
    registerOutput?: () => void;
}