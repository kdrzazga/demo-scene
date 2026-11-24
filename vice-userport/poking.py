import argparse
import socket


class ViceRemoteMonitor:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.connect_timeout_seconds = 5.0
        self.drain_timeout_seconds = 0.05
        self.connection = None

    def connect(self):
        self.connection = socket.create_connection((self.host, self.port), timeout=self.connect_timeout_seconds)

    def close(self):
        if self.connection is not None:
            self.connection.close()
            self.connection = None

    def poke(self, address, *values):
        hex_values = " ".join(f"${value:02x}" for value in values)
        self.send_lines([f"> ${address:04x} {hex_values}", "x"])

    def send_lines(self, lines):
        self.connection.sendall(("\n".join(lines) + "\n").encode("ascii"))

    def drain_replies(self):
        self.connection.settimeout(self.drain_timeout_seconds)
        try:
            while True:
                chunk = self.connection.recv(4096)
                if not chunk:
                    raise ConnectionError("VICE closed the remote monitor connection")
        except TimeoutError:
            pass
        finally:
            self.connection.settimeout(None)


def screen_code(character):
    if "A" <= character <= "Z":
        return ord(character) - ord("A") + 1
    return ord(character)


def parse_arguments():
    parser = argparse.ArgumentParser(description="Poke values into a running VICE through its remote monitor.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--left-port", type=int, default=6510)
    parser.add_argument("--right-port", type=int, default=6511)
    return parser.parse_args()


def main():
    arguments = parse_arguments()
    left = ViceRemoteMonitor(arguments.host, arguments.left_port)
    right = ViceRemoteMonitor(arguments.host, arguments.right_port)
    machines = [left, right]
    for machine in machines:
        machine.connect()
    value = 0
    try:
        while True:
            for machine in machines:
                poking(machine, value)
            for machine in machines:
                machine.drain_replies()
            value = (value + 1) % 256
    except KeyboardInterrupt:
        pass
    finally:
        left.close()
        right.close()


def poking(monitor, value):
    monitor.poke(53280, value)
    #monitor.poke(1024, screen_code("A"))
    #monitor.poke(1025, screen_code("B"))
    #monitor.poke(1026, screen_code("C"))


if __name__ == "__main__":
    main()
