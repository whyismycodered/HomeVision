// app/(tabs)/hvcam.jsx
import { Camera, CameraView } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { hp, wp } from '../../helpers/common';

const BACKEND_UPLOAD_URL = 'http://192.168.68.119:8000/camera';

export default function HVCam() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState('back');
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef(null);

  const uploadAndGo = async (uri) => {
    try {
      setUploading(true);

      let formData = new FormData();
      formData.append('photo', {
        uri: uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });

      const response = await fetch(BACKEND_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Upload failed: ' + errorText);
      }

      // Go to wAIs chat with the image
      router.push({
        pathname: '/(tabs)/wAIschat',
        params: { imageUri: uri },
      });

    } catch (error) {
      Alert.alert('Upload Error', error.message);
    } finally {
      setUploading(false);
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    uploadAndGo(photo.uri);
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadAndGo(result.assets[0].uri);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 18 }}>
          No access to camera
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} facing={cameraType} ref={cameraRef} />

      {/* Flip Camera */}
      <TouchableOpacity
        style={styles.flipButton}
        onPress={() => setCameraType(current => (current === 'back' ? 'front' : 'back'))}
      >
        <Ionicons name="camera-reverse" size={wp(8)} color="white" />
      </TouchableOpacity>

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.galleryButton} onPress={pickFromGallery} disabled={uploading}>
          <Ionicons name="images-outline" size={wp(8)} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, uploading && { opacity: 0.6 }]}
          onPress={takePhoto}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <View style={styles.innerCircle} />
          )}
        </TouchableOpacity>

        <View style={{ width: 70 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flipButton: {
    position: 'absolute',
    top: hp(7),
    right: wp(5),
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: wp(4),
    borderRadius: wp(13),
  },
  bottomBar: {
    position: 'absolute',
    bottom: hp(6),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(8),
  },
  galleryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: wp(4),
    borderRadius: wp(10),
  },
  captureButton: {
    width: wp(21),
    height: wp(21),
    borderRadius: wp(10.5),
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: wp(1.8),
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: wp(17),
    height: wp(17),
    borderRadius: wp(8.5),
    backgroundColor: 'white',
  },
});