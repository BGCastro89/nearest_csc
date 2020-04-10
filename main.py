# from flask import Flask, request
# from flask import json as fjson
import json
import math
import os

# app = Flask(__name__)
# debug = True

def latlonDistanceInKm(lat1, lon1, lat2, lon2):
    """Calculate distance between two lat/long points on globe in kilometres.

    args: lat/lon for two points on Earth
    returns: Float representing distance in kilometres
    """
    R = 6371 # Earth Radius in kilometres (assume perfect sphere)

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2-lat1)
    d_lambda = math.radians(lon2-lon1)

    a = math.sin(d_phi/2) * math.sin(d_phi/2) + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda/2) * math.sin(d_lambda/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    d = R * c

    return round(d,1) # Assume Accurate within ~0.1km due to Idealized Sphere Earth

# @app.route("/nearest-csc")
def getCDSChart(request):
    """Nearest Clear Dark Sky Chart from A. Danko's site
    All 5000+ sities are binned by lat/lon of 1 degree. Only bother to find the
    distance to sites within current +/- 1 degree, searchig 9 bins total.

    args: String of lat/lon for stargazing site
    returns: Tuple of distance to closest CDSC site, and dict of site info. If
        no sites within 100km, return None
    """

    lat = 37.773972 # request.args.get('lat', type = float)
    lon = -122.431297 # request.args.get('lon', type = float)

    path = "."
    filename = "csc_sites.json"
    file_path = os.path.join(path, filename)

    # get list of all csc site locations
    with open(file_path, 'r') as f:
        data = json.load(f)
        nearby_cdsc = []
        # get list of all sites within same or adjacent 1 degree lat/lon bin
        try:
            for x in range(-1,2):
                for y in range(-1,2):
                    lat_str = str(int(lat)+x)
                    lon_str = str(int(lon)+y)
                    if lat_str in data:
                        if lon_str in data[lat_str]:
                            sites_in_bin = data[lat_str][lon_str]
                            for site in sites_in_bin:
                                nearby_cdsc.append(site)
        except:
            # API returns error
            return "Error reading from list of CSC sites"
            # return app.response_class(
            #     response=fjson.dumps({"msg":"Error reading from list of CSC sites"}),
            #     status=500,
            #     mimetype='application/json'
            # )

        # Initialize vars
        closest_dist = 3 #in degrees, cant be more than 2.828, or (2 * sqrt(2))
        closest_site = {}
        dist_km = 100

        # Find the closest site in CDSC database within bins
        for site in nearby_cdsc:
            site_lat = site["lat"]
            site_lon = site["lon"]
            dist = math.sqrt( (site_lat-lat)**2 + (site_lon-lon)**2 )
            if dist < closest_dist:
                closest_dist = dist
                closest_site = site
                # Calculate distance modeling earth as perfect sphere
                dist_km = latlonDistanceInKm(lat, lon, site_lat, site_lon)

        # grab site url and return site data if within 100km
        if dist_km < 100:
            closest_site['dist_km'] = dist_km
            closest_site['msg'] = "SUCCESS"
            closest_site['full_img'] = "http://www.cleardarksky.com/c/"+closest_site['id']+"csk.gif"
            closest_site['mini_img'] = "http://www.cleardarksky.com/c/"+closest_site['id']+"cs0.gif"

            return closest_site
            # return app.response_class(
            #     response=fjson.dumps(closest_site),
            #     status=200,
            #     mimetype='application/json'
            # )

        return "No sites within 100km"
        # API only returns msg if no site in range
        # return app.response_class(
        #     response=fjson.dumps({"msg":"No sites within 100km"}),
        #     status=200,
        #     mimetype='application/json'
        # )

if __name__ == "__main__":
    print getCDSChart("")