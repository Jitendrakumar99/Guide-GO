import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Animated,
  Platform,
  Image,
} from "react-native";
import { Image as ExpoImage } from 'expo-image';
import { Video } from 'expo-av';
import { Asset } from 'expo-asset';
import StatusBar from '../../components/StatusBar';

const { width, height } = Dimensions.get("window");

// Preload assets
const preloadAssets = async () => {
  const assets = [
    Asset.fromModule(require("../../../assets/active-woman-with-luggage-going-on-vacation.gif")),
    Asset.fromModule(require("../../../assets/7000287_Motion Graphics_Animation_1920x1080.mp4")),
    Asset.fromModule(require("../../../assets/marginalia-man-and-woman-in-self-driving-car.gif")),
    Asset.fromModule(require("../../../assets/splash-icon.png")),
  ];
  
  try {
    await Promise.all(assets.map(asset => asset.downloadAsync()));
    console.log('All assets preloaded successfully');
    return assets;
  } catch (error) {
    console.error('Error preloading assets:', error);
    return null;
  }
};

// Define assets
const assets = {
  gif1: require("../../../assets/active-woman-with-luggage-going-on-vacation.gif"),
  video1: require("../../../assets/7000287_Motion Graphics_Animation_1920x1080.mp4"),
  gif2: require("../../../assets/marginalia-man-and-woman-in-self-driving-car.gif"),
  poster: require("../../../assets/splash-icon.png"),
};

const onboardingData = [
  {
    id: "1",
    title: "Hello Travelers",
    subtitle: "Let's take a trip with us",
    type: "gif",
    source: assets.gif1,
    bgColor: "#87CEEB",
  },
  {
    id: "2",
    title: "Plan your trip",
    subtitle: "Choose your favorite destination",
    type: "video",
    source: assets.video1,
    bgColor: "#B19CD9",
  },
  {
    id: "3",
    title: "Location",
    subtitle: "Choose your destination",
    type: "gif",
    source: assets.gif2,
    bgColor: "#FFB6A3",
  },
];

export default function OnboardingScreen({ navigation, route }) {
  const { onComplete } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const slidesRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Load assets when component mounts
  useEffect(() => {
    const loadAssets = async () => {
      try {
        await preloadAssets();
        setAssetsLoaded(true);
      } catch (error) {
        console.error('Failed to load assets:', error);
      }
    };
    loadAssets();
  }, []);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index ?? 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleSkip = () => {
    onComplete();
  };

  const handleCreateAccount = () => {
    onComplete();
  };

  const handleLogin = () => {
    onComplete();
  };

  const handleOnboardingComplete = () => {
    onComplete();
  };

  const renderMedia = (item, index) => {
    if (!assetsLoaded) {
      return (
        <ExpoImage 
          source={assets.poster}
          style={styles.backgroundVideo}
          contentFit="cover"
        />
      );
    }

    if (item.type === "video") {
      return (
        <View style={styles.videoContainer}>
          <Video
            source={item.source}
            style={styles.backgroundVideo}
            resizeMode="cover"
            shouldPlay={index === currentIndex}
            isLooping={true}
            isMuted={true}
            rate={1.0}
            volume={1.0}
            onError={(error) => {
              console.error('Video Error:', error);
            }}
            onLoad={() => {
              console.log('Video loaded successfully');
            }}
            useNativeControls={false}
            posterSource={assets.poster}
            posterStyle={styles.backgroundVideo}
          />
        </View>
      );
    }
    return (
      <ExpoImage 
        source={item.source}
        style={styles.backgroundImage}
        contentFit="cover"
        transition={1000}
        cachePolicy="memory-disk"
        priority="high"
        onError={(error) => {
          console.error('Image Error:', error);
        }}
      />
    );
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={[styles.slideContainer, { backgroundColor: item.bgColor }]}>
        {renderMedia(item, index)}
        <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]} />
        
        {/* Skip button */}
        {index !== onboardingData.length - 1 && (
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}

        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        </View>

        {/* Show buttons only on last slide */}
        {index === onboardingData.length - 1 && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleOnboardingComplete}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleLogin}
            >
              <Text style={styles.secondaryButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Update the useEffect for video handling
  useEffect(() => {
    // Find all video items
    const videoItems = onboardingData.filter(item => item.type === "video");
    
    // Play video if current index is a video slide
    const currentItem = onboardingData[currentIndex];
    if (currentItem?.type === "video") {
      console.log("Attempting to play video at index:", currentIndex, "Source:", currentItem.source);
    }
  }, [currentIndex]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <FlatList
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
        scrollEventThrottle={32}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />

      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  slideContainer: {
    width,
    height: '100%',
    backgroundColor: '#000',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    alignSelf: 'center',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    top: 50,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 2,
    padding: 10,
  },
  skipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'center',
    marginTop:35,

    // paddingHorizontal: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 30,
    paddingTop: 50,
    height: 200,
    width: '100%',
    borderBottomRightRadius: 55,
    borderBottomLeftRadius: 55,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    maxWidth: '90%',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    width: '100%',
    zIndex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
    width: 24,
    height: 8,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

