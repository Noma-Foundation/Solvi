package utils

import "os/exec"

type TerminalOpener interface {
	openTerminal() error
}

type SystemTerminalOpener struct {
	command *exec.Cmd
}

func NewSystemTerminalOpener() *SystemTerminalOpener {
	return &SystemTerminalOpener{
		command: exec.Command("cmd"),
	}
}

func (s *SystemTerminalOpener) OpenTerminal() error {
	s.command = exec.Command("cmd", "/c", "start", "cmd")
	return s.command.Start()
}
