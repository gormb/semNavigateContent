#ifndef UNICODE
#define UNICODE
#endif

#include "semNavigateContentWiki_Get_Record.h"
#include <windows.h>
#include <mmsystem.h>
#include <wchar.h>

// Recording thread
//DWORD WINAPI RecordThread(LPVOID lp)
//{
//    PWavRecorder pRec = (PWavRecorder)lp;
//    pRec->Record();
//    return 0;
//}

int main()
{
    printf("Press ESC to stop recording and save files");
    int res = (int) CoInitializeEx(NULL, 0);

    // Create event for holding four concurrent threads to record from speaker and microphone
    HANDLE hDone = CreateEvent(NULL, TRUE, FALSE, NULL);

    // Create 4 threads for recording; two for mic and two for speaker with 1 sec in between
    PWavRecorder pRec[4];// = (PWavRecorder*)malloc((sizeof PWavRecorder) * 4); // waveInGetNumDevs()
        
    //pRec[2] = new WavRecorder(true, false, 2000);
    //pRec[3] = new WavRecorder(true, true, 2000);
    pRec[0] = new WavRecorder(false, 2000);
    pRec[1] = new WavRecorder(true, 2000);
    pRec[2] = new WavRecorder(false, 2000);
    pRec[3] = new WavRecorder(true, 2000);


    bool bDone = WavRecorder::Cancelled();
    for (int i = 1; i < 10 && !bDone; i++, bDone = WavRecorder::Cancelled())
        WaitForSingleObject(hDone, 99); // Does it take 1 ms to start the two previous recordings?
    if (!bDone)
    {
        pRec[2]->Record(); // 2nd mic-thread
        pRec[3]->Record(); // 2nd speaker-thread
    }

    while (WaitForSingleObject(hDone, 100) == WAIT_TIMEOUT)
    {
        // Wait for ESC to be pressed
        if (WavRecorder::Cancelled())
        { // Stop recording and save
            pRec[0]->Stop();
            pRec[1]->Stop();
            pRec[2]->Stop();
            pRec[3]->Stop();
            break;
        }
	}
    return res;
}