import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from '../../helpers/common';

const BACKEND_RESULTS_URL = 'http://192.168.68.109:8000/design-results';

export default function WAIsResult() {
  const params = useLocalSearchParams();
  const { designId } = params;
  
  const [loading, setLoading] = useState(true);
  const [designImage, setDesignImage] = useState(null);
  const [detectedItems, setDetectedItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (designId) {
      fetchDesignResults();
    } else {
      Alert.alert('Error', 'No design ID provided');
      setLoading(false);
    }
  }, [designId]);

  const fetchDesignResults = async () => {
    try {
      const response = await fetch(`${BACKEND_RESULTS_URL}/${designId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch design results');
      }

      const data = await response.json();
      
      // Handle potential URL encoding issues with base64
      const formattedImageUri = data.image?.replace(/ /g, '+');
      setDesignImage(formattedImageUri);
      
      // Map backend inventory to frontend format
      const inventory = data.inventory.map(item => ({
        name: item.item_name,
        price: `₱${item.estimated_price_php.toLocaleString()}`,
        category: item.category,
        description: item.visual_description,
      }));
      
      setDetectedItems(inventory);
      
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert('Error', 'Failed to load design results');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateInstallment = () => {
    if (detectedItems.length === 0) {
      Alert.alert('No Items', 'No items available to calculate installment');
      return;
    }
    
    // Navigate to installation calculator with the items
    router.push({
      pathname: '/(tabs)/installation',
      params: { 
        items: JSON.stringify(detectedItems),
        designId: designId 
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E31E24" />
          <Text style={styles.loadingText}>Loading your design...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* AI-Generated Redesigned Room Image */}
        <TouchableOpacity onPress={() => designImage && setModalVisible(true)} activeOpacity={0.9}>
          <View style={styles.imageContainer}>
            {designImage ? (
              <Image
                source={{ uri: designImage }}
                style={styles.redesignedImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.redesignedImage, styles.placeholderImage]}>
                <Ionicons name="image-outline" size={80} color="#ccc" />
                <Text style={styles.placeholderText}>No design image available</Text>
              </View>
            )}
            <View style={styles.overlay}>
              <Ionicons name="sparkles" size={32} color="#fff" />
              <Text style={styles.overlayText}>Your Dream Room by HomeVision</Text>
              <Text style={styles.tapToViewText}>Tap to view full image</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Full Screen Image Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close-circle" size={40} color="#fff" />
            </TouchableOpacity>
            {designImage && (
              <Image
                source={{ uri: designImage }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Items in Your Design</Text>
          <Text style={styles.subtitle}>
            {detectedItems.length > 0 
              ? 'Tap any item to view installment plans'
              : 'No items detected yet'}
          </Text>
        </View>

        {/* Vertical List of Items */}
        <View style={styles.itemsList}>
          {detectedItems.length > 0 ? (
            detectedItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemDescription} numberOfLines={3}>
                    {item.description}
                  </Text>
                  <Text style={styles.priceAmount}>{item.price}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No items found in this design</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Rectangular FAB Button */}
      {detectedItems.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleCalculateInstallment}>
          <Ionicons name="calculator-outline" size={26} color="#fff" />
          <Text style={styles.fabText}>Calculate in Installment</Text>
          <Ionicons name="arrow-forward" size={26} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: wp(4),
    color: '#666',
  },
  imageContainer: {
    height: 420,
    position: 'relative',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  placeholderText: {
    marginTop: hp(2),
    fontSize: wp(4),
    color: '#888',
  },
  redesignedImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  tapToViewText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  header: {
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 6,
  },
  itemsList: {
    paddingHorizontal: 16,
    paddingBottom: 100, // space for FAB
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 14,
    color: '#888',
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E31E24',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    backgroundColor: '#E31E24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  fabText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(8),
  },
  emptyText: {
    marginTop: hp(2),
    fontSize: wp(4.5),
    color: '#888',
    textAlign: 'center',
  },
});