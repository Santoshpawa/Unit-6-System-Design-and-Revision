// Step 1: Define the MediaFile interface
interface MediaFile {
  play(): void;
}

// Step 2: Implement different types of media files
class AudioFile implements MediaFile {
  play(): void {
    console.log("Playing audio file...");
  }
}

class VideoFile implements MediaFile {
  play(): void {
    console.log("Playing video file...");
  }
}

class PDFFile implements MediaFile {
  play(): void {
    console.log("Displaying PDF document...");
  }
}

// Step 3: MediaPlayer class accepts any MediaFile
class MediaPlayer {
  playMedia(media: MediaFile): void {
    media.play();
  }
}

// Step 4: Demonstrate loose coupling
const mediaPlayer = new MediaPlayer();

const audio = new AudioFile();
const video = new VideoFile();
const pdf = new PDFFile();

mediaPlayer.playMedia(audio);  // Playing audio file...
mediaPlayer.playMedia(video);  // Playing video file...
mediaPlayer.playMedia(pdf);    // Displaying PDF document...
