# Emergency-Viz
Emergency heatmap visualization based on social media sentiment analysis data

## [View Demo](https://lvrg12.github.io/Emergency-Viz)
## [Social Media Demo](https://ak65234.github.io/yint)

### [2019 VAST Challenge 3](https://vast-challenge.github.io/2019/MC3.html)
### [Project Plan Slides](https://docs.google.com/presentation/d/1NSMiZwhJRdERxvI1hofadxJo497KDrJnYWnUcZlnioE/edit?usp=sharing)

## VAST Mini-Challenge 3

Source: https://vast-challenge.github.io/2019/MC3.html

Seismic and survey data are useful for capturing the objective damage that the earthquake has caused St. Himark. However, this data has limitations. First, official surveys are time consuming and do not stay current in a rapidly changing situation. Second, they don’t establish how citizens are reacting to the current crisis. Third, they are often insufficiently granular, providing little insight into differences between neighborhoods. In other words, the seismic and survey data do not provide an up-to-date view of the structural and humanitarian impact caused by the earthquake on a neighborhood-by-neighborhood basis. The City has concluded that this knowledge is necessary to determine where to allocate emergency resources.

City Officials have identified a subset of Y*INT, a community-based social media platform, as a potential source for revealing the current state of St. Himark’s neighborhoods and people. Knowing that you are skilled in visual analytics, the City has asked you to analyze Y*INT messages in order to determine the appropriate actions it must take in order to assist the community in this disaster.

### Tasks

1. Characterize conditions across the city and recommend how resources should be allocated.
2. Identify the conditions before and after the inflection point and the affected locations.
3. What is the community experiencing?
4. Explain how you are using static or dynamic stream of data for analysis.

## Solution

Our solution consists on implementing sentiment analysis on the earthquake-related messages to indentify the critical level of the user and map them to specific needs (health, water, electricity). 

### Overview

The process to accomplish this is the following:

1. Preprocessing each message
    1. Tokenization
    2. Lemmatization
    3. Stemming
2. Sentiment analysis on each message
    1. Calculate the sentiment of each message using a pretrained sentiment analysis algorithm.
3. Categorization
    1. Categorization of each message using a set of keywords per resource category.
4. Time-series graph
5. Choropleth map
    1. A neighborhood level map is used to show their distinct values.
    2. A color gradient (red-green) is used to show average sentiment score.
    3. A color gradient (white-blue) is used to show the amount of messages posted
6. Detail message view
    1. A snapshot of the messages is used to show detail related messages

#### Implementation Overview

### Preprocessing
Given that most messages are 


#### Implementation

### Sentiment Analysis
#### Implementation

### Categorization
#### Implementation

### Time-series graph
#### Implementation

### Choropleth Map
#### Implementation

### Detail message view
#### Implementation


## Task Specific Solutions

## References

1. D3
2. NLTK
3. TextBlob
4. Time-series library
5. Choropleth map
