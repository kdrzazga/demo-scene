import argparse
import socket
import time


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

    def write_byte(self, address, value):
        self.send_lines([f"> ${address:04x} ${value:02x}", "x"])

    def send_lines(self, lines):
        self.connection.sendall(("\n".join(lines) + "\n").encode("ascii"))
        self.drain_replies()

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


class UserPortFeeder:
    def __init__(self, monitor, interval_seconds):
        self.monitor = monitor
        self.interval_seconds = interval_seconds
        self.cia2_port_b_data = 0xDD01
        self.cia2_port_b_direction = 0xDD03
        self.all_lines_output = 0xFF

    def run(self):
        self.monitor.write_byte(self.cia2_port_b_direction, self.all_lines_output)
        value = 0
        next_tick = time.monotonic()
        while True:
            self.monitor.write_byte(self.cia2_port_b_data, value)
            print(f"user port <- {value:3d}  ${value:02X}  %{value:08b}")
            value = (value + 1) % 256
            next_tick += self.interval_seconds
            time.sleep(max(0.0, next_tick - time.monotonic()))


def parse_arguments():
    parser = argparse.ArgumentParser(description="Feed an incrementing 0-255 counter to the VICE C64 user port (CIA2 port B) via the remote monitor.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=6510)
    parser.add_argument("--interval-ms", type=int, default=200)
    return parser.parse_args()


def main():
    interval_ms = 1000
    monitor = ViceRemoteMonitor("127.0.0.1", 6502)
    monitor.connect()
    try:
        UserPortFeeder(monitor, interval_ms / 1000.0).run()
    except KeyboardInterrupt:
        pass
    finally:
        monitor.close()


if __name__ == "__main__":
    main()
