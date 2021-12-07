# -*- coding: utf-8 -*-
"""
Created on Mon May 20 15:29:25 2019

@author: hong
"""

import json, sys
import http.client, urllib.request, urllib.parse, urllib.error, base64
def detect(list_face, img_url):
    headers = {
        # Request headers
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': 'dceb403999d5493db1b1ff393ae63739',
    }
    
    params = urllib.parse.urlencode({
        # Request parameters
        'returnFaceId': 'true',
        'returnFaceLandmarks': 'false',
        #'returnFaceAttributes': '{string}',
        'recognitionModel': 'recognition_02',
        'returnRecognitionModel': 'false',
    })
    
    try:
        conn = http.client.HTTPSConnection('westus.api.cognitive.microsoft.com')
        conn.request("POST", "/face/v1.0/detect?%s" % params, "{'url': '"+img_url+"'}", headers)
        response = conn.getresponse()
        data = response.read().decode('utf-8')
        data = json.loads(data)
        list_face.append(data[0]['faceId'])
        conn.close()
    except Exception as e:
        print(e.args)


def find_similar(faceId, celebrity, argv):
    headers = {
        # Request headers
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': 'dceb403999d5493db1b1ff393ae63739',
    }
    
    params = urllib.parse.urlencode({
    })
    
    
    try:
        conn = http.client.HTTPSConnection('westus.api.cognitive.microsoft.com')
        conn.request("POST", "/face/v1.0/findsimilars?%s" % params, "{'faceId': '"+faceId+"', 'largeFaceListId': '"+argv+"', 'maxNumOfCandidatesReturned': 5, 'mode': 'matchFace'}", headers)
        response = conn.getresponse()
        data = response.read().decode('utf-8')
        data = json.loads(data)
        for i in range(5):
            celebrity.append([data[i]['persistedFaceId'],data[i]['confidence']])
        conn.close()
    except Exception as e:
        print(e)



def search_celeb_name(persistedFaceId, similar_celeb, argv):
    inputFile = open('public/json/'+argv+'.json')
    a = json.load(inputFile)
    inputFile.close()
    for i in range(len(a)):
        if(a[i]['persistedFaceId'] == persistedFaceId):
            similar_celeb.append(a[i]['userData'])


# def search_celeb_name(persistedFaceId):
#     inputFile = open('C:/Users/85311/Desktop/'+argv+'.json')
#     a = json.load(inputFile)
#     inputFile.close()
# ​
#     for i in range(len(a)):
#         if(a[i]['persistedFaceId'] == persistedFaceId):
#             print(a[i]['userData'])
#             return a[i]['userData']


list_face=[]

img_url = 'http://13.125.252.203:3000/images/'+sys.argv[1]

detect(list_face, img_url)
faceId = list_face[0]

celebrity = []
find_similar(faceId, celebrity, sys.argv[2])

similar_celeb=[]
for i in range(len(celebrity)):
    persistedFaceId = celebrity[i][0]
    search_celeb_name(persistedFaceId, similar_celeb, sys.argv[2])

similar_celeb = list(set(similar_celeb));

for j in range(len(similar_celeb)):
    print(similar_celeb[j])