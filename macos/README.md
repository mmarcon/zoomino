# Zoomino for macOS

**macOS** application for [Zoomino](https://github.com/mmarcon/zoomino), an Arduino-based project to
mute and unmute Zoom by pushing a physical button.

## How to use it

### Set up the hardware

Build the circuit and connect it via USB to your computer.

![circuit](https://github.com/mmarcon/zoomino/raw/main/resources/board.png).

### Install Zoomino

Install `zoomino` from npm on your computer:

```
$ npm i -g zoomino
```

### Run Zoomino

```
$ zoomino
{"level":30,"time":1615713633042,"pid":32523,"hostname":"air.local","module":"serial comm mgr","msg":"connected"}
```

### Join a Zoom meeting and enjoy

As soon as you start or join a Zoom meeting, the Arduino syncs with the mute/unmute state of Zoom and switches
the right LED on.

You can use the buttons on the board or the built-in Zoom controls to mute and unmute yourself and the LEDs will
adjust accordingly.

### Plug/Unplug the Arduino

If you leave Zoomino run in the background, it should detect when the Arduino is connected and disconnected and behave
accordingly, setting up and disposing the serial connection and protocol.

#### Allow the terminal to control your computer

Zoomino uses AppleScript to access the Zoom controls and periodically check whether it's muted or unmuted.
For this reason, macOS will probably ask you to allow it to contol your computer using accessibility features.

You can check exactly what Zoomino does with AppleScript [here](./lib/zoom.js) (`muteUnmuteScript` and `isMutedScript`).

## Known issues

* Zoomino needs to be run manually from the terminal. If you want to run it as a service, you will have to configure it yourself.