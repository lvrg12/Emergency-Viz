from textblob import TextBlob
import preprocess as pp
import csv

def isRelevant():
    return 0

def classify( message ):

    situation = ["shake","shaking","vibrate","vibrating"]
    water = ["water","flood","flooding","sewer"]
    electric = ["power","electric","electricity"]
    health = ["health","hurt","pain","help","SOS","bread","breading","blood","arm","leg","death","unconsious"]
    food = ["food","starve","starving"," eat ","eating"]

    for s in water:
        if s in message: return "water"

    for s in electric:
        if s in message: return "electric"

    for s in health:
        if s in message: return "health"

    for s in food:
        if s in message: return "food"

    for s in situation:
        if s in message: return "situation"


    return "none"

with open('../data/YInt.csv', newline='', encoding="utf8") as file1:
    with open('../data/test.csv', 'w', newline='', encoding="utf8") as file2:
        reader = csv.reader(file1)
        writer = csv.writer(file2)
        count = 0

        for row in reader:

            count+=1
            # if count > 100: break
            if count == 1: continue
            
            post = " ".join(pp.preprocess(row[3]))
            blob = TextBlob(post).correct()
            sentiment = blob.sentiment.polarity
            writer.writerow([row[0],row[1],row[2],row[3],isRelevant(),classify(row[3]),sentiment])

