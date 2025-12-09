import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from '../../helpers/common';

const BACKEND_AI_URL = 'http://192.168.68.119:8000/generate-design';

export default function WAIs() {
  const { imageUri } = useLocalSearchParams();
  const [designIdea, setDesignIdea] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!designIdea.trim()) {
      Alert.alert('Input Required', 'Please describe the design you want');
      return;
    }

    if (!imageUri) {
      Alert.alert('Image Required', 'Please take or upload an image first');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('photo', {
        uri: imageUri,
        name: 'room.jpg',
        type: 'image/jpeg',
      });
      formData.append('designIdea', designIdea);
      formData.append('budget', budget || '');

      const response = await fetch(BACKEND_AI_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('AI request failed: ' + errorText);
      }

      const result = await response.json();
      
      // Success - navigate to results page with the AI response
      // Expected result format: { designId, generatedImageUrl, items: [...] }
      router.push({
        pathname: '/(tabs)/imageDisplay',
        params: {
          designId: result.designId || Date.now().toString(),
          generatedImageUri: result.generatedImageUrl || result.designImageUrl,
        },
      });

    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to generate design. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <Text style={styles.title}>HomeVision</Text>
          <Text style={styles.subtitle}>Describe the design you want to HomeVision</Text>

          {/* Big Image Box */}
          <View style={styles.imageBox}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.uploadedImage} resizeMode="cover" />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="image-outline" size={wp(15)} color="#ccc" />
              </View>
            )}
          </View>

          {/* Input 1: Design Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>What kind of design do you want?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Modern minimalist living room, luxury bathroom, cozy bedroom..."
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={4}
              value={designIdea}
              onChangeText={setDesignIdea}
            />
          </View>

          {/* Input 2: Budget */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Be wAIs with your budget</Text>
            <TextInput
              style={[styles.textInput, { height: hp(7.5) }]}
              placeholder="Tell wAIs your budget"
              placeholderTextColor="#aaa"
              value={budget}
              onChangeText={setBudget}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.submitText}>Generate My Design</Text>
                <Ionicons name="sparkles" size={wp(6)} color="#fff" style={{ marginLeft: wp(2.5) }} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: wp(6),
    paddingTop: hp(5),
    alignItems: 'center',
  },
  title: {
    fontSize: wp(8),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: wp(4.3),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp(3.5),
    lineHeight: hp(3),
  },
  imageBox: {
    width: '100%',
    height: hp(30),
    backgroundColor: '#f5f5f5',
    borderRadius: wp(5),
    marginBottom: hp(2),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  placeholder: {
    opacity: 0.5,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  inputContainer: {
    width: '100%',
    marginBottom: hp(2.5),
  },
  label: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp(1.2),
    marginLeft: wp(1),
  },
  textInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp(4),
    paddingHorizontal: wp(4.5),
    paddingVertical: hp(2),
    fontSize: wp(4),
    textAlignVertical: 'top',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#E31E24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(2.2),
    paddingHorizontal: wp(10),
    borderRadius: wp(7.5),
    marginTop: hp(2.5),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
});