import unidecode
import string
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.stem.porter import PorterStemmer

# preprocess of document
def preprocess( doc ):
    preprocessed = tokenize(doc)
    preprocessed = normalize(preprocessed)
    preprocessed = lemmatize(preprocessed)
    preprocessed = stem(preprocessed)
    # preprocessed = normalize(preprocessed)

    return preprocessed

# tokenization of document
def tokenize( doc ):

    # tokenizing
    tokenized = word_tokenize(doc)

    return tokenized

# normalization and filtration of document
def normalize( tokenized ):

    #normalizing
    # normalized = [ unidecode.unidecode(w.decode('utf8')) for w in tokenized ]

    # remove punctuations
    normalized = [ word for word in tokenized if word.isalpha() ]

    # removing stopwords
    # stop_words = set(stopwords.words('english'))
    # filtered = [ w for w in normalized if w not in stop_words ]

    return normalized

# lemmatization of document
def lemmatize( tokenized ):
    lemmatizer = WordNetLemmatizer()
    lemmatized = [ lemmatizer.lemmatize(w) for w in tokenized ]
    return lemmatized

# stemming of document
def stem( tokenized ):
    stemmer = PorterStemmer()
    stemmed = [ str(stemmer.stem(w)) for w in tokenized if is_ascii(str(stemmer.stem(w))) ]
    return stemmed

def is_ascii(s):
    return all(ord(c) < 128 for c in s)