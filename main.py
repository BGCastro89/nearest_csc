import json
import math
import os

PATH = "."
FILENAME = "csc_sites.json"

def lat_lon_distance_in_km(lat1, lon1, lat2, lon2):
    """Calculate distance between two latitude-longitide points on sphere in kilometres.

    args: Float lat/lon for two points on Earth
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

def nearest_csc(request):
    """Nearest Clear Sky Chart from A. Danko's site: https://www.cleardarksky.com/

    All 5000+ sities are binned by 1x1 degree lat/lon. Only check the
    distance to sites within current bin +/- 1 degree, searching 9 bins total.

    args: request object w/ args for lat/lon
    returns: String, either with json representation of nearest site information or an error message
    """

    lat = request.args.get('lat', type = float)
    lon = request.args.get('lon', type = float)

    file_path = os.path.join(PATH, FILENAME)

    # Get list of all csc site locations
    with open(file_path, 'r') as f:
        data = json.load(f)
        nearby_csc = []

        # Get list of all sites within same or adjacent 1 degree lat/lon bin
        try:
            for x in range(-1,2):
                for y in range(-1,2):
                    lat_str = str(int(lat)+x)
                    lon_str = str(int(lon)+y)
                    if lat_str in data:
                        if lon_str in data[lat_str]:
                            sites_in_bin = data[lat_str][lon_str]
                            for site in sites_in_bin:
                                nearby_csc.append(site)
        except:
            # API returns error
            return "ERROR parsing coordinates or reading from list of CSC sites"

        # Initialize vars
        closest_dist = 3 # units in degrees, can't be more than 2.828, or (2 * sqrt(2))
        closest_site = {}
        dist_km = 100

        # Find the closest site in Clear Dark Sky database within bins
        for site in nearby_csc:
            site_lat = site["lat"]
            site_lon = site["lon"]

            # Quick Approximate distance in units of degrees, only calculate km distance if closer than previous closest
            dist = math.sqrt( (site_lat-lat)**2 + (site_lon-lon)**2 )

            if dist < closest_dist:
                closest_dist = dist
                closest_site = site
                # Calculate distance modeling Earth as perfect sphere
                dist_km = lat_lon_distance_in_km(lat, lon, site_lat, site_lon)

        # Grab site url and return site data if within 100 km
        if dist_km < 100:
            closest_site['dist_km'] = dist_km
            closest_site['full_img'] = "http://www.cleardarksky.com/c/"+closest_site['id']+"csk.gif"
            closest_site['mini_img'] = "http://www.cleardarksky.com/c/"+closest_site['id']+"cs0.gif"
            return json.dumps(closest_site)

        return "No sites found within 100 km"
