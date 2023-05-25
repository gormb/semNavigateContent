using NAudio.CoreAudioApi;
using NAudio.Wave;
using System;
using System.Diagnostics;
using System.Text;

namespace semNavigateContent_SoundService
{
    public class Transcribe
    {
        public class Record
        {
            int secs = 2, sampRate = 16000, bits = 16, chans = 1;
            float volume = 1.0f;
            public string sFiles = "C:\\data\\sound";
            public void Record2Sec()
            {
                using (var device = new MMDeviceEnumerator().GetDefaultAudioEndpoint(DataFlow.Capture, Role.Console))
                {
                    device.AudioEndpointVolume.MasterVolumeLevelScalar = volume;

                    using (var capture = new WasapiCapture(device) { WaveFormat = new WaveFormat(sampRate, bits, chans) })
                    {
                        using (var writer = new WaveFileWriter(Path.Combine(sFiles, "output.wav"), capture.WaveFormat))
                        {
                            var provider = new BufferedWaveProvider(capture.WaveFormat)
                            {
                                BufferLength = capture.WaveFormat.AverageBytesPerSecond * secs,
                                DiscardOnBufferOverflow = true
                            };
                            capture.DataAvailable += (sender, args) =>
                            {
                                provider.AddSamples(args.Buffer, 0, args.BytesRecorded);
                            };
                            capture.StartRecording();
                            var buffer = new byte[provider.BufferLength];
                            provider.Read(buffer, 0, buffer.Length);
                            writer.Write(buffer, 0, buffer.Length);

                            Thread.Sleep(2000);
                            // Stop recording and release resources
                            capture.StopRecording();
                            writer.Close();
                        }
                    }
                }
            }
        }
    }
}
