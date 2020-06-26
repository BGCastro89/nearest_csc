# Nearest Clear Sky Chart
Simple webapp that finds the nearest Clear Sky Chart for given lat/lon coordinates. Clear Sky Charts are astronomy-focused weather forcasts provided by A. Danko's Clear Dark Sky website: www.cleardarksky.com

The web app is availible at: https://briangcastro.com/nearest-csc/

The API endpoint is public and can be reached at https://us-central1-stargazr-ncc-2893.cloudfunctions.net/nearest_csc

### API Sample Input

Example input to API endpoint using Lat/Lon for San Francisco

```/nearest_csc?lat=37.78&lon=-122.45```

https://us-central1-stargazr-ncc-2893.cloudfunctions.net/nearest_csc?lat=37.78&lon=-122.45

### Sample Output

```{"lat": 37.77, "loc": "California", "lon": -122.465874, "id": "MrrsnPntCA", "name": "Morrison Planetarium", "dist_km": 1.8, "full_img": "http://www.cleardarksky.com/c/MrrsnPntCAcsk.gif", "mini_img": "http://www.cleardarksky.com/c/MrrsnPntCAcs0.gif"}```

The link takes you to the astronomy weather report image for given site:
http://www.cleardarksky.com/c/MrrsnPntCAcsk.gif

A compact version of the image is also availible:
http://www.cleardarksky.com/c/MrrsnPntCAcs0.gif

Following a similar format are the main page for the site:
http://www.cleardarksky.com/c/MrrsnPntCAkey.html?1

The last link can be constructed for any site by replacing `____csk.gif` or `____cs0.gif` in the url with `____key.html`.
