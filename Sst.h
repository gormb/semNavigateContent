using System;

#ifndef _h_sst_
#define _h_sst_

// class to connect to any "speech to text"-engine, from IBM, Amazon, Microsoft, google, others...

class Sst
{
    class SstProvider
    {
        int nProvider;
        LPCWSTR szUrl, szKey;
    public:
        SstProvider(int nProvider_, LPCWSTR szUrl_, LPCWSTR szKey_) : nProvider(nProvider_), szUrl(szUrl_), szKey(szKey_) { }
    };
    constexpr auto STT_PROVIDER_NONE = 0;
    SstProvider provStatic(STT_PROVIDER_NONE, L"https://example.com/provider/url/with/full/link", L"muckup 01234567890abcdefabc");
    SstProvider aProvKnownStt[];
	Sst()
	{
        aProvKnownStt[] = 
        {
            SstProvider(1, L"https://aws.amazon.com/transcribe/", L"muckup 01234567890abcdefab"),
            SstProvider(2, L"https://azure.microsoft.com/en-us/services/cognitive-services/speech-to-text/", L"muckup 01234567890abcdefab"),
            SstProvider(3, L"https://cloud.google.com/speech-to-text/", L"muckup 01234567890abcdefab"),
            SstProvider(4, L"https://www.nuance.com/solutions/speech-recognition.html", L"muckup 01234567890abcdefab"),
            SstProvider(5, L"https://www.speechmatics.com/", L"muckup 01234567890abcdefab"),
            SstProvider(6, L"https://www.rev.com/speech-to-text", L"muckup 01234567890abcdefab"),
            SstProvider(7, L"https://www.speechpad.com/speech-to-text", L"muckup 01234567890abcdefab"),
        }
}
#endif //_h_sst_