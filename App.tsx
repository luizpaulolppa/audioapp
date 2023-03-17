import { View, Pressable, Text, Alert, Button } from 'react-native';
import { styles } from './styles';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { RecordingOptionsPresets } from 'expo-av/build/Audio';

export default function App() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingFileURL, setRecordingFileURL] = useState<string | null>(null);

  async function handleRecordingStart() {
    const { granted } = await Audio.getPermissionsAsync();

    if (granted) {
      try {
        const { recording } = await Audio.Recording.createAsync(RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(recording);
      } catch (error) {
        console.log(error);
        Alert.alert('Erro ao gravar', 'Não foi possível iniciar a gravação do audio.');
      }
    }
  }

  async function handleRecordingStop() {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const fileURI = recording.getURI();
        console.log(fileURI);
        setRecordingFileURL(fileURI);
        setRecording(null);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Erro ao pausar', 'Não foi possível pausar a gravação do audio.');
    }
  }

  async function handleAudioPlay() {
    if (recordingFileURL) {
      const { sound } = await Audio.Sound.createAsync({ uri: recordingFileURL }, { shouldPlay: true });
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  }

  useEffect(() => {
    Audio
      .requestPermissionsAsync()
      .then(({ granted }) => {
        if (granted) {
          Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            playThroughEarpieceAndroid: true,
          });
        }
      });
  }, []);

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, recording && styles.recording]}
        onPressIn={handleRecordingStart}
        onPressOut={handleRecordingStop}
      >
        <MaterialIcons name="mic" size={44} color="#212121" />
      </Pressable>
      {recording && <Text style={styles.label}>Gravando</Text>}
       {recordingFileURL && <Button title="Ouvir audio" onPress={handleAudioPlay} />}
    </View>
  );
}
