#ifndef UNICODE
#define UNICODE
#endif

#include <windows.h>
#include <mmsystem.h>
    #pragma comment(lib, "winmm.lib")
#include <wchar.h>
#include <stdio.h>
#include "lame/lame.h"
#include <xaudio2.h>
    #pragma comment(lib, "lame\\lame.lib")
//#include <dsound.h>
//    #pragma comment(lib, "dsound.lib")



typedef class WavRecorder {
private:
    constexpr static size_t lFileName = sizeof "Microphone_yyyymmddhhmmss.wav0";
    PWSTR szFileName = new wchar_t[lFileName];
protected:
    bool Error(bool bRes, PCWSTR szFunction, PCWSTR szError) {
        OutputDebugString(szFunction);
        OutputDebugString(szError);
        OutputDebugString(L"\n");
        return bRes; 
    }
    PWSTR FileName(PCWSTR szExt = L"wav")
    {
        SYSTEMTIME st;
        GetLocalTime(&st);
        if (bUseSpeaker)
            swprintf_s((wchar_t*)szFileName, lFileName, L"Speaker_%04d%02d%02d%02d%02d%02d.%s", st.wYear, st.wMonth, st.wDay, st.wHour, st.wMinute, st.wSecond, szExt);
        else
            swprintf_s((wchar_t*)szFileName, lFileName, L"Microphone_%04d%02d%02d%02d%02d%02d.%s", st.wYear, st.wMonth, st.wDay, st.wHour, st.wMinute, st.wSecond, szExt);
        return szFileName;
    }
    bool bUseSpeaker;
    DWORD dwIntervalMs;
    constexpr static int nBufSize = 16000 * 2; // 16000 -> 44100
    WAVEFORMATEX wfx = { WAVE_FORMAT_PCM, 1, 16000, nBufSize, 2, 16, 0 };
    IXAudio2 *pXAudio2;
    IXAudio2MasteringVoice* pMasterVoice;
    IXAudio2SourceVoice* pSourceVoice;
public:
    WavRecorder(bool _bUseSpeaker, DWORD _dwIntervalMs) : bUseSpeaker(_bUseSpeaker), dwIntervalMs(_dwIntervalMs)
    {
        pXAudio2 = NULL;
		pMasterVoice = NULL;
		pSourceVoice = NULL;
    }
    ~WavRecorder()
    {
		if (pSourceVoice) pSourceVoice->DestroyVoice();
		if (pMasterVoice) pMasterVoice->DestroyVoice();
		if (pXAudio2) pXAudio2->Release();
		delete[] szFileName;
	}
    bool Record() {
        if (FAILED(XAudio2Create(&pXAudio2, 0))) return Error(false, L"XAudio2Create", L"Initialize XAudio2");
        else if (FAILED(pXAudio2->CreateMasteringVoice(&pMasterVoice))) return Error(false, L"CreateMasteringVoice", L"Create Mastering Voice");
        else if (FAILED(pXAudio2->CreateSourceVoice(&pSourceVoice, &wfx, 0, XAUDIO2_DEFAULT_FREQ_RATIO))) return Error(false, L"CreateSourceVoice", L"Create Source Voice");
        else if (FAILED(pSourceVoice->Start())) return Error(false, L"CreateSourceVoice", L"Start Recording");
        else {
            FileName();
            Sleep(dwIntervalMs);
            pSourceVoice->Stop(0);
            // Get the recorded audio
            XAUDIO2_VOICE_STATE state;
            pSourceVoice->GetState(&state);
            //BYTE* pBuffer = new BYTE[state.SamplesRecorded * wfx.nBlockAlign];
            //pSourceVoice->GetBuffer(pBuffer, state.SamplesRecorded);
            //pSourceVoice->GetBuffer(pBuffer, state.pCurrentBufferContext);
            // Write the recorded audio to file
            HANDLE hFile = CreateFile(szFileName, GENERIC_WRITE, FILE_SHARE_READ, NULL, CREATE_ALWAYS, 0, NULL);
            DWORD dwWritten;
            WriteFile(hFile, &wfx, sizeof(WAVEFORMATEX), &dwWritten, NULL);
            //WriteFile(hFile, pBuffer, state.pCurrentBufferContext /* state.SamplesRecorded*/ * wfx.nBlockAlign, &dwWritten, NULL);
            CloseHandle(hFile);

            // Release the resources
            //delete[] pBuffer;
            pSourceVoice->DestroyVoice();
            pXAudio2->Release();
            return true;


            pSourceVoice->FlushSourceBuffers();
            pSourceVoice->DestroyVoice();
            pMasterVoice->DestroyVoice();
            pXAudio2->Release();
        }
    }
    bool SaveRecToMp3()
    {  // szFileName
        //size_t l = wcslen(szFileName);
        //szFileName[l - 3] = 'm';
        //szFileName[l - 2] = 'p';
        //szFileName[l - 1] = '3';
        //lame_t lame = lame_init();
        //lame_set_in_samplerate(lame, 16000);
        //whdr.lpData, whdr.dwBytesRecorded
        //// "C:\Users\gorm\AppData\Roaming\Python\Python39\Scripts\whisper.exe"
        //// DWORD input_size = GetFileSize(input, NULL);

        //// Open output file
        //HANDLE hMp3 = CreateFile(szFileName, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
        //if (hMp3 == INVALID_HANDLE_VALUE)
        //    return Error(false, L"SaveRecToMp3 failed", szFileName);
        return false;
        //}

        // Initialize LAME library
        //lame_global_flags* lame = lame_init();
        //lame_set_in_samplerate(lame, 44100);
        //lame_set_VBR(lame, vbr_default);
        //lame_init_params(lame);

            // Convert audio
        //    short* input_buffer_ptr = (short*)input_buffer;
        //    unsigned char output_buffer[4096];
        //    int write;
        //    while (input_size > 0) {
        //        int read = min(input_size, 4096 * sizeof(short));
        //        write = lame_encode_buffer(lame, input_buffer_ptr, input_buffer_ptr, read / sizeof(short), output_buffer, sizeof(output_buffer));
        //        WriteFile(hMp3, output_buffer, write, &write, NULL);
        //        input_buffer_ptr += read / sizeof(short);
        //        input_size -= read;
        //    }
        //    write = lame_encode_flush(lame, output_buffer, sizeof(output_buffer));
        //    WriteFile(hMp3, output_buffer, write, &write, NULL);

        //    // Clean up
        //    lame_close(lame);

        //    CloseHandle(hMp3);

        //    return 0;
        //}
        return false;
    //}
    //if (FAILED(XAudio2Create(&pXAudio2, 0, XAUDIO2_DEFAULT_PROCESSOR)))
    //        return false;

    //    // Create mastering voice
    //    IXAudio2MasteringVoice* pMaster;
    //    if (FAILED(pXAudio2->CreateMasteringVoice(&pMaster)))
    //        return false;

    //    // Create source voice
    //    IXAudio2SourceVoice* pSource;
    //    if (FAILED(pXAudio2->CreateSourceVoice(&pSource, (WAVEFORMATEX*)&wfx)))
    //        return false;

    //    // Start recording
    //    pSource->Start(0);

    //    // Record for the specified time
    //    Sleep(dwIntervalMs);
    //    pSource->Stop(0);

    //    // Get the recorded audio
    //    XAUDIO2_VOICE_STATE state;
    //    pSource->GetState(&state);
    //    BYTE* pBuffer = new BYTE[state.SamplesRecorded * wfx.nBlockAlign];
    //    pSource->GetBuffer(pBuffer, state.SamplesRecorded);

    //    // Write the recorded audio to file
    //    HANDLE hFile = CreateFile(szFileName, GENERIC_WRITE, FILE_SHARE_READ, NULL, CREATE_ALWAYS, 0, NULL);
    //    DWORD dwWritten;
    //    WriteFile(hFile, &wfx, sizeof(WAVEFORMATEX), &dwWritten, NULL);
    //    WriteFile(hFile, pBuffer, state.SamplesRecorded * wfx.nBlockAlign, &dwWritten, NULL);
    //    CloseHandle(hFile);

    //    // Release the resources
    //    delete[] pBuffer;
    //    pSource->DestroyVoice();
    //    pXAudio2->Release();
        return true;
    }
private:
} WavRecorder, *PWavRecorder;
