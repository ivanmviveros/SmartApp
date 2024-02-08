from django.shortcuts import render
from django.http import JsonResponse
import requests
from decouple import config

def index(request):
   return render(request, 'voice/index.html', {'api_key': config('GOOGLE_MAPS_KEY')}) 


def nearbyPlaces(request):
    keyword = request.GET.get('keyword')
    location = request.GET.get('location')
    radius = request.GET.get('radius')

    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?"
    payload = {}
    headers = {}
    response = requests.request("GET", url, params={
        'keyword': keyword,
        'location': location,
        'radius': radius,
        'key': config('GOOGLE_MAPS_KEY'),
    }, headers=headers, data=payload)
    # json_response = json.loads()
    return JsonResponse({'places': response.json()})