/**
 * The intro (BUILD-SPEC 2.1): the salon's clean intro video plays every time the app opens,
 * muted, centred on black, then hands over to the login. A Skip button is always there,
 * and a time-out moves on if the video can't play on this phone.
 */
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GT } from "./glass";

const SOURCE = require("../../assets/brand/intro-clean.mp4");

export function Intro({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const done = useRef(false);
  const finish = () => {
    if (done.current) return;
    done.current = true;
    onDone();
  };
  const player = useVideoPlayer(SOURCE, (p) => {
    p.muted = true;
    p.loop = false;
    p.play();
  });
  const { status } = useEvent(player, "statusChange", { status: player.status });
  useEffect(() => {
    const sub = player.addListener("playToEnd", finish);
    // The video is 4 s; never hold the salon up if it can't play.
    const t = setTimeout(finish, 6500);
    return () => {
      sub.remove();
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);
  useEffect(() => {
    if (status === "error") finish();
    // On the web the first play() can land before the video has loaded; start it once it's ready.
    if (status === "readyToPlay" && !player.playing) player.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: "#000", alignItems: "center", justifyContent: "center" }]} accessibilityLabel="Salon intro">
      <VideoView player={player} style={{ width: "100%", aspectRatio: 1 }} contentFit="contain" nativeControls={false} allowsPictureInPicture={false} />
      <Pressable onPress={finish} accessibilityRole="button" accessibilityLabel="Skip intro" hitSlop={10} style={{ position: "absolute", right: 18, bottom: insets.bottom + 22, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", backgroundColor: "rgba(0,0,0,0.35)" }}>
        <GT size={13} w="semibold" c="#fff">
          Skip
        </GT>
      </Pressable>
    </View>
  );
}
