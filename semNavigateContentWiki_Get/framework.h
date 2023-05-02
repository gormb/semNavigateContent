// header.h : include file for standard system include files,
// or project specific include files
//

#pragma once

#include "targetver.h"
#define WIN32_LEAN_AND_MEAN             // Exclude rarely-used stuff from Windows headers
#include <windows.h>
#include <windowsx.h>

#pragma comment(lib, "advapi32")
#include <wincrypt.h>

#pragma comment (lib, "comctl32")
#include <commctrl.h> // tree view
// C RunTime Header Files
//#include <stdlib.h>
#include <malloc.h>
//#include <memory.h>
#include <tchar.h>
