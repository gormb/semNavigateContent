import sys

#usage
def usage(argvalues:list, argstart:int = 0):
    print("Usage: " + sys.argv[argstart-1] + " <command>")
    print("Commands:")
    print("  list - list related commands")
    print("  act - file action related action")
    print("  all - update all lists and act on all files")
    print("  help - this help")

#main
if len(sys.argv) < 2 or sys.argv[1] == "?" or sys.argv[1] == "help" or sys.argv[1] == "/?":
    usage(sys.argv, 1)
elif sys.argv[1] == "list": exec(open("wiki_list.py").read())
elif sys.argv[1] == "act": exec(open("wiki_act.py").read())
elif sys.argv[1] == "all":
    exec(open("wiki_list.py").read())
    exec(open("wiki_act.py").read())
else:
    print("Unknown command: " + sys.argv[1])
    usage(sys.argv, 1)

