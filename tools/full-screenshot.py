import time
import pyautogui

def capture_screenshots(interval=0.3):
    try:
        while True:
            screenshot = pyautogui.screenshot()
            timestamp = int(time.time() * 1000)
            filename = f"screenshots/screenshot_{timestamp}.png"
            screenshot.save(filename)
            print(f"Saved: {filename}")
            time.sleep(interval)
    except KeyboardInterrupt:
        print("Screenshot capture stopped.")


if __name__ == "__main__":
    capture_screenshots()
