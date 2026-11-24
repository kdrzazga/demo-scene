import re
import subprocess
from pathlib import Path

KICK_ASSEMBLER = "KickAss.jar"
SOURCE = "KdPicsViewer.asm"
FAST_LOADER_PROGRAM = "KdPicsViewer.prg"
SD2IEC_PROGRAM = "KdPicsSD.prg"
SD2IEC_SYMBOL = "SD2IEC"
PICTURE_LIST = "PictureList.asm"
DISK = "kdpics.d64"
DISK_HEADER = "kdpics,kd"
FAST_LOADER_DISK_NAME = "kdpics"
SD2IEC_DISK_NAME = "kdpicssd"
MAX_DISK_NAME_LENGTH = 16
MAX_COLOR = 15
C1541 = Path(r"D:\GTK3VICE-3.8-win64\bin\c1541.exe")


def numeric_order(name):
    leading_digits = re.match(r"\d*", name).group()
    return (int(leading_digits) if leading_digits else float("inf"), name)


def find_pictures(folder):
    pictures = sorted((path.name for path in folder.glob("*.kla")), key=numeric_order)
    too_long = [name for name in pictures if len(disk_name(name)) > MAX_DISK_NAME_LENGTH]
    if too_long:
        raise SystemExit(f"names longer than {MAX_DISK_NAME_LENGTH} characters: {too_long}")
    return pictures


def disk_name(name):
    return Path(name).stem.upper()


def border_color(name):
    trailing_digits = re.search(r"(\d\d)\.kla$", name, re.IGNORECASE)
    if not trailing_digits or int(trailing_digits.group(1)) > MAX_COLOR:
        raise SystemExit(f"{name} must end with a border color 00-{MAX_COLOR} before .kla")
    return int(trailing_digits.group(1))


def write_picture_list(folder, pictures):
    labels = [f"pictureName{index}" for index in range(len(pictures))]
    lines = [
        f".label PICTURE_COUNT = {len(pictures)}",
        '.encoding "petscii_upper"',
        "pictureBorderColors:\t.byte " + ", ".join(str(border_color(name)) for name in pictures),
        "pictureNameLengths:\t.byte " + ", ".join(str(len(disk_name(name))) for name in pictures),
        "pictureNamesLow:\t.byte " + ", ".join(f"<{label}" for label in labels),
        "pictureNamesHigh:\t.byte " + ", ".join(f">{label}" for label in labels),
    ]
    lines += [f'{label}:\t.text "{disk_name(name)}"' for label, name in zip(labels, pictures)]
    (folder / PICTURE_LIST).write_text("\n".join(lines) + "\n")


def assemble(folder, program, symbols=()):
    defines = [argument for symbol in symbols for argument in ("-define", symbol)]
    command = ["java", "-jar", KICK_ASSEMBLER, SOURCE, "-showmem", "-o", program, *defines]
    subprocess.run(command, cwd=folder, check=True)


def build_disk(folder, pictures):
    commands = [str(C1541), "-format", DISK_HEADER, "d64", DISK,
                "-write", FAST_LOADER_PROGRAM, FAST_LOADER_DISK_NAME,
                "-write", SD2IEC_PROGRAM, SD2IEC_DISK_NAME]
    for name in pictures:
        commands += ["-write", name, disk_name(name).lower()]
    commands += ["-list"]
    subprocess.run(commands, cwd=folder, check=True)


def main():
    folder = Path(__file__).resolve().parent
    pictures = find_pictures(folder)
    print("pictures in order:", ", ".join(pictures))
    write_picture_list(folder, pictures)
    assemble(folder, FAST_LOADER_PROGRAM)
    assemble(folder, SD2IEC_PROGRAM, [SD2IEC_SYMBOL])
    build_disk(folder, pictures)


if __name__ == "__main__":
    main()
