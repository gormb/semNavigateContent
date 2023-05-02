// Shortest code to Read https://dumps.wikimedia.org/mirrors.html and get all urls from the links, save to text file raw_mirrors.txt

fn main()
{
    // Read all content from  https://dumps.wikimedia.org/mirrors.html into string
    let mut content = String::new();
    let mut resp = reqwest::get("https://dumps.wikimedia.org/mirrors.html").unwrap();
    resp.read_to_string(&mut content).unwrap();
    
    // get all urls from content that contains "wikimedia"
    let re = Regex::new(r"(?i)https?://[a-z0-9\-\.]+\.wikimedia\.org").unwrap(); 
    
    // print out all urls
    for cap in re.captures_iter(&content) {
        println!("{}", &cap[0]);
    }

    // save all urls to text file
    let mut fileMirrors = File::create("raw_mirrors.txt").unwrap();
    for cap in re.captures_iter(&content) {
        fileMirrors.write_all(&cap[0].as_bytes()).unwrap();
        fileMirrors.write_all(b"   ").unwrap();
    }
    // For all urls in re get the content of re/dumps/ if available
    // and append to text file "raw_mirrorfdumps.txt"
    let mut fileMirrorDumps = File::create("raw_mirrordumps.txt").unwrap();
    for cap in re.captures_iter(&content) {
        let mut resp = reqwest::get(&cap[0].to_string() + "/dumps/").unwrap();
        let mut content = String::new();
        resp.read_to_string(&mut content).unwrap();
        fileMirrorDumps.write_all(&content.as_bytes()).unwrap();
    }


}