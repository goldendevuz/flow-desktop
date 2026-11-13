//! A best guess at which videos are music videos, for the "Hide music videos" setting. YouTube's
//! own category is not on the cards Home reads, so this goes by what the title and channel say:
//! it catches the usual labels ("Official Video", "Lyrics", VEVO, "- Topic") and misses a song
//! whose title says nothing of the kind.

use crate::models::video::VideoSummary;

/// Phrases that mark a title as a song or its video, matched in lower case.
const TITLE_MARKERS: [&str; 24] = [
    "official music video",
    "official video",
    "official audio",
    "official lyric",
    "official mv",
    "official clip",
    "lyric video",
    "lyrics",
    "music video",
    "mood video",
    "visualizer",
    "(audio)",
    "[audio]",
    "(mv)",
    "[mv]",
    " m/v",
    "(feat.",
    "[feat.",
    "(ft.",
    "[ft.",
    " feat. ",
    " ft. ",
    "клип",
    "klip",
];

/// Channel names that only publish music.
fn music_channel(channel: &str) -> bool {
    channel.ends_with(" - topic") || channel.ends_with("vevo") || channel.contains("vevo ")
}

/// Whether `video` looks like a music video or a song upload.
#[must_use]
pub fn looks_like_music_video(video: &VideoSummary) -> bool {
    let channel = video.channel_name.to_lowercase();
    if music_channel(&channel) {
        return true;
    }
    let title = video.title.to_lowercase();
    TITLE_MARKERS.iter().any(|marker| title.contains(marker))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn video(title: &str, channel: &str) -> VideoSummary {
        VideoSummary {
            id: "id".into(),
            title: title.into(),
            channel_name: channel.into(),
            ..Default::default()
        }
    }

    #[test]
    fn catches_the_usual_labels() {
        assert!(looks_like_music_video(&video("Anvar - Jonim jonimey (Official Music Video)", "NevoMusic")));
        assert!(looks_like_music_video(&video("Autumn - NIKI (Lyrics)", "Kioumiusic")));
        assert!(looks_like_music_video(&video("Here In Your Dreams (ft. Liam Pearce) |", "BlushCrunch")));
        assert!(looks_like_music_video(&video("Asror Uz - Ko'rolmaysiz | Mood Video", "ASROR_UZ_")));
        assert!(looks_like_music_video(&video("Kechqurun klip", "Jon")));
        assert!(looks_like_music_video(&video("Anything", "ArtistVEVO")));
        assert!(looks_like_music_video(&video("Anything", "Some Artist - Topic")));
    }

    #[test]
    fn leaves_other_videos_alone() {
        assert!(!looks_like_music_video(&video("Did Gravity Ever Change? Science Finally...", "Anton Petrov")));
        assert!(!looks_like_music_video(&video("What is REST API (http)? Soap? GraphQL...", "Ulbi TV")));
        assert!(!looks_like_music_video(&video("Fireplace and rain sounds for sleep", "Cozy")));
    }
}
