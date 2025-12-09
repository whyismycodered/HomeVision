import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  Entypo,
} from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // ← Added for navigation
import { hp, wp } from '../../helpers/common';

export default function App() {
  const router = useRouter(); // ← This enables navigation

  const categories = [
    { name: 'shopping\nmall', badge: 'Deals', icon: 'storefront', color: '#FF9800', iconLib: 'MaterialCommunityIcons' },
    { name: 'iPhone', badge: 'Latest', icon: 'logo-apple', color: '#E31E24', iconLib: 'Ionicons' },
    { name: 'Android', badge: '0%', icon: 'logo-android', color: '#8BC34A', iconLib: 'Ionicons' },
    { name: 'Ref', badge: 'Top', icon: 'fridge-outline', color: '#E91E63', iconLib: 'MaterialCommunityIcons' },
  ];

  const hotDeals = [
    { name: 'Apple iPhone 17 Pro Max 256GB Sl...', price: '₱2,709 x 24months', icon: 'mobile-alt' },
    { name: 'Apple iPhone 13 128GB Starlight', price: '₱912 x 24months', icon: 'mobile-alt' },
    { name: 'Deva Quantum', price: '₱1,471', icon: 'mobile-alt' },
  ];

  const trending = [
    { name: '#01 Honor X9c 256GB/12GB Fad...', price: '₱719 x 18months', icon: 'mobile-alt' },
    { name: 'Vivo V60 5G 512GB/12GB Sum...', price: '₱1,319 x 18months', icon: 'mobile-alt' },
    { name: 'Samsung A56 5...', price: '₱759', icon: 'mobile-alt' },
  ];

  const renderCategoryIcon = (iconLib, iconName) => {
    switch (iconLib) {
      case 'Ionicons':
        return <Ionicons name={iconName} size={wp(8)} color="#666" />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={iconName} size={wp(8)} color="#666" />;
      default:
        return <Entypo name="shop" size={wp(8)} color="#666" />;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>HOME</Text>
            <Text style={styles.logo}>CREDIT</Text>
          </View>
          <TouchableOpacity style={styles.loginContainer}>
            <Ionicons name="person-circle-outline" size={wp(5)} color="#fff" />
            <Text style={styles.loginBtn}>Login/Register</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.limitedOffer}>
            <Ionicons name="time-outline" size={wp(3)} color="#E31E24" />
            <Text style={styles.limitedOfferText}>Limited-time offer</Text>
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroText}>Buy in installments with up to</Text>
            <Text style={styles.heroAmount}>₱80,000</Text>
            <Text style={styles.heroSubtext}>Payment term up to 24 months</Text>

            <View style={styles.features}>
              <View style={styles.feature}>
                <Text style={styles.featureLabel}>as fast as</Text>
                <View style={styles.featureValueContainer}>
                  <Ionicons name="flash" size={wp(5)} color="#FFD700" />
                  <Text style={styles.featureValue}>1 min</Text>
                </View>
                <Text style={styles.featureDesc}>approval</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureLabel}>shop in</Text>
                <View style={styles.featureValueContainer}>
                  <Ionicons name="storefront" size={wp(5)} color="#FFD700" />
                  <Text style={styles.featureValue}>17K</Text>
                </View>
                <Text style={styles.featureDesc}>stores</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureLabel}>at least</Text>
                <View style={styles.featureValueContainer}>
                  <Ionicons name="card" size={wp(5)} color="#FFD700" />
                  <Text style={styles.featureValue}>1 ID</Text>
                </View>
                <Text style={styles.featureDesc}>required</Text>
              </View>
            </View>

            <View style={styles.ctaButtons}>
              <TouchableOpacity style={styles.learnMoreBtn}>
                <Ionicons name="information-circle-outline" size={wp(5)} color="#E31E24" />
                <Text style={styles.learnMoreText}>Learn more</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyNowBtn}>
                <Text style={styles.applyNowText}>Apply now</Text>
                <Ionicons name="arrow-forward" size={wp(5)} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categories}>
          {categories.map((cat, index) => (
            <TouchableOpacity key={index} style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <View style={[styles.categoryBadge, { backgroundColor: cat.color }]}>
                  <Text style={styles.categoryBadgeText}>{cat.badge}</Text>
                </View>
                {renderCategoryIcon(cat.iconLib, cat.icon)}
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Just For You Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <MaterialCommunityIcons name="star-circle" size={wp(6)} color="#FFD700" />
              <Text style={styles.sectionTitle}>Just For You!</Text>
            </View>
            <TouchableOpacity style={styles.viewAllContainer}>
              <Text style={styles.viewAll}>View all</Text>
              <Ionicons name="chevron-forward" size={wp(4)} color="#E31E24" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
            {hotDeals.map((item, index) => (
              <TouchableOpacity key={index} style={styles.productCard}>
                <View style={styles.hotBadge}>
                  <Ionicons name="flame" size={wp(3.5)} color="#fff" />
                  <Text style={styles.hotBadgeText}>Hot</Text>
                </View>
                <View style={styles.productImage}>
                  <FontAwesome5 name={item.icon} size={wp(16)} color="#333" />
                </View>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>as low as</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.productPriceAmount}>{item.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Now Available */}
        <View style={styles.promoSection}>
          <View style={styles.promoHeaderContainer}>
            <MaterialCommunityIcons name="new-box" size={wp(6)} color="#E31E24" />
            <Text style={styles.promoTitle}>Now Available</Text>
          </View>
          <View style={styles.promoBanner}>
            <View style={styles.promoContent}>
              <View style={styles.promoIconContainer}>
                <Ionicons name="tablet-landscape" size={wp(10)} color="#fff" />
              </View>
              <Text style={styles.promoText}>Get yours for as low as ₱87/day</Text>
              <Text style={styles.promoSubtext}>iPad Pro</Text>
              <Text style={styles.promoDesc}>Touch, draw, and type on one magical device.</Text>
              <TouchableOpacity style={styles.shopNowBtn}>
                <Text style={styles.shopNowText}>SHOP NOW</Text>
                <Ionicons name="cart" size={wp(4)} color="#E31E24" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Trending Now */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="trending-up" size={wp(6)} color="#E31E24" />
              <Text style={styles.sectionTitle}>Trending Now!</Text>
            </View>
            <TouchableOpacity style={styles.viewAllContainer}>
              <Text style={styles.viewAll}>View all</Text>
              <Ionicons name="chevron-forward" size={wp(4)} color="#E31E24" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
            {trending.map((item, index) => (
              <TouchableOpacity key={index} style={styles.productCard}>
                <View style={styles.lowestBadge}>
                  <Ionicons name="star" size={wp(3.5)} color="#333" />
                  <Text style={styles.lowestBadgeText}>Lowest</Text>
                </View>
                <View style={styles.productImage}>
                  <FontAwesome5 name={item.icon} size={wp(16)} color="#333" />
                </View>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>as low as</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.productPriceAmount}>{item.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bottom Banner */}
        <View style={styles.bottomBanner}>
          <MaterialCommunityIcons name="credit-card-multiple" size={wp(12)} color="#E31E24" />
          <Text style={styles.bottomBannerText}>Buy in installments with up to</Text>
          <Text style={styles.bottomBannerAmount}>₱80,000</Text>
          <Text style={styles.bottomBannerSubtext}>Payment term up to 24 months</Text>
          <TouchableOpacity style={styles.bottomApplyBtn}>
            <Text style={styles.bottomApplyText}>APPLY NOW</Text>
            <Ionicons name="checkmark-circle" size={wp(5)} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('hvcam')} 
      >
        <Ionicons name="sparkles" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E31E24',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2.5),
    paddingTop: hp(5),
  },
  logo: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: 'bold',
    lineHeight: wp(4.5),
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  loginBtn: {
    color: '#fff',
    fontSize: wp(3.5),
  },
  heroBanner: {
    backgroundColor: '#E31E24',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    position: 'relative',
  },
  limitedOffer: {
    position: 'absolute',
    top: hp(2.5),
    right: wp(5),
    backgroundColor: '#fff',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: wp(5),
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  limitedOfferText: {
    color: '#E31E24',
    fontSize: wp(2.5),
    fontWeight: 'bold',
  },
  heroContent: { color: '#fff' },
  heroText: { color: '#fff', fontSize: wp(4), marginBottom: hp(1) },
  heroAmount: { color: '#fff', fontSize: wp(12), fontWeight: 'bold', lineHeight: wp(12) },
  heroSubtext: { color: '#4A90E2', fontSize: wp(3.5), marginBottom: hp(2.5) },
  features: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: hp(3) },
  feature: { flex: 1, alignItems: 'center' },
  featureLabel: { color: '#FFB3B5', fontSize: wp(2.8), marginBottom: hp(0.5) },
  featureValueContainer: { flexDirection: 'row', alignItems: 'center', gap: wp(1) },
  featureValue: { color: '#fff', fontSize: wp(4.5), fontWeight: 'bold' },
  featureDesc: { color: '#FFB3B5', fontSize: wp(2.8) },
  ctaButtons: { flexDirection: 'row', gap: wp(3) },
  learnMoreBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: wp(6.5),
    paddingVertical: hp(1.8),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wp(2),
  },
  learnMoreText: { color: '#E31E24', fontWeight: 'bold', fontSize: wp(4) },
  applyNowBtn: {
    flex: 1,
    backgroundColor: '#C00',
    borderRadius: wp(6.5),
    paddingVertical: hp(1.8),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wp(2),
  },
  applyNowText: { color: '#fff', fontWeight: 'bold', fontSize: wp(4) },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: wp(4),
    paddingVertical: hp(3),
    backgroundColor: '#fff',
  },
  categoryItem: { alignItems: 'center' },
  categoryIcon: {
    width: wp(16),
    height: wp(16),
    backgroundColor: '#FFF3E0',
    borderRadius: wp(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1),
    position: 'relative',
  },
  categoryBadge: {
    position: 'absolute',
    top: -hp(0.6),
    right: -wp(1.3),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.4),
    borderRadius: wp(2.5),
    zIndex: 1,
  },
  categoryBadgeText: { color: '#fff', fontSize: wp(2.3), fontWeight: 'bold' },
  categoryName: { fontSize: wp(2.8), color: '#666', textAlign: 'center' },
  section: { paddingHorizontal: wp(5), paddingVertical: hp(2.5) },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(2) },
  sectionTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: wp(2) },
  sectionTitle: { fontSize: wp(5), fontWeight: 'bold', color: '#333' },
  viewAllContainer: { flexDirection: 'row', alignItems: 'center', gap: wp(1) },
  viewAll: { color: '#E31E24', fontSize: wp(3.5), fontWeight: 'bold' },
  productScroll: { flexDirection: 'row' },
  productCard: {
    width: wp(40),
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(3),
    marginRight: wp(3),
    borderWidth: 1,
    borderColor: '#eee',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hotBadge: {
    position: 'absolute',
    top: hp(1),
    left: wp(2),
    backgroundColor: '#E31E24',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: wp(3),
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  hotBadgeText: { color: '#fff', fontSize: wp(2.8), fontWeight: 'bold' },
  lowestBadge: {
    position: 'absolute',
    top: hp(1),
    left: wp(2),
    backgroundColor: '#FFD700',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: wp(3),
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  lowestBadgeText: { color: '#333', fontSize: wp(2.8), fontWeight: 'bold' },
  productImage: {
    width: '100%',
    height: hp(15),
    backgroundColor: '#f5f5f5',
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  productName: { fontSize: wp(3.3), color: '#333', marginBottom: hp(1), fontWeight: '500' },
  productPrice: { fontSize: wp(2.8), color: '#999', marginBottom: hp(0.5) },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  productPriceAmount: { fontSize: wp(3.8), color: '#E31E24', fontWeight: 'bold' },
  promoSection: { paddingHorizontal: wp(5), paddingVertical: hp(2.5), backgroundColor: '#f8f8f8' },
  promoHeaderContainer: { flexDirection: 'row', alignItems: 'center', gap: wp(2), marginBottom: hp(2) },
  promoTitle: { fontSize: wp(5), fontWeight: 'bold', color: '#333' },
  promoBanner: { backgroundColor: '#000', borderRadius: wp(3), padding: wp(6), minHeight: hp(18) },
  promoContent: { flex: 1 },
  promoIconContainer: { marginBottom: hp(1) },
  promoText: { color: '#fff', fontSize: wp(4.5), fontWeight: 'bold', marginBottom: hp(1) },
  promoSubtext: { color: '#fff', fontSize: wp(4), marginBottom: hp(0.5) },
  promoDesc: { color: '#999', fontSize: wp(3), marginBottom: hp(2) },
  shopNowBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.3),
    borderRadius: wp(5),
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  shopNowText: { color: '#E31E24', fontWeight: 'bold', fontSize: wp(3.5) },
  bottomBanner: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: wp(7.5),
    paddingVertical: hp(5),
    alignItems: 'center',
    marginBottom: hp(2.5),
  },
  bottomBannerText: { fontSize: wp(4), color: '#333', marginBottom: hp(1), marginTop: hp(2) },
  bottomBannerAmount: { fontSize: wp(12), fontWeight: 'bold', color: '#E31E24', marginBottom: hp(0.5) },
  bottomBannerSubtext: { fontSize: wp(3.5), color: '#666', marginBottom: hp(2.5) },
  bottomApplyBtn: {
    backgroundColor: '#E31E24',
    paddingHorizontal: wp(12),
    paddingVertical: hp(1.8),
    borderRadius: wp(6.5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  bottomApplyText: { color: '#fff', fontWeight: 'bold', fontSize: wp(4) },

  fab: {
    position: 'absolute',
    right: wp(6),
    bottom: hp(4),
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E31E24',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    zIndex: 1000,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});