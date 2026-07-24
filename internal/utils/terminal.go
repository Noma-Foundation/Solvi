package utils

import (
	"errors"
	"os/exec"
	"runtime"
)

type systemTerminalOpener struct {
	opener  TerminalOpener
	command *exec.Cmd
}

// Create a new instance of SystemTerminalOpener based on the current OS
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

// OpenTerminal start a new terminal for the current OS
func (s *systemTerminalOpener) OpenTerminal() error {
	switch runtime.GOOS {
	case "windows":
		s.command = exec.Command("cmd", "/c", "start", "cmd")
	case "linux", "darwin":
		s.command = exec.Command("bash", "-c", "start", "cmd")
	}
	return s.command.Start()
}
