using System;
using NAudio.Wave;
using semNavigateContent_SoundService;

namespace semNavigateContent_SoundService {
    public class Program
    {
        static void Main()
        {
            Transcribe.Record record = new Transcribe.Record();
            // Console app to prototype getting sound and transcribe it
            Console.WriteLine("Hello, Speak and get recorded!");

            record.Record2Sec();
        }
    }
}