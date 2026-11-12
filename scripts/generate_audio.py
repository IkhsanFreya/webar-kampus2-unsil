import wave
import math
import struct
import os

os.makedirs('public/assets/audio', exist_ok=True)

# Generate a 15-second gentle ambient chime WAV file (44100Hz, 16-bit mono)
sample_rate = 44100
duration = 15.0  # seconds
num_samples = int(sample_rate * duration)

with wave.open('public/assets/audio/narasi-gedung.wav', 'w') as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(sample_rate)

    # Chime notes: F3, A3, C4, E4, G4 (peaceful ambient pentatonic)
    notes = [174.61, 220.0, 261.63, 329.63, 392.0]
    
    frames = bytearray()
    for i in range(num_samples):
        t = i / sample_rate
        # Trigger note every 3 seconds
        note_idx = int(t / 3.0) % len(notes)
        note_time = t % 3.0
        freq = notes[note_idx]
        
        # Exponential decay envelope
        env = math.exp(-note_time * 1.5)
        # Gentle sine tone with overtone
        sample = 0.5 * math.sin(2 * math.pi * freq * t) + 0.25 * math.sin(4 * math.pi * freq * t)
        val = int(sample * env * 12000)
        frames.extend(struct.pack('<h', max(-32768, min(32767, val))))
    
    wav_file.writeframes(frames)

print(f"Generated narasi-gedung.wav: {len(frames)} bytes")

