import chromadb
from fetch_text import fetch_text

from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")


client = chromadb.PersistentClient(path = "./chroma_data")
collection = client.get_or_create_collection("categories")

know = [
    # gambling
    {"id": "g1", "text": "online casino gambling betting real money slots poker", "category": "gambling"},
    {"id": "g2", "text": "sports betting odds place your bet win big", "category": "gambling"},
    {"id": "g3", "text": "lottery jackpot tickets scratch cards win prizes", "category": "gambling"},
    {"id": "g4", "text": "crypto casino bitcoin gambling wager digital currency bets", "category": "gambling"},
    {"id": "g5", "text": "free spins bonus deposit match casino promotion", "category": "gambling"},

    # violence
    {"id": "v1", "text": "violent shooting game guns fighting blood combat weapons", "category": "violence"},
    {"id": "v2", "text": "war military combat footage battle soldiers weapons", "category": "violence"},
    {"id": "v3", "text": "street fight brawl assault crime violence news report", "category": "violence"},
    {"id": "v4", "text": "graphic violent video game first person shooter kill", "category": "violence"},
    {"id": "v5", "text": "weapons knives guns ammunition for sale store", "category": "violence"},

    # adult
    {"id": "a1", "text": "explicit sex content nudity sexual material for adults only", "category": "adult"},
    {"id": "a2", "text": "adult dating app mature audiences hookup", "category": "adult"},
    {"id": "a3", "text": "18 plus content restricted mature viewers only warning", "category": "adult"},
    {"id": "a4", "text": "adult entertainment nightclub strip club mature venue", "category": "adult"},
    {"id": "a5", "text": "explicit material sexual content age verification required", "category": "adult"},

    # sexual / pornography (kept as a separate, more explicit-leaning bucket from "adult")
    {"id": "p1", "text": "pornographic video streaming explicit sexual content adults only", "category": "pornography"},
    {"id": "p2", "text": "xxx rated explicit videos adult film content warning", "category": "pornography"},
    {"id": "p3", "text": "sexual content webcam live adult performer site", "category": "pornography"},

    # drugs
    {"id": "d1", "text": "buy marijuana weed cannabis online delivery", "category": "drugs"},
    {"id": "d2", "text": "recreational drugs cocaine mdma pills for sale", "category": "drugs"},
    {"id": "d3", "text": "illegal drug marketplace narcotics dark web", "category": "drugs"},
    {"id": "d4", "text": "drug paraphernalia bongs vape pens smoking accessories", "category": "drugs"},

    # hate_speech
    {"id": "h1", "text": "racist slurs hateful content targeting ethnic groups", "category": "hate_speech"},
    {"id": "h2", "text": "extremist ideology hate group recruitment propaganda", "category": "hate_speech"},
    {"id": "h3", "text": "discriminatory content against religion race gender", "category": "hate_speech"},

    # terrorism
    {"id": "t1", "text": "terrorist organization propaganda extremist recruitment videos", "category": "terrorism"},
    {"id": "t2", "text": "bomb making instructions attack planning extremist content", "category": "terrorism"},
    {"id": "t3", "text": "radicalization content violent extremism manifesto", "category": "terrorism"},

    # malware
    {"id": "m1", "text": "download cracked software keygen virus malware warning", "category": "malware"},
    {"id": "m2", "text": "free hacking tools trojan ransomware download", "category": "malware"},
    {"id": "m3", "text": "suspicious executable file untrusted software download", "category": "malware"},

    # phishing
    {"id": "ph1", "text": "verify your account login urgent security alert click here", "category": "phishing"},
    {"id": "ph2", "text": "you have won a prize claim now enter your bank details", "category": "phishing"},
    {"id": "ph3", "text": "fake login page password reset suspicious link", "category": "phishing"},

    # safe
    {"id": "s1", "text": "educational science history math learning tutorials for students", "category": "safe"},
    {"id": "s2", "text": "cooking recipes food preparation kitchen tips", "category": "safe"},
    {"id": "s3", "text": "news weather forecast local community updates", "category": "safe"},
    {"id": "s4", "text": "online shopping store products clothing electronics", "category": "safe"},
    {"id": "s5", "text": "social media platform share photos connect with friends", "category": "safe"},
    {"id": "s6", "text": "sports team scores highlights football basketball match", "category": "safe"},
    {"id": "s7", "text": "technology news gadgets reviews smartphones computers", "category": "safe"},
    {"id": "s8", "text": "wikipedia encyclopedia article information reference facts about animals nature history", "category": "safe"},
    {"id": "s9", "text": "children's cartoons kids shows entertainment family friendly", "category": "safe"},
    {"id": "s10", "text": "music streaming songs albums artists playlists", "category": "safe"},
]


if collection.count() == 0:

  for now in know:
    embed = model.encode(now["text"]).tolist()
    collection.add(
     ids = [now["id"]],
     embeddings=[embed],
     documents=[now["text"]],
     metadatas=[{"category" : now["category"]}]  
  )

else:
  print("collection aleardy there" ,collection.count(),collection)


BAD_CATEGORIES = {"gambling", "violence", "adult","sexual","pornography","drugs","hate_speech","terrorism","malware","phishing"}
DISTANCE_THRESHOLD = 1.5




def classify_domain(domain: str) -> dict:
  text = fetch_text(domain)
  embed = model.encode(text).tolist()

  results = collection.query(query_embeddings= [embed], n_results= 1)
  
  category = results["metadatas"][0][0]["category"] # pyright: ignore[reportOptionalSubscript]
  distance = results["distances"][0][0] # pyright: ignore[reportOptionalSubscript]

  
  if category in BAD_CATEGORIES and distance < DISTANCE_THRESHOLD:
    descision = "BLOCK"
    reason = f"ai_classified{category}"

  else: 
    descision = "ALLOW"
    reason = "ai_ok"

  return {
    "domain": domain,
        "category": category,
        "distance": distance,
        "descision": descision,
        "reason": reason,
  }


  







