from pathlib import Path
from shutil import copy2
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
MUSIC = PUBLIC / "music"

COVERS = {
    PUBLIC / "covers/song1.png": MUSIC / "covers/evening-wind-v1.png",
    PUBLIC / "covers/song2.jpg": MUSIC / "covers/sad-days-v1.jpg",
    PUBLIC / "covers/song3.webp": MUSIC / "covers/clouds-and-smile-v1.webp",
    PUBLIC / "generated-media/covers/backend-test-song--406010ab-3ded-43dd-a9f6-c7fb76dc7a49.jpg": MUSIC / "covers/backend-test-song-v1.jpg",
}

AUDIO = {
    PUBLIC / "audio/song1.mp3": MUSIC / "audio/evening-wind-v1.mp3",
    PUBLIC / "audio/song2.mp3": MUSIC / "audio/sad-days-v1.mp3",
    PUBLIC / "audio/song3.mp3": MUSIC / "audio/clouds-and-smile-v1.mp3",
    PUBLIC / "generated-media/audio/backend-test-song--babaf433-1a3c-4412-a97e-c111e1979925.mp3": MUSIC / "audio/backend-test-song-v1.mp3",
}

EXTRAS = {
    "evening-wind-color-v1": PUBLIC / "covers/song1.png",
    "sad-days-moodboard-v1": PUBLIC / "covers/song2.jpg",
    "cloud-fragment-v1": PUBLIC / "covers/song3.webp",
    "backend-close-door-drum-v1": PUBLIC / "generated-media/extras/backend-test-song--e2eb1ef2-c3ad-48aa-b9bb-021b0497894f--2fdc9310-152a-4c02-90a0-991cd63995fa.png",
}

PROJECTOR = {
    PUBLIC / "images/projector/projector-fallback.webp": MUSIC / "projector/projector-static-v1.webp",
}


def copy_files(mapping):
    for source, destination in mapping.items():
        destination.parent.mkdir(parents=True, exist_ok=True)
        copy2(source, destination)


def rgb_image(source):
    image = ImageOps.exif_transpose(Image.open(source))
    if image.mode in ("RGBA", "LA"):
        background = Image.new("RGB", image.size, "white")
        background.paste(image, mask=image.getchannel("A"))
        return background
    return image.convert("RGB")


def save_variant(image, destination, max_edge, quality):
    output = image.copy()
    output.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
    destination.parent.mkdir(parents=True, exist_ok=True)
    output.save(
        destination,
        "JPEG",
        quality=quality,
        optimize=True,
        progressive=True,
        subsampling=0,
    )


def build_extras():
    for name, source in EXTRAS.items():
        image = rgb_image(source)
        save_variant(image, MUSIC / f"extras/thumbs/{name}.jpg", 700, 86)
        save_variant(image, MUSIC / f"extras/full/{name}.jpg", 2200, 92)


def main():
    copy_files(COVERS)
    copy_files(AUDIO)
    copy_files(PROJECTOR)
    build_extras()
    print("Prepared versioned domestic media under public/music.")


if __name__ == "__main__":
    main()
