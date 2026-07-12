package utils

import (
	"errors"
	"os/exec"
	"runtime"
)

type terminalOpener interface {
	openTerminal() error
}

type systemTerminalOpener struct {
	command *exec.Cmd
}

func NewSystemTerminalOpener() (*systemTerminalOpener, error) {
	switch runtime.GOOS {
	case "windows":
		return &systemTerminalOpener{
			command: exec.Command("cmd"),
		}, nil
	case "linux", "darwin":
		return &systemTerminalOpener{
			command: exec.Command("bash"),
		}, nil
	}
	return nil, errors.New("Current OS not compatible with this terminal")
}

func (s *systemTerminalOpener) OpenTerminal() error {
	switch runtime.GOOS {
	case "windows":
		s.command = exec.Command("cmd", "/c", "start", "cmd")
	case "linux", "darwin":
		s.command = exec.Command("bash", "-c", "start", "cmd")
	}
	return s.command.Start()
}
