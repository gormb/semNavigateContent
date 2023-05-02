//#pragma once

#ifndef _SEMNAVIGATECONTENTWIKI_GET_H
#define _SEMNAVIGATECONTENTWIKI_GET_H

#include "resource.h"
#include "Db.h"

#pragma region TM_ - const for TSK thread messages
#define TM_(n) (WM_APP + (n)) // 32768+n
#define TM_SELECTED TM_(0x100) // 33024
#pragma endregion

#pragma region Utl - Util, common functions and structs

class TSK; // forward

typedef enum { stInactive_Unchecked = 0, stActive_Unchecked = 1, stPaused_Unchecked = 2, stDone_Checked = 3, stFailed_Unchecked = 4, stActivePending_Unchecked = 5, stDonePending_Checked = 6, stFlag_Unchecked = 7, stFlag_Checked = 8 } TSK_active;
LPCWSTR TSK_active_description[] = {L"Inactive", L"Active", L"Paused", L"Done", L"Failed", L"ActivePending", L"DonePending", L"stFlag_Unchecked", L"Checked" };

class TSK_state {
public:
    TSK_state() : hNode(NULL), idval(0), active((TSK_active)0), pChild(NULL), pSibling(NULL) 
    {
        szComment = new WCHAR[MAX_PATH];
    }
    HTREEITEM hNode;
    ID64VALUE idval;
    TSK_active active;
protected:
    PWSTR szComment;
    TSK_state *pChild, *pSibling;
} *PTSK_state;


typedef DWORD(WINAPI* PTSK__Threadfunction)(TSK* pTsk);
#define TSK_TODO_DONE (new TSK(stFlag_Checked))
#define TSK_TODO (new TSK(stFlag_Unchecked))
DWORD WINAPI TSK__Thread_Msgloop(TSK* pTsk);

class TSK : public TSK_state
{
public:
    TSK(ID64VALUE aId, TSK_active aActive, bool aDeleteOnRemove, PTSK__Threadfunction aTskThreadFunction)
    {
        idval.SetValue((LPWSTR)TSK_active_description[aActive], (DATE_16)0);
        active = aActive;
        idval.id.ui64 = aId.id.ui64;
        bDeleteOnRemove = aDeleteOnRemove;
        tskThreadFunction = aTskThreadFunction != NULL ? aTskThreadFunction : TSK__Thread_Msgloop;
        if (active == stActivePending_Unchecked)
            Thread_Start();
    }
    TSK(TSK_active aActive) : TSK((ID64VALUE)0, aActive, false, NULL) { }
    TSK() : TSK(stFlag_Unchecked) { }
    PTSK__Threadfunction tskThreadFunction;
    bool bDeleteOnRemove;
    LPWSTR Id()
    {
        wsprintf(szId, L"%I64u", idval.id.ui64);
        return szId;
    }
    LPWSTR Value() { return idval.value; }
    LPWSTR Comment() { return (LPWSTR)L"comment TODO!"; }
    TSK* Child() { return (TSK*)pChild; }
    TSK* Sibling() { return (TSK*)pSibling; }

    bool GetStateChecked()
    {
        switch (active)
        {
        case stFlag_Checked:
        case stDonePending_Checked:
        case stDone_Checked:
            return true;
        }
        return false; // nothing done, 
    }

    bool StateSignalToggleChecked(bool bChecked)
    {
        switch (active)
        {
        #pragma region Flag states
            case stFlag_Unchecked:
            case stFlag_Checked:
                active = bChecked ? stFlag_Unchecked : stFlag_Unchecked;
                return true;
        #pragma endregion
        #pragma region Inactive, active pending, active, pause, done pending, done, failed
            case stInactive_Unchecked:
                if (!bChecked) return true; // Correct to have unchecked, UI out of sync?
                active = stActivePending_Unchecked; // Starting up thread...
                return true;
            case stActivePending_Unchecked:
                if (!bChecked) return true; // Correct to have unchecked, UI out of sync?
                return Thread_Start();
            case stActive_Unchecked:
                if (!bChecked) return true; // Correct to have unchecked, UI out of sync?
                active = stDonePending_Checked;
                break;
            case stDonePending_Checked:
                if (bChecked) return true; // Correct to have checked, UI out of sync?
                break;
            case stDone_Checked:
                if (bChecked) return true; // Correct to have checked, UI out of sync?
                break;
            case stFailed_Unchecked:
                if (!bChecked) return true; // Correct to have unchecked, UI out of sync?
                break;
        #pragma endregion 
        }
        return false; // nothing done, 
    }
    bool ShowStatus()
    {
        Thread_PostMessage(TM_SELECTED, TM_SELECTED);
        return false;
    }
    DWORD Thread_Start()
    {
        if (hThread)
            TerminateThread(hThread, -1);
        hThread = CreateThread(NULL, 0, (LPTHREAD_START_ROUTINE)tskThreadFunction, (LPVOID)this, 0, &dwThreadId);
        if ((active == stActivePending_Unchecked || active == stActive_Unchecked)
            && tskThreadFunction == TSK__Thread_Msgloop)
        {
            //Sleep(100);
        }
        return dwThreadId;
    }
    bool Thread_Stop(bool bWaitfor = true)
    {
        bool bRes = true;
        if (hThread)
        {
            bRes = Thread_PostMessage(WM_QUIT);
            if (bWaitfor)
            {
                active = stDonePending_Checked;
                bRes &= Thread_Waitfor();
            }
        }
        active = stDonePending_Checked;
        return bRes;
    }
    bool Thread_Waitfor()
    {
        if (hThread != NULL) //else GetLastError());
        {
            WaitForSingleObject(hThread, INFINITE); // Wait for the thread to finish
            CloseHandle(hThread); // Close the thread handle
            dwThreadId = 0;
            hThread = NULL;
            return true;
        }
        return false; 
    }
    BOOL Thread_PostMessage(UINT wMsg,WPARAM wParam=0,LPARAM lParam=0)
    {
        if (dwThreadId == 0)
            return FALSE;
        return PostThreadMessage(dwThreadId, wMsg, wParam, lParam);
    }
    BOOL Thread_HandleMessage(MSG* pMsg)
    {
        switch (pMsg->message)
        {
        case TM_SELECTED: return MessageBox(NULL, L"selected me", L"I'm active working in bg", MB_OK);
        case TM_(1)/*32891*/: return MessageBox(NULL, L"Hello World", L"From Thread", MB_OK);
        }
        return TRUE; // FALSE quits thread
    }
    void HelloWorld()
    {
        //Thread_Start();
        Thread_PostMessage(TM_(1));
    }
protected:
    HANDLE hThread = NULL;
    DWORD dwThreadId = 0;;
    WCHAR szId[22] = L"";
};

DWORD WINAPI TSK__Thread_Msgloop(TSK* pTsk)
{
    pTsk->active = stActive_Unchecked;
    MSG msg = { 0 };
    //PostThreadMessage(); HelloWorld
    BOOL rc = 0;// PeekMessage(&msg, 0, 0, 0, PM_NOREMOVE); // Enforce message queue to start!
    while (rc = GetMessage(&msg, 0, 0, 0))
    {
        pTsk->Thread_HandleMessage(&msg);
        DispatchMessage(&msg);
    }
    pTsk->active = stDone_Checked;
    return rc;
}

DWORD WINAPI TSK__Threadfunction_CheckWhenParentsChecked(TSK* pTsk)
{
    pTsk->active = stActive_Unchecked;
    WORD wCycles = 1;
    // TODO: Get list of all TSK that should be checked and isn't. If none is found, set active to stDone_Checked
    while (pTsk->active == stActive_Unchecked)
    { // TODO: cycle every 10ms, check if any TSK left that are not checked
        Sleep(10);
        // TODO: if first in list now has become checked, remove from list and keep checking
    }
    pTsk->active = stDone_Checked;
    return 0;
}

#pragma endregion
#pragma region _g_ - Global variables

HINSTANCE _g_hInst;
HWND _g_hDlg, _g_hTreeStatus, _g_hListStatus;
HIMAGELIST _g_hTreeImages;
HTREEITEM _g_hNodeLog;

#pragma endregion
#endif // _SEMNAVIGATECONTENTWIKI_GET_H
