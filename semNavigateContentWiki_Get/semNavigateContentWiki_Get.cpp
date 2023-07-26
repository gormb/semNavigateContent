// semNavigateContentWiki_Get.cpp : Defines the entry point for the application.
// wWinMain()

#include "framework.h"
#include "semNavigateContentWiki_Get.h"
#include "db.h"

#pragma region Lvw - List View
void LvwClearRows()
{
    ListView_DeleteAllItems(_g_hListStatus);
}
void LvwAddRow(PCWSTR sz0, PCWSTR sz1)
{
    LV_ITEM lvItem{};
    lvItem.mask = LVIF_TEXT;
    //lvItem.iItem = iRow;    
    lvItem.iSubItem = 0;    
    lvItem.pszText = (LPWSTR)sz0; 
    LRESULT rc = ListView_InsertItem(_g_hListStatus, &lvItem); // Insert/Show the item
    lvItem.iSubItem = 1;        
    lvItem.pszText = (LPWSTR)sz1; 
    rc = ListView_SetItem(_g_hListStatus, &lvItem); // Insert/Show the item
}
void LvwInitAddCol(int iCol, PCWSTR sz, int cx = 0)
{
    LV_COLUMN lvCol{}; // Listview Column structure
    lvCol.mask = /*LVCF_FMT | */LVCF_WIDTH | LVCF_TEXT | LVCF_SUBITEM; // Type of mask 
    lvCol.cx = (cx == 0) ? 50 : cx; // Width of the column, in pixels
    lvCol.pszText = (LPWSTR)sz;
    ListView_InsertColumn(_g_hListStatus, iCol, &lvCol); // Insert/Show the column
}
void LvwInit()
{
    _g_hListStatus = GetDlgItem(_g_hDlg, IDC_LIST_STATUS);
    LvwInitAddCol(0, L"ID", 50);
    LvwInitAddCol(1, L"Value", 150);
    LvwAddRow(L"-3403828459583983689", L"Microsoft SQL Server 2022 (RTM) - 16.0.1000.6 (X64)   Oct  8 2022 05:58:25   Copyright (C) 2022 Microsoft Corporation  Developer Edition (64-bit) on Windows 10 Home 10.0 <X64> (Build 22000: )");
    LvwAddRow(L"generer id med SQL", L"med foelgende kode");
    LvwAddRow(L"-887751845686652855", L"select id=cast(hashbytes('MD5', @@VERSION) as bigint) &~65535 | substring(cast(getdate() as binary(6)), 1, 2), value=@@VERSION");
    // select id=cast(hashbytes('MD5', @@VERSION) as bigint) &~65535 | substring(cast(getdate() as binary(6)), 1, 2), value=@@VERSION
}
#pragma endregion

#pragma region Tvw - Tree View
WCHAR *TvwItemText(HTREEITEM hRes, WCHAR* sz, int iMax = 0)
{ // return tree node text in sz
    TVITEM tvi{};
    tvi.hItem = hRes;
    tvi.mask = TVIF_TEXT;
    tvi.pszText = sz;
    tvi.cchTextMax = iMax;
    if (!TreeView_GetItem(_g_hTreeStatus, &tvi))
        return NULL;
    return sz;
}
HTREEITEM TvwItem(PCWSTR sz, HTREEITEM hRes = NULL)
{ // return tree node with text sz, from root or "hRes"
    wchar_t szTvi[MAX_PATH] = { 0 };
    for (hRes = TreeView_GetChild(_g_hTreeStatus, hRes)
        ; hRes != NULL
        ; hRes = TreeView_GetNextSibling(_g_hTreeStatus, hRes))
    {
        if (TvwItemText(hRes, szTvi, MAX_PATH)) //if (TreeView_GetItem(_g_hTreeStatus, &tvi))
            if (wcscmp(szTvi, (PCWSTR)sz) == 0)
                break; // hRes returned
        HTREEITEM hChild = TvwItem(sz, hRes);
        if (hChild)
            return hChild;
    }
    return hRes;
}
bool TvwTaskSet(HTREEITEM hItem, TSK *pTsk)
{
    TVITEM tvi = { 0 };
    tvi.mask = TVIF_PARAM;
    tvi.hItem = hItem;
    tvi.lParam = (LPARAM)(pTsk);
    TreeView_SetItem(_g_hTreeStatus, &tvi);
    return true;
}
bool TvwTaskSet(PCWSTR sz, TSK *pTsk) { return TvwTaskSet(TvwItem(sz), pTsk);}

TSK* TvwTaskGet(HTREEITEM hItem)
{
    TVITEM tvi = { 0 };
    tvi.mask = TVIF_PARAM;
    tvi.hItem = hItem;
    TreeView_GetItem(_g_hTreeStatus, &tvi);
    return (TSK*)(tvi.lParam);
}
TSK* TvwTaskGet(PCWSTR sz) { return TvwTaskGet(TvwItem(sz)); }

void TvwExpand(HTREEITEM hItem, bool bExpand)
{
    TreeView_Expand(_g_hTreeStatus, hItem, bExpand ? TVE_EXPAND : TVE_COLLAPSE);
}
void TvwExpand(PCWSTR sz, bool bExpand) { TvwExpand(TvwItem(sz), bExpand); }

HTREEITEM TvwAdd(HTREEITEM hParent, PCWSTR sz, TSK *pTsk = NULL)
{
    if (pTsk == NULL)
    {
        pTsk = new TSK();
        pTsk->bDeleteOnRemove = true;
    }
    TV_INSERTSTRUCT tvis{0};
    tvis.hParent = hParent;
    tvis.hInsertAfter = TVI_LAST;
    tvis.item.mask = TVIF_TEXT | TVIF_PARAM | TVIF_IMAGE | TVIF_SELECTEDIMAGE;
    tvis.item.pszText = (LPWSTR)sz;
    tvis.item.lParam = (LPARAM)(pTsk);
    tvis.item.iSelectedImage = 1; //tvis.item.iImage = 0;
    pTsk->hNode = TreeView_InsertItem(_g_hTreeStatus, &tvis);
    if (pTsk->GetStateChecked())
        TreeView_SetCheckState(_g_hTreeStatus, pTsk->hNode, true);
    if (hParent)
        SendMessage(_g_hTreeStatus, TVM_EXPAND, (WPARAM)TVE_EXPAND, (LPARAM)hParent);
    return pTsk->hNode;
}
HTREEITEM TvwAdd(PCWSTR szParent, PCWSTR sz, TSK *pTsk = NULL) { return TvwAdd(TvwItem(szParent), sz, pTsk);} // Find parent and add
HTREEITEM TvwAdd(PCWSTR sz, TSK *pTsk = NULL) { return TvwAdd(TVI_ROOT, sz, pTsk); } // Add to root
bool TvwCheckAdjust(HTREEITEM hItem)
{
    bool bChecked = TvwTaskGet(hItem)->GetStateChecked();
    if (TreeView_GetCheckState(_g_hTreeStatus, hItem) != (BOOL)bChecked)
        TreeView_SetCheckState(_g_hTreeStatus, hItem, bChecked);
    return bChecked;
}
void TvwInitImages_Add(PCWSTR bitmapName)
{
    HBITMAP hBitmap = LoadBitmap(_g_hInst, (LPCWSTR)bitmapName);
    ImageList_Add(_g_hTreeImages, hBitmap, NULL);
    DeleteObject(hBitmap);
}
void TvwInitImages(int icTree)
{
    _g_hTreeImages = ImageList_Create(16, 16, ILC_COLOR16, 2, 1);
    TvwInitImages_Add(MAKEINTRESOURCE(IDB_BMP_TV_UNSELECTED));
    TvwInitImages_Add(MAKEINTRESOURCE(IDB_BMP_TV_SELECTED));
    SendDlgItemMessage(_g_hDlg, icTree, TVM_SETIMAGELIST, 0, (LPARAM)_g_hTreeImages);
}
void TvwInit()
{
    HTREEITEM hUpd, hStatus;
    _g_hTreeStatus = (HWND)GetDlgItem(_g_hDlg, IDC_TREE_STATUS);
    SetWindowLongPtr(_g_hTreeStatus, GWL_STYLE, GetWindowLong(_g_hTreeStatus, GWL_STYLE) | TVS_CHECKBOXES); // checkboxes
    TvwInitImages(IDC_TREE_STATUS);
#define TskCWPC TSK__Threadfunction_CheckWhenParentsChecked
    TvwAdd(TvwAdd(TvwAdd(TvwAdd(hUpd=TvwAdd(L"Status"
        , L"Data updated")
            , L"Metadata updated")
                , L"Tables present")
                    , L"Database present")
                        , L"Server for data connected");
        TvwAdd(TvwAdd(TvwAdd(TvwAdd(TvwAdd(TvwAdd(TvwAdd(hUpd
            , L"Load data from compressed remote")
                , L"perform delta with historization, reuse from/to dates from source")
                    , L"check if new files for each language")
                        , L"download and convert on the fly with one connection to each of all mirror-sites all historical tables, use 7z dll to convert directly")
                            , L"get all languages (read all mirrors, save languages and the list of where the newest resides)")
                                , L"get all mirror sites: https://dumps.wikimedia.org/mirrors.html")
                                    , L"ensure Python installed", new TSK(L"cmd /Cpython -V"));
        TvwAdd(TvwAdd(hUpd
            , L"Next update scheduled")
                , L"Update mechanisms decided and created");
    TvwExpand(L"Metadata updated", false);
    TvwExpand(L"Load data from compressed remote", false);
    TvwExpand(L"Next update scheduled", false);

    _g_hNodeLog = TvwAdd(hStatus = TvwAdd(L"Status"), L"Log", new TSK(0, stDone_Checked, true, TskCWPC));
        TvwAdd(hStatus, L"Bugs/TODO", new TSK(0, stDone_Checked, true, TSK__Threadfunction_CheckWhenParentsChecked));
        TvwAdd(TvwAdd(TvwAdd(L"Log"
            , L"Handle politics", TSK_TODO)
                , L"Fear mongering click bait journalists", TSK_TODO)
                    , L"Living proxy for fear mongering click bait journalists", TSK_TODO);
        TvwExpand(L"Handle politics", false);

}
#pragma endregion 

#pragma region Dsp - Display status 
WCHAR* DspSetTxt(int iControl, WCHAR* sz)
{
    SetWindowText(GetDlgItem(_g_hDlg, IDC_STATIC_STATUSLIST), sz);
    return sz;
}
WCHAR* DspGetTxt(int iControl, WCHAR* sz)
{
    SetWindowText(GetDlgItem(_g_hDlg, IDC_STATIC_STATUSLIST), sz);
    return sz;
}
WCHAR* DspDebugTxt(TCHAR* szTvwText, SIZE_T lTvwText, WPARAM wParam, LPARAM lParam)
{ // alloc ad
    swprintf(szTvwText, lTvwText, L"wParam %u, lParam %lu, LO(wParam) %u", (UINT)wParam, (UINT)lParam, LOWORD(wParam));
    return szTvwText;
}
INT_PTR DspTvwItem(HTREEITEM hTvi = NULL)
{
    TCHAR sz[MAX_PATH] = { 0 };
    if (hTvi == NULL)
        hTvi = TreeView_GetSelection(_g_hTreeStatus);
    TvwItemText(hTvi, sz, MAX_PATH); //if (TreeView_GetItem(_g_hTreeStatus, &tvi))
    DspSetTxt(IDC_STATIC_STATUSLIST, sz);
    TSK* pTsk = TvwTaskGet(hTvi);
    pTsk->ShowStatus();
    return FALSE;
}
#pragma endregion

#pragma region Edt - Edits and texts
HWND MsgSetTxt(WORD c, PCWSTR sz)
{
    HWND hc = GetDlgItem(_g_hDlg, c);
    SendMessage(hc, WM_SETTEXT, NULL, (LPARAM)sz);
    return hc;
}
PCWSTR MsgGetTxt(WORD c, PCWSTR sz, WORD lsz)
{
    HWND hc = GetDlgItem(_g_hDlg, c);
    GetWindowText(hc, (LPWSTR)sz, lsz);
    return sz;
}
#pragma endregion

#pragma region Msg - Message loop and message handlers

#define APP_CHECKSTATECHANGE (WM_APP + 0x1001)

void BugAddKnown();

BOOL MsgInit(HWND hD)
{
    _g_hDlg = hD;
    INITCOMMONCONTROLSEX icc = {};
    icc.dwSize = sizeof(INITCOMMONCONTROLSEX);
    icc.dwICC = 0
        | ICC_LISTVIEW_CLASSES    // listview, header
        | ICC_TREEVIEW_CLASSES    // treeview, tooltips
        //| ICC_BAR_CLASSES         // toolbar, statusbar, trackbar, tooltips
        //| ICC_TAB_CLASSES         // tab, tooltips
        //| ICC_UPDOWN_CLASS        // updown
        //| ICC_PROGRESS_CLASS      // progress
        //| ICC_HOTKEY_CLASS        // hotkey
        //| ICC_ANIMATE_CLASS       // animate
        //| ICC_WIN95_CLASSES
        //| ICC_DATE_CLASSES        // month picker, date picker, time picker, updown
        //| ICC_USEREX_CLASSES      // comboex
        //| ICC_COOL_CLASSES        // rebar (coolbar) control
        //| ICC_INTERNET_CLASSES
        //| ICC_PAGESCROLLER_CLASS    // page scroller
        //| ICC_NATIVEFNTCTL_CLASS    // native font control
        //| ICC_LISTVIEW_CLASSES
        ;
    InitCommonControlsEx(&icc);
    TvwInit();
    LvwInit();
    BugAddKnown();
    return TRUE;
}

void MsgPos(HWND hW, int l, int t, int r, int b)
{
    RECT rect;// , drect; // Get position of hW
    GetWindowRect(hW, &rect);
    ScreenToClient(_g_hDlg, (LPPOINT)(&rect));
    ScreenToClient(_g_hDlg, (LPPOINT)(&rect.right));
    if (l < 0) l = rect.left;
    if (t < 0) t = rect.top;
    if (r < 0) r = rect.right;
    if (b < 0) b = rect.bottom;
    MoveWindow(hW, l, t, r - l, b - t, TRUE);
}

BOOL MsgResize(HWND hD, WPARAM wParam, LPARAM lParam)
{
    WORD w = LOWORD(lParam);
    WORD h = HIWORD(lParam);
    // 
    MsgPos(_g_hTreeStatus, -1, -1, -1, h - 30);  
    MsgPos(GetDlgItem(_g_hDlg, IDC_STATIC_STAT), -1, -1, -1, h - 10);
    MsgPos(_g_hListStatus, -1, -1, w - 30, h - 30);
    MsgPos(GetDlgItem(_g_hDlg, IDC_STATIC_STATUSLIST), -1, -1, w - 10, h - 10);
    return TRUE;
}

INT_PTR MsgNotify(WORD wParamLw, LPARAM lParam)
{
    wchar_t buffer[MAX_PATH];
    switch (wParamLw)
    {
    case IDC_TREE_STATUS:
        LPNMHDR nmInfo = (LPNMHDR)lParam;
        UINT chg = 0;
        switch (nmInfo->code)
        {
        case TVN_SELCHANGED: return DspTvwItem();
        case TVN_DELETEITEM: {
                TSK* pTsk = (TSK*)(((LPNMTREEVIEW)lParam)->itemOld.lParam);
                if (pTsk && pTsk->bDeleteOnRemove)
                    delete pTsk; 
            }
            return TRUE; 
        case TVN_KEYDOWN: return PostMessage(_g_hDlg, APP_CHECKSTATECHANGE, (WPARAM)nmInfo->hwndFrom, (LPARAM)TreeView_GetSelection(_g_hTreeStatus));
        case NM_CLICK: {// TvwCheckAdjust
                    DWORD dwpos = GetMessagePos();
                    TVHITTESTINFO ht = { { LOWORD(dwpos), HIWORD(dwpos)}, 0, 0 };
                    MapWindowPoints(HWND_DESKTOP, nmInfo->hwndFrom, &ht.pt, 1);
                    TreeView_HitTest(nmInfo->hwndFrom, &ht);
                    if (TVHT_ONITEMSTATEICON & ht.flags)
                        PostMessage(_g_hDlg, APP_CHECKSTATECHANGE, (WPARAM)nmInfo->hwndFrom, (LPARAM)ht.hItem); //else //    TreeView_SelectItem(nmInfo->hwndFrom, NULL);
                }
                return TRUE;
        default:
            OutputDebugString(DspDebugTxt(buffer, MAX_PATH, wParamLw, nmInfo->code));
            OutputDebugString(L"\n");
            return TRUE;
        }
    }
    return FALSE;
}

INT_PTR CALLBACK Msg(HWND hD, UINT msg, WPARAM wParam, LPARAM lParam)
{
    TCHAR szBuf[256];
    WORD wParamLw = LOWORD(wParam);
    switch (msg)
    {
    case WM_INITDIALOG: return MsgInit(hD);
    case WM_SIZE: return MsgResize(hD, wParam, lParam);
    case WM_COMMAND: {
            switch (wParamLw)
            {
            case IDCANCEL:      return EndDialog(hD, wParamLw);
            case IDOK:          return 0;
            }
            OutputDebugString(DspDebugTxt(szBuf, 256, wParamLw, lParam));
            return FALSE;
        }
    case WM_NOTIFY:         return MsgNotify(wParamLw, lParam);
    case APP_CHECKSTATECHANGE: return TvwCheckAdjust((HTREEITEM)lParam);
    default:
        return 0;
    }
}
#pragma endregion

#pragma region WinMain and bugs

int APIENTRY wWinMain(_In_ HINSTANCE, _In_opt_ HINSTANCE, _In_ LPWSTR, _In_ int)
{
    //ASSERT(_g_hDlg == NULL);
    _g_hInst = GetModuleHandle(NULL);
    DialogBox(_g_hInst, MAKEINTRESOURCE(IDD_ABOUTBOX), GetDesktopWindow(), Msg);
    return 0;
}

void BugAddKnown()
{
    HTREEITEM hGui, hFuncHost, hRecordSound;
    TvwAdd(hGui = TvwAdd(L"Bugs/TODO"
        ,L"GUI", TSK_TODO)
            , L"vis valgt node og nærmeste barns status i listview", TSK_TODO);
        TvwAdd(TvwAdd(TvwAdd(TvwAdd(hGui
            , L"thread oppdatrer checkbox når under sjekket", new TSK(0, stActive_Unchecked, true,TSK__Threadfunction_CheckWhenParentsChecked))
                , L"legg buttons for start/pause/stop thread", TSK_TODO)
                    , L"vis status for thread i listview", new TSK(stActivePending_Unchecked))
                        , L"legg enkel thread i node/listview", new TSK(stActivePending_Unchecked));//
                    TSK *pTsk = TvwTaskGet(L"legg enkel thread i node/listview");
                    pTsk->Thread_Stop(true); // pTsk->active is Done_Pending, not Done! Why?! pTsk->active = pTsk->active;
        TvwAdd(TvwAdd(hGui
            , L"(Ikke) Host RUST; stoppet fordi det mangler debugger. Anvender SQL/CPP", TSK_TODO_DONE)
                , L"Lær RUST; https://youtu.be/pTMvh6VzDls", TSK_TODO_DONE);
    TvwAdd(TvwAdd(TvwAdd(TvwAdd(TvwAdd(TvwAdd(L"Bugs/TODO"
        , L"wiki spiselig", TSK_TODO)
            , L"wiki id sortable and works in 64-bit", TSK_TODO)
                , L"wiki tidslinje: les alle med samme code&0xFFFFFFFFFFFFFFFFull ignorer de med annen title", TSK_TODO)
                    , L"wiki id: 48 bit: part of checksum; (code & 0xFFFFFFFFFFFFFFFFull; common birthday about 2M art", TSK_TODO)
                        , L"wiki id: 16 bit date: ((__uint64)DATE) << 48  https://learn.microsoft.com/en-us/cpp/c-runtime-library/32-bit-windows-time-date-formats?view=msvc-170", TSK_TODO)
                            , L"wiki hent inn alle titler med date, title", TSK_TODO);
        TvwAdd(L"wiki spiselig", L"les https", TSK_TODO);
        TvwAdd(L"wiki spiselig", L"les mem mapped fil", TSK_TODO);
        TvwAdd(L"wiki spiselig", L"anvend 7z", TSK_TODO);
        TvwExpand(L"wiki spiselig", false);
    TvwAdd(TvwAdd(TvwAdd(TvwAdd(TvwAdd(TvwAdd(TvwAdd(L"Bugs/TODO"
        , L"wiki lagring", TSK_TODO)
            , L"File EnsureAccess(\".Out\")", TSK_TODO)
                , L"File Load_Language(\"none\", \"none\")", TSK_TODO)
                    , L"File Load_Mirrors(\"none\", \"none\")", TSK_TODO)
                        , L"File Load_Article(\"none\", \"none\")", TSK_TODO)
                            , L"File Load_Title(\"none\", \"none\")", TSK_TODO)
                                , L"File lagre inn alle titler med date, title", TSK_TODO);
        TvwAdd(TvwAdd(TvwAdd(TvwAdd(TvwAdd(TvwAdd(L"wiki lagring"
            , L"SQL EnsureAccess(\".\\Out\", EnsureService sikre at tjenesten kjører!", TSK_TODO)
                , L"SQL Load_Language(\"none\", \"none\")", TSK_TODO)
                    , L"SQL Load_Mirrors(\"none\", \"none\")", TSK_TODO)
                        , L"SQL Load_Article(\"none\", \"none\")", TSK_TODO)
                            , L"SQL Load_Title(\"none\", \"none\")", TSK_TODO)
                                , L"SQL Lagre inn alle titler med id, title", TSK_TODO);
                TvwAdd(L"SQL Load_Language(\"none\", \"none\")"
                    , L"SQL lagre inn alle \"mirror-sites\" inn i fil, deretter bulk - last inn i SQL Server", TSK_TODO);
                    TvwAdd(TvwAdd(L"SQL Load_Mirrors(\"none\", \"none\")"
                        , L"SQL Load_Title(FILE Load_Title(\"none\", \"none\") - bulk load tekstfil", TSK_TODO)
                            , L"SQL lagre inn alle artikler i filer, deretter bulk-last dem inn i SQL Server", TSK_TODO);
        TvwAdd(TvwAdd(L"wiki lagring"
            , L"SQL les metadata", TSK_TODO)
                , L"SQL kontakt database", TSK_TODO);
        TvwExpand(L"wiki lagring", false);
    TvwAdd(TvwAdd(TvwAdd(hFuncHost = TvwAdd(L"Bugs/TODO"
        , L"Functionality hosting", TSK_TODO)
            , L"Do ML with CUDA; NVIDIA performance", TSK_TODO)
                , L"Laer CUDA; bygg tokenizer med CUDA", TSK_TODO)
                    , L"Installer CUDA", TSK_TODO_DONE);
            TvwAdd(L"Do ML with CUDA; NVIDIA performance"
                , L"Do ML with CPP", TSK_TODO);
            TvwExpand(L"Do ML with CUDA; NVIDIA performance", false);
        TvwAdd(TvwAdd(hFuncHost
            , L"Produser utredning vha OpenAI API", TSK_TODO)
                , L"Read textfiles, call webservice at OpenAI, show in treeview", TSK_TODO);
            TvwExpand(L"Produser utredning vha OpenAI API", false);
        TvwAdd(TvwAdd(hFuncHost
            , L"Do/host ML with Python", TSK_TODO)
                , L"Do GPT with Python https://youtu.be/kCc8FmEb1nY", TSK_TODO);
            TvwAdd(L"Do/host ML with Python"
                , L"Test NVIDIA RAPIDS", TSK_TODO);
            TvwAdd(L"Do/host ML with Python"
                , L"Call Python", TSK_TODO);
                TvwAdd(TvwAdd(L"Do/host ML with Python"
                    , L"Run Whisper locally in this program", TSK_TODO)
                        , L"Run Whisper as stand-alone (Open AI)", TSK_TODO);
                TvwAdd(L"Do/host ML with Python"
                    , L"Play music - SCAMP; http://scamp.marcevanstein.com/narrative/music.html ", TSK_TODO);
                TvwExpand(L"Do/host ML with Python", false);
                TvwAdd(hRecordSound = TvwAdd(hFuncHost
                    , L"Record sound in this program", TSK_TODO)
                        , L"Record sound in external program, 2 sec parts every 1 sec", TSK_TODO);
                    TvwAdd(hRecordSound, L"Transcribe sound in external program, 2 sec parts every 1 sec"
                        , TSK_TODO);
    TvwExpand(L"GUI", false);
    // TvwExpand(L"Functionality hosting", false);
}

#pragma endregion