package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strings"
)

const cscKeysFile = "chart_keys00.txt"
const cscPropFile = "chart_prop00.txt"

const inTestFile1 = "test.txt"
const inTestFile2 = "test2.txt"
const outTestFile = "go_out_test.json"

// type Site struct {
// 	Lat  string
// 	Lng  string
// 	Loc  string
// 	Name string
// 	ID   string
// }
// type LngBin struct {
// 	SiteList []map[string]string
// }
// type LatBin struct {
// 	LngBin map[string][]Site
// }
// type LatLngLookup struct {
// 	LatBin map[string]LngBin
// }

// type LatLngLookup struct {
// 	LatBin struct {
// 		LngBin []struct {
// 			ID   string  `json:"id"`
// 			Lat  float64 `json:"lat"`
// 			Loc  string  `json:"loc"`
// 			Lon  float64 `json:"lon"`
// 			Name string  `json:"name"`
// 		}
// 	}
// }

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
		fmt.Println(lineData)

		//Skip "Hidden" sites
		if len(lineData) != 4 {
			fmt.Println("skip", lineData)
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
	//Maps site IDs to Loc,Lat,Lng
	fmt.Println(siteIDMap)

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
		fmt.Println(lineData)

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

	//HAVE ID mapped to all site data...
	fmt.Println(siteIDMap)

	slice := []map[string]string{} //empty slice

	//Init map of Lat/Lng to site data
	latLngMap := make(map[string]map[string][]map[string]string)

	// for every site in map
	for k, v := range siteIDMap {
		loc := v["loc"]
		lat := v["lat"]
		lng := v["lng"]
		name := v["name"]

		latFloor := strings.Split(lat, ".")[0]
		lngFloor := strings.Split(lng, ".")[0]

		// initialize nested map for this lat if it was not already initialized
		// by a previous iteration
		_, ok := latLngMap[latFloor]
		if !ok {
			latLngMap[latFloor] = make(map[string][]map[string]string)
			latLngMap[latFloor][lngFloor] = make([]map[string]string, 1)
		}

		m := map[string]string{"id": k, "lat": lat, "lng": lng, "loc": loc, "name": name}

		latLngMap[latFloor][lngFloor] = append(slice, m)

	}

	jsonByteSlice, err := json.MarshalIndent(latLngMap, "", "  ")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(string(jsonByteSlice))

	ioutil.WriteFile(outTestFile, jsonByteSlice, os.ModePerm)

}

// func main() {
// 	// Open input file
// 	inFile, err := os.Open(cscKeysFile)
// 	if err != nil { //raise error if fileread does not work
// 		panic(err)
// 	}
// 	// close file at end of function (stacked, 2nd to run at end)
// 	defer func() {
// 		if err := inFile.Close(); err != nil {
// 			panic(err)
// 		}
// 	}()

// 	// Read Buffer
// 	r := bufio.NewReader(inFile)

// 	// Create output file
// 	outFile, err := os.Create(outTestFile)
// 	if err != nil { //raise error if file creation does not work
// 		panic(err)
// 	}

// 	//close file at end of function (stacked, 1st to run at end)
// 	defer func() {
// 		if err := outFile.Close(); err != nil {
// 			panic(err)
// 		}
// 	}()
// 	// write buffer
// 	w := bufio.NewWriter(outFile)

// 	// buffer to keep chunks
// 	buf := make([]byte, 1024) //byte as "slice of string" with buffer size of 1024. byte is mutable, string is immutable
// 	for {
// 		// read a chunk
// 		n, err := r.Read(buf) //read buffer
// 		if err != nil && err != io.EOF {
// 			panic(err)
// 		}
// 		if n == 0 { //break at EOF?
// 			break
// 		}
// 	}
// 	if err = w.Flush(); err != nil { //write to?
// 		panic(err)
// 	}
// }
