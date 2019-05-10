from textblob import TextBlob
import preprocess as pp
import csv

def isRelevant():
    return 0

def classify( message ):

    situation = ["shake","shaking","vibrate","vibrating","earthquake","quake","trembling"]
    water = ["water","flood","flooding","sewer","drink","thirst","dehydration"]
    electric = ["power","electricity","light","energy","current","charge"]
    health = ["health","hurt","pain","help","SOS","bread","breading","blood","arm","leg","death","unconsious", "hospital","fire","firefighter","care","medicine","nurse","first aid","clinic"]
    food = ["food","starve","starving"," eat ","eating","hungry","milk","bread","formula","foodstuff","doctor"]
    shelter = ["shelter","house","living place","sleep","rest","accommodation"]

    for s in water:
        if s in message: return "water"

    for s in electric:
        if s in message: return "electric"

    for s in health:
        if s in message: return "health"

    for s in food:
        if s in message: return "food"

    for s in shelter:
        if s in message: return "shelter"

    for s in situation:
        if s in message: return "situation"


    return "none"

with open('../data/YInt.csv', newline='', encoding="utf8") as file1:
    with open('../data/test3.csv', 'w', newline='', encoding="utf8") as file2:
        reader = csv.reader(file1)
        writer = csv.writer(file2)
        writer.writerow(["time","location","account","message","relevant","category","sentiment"])
        count = 0

        for row in reader:

            count+=1
            # if count > 100: break
            if count == 1: continue
            # if "re: " in row[3]: continue
            
            post = " ".join(pp.preprocess(row[3]))
            blob = TextBlob(post).correct()
            sentiment = blob.sentiment.polarity
            writer.writerow([row[0],row[1],row[2],row[3],isRelevant(),classify(row[3]),sentiment])

