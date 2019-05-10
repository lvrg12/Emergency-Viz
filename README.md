# Emergency-Viz
Emergency heatmap visualization based on social media sentiment analysis data

Demo: https://lvrg12.github.io/Emergency-Viz
Social Media Demo: https://ak65234.github.io/yint
Project Plan: https://docs.google.com/presentation/d/1NSMiZwhJRdERxvI1hofadxJo497KDrJnYWnUcZlnioE/edit?usp=sharing

## VAST Mini-Challenge 3

Source: https://vast-challenge.github.io/2019/MC3.html

Seismic and survey data are useful for capturing the objective damage that the earthquake has caused St. Himark. However, this data has limitations. First, official surveys are time consuming and do not stay current in a rapidly changing situation. Second, they don’t establish how citizens are reacting to the current crisis. Third, they are often insufficiently granular, providing little insight into differences between neighborhoods. In other words, the seismic and survey data do not provide an up-to-date view of the structural and humanitarian impact caused by the earthquake on a neighborhood-by-neighborhood basis. The City has concluded that this knowledge is necessary to determine where to allocate emergency resources.

City Officials have identified a subset of Y*INT, a community-based social media platform, as a potential source for revealing the current state of St. Himark’s neighborhoods and people. Knowing that you are skilled in visual analytics, the City has asked you to analyze Y*INT messages in order to determine the appropriate actions it must take in order to assist the community in this disaster.

### Tasks

1. Using visual analytics, characterize conditions across the city and recommend how resources should be allocated at 5 hours and 30 hours after the earthquake. Include evidence from the data to support these recommendations. Consider how to allocate resources such as road crews, sewer repair crews, power, and rescue teams. Limit your response to 1000 words and 12 images.

2. Identify at least 3 times when conditions change in a way that warrants a re-allocation of city resources. What were the conditions before and after the inflection point? What locations were affected? Which resources are involved? Limit your response to 1000 words and 10 images.

3. Take the pulse of the community. How has the earthquake affect life in St. Himark? What is the community experiencing outside the realm of the first two questions? Show decision makers summary information and relevant/characteristic examples. Limit your response to 800 words and 8 images

4. The data for this challenge can be analyzed either as a static collection or as a dynamic stream of data, as it would occur in a real emergency. Describe how you analyzed the data - as a static collection or a stream. How do you think this choice affected your analysis? Limit your response to 200 words and 3 images.

## Solution

Our solution consists on implementing sentiment analysis on the earthquake-related messages to indentify the emergency level of the user and map them to specific needs (health, water, electricity). 

### Overview

The process to accomplish this is the following:

1. Preprocessing each message
    1. Tokenization
    2. Lemmatization
    3. Stemming
    4. Word correction
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

### Preprocessing
In order to accuretely analyze the messages posted by users they must have to be gramatically consistent. Hence, each word in each message is corrected and simplified. To do this, a series of word preprocessing techniques are implemented.

- Tokenization
    - Each message is separated by punctuations and empty spaces.
    - This allows each word to be processed individually in the following steps.
- Lemmatization
    - Each word is transformed to its simplest (base) form.
    - By reverting past tenses, plurals, adjectives, and other complex forms, each word is more likely to be accurately analyzed.
- Stemming
    - Each word is again transformed to its base form often chopping off a part of the word.
    - Lemmatization is not always able to transform the word to a base form hence this robust technique is used.
- Word correction
    - The sentence is put back together and its grammar is corrected using a grammar library.
    - This is necessary since many words are potentially incomplete due to stemming.

An example of this word preprocessing is shown below.

![alt text](media/wordpre.png)

At the end of these processes, each simplified message is ready to be analyzed.

All the preprocessing techniques were implemented in Python using the NLTK library [2]. These changes to the data were also done prior to loading the data to the web in order to avoid heavy browser computation and to take advantage of the Python environment and libraries.

### Sentiment Analysis
There have been multiple studies that have shown that using sentiment analysis of social media posts, along with a robust classifier, is able to predict the emergency level of individuals during a natual disaster [3,4,5]. With that in mind, we chose to implement a similar approach in determining the emergency level of the users in our ficticious town. Due to time and expertise constraints a classifier was not implemented as suggested by Neppalli et al [5]. Nevertheless, a sentiment analysis calculation was performed on each message and its score was appended to the original data csv file. The score can be anywhere from -1 to 1; where -1 is negative, 0 is neutral, and 1 is positive. An example of such analysis is pictured in the following figure.

![alt text](media/sent_example.png) [5]

Sentiment analysis was also performed prior to loading the data to the web. It was implemented using Python by the TextBlob library [6].

### Categorization
Since there are many messages that are not related to the natural disaster a keyword filtering was added to not only filter out the irrelevant messages but also categorize the type of message posted. This naive yet effective method was previously used by Rexiline Raginia et al. [3] and Wu [4] to categorize the type of messages. Therefore, we included the set of keyword they used plus the ones that we thought appropriate.

The following are the categories and the keywords used:

| Category | Keywords |
| --- | --- |
| Water | water, flood, flooding, sewer, drink, thirst, dehydration |
| Electricity | power, electric, light, energy, current, charge |
| Food | food, starve, eat, eating, hungry, milk, bread, formula, foodstuff |
| Electricity | health, hurt, pain, help, SOS, breading, blood, arm, leg, death unconsious, hospital, fire, firegfighter, care, medicine, nurse, first aid, clinic, doctor |
| Earthquake | shake, shaking, vibrate, earthquake, quake, trembling |

It must be noted that this method still has a margin of error.

Once again, this phase was implemented in Python and the results were appended to the csv file.

### Time-series graphs

There are two time-series graphs that show the overall trend of the sentiment analysis and the amount of messages posted.

##### OverAll Sentiment Trend
![alt text](media/filler.png)

The multiline time series graph shows the sentiment values of the top four categories of messages. 
##### Posted Messages
![alt text](media/msgPosted.png)

The stacked bar graph shows number of messages posted per hour stacked by top four catagories.
### Choropleth Map
To be able to visualize the geographical distribution of the users a choropleth map was used. This map was divided in 19 neighborhoods. Each neighborhood is color coded by a gradient which encodes either the sentiment score average or the amount of earthquake-related messages within that area. There is one big map which shows the overall results among all the resource categories and 4 smaller maps that show the values for that specific resource category. Those smaller visualize the water-related, food-related, health-related, and electricity-related messages. All the maps are also affected by the time slider located at the top of the page. That is a double slider and it is used to set the time range of the data the user wants to view. A screenshot of the demo is shown below.

![alt text](media/overview.png)

The color gradient goes from red to white to green where red is -1 sentiment score, white is 0 sentiment score, and green is 1 sentiment score. Since some of the neighborhoods can only have one message posted the average can be largely affected by that one message. Therefore, a count option is available on the top right corner. The color gradient would change to white to blue where white is 0 messages and blue is 150 or more messages. So, the user can change the view to count to see if that average is coming from few or many users. The example is shown below.

![alt text](media/sent_vs_count.png)
Notice that average sentiment analysis alone does not equal emergency lever.

The user is also able to hover on each neighborhood to see the name of it, the current average and count given the map and the time intervals. The tooltip is shown below.

![alt text](media/tooltip.png)

### Detail message view


## Task Specific Solutions


1. Allocation of resources based on time and conditions.

Utilizing the time slider, the choropleth map can be set to show the average sentiment analysis of each neighborhood during a specific interval. The picture below shows the time range between the time the incident first started (that time is set manually based on the official city report) and 5 and half hours after that. The negative sentiment score average shows the areas where the users show the most negative messages and presumably the ones that need urgent assistance.

![alt text](media/t1.png)

In the picture above we can see that by the sentiment score the center region have negative sentiment about food, Old Town has negative sentiment about water and electricity, and Broadview has negative sentiment about electricity. By looking at the overall message count map, it can be seen that Old Town, Cheddarford at the center, and Weston and Southton have a higher number of posted messages. Therefore we can presume that those areas are in the most need after 5:30 hours after the incident. Those places would need food, electricity, and water first. Then the other neighborhood can be assisted.


2. Relocation of resources and change in conditions.

![alt text](media/change.png)


3. Overall sentiment in St. Himark and extra information shown.

4. Static collection analysis.

The data for this project was analized staticlly before being used in the web application. This was done mainly to avoid heavy computation in the client side. To analyze the data, we used Python and many external libraries. This analysis was done in one code execution and it included word preprocessing, sentiment analysis, and keyword filtering. Since there were about 40,000 message entries, the scripts could not be ran on a local machine. Hence, we used the Quanah cluster in the Texas Tech High Performance Computing Center. Even then the analysis processed took several hours to finish. The screen would have probably frozen ff we had performed this process naively on the browser. Therefore, one of the advantages of pre analyzing the data is saving computing time and power from the client sie, and just focusing on visualization. In the other hand, it does not represent an accurate approach for the real world. Similarly, the visualization is only taking a specific amount of entries and would never show the data of the current time after the data was loaded. This would not only provide a limited data to the user but it would also force the users to wait for the data to increase in size and show any meaninful information.



## Contributions

- Alexander
    -Added time series
    -Integrated time series with slider
    
- Andrew
- Lino
    - Researched related work on the topic
    - Implemented word preprocessing
    - Implemented sentiment analysis
    - Implemented keyword filtering
    - Developed choropleth maps
    - Developed time interval slider
    - Contributed to the report

## References

1. D3, https://d3js.org
2. NLTK, https://www.nltk.org/
3. “Big data analytics for disaster response and recovery through sentiment Analysis” by J. Rexiline Raginia, P.M. Rubesh Anand, Vidhyacharan Bhaskar
4. “Disaster early warning and damage assessment analysis using social media data and geo-location information” by Desheng Wu, Yiwen Cui
5. “Sentiment analysis during Hurricane Sandy in emergency response” by Venkata K. Neppalli, Cornelia Caragea, Anna Squicciarini, Andrea Tapia, Sam Stehle
6. TextBlob, https://textblob.readthedocs.io/en/dev/index.html
7. Time-series library
8. Doug Dowson, http://bl.ocks.org/dougdowson/9832019
9. jQuery, https://jquery.com/
10. Mike Bostock, https://bl.ocks.org/mbostock/1134768
