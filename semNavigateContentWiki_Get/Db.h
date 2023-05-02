#pragma once
#ifndef UNICODE
#define UNICODE
#endif

#ifndef _h_db_
#define _h_db_
#include <shlwapi.h>
#include <sql.h>
#include <sqlext.h>

#pragma region ID64VALUE, UI48DATE16, DATE_16, UI128UI48DATE16, TITLE, SOURCE, ARTICLE

typedef struct DATE_16 {
    DATE_16() : DATE_16(20, 1, 1) {} // Default 1.1.2000
    DATE_16(ULONG yyyymmdd) : DATE_16( // ikke testet!
        (yyyymmdd < 1000000
            ? (yyyymmdd / 10000) - 20 // support yymmdd; 2000mmdd-2099mmdd -> 20-119
            : (yyyymmdd - 19800000) / 10000 // yyyymmdd; %10000; 1980mmdd-2099mmdd -> 0-119
            )
        , (yyyymmdd % 10000) / 100
        , yyyymmdd % 100) {}
    DATE_16(unsigned int y, unsigned int m, unsigned int d) : year(y), month(m), day(d) 
    { // test for valid 16-bit date
        if (y > 120) y = 120;
        if (!m) m = 1;
        else if (m > 12) m = 12;
        if (!d) d = 1;
        else if (m == 2)
        {
            if (y % 400 == 0 || (y % 4 == 0 && y % 100 != 0)) { if (d > 29) d = 29; }
            else if (d >> 28) d = 28;
        }
        else if (m == 4 || m == 6 || m == 9 || m == 11) { if (d > 30) d = 30; }
        else if (d > 31) d = 31;
    }
    unsigned int year : 7; // 0-119	(relative to 1980)
    unsigned int month : 4; // 1-12
    unsigned int day : 5; // 1-31
} DATE_16, * PDATE_16;
typedef union UI48DATE16 {
    ULONGLONG ui64;
    typedef struct {
        unsigned long long ui48 : 48; // checksum-part
        unsigned int year : 7; // 0-119	(relative to 1980)
        unsigned int month : 4; // 1-12
        unsigned int day : 5; // 1-31
    } date;
} UI48DATE16, * PUI48DATE16;
typedef union UI128UI48DATE16 {
    struct {
        BYTE hash[16];
    } in;
    struct {
        BYTE ignore[8];
        UI48DATE16 keep;
    } out;
} UI128UI48DATE16, * PUI128UI48DATE16;
typedef struct ID64VALUE
{
    UI48DATE16 id;
    wchar_t* value;
    int valueLen;
    ID64VALUE(): valueLen(0), value(NULL)
    {
        id.ui64 = 0;
    }
    ID64VALUE(size_t iMalloc) : ID64VALUE()
    {
        value = (wchar_t*)malloc(static_cast<size_t>(2) + iMalloc * 2);
    }
    ID64VALUE(PWSTR sz, DATE_16 dt) : ID64VALUE()
    {
        SetValue(sz, dt);
    }
    void SetValue(PCWSTR sz, DATE_16 dt)
    {
        valueLen = lstrlen(sz);
        value = (wchar_t*)malloc(2 + (size_t)valueLen * 2);
        if (value) {
            lstrcpy(value, sz);
            DATE_16 dt;
            id.ui64 = Md5Dull(sz, dt);
        }
    }
    LPWSTR ReallocString(size_t iWcharCount)
    {
        valueLen = (int)iWcharCount;
        wchar_t* oldValue = value;
        wchar_t* newValue = (wchar_t*)malloc(2 + (size_t)valueLen * 2);
        value = newValue;
        if (oldValue)
        {
            memcpy_s(value, 2 + (size_t)valueLen * 2, oldValue, 2 + (size_t)valueLen * 2);
            delete oldValue;
        }
        return newValue;
    }
    LPWSTR ReallocString() { return ReallocString(lstrlen(value)); }
    static ULONGLONG Md5Dull(PCWSTR sz, DATE_16 dt)
    {
        UI128UI48DATE16 res = { 0 };
        HCRYPTPROV hProv = 0;
        HCRYPTHASH hHash = 0;
        DWORD hashLen = 16;
        int sz_size = lstrlen(sz) * sizeof(wchar_t);
        CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_FULL, CRYPT_VERIFYCONTEXT);
        CryptCreateHash(hProv, CALG_MD5, 0, 0, &hHash);
        CryptHashData(hHash, (BYTE*)sz, sz_size, 0);
        CryptGetHashParam(hHash, HP_HASHVAL, res.in.hash, &hashLen, 0);
        CryptDestroyHash(hHash);
        CryptReleaseContext(hProv, 0);
        return res.out.keep.ui64;
    }
} ID64VALUE, * PID64VALUE;
typedef struct TITLE : ID64VALUE
{
    TITLE() : ID64VALUE(), source_id(0) {};
    TITLE(PWSTR sz) : ID64VALUE(sz, (DATE_16)0), source_id(0) {};
    ULONG source_id; // UI48DATE16
} TITLE, * PTITLE;
typedef struct SOURCE : ID64VALUE
{
    ID64VALUE idParent = 0, idNext, idFirstchild = 0; // UI48DATE16
} SOURCE, * PSOURCE;
typedef struct ARTICLE : ID64VALUE
{
    ULONG idSource, idArticle; // UI48DATE16
} ARTICLE, * PARTICLE;

class Db
{
public:
	Db() {};
    virtual ~Db() {}
    virtual bool EnsureAccess(const wchar_t* szPosition) { return false; }
    bool EnsureTables() { return EnsureDb() & false; }
	bool EnsureMetadata() { return EnsureTables() & false; }
	bool Load_Mirror(wchar_t* szLanguage, wchar_t* szSource) { return EnsureTable_Title(szLanguage) & EnsureTable_Mirror(szSource) & false; }
	bool Load_Article(wchar_t* szLanguage, wchar_t* szSource) { return EnsureTable_Article(szLanguage) & EnsureTable_Mirror(szSource) & false; }
	bool Load_Title(wchar_t* szLanguage, wchar_t* szSource) { return Load_Article(szLanguage, szSource) & EnsureTable_Mirror(szSource) & false; }
protected:
    SOURCE fSource;
    TITLE fTitle;
    TITLE fArticle;
    bool EnsureDb() { return false; }
	bool EnsureTable_Language(wchar_t* szLanguage) { return EnsureMetadata() & false; }
	bool EnsureTable_Mirror(wchar_t* szMirror) { return EnsureMetadata() & false; }
	bool EnsureTable_Title(wchar_t* szLanguage) { return EnsureMetadata() | false; }
	bool EnsureTable_Article(wchar_t* szLanguage) { return EnsureMetadata() | false; }
}; 

class DbDisk : Db
{
public:
	DbDisk() : Db() {};
    virtual bool EnsureAccess(const wchar_t* szPosition) override { return false;/* access to write on disk */ }
};

class DbSql : Db
{
private:
    SQLHANDLE AllocHandle(SQLSMALLINT fHandleType, SQLHANDLE hInput)
    {
        SQLHANDLE hRes;
        if (!SQL_SUCCEEDED(SQLAllocHandle(fHandleType, hInput, &hRes)))
            hRes = NULL;
        return hRes;
    }
    SQLHDBC sqlConn;
    SQLHENV sqlEnv;
public:
	DbSql() : Db() {
        sqlEnv = AllocHandle(SQL_HANDLE_ENV, SQL_NULL_HANDLE);
        SQLSetEnvAttr(sqlEnv, SQL_ATTR_ODBC_VERSION, (void*)SQL_OV_ODBC3, 0);
        sqlConn = AllocHandle(SQL_HANDLE_DBC, sqlEnv);
        SQLSetConnectAttr(sqlConn, SQL_LOGIN_TIMEOUT, (SQLPOINTER*)10, 0);// Set login timeout to 5 seconds
    }
    virtual ~DbSql() override
    {
        SQLDisconnect(sqlConn);
        if (sqlConn) SQLFreeHandle(SQL_HANDLE_DBC, sqlConn);
        if (sqlEnv) SQLFreeHandle(SQL_HANDLE_ENV, sqlEnv);
    }
    virtual bool EnsureAccess(const wchar_t* szPosition) override {
        bool bRes = false;
        if (EnsureService(L"MSSQLSERVER"))
        {
            SQLWCHAR retconstring[1024];
            SQLRETURN drvConn = SQLDriverConnect(sqlConn, NULL, (SQLWCHAR*)
                L"DRIVER={SQL Server};SERVER=.;Trusted_Connection=true"
                //L"DRIVER={SQL Server};SERVER=(local);DATABASE=master;UID=sa;PWD=qwe-1QWE"
                , SQL_NTS, retconstring, 1024, NULL, SQL_DRIVER_COMPLETE);
            if (SQL_SUCCEEDED(drvConn))// Connect to data source
            {
                //SQLRETURN rcConn = SQLConnect(drvConn, (SQLCHAR*)L".", 1, NULL, 0, NULL, 0);
                //if (SQL_SUCCEEDED(rcConn))
                    bRes = true;
            }
        }
        return bRes;/* connection to sql worked */
	}
    ID64VALUE *GetIdVal(const wchar_t* sz, ID64VALUE* pRes)
    {
        if (!pRes) 
            pRes = new ID64VALUE(4000);
        SQLHSTMT hStmt = AllocHandle(SQL_HANDLE_STMT, sqlConn);// Allocate statement handle
        SQLExecDirect(hStmt, (SQLWCHAR*)sz, SQL_NTS);// Execute the statement
        SQLLEN lI64 = 0;
        if (SQL_SUCCEEDED(SQLBindCol(hStmt, 1, SQL_BIGINT, &(pRes->id.ui64), 4000, &lI64))
            && SQL_SUCCEEDED(SQLBindCol(hStmt, 2, SQL_C_WCHAR, pRes->value, 4000, (SQLLEN*)&(pRes->valueLen))))
        {
            if (SQLFetch(hStmt) == SQL_SUCCESS) // Fetch result from the statement
            { // Fetch and display the result
                (--(pRes->valueLen)) /= sizeof(wchar_t) ; // remove 0-terminater and halve... 
                pRes->ReallocString(pRes->valueLen);
            }
        }
        SQLFreeHandle(SQL_HANDLE_STMT, hStmt);
        return pRes;
    }
    bool SelectCatalog(LPCWSTR szServiceName) {
        bool bRes = false;
        SQLHSTMT stmt = AllocHandle(SQL_HANDLE_STMT, sqlConn);// Allocate statement handle
        SQLWCHAR* stmt1 = (SQLWCHAR*)
            L"if db_id('wiki_dumpdata') is null exec('create database wiki_dumpdata;alter database wiki_dumpdata set recovery simple')";
        SQLExecDirect(stmt, stmt1, SQL_NTS);// Execute the statement

        PID64VALUE pVer = GetIdVal(L"select id=cast(-1 as bigint),value=@@VERSION", NULL);
        OutputDebugString(pVer->value);
        delete pVer;

        SQLFreeHandle(SQL_HANDLE_STMT, stmt);
    }
    bool ConnectDb(LPCWSTR szServiceName) {
    }
    bool EnsureService(LPCWSTR szServiceName) {
        bool bRes = false;
        SC_HANDLE schSCManager = OpenSCManager(NULL, NULL, SC_MANAGER_ALL_ACCESS);
        if (schSCManager)
        {
            SC_HANDLE schService = OpenService(schSCManager, L"MSSQLSERVER", SERVICE_QUERY_STATUS);
            if (schService)
            {
                SERVICE_STATUS_PROCESS ssp = { 0 };
                DWORD dwBytesNeeded;
                if (QueryServiceStatusEx(schService, SC_STATUS_PROCESS_INFO, (LPBYTE)&ssp, sizeof(SERVICE_STATUS_PROCESS), &dwBytesNeeded))
                {
                    if (ssp.dwCurrentState == SERVICE_RUNNING)
                        bRes = true;
                    CloseServiceHandle(schService);
                }
                CloseServiceHandle(schSCManager);
            }
        }
        return bRes;
    }
};

#endif // _h_db_
