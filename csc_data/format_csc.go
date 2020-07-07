package main

import (
    "bufio"
    "io"
    "os"
)


const csc_keys_file = "chart_keys00.txt"
const csc_prop_file = "chart_prop00.txt"
const out_test_file = "go_out_test.txt"

func main() {
    // Open input file
    in_file, err := os.Open(csc_keys_file)
    if err != nil {
        panic(err)
    }
    // asd
    defer func(){
        if err := in_file.Close(); err != nil {
            panic(err)
        }
    }()

    // Read Buffer
    r := bufio.NewReader(in_file)

    // Open output
    out_file, err := os.Create(out_test_file)
    if err != nil {
        panic(err)
    }

    defer func() {
        if err := out_file.Close(); err != nil {
            panic(err)
        }
    }()
    // write buffer
    w := bufio.NewWriter(out_file)

    // buffer to keep chunks
    buf := make([]byte, 1024)
    for {
        // read a chunk
        n, err := r.Read(buf)
        if err != nil && err != io.EOF {
            panic(err)
        }
        if n == 0 {
            break
        }
    }
    if err = w.Flush(); err != nil {
        panic(err)
    }

} 