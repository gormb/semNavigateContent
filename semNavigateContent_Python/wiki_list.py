import sys
import requests
import os
import shutil
import datetime
#from bs4 import BeautifulSoup

urlList = "https://dumps.wikimedia.org/backup-index.html"
urlSources = "https://dumps.wikimedia.org/mirrors.html"
parse = "https://www.mediawiki.org/xml/export-0.10.xsd" # https://www.mediawiki.org/wiki/Help:Export#Export_format

#usage
def list_usage(argvalues:list, argstart:int = 2):
    print("Usage: _list <parameters>")
    print("Commands:")
    print("  src - mirrors; list all mirrors saves to file c:\data\wiki\src.txt")
    print("  lang - list all wiki languages saves to file c:\data\wiki\lang.txt")
    print("  dump <lang> - list all dumps for a language saves to file c:\data\wiki\list_(lang).txt")
    print("  dumpshow  list all dumps for all languages (stored in c:\data\wiki\list_*.txt")
    print("  help - this help")

def util_url_combine(path:str, rel:str):
    if path[-1] != '/': path += '/'
    if rel[0] == '/': rel = rel[1:]
    return path + rel

def util_file_current(fn:str):
    res:bool = False
    try:
        if os.path.exists(fn): 
            today = datetime.date.today()
            modified_date = datetime.date.fromtimestamp(os.path.getmtime(fn))
            if modified_date == today:
                if len(open(fn).read(1)) > 0: res = True
                else: shutil.move(fn, "C:\\data\\wiki\\details\\")
    except:
        res = False
    return res

def list_log():     #update the text document c:\data\wiki\lists.txt
    print(sys.argv[0] + " list log Under Construction!")

def list_src():     #src - list all wiki mirrors, save to file c:\data\wiki\src.txt
    try:
        r = requests.get(urlSources)
        if r.status_code != 200:
            print(sys.argv[0] + " list src error getting " + urlSources + "\nStatus code:" + r.status_code + "\nHeaders:" + r.headers)
        else: #parse r.content for mirrors
            d = r.content.decode('utf-8')  # Assuming the response content is in UTF-8 encoding
            with open("c:\\data\\wiki\\src.html", 'w') as file:
                file.write(d)
            #split the content into https:// links
            l = d.split("href=\"https://")
            with open("c:\\data\\wiki\\src.txt", 'w') as file:
                file.write("https://dumps.wikimedia.org/\n")
                for i in range(len(l)):
                    if i > 0 and l[i].find("wiki") >= 0:
                        file.write("https://" + l[i].split("\"")[0] + '\n')
    except:
        print(sys.argv[0] + " list src error getting " + urlSources)

def list_lang():
    try:
        r = requests.get(urlList)
        if r.status_code != 200:
            print(sys.argv[0] + " list lang error getting " + urlList + "\nStatus code:" + r.status_code + "\nHeaders:" + r.headers)
        else: #parse r.content for languages
            d = r.content.decode('utf-8')
            with open("c:\\data\\wiki\\lang.html", 'w') as file:
                file.write(d)
            #split the content into linkes
            l = d.split("<a href=\"")
            with open("c:\\data\\wiki\\lang.txt", 'w') as file:
                for i in range(len(l)):
                    wd = l[i].split("\"")[0].split("wiki/") #keep links that has wiki/ and a date
                    if len(wd) == 2 and wd[1] > "20200101" and wd[1] < "20991231":
                        file.write(wd[0] + '\t' + wd[1] + '\n')
    except:
        print(sys.argv[0] + " list lang error getting " + urlList)
 
def list_dump_src(lang:str,uri:str): #list #get all dumps for a language
    res = []
    useuri = util_url_combine(uri, lang + "wiki"); #https://dumps.wikimedia.org/enwiki
    try: #uri = "https://dumps.wikimedia.org/" + lang + "wiki" #https://dumps.wikimedia.org/enwiki/
        r = requests.get(useuri)
        if r.status_code != 200:
            useuri = util_url_combine(util_url_combine(uri, "dumps"), lang + "wiki"); #https://dumps.wikimedia.org/enwiki
            r = requests.get(useuri)
        if r.status_code != 200:
            useuri = util_url_combine(util_url_combine(uri, "wikimedia"), lang + "wiki"); #https://dumps.wikimedia.org/enwiki
            r = requests.get(useuri)
        if r.status_code != 200:
            useuri = util_url_combine(uri, lang + "wiki").replace("/images/", "/dumps/"); #https://dumps.wikimedia.org/enwiki
            r = requests.get(useuri)
        if r.status_code != 200: 
            print(sys.argv[0] + " list dump error getting " + useuri + "\nStatus code:" + r.status_code + "\nHeaders:" + r.headers)
        else: #parse r.content for mirrors
            d = r.content.decode('utf-8')  # Assuming the response content is in UTF-8 encoding
            with open("c:\\data\\wiki\\list_" + lang + ".html", 'w') as file:
                file.write(d)
            l = d.split("href=\"") #split the content into links
            for i in range(len(l)):
                dt = l[i].split("/")[0];
                if dt > "20200101" and dt < "20991231":
                    res.append([dt, uri, util_url_combine(useuri, dt)]);
    except:
        print(sys.argv[0] + " list src error getting " + useuri)
    return res

def list_dump(lang:str): #get all dumps for a language
    with open("c:\\data\\wiki\\list_" + lang + ".txt", 'w') as fileSaveTxt:
        with open("c:\\data\\wiki\\src.txt", 'r') as file:
            for line in file:
                uri = line.strip('\n').split('\t')[0]
                r = list_dump_src(lang,uri) #list #get all dumps for a language
                for i in range(len(r)):
                    fileSaveTxt.write(r[i][0] + '\t' + r[i][1] + '\t' + r[i][2] + '\n');

def list_dump_all(): #all lang from c:\data\wiki\lang.txt and call list_dump(lang) for each lang
    with open("c:\\data\\wiki\\lang.txt", 'r') as file:
        for line in file:
            lang = line.split('\t')[0]
            if not util_file_current("c:\\data\\wiki\\list_" + lang + ".txt"):
                list_dump(lang)

            # dlang = ""
            # try:
            #     dlang = open("c:\\data\\wiki\\list_" + lang + ".txt").read();
            # finally:
            #     if len(dlang) == 0:
            #         list_dump(lang)

def list_dump_merge(): #find all files list_xxx.txt in directory c:\data\wiki\ and save to c:\data\wiki\list.txt with xxx first on all lines
    with open("c:\\data\\wiki\\list.txt", 'w') as fileWrite:
        for fn in os.listdir("c:\\data\\wiki\\"):
            if fn.startswith("list_") and fn.endswith(".txt"):
                with open("c:\\data\\wiki\\" + fn, 'r') as fileRead:
                    for line in fileRead:
                        fileWrite.write(fn[5:-4] + '\t' + line)
    os.makedirs("c:\\data\\wiki\\details", exist_ok=True)
    shutil.move("c:\\data\\wiki\\list_*.*", "c:\\data\\wiki\\details\\")

def list_dumpshow():
    #show all text document c:\data\wiki\list_(lang).txt")
    print("todo list all dumps for a language")

#main
os.makedirs("c:\\data\\wiki\\details", exist_ok=True)
if len(sys.argv) < 3:
    if not util_file_current("c:\\data\\wiki\\src.txt"): list_src();
    if not util_file_current("c:\\data\\wiki\\lang.txt"): list_lang();
    if not util_file_current("c:\\data\\wiki\\list.txt"):
        list_dump_all();
        list_dump_merge();
    list_dumpshow();
elif sys.argv[2] == "?" or sys.argv[2] == "help" or sys.argv[2] == "/?":
    list_usage(sys.argv, 2)
elif sys.argv[2] == "src": list_src();
elif sys.argv[2] == "lang": list_lang();
elif sys.argv[2] == "dump":
    if len(sys.argv) > 3: list_dump(sys.argv[3]);
    else:
        if not util_file_current("c:\\data\\wiki\\list.txt"):
            list_dump_all();
            list_dump_merge();
elif sys.argv[2] == "dumpshow":
    print(sys.argv[1] + " dumpshow ...")
    list_dumpshow();
else:
    print("Unknown command: " + sys.argv[1])
    list_usage(sys.argv)