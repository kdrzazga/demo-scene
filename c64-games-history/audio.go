package main

import (
    "os"

    "github.com/hajimehoshi/ebiten/v2/audio"
    "github.com/hajimehoshi/ebiten/v2/audio/wav"
)

var (
    context         *audio.Context
    )

func initAudio(path string) (*audio.Player, error) {
    context = audio.NewContext(44100)

    f, err := os.Open(path)
    if err != nil {
        return nil, err
    }
    stream, err := wav.Decode(context, f)
    if err != nil {
        return nil, err
    }

    localPlayer, err := audio.NewPlayer(context, stream)
    if err != nil {
        return nil, err
    }

    //defer f.Close()
    return localPlayer, nil
}
