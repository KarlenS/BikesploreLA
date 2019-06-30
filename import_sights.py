'''
This module will collect all of the necessary
data for LA attractions/tourist sites.
'''

import os.path
from urllib import request
from bs4 import BeautifulSoup

wikibase = "https://en.wikipedia.org"
locs_url = wikibase + "/wiki/List_of_tourist_attractions_in_Los_Angeles"


res = request.urlopen(locs_url).read()
soup = BeautifulSoup(res,'html.parser')

loc_lists = soup.find_all('ul')[1:26]

masterlist = []

for loc in loc_lists:
    masterlist += [li.a['href'] for li in loc.find_all('li')]


failcount = 0
for page in masterlist:

    tmpurl = wikibase + page
    tmpres = request.urlopen(tmpurl).read()
    tmpsoup = BeautifulSoup(tmpres,'html.parser')
    #print(page)
    if tmpsoup:
        try:
            lat = tmpsoup.find(class_=['latitude']).text
            lon = tmpsoup.find(class_=['longitude']).text
        except AttributeError:
            print('failed at coords... skipping')
            failcount += 1
            continue

        cardobj = tmpsoup.find(class_=['infobox'])
        try:
            imobj = cardobj.find('a',class_='image')
            imlink = imobj.img['src']
            fullimglink = os.path.dirname(imlink)
        except AttributeError:
            print('CARDBOX!!!!')
            imlink = None
            fullimglink = None

        #print(lat,lon,imlinkfullimglink)
    else:
        print('tmpsoup be empty')
        failcount +=1
