package main

import (
	"bufio"
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
	"strconv"
	"strings"
)

const cscKeysFile = "chart_keys00.txt"
const cscPropFile = "chart_prop00.txt"
const outJSONFile = "csc_sites.json"

type Site struct {
	ID   string  `json:"id"`
	Lat  float64 `json:"lat"`
	Loc  string  `json:"loc"`
	Lng  float64 `json:"lng"`
	Name string  `json:"name"`
}

func main() {
	// READ IN FILE 1
	f1, err := os.Open(cscKeysFile)

	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		if err = f1.Close(); err != nil {
			log.Fatal(err)
		}
	}()

	s1 := bufio.NewScanner(f1)

	//Initialize Map of site IDs to Data
	siteIDMap := make(map[string]map[string]string)

	// Read File 1 Buffer line by line, enter into map
	for s1.Scan() {
		line := s1.Text() // print the line of text read from file
		lineData := strings.Split(line, "|")

		//Skip "Hidden" sites
		if len(lineData) != 4 {
			continue
		}

		m := make(map[string]string)

		m["loc"] = lineData[1]
		m["lat"] = lineData[2]
		m["lng"] = lineData[3]
		siteIDMap[lineData[0]] = m

	}
	err = s1.Err()
	if err != nil {
		log.Fatal(err)
	}

	// READ IN FILE 2
	f2, err := os.Open(cscPropFile)

	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		if err = f2.Close(); err != nil {
			log.Fatal(err)
		}
	}()

	s2 := bufio.NewScanner(f2)

	for s2.Scan() {
		line := s2.Text() // print the line of text read from file
		lineData := strings.Split(line, "|")

		m := make(map[string]string)
		m = siteIDMap[lineData[0]]

		//Skip "Hidden" sites (omitted when creating siteIDMap)
		if m == nil {
			continue
		}

		m["name"] = lineData[2]
		siteIDMap[lineData[0]] = m
	}
	err = s2.Err()
	if err != nil {
		log.Fatal(err)
	}

	//Init map of Lat/Lng to site data
	latLngMap := make(map[string]map[string][]Site)

	// for every site in map
	for k, v := range siteIDMap {
		loc := v["loc"]
		lat := v["lat"]
		lng := v["lng"]
		name := v["name"]

		latFloor := strings.Split(lat, ".")[0]
		lngFloor := strings.Split(lng, ".")[0]

		latFlt, _ := strconv.ParseFloat(lat, 64)
		lngFlt, _ := strconv.ParseFloat(lng, 64)

		// initialize nested map for this lat if it was not already initialized
		// by a previous iteration
		_, ok := latLngMap[latFloor]
		if !ok {
			latLngMap[latFloor] = make(map[string][]Site)
			latLngMap[latFloor][lngFloor] = make([]Site, 1)
		}

		m := Site{ID: k, Lat: latFlt, Lng: lngFlt, Loc: loc, Name: name}

		latLngMap[latFloor][lngFloor] = append(latLngMap[latFloor][lngFloor], m)

	}

	jsonByteSlice, err := json.MarshalIndent(latLngMap, "", "  ")
	if err != nil {
		log.Fatal(err)
	}

	ioutil.WriteFile(outJSONFile, jsonByteSlice, os.ModePerm)
}
